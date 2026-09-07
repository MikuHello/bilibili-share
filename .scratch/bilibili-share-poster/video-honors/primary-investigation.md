# First-party primary honor rendering investigation

Verified 2026-09-07, Edge existing profile, newly-created isolated research tabs only. Both tabs closed after read-only extraction. No user-owned pages changed. No install/settings changes.

## Visible page evidence

| Page/current canonical identity | Visible primary label | DOM class and href |
|---|---|---|
| https://www.bilibili.com/video/BV1a3th65EQb/ | 第389期每周必看 | a.honor.item.honor-weekly; //www.bilibili.com/v/popular/weekly?num=389 |
| https://www.bilibili.com/video/BV1MN4y177PB/ | 入站必刷98大视频 | a.honor.item.honor-history; //www.bilibili.com/v/popular/history |

DOM seam observed: `.video-info-detail-list a.honor .honor-text` (plain textContent). The first sample title exactly matches supplied screenshot candidate. The second API contains five honors but DOM displays only the precious label. `link[rel=canonical]` matches the current page BVID in both observed pages. This is current observation, not proof canonical/DOM can never become stale during SPA navigation. Existing snapshot identity/route guards are still necessary if DOM is used.

## First-party frontend code

The first live page script list exposed:
https://s1.hdslb.com/bfs/static/jinkela/video/video.06bc79dd557609860617b6c42cb6315613b53921.js

Fetched the observed public asset with `curl -s --compressed "<URL>" -o /tmp/bsp-honor-video.js`. SHA256 ee748f9c66d2d976bf4d31e107447d107e07efb3405e021d077c8c7cd51eda69. No cookies or tokens recorded.

Exact bounded excerpts:

```js
props:{rawHonor:{type:Array,default:function(){return[]}}},computed:{honor:function(){return Array.isArray(this.rawHonor)&&this.rawHonor.length?this.honorMapping(this.rawHonor[0]):null}},methods:{honorMapping:function(t){switch(+t.type){case 1:return{desc:t.desc,url:"//www.bilibili.com/v/popular/history",prefix:"honor-history",icon:"HonorHistoryIcon"};case 2:return{desc:t.desc,url:null!==t.weekly_recommend_num?"//www.bilibili.com/v/popular/weekly?num=".concat(t.weekly_recommend_num):"//www.bilibili.com/v/popular/weekly",prefix:"honor-weekly",icon:"HonorWeeklyIcon"};case 3:return{desc:t.desc,url:"//www.bilibili.com/v/popular/rank/all",prefix:"honor-rank",icon:"HonorRankIcon"};default:return null}}}},
```

```js
honor:function(){var t;return null===(t=this.videoData)||void 0===t||null===(t=t.honor_reply)||void 0===t?void 0:t.honor},
```

```js
isNegativeMark:function(){var t;return[ea.GENERAL_NEGATIVE,ea.STRONG_NEGATIVE].includes(+(null===(t=this.argueInfo)||void 0===t?void 0:t.argue_type))},
```

```js
t.isNegativeMark?t._e():n("VideoHonor",{staticClass:"item",attrs:{rawHonor:t.honor}}),t._v(" "),t.isNegativeMark?n("VideoArgue",{staticClass:"item",attrs:{argueInfo:t.argueInfo}}):t._e(),t._v(" "),t.isOgv?t._e():[t.enableVt?n("div",{staticC
```

## Verified rule and caveats

1. Parent passes `videoData.honor_reply.honor` unchanged to VideoHonor.rawHonor.
2. VideoHonor checks array/nonempty and maps only rawHonor[0]. It does NOT scan for the first recognized type or choose minimum numeric type itself.
3. Mapping supports +type 1 (history),2 (weekly),3 (rank); desc copied verbatim. Unknown first type -> null, even if later entries are recognized.
4. Parent suppresses honor when isNegativeMark; current enums GENERAL_NEGATIVE=1 / STRONG_NEGATIVE=2; isNegativeMark checks numeric argue_info.argue_type. This source-derived edge case was not observed on a live negative-mark video.
5. Normal text is rendered through textContent rather than injecting HTML.
6. Another legacy section in the same bundle also maps honor array first element; current component is tied to live observed data-v-b37c19ce.

Thus reproducing the observed current frontend rule from the same already-requested metadata is evidence-backed now; earlier API-order-only uncertainty has been resolved for this bundle. It is NOT a permanent official contract: frontend versions/experiments could change. A direct visible DOM source is the strongest literal page-match source, while API rule reuse avoids extra network work and requires no additional permissions. Missing/unsupported/malformed/negative-mark data should yield no honor under the user-approved omission behavior. Source of original descriptions and multi-honor API records: /tmp/bsp-honor-api-investigation.md.
