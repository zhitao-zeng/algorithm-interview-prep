import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { questions } from '../questions.js';
import { detailSections, validateQuestionCard } from '../quiz-core.js';
import { readFileSync } from 'node:fs';

const beginnerFixture = {
  id: 'fixture',
  title: '样例',
  prompt: '样例题',
  quickAnswer: '答案',
  beginnerSummary: '从最小输入开始理解。',
  prerequisites: ['概念 A', '概念 B'],
  workedExample: ['先处理输入。', '再得到输出。'],
  derivation: ['发现规律。', '应用规律。'],
  code: 'def solve(items):\n    return items',
  lineByLine: ['定义函数接收输入。', '返回计算结果。', '调用者获得输出。'],
  complexity: '时间 O(1)，空间 O(1)',
  edgeCases: ['空输入', '单个输入', '重复输入'],
  followUps: [
    { question: '为什么这样做？', answer: '因为样例的目标是展示问答结构。' },
    { question: '复杂度是多少？', answer: '这个最小样例为 O(1)。' },
  ],
  pitfalls: ['遗漏边界', '误解输入'],
};

test('现有 60 道题均通过基础内容校验', () => {
  assert.equal(questions.length, 87);

  for (const question of questions) {
    assert.equal(validateQuestionCard(question).valid, true, question.title);
  }
});

test('初学者卡片满足学习内容契约', () => {
  assert.equal(validateQuestionCard(beginnerFixture, { beginner: true }).valid, true);

  for (const followUp of beginnerFixture.followUps) {
    assert.equal(typeof followUp.question, 'string');
    assert.notEqual(followUp.question.trim(), '');
    assert.equal(typeof followUp.answer, 'string');
    assert.notEqual(followUp.answer.trim(), '');
  }
});

test('默认校验接受迁移后的问答对象', () => {
  assert.equal(validateQuestionCard(beginnerFixture).valid, true);
});

test('默认校验仍接受旧版字符串追问', () => {
  const legacyFixture = {
    ...beginnerFixture,
    followUps: ['为什么这样做？', '复杂度是多少？'],
  };

  assert.equal(validateQuestionCard(legacyFixture).valid, true);
});

test('链表与二叉树第一批题卡满足完整初学者学习契约', () => {
  const ids = new Set([
    '206', '92', '23', '146', '21', '25', '141', '142', '160',
    '102', '103', '105', '124', '297', '331', '236',
  ]);
  const cards = questions.filter((question) => ids.has(question.id));

  assert.equal(cards.length, ids.size);
  for (const id of ids) {
    assert.equal(questions.filter((question) => question.id === id).length, 1, `题目 ${id} 应只出现一次`);
  }
  for (const question of cards) {
    assert.equal(validateQuestionCard(question, { beginner: true }).valid, true, question.title);
    assert.match(question.code, /def |class |from |import /, `${question.title} 应提供完整 Python 代码`);
    assert.ok(question.lineByLine.length >= 3, `${question.title} 应至少有三段逐行讲解`);
    assert.ok(question.workedExample.length >= 2, `${question.title} 应至少有两步演练`);
  }
});

