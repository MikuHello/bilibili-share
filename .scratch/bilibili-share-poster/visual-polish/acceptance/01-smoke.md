# 入口与面板真实页面验收

使用构建后的 `dist/bilibili-share-poster.user.js`，在 Chrome/Edge 的 Tampermonkey 中更新脚本后打开标准 BV 视频页。

1. 确认「生成海报」在官方分享按钮右侧，而非点赞旁或分享图标下方。页面有多个 `.toolbar-left-item-wrap`，必须定位包含 `.video-share-wrap` 的那个。
2. 打开面板，确认眉题为 `BILIBILI SHARE`，A/B 分段控件、海报舞台与控制栏可见。
3. ≥880px 为 54%/46% 两栏；<880px 为单栏。390px 和 320px 下海报完整，面板可滚动到底部动作。
4. 切换 A/B，确认主题同步入口、不重新抓取视频信息；关闭后按原播放状态恢复。
5. 复制海报、下载、海报+文案与文案卡右上角复制分别验证。组合复制只承诺兼容格式，不承诺接收方一定粘贴图文。

可在 DevTools Console 运行以下只读检查；分别在宽、窄视口打开面板后运行：

```js
(() => {
  const entry = document.getElementById('bsp-entry');
  const panel = document.querySelector('.bsp-panel');
  const workspace = document.querySelector('.bsp-workspace');
  const columns = workspace ? getComputedStyle(workspace).gridTemplateColumns.split(' ').map(parseFloat) : [];
  const wide = innerWidth >= 880;
  console.table({
    '入口紧邻官方分享': !!entry?.previousElementSibling?.querySelector('.video-share-wrap'),
    '入口不在分享内部': !!entry && !entry.closest('.video-share-wrap'),
    '面板存在': !!panel,
    '宽窄布局正确': wide ? columns.length === 2 && Math.abs(columns[0] / (columns[0] + columns[1]) - .54) < .01 : columns.length === 1,
    '无横向溢出': !!panel && panel.scrollWidth <= panel.clientWidth + 1,
    '主区三个动作': document.querySelectorAll('.bsp-actions > button').length === 3,
    '文案卡复制': !!document.querySelector('.bsp-text-card .bsp-text-copy'),
  });
})();
```

`getComputedStyle` 返回网格计算后的像素值，因此不能直接与字符串 `54% 46%` 或 `1fr` 比较。

本轮自动化、真实页面适配方式和支持边界见 [2026-09-05-validation.md](2026-09-05-validation.md)。Safari/Userscripts 不在已批准支持矩阵内。
