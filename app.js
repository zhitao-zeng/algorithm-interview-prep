import { categories, questions } from './questions.js';
import { detailSections, filterQuestions, formatRemaining, getEmptyState, sampleQuestions } from './quiz-core.js';

const storageKey = 'byte-interview-mastered-ids';
const el = (id) => document.getElementById(id);
const state = {
  mode: 'review', category: '全部', query: '', selectedId: questions[0].id,
  mockQuestions: [], revealed: true, detailLevel: 'quick', masteredIds: loadMastered(),
  remaining: 2700, timerId: null,
};

function loadMastered() { try { return new Set(JSON.parse(localStorage.getItem(storageKey) || '[]')); } catch { return new Set(); } }
function saveMastered() { try { localStorage.setItem(storageKey, JSON.stringify([...state.masteredIds])); } catch {} }
function activeQuestions() { return state.mode === 'mock' ? state.mockQuestions : filterQuestions(questions, state.category, state.query); }
function selectedQuestion() { return activeQuestions().find((q) => q.id === state.selectedId) || activeQuestions()[0]; }

function renderCategories() {
  el('category-list').replaceChildren(...categories.map((category) => {
    const button = document.createElement('button');
    button.className = `category ${state.category === category ? 'active' : ''}`;
    button.textContent = category;
    button.addEventListener('click', () => { state.category = category; state.selectedId = filterQuestions(questions, category, state.query)[0]?.id; render(); });
    return button;
  }));
}
function renderProgress() { const n = state.masteredIds.size; el('progress-count').textContent = `${n} / ${questions.length}`; el('progress-bar').style.width = `${Math.min(100, n / questions.length * 100)}%`; }
function renderList() {
  const items = activeQuestions(), empty = getEmptyState(items);
  el('question-list').hidden = empty.visible; el('empty-state').hidden = !empty.visible;
  el('result-count').textContent = `${items.length} 题`; el('list-title').textContent = state.mode === 'mock' ? '本轮题目' : state.category;
  if (empty.visible) return;
  el('question-list').replaceChildren(...items.map((q) => {
    const card = document.createElement('button'); card.className = `question-card ${q.id === selectedQuestion()?.id ? 'active' : ''}`;
    card.innerHTML = `<div class="card-meta"><span class="badge">${q.category}</span><span>${q.difficulty} · ${q.id}</span></div><h3>${q.title}</h3><p>${q.prompt}</p>`;
    card.addEventListener('click', () => { state.selectedId = q.id; state.revealed = state.mode !== 'mock'; state.detailLevel = 'quick'; render(); });
    return card;
  }));
}
function textSection(title, text) { const block = document.createElement('section'); block.className = 'detail-section'; const h = document.createElement('h3'); h.textContent = title; const p = document.createElement('p'); p.textContent = text; block.append(h, p); return block; }
function listSection(title, items, className = 'detail-list') { const block = document.createElement('section'); block.className = 'detail-section'; const h = document.createElement('h3'); h.textContent = title; const list = document.createElement('ul'); list.className = className; items.forEach((item) => { const li = document.createElement('li'); li.textContent = item; list.append(li); }); block.append(h, list); return block; }
function codeSection(title, code) { const block = document.createElement('section'); block.className = 'detail-section'; const h = document.createElement('h3'); h.textContent = title; const wrap = document.createElement('div'); wrap.className = 'code-wrap'; const pre = document.createElement('pre'); const codeEl = document.createElement('code'); codeEl.setAttribute('aria-label', title); codeEl.textContent = code; pre.append(codeEl); wrap.append(pre); block.append(h, wrap); return block; }
function renderSection(section) {
  if (section.type === 'code') return codeSection(section.title, section.value);
  if (section.type === 'list') return listSection(section.title, section.value);
  if (section.type === 'steps') return listSection(section.title, section.value, 'derivation-list');
  if (section.type === 'cards') return listSection(section.title, section.value, 'edge-case-list');
  return textSection(section.title, section.value);
}
function renderDetailLevelSwitch() {
  const group = document.createElement('div'); group.className = 'detail-level-switch'; group.setAttribute('role', 'group'); group.setAttribute('aria-label', '讲解层级');
  [['quick', '快速结论'], ['deep', '深入讲解']].forEach(([level, label]) => {
    const button = document.createElement('button'); button.className = `detail-level-button ${state.detailLevel === level ? 'active' : ''}`;
    button.textContent = label; button.setAttribute('aria-pressed', String(state.detailLevel === level));
    button.addEventListener('click', () => { state.detailLevel = level; renderDetail(); }); group.append(button);
  });
  return group;
}
function renderDetail() {
  const pane = el('question-detail'), q = selectedQuestion(); pane.replaceChildren();
  if (!q) { pane.textContent = '请选择一道题目'; return; }
  const head = document.createElement('header'); head.className = 'detail-head';
  head.innerHTML = `<div class="tag-row"><span class="tag">${q.category}</span><span class="tag difficulty">${q.difficulty}</span><span class="tag">LC ${q.id}</span></div><h2>${q.title}</h2><p>${q.prompt}</p>`; pane.append(head);
  if (state.mode === 'mock' && !state.revealed) {
    const gate = document.createElement('div'); gate.className = 'answer-gate'; const message = document.createElement('p'); message.textContent = '先独立思考，再查看标准答题框架。';
    const btn = document.createElement('button'); btn.className = 'button primary'; btn.textContent = '揭晓答案'; btn.addEventListener('click', () => { state.revealed = true; renderDetail(); }); gate.append(message, btn); pane.append(gate); return;
  }
  pane.append(renderDetailLevelSwitch(), ...detailSections(q, state.detailLevel).map(renderSection));
  const row = document.createElement('div'); row.className = 'master-row'; const btn = document.createElement('button'); const done = state.masteredIds.has(q.id);
  btn.className = `button ${done ? 'mastered' : 'primary'}`; btn.textContent = done ? '✓ 已掌握（点击取消）' : '标记为已掌握';
  btn.addEventListener('click', () => { done ? state.masteredIds.delete(q.id) : state.masteredIds.add(q.id); saveMastered(); render(); }); row.append(btn); pane.append(row);
}
function renderMode() { const mock = state.mode === 'mock'; el('mode-label').textContent = mock ? 'MOCK INTERVIEW' : 'REVIEW MODE'; el('timer').hidden = !mock; el('start-mock').hidden = mock; el('return-review').hidden = !mock; el('mock-note').hidden = !mock; el('mock-note').textContent = mock ? `本轮共 ${state.mockQuestions.length} 题。答案默认隐藏；请先口述方案再揭晓。` : ''; }
function tick() { state.remaining = Math.max(0, state.remaining - 1); el('timer').textContent = formatRemaining(state.remaining); if (!state.remaining) { clearInterval(state.timerId); state.timerId = null; el('mock-note').textContent = '时间到。本轮结束，复盘每道题的边界、复杂度和追问。'; } }
function render() { renderMode(); renderCategories(); renderProgress(); renderList(); renderDetail(); el('timer').textContent = formatRemaining(state.remaining); }
function startMock() { state.mode = 'mock'; state.mockQuestions = sampleQuestions(questions, 5); state.selectedId = state.mockQuestions[0]?.id; state.revealed = false; state.detailLevel = 'quick'; state.remaining = 2700; clearInterval(state.timerId); state.timerId = setInterval(tick, 1000); render(); }
function returnReview() { state.mode = 'review'; state.revealed = true; state.detailLevel = 'quick'; clearInterval(state.timerId); state.timerId = null; state.selectedId = questions[0].id; render(); }
el('search-input').addEventListener('input', (event) => { state.query = event.target.value; state.selectedId = filterQuestions(questions, state.category, state.query)[0]?.id; render(); });
el('clear-search').addEventListener('click', () => { state.query = ''; state.category = '全部'; el('search-input').value = ''; state.selectedId = questions[0].id; render(); });
el('start-mock').addEventListener('click', startMock); el('return-review').addEventListener('click', returnReview); render();
