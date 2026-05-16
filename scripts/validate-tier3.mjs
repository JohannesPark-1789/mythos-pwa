// Validates Tier 3 dataset: ID uniqueness, family ref resolution, bidirectional
// parent↔children consistency. Run: node scripts/validate-tier3.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

function loadJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function gather() {
  const files = [
    'data/characters.json',
    ...readdirSync(join(ROOT, 'data/tier2')).map((f) => `data/tier2/${f}`),
    ...readdirSync(join(ROOT, 'data/tier3')).map((f) => `data/tier3/${f}`),
  ];
  const chars = [];
  for (const f of files) {
    const ds = loadJson(join(ROOT, f));
    for (const c of ds.characters) chars.push({ ...c, _file: f });
  }
  return chars;
}

function loadExternal() {
  const src = readFileSync(join(ROOT, 'lib/external-names.ts'), 'utf8');
  const matches = [...src.matchAll(/^\s+([a-z_]+):\s+'([^']+)',/gm)];
  return new Set(matches.map((m) => m[1]));
}

function main() {
  const chars = gather();
  const external = loadExternal();
  const byId = new Map(chars.map((c) => [c.id, c]));

  const errors = [];
  const warnings = [];

  // 1. ID uniqueness
  const seen = new Map();
  for (const c of chars) {
    if (seen.has(c.id)) {
      errors.push(`DUP id="${c.id}" in ${c.id} (${seen.get(c.id)._file} & ${c._file})`);
    }
    seen.set(c.id, c);
  }

  // 2. Family ref resolution
  for (const c of chars) {
    const refs = [
      ...c.family.parents.map((r) => ['parent', r]),
      ...c.family.consorts.map((r) => ['consort', r]),
      ...c.family.children.map((r) => ['child', r]),
      ...c.family.siblings.map((r) => ['sibling', r]),
    ];
    for (const [kind, ref] of refs) {
      if (!byId.has(ref) && !external.has(ref)) {
        errors.push(`UNRESOLVED ${c.id}.family.${kind} → "${ref}" (${c._file})`);
      }
    }
  }

  // 3. Bidirectional parent↔children
  for (const c of chars) {
    for (const childId of c.family.children) {
      const child = byId.get(childId);
      if (!child) continue;
      if (!child.family.parents.includes(c.id)) {
        warnings.push(`MISSING ${childId}.parents missing "${c.id}" (${c.id}.children has ${childId})`);
      }
    }
    for (const parentId of c.family.parents) {
      const parent = byId.get(parentId);
      if (!parent) continue;
      if (!parent.family.children.includes(c.id)) {
        warnings.push(`MISSING ${parentId}.children missing "${c.id}" (${c.id}.parents has ${parentId})`);
      }
    }
  }

  // 4. Sibling symmetry (loose)
  for (const c of chars) {
    for (const sibId of c.family.siblings) {
      const sib = byId.get(sibId);
      if (!sib) continue;
      if (!sib.family.siblings.includes(c.id)) {
        warnings.push(`ASYMMETRIC siblings: ${c.id}↔${sibId} (${sibId} doesn't list ${c.id})`);
      }
    }
  }

  // 5. Total count
  const t1 = chars.filter((c) => c.tier === 1).length;
  const t2 = chars.filter((c) => c.tier === 2).length;
  const t3 = chars.filter((c) => c.tier === 3).length;

  console.log(`\n=== TIER COUNTS ===`);
  console.log(`Tier 1: ${t1}`);
  console.log(`Tier 2: ${t2}`);
  console.log(`Tier 3: ${t3}`);
  console.log(`Total:  ${chars.length}`);

  console.log(`\n=== CATEGORY COUNTS ===`);
  const catCounts = {};
  for (const c of chars) catCounts[c.category] = (catCounts[c.category] || 0) + 1;
  for (const [cat, n] of Object.entries(catCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${n}`);
  }

  console.log(`\n=== ERRORS (${errors.length}) ===`);
  for (const e of errors) console.log(`  ${e}`);

  console.log(`\n=== WARNINGS (${warnings.length}, first 30) ===`);
  for (const w of warnings.slice(0, 30)) console.log(`  ${w}`);
  if (warnings.length > 30) console.log(`  ... (${warnings.length - 30} more)`);

  process.exit(errors.length > 0 ? 1 : 0);
}

main();
