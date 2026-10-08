import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(await readFile(join(root,'data','plays.json'),'utf8'));
const html = await readFile(join(root,'index.html'),'utf8');
const require = (condition,message) => { if(!condition) throw new Error(message); };
require(data.chapters.length===40 && data.plays.length===200,'Expected 40 chapters and 200 plays');
require(new Set(data.plays.map(p=>p.id)).size===200,'Duplicate play identifiers');
const counts = new Map();
for(const play of data.plays){
  require(/^play-\d{2}-[1-5]$/.test(play.id),`Invalid identifier ${play.id}`);
  require(html.includes(`id="${play.id}"`),`Missing rendered play ${play.id}`);
  require(play.title && play.text && play.cost && play.payoff && play.priority && play.basis,`Missing content for ${play.id}`);
  require(/\[[^\]]+\]\([^)]+\)/.test(play.basis),`Missing source or editorial-method link for ${play.id}`);
  require(['Start here','Build next','When relevant'].includes(play.priority),`Invalid priority for ${play.id}`);
  counts.set(play.chapter,(counts.get(play.chapter)||0)+1);
}
require([...counts.values()].every(n=>n===5),'A chapter does not contain five plays');
require((html.match(/<article class="play" /g)||[]).length===200,'Rendered card count differs from data');
require((html.match(/<section class="chapter" /g)||[]).length===40,'Rendered chapter count differs from data');
require(!/<!--(?:PLAY_SECTIONS|CHAPTER_OPTIONS|PLAY_DATA)-->/g.test(html),'Unreplaced build token');
require(!/<script[^>]+src\s*=|<link[^>]+(?:stylesheet|fonts\.googleapis)|@import\s+url/i.test(html),'External runtime dependency found');
for(const match of html.matchAll(/href="([^"]+)"/g))require(/^(https?:\/\/|#)/.test(match[1]),`Broken standalone-document link: ${match[1]}`);
const embedded=html.match(/<script id="play-data" type="application\/json">([\s\S]*?)<\/script>/);
require(embedded,'Missing embedded offline search data');
require(JSON.parse(embedded[1]).length===200,'Embedded search data count differs');
for(const match of html.matchAll(/<script(?![^>]*type="application\/json")[^>]*>([\s\S]*?)<\/script>/g))new Script(match[1]);
console.log('Verified 40 chapters, 200 complete plays with source or editorial-method links, stable IDs, embedded offline data, JavaScript syntax, and no external runtime dependencies.');
