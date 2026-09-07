// THROWAWAY: derive the current panel from the production UI, then explore only its right-hand layout.
import {readFile,writeFile,copyFile} from 'node:fs/promises';
import {browserRuntime,productionBundle,openFixture} from '../../../../../scripts/browser-test-support.mjs';
const root='.scratch/bilibili-share-poster/usage-refinement/text-panel-polish/prototype';
const {chromium}=await browserRuntime();const browser=await chromium.launch({headless:true});
const {page,context}=await openFixture(browser,await productionBundle(),{title:'deepseek harness插件：dsh-smooth-stream无级丝滑流式渲染',uploader:'嗑唠的香农',stats:{view:7971,like:170,coin:34,favorite:313},part:1,time:0,coverBase64:(await readFile('.scratch/bilibili-share-poster/usage-refinement/polish/covers/BV1QGbD6MEDg.jpg')).toString('base64')});
await page.getByRole('button',{name:'生成海报',exact:true}).click();await page.getByRole('article').waitFor();
const panel=await page.getByRole('dialog').evaluate(n=>{const clone=n.cloneNode(true);clone.querySelector('.bsp-preview-frame').innerHTML='<img class="prototype-poster" src="./poster.png" alt="已确认的海报预览（测试身份）">';return clone.outerHTML});
const css=await page.locator('#bsp-styles').textContent();
await copyFile('.scratch/bilibili-share-poster/usage-refinement/polish/evidence/final/b3-poster/real-user-default.png',`${root}/poster.png`);
await writeFile(`${root}/index.html`,`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>文案区域 · 局部收尾</title><style>${css}</style><link rel="stylesheet" href="./prototype.css"><header class="prototype-intro"><h1>文案区域 · 局部收尾</h1><p id="description"></p><div class="prototype-toggles"><label><input id="theme" type="checkbox">深色模式</label><label><input id="long" type="checkbox">长标题</label></div></header><main class="bsp-backdrop">${panel}</main><nav class="prototype-switch"><button id="previous" aria-label="上个方案">←</button><span id="variant"></span><button id="next" aria-label="下个方案">→</button></nav><script type="module" src="./prototype.js"></script></html>`);
await context.close();await browser.close();
