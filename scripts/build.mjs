import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoBase = 'https://github.com/gerrygao1995-coder/the-american-life-playbook/blob/main';
const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function inline(value, sourceFile) {
  const pattern = /\[([^\]]+)\]\(([^\s)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;
  let html = '', last = 0;
  for (const match of value.matchAll(pattern)) {
    html += esc(value.slice(last, match.index));
    if (match[1]) {
      const raw = match[2];
      const safe = !/^[a-z][a-z0-9+.-]*:/i.test(raw) || /^https?:\/\//i.test(raw);
      const href = safe ? new URL(raw,`${repoBase}/${sourceFile}`).href : null;
      html += safe ? `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(match[1])}</a>` : esc(match[1]);
    } else if (match[3]) html += `<strong>${esc(match[3])}</strong>`;
    else html += `<code>${esc(match[4])}</code>`;
    last = match.index + match[0].length;
  }
  return html + esc(value.slice(last));
}
const plain = value => value.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*`]/g, '');
const chapters = [];
const plays = [];
const files = (await readdir(join(root, 'guide'))).filter(name => /^\d{2}-.+\.md$/.test(name)).sort();
for (const file of files) {
  const source = (await readFile(join(root, 'guide', file), 'utf8')).replace(/\r\n/g, '\n');
  const heading = source.match(/^#\s+(\d+)\.?\s+(.+)$/m);
  if (!heading) throw new Error(`Missing chapter heading: ${file}`);
  const chapter = Number(heading[1]);
  const title = heading[2].trim();
  const chapterPlays = [];
  const entryPattern = /^##\s+(\d+)\.(\d+)\s+([^\n]+)\n+([\s\S]*?)(?=^##\s|$(?![\s\S]))/gm;
  for (const match of source.matchAll(entryPattern)) {
    if (Number(match[1]) !== chapter) throw new Error(`Wrong entry chapter: ${file}`);
    const number = `${String(chapter).padStart(2, '0')}.${match[2]}`;
    const id = `play-${String(chapter).padStart(2, '0')}-${match[2]}`;
    const body = match[4].trim();
    const get = label => {
      const found = body.match(new RegExp(`^- \\*\\*${label}:\\*\\*\\s*(.+)$`, 'm'));
      if (!found) throw new Error(`${number} is missing ${label}`);
      return found[1].trim();
    };
    const fields = { cost: get('Cost and effort'), payoff: get('Payoff'), priority: get('Priority').replace(/\.$/, ''), basis: get('Basis') };
    if (!['Start here','Build next','When relevant'].includes(fields.priority)) throw new Error(`Unknown priority for ${number}: ${fields.priority}`);
    const text = body.split(/\n- \*\*Cost and effort:/)[0].trim();
    const item = { id, number, chapter, chapterTitle: title, title: match[3].trim(), text, ...fields, file: `guide/${file}` };
    item.search = plain([item.number, title, item.title, text, fields.cost, fields.payoff, fields.basis].join(' '));
    plays.push(item); chapterPlays.push(item);
  }
  if (chapterPlays.length !== 5) throw new Error(`Expected 5 entries in ${file}, found ${chapterPlays.length}`);
  chapters.push({ number: chapter, title, file: `guide/${file}`, plays: chapterPlays });
}
if (chapters.length !== 40 || plays.length !== 200) throw new Error(`Expected 40 chapters / 200 plays, found ${chapters.length} / ${plays.length}`);
if (new Set(plays.map(play => play.id)).size !== plays.length) throw new Error('Duplicate play IDs');

const icons = {
  bookmark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4V4Z"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 15 6-6m-7 3-2 2a4 4 0 0 0 6 6l3-3m1-5 2-2a4 4 0 0 0-6-6L9 7"/></svg>'
};
function card(play) {
  const classes = {'Start here':'start','Build next':'build','When relevant':'relevant'};
  return `<article class="play" id="${play.id}" data-priority="${classes[play.priority]}">
    <div class="play-top"><span class="play-number">${play.number}</span><span class="priority ${classes[play.priority]}">${esc(play.priority)}</span><button class="icon-button bookmark" type="button" data-save="${play.id}" aria-pressed="false" aria-label="Save play ${play.number}: ${esc(play.title)}">${icons.bookmark}</button></div>
    <h3><a href="#${play.id}">${esc(play.title)}</a></h3>
    <div class="play-text">${play.text.split(/\n\s*\n/).map(p=>`<p>${inline(p.replace(/\n/g,' '),play.file)}</p>`).join('')}</div>
    <details class="play-details"><summary>Cost, payoff &amp; sources <span aria-hidden="true">+</span></summary><div class="detail-content"><dl><dt>Cost and effort</dt><dd>${inline(play.cost,play.file)}</dd><dt>Payoff</dt><dd>${inline(play.payoff,play.file)}</dd><dt>Basis &amp; sources</dt><dd class="basis">${inline(play.basis,play.file)}</dd></dl><div class="play-actions"><a href="${esc(repoBase+'/'+play.file)}" target="_blank" rel="noopener noreferrer">Read chapter <span aria-hidden="true">↗</span></a><button type="button" data-share="${play.id}">${icons.link} Copy reference</button></div></div></details>
  </article>`;
}
const sections = chapters.map(chapter => `<section class="chapter" data-chapter="${chapter.number}" aria-labelledby="chapter-${chapter.number}"><div class="chapter-heading"><span class="chapter-index">${String(chapter.number).padStart(2,'0')}</span><h2 id="chapter-${chapter.number}">${esc(chapter.title)}</h2><span class="chapter-count">5 plays</span></div><div class="play-grid">${chapter.plays.map(card).join('\n')}</div></section>`).join('\n');
const options = chapters.map(ch => `<option value="${ch.number}">${String(ch.number).padStart(2,'0')} · ${esc(ch.title)}</option>`).join('\n');
const json = JSON.stringify({version:1, title:'The American Life Playbook', checked:'2026-10-09', chapters:chapters.map(({plays,...rest})=>rest), plays}, null, 2);
const embedded = JSON.stringify(plays.map(({id,number,chapter,title,priority,search})=>({id,number,chapter,title,priority,search}))).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
let template = await readFile(join(root, 'assets', 'reader-template.html'), 'utf8');
template = template.replace(/href="([A-Z][A-Z-]*\.md)"/g,(_,file)=>`href="${repoBase}/${file}" target="_blank" rel="noopener noreferrer"`);
for (const [key,value] of Object.entries({PLAY_SECTIONS:sections,CHAPTER_OPTIONS:options,PLAY_DATA:embedded})) {
  if (!template.includes(`<!--${key}-->`)) throw new Error(`Template missing ${key}`);
  template = template.replace(`<!--${key}-->`, ()=>value);
}
await mkdir(join(root, 'data'), {recursive:true});
await writeFile(join(root,'data','plays.json'), json + '\n');
await writeFile(join(root,'index.html'), template);
console.log(`Built index.html and data/plays.json: ${chapters.length} chapters, ${plays.length} plays. No external dependencies.`);
