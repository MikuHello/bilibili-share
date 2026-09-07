// THROWAWAY: all actions are simulated. A cover corner / B title lower-right / C masthead.
const names={A:'右上书签 · 放大上移',B:'标题右下方',C:'Logo 与编号之间'};
const descriptions={A:'A · 书签修订：字号放大约四成，抬到编号下方，跨过封面上沿；右端略探出封面，以折角表现书签层次。',B:'B · 标题右下方：荣誉跟随标题阅读，占用标题区下方少量留白。',C:'C · 顶栏中间：独立于封面与标题，在 Logo 和 BV / av 之间呈现。'};
let variant=new URL(location.href).searchParams.get('variant')??'A';if(!names[variant])variant='A';
const poster=document.querySelector('.bsp-poster'),panel=document.querySelector('.bsp-panel');
const originalTitle=poster.querySelector('.bsp-d-title').textContent;
const detail=panel.querySelector('input[aria-label="详细信息"]');
const originalBody=panel.querySelector('.bsp-text-card-body').textContent;
function refreshText(){panel.querySelector('.bsp-text-card-body').textContent=originalBody+(detail.checked?'播放 7971 · 点赞 170 · 投币 34 · 收藏 313\n'+(honor.textContent?honor.textContent+'\n':''):'')}
detail.onchange=refreshText;
const honor=document.createElement('span');honor.className='prototype-honor';
const tip=document.createElement('div');tip.className='prototype-tip';tip.hidden=true;tip.textContent='当前播放位置不足 1 秒，时间戳分享不可用。';document.body.append(tip);
const feedback=document.createElement('div');feedback.className='prototype-feedback';feedback.hidden=true;panel.append(feedback);
function showFeedback(error=false){feedback.replaceChildren(document.createTextNode(error?'图片未能复制，可重试或下载后分享。':'文案已复制'));feedback.classList.toggle('error',error);feedback.hidden=false;if(error){for(const [label,action]of[['重试',()=>showFeedback(false)],['下载图片',()=>{feedback.textContent='图片已下载（演示）'}]]){const b=document.createElement('button');b.textContent=label;b.onclick=action;feedback.append(b)}}const close=document.createElement('button');close.textContent='关闭';close.onclick=()=>feedback.hidden=true;feedback.append(close)}
for(const notice of document.querySelectorAll('.bsp-option-notice'))notice.remove();
const timestamp=[...document.querySelectorAll('.bsp-option-pill')].find(b=>b.textContent.includes('时间'));
if(timestamp){const wrapper=document.createElement('span');wrapper.className='prototype-tip-target';wrapper.tabIndex=0;wrapper.style.cssText='display:flex;flex:1;min-width:0';timestamp.replaceWith(wrapper);wrapper.append(timestamp);wrapper.setAttribute('aria-label',tip.textContent);const show=()=>{const r=wrapper.getBoundingClientRect();tip.hidden=false;tip.style.left=Math.max(10,Math.min(r.left,innerWidth-320))+'px';tip.style.top=(r.bottom+8)+'px'};wrapper.onmouseenter=show;wrapper.onfocus=show;wrapper.onmouseleave=()=>tip.hidden=true;wrapper.onblur=()=>tip.hidden=true;wrapper.onclick=()=>tip.hidden?show():tip.hidden=true}
function render(){honor.remove();poster.classList.remove('variant-A','variant-B','variant-C');poster.classList.add('variant-'+variant);honor.textContent=document.querySelector('#honor').value;if(honor.textContent){if(variant==='C')poster.querySelector('.bsp-d-mast').insertBefore(honor,poster.querySelector('.bsp-d-ids'));else if(variant==='B')poster.querySelector('.bsp-d-editorial').append(honor);else poster.append(honor)}else poster.classList.remove('variant-B');const title=poster.querySelector('.bsp-d-title');title.textContent=document.querySelector('#long').checked?'35min 正念冥想｜把身体作为方法｜从内耗到感受｜此时此地此身｜聆听身体｜回归当下':originalTitle;title.style.fontSize=document.querySelector('#long').checked?'47.52px':'60.48px';document.querySelector('#variant').textContent=variant+' · '+names[variant];document.querySelector('#description').textContent=descriptions[variant];const frame=document.querySelector('.bsp-preview-frame');poster.style.transform=`scale(${frame.clientWidth/1080})`;document.querySelector('.bsp-panel').classList.toggle('bsp-dark',document.querySelector('#dark').checked);window.prototypeState={variant,honor:honor.textContent,longTitle:document.querySelector('#long').checked};}
function choose(delta){const keys=Object.keys(names);variant=keys[(keys.indexOf(variant)+delta+3)%3];history.replaceState(null,'','?variant='+variant);render()}
document.querySelector('#previous').onclick=()=>choose(-1);document.querySelector('#next').onclick=()=>choose(1);
for(const id of ['honor','long','dark'])document.querySelector('#'+id).onchange=render;
document.querySelector('#success').onclick=()=>showFeedback();document.querySelector('#failure').onclick=()=>showFeedback(true);
document.querySelector('#honor').addEventListener('change',refreshText);
document.querySelector('#dark').addEventListener('change',()=>document.querySelector('.bsp-backdrop').classList.toggle('bsp-appearance-dark',document.querySelector('#dark').checked));
for(const b of panel.querySelectorAll('button'))if(b.textContent.includes('复制'))b.onclick=()=>showFeedback();
addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea,[contenteditable]'))return;if(e.key==='ArrowLeft')choose(-1);if(e.key==='ArrowRight')choose(1)});addEventListener('resize',render);render();
