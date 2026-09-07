# 0.3.3 统一验收

构建提交：a6217c4；实现 c786835（剪贴板）、9d6258f（入口B）。2026-09-07。

交付文件：dist/bilibili-share-poster.user.js；版本0.3.3；SHA256 `190e272a367214c96cbe0261a848892113369f87b1be5b23b3ff4876d190e0c1`，校验通过。

## 修改及证据

- 已确认B实心竖版入口，准确复用批准路径，保持28px、原生工具栏位置、颜色与名称。浅深截图已人工查看，轮廓、镂空、文字和尺寸符合原型。面板描边图标保持原行为。
- 主人真实Edge的0.3.2被页面扩展覆盖writeText并净化成链接；传入值完整，临时替换原生writeText后系统剪贴板完整。临时探针/函数已恢复，未改扩展设置。详情见clipboard-isolation/idea.md。
- 文案优先GM_setClipboard(text,'text',callback)，只在完成回调后提示成功，异常/5秒超时保留手动复制。无GM沿用浏览器路径。[Tampermonkey回调文档](https://www.tampermonkey.net/documentation.php?q=GM_setClipboard)。

## 验证

- 类型检查通过；7个单元测试文件共68项通过。
- 最终dist在10个浏览器套件全部通过：b3-poster、text-recovery、text-isolation、share-targets、update-races、independent-exports、final-panel、appearance、lifecycle、update-performance。
- text-isolation使用真实Chromium剪贴板与受控扩展/GM外部边界，12次普通/Markdown复制覆盖详细信息开关、标记开关，逐字保留完整正文；旧实现先失败为仅链接，修复后通过。受控GM不是实际Tampermonkey安装证据。
- 36张导出PNG均识别一个二维码，结果见qr-decoded.jsonl；各套件包含目标/布局/生命周期结果。
- 整体回归首次在long text高度断言发现309.999969px与310px浮点差异，将测试容差改为0.1px，未改生产样式。此前已通过的前6套件不重跑，后4套件继续全部通过；appearance补深色背景截图后独立复跑通过。
- 首次命令缺少外部Playwright路径，配置BSP_PLAYWRIGHT_MODULE后正常运行。所有最终套件使用BSP_TEST_BUNDLE=dist/bilibili-share-poster.user.js。

## Standards

de946ba...9d6258f独立审阅：硬性规范违规0，可操作异味0。图标B有批准及规格；GM等待回调并清理计时器；独立入口SVG避免扩大描边图标接口。

## Spec

同范围独立审阅：缺失0，范围扩张0，错误实现0。28×28实心B、currentColor、名称/位置/交互符合批准，GM完整写入与恢复路径符合修复范围。

Standards 0项；Spec 0项。随后发布提交只增加版本/构建及测试容差、截图背景调整。

## 实际安装边界

当前真实浏览器已观察安装版为0.3.2。0.3.3未自动安装，主人需在原脚本中更新并刷新视频页，再实际粘贴普通/Markdown确认专用通道。真实原生writeText对照证明故障原因；本报告不将对照或受控GM测试冒充安装后成功。
