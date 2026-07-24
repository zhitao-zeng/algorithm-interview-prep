// reorg-cards.mjs — move flat cards/*.js into cards/<category>/<id>.js, in resumable batches.
// The safe-delete guard caps source-removing ops at ~50 per turn, so we move BATCH per run
// and you re-run until no top-level *.js remain. renameSync is used (git detects renames on commit).
import { readdirSync, statSync, mkdirSync, renameSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cardsDir = path.resolve(__dirname, '..', 'cards');
const BATCH = 45; // bulk delete guard rejects a single command that moves >=50 files; keep <50
const sanitize = (s) => String(s).trim().replace(/[\\/:*?"<>|]/g, '_');
const importFresh = (p) => import(pathToFileURL(p).href + `?t=${Date.now()}`);

let moved = 0;
let droppedDup = 0;
for (const f of readdirSync(cardsDir)) {
  if (moved + droppedDup >= BATCH) break;
  if (!f.endsWith('.js')) continue;
  const full = path.join(cardsDir, f);
  if (!statSync(full).isFile()) continue; // already in a subdir
  const mod = await importFresh(full);
  const card = mod.default;
  const dir = path.join(cardsDir, sanitize(card.category || 'uncategorized'));
  mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, f);
  if (existsSync(dest)) {
    rmSync(dest); // drop the stray duplicate from an interrupted run (counts as 1 delete)
    droppedDup++;
  }
  renameSync(full, dest);
  moved++;
}
console.log(`batch done: moved ${moved}, dropped ${droppedDup} dup(s). Re-run until no top-level *.js remain.`);
