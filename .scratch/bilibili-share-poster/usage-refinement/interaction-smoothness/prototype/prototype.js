// THROWAWAY: visual choices only; no clipboard, download or remote writes.
const original=document.querySelector('.bsp-panel').innerHTML;
const variants=['A','B'];let variant=new URL(location.href).searchParams.get('variant')??'B';if(!variants.includes(variant))variant='B';
const names={A:'A · 当前版',B:'B · 主人指定的三按钮布局'};
const descriptions={A:'当前版：复制文案和Markdown在右上方，底部复制海报占满剩余宽度。',B:'下载图标、蓝色复制海报、次级复制文案同排；右上方仅保留Markdown。入口将统一命名为分享海报。'};
let detailed=false;
function text(){const title=document.querySelector('#long').checked?'deepseek harness插件：dsh-smooth-stream无级丝滑流式渲染，以及插件安装、实际效果演示与日常使用体验的完整记录':'deepseek harness插件：dsh-smooth-stream无级丝滑流式渲染';return detailed?`${title}\nUP主：嗑唠的香农\n播放：7,971　点赞：170　投币：34　收藏：313\nBV1QGbD6MEDg · av117102467941527\n`:`${title}（UP主：嗑唠的香农）\n`}
function updateText(){document.querySelector('.bsp-text-card-body').textContent=text();document.querySelector('.bsp-text-card-link').textContent='https://www.bilibili.com/video/BV1QGbD6MEDg/'}
function render(){document.body.dataset.variant=variant;const panel=document.querySelector('.bsp-panel');panel.innerHTML=original;document.querySelector('.bsp-backdrop').classList.toggle('bsp-appearance-dark',document.querySelector('#theme').checked);document.querySelector('#description').textContent=descriptions[variant];document.querySelector('#variant').textContent=names[variant];
const detail=panel.querySelector('[aria-label="详细信息"]');detail.checked=detailed;detail.addEventListener('change',()=>{detailed=detail.checked;updateText()});
if(variant==='B'){const copy=[...panel.querySelectorAll('.bsp-text-copy-actions button')].find(b=>b.textContent.trim()==='复制文案');copy.className='bsp-button copy-text-bottom';panel.querySelector('.bsp-actions').append(copy);}
panel.querySelectorAll('button').forEach(b=>{if(b.matches('.bsp-option-pill'))return;b.onclick=()=>{const status=panel.querySelector('.bsp-status');status.textContent='布局预览：未执行实际复制或下载';status.classList.add('is-show');setTimeout(()=>status.classList.remove('is-show'),1600)}});updateText()}
function choose(delta){variant=variants[(variants.indexOf(variant)+delta+2)%2];history.replaceState(null,'',`?variant=${variant}`);render()}
document.querySelector('#previous').onclick=()=>choose(-1);document.querySelector('#next').onclick=()=>choose(1);document.querySelector('#theme').onchange=render;document.querySelector('#long').onchange=updateText;addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select,[contenteditable]'))return;if(e.key==='ArrowLeft')choose(-1);if(e.key==='ArrowRight')choose(1)});render();
