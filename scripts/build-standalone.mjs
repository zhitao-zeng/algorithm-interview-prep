// 生成可双击打开（file://）的自包含 index.html。
// 关键：把 questions.js / quiz-core.js / knowledge-map.js / app.js 全部内联进
// 一个【普通 <script>（非 module）】，并内联 styles.css。
// 普通脚本在 file:// 下不受 CORS 限制，双击 index.html 即可运行，无需本地服务器。
import { readFileSync, writeFileSync } from 'node:fs';

const root = 'C:/Users/zengz/WorkBuddy/2026-07-13-19-43-38';
const read = (p) => readFileSync(`${root}/${p}`, 'utf8');

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

// 移除外链 module 脚本，改为内联普通 <script>（非 module）
indexHtml = indexHtml.replace(
  /<script type="module" src="app\.js"><\/script>/,
  `<script>\n${bundle}\n</script>`,
);

if (indexHtml.includes('type="module"')) {
  throw new Error('仍存在 type="module" 标签，file:// 下会被拦截，请检查 index.html。');
}
if (indexHtml.includes('src="app.js"') || indexHtml.includes('href="styles.css"')) {
  throw new Error('仍存在外链资源引用，请检查 index.html。');
}

writeFileSync(`${root}/index.html`, indexHtml, 'utf8');
console.log('已生成自包含 index.html，内联脚本字符数:', bundle.length, ' 样式字符数:', css.length);
