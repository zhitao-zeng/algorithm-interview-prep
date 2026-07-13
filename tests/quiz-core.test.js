import assert from 'node:assert/strict';
import test from 'node:test';
import { questions } from '../questions.js';
import { validateQuestionCard } from '../quiz-core.js';

test('现有 60 道题均通过基础内容校验', () => {
  assert.equal(questions.length, 60);

  for (const question of questions) {
    assert.equal(validateQuestionCard(question).valid, true, question.title);
  }
});
