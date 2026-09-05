const params=new URLSearchParams(location.search),key=params.get('case')||'original';
const fixture=resolveFixture(key,params);
const title=document.querySelector('.heading');title.textContent=fixture.title;
document.querySelector('.subtitle').remove();
document.querySelector('.cover').src='assets/'+fixture.cover;
document.querySelector('.cover').alt=fixture.synthetic?'内容适配测试素材':'原视频完整封面';
const author=document.querySelector('.author');author.replaceChildren(author.querySelector('img'));
const name=document.createElement('span');name.className='author-name';name.textContent=fixture.uploader;author.append(name);
document.querySelector('.qr img').src='assets/'+fixture.qr;
document.querySelector('.qr img').alt='二维码：'+fixture.target;
document.querySelector('.link-footer .link').textContent=fixture.target;
async function fit(){
  await document.fonts.ready;
  await Promise.all([...document.images].map(i=>i.decode()));
  const available=title.parentElement.clientHeight;
  let titleSize=48;
  for(const size of [64,60,56,52,48]){title.style.fontSize=size+'px';titleSize=size;if(title.scrollHeight<=available+1)break;}
  const truncated=title.scrollHeight>available+1;
  if(truncated){title.style.display='-webkit-box';title.style.webkitBoxOrient='vertical';title.style.webkitLineClamp=Math.max(1,Math.floor(available/(titleSize*1.28)));title.style.overflow='hidden';}
  let nameSize=34;
  name.style.webkitLineClamp='unset';
  for(const size of [34,32,30]){name.style.fontSize=size+'px';nameSize=size;if(name.getBoundingClientRect().height<=2*size*1.25+1)break;}
  const nameTruncated=name.getBoundingClientRect().height>2*nameSize*1.25+1;
  name.style.webkitLineClamp='2';
  const report={key,titleSize,titleTruncated:truncated,nameSize,nameTruncated,link:fixture.target,linkHeight:document.querySelector('.link-footer').offsetHeight,synthetic:fixture.synthetic};
  window.adaptationReport=report;document.documentElement.dataset.ready='true';parent.postMessage({type:'poster-ready',report},location.origin);
}
fit();
