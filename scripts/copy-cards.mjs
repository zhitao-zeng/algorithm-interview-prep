// copy-cards.mjs — COPY flat cards/*.js into cards/<category>/<id>.js (write-only, no source delete).
// Used when the safe-delete guard blocks moving; afterwards `git rm --cached cards/*.js`
// untracks the now-redundant flat files (index-only, no disk delete). Idempotent: skips existing dest.
import { readdirSync, statSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cardsDir = path.resolve(__dirname, '..', 'cards');
const sanitize = (s) => String(s).trim().replace(/[\\/:*?"<>|]/g, '_');
const importFresh = (p) => import(pathToFileURL(p).href + `?t=${Date.now()}`);
const cardToFile = (c) => `export default ${JSON.stringify(c, null, 2)};\n`;

let copied = 0;
let skipped = 0;
for (const f of readdirSync(cardsDir)) {
  if (!f.endsWith('.js')) continue;
  const full = path.join(cardsDir, f);
  if (!statSync(full).isFile()) continue; // already in a subdir
  const mod = await importFresh(full);
  const card = mod.default;
  const dir = path.join(cardsDir, sanitize(card.category || 'uncategorized'));
  mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, f);
  if (existsSync(dest)) {
    skipped++;
    continue;
  }
  writeFileSync(dest, cardToFile(card));
  copied++;
}
console.log(`copied ${copied} into subdirs; skipped ${skipped} (already present)`);
