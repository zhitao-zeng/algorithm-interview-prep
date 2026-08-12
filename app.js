import { categories, questions } from './questions.js?v=c4567533';
import { detailSections, filterQuestions, formatRemaining, getEmptyState, sampleQuestions } from './quiz-core.js';
import { domains, learningPath, crossLines, priorities, categoryThread } from './knowledge-map.js';

const storageKey = 'byte-interview-mastered-ids';
const el = (id) => document.getElementById(id);
const state = {
  mode: 'review', view: 'map', mapTab: 'domains', category: '全部', query: '', kind: '全部', selectedId: questions[0].id,
  mockQuestions: [], revealIndex: 0, detailLevel: 'deep', masteredIds: loadMastered(),
  remaining: 2700, timerId: null,
};

function loadMastered() { try { return new Set(JSON.parse(localStorage.getItem(storageKey) || '[]')); } catch { return new Set(); } }
function saveMastered() { try { localStorage.setItem(storageKey, JSON.stringify([...state.masteredIds])); } catch {} }
function activeQuestions() { return state.mode === 'mock' ? state.mockQuestions : filterQuestions(questions, state.category, state.query, state.kind); }
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

function navButton(label, active, onClick, extraClass = '') {
  const button = document.createElement('button');
  button.className = `category ${extraClass} ${active ? 'active' : ''}`.trim();
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}
function renderCategories() {
  const host = el('category-list');
  const buttons = [];
  // 前置导航：知识脉络（地图视图）/ 全部题目
  buttons.push(navButton('🗺 知识脉络', state.view === 'map', () => { state.view = 'map'; render(); }, 'nav-lead'));
  buttons.push(navButton('全部题目', state.view === 'list' && state.category === '全部', () => {
    state.view = 'list'; state.category = '全部';
    selectQuestion(filterQuestions(questions, '全部', state.query, state.kind)[0]?.id); render();
  }, 'nav-lead'));
  // 真实分类（排除内置的「全部」）
  categories.filter((c) => c !== '全部').forEach((category) => {
    buttons.push(navButton(category, state.view === 'list' && state.category === category, () => {
      state.view = 'list'; state.category = category;
      selectQuestion(filterQuestions(questions, category, state.query, state.kind)[0]?.id); render();
    }));
  });
  host.replaceChildren(...buttons);
}
function renderProgress() { const n = state.masteredIds.size; el('progress-count').textContent = `${n} / ${questions.length}`; el('progress-bar').style.width = `${Math.min(100, n / questions.length * 100)}%`; }
function renderKindSwitch() {
  const host = el('kind-list');
  if (!host) return;
  const options = [['全部', '全部'], ['code', '代码题'], ['concept', '概念题']];
  host.replaceChildren(...options.map(([value, label]) => {
    const button = document.createElement('button');
    button.className = `detail-level-button ${state.kind === value ? 'active' : ''}`;
    button.textContent = label;
    button.addEventListener('click', () => { state.kind = value; selectQuestion(filterQuestions(questions, state.category, state.query, state.kind)[0]?.id); render(); });
    return button;
  }));
}
function renderList() {
  const items = activeQuestions(), empty = getEmptyState(items);
  el('question-list').hidden = empty.visible; el('empty-state').hidden = !empty.visible;
  el('result-count').textContent = `${items.length} 题`; el('list-title').textContent = state.mode === 'mock' ? '本轮题目' : state.category;
  if (empty.visible) return;
  el('question-list').replaceChildren(...items.map((q) => {
    const card = document.createElement('button'); card.className = `question-card ${q.id === selectedQuestion()?.id ? 'active' : ''}`;
    const meta = document.createElement('div'); meta.className = 'card-meta';
    const kindBadge = document.createElement('span'); kindBadge.className = 'badge'; kindBadge.textContent = q.kind === 'code' ? '代码' : '概念';
    const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = q.category;
    const metaText = document.createElement('span'); metaText.textContent = `${q.difficulty} · ${q.id}`; meta.append(kindBadge, badge, metaText);
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
function compareSection(title, items) {
  if (!Array.isArray(items) || items.length === 0) return document.createDocumentFragment();
  const block = document.createElement('section'); block.className = 'detail-section';
  const h = document.createElement('h3'); h.textContent = title; block.append(h);
  const list = document.createElement('ul'); list.className = 'detail-list';
  items.forEach((row) => {
    const li = document.createElement('li');
    li.textContent = typeof row === 'string' ? row : `${row?.a ?? ''} vs ${row?.b ?? ''}：${row?.note ?? ''}`;
    list.append(li);
  });
  block.append(list); return block;
}
function refsSection(title, items) {
  if (!Array.isArray(items) || items.length === 0) return document.createDocumentFragment();
  const block = document.createElement('section'); block.className = 'detail-section';
  const h = document.createElement('h3'); h.textContent = title; block.append(h);
  const list = document.createElement('ul'); list.className = 'detail-list';
  items.forEach((reference) => {
    const li = document.createElement('li');
    const anchor = document.createElement('a');
    if (typeof reference === 'string') { anchor.textContent = reference; anchor.href = '#'; }
    else { anchor.textContent = reference.title; anchor.href = reference.url || '#'; anchor.target = '_blank'; anchor.rel = 'noopener'; }
    li.append(anchor); list.append(li);
  });
  block.append(list); return block;
}
function renderSection(section) {
  if (section.value == null) return document.createDocumentFragment();
  if (section.type === 'diagram') return diagramSection(section.title, section.value);
  if (section.type === 'code') return codeSection(section.title, section.value);
  if (section.type === 'lineNotes') return lineNotesSection(section.title, section.value);
  if (section.type === 'qa') return qaSection(section.title, section.value);
  if (section.type === 'concepts') return listSection(section.title, section.value, 'concept-list');
  if (section.type === 'list') return listSection(section.title, section.value);
  if (section.type === 'steps') return listSection(section.title, section.value, 'derivation-list');
  if (section.type === 'cards') return listSection(section.title, section.value, 'edge-case-list');
  if (section.type === 'compare') return compareSection(section.title, section.value);
  if (section.type === 'refs') return refsSection(section.title, section.value);
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
  const pane = el('question-detail');
  if (state.view === 'map') {
    pane.replaceChildren();
    const tip = document.createElement('div'); tip.className = 'map-detail-tip';
    const h = document.createElement('h2'); h.textContent = '知识脉络';
    const p1 = document.createElement('p'); p1.textContent = '左侧选择一个分类，即可进入该分类刷题；进入后会先展示「本类主线」，按知识依赖顺序刷，而不是随机点题。';
    const p2 = document.createElement('p'); p2.textContent = '顶部的「主题域」是全局地图，「学习路径 / 跨域交叉线 / 岗优先级」是配套复习策略。';
    tip.append(h, p1, p2);
    pane.append(tip);
    return;
  }
  const q = selectedQuestion(); pane.replaceChildren();
  if (!q) { pane.textContent = '请选择一道题目'; return; }
  const head = document.createElement('header'); head.className = 'detail-head';
  const tags = document.createElement('div'); tags.className = 'tag-row';
  [[q.kind === 'code' ? '代码题' : '概念题', 'tag'], [q.category, 'tag'], [q.difficulty, 'tag difficulty'], [`LC ${q.id}`, 'tag']].forEach(([value, className]) => { const tag = document.createElement('span'); tag.className = className; tag.textContent = value; tags.append(tag); });
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
function renderQuestionPane() {
  const pane = el('question-pane');
  const heading = pane.querySelector('.pane-heading');
  const mockNote = el('mock-note');
  const list = el('question-list');
  const empty = el('empty-state');
  const searchLabel = document.querySelector('.search-label');
  const searchInput = el('search-input');
  const kindList = el('kind-list');
  if (state.view === 'map') {
    heading.hidden = true;
    mockNote.hidden = true;
    list.hidden = true;
    empty.hidden = true;
    if (searchLabel) searchLabel.hidden = true;
    searchInput.hidden = true;
    kindList.hidden = true;
    const existing = el('category-thread'); if (existing) existing.remove();
    let mapView = el('map-view');
    if (!mapView) { mapView = document.createElement('div'); mapView.id = 'map-view'; mapView.className = 'map-view'; pane.append(mapView); }
    mapView.hidden = false;
    renderMap(mapView);
    return;
  }
  const mapView = el('map-view'); if (mapView) mapView.hidden = true;
  heading.hidden = false;
  list.hidden = false;
  if (searchLabel) searchLabel.hidden = false;
  searchInput.hidden = false;
  kindList.hidden = false;
  renderList();
  renderCategoryThread(pane, list);
}

function renderCategoryThread(pane, list) {
  const existing = el('category-thread'); if (existing) existing.remove();
  if (state.category === '全部') return;
  const info = categoryThread[state.category];
  if (!info) return;
  const banner = document.createElement('section');
  banner.id = 'category-thread'; banner.className = `thread-banner ${info.heavy ? 'heavy' : ''}`;
  const head = document.createElement('div'); head.className = 'thread-head';
  const tag = document.createElement('span'); tag.className = 'thread-tag'; tag.textContent = '本类主线';
  const title = document.createElement('h3'); title.textContent = state.category;
  head.append(tag, title);
  const oneliner = document.createElement('p'); oneliner.className = 'thread-oneliner'; oneliner.textContent = info.oneliner;
  const ol = document.createElement('ol'); ol.className = 'thread-steps';
  info.steps.forEach((s) => { const li = document.createElement('li'); li.textContent = s; ol.append(li); });
  const hint = document.createElement('p'); hint.className = 'thread-hint'; hint.textContent = '按上面顺序刷，而不是随机点题——这是这一类内部的「最小知识依赖路径」。';
  banner.append(head, oneliner, ol, hint);
  pane.insertBefore(banner, list);
}

function renderMap(container) {
  container.replaceChildren();
  const tabs = document.createElement('div'); tabs.className = 'map-tabs';
  [['domains', '主题域'], ['path', '学习路径'], ['cross', '跨域交叉线'], ['priority', '岗优先级']].forEach(([key, label]) => {
    const b = document.createElement('button');
    b.className = `map-tab ${state.mapTab === key ? 'active' : ''}`; b.textContent = label;
    b.addEventListener('click', () => { state.mapTab = key; renderMap(container); });
    tabs.append(b);
  });
  container.append(tabs);
  if (state.mapTab === 'domains') container.append(renderMapDomains());
  else if (state.mapTab === 'path') container.append(renderMapPath());
  else if (state.mapTab === 'cross') container.append(renderMapCross());
  else container.append(renderMapPriority());
}

function renderMapDomains() {
  const wrap = document.createElement('div'); wrap.className = 'domain-grid';
  domains.forEach((d) => {
    const card = document.createElement('section'); card.className = `domain-card ${d.heavy ? 'heavy' : ''}`;
    const head = document.createElement('div'); head.className = 'domain-head';
    const badge = document.createElement('span'); badge.className = 'domain-badge'; badge.textContent = d.id;
    const name = document.createElement('h3'); name.textContent = d.name + (d.heavy ? ' 【岗重】' : '');
    head.append(badge, name);
    const why = document.createElement('p'); why.className = 'domain-why'; why.textContent = d.why;
    const chips = document.createElement('div'); chips.className = 'cat-chips';
    d.categories.forEach((cat) => {
      const chip = document.createElement('button'); chip.className = 'cat-chip'; chip.textContent = cat.name;
      chip.addEventListener('click', () => {
        state.view = 'list'; state.category = cat.name;
        selectQuestion(filterQuestions(questions, cat.name, state.query, state.kind)[0]?.id); render();
      });
      chips.append(chip);
    });
    card.append(head, why, chips);
    wrap.append(card);
  });
  return wrap;
}

function renderMapPath() {
  const wrap = document.createElement('div'); wrap.className = 'map-section';
  const intro = document.createElement('p'); intro.className = 'map-intro'; intro.textContent = '按「前面是后面的地基」排的复习先后顺序，不是强制。';
  wrap.append(intro);
  const table = document.createElement('table'); table.className = 'map-table';
  const thead = document.createElement('thead'); thead.innerHTML = '<tr><th>阶段</th><th>主题域</th><th>为什么这个顺序</th><th>建议投入</th></tr>';
  const tbody = document.createElement('tbody');
  learningPath.forEach((s) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.stage}</td><td>${s.domain}</td><td>${s.why}</td><td>${s.invest}</td>`;
    tbody.append(tr);
  });
  table.append(thead, tbody);
  wrap.append(table);
  return wrap;
}

function renderMapCross() {
  const wrap = document.createElement('div'); wrap.className = 'map-section';
  const intro = document.createElement('p'); intro.className = 'map-intro'; intro.textContent = '最容易被考「综合」的地方，建议单独串练。';
  wrap.append(intro);
  const list = document.createElement('div'); list.className = 'cross-list';
  crossLines.forEach((c) => {
    const item = document.createElement('div'); item.className = 'cross-item';
    const name = document.createElement('h4'); name.textContent = c.name;
    const line = document.createElement('p'); line.className = 'cross-line'; line.textContent = c.line;
    item.append(name, line); list.append(item);
  });
  wrap.append(list);
  return wrap;
}

function renderMapPriority() {
  const wrap = document.createElement('div'); wrap.className = 'map-section';
  const intro = document.createElement('p'); intro.className = 'map-intro'; intro.textContent = '针对「大模型算法 / 多模态」岗的复习权重建议（见 社招三轮面试策略补充.md）。';
  wrap.append(intro);
  const list = document.createElement('div'); list.className = 'priority-list';
  priorities.forEach((p) => {
    const item = document.createElement('div'); item.className = `priority-item tier-${p.tier}`;
    const h = document.createElement('h4'); h.textContent = p.label;
    const body = document.createElement('p'); body.textContent = p.items;
    item.append(h, body); list.append(item);
  });
  wrap.append(list);
  return wrap;
}

function render() {
  renderMode();
  renderCategories();
  renderKindSwitch();
  renderProgress();
  renderQuestionPane();
  renderDetail();
  el('timer').textContent = formatRemaining(state.remaining);
}
function startMock() { state.mode = 'mock'; state.view = 'list'; state.mockQuestions = sampleQuestions(questions, 5); state.selectedId = state.mockQuestions[0]?.id; state.revealIndex = 0; state.detailLevel = 'deep'; state.remaining = 2700; clearInterval(state.timerId); state.timerId = setInterval(tick, 1000); render(); }
function returnReview() { state.mode = 'review'; state.view = 'map'; state.revealIndex = 0; state.detailLevel = 'deep'; clearInterval(state.timerId); state.timerId = null; state.selectedId = questions[0].id; render(); }
el('search-input').addEventListener('input', (event) => { state.query = event.target.value; state.view = 'list'; selectQuestion(filterQuestions(questions, state.category, state.query, state.kind)[0]?.id); render(); });
el('clear-search').addEventListener('click', () => { state.query = ''; state.category = '全部'; state.kind = '全部'; state.view = 'list'; el('search-input').value = ''; selectQuestion(filterQuestions(questions, '全部', '', '全部')[0]?.id); render(); });
el('start-mock').addEventListener('click', startMock); el('return-review').addEventListener('click', returnReview); render();
