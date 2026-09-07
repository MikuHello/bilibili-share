// THROWAWAY: visual choices only; no clipboard, download or remote writes.
const original=document.querySelector('.bsp-panel').innerHTML;
const variants=['A','B','C'];let variant=new URL(location.href).searchParams.get('variant')??'B';if(!variants.includes(variant))variant='B';
const names={A:'A · 当前布局',B:'B · 紧凑居中（推荐）',C:'C · 图片操作归位'};
const descriptions={A:'当前版：文案卡片有最低高度，图片操作下方预留64px反馈区域。可勾选详细信息比较。',B:'文案按内容自然撑开，下载和复制紧接在文案后，右侧整体居中；反馈浮层不再占据底部留白。',C:'下载和复制海报移到图片下方；右侧只保留分享选项和文案，文案复制入口放在卡片末尾。'};
let detailed=false;
function text(){const title=document.querySelector('#long').checked?'deepseek harness插件：dsh-smooth-stream无级丝滑流式渲染，以及插件安装、实际效果演示与日常使用体验的完整记录':'deepseek harness插件：dsh-smooth-stream无级丝滑流式渲染';return detailed?`${title}\nUP主：嗑唠的香农\n播放：7,971　点赞：170　投币：34　收藏：313\nBV1QGbD6MEDg · av117102467941527\n`:`${title}（UP主：嗑唠的香农）\n`}
function updateText(){document.querySelector('.bsp-text-card-body').textContent=text();document.querySelector('.bsp-text-card-link').textContent='https://www.bilibili.com/video/BV1QGbD6MEDg/'}
function render(){document.body.dataset.variant=variant;const panel=document.querySelector('.bsp-panel');panel.innerHTML=original;document.querySelector('.bsp-backdrop').classList.toggle('bsp-appearance-dark',document.querySelector('#theme').checked);document.querySelector('#description').textContent=descriptions[variant];document.querySelector('#variant').textContent=names[variant];
const detail=panel.querySelector('[aria-label="详细信息"]');detail.checked=detailed;detail.addEventListener('change',()=>{detailed=detail.checked;updateText()});
if(variant==='C'){panel.querySelector('.bsp-preview-pane').append(panel.querySelector('.bsp-action-group'));const section=panel.querySelector('.bsp-text-content').parentElement;section.append(panel.querySelector('.bsp-text-copy-actions'));}
panel.querySelectorAll('button').forEach(b=>{if(b.matches('.bsp-option-pill'))return;b.onclick=()=>{const status=panel.querySelector('.bsp-status');status.textContent='布局预览：未执行实际复制或下载';status.classList.add('is-show');setTimeout(()=>status.classList.remove('is-show'),1600)}});updateText()}
function choose(delta){variant=variants[(variants.indexOf(variant)+delta+3)%3];history.replaceState(null,'',`?variant=${variant}`);render()}
document.querySelector('#previous').onclick=()=>choose(-1);document.querySelector('#next').onclick=()=>choose(1);document.querySelector('#theme').onchange=render;document.querySelector('#long').onchange=updateText;addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select,[contenteditable]'))return;if(e.key==='ArrowLeft')choose(-1);if(e.key==='ArrowRight')choose(1)});render();
