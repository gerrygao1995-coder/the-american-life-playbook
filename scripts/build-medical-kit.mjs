import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const directory = join(root, 'medical-bills');
const canonical = 'https://gerrygao1995-coder.github.io/the-american-life-playbook/medical-bills/';
const content = JSON.parse(await readFile(join(directory, 'content.json'), 'utf8'));
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const asArray = value => value == null ? [] : Array.isArray(value) ? value : [value];
const textOf = value => typeof value === 'string' ? value : value?.body ?? value?.text ?? value?.title ?? '';
const paragraphs = value => asArray(value).flatMap(item => textOf(item).split(/\n\s*\n/)).filter(Boolean).map(text => `<p>${escape(text)}</p>`).join('\n');
const list = (items, className = '') => `<ul${className ? ` class="${className}"` : ''}>${asArray(items).map(item => `<li>${escape(textOf(item))}</li>`).join('')}</ul>`;
const expectedRoutes = ['mismatch','denial','affordability','self-pay'];
if (!content.title || !content.intro || !content.checked) throw new Error('Medical kit needs title, intro, and checked date');
if (!Array.isArray(content.routes) || expectedRoutes.some(id => !content.routes.some(route => route.id === id)) || content.routes.length !== 4) throw new Error('Expected four distinct medical kit routes');
if (!Array.isArray(content.examples) || content.examples.length !== 2) throw new Error('Expected two clearly fictional worked examples');
if (!Array.isArray(content.sources) || !content.sources.length) throw new Error('Medical kit needs sources');
const sources = new Map(content.sources.map(source => [source.id,source]));
if (sources.size !== content.sources.length) throw new Error('Duplicate source IDs');
for(const source of sources.values()) {
  if(!/^[a-zA-Z0-9_-]+$/.test(source.id)) throw new Error(`Unsafe source ID ${source.id}`);
  if(!/^https:\/\//.test(source.url)) throw new Error(`Source needs an HTTPS URL: ${source.id}`);
}
function citations(ids) {
  const unique = [...new Set(asArray(ids))];
  if(!unique.length) return '';
  return `<p class="citations"><span>Sources:</span> ${unique.map(id => {
    if(!sources.has(id)) throw new Error(`Unresolved source ID: ${id}`);
    return `<a href="#source-${escape(id)}">${escape(sources.get(id).title)}</a>`;
  }).join('<span class="separator" aria-hidden="true"> · </span>')}</p>`;
}
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const printIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8V3h10v5M7 17H4V9h16v8h-3M7 14h10v7H7v-7Z"/><path d="M17 11h.01"/></svg>';
const copyIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/></svg>';
const routeNavigation = content.routes.map((route,index) => `<a class="route-choice" href="#${escape(route.id)}" data-route-choice="${escape(route.id)}" aria-controls="${escape(route.id)}"><span class="choice-top"><span class="choice-number">0${index+1}</span>${arrow}</span><h3>${escape(route.title)}</h3><p>${escape(route.summary)}</p></a>`).join('\n');
const routeSections = content.routes.map((route,index) => {
  if(!route.steps?.length || !route.checklist?.length || !route.script?.text || !route.limits?.length) throw new Error(`Incomplete route: ${route.id}`);
  const steps = route.steps.map((step,i) => `<li class="step"><div class="step-number" aria-hidden="true">${i+1}</div><div><h4>${escape(step.title)}</h4>${paragraphs(step.body)}${citations(step.sourceIds)}</div></li>`).join('\n');
  const checklist = asArray(route.checklist).map((item,i) => `<li><label><input type="checkbox" id="check-${escape(route.id)}-${i+1}"><span>${escape(textOf(item))}</span></label></li>`).join('\n');
  return `<section class="route-section" id="${escape(route.id)}" data-route="${escape(route.id)}" aria-labelledby="title-${escape(route.id)}"><div class="route-heading"><span class="eyebrow dark">Path 0${index+1}</span><h2 id="title-${escape(route.id)}" tabindex="-1">${escape(route.title)}</h2><div class="choose-if"><strong>Start here if</strong>${paragraphs(route.chooseIf)}</div></div><div class="route-layout"><div class="route-main"><h3 class="section-label">Your next moves</h3><ol class="steps">${steps}</ol><section class="script-box" aria-labelledby="script-title-${escape(route.id)}"><div class="script-heading"><div><span class="eyebrow dark">Words you can use</span><h3 id="script-title-${escape(route.id)}">${escape(route.script.label || 'Start the conversation')}</h3></div><button class="copy-button js-only" type="button" data-copy="script-${escape(route.id)}">${copyIcon}<span>Copy script</span></button></div><blockquote id="script-${escape(route.id)}" tabindex="0">${paragraphs(route.script.text)}</blockquote><p class="script-note">Replace brackets with your facts in your own notes. Do not enter or send personal information through this page.</p></section></div><aside class="route-aside" aria-label="Preparation and limits for ${escape(route.title)}"><section class="checklist-panel"><span class="eyebrow dark">Before you call or write</span><h3>Get these together.</h3><ul class="checklist">${checklist}</ul><p class="checklist-note">These checkmarks stay only on this open page. Nothing is sent or saved.</p></section><section class="limits-panel"><h3>Know the limits</h3>${list(route.limits)}${citations(route.sourceIds)}</section></aside></div></section>`;
}).join('\n');
const examples = content.examples.map((example,index) => {
  if(!/fictional/i.test(example.label || '')) throw new Error(`Example ${index+1} must be explicitly labeled fictional`);
  return `<article class="example"><div class="example-label"><span class="choice-number">0${index+1}</span><span>${escape(example.label)}</span></div><h3>${escape(example.title)}</h3>${paragraphs(example.scenario)}<h4>What the person does</h4>${list(example.actions)}<div class="example-outcome"><strong>What this illustrates</strong>${paragraphs(example.outcome)}</div>${citations(example.sourceIds)}</article>`;
}).join('\n');
const sourceList = content.sources.map((source,index) => `<li id="source-${escape(source.id)}" tabindex="-1"><span class="source-number">${String(index+1).padStart(2,'0')}</span><div><h3><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title)} <span aria-hidden="true">↗</span></a></h3><p class="source-date">Checked ${escape(source.checked || content.checked)}</p>${source.supports?.length ? `<div class="source-detail"><strong>Supports</strong>${list(source.supports)}</div>` : ''}${source.limitations?.length ? `<div class="source-detail"><strong>Limits</strong>${list(source.limitations)}</div>` : ''}</div></li>`).join('\n');
const redFlags = asArray(content.redFlags).map(flag => `<article><h3>${escape(flag.title)}</h3>${paragraphs(flag.body)}${citations(flag.sourceIds)}</article>`).join('\n');
const description = content.subtitle || 'A free U.S. medical-bill review kit. Choose your problem, gather documents, use a call script, and track next steps. Sources and limits included.';
const tokens = {
  TITLE:escape(content.title), SUBTITLE:escape(content.subtitle), INTRO:paragraphs(content.intro), CHECKED:escape(content.checked), EMERGENCY_NOTE:paragraphs(content.emergencyNote), HOW_TO_USE:list(content.howToUse), ROUTE_CHOICES:routeNavigation, ROUTE_SECTIONS:routeSections, EXAMPLES:examples, RED_FLAGS:redFlags, SOURCE_LIST:sourceList,
  META_DESCRIPTION:escape(description), CANONICAL:canonical, PRINT_ICON:printIcon,
  JSON_LD:JSON.stringify({'@context':'https://schema.org','@type':'WebPage',name:content.title,description,url:canonical,inLanguage:'en-US',isPartOf:{'@type':'WebSite',name:'The American Life Playbook',url:'https://gerrygao1995-coder.github.io/the-american-life-playbook/'}}).replace(/</g,'\\u003c')
};
let html = await readFile(join(directory,'template.html'),'utf8');
html = html.replace(/<!--([A-Z_]+)-->/g,(_,key) => {
  if(!(key in tokens)) throw new Error(`Unknown template token ${key}`);
  return tokens[key];
});
if(/<!--[A-Z_]+-->/.test(html)) throw new Error('Unfilled medical kit template token');
await mkdir(directory,{recursive:true});
await writeFile(join(directory,'index.html'),html);
console.log(`Built medical-bills/index.html: ${content.routes.length} routes, ${content.examples.length} fictional examples, ${content.sources.length} sources.`);
