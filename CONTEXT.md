# Bilibili Share

This context names the user-visible concepts of producing and exporting a shareable image from a Bilibili video page.

## Language

**Share poster**:
A static image representing one Bilibili video, including its identity, scan destination, and a snapshot of selected public information.
_Avoid as an object name_: Share card, screenshot

**Poster preview**:
The on-page view of the exact share poster that will be copied or downloaded.
_Avoid_: Official share modal, generated page

**Share panel**:
The on-page workspace containing the poster preview, share text, share-target options, and export actions.
_Avoid_: Poster preview, official share modal

**Share text**:
A formatted text representation of the same video and share target as the share poster, intended for clipboard export.
_Avoid_: Poster caption, raw metadata

**Detailed share text**:
An optional expanded share-text form containing the uploader, title, and generation-snapshot statistics. The share panel calls this detail level “详细信息”; it is off by default.
_Avoid_: Poster text, debug data

**Markdown share text**:
An alternative share-text representation containing Markdown syntax for Markdown-aware destinations, selected through a dedicated copy action. Its format is independent from the selected detail level.
_Avoid_: Rich-text clipboard, styled poster

**Share-text template**:
A reusable definition of share-text wording containing placeholders for video information and the share target. Built-in templates provide the default wording; custom templates provide alternative wording.
_Avoid_: Poster layout, share text itself

**Share target**:
The single video destination represented by both the poster's QR code and its visible link, optionally including a playback position.
_Avoid_: QR target, link target

**Timestamp share**:
An optional share target that starts at the video's current playback position. It is off by default.
_Avoid_: Clip, video segment

**Part share**:
An optional share target for the currently viewed part of a multi-part video. It is off by default; on P2 or later, timestamp sharing requires it.
_Avoid_: Episode share, timestamp share

**Default share**:
A share target with neither a selected part nor a playback position, resolving to the video's default beginning.
_Avoid_: Current-context share

**Generation snapshot**:
The video identity, information, current part, playback position, and prior playback state captured when the user opens the share panel.
_Avoid_: Live statistics, page-load data

**Standard video page**:
A Bilibili Web `/video/BV...` page for an ordinary uploaded video. It excludes bangumi, film, live, and other content-specific page types.
_Avoid_: Every Bilibili content page

**Video honor (视频荣誉)**:
A Bilibili-provided distinction attached to a video, such as 每周必看、入站必刷 or a ranking achievement, retaining its original label including issue or rank.
_Avoid_: User-created slogan, ordinary video tag
