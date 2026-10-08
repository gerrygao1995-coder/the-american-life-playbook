(()=>{
  'use strict';
  const routes=[...document.querySelectorAll('[data-route]')];
  const choices=[...document.querySelectorAll('[data-route-choice]')];
  const status=document.getElementById('route-status');
  const printButton=document.getElementById('print-kit');
  const valid=new Set(routes.map(route=>route.id));
  let selected=null,noticeTimer,printExpanded=[];

  function showRoute(id,focus=false){
    selected=valid.has(id)?id:null;
    routes.forEach(route=>{route.hidden=selected!==null&&route.id!==selected;});
    choices.forEach(choice=>{
      if(choice.dataset.routeChoice===selected)choice.setAttribute('aria-current','true');
      else choice.removeAttribute('aria-current');
    });
    const active=selected?document.getElementById(selected):null;
    status.textContent=active?`Showing one path: ${active.querySelector('h2').textContent}`:'All four paths are below. Choose one to focus on it.';
    printButton.querySelector('span').textContent=active?'Print this path':'Print the guide';
    document.getElementById('show-all').disabled=!active;
    if(active&&focus){active.querySelector('h2').focus({preventScroll:true});active.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  }
  function routeFromHash(focus=false){
    let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
    if(valid.has(id))showRoute(id,focus);
    else if(id==='all-routes')showRoute(null,false);
  }
  choices.forEach(choice=>choice.addEventListener('click',event=>{
    event.preventDefault();
    const id=choice.dataset.routeChoice;
    history.pushState(null,'',`#${id}`);
    showRoute(id,true);
  }));
  document.getElementById('show-all').addEventListener('click',()=>{
    history.pushState(null,'','#all-routes');
    showRoute(null,false);
    document.getElementById('choose').scrollIntoView({block:'start'});
  });
  window.addEventListener('hashchange',()=>routeFromHash(true));
  window.addEventListener('popstate',()=>{
    const id=location.hash.slice(1);
    if(valid.has(id))showRoute(id,false);
    else if(!id||id==='choose'||id==='all-routes')showRoute(null,false);
  });
  function announce(message){clearTimeout(noticeTimer);const box=document.getElementById('copy-status');box.textContent=message;noticeTimer=setTimeout(()=>box.textContent='',5500);}
  document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
    const script=document.getElementById(button.dataset.copy);
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(script.innerText.trim());
      announce('Script copied. Replace the brackets in your own private notes.');
    }catch{
      const selection=window.getSelection();
      const range=document.createRange();range.selectNodeContents(script);selection.removeAllRanges();selection.addRange(range);script.focus();
      announce('Script selected. Use your device’s copy command to copy it.');
    }
  }));
  function beginPrint(logOnly){
    document.body.classList.toggle('print-log-only',logOnly);
    window.print();
  }
  printButton.addEventListener('click',()=>beginPrint(false));
  document.getElementById('print-log').addEventListener('click',()=>beginPrint(true));
  window.addEventListener('beforeprint',()=>{
    printExpanded=[];
    document.querySelectorAll('details').forEach(details=>{if(!details.open){details.open=true;printExpanded.push(details);}});
  });
  window.addEventListener('afterprint',()=>{
    document.body.classList.remove('print-log-only');
    printExpanded.forEach(details=>details.open=false);printExpanded=[];
  });
  document.documentElement.classList.add('enhanced');
  showRoute(null,false);
  routeFromHash(false);
})();
