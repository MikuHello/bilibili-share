// Pure fixture projection shared by the two prototype documents.
function resolveFixture(key,params){
 const base=FIXTURES[key]||FIXTURES.original;
 const original=new URL(base.target),currentPart=Number(original.searchParams.get('p')||1),currentSeconds=Number(original.searchParams.get('t')||83);
 const explicit=params.has('markPart'),partEnabled=explicit?params.get('markPart')==='1':!!base.part,timeEnabled=explicit?params.get('markTime')==='1':!!base.time;
 const flags=(partEnabled?'1':'0')+(timeEnabled?'1':'0');
 let target=base.target;
 if(explicit){const u=new URL('https://www.bilibili.com/video/BV1TXoWBsEGc/');if(partEnabled)u.searchParams.set('p',currentPart);if(timeEnabled)u.searchParams.set('t',currentSeconds);target=u.href;}
 return {...base,target,currentPart,currentSeconds,partEnabled,timeEnabled,qr:explicit?'qr-'+key+'-'+flags+'.svg':'qr-'+key+'.svg'};
}
