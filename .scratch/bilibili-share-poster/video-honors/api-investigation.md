# Bilibili honor API read-only investigation

Verified: 2026-09-07, Asia/Shanghai. Anonymous curl; no credentials sent or recorded.

## First-party response evidence

Command per URL: `curl -s "<url>"`; retained only code/title/honor_reply below.

```json
[
  {
    "url": "https://api.bilibili.com/x/web-interface/view?bvid=BV1a3th65EQb",
    "code": 0,
    "title": "西西弗斯推的石头，居然是孙悟空......【AI全民制作人】#SpecialForAAIFF",
    "honor_reply": {
      "honor": [
        {
          "aid": 117189457875319,
          "type": 2,
          "desc": "第389期每周必看",
          "weekly_recommend_num": 389
        },
        {
          "aid": 117189457875319,
          "type": 3,
          "desc": "全站排行榜最高第1名",
          "weekly_recommend_num": 0
        },
        {
          "aid": 117189457875319,
          "type": 7,
          "desc": "热门收录",
          "weekly_recommend_num": 0
        }
      ]
    }
  },
  {
    "url": "https://api.bilibili.com/x/web-interface/view?bvid=BV1MN4y177PB",
    "code": 0,
    "title": "回村三天，二舅治好了我的精神内耗",
    "honor_reply": {
      "honor": [
        {
          "aid": 898762590,
          "type": 1,
          "desc": "入站必刷98大视频",
          "weekly_recommend_num": 0
        },
        {
          "aid": 898762590,
          "type": 2,
          "desc": "第175期每周必看",
          "weekly_recommend_num": 175
        },
        {
          "aid": 898762590,
          "type": 3,
          "desc": "全站排行榜最高第1名",
          "weekly_recommend_num": 0
        },
        {
          "aid": 898762590,
          "type": 4,
          "desc": "热门",
          "weekly_recommend_num": 0
        },
        {
          "aid": 898762590,
          "type": 7,
          "desc": "热门收录",
          "weekly_recommend_num": 0
        }
      ]
    }
  },
  {
    "url": "https://api.bilibili.com/x/web-interface/view?bvid=BV14U4y1w7fn",
    "code": 0,
    "title": "这才是文化膨胀！！当岩彩画遇上汉服",
    "honor_reply": {
      "honor": [
        {
          "aid": 676023453,
          "type": 1,
          "desc": "入站必刷98大视频",
          "weekly_recommend_num": 0
        },
        {
          "aid": 676023453,
          "type": 2,
          "desc": "第135期每周必看",
          "weekly_recommend_num": 135
        },
        {
          "aid": 676023453,
          "type": 3,
          "desc": "全站排行榜最高第13名",
          "weekly_recommend_num": 0
        },
        {
          "aid": 676023453,
          "type": 4,
          "desc": "热门",
          "weekly_recommend_num": 0
        },
        {
          "aid": 676023453,
          "type": 7,
          "desc": "热门收录",
          "weekly_recommend_num": 0
        }
      ]
    }
  },
  {
    "url": "https://api.bilibili.com/x/web-interface/view?bvid=BV1GJ411x7h7",
    "code": 0,
    "title": "【官方 MV】Never Gonna Give You Up - Rick Astley",
    "honor_reply": {}
  }
]
```

## Conclusions and limits

- Existing production metadata URL is exactly `https://api.bilibili.com/x/web-interface/view?bvid=...` (src/bilibili.ts:227-228); its GM request already uses anonymous:true. No added endpoint or permission is needed to read the verified field. Current typed parser omits honor_reply.
- Original source text is data.honor_reply.honor[].desc. No need to reconstruct week numbers, current precious-list size, or highest rank; copying desc preserves first-party wording.
- Single videos demonstrably contain multiple honors simultaneously. Observed types:1 precious,2 weekly,3 historical highest rank,4 热门,7 热门收录. This is observed sample mapping, not a documented complete enumeration. type3 ranks differ across samples (1,2,13 observed); exact rank4 example not located in this pass.
- Response order observed:1,2,3,4,7 or2,3,7. It does NOT establish video-page display priority/filtering. Display all vs selected types vs one primary badge remains a product decision pending real-page evidence. Do not silently include 热门/热门收录 merely because API returns them.
- Valid video BV1GJ411x7h7 returns code0 and honor_reply:{}: missing honor array is normal, not an error. Do not invent a badge for absent/malformed fields. Optional parsing should preserve share functionality when honors are missing; existing metadata failures retain current failure handling. This last sentence is an engineering recommendation, not a verified API promise.
- No login required for these successful view requests, but no guarantee for all restricted/private/deleted videos. API can be unavailable or rate/risk controlled.

## Discovery requests / access limits

`curl -s "https://api.bilibili.com/x/web-interface/popular/precious?page_size=3&page=1"` returned code0 and list containing BV1MN4y177PB etc; used only to locate candidate videos.

`curl -s "https://api.bilibili.com/x/web-interface/popular/series/one?number=389"` returned code-352. Python urllib attempts received HTTP412. These are access failures, not evidence the weekly honor is absent.

`curl -L -s "https://www.bilibili.com/video/BV1a3th65EQb/"` returned gzip-compressed HTML risk-captcha shell (1360 decompressed characters), not normal video page. It referenced official risk-captcha scripts, so page display priority was not verified; no challenge bypass attempted.

Candidate BV1a3th65EQb was supplied by parent from a third-party title search and independently confirmed by first-party view title and honor above. No third-party documentation is used as authority. No production files changed.

## Bounded frontend follow-up

A second ordinary first-party page request, `curl -L -s --compressed "https://www.bilibili.com/video/BV1MN4y177PB/"`, returned a 3286-character security/412 page referencing security.bilibili.com/static/js/412.js rather than video-player application bundles. Thus two different real video page URLs did not expose the first-party rendering code; no proven primary-label rule is available from this investigation. API order must not substitute for it. Stop here rather than attempting challenge/captcha bypass.

Parent relayed current user decision: absent/failed honor retrieval should be omitted without blocking sharing. All-honors vs selected three classes vs primary-only remains under discussion. Existing-view reuse directly supports the omission decision without extra network work.
