// 生成可双击打开（file://）的自包含 index.html。
// 关键：把 questions.js / quiz-core.js / knowledge-map.js / app.js 全部内联进
// 一个【普通 <script>（非 module）】，并内联 styles.css。
// 普通脚本在 file:// 下不受 CORS 限制，双击 index.html 即可运行，无需本地服务器。
//
// 兼容性说明：
// - 既支持「index.html 仍含 <script type="module" src="app.js">」的源模板，
//   也支持「index.html 已经被内联过」的当前形态（用自动生成注释做锚点替换整段 bundle）。
// - root 使用 process.cwd()，本地与 GitHub Actions 中均无需改路径。
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url)) + '/..';
const read = (p) => readFileSync(join(root, p), 'utf8');

// 1) 去掉被合并模块的导出关键字（export const/function/let/class → 去掉 export）
const stripExport = (src) => src.replace(/^export\s+/gm, '');
// 2) 去掉 app.js 的 import 语句（合并后都在同一脚本作用域）
const stripImport = (src) => src.replace(/^\s*import\s.+$/gm, '');

const questions = stripExport(read('questions.js'));
const quizCore = stripExport(read('quiz-core.js'));
const knowledgeMap = stripExport(read('knowledge-map.js'));
const app = stripImport(read('app.js'));
const css = read('styles.css');

const bundle = `/* 由 scripts/build-standalone.mjs 自动生成，请勿手改。源文件：questions.js / quiz-core.js / knowledge-map.js / app.js */
${questions}
${quizCore}
${knowledgeMap}
${app}`;

let indexHtml = read('index.html');

// 移除外链样式表，改为内联 <style>
indexHtml = indexHtml.replace(/<link rel="stylesheet" href="styles\.css">/, `<style>\n${css}\n</style>`);

// 情况 A：仍存在 module 外链脚本标签（源模板形态）→ 整段替换
if (indexHtml.includes('<script type="module" src="app.js">')) {
  indexHtml = indexHtml.replace(
    /<script type="module" src="app\.js"><\/script>/,
    `<script>\n${bundle}\n</script>`,
  );
} else {
  // 情况 B：已经是内联形态 → 用自动生成注释锚点，替换整段 inline bundle <script>…</script>
  const marker = '/* 由 scripts/build-standalone.mjs 自动生成';
  const markerIdx = indexHtml.indexOf(marker);
  if (markerIdx === -1) {
    throw new Error('找不到可替换的内联 bundle 锚点，也未发现 module 外链脚本，请检查 index.html。');
  }
  const scriptOpenIdx = indexHtml.lastIndexOf('<script>', markerIdx);
  const scriptCloseIdx = indexHtml.indexOf('</script>', markerIdx);
  if (scriptOpenIdx === -1 || scriptCloseIdx === -1) {
    throw new Error('内联 bundle 的 <script> 开/闭标签定位失败，请检查 index.html。');
  }
  const newScript = `<script>\n${bundle}\n</script>`;
  indexHtml = indexHtml.slice(0, scriptOpenIdx) + newScript + indexHtml.slice(scriptCloseIdx + '</script>'.length);
}

if (indexHtml.includes('type="module"')) {
  throw new Error('仍存在 type="module" 标签，file:// 下会被拦截，请检查 index.html。');
}
if (indexHtml.includes('src="app.js"') || indexHtml.includes('href="styles.css"')) {
  throw new Error('仍存在外链资源引用，请检查 index.html。');
}

writeFileSync(join(root, 'index.html'), indexHtml, 'utf8');
console.log('已生成自包含 index.html，内联脚本字符数:', bundle.length, ' 样式字符数:', css.length);
