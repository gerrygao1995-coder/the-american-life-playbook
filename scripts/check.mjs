import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const errors=[];
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.name==='.git'?[]:x.isDirectory()?walk(path.join(dir,x.name)):[path.join(dir,x.name)]);
const all=walk(root), docs=all.filter(f=>f.endsWith('.md'));
const slug=s=>s.toLowerCase().replace(/[^\p{L}\p{N}_\- ]/gu,'').replace(/ /g,'-');
const anchors=new Map(docs.map(f=>[f,new Set([...fs.readFileSync(f,'utf8').matchAll(/^#+\s+(.+)$/gm)].map(m=>slug(m[1].trim())))]));
let links=0;
for(const file of docs){const content=fs.readFileSync(file,'utf8');for(const m of content.matchAll(/\]\(([^)]+)\)/g)){const href=m[1];if(/^(https?:|mailto:)/.test(href))continue;links++;const [name,hash]=href.split('#');const dest=name?path.resolve(path.dirname(file),decodeURIComponent(name)):file;if(!fs.existsSync(dest)){errors.push(`${path.relative(root,file)}: missing ${href}`);continue;}if(hash&&anchors.has(dest)&&!anchors.get(dest).has(decodeURIComponent(hash)))errors.push(`${path.relative(root,file)}: missing anchor ${href}`);}}
const plays=JSON.parse(fs.readFileSync(path.join(root,'data/plays.json'),'utf8')).plays;
if(plays.length!==200)errors.push('Expected200plays');
const ids=new Set(plays.map(p=>p.number));if(ids.size!==plays.length)errors.push('DuplicateIDs');
const sources=JSON.parse(fs.readFileSync(path.join(root,'data/sources.json'),'utf8'));
for(const s of sources){for(const key of ['entry','title','url','checked','supports','limitation'])if(!s[key])errors.push(`Source missing${key}: ${s.entry}`);if(s.entry!=='scenario-11'&&!ids.has(s.entry))errors.push(`Unknown source entry:${s.entry}`);}
for(const p of plays){for(const m of p.basis.matchAll(/\]\((https?:[^)]+)\)/g))if(!sources.some(s=>s.entry===p.number&&s.url===m[1]))errors.push(`Citation missing from ledger: ${p.number} ${m[1]}`);}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
if((html.match(/<article class="play"/g)||[]).length!==200)errors.push('Readercardcount');
if(/<script[^>]+src=|<link[^>]+rel="stylesheet"[^>]+href="https?:/.test(html))errors.push('Externalreaderdependency');
if(/<!--(?:PLAY_SECTIONS|PLAY_DATA|CHAPTER_OPTIONS)-->/u.test(html))errors.push('Unresolvedtemplate');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`PASS: ${plays.length} plays, ${sources.length} source records, ${links} relative document links; reader content and citation coverage checked.`);
