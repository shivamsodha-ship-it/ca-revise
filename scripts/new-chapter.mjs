#!/usr/bin/env node
// Scaffold a chapter: node scripts/new-chapter.mjs <subject> <number> "<Title>" [--casebook]
// Creates data/<subject>/chNN-<slug>.json (and chNN-casebook.json) from the templates
// and registers the chapter in lib/registry.ts. No component changes are needed.
import fs from 'node:fs';
import path from 'node:path';

const [subject, num, title, ...rest] = process.argv.slice(2);
const withCasebook = rest.includes('--casebook');
const subjects = ['aaa', 'fr', 'afm'];
if (!subjects.includes(subject) || !Number(num) || !title) {
  console.error('Usage: npm run new-chapter -- <aaa|fr|afm> <number> "<Title>" [--casebook]');
  process.exit(1);
}
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const nn = String(num).padStart(2, '0');
const slug = title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const id = `${subject}-ch${nn}`;
const dir = path.join(root, 'data', subject);
const file = `ch${nn}-${slug}.json`;
const cbFile = `ch${nn}-casebook.json`;
fs.mkdirSync(dir, { recursive: true });

const reg = path.join(root, 'lib', 'registry.ts');
let src = fs.readFileSync(reg, 'utf8');
if (src.includes(`id: '${id}'`)) { console.error(`${id} is already registered`); process.exit(1); }

const tpl = JSON.parse(fs.readFileSync(path.join(root, 'data', '_TEMPLATE.json'), 'utf8'));
Object.assign(tpl, { id, subject, number: Number(num), title, summary: 'One-line summary' });
fs.writeFileSync(path.join(dir, file), JSON.stringify(tpl, null, 2) + '\n');
if (withCasebook) fs.copyFileSync(path.join(root, 'data', '_CASEBOOK_TEMPLATE.json'), path.join(dir, cbFile));

const row = `  {
    id: '${id}',
    subject: '${subject}',
    number: ${Number(num)},
    title: ${JSON.stringify(title).replace(/'/g, "\\'").replace(/^"|"$/g, "'")},
    summary: 'One-line summary',
    loader: async () => (await import('../data/${subject}/${file}')).default as unknown as Chapter,${withCasebook ? `
    casebook: async () => (await import('../data/${subject}/${cbFile}')).default as unknown as Casebook,` : ''}
  },
  // @chapters-end`;
src = src.replace('  // @chapters-end', row);
fs.writeFileSync(reg, src);
console.log(`Created data/${subject}/${file}${withCasebook ? ` and data/${subject}/${cbFile}` : ''}; registered ${id}.`);
