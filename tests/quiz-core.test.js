import assert from 'node:assert/strict';
import test from 'node:test';
import { questions } from '../questions.js';
import { detailSections, validateQuestionCard } from '../quiz-core.js';

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
  assert.equal(questions.length, 60);

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

test('快速详情按初学者学习顺序展示', () => {
  assert.deepEqual(
    detailSections(beginnerFixture, 'quick').map((section) => section.key),
    ['beginnerSummary', 'code', 'complexity', 'followUps', 'pitfalls'],
  );
});
