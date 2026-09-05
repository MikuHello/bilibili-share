# 默认主题 discovery：真实运行时事实续查

Date: 2026-09-05
Scope: 只读调查现有安装脚本；不修复、不安装、不变更主题或持久设置。

## 已锁定

- Edge 当前没有原故障视频标签；调查新开 `https://www.bilibili.com/video/BV1TXoWBsEGc/`。现有脚本入口实际存在。
- 默认选项生成连续复现 `COVER UNAVAILABLE`。前三次短链依次为 `https://b23.tv/V20o3cc`、`https://b23.tv/6uTHh4c`、`https://b23.tv/M90z2Gt`。标题、UP、BVID/AV 与此前调查一致，未出现 mismatch 文案。
- CDP `Debugger.scriptParsed` 找到实际安装的 Bilibili 分享海报脚本；`Debugger.getScriptSource` 实读 metadata `@version 0.1.0`。脚本长度 183093 字符，CDP hash `29f0611c4828bf66179209c105367cb3803684ed175928c6a08d0a3759bda4c4`。没有比对到 Git 提交，不能等同本地当前代码。
- 实际脚本的 `loadCover` 入口和最终 catch 均被临时断点命中；在 catch frame 中只读取得 `coverUrl = http://i1.hdslb.com/bfs/archive/a48a609105359d30b0f7c53e12c6fee560f81507.jpg`。实际流程进入 catch，随后以 unavailable 降级。
- 当前页面 html class 为 `bewly-design videoPage block-useless-contents remove-top-bar remove-custom-navbar`，body class `mac`，body 底色 `rgb(241, 242, 243)`。没有操作主题 UI。

## 已运行的红反馈

CUA Edge tab 初始化后，以下过程可由代理运行；每次先关闭上一次面板，再生成。首次生成省略关闭步骤。

```js
await bt.playwright.getByRole('button', {name:'关闭分享面板', exact:true}).click();
await bt.playwright.getByRole('button', {name:'生成海报', exact:true}).click();
await bt.playwright.getByText('COVER UNAVAILABLE', {exact:true})
  .waitFor({state:'visible', timeoutMs:20000});
const actual = await bt.playwright.getByRole('dialog').textContent();
({verdict: actual.includes('COVER UNAVAILABLE') ? 'RED' : 'GREEN'});
```

本轮第二次实际输出：`{ verdict: 'RED' }`。该版本是缺封面复现断言；若修复后封面出现，等待占位文案将超时，正式回归必须改为等待生成完成后断言封面是否可用。本轮没有把它伪称完整独立 CLI 测试。

## GM → FileReader → decode 的精确缺口

实装源码（行号为 getScriptSource 文本的一基行号）：

- 2259–2278：`gmBlobRequest`，GET、`responseType: blob`、15 秒超时、anonymous、Bilibili Referer；onload 检查 HTTP 状态后 resolve response。
- 2356–2374：Blob 类型/大小检查 → FileReader → Image.decode → 至少 160×90。
- 2376–2383：`loadCover` 把 http 转 https；统一 catch 返回 unavailable。

在 2269 行 onload 状态判断设置断点后，下一次生成没有收到该断点暂停事件；随后入口 2379 和 catch 2382 可实际命中。**这不足以锁定网络层根因**：未获得 onerror/ontimeout/同步抛错的直接证据，不能推导 HTTP、MIME、Blob 大小或 decode 错误。

只读求值 `GM_info` 抛出 ReferenceError，因而没有获得管理器精确版本。该异常属于诊断求值，不是产品异常。为捕获原始异常启用 pause-on-exceptions 后，浏览器控制 Runtime.evaluate 超时、CDP debugger 会话被重置，未拿到目标异常事件。后续已执行 `Debugger.enable` → `Debugger.setPauseOnExceptions({state:'none'})` → `Debugger.disable`；最终关闭代理新建的调查页，清除临时断点与中间状态。未修改生产源码或安装脚本。

当前应停在边界事实，不列猜测根因。未来修复调查需要获得真实 GM 调用的成功/失败回调或同步异常，以及必要时 FileReader/decode 边界；无需让用户猜这些事实。

## 短链另案

针对本轮首次产物运行：

```sh
curl -sS -I -L --max-time 15 -o /dev/null \
  -w 'http=%{http_code} final=%{url_effective}\n' 'https://b23.tv/V20o3cc'
```

实际 `http=200`，finalUrl 路径为 `https://www.bilibili.com/video/BV1TXoWBsEGc`；分享追踪 query 不作为身份依据，也不在此复制。该次默认分享匹配目标视频。未覆盖分P/时间戳组合，也没有原 mismatch 的短链与快照，因此原 mismatch 仍未复现，不能声明已解决或与封面同因。

## discovery 输入

可靠封面是当前真实问题；新 spec 可以定义成功、可恢复失败与验证边界，不能把未知根因写成指定修复方案。正式实现前仍需要实装版本关联和真实 GM 链路证据。此次调查不授权旧工单继续，不改变已批准 v5 默认海报视觉。