test('树题代码处理空树并以线性方式序列化', () => {
  const maxPath = questions.find((question) => question.id === '124');
  const codec = questions.find((question) => question.id === '297');

  assert.match(maxPath.code, /if not root:\n        return 0/);
  assert.match(codec.code, /parts = \[\]/);
  assert.match(codec.code, /parts\.append\(/);
  assert.match(codec.code, /","\.join\(parts\)/);
});

test('数组窗口与二分 TopK 第二批题卡满足完整初学者学习契约', () => {
  const ids = new Set(['3', '1', '42', '128', '239', '334', '33', '153', '347', '4', '215']);
  const cards = questions.filter((question) => ids.has(question.id));

  assert.equal(cards.length, ids.size);
  for (const question of cards) {
    assert.equal(validateQuestionCard(question, { beginner: true }).valid, true, question.title);
    assert.match(question.code, /def |class |from |import /, `${question.title} 应提供完整 Python 代码`);
    assert.ok(question.lineByLine.length >= 3, `${question.title} 应至少有三段逐行讲解`);
    assert.ok(question.workedExample.length >= 2, `${question.title} 应至少有两步演练`);
  }
});

test('数组窗口与二分 TopK 代码行为覆盖关键边界', () => {
  const runPython = (id, assertions) => {
    const code = questions.find((question) => question.id === id).code;
    const result = spawnSync('python3', ['-c', `${code}\n${assertions}`], { encoding: 'utf8' });
    assert.equal(result.status, 0, `${id} Python 行为回归失败：${result.stderr}`);
  };

  runPython('334', 'assert increasing_triplet([2, 1, 5, 0, 4, 6]) is True');
  runPython('239', 'assert max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3) == [3, 3, 5, 5, 6, 7]');
  runPython('3', 'assert length_of_longest_substring("") == 0');
  runPython('42', 'assert trap([]) == 0');
  runPython('4', 'assert find_median_sorted_arrays([], []) is None');
  runPython('215', 'assert find_kth_largest([], 1) is None');

  const triplet = questions.find((question) => question.id === '334');
  const window = questions.find((question) => question.id === '239');
  assert.match(triplet.followUps[0].answer, /历史扫描中仍可证明存在/);
  assert.match(window.workedExample[1], /\[-1,-3,5\]/);
});

test('搜索图与动态规划第三批题卡满足完整初学者学习契约', () => {
  const ids = new Set(['46', '78', '39', '79', '994', '200', '53', '121', '198', '55', '1143', '139', '416', '72']);
  const cards = questions.filter((question) => ids.has(question.id));
  assert.equal(cards.length, ids.size);
  for (const id of ids) {
    assert.equal(questions.filter((question) => question.id === id).length, 1, `题目 ${id} 应只出现一次`);
  }
  for (const question of cards) {
    assert.equal(validateQuestionCard(question, { beginner: true }).valid, true, question.title);
    assert.match(question.code, /def |class |from |import /, `${question.title} 应提供完整 Python 代码`);
    assert.ok(question.lineByLine.length >= 3, `${question.title} 应至少有三段逐行讲解`);
    assert.ok(question.workedExample.length >= 2, `${question.title} 应至少有两步演练`);
  }
});

test('快速详情按初学者学习顺序展示', () => {
  assert.deepEqual(
    detailSections(beginnerFixture, 'quick').map((section) => section.key),
    ['beginnerSummary', 'diagram', 'code', 'complexity', 'followUps', 'pitfalls'],
  );
});

test('深入详情按分步学习顺序返回全部渲染类型', () => {
  const sections = detailSections(beginnerFixture, 'deep');
  assert.deepEqual(
    sections.map((section) => section.type),
    ['text', 'diagram', 'concepts', 'steps', 'steps', 'code', 'lineNotes', 'text', 'cards', 'qa', 'list'],
  );
  assert.deepEqual(
    sections.map((section) => Array.isArray(section.value)),
    [false, false, true, true, true, false, true, false, true, true, true],
  );
  // 复习模式应默认展开完整初学者内容；该断言在实现前应先失败。
  const appSource = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
  assert.match(appSource, /detailLevel:\s*'deep'/);
});

test('模拟模式切题入口统一重置揭晓进度', () => {
  const appSource = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
  assert.match(appSource, /function selectQuestion\(id\)/);
  assert.match(appSource, /selectQuestion\(filterQuestions\(questions, category, state\.query\)\[0\]\?\.id\)/);
  assert.match(appSource, /selectQuestion\(filterQuestions\(questions, state\.category, state\.query\)\[0\]\?\.id\)/);
  assert.match(appSource, /state\.revealIndex = 0/);
});

test('第三批题卡的示例类型与复杂度说明一致', () => {
  const islands = questions.find((question) => question.id === '200');
  assert.match(islands.workedExample[0], /['"]1['"]/);
  const run = spawnSync('python3', ['-c', `${islands.code}\nassert num_islands([['1','1','0'],['0','1','0'],['0','0','1']]) == 2`], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);

  const wordBreak = questions.find((question) => question.id === '139');
  assert.match(wordBreak.code, /max_word_len/);
  assert.match(wordBreak.complexity, /O\(n·L²\)/);

  const oranges = questions.find((question) => question.id === '994');
  assert.match(oranges.workedExample[0], /一个/);
  const maxSubArray = questions.find((question) => question.id === '53');
  assert.match(maxSubArray.workedExample[1], /-2\+4=2/);
  assert.doesNotMatch(maxSubArray.code, /nums\[1:\]/);
});

test('模型手写与 ASR 专项题卡满足完整初学者学习契约', () => {
  const ids = new Set([
    'cross-entropy', 'bce', 'batchnorm', 'dropout', 'positional-encoding',
    'topk-sampling', 'beam-search', 'kmeans', 'iou', 'nms', 'convolution',
    'attention', 'rmsnorm', 'conv1d', 'ctc-greedy', 'ctc-prefix-beam',
    'rnnt', 'rnnt-greedy', 'streaming-cache',
  ]);
  const cards = questions.filter((question) => ids.has(question.id));

  assert.equal(cards.length, ids.size);
  for (const id of ids) {
    assert.equal(questions.filter((question) => question.id === id).length, 1, `题目 ${id} 应只出现一次`);
  }
  for (const question of cards) {
    assert.equal(validateQuestionCard(question, { beginner: true }).valid, true, question.title);
    assert.match(question.code, /def |class |from |import /, `${question.title} 应提供完整 Python 代码`);
    assert.ok(question.lineByLine.length >= 3, `${question.title} 应至少有三段逐行讲解`);
    assert.ok(question.workedExample.length >= 2, `${question.title} 应至少有两步演练`);
    assert.ok(question.followUps.every((followUp) => typeof followUp === 'object' && followUp.answer), `${question.title} 追问必须带完整答案对象`);
  }
});

test('CTC prefix beam 正确处理 blank 分隔的重复 token', () => {
  const card = questions.find((question) => question.id === 'ctc-prefix-beam');
  const assertion = `
import math
scores = [[math.log(0.05), math.log(0.9)], [math.log(0.9), math.log(0.05)], [math.log(0.05), math.log(0.9)]]
assert ctc_prefix_beam(scores, 0, beam_size=3) == [1, 1]
`;
  const result = spawnSync('python3', ['-c', `${card.code}\n${assertion}`], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

test('模型题卡声明关键输入边界与复杂度', () => {
  const beam = questions.find((question) => question.id === 'beam-search');
  assert.match(beam.complexity, /log V/);
  assert.match(beam.code, /beam_size <= 0|beam_size<=0/);
  assert.match(beam.code, /finished/);
  const ctc = questions.find((question) => question.id === 'ctc-prefix-beam');
  assert.match(ctc.complexity, /log\(beam·V\)|log\(beam/);
  const kmeans = questions.find((question) => question.id === 'kmeans');
  assert.match(kmeans.code, /iterations <= 0|iterations<=0/);
  const conv = questions.find((question) => question.id === 'convolution');
  assert.match(conv.code, /kernel larger|kh > h\+2\*padding/);
  const stream = questions.find((question) => question.id === 'streaming-cache');
  assert.match(stream.code, /left_context < 0|left_context<0/);
  const ce = questions.find((question) => question.id === 'cross-entropy');
  assert.match(ce.code, /labels out of range|labels < 0/);
  const bce = questions.find((question) => question.id === 'bce');
  assert.match(bce.code, /targets must be in \[0,1\]|invalid reduction/);
  const topk = questions.find((question) => question.id === 'topk-sampling');
  assert.match(topk.code, /isfinite/);
  const rms = questions.find((question) => question.id === 'rmsnorm');
  assert.match(rms.code, /weight\.ndim|weight.shape\[0\]/);
  const rnnt = questions.find((question) => question.id === 'rnnt-greedy');
  assert.match(rnnt.code, /max_symbols_per_frame.*positive/);
  const nms = questions.find((question) => question.id === 'nms');
  assert.match(nms.code, /threshold must be in \[0,1\]/);
  assert.match(ctc.code, /len\(log_probs\) == 0/);
  assert.match(ce.code, /labels must be integers/);
  assert.match(ce.code, /logits.shape\[1\] == 0/);
});

test('语音大模型与 RL 后训练题卡满足完整初学者学习契约', () => {
  const ids = new Set([
    'speech-llm-pipeline', 'audio-encoder-adapter', 'semantic-vs-acoustic-token',
    'rvq', 'continuous-vs-discrete-speech', 'thinker-talker', 'full-duplex',
    'speech-training-stages', 'mdp-basics', 'value-q-advantage', 'bellman-qlearning',
    'policy-gradient', 'actor-critic', 'ppo', 'rlhf', 'grpo', 'sft-dpo-rlhf',
  ]);
  const cards = questions.filter((question) => ids.has(question.id));

  assert.equal(cards.length, ids.size);
  for (const id of ids) {
    assert.equal(questions.filter((question) => question.id === id).length, 1, `题目 ${id} 应只出现一次`);
  }
  for (const question of cards) {
    assert.equal(validateQuestionCard(question, { beginner: true }).valid, true, question.title);
    assert.match(question.code, /def |class |from |import /, `${question.title} 应提供完整 Python 代码`);
    assert.ok(question.lineByLine.length >= 3, `${question.title} 应至少有三段逐行讲解`);
    assert.ok(question.workedExample.length >= 2, `${question.title} 应至少有两步演练`);
    assert.ok(question.followUps.every((followUp) => typeof followUp === 'object' && followUp.answer), `${question.title} 追问必须带完整答案对象`);
  }
});

test('大模型推理原理题卡满足完整初学者学习契约', () => {
  const ids = new Set([
    'inf-why-slow', 'inf-transformer-compute', 'inf-prefill-decode',
    'inf-prefill-compute-bound', 'inf-first-token-slow', 'inf-ttft-tpot',
    'inf-batch-throughput', 'inf-gpu-util-low', 'inf-arithmetic-intensity',
    'inf-compute-vs-memory-bound',
  ]);
  const cards = questions.filter((question) => ids.has(question.id));

  assert.equal(cards.length, ids.size);
  for (const id of ids) {
    assert.equal(questions.filter((question) => question.id === id).length, 1, `题目 ${id} 应只出现一次`);
  }
  for (const question of cards) {
    assert.equal(validateQuestionCard(question, { beginner: true }).valid, true, question.title);
    assert.match(question.code, /def |class |from |import /, `${question.title} 应提供完整 Python 代码`);
    assert.ok(question.lineByLine.length >= 3, `${question.title} 应至少有三段逐行讲解`);
    assert.ok(question.workedExample.length >= 2, `${question.title} 应至少有两步演练`);
    assert.ok(question.followUps.every((followUp) => typeof followUp === 'object' && followUp.answer), `${question.title} 追问必须带完整答案对象`);
  }
});

test('GitHub Pages 工作流声明正确的部署步骤', () => {
  const workflow = readFileSync(new URL('../.github/workflows/deploy-pages.yml', import.meta.url), 'utf8');
  assert.match(workflow, /branches:\s*\[main\]/);
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v3/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});
