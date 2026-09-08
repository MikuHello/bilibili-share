# 2026-09-05 视觉打磨实施与验证

> 归档说明：本报告对应历史版本。原始截图、日志和中间报告见 [清理前快照](https://github.com/MikuHello/bilibili-share/tree/f0a534c81de44edccd741ecd116a6d07dfa5cf83/.scratch/bilibili-share-poster/visual-polish/acceptance)；当前测试使用 tests/fixtures/，输出写入 artifacts/。

## 实施范围

- 01：定位包含官方分享控件的工具项，避免误插在点赞之后；维持幂等挂载。沿用已批准的海报舞台/控制栏骨架。
- 02：完善 pill、消息文案卡及 A/B 状态；保留文案的每个换行，四种文本模式与实际复制逐字符一致。键盘触发选项后恢复对应控件焦点。
- 03：主区三个动作，下载仅图标，文案卡右上角复制；失败提示持续显示，成功 3 秒淡出；tooltip 不撑破控制栏。
- 04：共享 motion tokens；双层 crossfade；重建遮罩淡入淡出；减少动效时同步取消 JS 等待；320px 海报比例缩放，PNG 导出解除预览 transform，仍为 1080×1440。
- 05：保留既有封面尺寸/解码降级，补缺失封面 URL 的非致命路径；调整占位标记避免被 B 内容覆盖；修正 B 遮罩层级及 A 底部二维码裁切。海报内容、主题构图未重做。
- 06：独立开发构建入口 `src/dev/index.ts`，默认收起的 DEBUG 抽屉，包含长短链、长标题、缺失统计、P2、封面缺失、窄面板、减少动效和 B 最大化。生产入口不引用开发模块。

## 自动化

- `npm test -- --reporter=dot`：8 个测试文件，77/77 通过。
- `npm run check`、`npm run build`、`npm run build:dev`、`git diff --check` 通过。
- 新增失败提示生命周期和缺失封面元数据测试均先观察 red 再实现 green。
- `scripts/visual-smoke.py` 使用真实 Chromium 渲染器、开发构建及合成 API/剪贴板边界。验证四种文案、三个动作、P2 时间戳联动与短链成功、主题切换、880/879/390/320px 无横向溢出、窄屏 PNG 1080×1440、失败提示保留、成功消失、reduced-motion、长链与缺封面；浏览器 pageerror 为 0。
- 生产产物检查：`bsp-debug-drawer`、`src/dev/`、`bsp-debug-fixture.png` 均不存在；开发产物均存在。
- 样例不代表外部 API 可用性。PNG 和截图在 `artifacts/`，其中标题、封面与统计明确为开发样例。

重跑：安装 Python Playwright 及 Chromium 后运行：

```sh
npm run build:dev
python scripts/visual-smoke.py
```

已安装其它兼容 Chromium 时，可用 `BSP_CHROMIUM_EXECUTABLE=/absolute/path/to/chromium` 指定；脚本不会安装浏览器或修改用户浏览器配置。

## 真实页面

- Headless Chromium 访问 `BV1xx411c7mD` 返回 HTTP 412，因此该通道未完成真实页面测试。
- 改用 Codex 内置浏览器访问同一真实 Bilibili 页面，临时加载生产构建，以匿名 fetch 适配 GM 请求，不持久安装脚本。
- 使用真实标题「字幕君交流场所」、UP 主、BV/AV、统计和透明封面，成功生成 A/B 海报及安静占位。短链解析受该适配限制走 canonical fallback，面板明确显示原因。
- 文案复制、海报复制、组合复制分别返回「文案已复制」「海报已复制到剪贴板」「已写入兼容格式」；下载返回「PNG 已下载」。未测试粘贴到第三方应用。
- 390px 真实页面 panel/controls/workspace/preview-pane 均为 clientWidth=scrollWidth=372；主区动作可滚动到达。
- 最终构建重新载入真实页面：入口数量为 1，前一个兄弟节点包含官方 `.video-share-wrap`，生产页面没有调试抽屉；验证结束已关闭临时页面和本地服务器。
- 此验证不等于 Tampermonkey 的 GM 跨域链路或 Chrome/Edge 全版本支持矩阵。基础 Ticket 08 保持原待验收状态；最终视觉接受仍由项目所有者确认。

## Review

- 基点 `42c42fe`；两条独立子代理分别执行 Standards / Spec 评审。
- Standards：0 个硬违规；重复状态清理的维护建议已通过 `clearStatus` 处理。
- Spec：开发 P2/短链样例及 P1 取消分P后的时间戳模拟偏差已修正；复查未发现生产代码新增阻断问题。
- 真实页面补充发现「多个工具项取首项」问题，已定位分享项并在浏览器样例中增加点赞项回归。

## 后续用户验收反馈（2026-09-05）

主人明确否定当前视觉结果，并报告真实视频封面仍无法正常获取。以上技术验证不代表产品接受；本轮占位路径验证没有证明主人所用视频的封面链路正确。入口位置获认可，其外观、面板主题模型、降级提示与海报布局需重设计。新一轮需求与开放决策见 `../../redesign/idea.md`；旧工单 complete 仅保留实施历史，不应作为本轮视觉已获批准的依据。
