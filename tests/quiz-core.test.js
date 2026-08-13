import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { questions } from '../questions.js';
import { detailSections, validateQuestionCard } from '../quiz-core.js';
import { categoryThread, domains } from '../knowledge-map.js';
import { resumeGlossarySize } from '../cards/_resume-glossary.js';
import { resumeGroundingCounts } from '../cards/_resume-grounding.js';
import { speechPrerequisiteExplanation, speechTeachingCategoryCount } from '../cards/_speech-teaching.js';
import { readFileSync } from 'node:fs';

const beginnerFixture = {
  id: 'fixture',
  kind: 'code',
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

test('现有题卡均通过基础内容校验', () => {
  assert.equal(questions.length, 841);

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

test('每张题卡都有合法 kind 且通过自身 kind 校验', () => {
  for (const q of questions) {
    assert.ok(q.kind === 'code' || q.kind === 'concept', `kind 非法: ${q.id} = ${q.kind}`);
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, `${q.id} (${q.kind}) 应仍满足初学者契约`);
  }
});

test('kind 分布与分类映射一致', () => {
  const codeCats = new Set(['链表', '二叉树', '数组/窗口', '二分/TopK', '搜索/图', '动态规划', '模型手写', 'ASR 专项', 'OCR 文字检测与识别', '单目深度与障碍物感知']);
  for (const q of questions) {
    const resumeConcept = /^(?:asr|tts|edge|perf|lead)-resume-/.test(q.id);
    const expect = codeCats.has(q.category) && !resumeConcept ? 'code' : 'concept';
    assert.equal(q.kind, expect, `题目 ${q.id}（分类 ${q.category}）应为 ${expect}，实际 ${q.kind}`);
  }
  assert.equal(questions.filter((q) => q.kind === 'code').length, 143, '代码题数量');
  assert.equal(questions.filter((q) => q.kind === 'concept').length, 698, '概念题数量');
});

test('TTS 语音合成拥有独立导航、知识主线与完整题目入口', () => {
  const ttsQuestions = questions.filter((q) => q.category === '语音合成');
  const speechDomain = domains.find((domain) => domain.name === '多模态与语音');
  const ttsCategory = speechDomain?.categories.find((category) => category.name === '语音合成');
  const appSource = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

  assert.equal(ttsQuestions.length, 28);
  assert.equal(ttsCategory?.label, 'TTS 语音合成');
  assert.ok(ttsCategory?.steps.length >= 6);
  assert.equal(categoryThread['语音合成'].steps.length, ttsCategory.steps.length);
  assert.match(appSource, /\['语音合成', 'TTS 语音合成'\]/);
  assert.match(appSource, /categoryLabel\(q\.category\)/);
});

test('简历专项新增 40 道题并按五条主线完整分布', () => {
  const groups = {
    asr: questions.filter((q) => q.id.startsWith('asr-resume-')),
    tts: questions.filter((q) => q.id.startsWith('tts-resume-')),
    edge: questions.filter((q) => q.id.startsWith('edge-resume-')),
    perf: questions.filter((q) => q.id.startsWith('perf-resume-')),
    lead: questions.filter((q) => q.id.startsWith('lead-resume-')),
  };
  assert.deepEqual(Object.fromEntries(Object.entries(groups).map(([key, cards]) => [key, cards.length])), {
    asr: 12, tts: 8, edge: 8, perf: 5, lead: 7,
  });
  const resumeCards = Object.values(groups).flat();
  assert.equal(resumeCards.length, 40);
  for (const card of resumeCards) {
    assert.equal(card.kind, 'concept', card.id);
    assert.equal(validateQuestionCard(card, { beginner: true }).valid, true, card.id);
    assert.equal(card.derivation.length, 4, card.id);
    assert.ok(card.edgeCases.length >= 3, card.id);
  }
  assert.deepEqual(groups.lead.map((card) => card.order), [1, 2, 3, 4, 5, 6, 7]);
  assert.ok(categoryThread['Tech Lead 与项目答辩'].steps.length >= 7);
});

test('40 道简历专项使用教学卡 V2，不再复制通用假代码与占位图', () => {
  const resumeCards = questions.filter((q) => /^(?:asr|tts|edge|perf|lead)-resume-/.test(q.id));
  assert.equal(resumeGlossarySize, 120);
  assert.deepEqual(resumeGroundingCounts, { direct: 21, supporting: 10, general: 9 });
  assert.equal(resumeCards.length, 40);
  assert.equal(new Set(resumeCards.map((q) => JSON.stringify(q.evidenceChain))).size, 40);

  for (const card of resumeCards) {
    assert.equal(card.resumeCard, true, card.id);
    assert.ok(['direct', 'supporting', 'general'].includes(card.experienceLevel), card.id);
    assert.ok(card.resumeSource.length >= 20, card.id);
    assert.ok(card.safeAnswer.length >= 20, card.id);
    assert.ok(card.claimBoundary.length >= 20, card.id);
    assert.ok(card.technicalTitle.length >= 8, card.id);
    assert.ok(card.technicalPrompt.length >= 12, card.id);
    assert.equal('code' in card, false, `${card.id} 不应展示与主题无关的通用 Python`);
    assert.equal('lineByLine' in card, false, `${card.id} 不应保留通用逐行说明`);
    assert.equal('diagram' in card, false, `${card.id} 不应保留重复占位图`);
    assert.equal(card.interviewAnswer.length, 4, card.id);
    assert.equal(card.evidenceChain.length, 5, card.id);
    assert.equal(card.workedExample.length, 5, card.id);
    assert.ok(card.prerequisites.every((term) => term.includes('：') && term.length >= 24), card.id);
    assert.deepEqual(
      detailSections(card, 'deep').map((section) => section.key),
      ['beginnerSummary', 'resumeSource', 'safeAnswer', 'claimBoundary', 'technicalPrompt', 'interviewAnswer', 'prerequisites', 'evidenceChain', 'derivation', 'workedExample', 'comparison', 'complexity', 'edgeCases', 'followUps', 'pitfalls'],
      card.id,
    );
  }

  const directCards = resumeCards.filter((card) => card.experienceLevel === 'direct');
  assert.equal(directCards.length, 21);
  assert.ok(directCards.every((card) => card.prompt.startsWith('请按“项目问题')));
  assert.ok(directCards.every((card) => card.title.length <= 30), '真实项目卡标题应先口语化');

  const pseudoLabel = questions.find((q) => q.id === 'asr-resume-confidence-calibration');
  assert.equal(pseudoLabel.experienceLevel, 'direct');
  assert.match(pseudoLabel.title, /重标注结果怎么筛选和验证/);
  assert.match(pseudoLabel.safeAnswer, /抽样复听/);
  assert.doesNotMatch(JSON.stringify(pseudoLabel), /Platt|isotonic|ECE|coverage-risk|Brier/);
});

test('58 道语音主航道通用题升级为教学卡 V2，并诚实标注代码性质', () => {
  const speechCategories = new Set(['ASR 专项', '语音合成', '语音大模型']);
  const speechCards = questions.filter((q) => speechCategories.has(q.category) && !q.resumeCard);

  assert.equal(speechTeachingCategoryCount, 3);
  assert.deepEqual(
    Object.fromEntries([...speechCategories].map((category) => [category, speechCards.filter((q) => q.category === category).length])),
    { 'ASR 专项': 22, '语音合成': 20, '语音大模型': 16 },
  );
  assert.equal(speechCards.length, 58);
  for (const card of speechCards) {
    assert.equal(card.speechTeachingV2, true, card.id);
    assert.match(card.knowledgeBoundary, /知识补课卡/);
    assert.match(card.knowledgeBoundary, /不代表我亲自实现/);
    assert.equal(card.interviewAnswer.length, 4, card.id);
    assert.equal(card.conceptPath.length, 4, card.id);
    assert.ok(card.guidedExample.length >= 4, card.id);
    assert.ok(card.guidedExample[0].startsWith('示意案例·第 1 步：'), card.id);
    assert.ok(card.prerequisites.every((term) => term.includes('：') && term.length >= 24), card.id);
    assert.ok(card.prerequisites.every((term) => !term.includes('先明确这个概念')), card.id);
    assert.equal(detailSections(card, 'quick').some((section) => section.key === 'code'), false, card.id);
    assert.equal(validateQuestionCard(card, { beginner: true }).valid, true, card.id);
  }

  const executableCard = questions.find((q) => q.id === 'ctc-greedy');
  const illustrativeCard = questions.find((q) => q.id === 'as-conformer');
  assert.equal(executableCard.codeMode, 'executable');
  assert.equal(illustrativeCard.codeMode, 'illustrative');
  assert.equal(detailSections(executableCard, 'deep').find((section) => section.key === 'code').title, '可运行实现 / 核心代码');
  assert.equal(detailSections(illustrativeCard, 'deep').find((section) => section.key === 'code').title, '实现草图（用于理解，不保证可直接运行）');

  for (const term of ['正字法归一化', 'TTS 声学模型与声码器基础', '对话需要低延迟与可打断。']) {
    assert.ok(speechPrerequisiteExplanation(term), term);
  }

  const speechLlmCards = speechCards.filter((card) => card.category === '语音大模型');
  assert.equal(new Set(speechLlmCards.map((card) => card.title)).size, speechLlmCards.length, '语音大模型题目不应换标题重复讲同一件事');
  const auditedFields = ['quickAnswer', 'beginnerSummary', 'explanationFocus', 'approach', 'derivation', 'workedExample'];
  const auditedText = speechLlmCards.flatMap((card) => auditedFields.flatMap((field) => Array.isArray(card[field]) ? card[field] : [card[field]])).join('\n');
  assert.doesNotMatch(auditedText, /0\.6703|0\.7648|zero-shot 达 72%|10k 小时|WER 从 8% 降到 4%/);
  assert.match(questions.find((q) => q.id === 'rvq').quickAnswer, /不是“从语义到声学的分层”/);
  assert.match(questions.find((q) => q.id === 'thinker-talker').quickAnswer, /Qwen2\.5-Omni/);
  assert.match(questions.find((q) => q.id === 'full-duplex').quickAnswer, /支持打断不一定等于全双工/);
  assert.equal(detailSections(questions.find((q) => q.id === 'thinker-talker'), 'deep').some((section) => section.key === 'references'), true);
});

test('站点定位为个人长期面试系统并保留旧进度迁移', () => {
  const appSource = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
  const indexSource = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const mapSource = readFileSync(new URL('../knowledge-map.js', import.meta.url), 'utf8');

  assert.match(indexSource, /曾志涛的面试准备系统/);
  assert.match(indexSource, /PERSONAL INTERVIEW OS/);
  assert.doesNotMatch(indexSource, /面向字节算法/);
  assert.match(appSource, /mapTab:\s*'personal'/);
  assert.match(appSource, /const personalTracks = \[/);
  assert.match(appSource, /const resumeQuestions = questions\.filter\(isResumeQuestion\)/);
  assert.match(appSource, /resumeLevel:\s*'direct'/);
  assert.match(appSource, /question\.experienceLevel === state\.resumeLevel/);
  assert.match(appSource, /真实项目.*关联补课.*通用方法/s);
  assert.match(appSource, /zeng-interview-mastered-ids/);
  assert.match(appSource, /byte-interview-mastered-ids/);
  assert.match(appSource, /◎ 简历项目/);
  assert.doesNotMatch(mapSource, /岗位特性|【岗重】/);
});

test('detailSections 按 kind 返回不同板块（代码题捞回朴素做法/不变量，概念题捞回是什么/核心思路）', () => {
  const codeCard = questions.find((q) => q.id === '206');
  const conceptCard = questions.find((q) => q.kind === 'concept' && !q.resumeCard && !q.speechTeachingV2);
  const codeQuickKeys = detailSections(codeCard, 'quick').map((s) => s.key);
  const codeDeepKeys = detailSections(codeCard, 'deep').map((s) => s.key);
  const conceptQuickKeys = detailSections(conceptCard, 'quick').map((s) => s.key);
  const conceptDeepKeys = detailSections(conceptCard, 'deep').map((s) => s.key);
  assert.ok(codeQuickKeys.includes('bruteForce'), '代码题 quick 应含 朴素做法');
  assert.ok(codeDeepKeys.includes('invariant'), '代码题 deep 应含 循环不变量');
  assert.ok(codeDeepKeys.includes('walkthrough'), '代码题 deep 应含 执行追踪');
  assert.ok(conceptQuickKeys.includes('explanationFocus'), '概念题 quick 应含 是什么');
  assert.ok(conceptQuickKeys.includes('approach'), '概念题 quick 应含 核心思路');
  assert.ok(conceptDeepKeys.includes('complexity'), '概念题 deep 应展示公式与复杂度');
  assert.ok(!conceptDeepKeys.includes('invariant'), '概念题 deep 不应含 循环不变量');
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
    ['beginnerSummary', 'diagram', 'code', 'bruteForce', 'complexity', 'followUps', 'pitfalls'],
  );
});

test('深入详情按分步学习顺序返回全部渲染类型', () => {
  const sections = detailSections(beginnerFixture, 'deep');
  assert.deepEqual(
    sections.map((section) => section.type),
    ['text', 'diagram', 'concepts', 'text', 'steps', 'steps', 'code', 'lineNotes', 'text', 'text', 'cards', 'qa', 'list'],
  );
  assert.deepEqual(
    sections.map((section) => Array.isArray(section.value)),
    [false, false, true, false, true, true, false, true, false, false, true, true, true],
  );
  // 复习模式先给容易理解的快速层；模拟面试仍会自动进入深入层。
  const appSource = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
  assert.match(appSource, /mode:\s*'review'[\s\S]*detailLevel:\s*'quick'/);
  assert.match(appSource, /function startMock\(\)[\s\S]*state\.detailLevel = 'deep'/);
});

test('模拟模式切题入口统一重置揭晓进度', () => {
  const appSource = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
  assert.match(appSource, /function selectQuestion\(id\)/);
  assert.match(appSource, /selectQuestion\(filterQuestions\(questions, category, state\.query(?:, state\.kind)?\)\[0\]\?\.id\)/);
  assert.match(appSource, /selectQuestion\(activeQuestions\(\)\[0\]\?\.id\)/);
  assert.match(appSource, /state\.revealIndex = 0/);
});

test('移动端先展示详情，切题后把用户带回详情区', () => {
  const appSource = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
  const stylesSource = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(stylesSource, /@media\s*\(max-width:\s*920px\)[\s\S]*\.app-shell\s*\{[^}]*display\s*:\s*flex/);
  assert.match(stylesSource, /@media\s*\(max-width:\s*920px\)[\s\S]*\.detail-pane\s*\{[^}]*order\s*:\s*1/);
  assert.match(stylesSource, /@media\s*\(max-width:\s*920px\)[\s\S]*\.question-pane\s*\{[^}]*order\s*:\s*2/);
  assert.match(appSource, /function scrollToMobileDetail\(\)/);
  assert.match(appSource, /scrollIntoView\(\{ behavior: 'smooth', block: 'start' \}\)/);
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

test('KV Cache 题卡满足完整初学者学习契约', () => {
  const ids = new Set([
    'kv-what', 'kv-why', 'kv-without', 'kv-memory', 'kv-size-factors',
    'kv-grows-with-context', 'kv-grows-with-batch', 'kv-mha-mqa-gqa',
    'kv-gqa-saves', 'kv-quantizable', 'kv-quant-loss', 'kv-prefix-cache',
    'kv-shared-prefix',
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

// ---- 子 Agent 批量新增模块校验 (auto-generated) ----
test('子Agent模块【Continuous Batching】全部题卡通过初学者契约', () => {
  const ids = new Set(["cb-what","cb-why-needed","cb-static-problems","cb-release-slot","cb-iteration-scheduling","cb-padding-waste","cb-throughput-compare","cb-kv-dynamic","cb-preemption","cb-metrics","cb-pagedattention","cb-implementation-pitfalls","cb-load-balance","cb-vllm","cb-trt-llm"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 15, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});

test('子Agent模块【PagedAttention】全部题卡通过初学者契约', () => {
  const ids = new Set(["pa-what","pa-why-fragment","pa-os-paging","pa-block-alloc","pa-block-table","pa-attention-adapt","pa-fragment-reduction","pa-continuous-batching","pa-cow-prefix","pa-block-size","pa-eval","pa-vllm-impl"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 12, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});

test('子Agent模块【量化推理】全部题卡通过初学者契约', () => {
  const ids = new Set(["quant-what","quant-ptq-vs-qat","quant-int8-sym-asym","quant-int4-gptq","quant-int4-awq","quant-fp8","quant-weight-act-kv","quant-granularity","quant-outlier-smoothquant","quant-mixed-precision","quant-dequant-qmm","quant-eval-accuracy","quant-hardware","quant-speedup","quant-calibration","quant-dynamic-vs-static","quant-w4a16-equivalence","quant-deploy-pitfalls"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 18, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});

test('子Agent模块【服务性能评测】全部题卡通过初学者契约', () => {
  const ids = new Set(["perf-why-eval","perf-ttft-tpot-tps","perf-throughput-vs-latency","perf-qps-concurrency","perf-vram","perf-e2e-decomp","perf-load-tools","perf-percentiles","perf-saturation-capacity","perf-batch-size","perf-long-context","perf-streaming","perf-sla","perf-cold-start","perf-gpu-util","perf-cost","perf-framework-bench","perf-traps","perf-script-design","perf-monitor-vs-offline"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 20, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});

test('子Agent模块【多GPU并行】全部题卡通过初学者契约', () => {
  const ids = new Set(["mgpu-why-multi","mgpu-dp","mgpu-tp","mgpu-pp","mgpu-sp","mgpu-tp-matmul","mgpu-tp-comm","mgpu-pp-bubble","mgpu-pp-1f1b","mgpu-ep","mgpu-zero","mgpu-comm-compare","mgpu-tp-infer","mgpu-nccl","mgpu-strategy"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 15, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});

test('子Agent模块【ONNX/TensorRT】全部题卡通过初学者契约', () => {
  const ids = new Set(["onnx-what","onnx-opset-fusion","onnx-export-issues","onnx-trt-what","onnx-trt-optimizations","onnx-trt-fp16-int8","onnx-trt-build-engine","onnx-trt-dynamic-shape","onnx-trt-plugin","onnx-to-trt","onnx-trt-int8-calibration","onnx-trt-latency-compare","onnx-graph-optimization","onnx-qat-to-trt-int8","onnx-multi-framework","onnx-deployment-pitfalls","onnx-trt-llm-intro","onnx-dynamic-batch-shape","onnx-evaluate-trt-speedup","onnx-trt-deploy-best-practice"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 20, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});

test('子Agent模块【多模态模型】全部题卡通过初学者契约', () => {
  const ids = new Set(["mm-architecture","mm-vit","mm-clip","mm-alignment","mm-fusion","mm-vistoken","mm-qformer","mm-mrope","mm-video-temporal","mm-pretrain","mm-preprocess","mm-sft","mm-hallucination","mm-hires","mm-multi-image","mm-benchmark","mm-latency","mm-deploy","mm-audio","mm-vs-unimodal"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 20, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});

test('子Agent模块【搜索推荐】全部题卡通过初学者契约', () => {
  const ids = new Set(["rec-system-arch","rec-recall","rec-pre-ranking","rec-ranking","rec-twotower","rec-ann","rec-multichannel","rec-feature","rec-din-deepfm","rec-seq","rec-ctr","rec-coldstart","rec-multiobjective","rec-rerank","rec-llm-rec","rec-realtime","rec-metrics","rec-recall-eval","rec-bias","rec-feature-store","rec-music-generation"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 21, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});

test('子Agent模块【Agent Workflow】全部题卡通过初学者契约', () => {
  const ids = new Set(["agent-what-is-agent","agent-react","agent-tool-calling","agent-planning","agent-memory","agent-reflection","agent-multi-agent","agent-orchestration","agent-state-machine","agent-error-retry","agent-context-mgmt","agent-prompt-eng","agent-rag-in-agent","agent-eval","agent-cost","agent-streaming","agent-security","agent-observability","agent-cot","agent-prod-deploy","agent-autonomous-vs-constrained","agent-planning-algo","agent-human-in-loop","agent-failure-modes","agent-rag-vs-finetune"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 25, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});

// ---- 大模型八股新增模块 (auto-generated) ----
test('子Agent模块【Transformer 架构】全部题卡通过初学者契约', () => {
  const ids = new Set(["arch-rope","arch-rope-vs-abs-rel","arch-swiglu","arch-preln-postln","arch-rmsnorm-layernorm","arch-flash-attention","arch-flash-vs-std","arch-mha-mqa-gqa-deep","arch-gqa-tradeoff","arch-rope-extrapolation","arch-pos-evolution","arch-kqv-projection","arch-causal-mask","arch-ffn-swiglu-relation","arch-preln-rmsnorm-combo","arch-attn-complexity","arch-relpos-other","arch-rope-multidim","arch-attn-vs-conv","arch-norm-placement"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 20, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});

test('子Agent模块【训练与微调】全部题卡通过初学者契约', () => {
  const ids = new Set(["train-scaling-laws-chinchilla","train-data-mixture","train-dedup","train-token-estimate","train-sft-data","train-sft-loss-mask","train-sft-mask-multiturn","train-lora-principle","train-lora-rank-alpha","train-qlora","train-lora-merge","train-catastrophic-forgetting","train-continual-learning","train-kd","train-kd-vs-rlhf","train-teacher-student","train-pretrain-ft-align","train-quality-vs-quantity","train-curriculum","train-overfit-regularization"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 20, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});

test('子Agent模块【RAG】全部题卡通过初学者契约', () => {
  const ids = new Set(["rag-001","rag-002","rag-003","rag-004","rag-005","rag-006","rag-007","rag-008","rag-009","rag-010","rag-011","rag-012","rag-013"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 13, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});

test('子Agent模块【长上下文与位置编码】全部题卡通过初学者契约', () => {
  const ids = new Set(["ctx-001","ctx-002","ctx-003","ctx-004","ctx-005","ctx-006","ctx-007","ctx-008","ctx-009"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 9, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});

test('子Agent模块【全栈 Agent（架构+工程+代码手撕）】全部题卡通过初学者契约', () => {
  const ids = new Set([
    "agent-computer-use","agent-multimodal","agent-a2a","agent-parallel-tools",
    "agent-guardrails-impl","agent-rl-optimize","agent-framework-compare",
    "agent-long-task-state","agent-eval-trajectory",
    "agent-code-react-loop","agent-code-tool-router","agent-code-memory-buffer",
    "agent-code-sse-stream","agent-code-agent-service",
  ]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 14, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, `${q.id} 应提供完整 Python 代码`);
    assert.ok(q.lineByLine.length >= 3, `${q.id} 应至少有三段逐行讲解`);
    assert.ok(q.workedExample.length >= 2, `${q.id} 应至少有两步演练`);
  }
});

test('子Agent模块【流式推理工程】全部题卡通过初学者契约', () => {
  const ids = new Set([
    "stream-speculative-decoding","stream-medusa-eagle","stream-tokenizer-streaming",
    "stream-ttft-optimize","stream-backpressure-cancel","stream-stop-criteria",
  ]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 6, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, `${q.id} 应提供完整 Python 代码`);
    assert.ok(q.lineByLine.length >= 2, `${q.id} 应至少有两段逐行讲解`);
    assert.ok(q.workedExample.length >= 2, `${q.id} 应至少有两步演练`);
  }
});

test('子Agent模块【分布式训练】全部题卡通过初学者契约', () => {
  const ids = new Set([
    "dt-zero-fsdp","dt-megatron-3d","dt-mixed-precision","dt-grad-checkpoint",
    "dt-flash-attn-bwd","dt-ring-attention","dt-moe-train","dt-overlap-bubble",
  ]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 8, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, `${q.id} 应提供完整 Python 代码`);
    assert.ok(q.lineByLine.length >= 2, `${q.id} 应至少有两段逐行讲解`);
    assert.ok(q.workedExample.length >= 2, `${q.id} 应至少有两步演练`);
  }
});

test('子Agent模块【系统设计】全部题卡通过初学者契约', () => {
  const ids = new Set([
    "sys-recsys-arch","sys-content-understanding","sys-inference-serving","sys-ab-platform",
    "sys-feature-pipeline","sys-vector-retrieval","sys-multimodal-serving","sys-streaming-etl","sys-capacity-limit",
    "sys-content-safety-compliance",
  ]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 10, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, `${q.id} 应提供完整 Python 代码`);
    assert.ok(q.lineByLine.length >= 2, `${q.id} 应至少有两段逐行讲解`);
    assert.ok(q.workedExample.length >= 2, `${q.id} 应至少有两步演练`);
  }
});

test('子Agent模块【生成式模型】全部题卡通过初学者契约', () => {
  const ids = new Set([
    "gen-diffusion-ddpm","gen-ddim","gen-classifier-free-guidance","gen-latent-diffusion",
    "gen-dit","gen-flow-matching","gen-video-diffusion","gen-autoregressive-video",
    "gen-controlnet","gen-ip-adapter","gen-diffusion-distill","gen-diffusion-lora",
    "gen-diffusion-eval","gen-aigc-product-stack",
  ]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 14, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, `${q.id} 应提供完整 Python 代码`);
    assert.ok(q.lineByLine.length >= 2, `${q.id} 应至少有两段逐行讲解`);
    assert.ok(q.workedExample.length >= 2, `${q.id} 应至少有两步演练`);
  }
});

test('子Agent模块【视觉与视频理解】全部题卡通过初学者契约', () => {
  const ids = new Set([
    "vis-object-detection","vis-detr","vis-segmentation-sam","vis-self-sup",
    "vis-video-backbone","vis-optical-flow","vis-3d-nerf","vis-gan-review",
    "vis-depth-3d","vis-visual-grounding","vis-data-engine","vis-augmentation",
    "vis-model-compress","vis-video-preprocess",
  ]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 14, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, `${q.id} 应提供完整 Python 代码`);
    assert.ok(q.lineByLine.length >= 2, `${q.id} 应至少有两段逐行讲解`);
    assert.ok(q.workedExample.length >= 2, `${q.id} 应至少有两步演练`);
  }
});

test('子Agent模块【搜索推荐·深化】全部题卡通过初学者契约', () => {
  const ids = new Set([
    "recd-multiobjective","recd-ee","recd-coldstart-adv","recd-listwise-rerank",
    "recd-generative-rec","recd-rl-rec","recd-shortvideo-signals","recd-bias-loop",
    "recd-real-time-feature","recd-graph-rec",
  ]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 10, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, `${q.id} 应提供完整 Python 代码`);
    assert.ok(q.lineByLine.length >= 2, `${q.id} 应至少有两段逐行讲解`);
    assert.ok(q.workedExample.length >= 2, `${q.id} 应至少有两步演练`);
  }
});

test('子Agent模块【多模态模型·深化】全部题卡通过初学者契约', () => {
  const ids = new Set([
    "mmd-unified-gen-understand","mmd-video-gen-understand","mmd-hallucination-bench",
    "mmd-data-engine","mmd-spatial-3d","mmd-mllm-agent","mmd-ocr-doc","mmd-audio-visual",
    "mmd-efficient-mllm","mmd-vlm-pretrain-adv",
  ]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 10, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, `${q.id} 应提供完整 Python 代码`);
    assert.ok(q.lineByLine.length >= 2, `${q.id} 应至少有两段逐行讲解`);
    assert.ok(q.workedExample.length >= 2, `${q.id} 应至少有两步演练`);
  }
});

test('子Agent模块【语音合成】全部题卡通过初学者契约', () => {
  const ids = new Set([
    "tts-tacotron","tts-vits","tts-hifigan","tts-streaming",
    "tts-llm-tts","tts-multilingual-emotion","tts-eval-prosody",
  ]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 7, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, `${q.id} 应提供完整 Python 代码`);
    assert.ok(q.lineByLine.length >= 2, `${q.id} 应至少有两段逐行讲解`);
    assert.ok(q.workedExample.length >= 2, `${q.id} 应至少有两步演练`);
  }
});

test('子Agent模块【计算机系统基础·深化】全部题卡通过初学者契约', () => {
  const ids = new Set([
    "cs-memory-layout","cs-io-multiplexing","cs-lock-free","cs-thread-pool",
    "cs-tcp-rpc","cs-consistent-hash","cs-lsm-btree","cs-cache",
    "cs-compile-link","cs-disk-io","cs-cpu-scheduling",
  ]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 11, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, `${q.id} 应提供完整 Python 代码`);
    assert.ok(q.lineByLine.length >= 2, `${q.id} 应至少有两段逐行讲解`);
    assert.ok(q.workedExample.length >= 2, `${q.id} 应至少有两步演练`);
  }
});

test('子Agent模块【系统设计·深化】全部题卡通过初学者契约', () => {
  const ids = new Set([
    "sysd-multimodal-feature-platform","sysd-model-version-ab","sysd-multi-region",
    "sysd-inference-cost","sysd-recsys-realtime-adv","sysd-observability","sysd-gpu-cluster",
  ]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 7, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, `${q.id} 应提供完整 Python 代码`);
    assert.ok(q.lineByLine.length >= 2, `${q.id} 应至少有两段逐行讲解`);
    assert.ok(q.workedExample.length >= 2, `${q.id} 应至少有两步演练`);
  }
});

test('子Agent模块【评测与对齐安全】全部题卡通过初学者契约', () => {
  const ids = new Set([
    "ev-mmlu","ev-subjective","ev-multimodal-eval","ev-hallucination-detect",
    "ev-redteam","ev-alignment-tax","ev-online-metrics","ev-benchmark-bias",
    "ev-safety-align","ev-eval-pipeline",
  ]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 10, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, `${q.id} 应提供完整 Python 代码`);
    assert.ok(q.lineByLine.length >= 2, `${q.id} 应至少有两段逐行讲解`);
    assert.ok(q.workedExample.length >= 2, `${q.id} 应至少有两步演练`);
  }
});

test('子Agent模块【多模态数据工程】全部题卡通过初学者契约', () => {
  const ids = new Set(["de-mixture-curriculum", "de-quality-filter", "de-dedup-minhash", "de-video-pipeline", "de-image-text-pair", "de-synthetic-caption", "de-compliance", "de-web-crawl", "de-task-balance", "de-poisoning", "de-data-scaling", "de-multimodal-align"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 12, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【视频生成】全部题卡通过初学者契约', () => {
  const ids = new Set(["vg-diffusion-arch", "vg-temporal", "vg-i2v-t2v", "vg-tokenizer-vae", "vg-causal-stream", "vg-fvd-eval", "vg-autoregressive", "vg-motion-control", "vg-long-video", "vg-latent-space"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 10, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【训练稳定性】全部题卡通过初学者契约', () => {
  const ids = new Set(["ts-loss-spike", "ts-grad-clip", "ts-bf16", "ts-oom-recompute", "ts-checkpoint", "ts-long-monitor", "ts-init", "ts-lr-schedule", "ts-dataloader-stall", "ts-straggler"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 10, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【数组窗口与二分TopK】全部题卡通过初学者契约', () => {
  const ids = new Set(["cz-sliding-window-max", "cz-two-sum", "cz-subarray-sum-k", "cz-merge-intervals", "cz-trap-rain", "cz-longest-no-repeat", "cz-min-cover-substr", "cz-max-product-subarray", "cb-binary-search", "cb-lower-upper-bound", "cb-search-rotated", "cb-find-peak", "cb-topk-heap", "cb-median-stream", "cb-kth-largest", "cb-sqrt-newton"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 16, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【树与链表】全部题卡通过初学者契约', () => {
  const ids = new Set(["bt-level-order", "bt-lca", "bt-validate-bst", "bt-path-sum", "bt-serialize", "bt-balanced", "bt-zigzag", "bt-kth-bst", "ll-reverse", "ll-detect-cycle", "ll-merge-sorted", "ll-intersection", "ll-add-two", "ll-remove-nth"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 14, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【搜索图与动态规划】全部题卡通过初学者契约', () => {
  const ids = new Set(["gr-dfs-cc", "gr-bfs-shortest", "gr-topo", "gr-union-find", "gr-dijkstra", "gr-mst-kruskal", "gr-num-islands", "gr-word-ladder", "dp-climb", "dp-knapsack-01", "dp-coin-change", "dp-lis", "dp-lcs", "dp-edit-distance", "dp-interval-schedule", "dp-grid-path"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 16, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【安全红队】全部题卡通过初学者契约', () => {
  const ids = new Set(["se-prompt-injection", "se-jailbreak", "se-safety-classifier", "se-reward-hacking", "se-output-filter", "se-data-leak", "se-adversarial", "se-defense-align", "se-tool-risk", "se-redteam-eval"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 10, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【推理芯片适配】全部题卡通过初学者契约', () => {
  const ids = new Set(["hw-npu-kernel", "hw-op-fusion", "hw-mixed-prec", "hw-cross-chip", "hw-quant-on-chip", "hw-benchmark", "hw-sparsity", "hw-memory-hierarchy"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 8, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【MoE架构】全部题卡通过初学者契约', () => {
  const ids = new Set(["me-load-balance", "me-expert-capacity", "me-topk-routing", "me-inference-comm", "me-fine-grained", "me-vs-dense"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 6, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【世界模型与多模态Agent】全部题卡通过初学者契约', () => {
  const ids = new Set(["wm-what-is", "wm-video-pred", "wm-embodied", "wm-sim2real", "ma-gui-agent", "ma-phone-agent", "ma-vision-action", "ma-perception-plan"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 8, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【合成数据与推理框架】全部题卡通过初学者契约', () => {
  const ids = new Set(["sy-spin", "sy-star", "sy-self-play", "sy-distill-data", "ir-vllm", "ir-sglang", "ir-trtllm", "ir-speculative", "ir-prefix-cache", "ir-disagg"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 10, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});


test('子Agent模块【世界模型】全部题卡通过初学者契约', () => {
  const ids = new Set(['wm-jepa','wm-genie','wm-dreamer','wm-rsm','wm-planet','wm-video-forecast','wm-embodied-rl','wm-sim-agent','wm-worldsim-bench','wm-llm-as-wm']);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 10, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【多模态Agent】全部题卡通过初学者契约', () => {
  const ids = new Set(['ma-appagent','ma-cogagent','ma-os-agent','ma-toolformer','ma-multi-agent','ma-reflection','ma-agent-eval','ma-a11y-agent','ma-planning-agent','ma-perception-foundation']);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 10, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【合成数据】全部题卡通过初学者契约', () => {
  const ids = new Set(['sy-evol-instruct','sy-self-instruct','sy-distill-reason','sy-llm-judge','sy-data-flywheel','sy-quality-filter-loop']);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 6, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【推理框架】全部题卡通过初学者契约', () => {
  const ids = new Set(['ir-paged-attn','ir-radix-attn','ir-continuous-batch','ir-chunked-prefill','ir-mla-deepseek','ir-cuda-graph','ir-microbatch','ir-quant-kernel','ir-tensor-parallel','ir-disagg-impl']);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 10, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【MoE 架构】全部题卡通过初学者契约', () => {
  const ids = new Set(['me-switch','me-st-moe','me-expert-choice','me-aux-loss','me-router-zloss','me-shared-expert','me-upcycling','me-moe-infer-batch']);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 8, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【安全红队】全部题卡通过初学者契约', () => {
  const ids = new Set(['se-toxicity','se-bias-fairness','se-hallucination-safety','se-membership-infer','se-backdoor','se-prompt-leak','se-multimodal-attack','se-guardrail']);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 8, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【推理芯片适配】全部题卡通过初学者契约', () => {
  const ids = new Set(['hw-ascend','hw-software-stack','hw-operator-reuse','hw-graph-compile','hw-async-pipeline','hw-hbm','hw-quant-int4','hw-utilization-opt']);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 8, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【评测与对齐安全】全部题卡通过初学者契约', () => {
  const ids = new Set(['ev-mmlu-pro','ev-gpqa','ev-mmmu','ev-reward-model-eval','ev-llm-judge-eval','ev-software-bench','ev-agent-bench','ev-data-contamination']);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 8, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【流式推理工程】全部题卡通过初学者契约', () => {
  const ids = new Set(['sr-ttft-arch','sr-sse-vs-ws','sr-prefill-stream','sr-kv-evict-stream','sr-speculative-stream','sr-client-backpressure','sr-streaming-rag','sr-cancel-resume']);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 8, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【ASR 专项】全部题卡通过初学者契约', () => {
  const ids = new Set(['as-conformer','as-streaming-asr','as-hotword','as-ctc-align','as-rnnt-pruning','as-whisper','as-asr-codec']);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 7, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【视频生成】全部题卡通过初学者契约', () => {
  const ids = new Set(['vg-sora-arch','vg-cogvideox','vg-stable-video','vg-vae-3d','vg-audio-video','vg-video-edit','vg-consistency-model','vg-motion-bucket']);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 8, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【多模态数据工程】全部题卡通过初学者契约', () => {
  const ids = new Set(['de-caption-reward','de-ocr-data','de-video-text-align','de-data-mix-strategy','de-pipeline-orchestration','de-quality-model']);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 6, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});


// ---- 简历补强批次模块校验 (auto-generated) ----
test('子Agent模块【ASR 专项(深化补强)】全部题卡通过初学者契约', () => {
  const ids = new Set(["asr-multilingual", "asr-channel-robustness", "asr-pseudo-label", "asr-domain-adaptation", "asr-lid", "asr-streaming", "asr-eval-metrics", "asr-architecture-compare", "asr-chinavoices", "asr-new-backbones"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 10, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});
test('子Agent模块【语音合成(深化补强)】全部题卡通过初学者契约', () => {
  const ids = new Set(["tts-g2p", "tts-frontend-prosody", "tts-fastspeech", "tts-matcha-melo", "tts-vocoder", "tts-dialect-finetune", "tts-onnx-deploy", "tts-stability", "tts-codeswitch", "tts-phoneme-prosody", "tts-emotion", "tts-eval", "tts-patent"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 13, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});
test('子Agent模块【语音大模型(深化补强)】全部题卡通过初学者契约', () => {
  const ids = new Set(["slm-pipeline", "slm-semantic-acoustic-token", "slm-streaming-duplex", "slm-thinker-talker", "slm-training-stages", "slm-continuous-discrete", "slm-embodied-judge", "slm-audio-encoder-adapter"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 8, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});
test('子Agent模块【OCR 文字检测与识别】全部题卡通过初学者契约', () => {
  const ids = new Set(["ocr-det-rec-decouple", "ocr-detection", "ocr-recognition", "ocr-ctc-attention", "ocr-iou-nlcs", "ocr-direction-cls", "ocr-multiline", "ocr-pp-ocrv6", "ocr-tensorrt-mnn", "ocr-scene-spotting", "ocr-data-synth", "ocr-refinement-fallback"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 12, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});
test('子Agent模块【单目深度与障碍物感知】全部题卡通过初学者契约', () => {
  const ids = new Set(["depth-mono-estimation", "depth-scale-ambiguity", "depth-relative-metric", "depth-obstacle", "depth-eval", "depth-vit", "depth-endside", "depth-fusion-seg"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 8, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});
test('子Agent模块【多模态生成应用】全部题卡通过初学者契约', () => {
  const ids = new Set(["gen-diffusion-vs-flow", "gen-lora", "gen-person-consistency", "gen-audio-video", "gen-lip-sync", "gen-music-planning", "gen-diversity-check", "gen-comfyui", "gen-image-studio", "gen-aigc-pipeline"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 10, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});
test('子Agent模块【LLM 约束生成与自动评测】全部题卡通过初学者契约', () => {
  const ids = new Set(["cg-factledger", "cg-schema-validator", "cg-repair-feedback", "cg-best-of-n", "cg-patch-optimize", "cg-semantic-guard", "cg-auto-eval", "cg-hallucination", "cg-constrained-decoding", "cg-eval-design", "cg-failure-feedback", "cg-llm-as-judge"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 12, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});
test('子Agent模块【因果推断与树模型】全部题卡通过初学者契约', () => {
  const ids = new Set(["ml-xgboost", "ml-causal", "ml-glm-trees", "ml-uplift", "ml-auc-eval", "ml-feature-eng"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 6, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
  }
});

test('子Agent模块【因果推断】全部题卡通过初学者契约', () => {
  const ids = new Set(["ci-potential-outcomes", "ci-rct", "ci-confounding", "ci-backdoor", "ci-ipw", "ci-matching", "ci-iv", "ci-did", "ci-rdd", "ci-uplift"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 10, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【推荐系统】全部题卡通过初学者契约', () => {
  const ids = new Set(["rs-cf", "rs-two-tower", "rs-recall-ranking", "rs-fm-deepfm", "rs-sequential", "rs-multi-task", "rs-cold-start", "rs-debias", "rs-rerank", "rs-ann"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 10, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【因果推断·第二批】全部题卡通过初学者契约', () => {
  const ids = new Set(["ci-propensity-score", "ci-mediation", "ci-front-door", "ci-sensitivity", "ci-learner-tsx", "ci-causal-forest", "ci-gcomputation", "ci-msm", "ci-panel-fe", "ci-selection"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 10, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});

test('子Agent模块【推荐系统·第二批】全部题卡通过初学者契约', () => {
  const ids = new Set(["rs-ctr", "rs-din", "rs-bpr", "rs-negative-sampling", "rs-graph", "rs-contrastive", "rs-multi-modal", "rs-bandit", "rs-eval", "rs-causal-rec"]);
  const matched = questions.filter((q) => ids.has(q.id));
  assert.equal(matched.length, 10, 'matched count');
  for (const q of matched) {
    assert.equal(validateQuestionCard(q, { beginner: true }).valid, true, q.id);
    assert.match(q.code, /def |class |from |import /, q.id + ' 应提供完整 Python 代码');
    assert.ok(q.lineByLine.length >= 3, q.id + ' 应至少有三段逐行讲解');
    assert.ok(q.workedExample.length >= 2, q.id + ' 应至少有两步演练');
  }
});
