const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  const [src, outHtml, outPdf, label] = process.argv.slice(2);
  const b = await chromium.launch(); const pg = await b.newPage();
  await pg.goto('file://' + path.resolve(src)); await pg.waitForTimeout(1500);
  const res = await pg.evaluate((label) => {
    const pages=[...document.querySelectorAll('.page')];
    const blocks=[];
    pages.forEach(p=>{ const head=p.querySelector('.head'); [...p.children].forEach(c=>{ if(!c.classList.contains('head')&&!c.classList.contains('foot')) blocks.push({el:c, head}); }); });
    const body=document.body; pages.forEach(p=>p.remove());
    const out=[];
    const newPage=(head)=>{ const s=document.createElement('section'); s.className='page'; s.appendChild(head.cloneNode(true)); const f=document.createElement('div'); f.className='foot'; f.innerHTML='<span></span><span>FR LDR — Ss</span>'; s.appendChild(f); body.appendChild(s); out.push(s); return s; };
    const fits=(p)=>{ const r=p.getBoundingClientRect(); const ft=p.querySelector('.foot').getBoundingClientRect().top; let mb=0; [...p.children].forEach(c=>{ if(!c.classList.contains('foot')&&!c.classList.contains('head')) mb=Math.max(mb,c.getBoundingClientRect().bottom);}); return mb <= ft-4; };
    let cur=newPage(blocks[0].head); const foot=()=>cur.querySelector('.foot');
    const isHead=(el)=>/^H[123]$/.test(el.tagName);
    for(let i=0;i<blocks.length;i++){
      const {el,head}=blocks[i];
      if(el.classList.contains('brk') && cur.children.length>2){ cur=newPage(head); }
      cur.insertBefore(el, foot());
      if(!fits(cur)){
        // move heading(s) immediately before along with this block
        const carry=[el]; let prev=el.previousElementSibling;
        while(prev && isHead(prev) && !prev.classList.contains('head')){ carry.unshift(prev); prev=prev.previousElementSibling; }
        cur=newPage(head); carry.forEach(c=>cur.insertBefore(c, foot()));
      }
    }
    const N=out.length; const over=[];
    out.forEach((p,i)=>{ p.querySelector('.foot span').textContent=label+' · page '+(i+1)+' / '+N; if(!fits(p)) over.push(i+1); });
    return {N, over};
  }, label);
  console.log(JSON.stringify(res));
  fs.writeFileSync(outHtml, '<!doctype html>\n'+await pg.evaluate(()=>document.documentElement.outerHTML));
  if (outPdf) await pg.pdf({ path: outPdf, format: 'A4', printBackground: true, margin: {top:'0',bottom:'0',left:'0',right:'0'} });
  await b.close();
})();
