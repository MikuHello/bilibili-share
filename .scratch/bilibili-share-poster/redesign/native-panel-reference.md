# 原生分享浮层与投币弹窗现场参考

Date: 2026-09-05
Scope: 真实 Edge 标准视频页 BV1TXoWBsEGc；当前环境有 BewlyCat；只记录当前浅色现场，不宣称无扩展基线。

## 原生分享浮层

从实际 `#share-btn-outer` 打开 `.video-share-popover`。末次通过 CDP mouseMoved 悬停重开，无需点击复制按钮。它是锚定工具栏的 `role=tooltip` 浮层，**没有独立面板标题，没有关闭图标，也没有模态遮罩**。DOM 检查 heading/close 节点数量都是 0。视频标题是封面上的内容文字，不是弹窗标题。

| 项目 | 实际计算值 |
|---|---|
| 外框尺寸 | 516×329 px |
| 背景 | #FFFFFF |
| 外框 | 1px solid #F1F2F3 |
| 阴影 | rgba(0,0,0,.06) 0px 2px 6px 0px |
| 圆角 | 8px |
| 上部 padding | 30px 30px 12px |
| 底部渠道区 | #F6F7F8，padding 20px 18px |
| 左右内容分隔 | 右区 box-shadow #F1F2F3 -0.5px 0 0 0 |
| 封面内视频标题 | 13px，白色，左右 padding 8px |
| 二维码提示 | 15px，#18191C |

截图：`/Users/mikuhello/project/dev/bilibili-share/.scratch/bilibili-share-poster/redesign/native-share-reference.png`

## 原生投币对话框（仅打开，未提交）

通过实际 `[title="投币（W）"]` 打开 `.coin-operated-m-exp`，只观察并点右上关闭，没有点“确定”、硬币选择或点赞勾选。

| 项目 | 实际计算值 |
|---|---|
| 对话框 | 430×476 px |
| 背景 | #FFFFFF |
| 边框/阴影 | none / none |
| 圆角 | 4px |
| 标题 | 16px，line-height 24px，居中，#18191C |
| 标题区域 | 宽430、高45px；区域距弹窗顶部20px |
| 关闭图标点击元素 | 20×20px；top/right 各16px |
| 关闭图标背景 | 背景色透明，无边框、阴影或圆形底；13×13 PNG 叉图通过 background-image 呈现 |
| 关闭图标圆角 | 0 |
| 底部区域 | 透明背景，padding 25px 0，居中，无分隔边框 |

截图可见灰色页面遮罩，但本次没有读取其确切 opacity，不猜数值。对话框本身无横向标题分隔线；标题与内容通过空白间距区分。

截图：`/Users/mikuhello/project/dev/bilibili-share/.scratch/bilibili-share-poster/redesign/native-coin-reference.png`

## 操作记录与限制

首次按调查要求点击原生分享入口，随后该入口可见文字为“点击复制”；没有点击浮层的“获取视频分享链接”或任何渠道按钮。没有读取剪贴板，因而不声明原生入口点击是否有隐式复制副作用。末次截图通过悬停取得。投币弹窗已关闭并验证节点数为0，代理调查页随后关闭。没有发送、收藏、投币、安装脚本或改变设置。

这些是两种不同的官方交互容器：分享浮层没有标题/关闭，模态投币对话框有居中标题/透明叉。只能作为具体参考，不据此声称 B站所有弹窗均采用同一尺寸或样式。


## 截图范围补充

主代理目视读取 native-coin-reference.png 后发现它仅截到页面局部与弹窗顶边，不能作为完整官方弹窗外观图。上面的标题/关闭/边框参数来自现场DOM计算样式，不能声称已在该截图中完整目视核对。此截图保留为有限现场证据，不作为用户评议用的完整参考图。
