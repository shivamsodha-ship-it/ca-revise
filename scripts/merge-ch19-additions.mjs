#!/usr/bin/env node
// Adds app-written questions that close untested provisions in AAA Ch 19. Safe to re-run.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const file = path.join(root, 'data/aaa/ch19-casebook.json');
const { questions } = await import(pathToFileURL(path.join(root, 'scripts/learn-src/aaa-ch19-questions.mjs')).href);
const cb = JSON.parse(fs.readFileSync(file, 'utf8'));
const ours = new Set(questions.map(q => q.id));
cb.Q = cb.Q.filter(q => !ours.has(q.id));
const pid = new Set(cb.P.map(p => p.id));
const labels = new Set((cb.meta.verdicts ?? []).map(v => v.label));
for (const q of questions) {
  for (const l of q.links) if (!pid.has(l)) throw new Error(`${q.id}: unknown provision ${l}`);
  if (q.v !== 'Theory' && !labels.has(q.v)) throw new Error(`${q.id}: verdict ${q.v} not in meta.verdicts`);
  cb.Q.push(q);
}
cb.P = cb.P.map(p => ({ ...p, qs: cb.Q.filter(x => x.links?.includes(p.id)).map(x => x.id) }));
fs.writeFileSync(file, JSON.stringify(cb) + '\n');
console.log(`Merged ${questions.length} questions; casebook has ${cb.Q.length}.`);
