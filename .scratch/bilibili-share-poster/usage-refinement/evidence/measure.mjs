import {build} from '/Users/mikuhello/project/dev/bilibili-share/node_modules/esbuild/lib/main.js';
import {chromium} from '/Users/mikuhello/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {readFile,writeFile} from 'node:fs/promises';
const out=new URL('.',import.meta.url);
const bundle=await build({stdin:{contents:'export {createPoster,exportPosterPng} from "/Users/mikuhello/project/dev/bilibili-share-delivery/src/ui/posters.ts"',resolveDir:'/Users/mikuhello/project/dev/bilibili-share-delivery'},bundle:true,write:false,format:'iife',globalName:'probe'});
const cover='data:image/jpeg;base64,'+(await readFile(new URL('../../redesign/validation-prototype/assets/cover.jpg',out))).toString('base64');
const browser=await chromium.launch({headless:true});
try {
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.setContent('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><body></body></html>');
await page.addScriptTag({content:bundle.outputFiles[0].text});
const rows=await page.evaluate(async cover=>{
 const result=[];
 for(let i=0;i<6;i++){
 const model={dimensions:{width:1080,height:1440},coverDataUrl:cover,coverUnavailable:false,title:'评论区！桌搭锐评13｜误闯天家！桌？房！',uploader:'ACG外观研究社',identity:'BV16E8q6SE4Z av117132717197475',bvid:'BV16E8q6SE4Z',aid:117132717197475,shareTarget:'https://www.bilibili.com/video/BV16E8q6SE4Z/'+(i?'?p=2&t='+i:''),stats:[{label:'播放',value:'69.1万'},{label:'点赞',value:'4.3万'},{label:'投币',value:'5322'},{label:'收藏',value:'8860'}]};
 const start=performance.now(); const poster=await probe.createPoster(model);const created=performance.now(); document.body.append(poster);const png=await probe.exportPosterPng(poster);const exported=performance.now();poster.remove();result.push({iteration:i,createMs:created-start,exportMs:exported-created,pngCharacters:png.length});
 }return result;
},cover);
await writeFile(new URL('render-baseline.json',out),JSON.stringify({browser:browser.version(),source:'delivery fb79f0c',scope:'isolated headless browser, local cover, no network/player/manager/clipboard; first iteration cold, next five warm; not user-visible latency',rows},null,2));console.log(JSON.stringify(rows));
}finally{await browser.close();}
