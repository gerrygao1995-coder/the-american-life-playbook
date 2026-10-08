import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext, Script } from 'node:vm';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const base=join(root,'medical-bills');
const [html,css,js,raw]=await Promise.all(['index.html','kit.css','kit.js','content.json'].map(file=>readFile(join(base,file),'utf8')));
const content=JSON.parse(raw);
const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
assert.equal(ids.length,new Set(ids).size,'HTML IDs must be unique');
assert.equal((html.match(/data-route="/g)||[]).length,4);
assert.equal((html.match(/class="example"/g)||[]).length,2);
for(const source of content.sources)assert(ids.includes(`source-${source.id}`),`Missing source ${source.id}`);
for(const match of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(match[1]),`Broken local anchor ${match[1]}`);
for(const match of html.matchAll(/<input\b[^>]*>/g))assert(/type="checkbox"/.test(match[0]),'Only optional, non-PII checkboxes are allowed');
assert(!/<form\b|<textarea\b|<iframe\b/i.test(html),'No data collection or embeds');
assert(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|document\.cookie/.test(js),'No network or persistent browser storage');
assert(!/<script[^>]+src="https?:|<link[^>]+href="https?:[^>]+rel="stylesheet"|@import/.test(html+css),'No external runtime dependencies');
assert.match(html,/<link rel="canonical" href="https:\/\/gerrygao1995-coder.github.io\/the-american-life-playbook\/medical-bills\/">/);
assert.match(html,/medical-bills-social\.png/);
assert.match(html,/reader-feedback\.yml/);
assert.match(html,/No independent professional review completed/);
assert.match(css,/@media print/);
assert.match(css,/print-log-only/);
assert.match(css,/@media\(max-width:500px\)/);
for(const route of content.routes){assert(html.includes(route.title));assert(route.steps.length>0);assert(route.limits.every(limit=>html.includes(limit.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'))));}
new Script(js);
for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))JSON.parse(match[1]);

// Execute the shipped controller against a small deterministic DOM harness.
// This checks interaction state transitions, not browser layout or printing fidelity.
class Element{
  constructor(id,text=''){this.id=id;this.textContent=text;this.innerText=text;this.hidden=false;this.disabled=false;this.dataset={};this.attributes=new Map();this.events=new Map();this.children={};this.classes=new Set();this.classList={add:name=>this.classes.add(name),remove:name=>this.classes.delete(name),toggle:(name,force)=>force===undefined?(this.classes.has(name)?this.classes.delete(name):this.classes.add(name)):(force?this.classes.add(name):this.classes.delete(name))};}
  addEventListener(name,fn){this.events.set(name,fn);}
  fire(name,event={preventDefault(){}}){return this.events.get(name)?.(event);}
  querySelector(selector){return this.children[selector];}
  setAttribute(name,value){this.attributes.set(name,value);}
  removeAttribute(name){this.attributes.delete(name);}
  focus(){this.focused=true;}
  scrollIntoView(){this.scrolled=true;}
}
function harness(hash='',clipboard=true){
  const elements=new Map();
  const make=(id,text='')=>{const el=new Element(id,text);elements.set(id,el);return el;};
  const routes=content.routes.map(route=>{const el=make(route.id);el.dataset.route=route.id;el.children.h2=make(`title-${route.id}`,route.title);return el;});
  const choices=content.routes.map(route=>{const el=make(`choice-${route.id}`);el.dataset.routeChoice=route.id;return el;});
  const copies=content.routes.map(route=>{const el=make(`copy-${route.id}`);el.dataset.copy=`script-${route.id}`;make(`script-${route.id}`,route.script.text);return el;});
  ['route-status','show-all','print-log','copy-status','choose'].forEach(id=>make(id));
  make('print-kit').children.span=new Element('print-span');
  const body=make('body'),documentElement=make('html'),details=[{open:false}];
  const windowEvents=new Map();let printed=0,copied=null,selectionUsed=false;
  const location={hash};
  const window={addEventListener:(name,fn)=>windowEvents.set(name,fn),print:()=>{printed++;windowEvents.get('beforeprint')?.();},getSelection:()=>({removeAllRanges(){},addRange(){selectionUsed=true;}})};
  const context={document:{body,documentElement,getElementById:id=>elements.get(id),querySelectorAll:selector=>({'[data-route]':routes,'[data-route-choice]':choices,'[data-copy]':copies,'details':details}[selector]||[]),createRange:()=>({selectNodeContents(){}})},window,location,history:{pushState:(_state,_title,url)=>location.hash=url},matchMedia:()=>({matches:true}),navigator:{clipboard:clipboard?{writeText:async text=>{copied=text;}}:undefined},setTimeout:()=>1,clearTimeout(){}};
  runInNewContext(js,context);
  return{elements,routes,choices,copies,windowEvents,location,body,details,get printed(){return printed;},get copied(){return copied;},get selectionUsed(){return selectionUsed;}};
}
const page=harness();
assert(page.routes.every(route=>!route.hidden),'All four paths must start available');
for(const choice of page.choices){choice.fire('click');assert.equal(page.routes.filter(route=>!route.hidden).length,1);assert.equal(page.routes.find(route=>!route.hidden).id,choice.dataset.routeChoice);assert.equal(choice.attributes.get('aria-current'),'true');assert.equal(page.location.hash,`#${choice.dataset.routeChoice}`);}
page.elements.get('show-all').fire('click');assert(page.routes.every(route=>!route.hidden));
page.location.hash='#denial';page.windowEvents.get('popstate')();assert.equal(page.routes.find(route=>!route.hidden).id,'denial');
page.location.hash='#source-cms-eob';page.windowEvents.get('hashchange')();assert.equal(page.routes.find(route=>!route.hidden).id,'denial','Source navigation must keep selected path');
page.location.hash='';page.windowEvents.get('popstate')();assert(page.routes.every(route=>!route.hidden),'Back to the initial URL must restore all paths');
const deep=harness('#self-pay');assert.equal(deep.routes.find(route=>!route.hidden).id,'self-pay');
await page.copies[0].fire('click');assert.equal(page.copied,content.routes[0].script.text.trim());
const fallback=harness('',false);await fallback.copies[0].fire('click');assert(fallback.selectionUsed,'Clipboard failure must offer selectable text');
deep.elements.get('print-kit').fire('click');assert.equal(deep.printed,1);assert.equal(deep.routes.filter(route=>!route.hidden).length,1);assert(deep.details.every(details=>details.open));deep.windowEvents.get('afterprint')();assert(deep.details.every(details=>!details.open));
deep.elements.get('print-log').fire('click');assert(deep.body.classes.has('print-log-only'));deep.windowEvents.get('afterprint')();assert(!deep.body.classes.has('print-log-only'));
console.log('Medical kit checks passed: static content, 4 paths, 2 fictional examples, source anchors, SEO metadata, no data collection, route/deep-link/back navigation, script copy fallback, and selected-path/log print state.');
console.log('Browser visual layout and print pagination still require browser QA.');
