// THROWAWAY: A=current, B=equal content gaps + transparent QR, C=equal content gaps + tinted quiet tile.
// Only local refinements: no new poster themes or page restructuring.
import { createPoster, exportPosterPng } from '../../../../../src/ui/posters';
import { buildSharePoster, type GenerationSnapshot } from '../../../../../src/domain';
import QRCode from 'qrcode';
const variants = ['A','B','C'];
let variant = new URL(location.href).searchParams.get('variant') ?? 'B';
if (!variants.includes(variant)) variant='B';
const descriptions = {
 A:'A · 当前版：图标等距的四等分网格，白色二维码底块；数字越短，后面的空白越大。',
 B:'B · 推荐：透明二维码；扫码观看收近，并与左侧统计共用一条水平信息行。无中心图标。',
 C:'C · 稳妥对照：同样按完整信息组等量留白；二维码放在取自背景的浅色底块上，颜色协调但仍看得出底块。',
};
const sets={actual:[7969,170,34,313],equal:[8888,8888,8888,8888],mixed:[0,12000,9999,null],extreme:[99999000,999990000000,Number.MAX_VALUE,null]};
const blob = await (await fetch('./cover.jpg')).blob();
const cover = await new Promise<string>(resolve=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.readAsDataURL(blob)});
const snapshot: GenerationSnapshot={bvid:'BV1QGbD6MEDg',aid:117102467941527,coverDataUrl:cover,coverUnavailable:false,title:'deepseek harness插件：dsh-smooth-stream无级丝滑流式渲染',uploader:'嗑唠的香农',partNumber:1,partTitle:null,partIdentified:true,playbackSeconds:0,wasPlaying:false,stats:{views:7969,likes:170,coins:34,favorites:313}};
const target=`https://www.bilibili.com/video/${snapshot.bvid}/`;
let serial=0;
let poster:HTMLElement;
function resize(){const width=Math.min(innerWidth-32,690);const mount=document.querySelector<HTMLElement>('#mount')!;mount.style.width=`${width}px`;mount.style.height=`${width*4/3}px`;if(poster)poster.style.transform=`scale(${width/1080})`}
function metrics(){const stats=[...poster.querySelectorAll<HTMLElement>('.bsp-d-stat')];const scale=poster.getBoundingClientRect().width/1080;const rect=(n:Element)=>{const b=n.getBoundingClientRect();return {left:b.left/scale,right:b.right/scale,width:b.width/scale}};const icons=stats.map(n=>rect(n.firstElementChild!));const values=stats.map(n=>rect(n.lastElementChild!));const gaps=values.slice(0,3).map((v,i)=>+(icons[i+1].left-v.right).toFixed(2));const steps=icons.slice(0,3).map((v,i)=>+(icons[i+1].left-v.left).toFixed(2));return {gaps,iconSteps:steps,iconWidths:icons.map(v=>+v.width.toFixed(2)),fontSizes:stats.map(n=>getComputedStyle(n.lastElementChild!).fontSize),overflow:stats.some(n=>n.lastElementChild!.scrollWidth>n.lastElementChild!.clientWidth+1)}}
async function render(){const version=++serial;const v=variant;const key=(document.querySelector('#numbers') as HTMLSelectElement).value as keyof typeof sets;const [views,likes,coins,favorites]=sets[key];const s={...snapshot,stats:{views,likes,coins,favorites}};const next=await createPoster(buildSharePoster(s,target),s);if(version!==serial)return;poster=next;
if(v!=='A'){
 const style=document.createElement('style');style.textContent='.bsp-d-stats{display:flex;justify-content:space-between;gap:16.2px}.bsp-d-stat{flex:0 0 auto}.bsp-d-stat-value{overflow:visible;text-overflow:clip}.bsp-d-qr-frame{background:transparent}.bsp-d-information{display:flex;align-items:flex-end;gap:21.6px;width:100%;min-width:0}.bsp-d-qr-frame{padding:12.96px 12.96px 0}.bsp-d-qr-caption{margin-top:0;height:54px;line-height:54px}';poster.append(style);
 const footer=poster.querySelector<HTMLElement>('.bsp-d-footer')!;const group=document.createElement('div');group.className='bsp-d-information';group.append(...Array.from(footer.children));footer.append(group);
 const qr=poster.querySelector<HTMLImageElement>('.bsp-d-qr-image')!;qr.src=await QRCode.toDataURL(target,{width:564,margin:4,errorCorrectionLevel:'M',color:{dark:'#111820ff',light:'#00000000'}});await qr.decode();
 if(v==='C'){const bg=new Image();bg.src=poster.style.backgroundImage.slice(5,-2);await bg.decode();const c=document.createElement('canvas');c.width=240;c.height=320;const x=c.getContext('2d')!;x.drawImage(bg,0,0);const pixel=x.getImageData(215,255,1,1).data;const tint=[...pixel].slice(0,3).map(n=>Math.round(n*.45+255*.55));(poster.querySelector('.bsp-d-qr-frame') as HTMLElement).style.background=`rgb(${tint.join(',')})`}
}
document.querySelector('#mount')!.replaceChildren(poster);resize();
if(v!=='A'){const stats=poster.querySelector<HTMLElement>('.bsp-d-stats')!;const cells=[...stats.children] as HTMLElement[];for(const font of [36.72,34,31,28,25]){for(const cell of cells)(cell.lastElementChild as HTMLElement).style.fontSize=`${font}px`;const scale=poster.getBoundingClientRect().width/1080;const needed=cells.reduce((sum,c)=>sum+c.getBoundingClientRect().width/scale,0)+16.2*3;if(needed<=stats.clientWidth+.5)break}}
document.querySelector('#variant')!.textContent=descriptions[v].split('：')[0];document.querySelector('#description')!.textContent=descriptions[v];document.querySelector('#metrics')!.textContent=`组间空白（海报像素）：${metrics().gaps.join(' / ')}`;(window as any).probe={metrics,export:()=>exportPosterPng(poster),poster:()=>poster};
}
function choose(delta:number){variant=variants[(variants.indexOf(variant)+delta+3)%3];history.replaceState(null,'',`?variant=${variant}`);void render()}
document.querySelector('#previous')!.addEventListener('click',()=>choose(-1));document.querySelector('#next')!.addEventListener('click',()=>choose(1));document.querySelector('#numbers')!.addEventListener('change',()=>void render());addEventListener('keydown',e=>{if((e.target as Element)?.matches('input,select,textarea,[contenteditable]'))return;if(e.key==='ArrowLeft')choose(-1);if(e.key==='ArrowRight')choose(1)});addEventListener('resize',resize);await render();
