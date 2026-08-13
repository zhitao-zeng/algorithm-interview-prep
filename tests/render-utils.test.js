import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { questions } from '../questions.js';
import { detailSections } from '../quiz-core.js';
import {
  complexityToLatex,
  complexityView,
  diagramHtml,
  diagramToVectorModel,
  extractEquationClauses,
  parseFlowDiagram,
  parseSimpleFlowChain,
  plainMathToLatex,
  splitMathText,
  splitRichText,
  splitComplexity,
} from '../render-utils.js';

test('正文公式只识别显式 LaTeX 分隔符，金额与未闭合内容保持原文', () => {
  assert.deepEqual(splitMathText('前向 \\(q(x_t\\mid x_{t-1})\\) 后续'), [
    { type: 'text', value: '前向 ' },
    { type: 'math', value: 'q(x_t\\mid x_{t-1})', displayMode: false, raw: '\\(q(x_t\\mid x_{t-1})\\)' },
    { type: 'text', value: ' 后续' },
  ]);
  assert.deepEqual(splitMathText('\\[x_T\\sim\\mathcal{N}(0,I)\\]'), [
    { type: 'math', value: 'x_T\\sim\\mathcal{N}(0,I)', displayMode: true, raw: '\\[x_T\\sim\\mathcal{N}(0,I)\\]' },
  ]);
  assert.deepEqual(splitMathText('A100 $2/h，A10 $0.8/h'), [{ type: 'text', value: 'A100 $2/h，A10 $0.8/h' }]);
  assert.deepEqual(splitMathText('未闭合 \\(x_t'), [{ type: 'text', value: '未闭合 \\(x_t' }]);
});

test('全库正文保守识别大 O、数学函数、希腊字母、上下标与矩阵形状', () => {
  const source = '前向 q(x_t|x_{t-1})，损失 L_aux=α·Σf_i²，复杂度 O(N²d)，张量 B×L×D。';
  const segments = splitRichText(source);
  assert.equal(segments.map((segment) => segment.type === 'text' ? segment.value : segment.raw).join(''), source);
  assert.deepEqual(segments.filter((segment) => segment.type === 'math').map((segment) => segment.raw), [
    'q(x_t|x_{t-1})', 'L_aux=α·Σf_i²', 'O(N²d)', 'B×L×D',
  ]);
  assert.equal(plainMathToLatex('q(x_t|x_{t-1})'), 'q(x_{t}\\mid x_{t-1})');
  assert.equal(plainMathToLatex('L_aux=α·Σf_i²'), 'L_{\\mathrm{aux}}=\\alpha\\cdot \\sum f_{i}^{2}');
  assert.equal(
    plainMathToLatex('∇J(θ)=E[∇log π(a|s)·G]'),
    '\\nabla J(\\theta)=\\mathbb{E}[\\nabla \\log \\pi(a\\mid s)\\cdot G]',
  );
  assert.equal(plainMathToLatex('RMS=√(mean(x²)+ε)'), '\\operatorname{RMS}=\\sqrt{\\operatorname{mean}(x^{2})+\\varepsilon}');
  assert.equal(plainMathToLatex('n_kv_heads=g'), 'n_{\\mathrm{kv\\_heads}}=g');
});

test('自动公式识别不误伤金额、产品名、带连字号术语和代码变量', () => {
  const samples = [
    'A100 $2/h，A10 $0.8/h',
    'ZeRO(Zero)、ablation_log(4)、np.log(2)',
    '用 ε-greedy 探索，再用 τ-bench 评测',
    'q_sample 与 training_loss 是代码函数',
    'max_steps=8 超过即终止',
  ];
  for (const source of samples) {
    assert.deepEqual(splitRichText(source), [{ type: 'text', value: source }], source);
  }
});

test('全题库正文公式保持原文、括号完整且覆盖主要含公式题卡', () => {
  const strings = (value) => {
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value.flatMap(strings);
    if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
    return [];
  };
  const balanced = (value) => {
    const stack = [], pairs = { ')': '(', ']': '[', '}': '{' };
    for (const char of value) {
      if ('([{'.includes(char)) stack.push(char);
      else if (pairs[char] && stack.pop() !== pairs[char]) return false;
    }
    return stack.length === 0;
  };
  let formulaCount = 0;
  const formulaCards = new Set();

  for (const question of questions) {
    const richValues = [question.title, question.prompt];
    for (const section of detailSections(question, 'deep')) {
      if (section.key === 'complexity' || ['code', 'diagram', 'refs'].includes(section.type)) continue;
      richValues.push(...strings(section.value));
    }
    for (const source of richValues) {
      const segments = splitRichText(source);
      assert.equal(segments.map((segment) => segment.type === 'text' ? segment.value : segment.raw).join(''), source, question.id);
      for (const segment of segments.filter((item) => item.type === 'math')) {
        assert.ok(balanced(segment.value), `${question.id}: ${segment.value}`);
        assert.doesNotMatch(segment.value, /^[,;:]|[,;:]$|[+\-*/·⋅×≈≃≅∝≤≥≪≫=<>|~√∑Σ∏Π∫]$/u);
        formulaCount += 1;
        formulaCards.add(question.id);
      }
    }
  }

  assert.ok(formulaCount >= 1500, `应识别至少 1500 处正文公式，实际 ${formulaCount}`);
  assert.ok(formulaCards.size >= 300, `应覆盖至少 300 张含正文公式的题卡，实际 ${formulaCards.size}`);
});

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

