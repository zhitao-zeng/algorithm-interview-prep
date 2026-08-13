import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { questions } from '../questions.js';
import {
  complexityToLatex,
  complexityView,
  diagramHtml,
  extractEquationClauses,
  parseSimpleFlowChain,
  splitComplexity,
} from '../render-utils.js';

test('括号深度扫描会逐个提取嵌套复杂度，不吞掉相邻说明', () => {
  const source = '时间 O(n log(min(m,k)))，空间 O(n)，随后继续说明。';
  const segments = splitComplexity(source);
  const formulas = segments.filter((segment) => segment.type === 'formula');

  assert.deepEqual(formulas.map((formula) => formula.value), ['O(n log(min(m,k)))', 'O(n)']);
  assert.deepEqual(formulas.map((formula) => formula.label), ['时间', '空间']);
  assert.equal(segments.map((segment) => segment.value).join(''), source);
  assert.equal(formulas[0].latex, '\\mathrm{O}(n \\log(\\min(m,k)))');
});

test('代码标识符与产品名中的字母 O 不会被误判成复杂度', () => {
  const source = 'ZeRO(Zero)、ablation_log(4)、np.log(2) 与 dog/log(4) 都是普通文本。';
  assert.deepEqual(splitComplexity(source), [{ type: 'text', value: source }]);
  for (const identifier of ['O(n)bar', 'O(n)_cache', 'O(n)/step']) {
    assert.deepEqual(splitComplexity(identifier), [{ type: 'text', value: identifier }]);
  }
  assert.deepEqual(splitComplexity('平均 O(n)/最坏 O(n²)').filter((segment) => segment.type === 'formula').map((segment) => segment.value), ['O(n)', 'O(n²)']);
  assert.deepEqual(splitComplexity('时间复杂度：O(n)；空间复杂度：O(1)').filter((segment) => segment.type === 'formula').map((segment) => segment.label), ['时间', '空间']);
});

test('中文或残缺表达式保留为独立纯文本公式，不交给 KaTeX 猜测', () => {
  assert.equal(complexityToLatex('O(参数量)'), null);
  assert.equal(complexityToLatex('O(h·)'), null);
  assert.equal(complexityToLatex('O(n² log n)'), '\\mathrm{O}(n^{2} \\log n)');
  assert.equal(complexityToLatex('O(√L)'), '\\mathrm{O}(\\sqrt{L})');
  assert.equal(complexityToLatex('O(D′)'), '\\mathrm{O}(D^{\\prime})');
  assert.equal(complexityToLatex('O(1~T)'), null);

  const view = complexityView('计算约 O(参数量)，空间 O(h·)。');
  assert.deepEqual(view.formulas.map(({ value, latex }) => ({ value, latex })), [
    { value: 'O(参数量)', latex: null },
    { value: 'O(h·)', latex: null },
  ]);
});

test('美元始终是原始正文，不参与数学分词', () => {
  const source = 'A100 $2/h，A10 $0.8/h，单位成本 $0.00067；复杂度 O(1)。';
  const view = complexityView(source);
  assert.equal(view.source, source);
  assert.deepEqual(view.formulas.map((formula) => formula.value), ['O(1)']);
});

test('没有大 O 时，明确的等式子句也会独占一行并使用安全文本回退', () => {
  const source = 'bubble 占比 ≈ (pp-1)/(m+pp-1)；利用率 = 1 - 该值。其余是说明。';
  assert.deepEqual(extractEquationClauses(source), [
    { type: 'formula', value: 'bubble 占比 ≈ (pp-1)/(m+pp-1)', latex: null, label: '气泡' },
    { type: 'formula', value: '利用率 = 1 - 该值', latex: null, label: '利用率' },
  ]);
  assert.deepEqual(complexityView(source).formulas, extractEquationClauses(source));
  assert.deepEqual(extractEquationClauses('例如 100 任务 × 3 次 ≈ 1.2M token，需控制规模。'), []);
  assert.deepEqual(extractEquationClauses('Prefill AI 为常数（≈1），与长度无关。'), []);
  assert.deepEqual(extractEquationClauses('分支树（批大小=分支数^K）需要剪枝。'), []);
  assert.deepEqual(extractEquationClauses('100 任务 × 3 次 ≈ 1.2M token。'), []);
});

