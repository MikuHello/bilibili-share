// THROWAWAY: one approved direction, exercised with content and panel states.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import QRCode from 'qrcode';
const here = new URL('./', import.meta.url);
const baseline = new URL('../prototype/', here);
await mkdir(new URL('assets/', here), { recursive: true });
for (const name of ['cover.jpg','bilibili-logo.svg','up.svg','like.svg','coin.svg','fav.svg']) {
  await copyFile(new URL(name, baseline), new URL('assets/'+name, here));
}
const baseTitle = '35min 正念冥想｜把身体作为方法｜从内耗到感受｜此时此地此身｜聆听身体｜回归当下';
const canonical = 'https://www.bilibili.com/video/BV1TXoWBsEGc/';
const fixtures = {
  original: { name:'真实长标题', title:baseTitle, uploader:'妮卡的房间NiCalm', cover:'cover.jpg', target:canonical, part:'', time:'', synthetic:false },
  short: { name:'短标题 / 短链接', title:'正念冥想', uploader:'妮卡的房间NiCalm', cover:'cover.jpg', target:'https://b23.tv/G2qtExl', part:'', time:'', synthetic:true },
  long: { name:'超长标题 / 长昵称', title:('正念练习与身体感受：把注意力带回此时此地，听见呼吸，重新建立与日常生活的连接。').repeat(5), uploader:('这里是一位名字非常长的创作者NiCalm').repeat(4), cover:'cover.jpg', target:canonical, part:'', time:'', synthetic:true },
  part: { name:'分P / 时间 / 完整长链', title:baseTitle, uploader:'妮卡的房间NiCalm', cover:'cover.jpg', target:canonical+'?p=12345&t=123456789', part:'P12345 · '+('很长的分P标题与完整编号验证').repeat(5), time:'34293:33:09', synthetic:true },
  partonly: { name:'仅分P', title:baseTitle, uploader:'妮卡的房间NiCalm', cover:'cover.jpg', target:canonical+'?p=2', part:'P2 · 身体扫描练习', time:'', synthetic:true },
  timeonly: { name:'仅时间（P1）', title:baseTitle, uploader:'妮卡的房间NiCalm', cover:'cover.jpg', target:canonical+'?t=83', part:'', time:'01:23', synthetic:true },
  longlink: { name:'两行完整地址（极限输入）', title:baseTitle, uploader:'妮卡的房间NiCalm', cover:'cover.jpg', target:canonical+'?p=9007199254740991&t=9007199254740991', part:'P9007199254740991 · 极限整数参数', time:Math.floor(Number.MAX_SAFE_INTEGER/3600)+':'+String(Math.floor(Number.MAX_SAFE_INTEGER%3600/60)).padStart(2,'0')+':'+String(Number.MAX_SAFE_INTEGER%60).padStart(2,'0'), synthetic:true },
  portrait: { name:'竖封面比例', title:'竖版封面的完整保留与留白验证', uploader:'比例测试', cover:'portrait.svg', target:canonical, part:'', time:'', synthetic:true },
  square: { name:'方形封面比例', title:'方形封面的完整保留与留白验证', uploader:'比例测试', cover:'square.svg', target:canonical, part:'', time:'', synthetic:true },
  unbroken: { name:'连续英文 / emoji', title:('AReallyLongUnbrokenVideoTitleWithoutSpaces').repeat(6)+' 👨‍👩‍👧‍👦 🌊 🎵', uploader:'Creator👨‍👩‍👧‍👦'+('LongName').repeat(12), cover:'cover.jpg', target:canonical, part:'', time:'', synthetic:true },
};
for (const [key,f] of Object.entries(fixtures)) {
  await writeFile(new URL('assets/qr-'+key+'.svg',here),await QRCode.toString(f.target,{type:'svg',margin:4,errorCorrectionLevel:'M',color:{dark:'#000000',light:'#ffffff'}}));
  for(const flags of ['00','01','10','11']){
    const original=new URL(f.target),u=new URL(canonical);
    if(flags[0]==='1')u.searchParams.set('p',original.searchParams.get('p')||'1');
    if(flags[1]==='1')u.searchParams.set('t',original.searchParams.get('t')||'83');
    await writeFile(new URL('assets/qr-'+key+'-'+flags+'.svg',here),await QRCode.toString(u.href,{type:'svg',margin:4,errorCorrectionLevel:'M',color:{dark:'#000000',light:'#ffffff'}}));
  }
}
for (const [name,w,h] of [['portrait',600,1000],['square',800,800]]) {
  await writeFile(new URL('assets/'+name+'.svg',here),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#8ba6a5"/><rect x="14" y="14" width="${w-28}" height="${h-28}" rx="12" fill="none" stroke="#233b41" stroke-width="8"/><path d="M0 0L${w} ${h}M${w} 0L0 ${h}" stroke="#eef4f1" stroke-width="2"/><text x="${w/2}" y="${h/2}" text-anchor="middle" font-family="sans-serif" font-size="36" fill="#233b41">${w} × ${h}</text><text x="${w/2}" y="${h/2+60}" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#233b41">比例测试素材 · 四边完整</text></svg>`);
}
await writeFile(new URL('fixtures.js',here),'window.FIXTURES = '+JSON.stringify(fixtures,null,2)+';');
const source=await readFile(new URL('index.html',baseline),'utf8');
const styles=source.match(/<style>([\s\S]*?)<\/style>/)[1];
const article=source.match(/<article class="poster">[\s\S]*?<\/article>/)[0].replaceAll('src="','src="assets/');
await writeFile(new URL('poster.html',here),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>默认主题 · 内容适配验证</title><style>${styles}</style><link rel="stylesheet" href="poster.css"><body>${article}<script src="fixtures.js"></script><script src="target-state.js"></script><script src="poster.js"></script></body></html>`);
console.log('Built isolated poster fixtures; approved v5 source untouched.');
