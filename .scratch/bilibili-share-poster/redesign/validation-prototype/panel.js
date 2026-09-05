const $=s=>document.querySelector(s), params=new URLSearchParams(location.search);
const selector=$('#case');for(const [key,f] of Object.entries(FIXTURES)){const option=new Option(f.name,key);selector.add(option)}
selector.value=params.get('case') in FIXTURES?params.get('case'):'original';
$('#state').value=params.get('state')||'ready';
let fixture=resolveFixture(selector.value,params);
function scale(){ document.documentElement.style.setProperty('--lab-height',$('.lab').offsetHeight+'px');document.documentElement.style.setProperty('--lab-foot-height',$('.lab-foot').offsetHeight+'px');$('#poster').style.transform=`scale(${$('.preview-frame').clientWidth/1080})`; }
window.addEventListener('resize',scale);scale();
function textRepresentations(){
 const full=$('#detail').checked;
 const escape=v=>v.replace(/[\\`*_[\]<>]/g,'\\$&');
 const body=full?'UP 主：'+fixture.uploader+'\n'+fixture.title+'\n播放 178,000 · 点赞 2,662 · 投币 1,285 · 收藏 6,656':fixture.title;
 const markdown=full?'**'+escape(fixture.title)+'**\n\n- UP 主：'+escape(fixture.uploader)+'\n- 播放：178,000 · 点赞：2,662 · 投币：1,285 · 收藏：6,656\n\n[观看视频]('+fixture.target+')':'['+escape(fixture.title)+']('+fixture.target+')';
 return {body,plain:body+'\n'+fixture.target,markdown};
}
function renderText(){const text=textRepresentations();$('#text-body').textContent=text.body;$('#text-link').textContent=fixture.target;}
function chooseCase(reset=false){
 const url=new URL(location.href);url.searchParams.set('case',selector.value);if(reset){url.searchParams.delete('markPart');url.searchParams.delete('markTime');}history.replaceState(null,'',url);
 fixture=resolveFixture(selector.value,url.searchParams);
 const posterUrl='poster.html?'+new URLSearchParams({case:selector.value,...(url.searchParams.has('markPart')?{markPart:url.searchParams.get('markPart'),markTime:url.searchParams.get('markTime')}: {})});
 $('#poster').src=posterUrl;$('#part').checked=fixture.partEnabled;$('#time').checked=fixture.timeEnabled;
 $('#case-note').textContent=fixture.synthetic?'合成边界样例，仅验证排版；不代表真实视频元数据或已验证播放落点。':'真实标题与原始封面；统计沿用已批准原型历史快照。';$('#inspect').href=posterUrl;renderText();
}
function renderState(){
 const state=$('#state').value,busy=['loading','updating'].includes(state),failed=state==='error',coverFailed=state==='coverfailed',blocked=busy||failed;
 $('#preview-state').hidden=!(blocked||coverFailed);$('#preview-state').classList.toggle('updating',state==='updating');
 $('#preview-message').textContent=state==='loading'?'正在生成海报':state==='updating'?'正在更新标记':coverFailed?'封面暂时无法加载':'暂时无法生成海报';
 $('.spinner').hidden=!busy;$('#retry').hidden=!(failed||coverFailed);$('#fallback').hidden=state!=='fallback';
 $('#status').classList.toggle('error',state==='copyfailed');$('#status').textContent=state==='copyfailed'?'复制失败，请用海报旁的下载图标保存图片。':'';
 for(const id of ['copy-poster','download','combined'])$('#'+id).disabled=blocked||coverFailed;
 for(const id of ['copy-text','copy-markdown','part','time','detail'])$('#'+id).disabled=blocked;
 const url=new URL(location.href);url.searchParams.set('state',state);history.replaceState(null,'',url);
}
selector.addEventListener('change',()=>chooseCase(true));$('#state').addEventListener('change',renderState);
$('#detail').addEventListener('change',renderText);
for(const id of ['part','time'])$('#'+id).addEventListener('change',()=>{
 let p=$('#part').checked,t=$('#time').checked;if(id==='part'&&!p)t=false;if(id==='time'&&t&&fixture.currentPart>1)p=true;
 const url=new URL(location.href);url.searchParams.set('markPart',p?'1':'0');url.searchParams.set('markTime',t?'1':'0');history.replaceState(null,'',url);chooseCase();$('#status').textContent='';
});
for(const [id,verb] of [['copy-poster','复制海报'],['copy-text','复制文案'],['copy-markdown','复制 Markdown'],['download','下载 PNG'],['combined','组合复制']])$('#'+id).addEventListener('click',()=>{
 const text=textRepresentations();window.lastDemoCopy={action:id,payload:id==='copy-markdown'?text.markdown:id==='copy-text'||id==='combined'?text.plain:null,target:fixture.target};
 $('#status').classList.remove('error');$('#status').textContent=verb==='组合复制'?'已提供图文兼容格式（演示），接收方可能只粘贴其中一种。':verb+'完成（演示）';
});
$('#retry').addEventListener('click',()=>{$('#state').value='ready';renderState();$('#status').textContent='原型演示：重新生成后的完成状态。'});
function close(){$('#backdrop').hidden=true;$('#entry').focus()}
function open(){$('#backdrop').hidden=false;scale();$('.panel').focus()}
$('#close').addEventListener('click',close);$('#entry').addEventListener('click',open);$('#backdrop').addEventListener('click',e=>{if(e.target===$('#backdrop'))close()});
document.addEventListener('keydown',e=>{if($('#backdrop').hidden)return;if(e.key==='Escape'){e.preventDefault();close()}if(e.key==='Tab'){const nodes=[...$('.panel').querySelectorAll('button:not(:disabled),input:not(:disabled),summary,[tabindex="0"]')].filter(n=>n.getClientRects().length);if(!nodes.length)return;const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===$('.panel'))){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
function appearance(dark){document.body.classList.toggle('dark',dark);$('#appearance').textContent=dark?'模拟浅色页面':'模拟深色页面';const url=new URL(location.href);url.searchParams.set('appearance',dark?'dark':'light');history.replaceState(null,'',url)}
$('#appearance').addEventListener('click',()=>appearance(!document.body.classList.contains('dark')));appearance(params.get('appearance')==='dark');
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==$('#poster').contentWindow||e.data.type!=='poster-ready')return;const r=e.data.report;$('#metrics').textContent=`标题 ${r.titleSize}px${r.titleTruncated?' / 已省略':''} · 昵称 ${r.nameSize}px${r.nameTruncated?' / 已省略':''} · 页脚 ${r.linkHeight}px`;scale()});
chooseCase();renderState();if(params.get('entry')==='1')close();else $('.panel').focus();