test('只把明确的一行短链识别为原生流程图', () => {
  assert.deepEqual(parseSimpleFlowChain('读取 -> 校验 -> 写入'), ['读取', '校验', '写入']);
  assert.deepEqual(parseSimpleFlowChain('A --> B => C'), ['A', 'B', 'C']);
  assert.deepEqual(parseSimpleFlowChain('输入 ─▶ [编码器] ─▶ 输出'), ['输入', '[编码器]', '输出']);

  const rejected = [
    'A\n  -> B',
    'A <-> B',
    'A --label--> B',
    'A ---> B',
    'A -> A',
    'A -> B -> A',
    'risk? -> sandbox/confirm',
    'FP32 ─▶ FP16(直接)   FP32 ─▶ [校准] ─▶ INT8',
    'epoch: 训练↓ 验证↓→↑(过拟合)',
    'A; alert(1) -> B',
    'A `code` -> B',
  ];
  for (const value of rejected) assert.equal(parseSimpleFlowChain(value), null, value);
});

test('ASCII 图只高亮箭头，并在写入 HTML 前完整转义', () => {
  assert.equal(
    diagramHtml('A --> B <script>'),
    'A <span class="arrow">--&gt;</span> B &lt;script&gt;',
  );
});

test('题库源数据已恢复：没有脚本生成的 Mermaid，也没有数学误伤', () => {
  assert.equal(questions.length, 801);
  assert.equal(questions.some((question) => /^(?:graph|flowchart)\s/m.test(question.diagram || '')), false);

  const corpus = JSON.stringify(questions);
  assert.doesNotMatch(corpus, /ZeR\$O|ablation_\$log|np\.\$log/);
  const perfCost = questions.find((question) => question.id === 'perf-cost');
  assert.match(perfCost.walkthrough, /A100 约 \$2\/h/);
  assert.match(perfCost.walkthrough, /\$0\.00067\/千 token/);
  assert.match(perfCost.workedExample.join('\n'), /A10 \$0\.8\/h/);
  assert.ok(questions.filter((question) => parseSimpleFlowChain(question.diagram)).length >= 25, '明确短链应获得结构化视图');
});

test('页面使用独立公式行和原生流程，且不再调用 Mermaid', () => {
  const appSource = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
  const stylesSource = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(appSource, /className = 'formula-line'/);
  assert.match(appSource, /displayMode: true/);
  assert.match(appSource, /strict: 'error', trust: false/);
  assert.match(appSource, /className = 'flow-chain'/);
  assert.match(appSource, /className = 'diagram-card'/);
  assert.match(appSource, /'全屏查看'/);
  assert.match(appSource, /sizeButton\('A−'/);
  assert.match(appSource, /aria-modal/);
  assert.match(appSource, /event\.key !== 'Tab'/);
  assert.doesNotMatch(appSource, /mermaid/i);
  assert.match(stylesSource, /\.diagram-block[^}]*white-space:\s*pre;/);
  assert.match(stylesSource, /--diagram-font-size:\s*14px/);
  assert.match(stylesSource, /\.formula-list\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(stylesSource, /@media\s*\(max-width:\s*1040px\)/);
  assert.doesNotMatch(stylesSource, /\.mermaid\b/);
  assert.equal(indexSource.match(/BYTEPREP_STANDALONE_STYLES/g)?.length, 1);
  assert.equal(indexSource.match(/BYTEPREP_STANDALONE_BUNDLE/g)?.length, 1);
  assert.ok(indexSource.includes(stylesSource), 'standalone 中的内联 CSS 必须与 styles.css 同步');
  assert.doesNotMatch(indexSource, /mermaid@|class="mermaid|type="module"/i);
});
