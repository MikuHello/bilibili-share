// THROWAWAY: three honor placements in the current production panel; no production edits.
import {readFile,writeFile} from 'node:fs/promises';
import {browserRuntime,productionBundle,openFixture} from '../../../../scripts/browser-test-support.mjs';
const root='.scratch/bilibili-share-poster/video-honors/prototype';
const {chromium}=await browserRuntime();const browser=await chromium.launch({headless:true});
const {page,context}=await openFixture(browser,await productionBundle(),{title:'deepseek harness插件：dsh-smooth-stream无级丝滑流式渲染',uploader:'嗑唠的香农',stats:{view:7971,like:170,coin:34,favorite:313},part:1,time:0,coverBase64:(await readFile('.scratch/bilibili-share-poster/usage-refinement/polish/covers/BV1QGbD6MEDg.jpg')).toString('base64')});
await page.getByRole('button',{name:'分享海报',exact:true}).click();await page.getByRole('article').waitFor();
const panel=await page.getByRole('dialog').evaluate(n=>n.outerHTML);
const css=await page.locator('#bsp-styles').textContent();
await writeFile(`${root}/index.html`,`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>荣誉标签 · 位置原型</title><style>${css}</style><link rel="stylesheet" href="./prototype.css"><header class="prototype-intro"><h1>荣誉标签 · 位置原型</h1><p id="description"></p><div class="prototype-tools"><label>示例标签 <select id="honor"><option>第389期每周必看</option><option>入站必刷98大视频</option><option>全站排行榜最高第4名</option><option value="">无标签</option></select></label><label><input id="long" type="checkbox">长标题</label><label><input id="dark" type="checkbox">深色面板</label><button id="success">演示成功提示</button><button id="failure">演示失败提示</button></div><small>仅作位置比较：沿用现有示例视频，荣誉为可切换演示数据，不代表该视频真实荣誉。</small></header><main class="bsp-backdrop">${panel}</main><nav class="prototype-switch"><button id="previous" aria-label="上个方案">←</button><span id="variant"></span><button id="next" aria-label="下个方案">→</button></nav><script type="module" src="./prototype.js"></script></html>`);
await context.close();await browser.close();
