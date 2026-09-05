# 新一轮设计：封面与站点外观只读调查

Date: 2026-09-05
Status: 真实封面缺失已复现；根因未锁定；不授权修复或设计实现。

## 现场与身份

- 已读取 redesign/idea.md、父 idea/spec、CONTEXT.md 与 diagnosing-bugs skill。
- 原故障页面不在当前 Edge 标签中。本轮从 rejected-panel.png 的公开短链 `https://b23.tv/G2qtExl` 新开调查标签，没有读取浏览历史、Cookie 或凭据。
- 浏览器首次真实落点：`https://www.bilibili.com/video/BV1TXoWBsEGc/?plat_id=116&unique_k=G2qtExl`；页面随后规范化为 `https://www.bilibili.com/video/BV1TXoWBsEGc/`。
- 页面标题：35min 正念冥想｜把身体作为方法｜从内耗到感受｜此时此地此身｜聆听身体｜回归当下。
- 页面/实际海报身份：`BV1TXoWBsEGc`、`AV116448123027614`；UP 主：妮卡的房间NiCalm。
- Edge UA 报告 `Edg/152.0.0.0`（Chrome/152.0.0.0）；页面有已安装的生成海报按钮。CDP 当前页面上下文表显示“篡改猴测试版”。未读取到已安装 userscript 或管理器的精确版本，不能假定与本地 Git 相同。

## 可重复反馈

使用现有页面已安装脚本操作，不注入替代产品实现：

```js
await bt.playwright.getByRole('button', {name:'生成海报', exact:true}).click();
// 等生成结束后，读取实际 dialog：
await bt.playwright.getByRole('dialog').textContent();
```

第一次结果含 `COVER UNAVAILABLE` 与正确标题/BVID；短链为 `https://b23.tv/l2WpIyb`。
关闭分享面板后重新点击生成海报，第二次结果仍含 `COVER UNAVAILABLE`，短链为 `https://b23.tv/5LZL8wW`。
两次均为默认分享，未切换分P/时间戳选项。已运行的反馈可以区分“真实海报仍缺封面”与“封面恢复”，但目前不是一个已保存、独立可执行的自动化测试脚本。

## 封面分层证据

1. 页面 `__INITIAL_STATE__.videoData` 中 BVID 正确；`pic` 为 `http://i1.hdslb.com/bfs/archive/a48a609105359d30b0f7c53e12c6fee560f81507.jpg`。DOM 的 og:image 及官方分享封面使用同一文件主路径（另加尺寸后缀）。
2. 本地代码 `src/bilibili.ts` 的 loadCover 把 http 转为 https，调用 GM Blob 请求，再 FileReader 转 Data URL、Image.decode、检查至少 160×90。任何异常最终被 catch 合并为 unavailable。该读取说明现有诊断边界，不是根因推断，也不证明已安装脚本与本地完全一致。
3. 对该真实视频封面进行独立的本机 HTTP 读取与解码：

```sh
curl -sS -L --max-time 20 -o /tmp/bilibili-redesign-cover.jpg -w 'http=%{http_code} content_type=%{content_type} bytes=%{size_download}\n' 'https://i1.hdslb.com/bfs/archive/a48a609105359d30b0f7c53e12c6fee560f81507.jpg'
sips -g pixelWidth -g pixelHeight /tmp/bilibili-redesign-cover.jpg
```

实际输出：`http=200 content_type=image/jpeg bytes=436950`，`pixelWidth: 2558`，`pixelHeight: 1439`。

**已锁定**：同一真实视频的公开封面源目前存在可解码大图，而现有已安装脚本连续两次产物缺封面。不能用历史其他视频的 1×1 封面解释此故障。

**未锁定**：GM 请求实际状态/MIME/Blob字节数、FileReader结果、Image.decode错误及实际渲染输入。本机 curl/sips 成功不等于 GM/浏览器链路成功；不能据此归因 CORS、扩展冲突、协议或图片尺寸。

## 短链边界

截图的 `G2qtExl` 目前真实落点与视频标题/BVID一致。两次新生成均有 b23 短链，界面未出现“短链落点与本次生成快照不一致”。没有原 mismatch 的短链、finalUrl 与当时选项快照，因此本轮未复现那条故障；不能把截图封面失败与另一条 mismatch 提示合并成一次事件。

## 真实站点外观信号

本轮没有切换用户任何主题或扩展设置，只读取当前浅色状态。

- `html.class`: `bewly-design videoPage block-useless-contents remove-top-bar remove-custom-navbar`
- `html.style`: `--bew-dark-base-color: #2a2d32; --bew-theme-color: #00a1d6;`
- `html[data-immersive-translate-page-theme]`: `light`（来自翻译扩展语境，不能当 B 站原生契约）。
- `body.class`: `mac`；`body.style`: `background-color:var(--bg3)`。
- 页面存在 Bewly UI 的“亮色模式”入口；当前页面上下文中扩展名称为 BewlyCat。
- 本次 DOM 未发现 `[data-theme]`、`[data-dark]` 或 `.dark` 节点；`style.darkreader` 数量为 0。即使有 Dark Reader 上下文，也不能据此声称它正在改写本页外观。

当前 computed styles：

| 对象 | 高度 | 文字 | 底色 | 边框/间距 |
|---|---|---|---|---|
| 原生分享 `#share-btn-outer` | 36px | 14px、rgb(97,102,109) | transparent | 0、padding 0 |
| 点赞/投币 | 36px | 14px、rgb(97,102,109) | transparent | 0、padding 0 |
| 本脚本 `#bsp-entry.bsp-entry-b` | 34px | 14px、白色 | rgb(24,25,28) | 1px 实线、padding 0 14px、gap 7px |

页面变量：`--bg3:#f1f2f3`、`--text2:#61666d`、`--graph_icon:#61666d`。body 实际底色 rgb(241,242,243)。这些变量和最终计算样式是当前环境的真实观测，不是稳定接口承诺。

**限制**：当前环境有 BewlyCat 等扩展介入，不能称这些属性全是 B 站原生主题信号。未观测浅深色切换前后差异，尚不能确定监听哪个属性、暗色值和缺信号时的回退规则；不以 prefers-color-scheme 冒充站点偏好。

## 后续诊断入口

封面后续只需围绕已复现的 BV1TXoWBsEGc，采集已安装脚本版本及实际 GM → FileReader → decode → poster 输入边界。短链 mismatch 需要当时短链/finalUrl/快照另案复现。设计可继续参考选择，不能把未知根因写成新 spec 的既定修复方案。

本轮没有修改生产代码、安装/更新脚本或推进旧工单。