test('带边说明的单行流程会保留节点与边标签，分支和多行图不会被误转', () => {
  assert.deepEqual(parseFlowDiagram('Agent --pause--> Human --decision--> Agent'), {
    nodes: ['Agent', 'Human', 'Agent'],
    edges: [{ label: 'pause' }, { label: 'decision' }],
  });
  assert.deepEqual(parseFlowDiagram('视频 ─▶ 采样帧 ─▶ 逐帧编码 ─(时戳)─▶ 拼接'), {
    nodes: ['视频', '采样帧', '逐帧编码', '拼接'],
    edges: [{ label: '' }, { label: '' }, { label: '(时戳)' }],
  });
  assert.equal(parseFlowDiagram('Budget --guard--> stop; Cache --hit--> skip retrieve'), null);
  assert.equal(parseFlowDiagram('A -> B\nB -> C'), null);
});

test('ASCII 图只高亮箭头，并在写入 HTML 前完整转义', () => {
  assert.equal(
    diagramHtml('A --> B <script>'),
    'A <span class="arrow">--&gt;</span> B &lt;script&gt;',
  );
  assert.equal(
    diagramHtml('[输入] -> (循环)'),
    '<span class="diagram-node">[输入]</span> <span class="arrow">-&gt;</span> <span class="diagram-caption">(循环)</span>',
  );
});

test('复杂 ASCII 图会保留原始几何并生成可缩放的矢量节点与连线', () => {
  const source = 'Input\n  │\n  ▼\n[VLM observe]──►[Planner]\n  │              │\n  └──── loop ────┘';
  const model = diagramToVectorModel(source);
  assert.equal(model.source, source);
  assert.ok(model.width >= 320);
  assert.ok(model.height >= 96);
  assert.ok(model.primitives.some((primitive) => primitive.type === 'line'));
  assert.ok(model.primitives.some((primitive) => primitive.type === 'polygon'));
  assert.deepEqual(model.tokens.filter((token) => token.kind === 'primary').map((token) => token.label), ['VLM observe', 'Planner']);
  assert.equal(diagramToVectorModel('只有说明文字，没有连接关系'), null);
});

test('题库源数据已恢复：没有脚本生成的 Mermaid，也没有数学误伤', () => {
  assert.equal(questions.length, 855);
  assert.equal(questions.some((question) => /^(?:graph|flowchart)\s/m.test(question.diagram || '')), false);

  const corpus = JSON.stringify(questions);
  assert.doesNotMatch(corpus, /ZeR\$O|ablation_\$log|np\.\$log/);
  const perfCost = questions.find((question) => question.id === 'perf-cost');
  assert.match(perfCost.walkthrough, /A100 约 \$2\/h/);
  assert.match(perfCost.walkthrough, /\$0\.00067\/千 token/);
  assert.match(perfCost.workedExample.join('\n'), /A10 \$0\.8\/h/);
  const ddpm = questions.find((question) => question.id === 'gen-diffusion-ddpm');
  assert.match(ddpm.derivation.join('\n'), /\\mathcal\{N\}/);
  assert.match(ddpm.workedExample.join('\n'), /\\bar\{\\alpha\}_\{500\}/);
  assert.ok(ddpm.derivation.flatMap(splitMathText).some((segment) => segment.type === 'math'));
  assert.ok(questions.filter((question) => parseSimpleFlowChain(question.diagram)).length >= 25, '明确短链应获得结构化视图');
  assert.ok(questions.filter((question) => parseFlowDiagram(question.diagram)).length >= 30, '带边说明的短链也应获得结构化视图');
  assert.ok(questions.filter((question) => diagramToVectorModel(question.diagram)).length >= 450, '复杂图应大面积获得矢量视图');
});

test('页面使用独立公式行和原生流程，且不再调用 Mermaid', () => {
  const appSource = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
  const stylesSource = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(appSource, /className = 'formula-line'/);
  assert.match(appSource, /function appendRichText/);
  assert.match(appSource, /appendRichText\(document\.createElement\('p'\), q\.prompt\)/);
  assert.match(appSource, /katex\.render\(segment\.latex \|\| segment\.value/);
  assert.match(appSource, /displayMode: true/);
  assert.match(appSource, /strict: 'error', trust: false/);
  assert.match(appSource, /className = 'flow-chain'/);
  assert.match(appSource, /className = 'flow-step'/);
  assert.match(appSource, /className = 'flow-edge-label'/);
  assert.match(appSource, /className = 'diagram-card'/);
  assert.match(appSource, /function renderVectorDiagram/);
  assert.match(appSource, /toggle\.textContent = '原图'/);
  assert.match(appSource, /'全屏查看'/);
  assert.match(appSource, /sizeButton\('A−'/);
  assert.match(appSource, /aria-modal/);
  assert.match(appSource, /event\.key !== 'Tab'/);
  assert.doesNotMatch(appSource, /mermaid/i);
  assert.match(stylesSource, /\.diagram-block[^}]*white-space:\s*pre;/);
  assert.match(stylesSource, /\.diagram-viewport[^}]*background-image:/);
  assert.match(stylesSource, /\.diagram-svg\s*\{/);
  assert.match(stylesSource, /\.vector-edge\s*\{/);
  assert.match(stylesSource, /\.flow-node\.is-start/);
  assert.match(stylesSource, /--diagram-font-size:\s*14px/);
  assert.match(stylesSource, /\.formula-list\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(stylesSource, /@media\s*\(max-width:\s*1040px\)/);
  assert.doesNotMatch(stylesSource, /\.mermaid\b/);
  assert.equal(indexSource.match(/BYTEPREP_STANDALONE_STYLES/g)?.length, 1);
  assert.equal(indexSource.match(/BYTEPREP_STANDALONE_BUNDLE/g)?.length, 1);
  assert.ok(indexSource.includes(stylesSource), 'standalone 中的内联 CSS 必须与 styles.css 同步');
  assert.doesNotMatch(indexSource, /mermaid@|class="mermaid|type="module"/i);
});
