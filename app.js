import { categories, questions } from './questions.js';
import { detailSections, filterQuestions, formatRemaining, getEmptyState, sampleQuestions } from './quiz-core.js';

const storageKey = 'byte-interview-mastered-ids';
const el = (id) => document.getElementById(id);
const state = {
  mode: 'review', category: '全部', query: '', selectedId: questions[0].id,
  mockQuestions: [], revealIndex: 0, detailLevel: 'deep', masteredIds: loadMastered(),
  remaining: 2700, timerId: null,
};

function loadMastered() { try { return new Set(JSON.parse(localStorage.getItem(storageKey) || '[]')); } catch { return new Set(); } }
function saveMastered() { try { localStorage.setItem(storageKey, JSON.stringify([...state.masteredIds])); } catch {} }
function activeQuestions() { return state.mode === 'mock' ? state.mockQuestions : filterQuestions(questions, state.category, state.query); }
function selectedQuestion() { return activeQuestions().find((q) => q.id === state.selectedId) || activeQuestions()[0]; }
function selectQuestion(id) {
  state.selectedId = id;
  state.revealIndex = 0;
  if (state.mode === 'review') state.detailLevel = 'deep';
}

function scrollToMobileDetail() {
  if (typeof window === 'undefined' || !window.matchMedia?.('(max-width: 920px)').matches) return;
  el('question-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderCategories() {
  el('category-list').replaceChildren(...categories.map((category) => {
    const button = document.createElement('button');
    button.className = `category ${state.category === category ? 'active' : ''}`;
    button.textContent = category;
    button.addEventListener('click', () => { state.category = category; selectQuestion(filterQuestions(questions, category, state.query)[0]?.id); render(); });
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
    const meta = document.createElement('div'); meta.className = 'card-meta';
    const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = q.category;
    const metaText = document.createElement('span'); metaText.textContent = `${q.difficulty} · ${q.id}`; meta.append(badge, metaText);
    const title = document.createElement('h3'); title.textContent = q.title;
    const prompt = document.createElement('p'); prompt.textContent = q.prompt;
    card.append(meta, title, prompt);
    card.addEventListener('click', () => {
      selectQuestion(q.id);
      render();
      scrollToMobileDetail();
    });
    return card;
  }));
}
function textSection(title, text) { const block = document.createElement('section'); block.className = 'detail-section'; const h = document.createElement('h3'); h.textContent = title; const p = document.createElement('p'); p.textContent = text; block.append(h, p); return block; }
function listSection(title, items, className = 'detail-list') { const block = document.createElement('section'); block.className = 'detail-section'; const h = document.createElement('h3'); h.textContent = title; const list = document.createElement('ul'); list.className = className; items.forEach((item) => { const li = document.createElement('li'); li.textContent = item; list.append(li); }); block.append(h, list); return block; }
function codeSection(title, code) { const block = document.createElement('section'); block.className = 'detail-section'; const h = document.createElement('h3'); h.textContent = title; const wrap = document.createElement('div'); wrap.className = 'code-wrap'; const pre = document.createElement('pre'); const codeEl = document.createElement('code'); codeEl.setAttribute('aria-label', title); codeEl.textContent = code; pre.append(codeEl); wrap.append(pre); block.append(h, wrap); return block; }
function diagramSection(title, diagram) {
  if (!diagram) return document.createDocumentFragment();
  const block = document.createElement('section'); block.className = 'detail-section';
  const h = document.createElement('h3'); h.textContent = title;
  const pre = document.createElement('pre'); pre.className = 'diagram-block'; pre.setAttribute('aria-label', title); pre.textContent = diagram;
  block.append(h, pre); return block;
}
function lineNotesSection(title, notes) {
  const block = document.createElement('section'); block.className = 'detail-section';
  const h = document.createElement('h3'); h.textContent = title;
  const list = document.createElement('ol'); list.className = 'line-notes';
  (Array.isArray(notes) ? notes : []).forEach((note, index) => {
    const li = document.createElement('li');
    const line = document.createElement('code'); line.textContent = `第 ${note?.line ?? index + 1} 行`;
    const explanation = document.createElement('span'); explanation.textContent = typeof note === 'string' ? note : (note?.explanation ?? note?.text ?? '');
    li.append(line, explanation); list.append(li);
  });
  block.append(h, list); return block;
}
function qaSection(title, entries) {
  const block = document.createElement('section'); block.className = 'detail-section qa-section';
  const h = document.createElement('h3'); h.textContent = title; block.append(h);
  (Array.isArray(entries) ? entries : []).forEach((entry) => {
    const details = document.createElement('details');
    const summary = document.createElement('summary'); summary.textContent = typeof entry === 'string' ? entry : (entry?.question ?? '追问');
    const answer = document.createElement('p'); answer.className = 'qa-answer'; answer.textContent = typeof entry === 'string' ? '请先自行组织答案，再对照题卡复盘。' : (entry?.answer ?? '');
    details.append(summary, answer); block.append(details);
  });
  return block;
}
function renderSection(section) {
  if (section.type === 'diagram') return diagramSection(section.title, section.value);
  if (section.type === 'code') return codeSection(section.title, section.value);
  if (section.type === 'lineNotes') return lineNotesSection(section.title, section.value);
  if (section.type === 'qa') return qaSection(section.title, section.value);
  if (section.type === 'concepts') return listSection(section.title, section.value, 'concept-list');
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
  const tags = document.createElement('div'); tags.className = 'tag-row';
  [[q.category, 'tag'], [q.difficulty, 'tag difficulty'], [`LC ${q.id}`, 'tag']].forEach(([value, className]) => { const tag = document.createElement('span'); tag.className = className; tag.textContent = value; tags.append(tag); });
  const title = document.createElement('h2'); title.textContent = q.title;
  const prompt = document.createElement('p'); prompt.textContent = q.prompt;
  head.append(tags, title, prompt); pane.append(head);
  const sections = detailSections(q, state.mode === 'mock' ? 'deep' : state.detailLevel);
  const visibleCount = state.mode === 'mock' ? state.revealIndex : sections.length;
  if (state.mode !== 'mock') pane.append(renderDetailLevelSwitch());
  pane.append(...sections.slice(0, visibleCount).map(renderSection));
  if (state.mode === 'mock') {
    const gate = document.createElement('div'); gate.className = 'reveal-controls';
    const message = document.createElement('p'); message.textContent = state.revealIndex ? `已揭晓 ${state.revealIndex} / ${sections.length} 段` : '先独立思考，再按学习顺序揭晓答案。'; gate.append(message);
    if (state.revealIndex < sections.length) {
      const btn = document.createElement('button'); btn.className = 'button primary'; btn.textContent = state.revealIndex ? '揭晓下一段' : '揭晓第一段';
      btn.addEventListener('click', () => { state.revealIndex += 1; renderDetail(); }); gate.append(btn);
    } else { const done = document.createElement('span'); done.className = 'reveal-complete'; done.textContent = '本题答案已全部揭晓'; gate.append(done); }
    pane.append(gate);
  }
  const row = document.createElement('div'); row.className = 'master-row'; const btn = document.createElement('button'); const done = state.masteredIds.has(q.id);
  btn.className = `button ${done ? 'mastered' : 'primary'}`; btn.textContent = done ? '✓ 已掌握（点击取消）' : '标记为已掌握';
  btn.addEventListener('click', () => { done ? state.masteredIds.delete(q.id) : state.masteredIds.add(q.id); saveMastered(); render(); }); row.append(btn); pane.append(row);
}
function renderMode() { const mock = state.mode === 'mock'; el('mode-label').textContent = mock ? 'MOCK INTERVIEW' : 'REVIEW MODE'; el('timer').hidden = !mock; el('start-mock').hidden = mock; el('return-review').hidden = !mock; el('mock-note').hidden = !mock; el('mock-note').textContent = mock ? `本轮共 ${state.mockQuestions.length} 题。答案默认隐藏；请先口述方案再揭晓。` : ''; }
function tick() { state.remaining = Math.max(0, state.remaining - 1); el('timer').textContent = formatRemaining(state.remaining); if (!state.remaining) { clearInterval(state.timerId); state.timerId = null; el('mock-note').textContent = '时间到。本轮结束，复盘每道题的边界、复杂度和追问。'; } }
function render() { renderMode(); renderCategories(); renderProgress(); renderList(); renderDetail(); el('timer').textContent = formatRemaining(state.remaining); }
function startMock() { state.mode = 'mock'; state.mockQuestions = sampleQuestions(questions, 5); state.selectedId = state.mockQuestions[0]?.id; state.revealIndex = 0; state.detailLevel = 'deep'; state.remaining = 2700; clearInterval(state.timerId); state.timerId = setInterval(tick, 1000); render(); }
function returnReview() { state.mode = 'review'; state.revealIndex = 0; state.detailLevel = 'deep'; clearInterval(state.timerId); state.timerId = null; state.selectedId = questions[0].id; render(); }
el('search-input').addEventListener('input', (event) => { state.query = event.target.value; selectQuestion(filterQuestions(questions, state.category, state.query)[0]?.id); render(); });
el('clear-search').addEventListener('click', () => { state.query = ''; state.category = '全部'; el('search-input').value = ''; selectQuestion(questions[0].id); render(); });
el('start-mock').addEventListener('click', startMock); el('return-review').addEventListener('click', returnReview); render();
