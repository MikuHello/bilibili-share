# 01 — Greasy Fork 发行与源码 Release

Status: in-progress
Blocked by: None

主人明确确认 Greasy Fork 为唯一脚本安装发行入口；要求 GitHub Actions 可构建下载产物，GitHub Release 只发布源码、不构建安装包。

本轮按明确维护任务 implement 路径，增加只读候选构建 workflow、源码归档排除 dist、统一发行说明和文档入口。研究官方同步方案，但没有目标仓库/账户/脚本页面，暂不创建远端资源或发布。审查基准7fb4c75。

验收：Actions触发与权限符合候选构建用途，无release/tag自动构建，无脚本Release附件；源码归档排除dist但保持源码可构建；文档明确平台角色与尚缺的线上配置。
