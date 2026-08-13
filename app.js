import { categories, questions } from './questions.js?v=fbb723c9';
import { detailSections, filterQuestions, formatRemaining, getEmptyState, sampleQuestions } from './quiz-core.js';
import { domains, learningPath, crossLines, priorities, categoryThread } from './knowledge-map.js';
import { tutorials, tutorialById } from './tutorials.js';
import { complexityView, diagramHtml, diagramToVectorModel, parseFlowDiagram, splitRichText } from './render-utils.js';

const storageKey = 'zeng-interview-mastered-ids';
const legacyStorageKey = 'byte-interview-mastered-ids';
const tutorialProgressKey = 'zeng-interview-tutorial-progress';
const el = (id) => document.getElementById(id);
const categoryLabels = new Map([
  ['语音合成', 'TTS 语音合成'],
]);

function categoryLabel(category) { return categoryLabels.get(category) || category; }

function isResumeQuestion(question) { return /^(?:asr|tts|edge|perf|lead)-resume-/.test(question.id); }
const resumeQuestions = questions.filter(isResumeQuestion);
const resumeLevelOptions = [
  { key: 'direct', label: '真实项目', short: '只看我做过的', description: '简历有明确原文依据，优先练成可以脱口而出的项目故事。' },
  { key: 'supporting', label: '关联补课', short: '理解相关原理', description: '和简历技术栈有关，但不默认代表我实现过内部算法。' },
  { key: 'general', label: '通用方法', short: '不要说成做过', description: '更规范的面试或工程方法，只能按“如果让我做”回答。' },
];
const directResumeQuestions = resumeQuestions.filter((question) => question.experienceLevel === 'direct');
const resumeLevelInfo = (level) => resumeLevelOptions.find((option) => option.key === level) || resumeLevelOptions[0];
const personalTracks = [
  {
    code: '01', title: '简历证据与项目答辩', resume: true,
    summary: '把真实经历讲成完整证据链：背景、取舍、指标、贡献、失败与复盘。',
  },
  {
    code: '02', title: '语音主航道', categories: ['ASR 专项', '语音合成', '语音大模型'],
    summary: '从识别到合成，从离线模型到流式交互，形成可持续加深的专业纵深。',
  },
  {
    code: '03', title: '端侧感知与部署', categories: ['ONNX/TensorRT', '推理芯片适配', 'OCR 文字检测与识别', '单目深度与障碍物感知'],
    summary: '连接模型、芯片、性能与稳定性，回答“怎样真正交付到设备上”。',
  },
  {
    code: '04', title: '多模态生成与智能系统', categories: ['生成式模型', '多模态模型', 'LLM 约束生成与自动评测', 'Agent Workflow', '系统设计'],
    summary: '覆盖理解、生成、约束、评测与系统编排，承接更宽的目标岗位。',
  },
  {
    code: '05', title: '评测、实验与 Tech Lead', categories: ['服务性能评测', '训练稳定性', 'Tech Lead 与项目答辩'],
    summary: '用可信实验做决策，用工程机制交付结果，用复盘沉淀团队能力。',
  },
  {
    code: '06', title: '直播推荐与增长策略', categories: ['直播变现与增长', '搜索推荐', '因果推断'],
    summary: '面向直播变现岗位，串起业务漏斗、推荐排序、因果增量、生成式个性化与实时策略系统。',
  },
];

const savedTutorialProgress = loadTutorialProgress();
const initialTutorialId = tutorialById(savedTutorialProgress.currentTutorialId)?.id || tutorials[0].id;
const initialTutorialChapters = { ...(savedTutorialProgress.currentChapterByTutorial || {}) };
if (initialTutorialChapters[tutorials[0].id] == null && Number.isInteger(savedTutorialProgress.currentChapter)) {
  initialTutorialChapters[tutorials[0].id] = savedTutorialProgress.currentChapter;
}

const state = {
  mode: 'review', view: 'map', mapTab: 'personal', category: '全部', query: '', kind: '全部', selectedId: questions[0].id,
  resumeLevel: 'direct', mockQuestions: [], revealIndex: 0, detailLevel: 'quick', masteredIds: loadMastered(),
  tutorialId: initialTutorialId, tutorialChapter: initialTutorialChapters[initialTutorialId] || 0,
  tutorialChapterById: initialTutorialChapters,
  completedTutorialChapters: new Set(savedTutorialProgress.completed || []), remaining: 2700, timerId: null,
};

function loadMastered() {
  try {
    const current = localStorage.getItem(storageKey);
    const saved = current ?? localStorage.getItem(legacyStorageKey) ?? '[]';
    if (current == null && saved !== '[]') localStorage.setItem(storageKey, saved);
    return new Set(JSON.parse(saved));
  } catch { return new Set(); }
}
function saveMastered() { try { localStorage.setItem(storageKey, JSON.stringify([...state.masteredIds])); } catch {} }
function loadTutorialProgress() {
  try { return JSON.parse(localStorage.getItem(tutorialProgressKey) || '{}'); } catch { return {}; }
}
function saveTutorialProgress() {
  try {
    localStorage.setItem(tutorialProgressKey, JSON.stringify({
      currentTutorialId: state.tutorialId,
      currentChapter: state.tutorialChapter,
      currentChapterByTutorial: state.tutorialChapterById,
      completed: [...state.completedTutorialChapters],
    }));
  } catch {}
}
function activeQuestions() {
  if (state.mode === 'mock') return state.mockQuestions;
  const source = state.view === 'resume'
    ? resumeQuestions.filter((question) => question.experienceLevel === state.resumeLevel)
    : questions;
  return filterQuestions(source, state.category, state.query, state.kind);
}
function selectedQuestion() { return activeQuestions().find((q) => q.id === state.selectedId) || activeQuestions()[0]; }
function selectQuestion(id) {
  state.selectedId = id;
  state.revealIndex = 0;
  if (state.mode === 'review') state.detailLevel = 'quick';
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
  // 前置导航：个人准备台 / 简历专项 / 全部知识库
  buttons.push(navButton('⌂ 我的准备台', state.view === 'map', () => { state.view = 'map'; state.mapTab = 'personal'; render(); }, 'nav-lead'));
  buttons.push(navButton('▣ 教程 · 项目答辩', state.view === 'course' && state.tutorialId === 'project-defense-tech-lead', () => openTutorial('project-defense-tech-lead'), 'nav-lead nav-course'));
  buttons.push(navButton('▣ 教程 · ASR', state.view === 'course' && state.tutorialId === 'asr-from-audio-to-delivery', () => openTutorial('asr-from-audio-to-delivery'), 'nav-lead nav-course nav-course-asr'));
  buttons.push(navButton('▣ 教程 · TTS', state.view === 'course' && state.tutorialId === 'tts-from-text-to-streaming-speech', () => openTutorial('tts-from-text-to-streaming-speech'), 'nav-lead nav-course nav-course-tts'));
  buttons.push(navButton(`◎ 简历项目 · ${directResumeQuestions.length}`, state.view === 'resume', () => {
    state.view = 'resume'; state.category = '全部'; state.resumeLevel = 'direct';
    selectQuestion(activeQuestions()[0]?.id); render();
  }, 'nav-lead nav-resume'));
  buttons.push(navButton('全部知识库', state.view === 'list' && state.category === '全部', () => {
    state.view = 'list'; state.category = '全部';
    selectQuestion(filterQuestions(questions, '全部', state.query, state.kind)[0]?.id); render();
  }, 'nav-lead'));
  // 真实分类（排除内置的「全部」）
  categories.filter((c) => c !== '全部').forEach((category) => {
    buttons.push(navButton(categoryLabel(category), state.view === 'list' && state.category === category, () => {
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
    button.addEventListener('click', () => { state.kind = value; selectQuestion(activeQuestions()[0]?.id); render(); });
    return button;
  }));
}
function renderList() {
  const items = activeQuestions(), empty = getEmptyState(items);
  el('question-list').hidden = empty.visible; el('empty-state').hidden = !empty.visible;
  el('result-count').textContent = `${items.length} 题`;
  el('list-title').textContent = state.mode === 'mock'
    ? '本轮模拟'
    : (state.view === 'resume' ? resumeLevelInfo(state.resumeLevel).label : (state.category === '全部' ? '全部知识库' : categoryLabel(state.category)));
  if (empty.visible) return;
  el('question-list').replaceChildren(...items.map((q) => {
    const card = document.createElement('button'); card.className = `question-card ${q.id === selectedQuestion()?.id ? 'active' : ''}`;
    const meta = document.createElement('div'); meta.className = 'card-meta';
    const kindBadge = document.createElement('span'); kindBadge.className = 'badge'; kindBadge.textContent = q.kind === 'code' ? '代码' : '概念';
    const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = categoryLabel(q.category);
    const relationBadge = document.createElement('span'); relationBadge.className = `badge relation ${q.experienceLevel || ''}`; relationBadge.textContent = q.experienceLabel || '';
    const metaText = document.createElement('span'); metaText.textContent = `${q.difficulty} · ${q.id}`; meta.append(kindBadge, badge, ...(q.resumeCard ? [relationBadge] : []), metaText);
    const title = appendRichText(document.createElement('h3'), q.title);
    const prompt = appendRichText(document.createElement('p'), q.prompt);
    card.append(meta, title, prompt);
    card.addEventListener('click', () => {
      selectQuestion(q.id);
      render();
      scrollToMobileDetail();
    });
    return card;
  }));
}
function appendRichText(target, value) {
  splitRichText(value).forEach((segment) => {
    if (segment.type === 'text') {
      target.append(document.createTextNode(segment.value));
      return;
    }
    const formula = document.createElement('span');
    formula.className = segment.displayMode ? 'rich-math rich-math-display' : 'rich-math rich-math-inline';
    formula.setAttribute('role', 'math');
    formula.setAttribute('aria-label', segment.raw || segment.value);
    if (typeof katex !== 'undefined') {
      try {
        katex.render(segment.latex || segment.value, formula, {
          displayMode: segment.displayMode,
          throwOnError: true,
          strict: 'error',
          trust: false,
        });
      } catch {
        formula.classList.add('math-fallback');
        formula.textContent = segment.raw;
      }
    } else {
      formula.classList.add('math-fallback');
      formula.textContent = segment.raw;
    }
    target.append(formula);
  });
  return target;
}
function textSection(title, text) { const block = document.createElement('section'); block.className = 'detail-section'; const h = document.createElement('h3'); h.textContent = title; const p = appendRichText(document.createElement('p'), text); block.append(h, p); return block; }
function complexitySection(title, text) {
  const block = document.createElement('section'); block.className = 'detail-section formula-section';
  const h = document.createElement('h3'); h.textContent = title;
  const view = complexityView(text);
  const formulas = [...new Map(view.formulas.map((formula) => [`${formula.label || ''}\u0000${formula.value}`, formula])).values()];
  if (!formulas.length) {
    const copy = document.createElement('p'); copy.className = 'complexity-copy'; copy.textContent = view.source;
    block.append(h, copy); return block;
  }

  const panel = document.createElement('div'); panel.className = 'formula-panel';
  const label = document.createElement('span'); label.className = 'formula-label'; label.textContent = '复杂度速览';
  const formulaList = document.createElement('div'); formulaList.className = 'formula-list';
  formulas.forEach((formula) => {
    const item = document.createElement('div'); item.className = 'formula-item';
    item.dataset.metric = formula.label || '复杂度';
    const metric = document.createElement('span'); metric.className = 'formula-metric'; metric.textContent = item.dataset.metric;
    const line = document.createElement('div'); line.className = 'formula-line';
    line.setAttribute('aria-label', formula.value);
    if (formula.latex && typeof katex !== 'undefined') {
      try {
        line.innerHTML = katex.renderToString(formula.latex, { displayMode: true, throwOnError: true, strict: 'error', trust: false });
      } catch {
        line.classList.add('formula-fallback'); line.textContent = formula.value;
      }
    } else {
      line.classList.add('formula-fallback'); line.textContent = formula.value;
    }
    item.append(metric, line); formulaList.append(item);
  });
  const note = document.createElement('div'); note.className = 'complexity-note';
  const noteLabel = document.createElement('span'); noteLabel.className = 'complexity-note-label'; noteLabel.textContent = '解释';
  const copy = document.createElement('p'); copy.className = 'complexity-copy'; copy.textContent = view.source;
  note.append(noteLabel, copy); panel.append(label, formulaList, note); block.append(h, panel); return block;
}
function listSection(title, items, className = 'detail-list') { const block = document.createElement('section'); block.className = 'detail-section'; const h = document.createElement('h3'); h.textContent = title; const list = document.createElement('ul'); list.className = className; items.forEach((item) => { const li = document.createElement('li'); const content = appendRichText(document.createElement('div'), item); content.className = 'rich-text'; li.append(content); list.append(li); }); block.append(h, list); return block; }
function codeSection(title, code) { const block = document.createElement('section'); block.className = 'detail-section'; const h = document.createElement('h3'); h.textContent = title; const wrap = document.createElement('div'); wrap.className = 'code-wrap'; const pre = document.createElement('pre'); const codeEl = document.createElement('code'); codeEl.setAttribute('aria-label', title); codeEl.textContent = code; pre.append(codeEl); wrap.append(pre); block.append(h, wrap); return block; }
function closeExpandedDiagram(card) {
  const trigger = card?.querySelector('.diagram-expand');
  card?.classList.remove('is-expanded');
  card?.removeAttribute('role'); card?.removeAttribute('aria-modal');
  document.body.classList.remove('diagram-open');
  trigger?.focus();
}
function updateDiagramOverflow(root = document) {
  const cards = root.matches?.('.diagram-card') ? [root] : root.querySelectorAll('.diagram-card');
  cards.forEach((card) => {
    const viewport = card.querySelector('.diagram-viewport');
    card.classList.toggle('is-overflowing', Boolean(viewport && viewport.scrollWidth > viewport.clientWidth + 2));
  });
}
const SVG_NS = 'http://www.w3.org/2000/svg';
function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}
function renderVectorDiagram(model, title) {
  const svg = svgElement('svg', {
    class: 'diagram-svg', viewBox: `0 0 ${model.width} ${model.height}`,
    role: 'img', 'aria-label': `${title}（矢量图）`, preserveAspectRatio: 'xMinYMin meet',
  });
  svg.dataset.baseWidth = String(model.width);
  svg.style.width = `${model.width}px`;
  const svgTitle = svgElement('title'); svgTitle.textContent = title; svg.append(svgTitle);
  const edgeLayer = svgElement('g', { class: 'vector-edges', 'aria-hidden': 'true' });
  model.primitives.forEach((primitive) => {
    if (primitive.type === 'line') edgeLayer.append(svgElement('line', { ...primitive, class: 'vector-edge' }));
    else edgeLayer.append(svgElement('polygon', { points: primitive.points, class: 'vector-arrow' }));
  });
  const tokenLayer = svgElement('g', { class: 'vector-tokens' });
  model.tokens.forEach((token) => {
    const group = svgElement('g', { class: `vector-token is-${token.kind}` });
    const isCard = token.kind === 'primary' || token.kind === 'node' || token.kind === 'caption';
    if (isCard) {
      const height = token.kind === 'caption' ? 21 : 25;
      group.append(svgElement('rect', {
        x: token.x - 6, y: token.y - height / 2, width: token.width + 12, height, rx: token.kind === 'caption' ? 10 : 7,
      }));
    }
    const textNode = svgElement('text', {
      x: isCard ? token.x + token.width / 2 : token.x,
      y: token.y,
      'text-anchor': isCard ? 'middle' : 'start',
      'dominant-baseline': 'central',
    });
    textNode.textContent = token.label; group.append(textNode); tokenLayer.append(group);
  });
  svg.append(edgeLayer, tokenLayer); return svg;
}
function diagramSection(title, diagram) {
  if (!diagram) return document.createDocumentFragment();
  const block = document.createElement('section'); block.className = 'detail-section';
  const h = document.createElement('h3'); h.textContent = title;
  const flowDiagram = parseFlowDiagram(diagram);
  if (flowDiagram) {
    const flow = document.createElement('div'); flow.className = 'flow-chain'; flow.setAttribute('role', 'img');
    flow.dataset.source = String(diagram);
    flow.setAttribute('aria-label', `${title}：${flowDiagram.nodes.join(' 到 ')}`);
    flowDiagram.nodes.forEach((label, index) => {
      if (index) {
        const connector = document.createElement('span'); connector.className = 'flow-connector'; connector.setAttribute('aria-hidden', 'true');
        const edgeLabel = flowDiagram.edges[index - 1]?.label;
        if (edgeLabel) { const badge = document.createElement('span'); badge.className = 'flow-edge-label'; badge.textContent = edgeLabel; connector.append(badge); }
        const arrow = document.createElement('span'); arrow.className = 'flow-arrow'; arrow.textContent = '→'; connector.append(arrow); flow.append(connector);
      }
      const node = document.createElement('span');
      node.className = `flow-node ${index === 0 ? 'is-start' : index === flowDiagram.nodes.length - 1 ? 'is-end' : ''}`.trim();
      const step = document.createElement('span'); step.className = 'flow-step'; step.textContent = String(index + 1).padStart(2, '0');
      const copy = document.createElement('span'); copy.className = 'flow-label'; copy.textContent = label;
      node.append(step, copy); flow.append(node);
    });
    block.append(h, flow); return block;
  }
  const source = String(diagram);
  const visibleSource = source.replace(/^\n+|\n+$/g, '');
  const lineCount = visibleSource ? visibleSource.split('\n').length : 0;
  const vectorModel = diagramToVectorModel(source);
  const card = document.createElement('div'); card.className = 'diagram-card';
  card.style.setProperty('--diagram-font-size', '14px');
  const toolbar = document.createElement('div'); toolbar.className = 'diagram-toolbar';
  const meta = document.createElement('span'); meta.className = 'diagram-meta'; meta.textContent = `${vectorModel ? 'VECTOR MAP' : 'STRUCTURE MAP'} · ${lineCount} 行`;
  const actions = document.createElement('div'); actions.className = 'diagram-actions';
  const viewport = document.createElement('div'); viewport.className = 'diagram-viewport';
  const pre = document.createElement('pre'); pre.className = 'diagram-block'; pre.setAttribute('aria-label', title);
  pre.innerHTML = diagramHtml(source);
  const svg = vectorModel ? renderVectorDiagram(vectorModel, title) : null;
  if (svg) { pre.hidden = true; viewport.append(svg, pre); }
  else viewport.append(pre);

  let fontSize = 14;
  let zoom = 1;
  let showingSource = !svg;
  const sizeLabel = document.createElement('span'); sizeLabel.className = 'diagram-size'; sizeLabel.textContent = svg ? '100%' : '14px';
  const sizeButton = (label, delta) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'diagram-tool'; button.textContent = label;
    button.setAttribute('aria-label', delta > 0 ? '放大图中文字' : '缩小图中文字');
    button.addEventListener('click', () => {
      if (svg && !showingSource) {
        zoom = Math.max(.7, Math.min(1.6, zoom + delta / 10));
        svg.style.width = `${Number(svg.dataset.baseWidth) * zoom}px`;
        sizeLabel.textContent = `${Math.round(zoom * 100)}%`;
      } else {
        fontSize = Math.max(12, Math.min(20, fontSize + delta));
        card.style.setProperty('--diagram-font-size', `${fontSize}px`); sizeLabel.textContent = `${fontSize}px`;
      }
      const schedule = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (callback) => setTimeout(callback, 0);
      schedule(() => updateDiagramOverflow(card));
    });
    return button;
  };
  const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'diagram-tool diagram-toggle'; toggle.textContent = '原图';
  toggle.setAttribute('aria-label', '切换矢量图与原始结构图');
  toggle.addEventListener('click', () => {
    showingSource = !showingSource;
    svg.toggleAttribute('hidden', showingSource); pre.hidden = !showingSource;
    toggle.textContent = showingSource ? '矢量图' : '原图';
    meta.textContent = `${showingSource ? 'SOURCE MAP' : 'VECTOR MAP'} · ${lineCount} 行`;
    sizeLabel.textContent = showingSource ? `${fontSize}px` : `${Math.round(zoom * 100)}%`;
    viewport.scrollTo({ left: 0, top: 0 });
    const schedule = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (callback) => setTimeout(callback, 0);
    schedule(() => updateDiagramOverflow(card));
  });
  const expand = document.createElement('button'); expand.type = 'button'; expand.className = 'diagram-tool diagram-expand'; expand.textContent = '全屏查看';
  expand.addEventListener('click', () => {
    card.classList.add('is-expanded'); card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true');
    document.body.classList.add('diagram-open'); close.focus();
  });
  const close = document.createElement('button'); close.type = 'button'; close.className = 'diagram-tool diagram-close'; close.textContent = '关闭全屏';
  close.addEventListener('click', () => closeExpandedDiagram(card));
  actions.append(sizeButton('A−', -2), sizeLabel, sizeButton('A+', 2));
  if (svg) actions.append(toggle);
  actions.append(expand, close);
  toolbar.append(meta, actions);
  const hint = document.createElement('span'); hint.className = 'diagram-scroll-hint'; hint.textContent = '可左右滑动查看';
  card.append(toolbar, viewport, hint); block.append(h, card); return block;
}
function lineNotesSection(title, notes) {
  const block = document.createElement('section'); block.className = 'detail-section';
  const h = document.createElement('h3'); h.textContent = title;
  const list = document.createElement('ol'); list.className = 'line-notes';
  (Array.isArray(notes) ? notes : []).forEach((note, index) => {
    const li = document.createElement('li');
    const line = document.createElement('code'); line.textContent = `第 ${note?.line ?? index + 1} 行`;
    const explanation = appendRichText(document.createElement('span'), typeof note === 'string' ? note : (note?.explanation ?? note?.text ?? ''));
    li.append(line, explanation); list.append(li);
  });
  block.append(h, list); return block;
}
function qaSection(title, entries) {
  const block = document.createElement('section'); block.className = 'detail-section qa-section';
  const h = document.createElement('h3'); h.textContent = title; block.append(h);
  (Array.isArray(entries) ? entries : []).forEach((entry) => {
    const details = document.createElement('details');
    const summary = appendRichText(document.createElement('summary'), typeof entry === 'string' ? entry : (entry?.question ?? '追问'));
    const answer = appendRichText(document.createElement('p'), typeof entry === 'string' ? '请先自行组织答案，再对照题卡复盘。' : (entry?.answer ?? '')); answer.className = 'qa-answer';
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
    const content = appendRichText(document.createElement('div'), typeof row === 'string' ? row : `${row?.a ?? ''} vs ${row?.b ?? ''}：${row?.note ?? ''}`);
    content.className = 'rich-text'; li.append(content);
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
  if (section.key === 'complexity') return complexitySection(section.title, section.value);
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
  document.body.classList.remove('diagram-open');
  if (state.view === 'map' || state.view === 'course') {
    pane.replaceChildren();
    if (state.view === 'course') return;
    const tip = document.createElement('div'); tip.className = 'map-detail-tip';
    const h = document.createElement('h2'); h.textContent = '曾志涛的面试准备系统';
    const p1 = document.createElement('p'); p1.textContent = '这里不是某一个岗位的一次性题库，而是围绕个人经历、目标方向和能力短板持续生长的长期准备台。';
    const p2 = document.createElement('p'); p2.textContent = `先用 ${directResumeQuestions.length} 张真实项目卡讲清自己做过的事，再从 ${resumeQuestions.length - directResumeQuestions.length} 张关联补课与通用方法中按需补齐；其余 ${questions.length} 道知识卡用于长期扩展。`;
    tip.append(h, p1, p2);
    pane.append(tip);
    return;
  }
  const q = selectedQuestion(); pane.replaceChildren();
  if (!q) { pane.textContent = '请选择一道题目'; return; }
  const head = document.createElement('header'); head.className = 'detail-head';
  const tags = document.createElement('div'); tags.className = 'tag-row';
  const questionId = q.kind === 'code' && /^\d+$/.test(q.id) ? `LC ${q.id}` : `ID ${q.id}`;
  [[q.kind === 'code' ? '代码题' : '概念题', 'tag'], [categoryLabel(q.category), 'tag'], [q.difficulty, 'tag difficulty'], [questionId, 'tag']].forEach(([value, className]) => { const tag = document.createElement('span'); tag.className = className; tag.textContent = value; tags.append(tag); });
  if (q.resumeCard) { const relation = document.createElement('span'); relation.className = `tag relation ${q.experienceLevel}`; relation.textContent = q.experienceLabel; tags.prepend(relation); }
  const title = appendRichText(document.createElement('h2'), q.title);
  const prompt = appendRichText(document.createElement('p'), q.prompt);
  head.append(tags, title, prompt); pane.append(head);
  const sections = detailSections(q, state.mode === 'mock' ? 'deep' : state.detailLevel);
  const visibleCount = state.mode === 'mock' ? state.revealIndex : sections.length;
  if (state.mode !== 'mock') pane.append(renderDetailLevelSwitch());
  pane.append(...sections.slice(0, visibleCount).map(renderSection));
  const schedule = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (callback) => setTimeout(callback, 0);
  schedule(() => updateDiagramOverflow(pane));
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
function renderMode() { const mock = state.mode === 'mock'; el('mode-label').textContent = mock ? 'MOCK INTERVIEW' : 'PERSONAL KNOWLEDGE BASE'; el('timer').hidden = !mock; el('start-mock').hidden = mock; el('return-review').hidden = !mock; el('mock-note').hidden = !mock; el('mock-note').textContent = mock ? `本轮共 ${state.mockQuestions.length} 题。答案默认隐藏；请先口述方案再揭晓。` : ''; }
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
  if (state.view === 'map' || state.view === 'course') {
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
    mapView.hidden = state.view !== 'map';
    let courseView = el('course-view');
    if (!courseView) { courseView = document.createElement('div'); courseView.id = 'course-view'; courseView.className = 'course-view'; pane.append(courseView); }
    courseView.hidden = state.view !== 'course';
    if (state.view === 'map') renderMap(mapView);
    else renderTutorialCourse(courseView);
    return;
  }
  const mapView = el('map-view'); if (mapView) mapView.hidden = true;
  const courseView = el('course-view'); if (courseView) courseView.hidden = true;
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
  if (state.view === 'resume') {
    const banner = document.createElement('section');
    banner.id = 'category-thread'; banner.className = 'thread-banner heavy resume-thread';
    const head = document.createElement('div'); head.className = 'thread-head';
    const tag = document.createElement('span'); tag.className = 'thread-tag'; tag.textContent = '先分清做过与没做过';
    const title = document.createElement('h3'); title.textContent = `${directResumeQuestions.length} 张真实项目卡 + ${resumeQuestions.length - directResumeQuestions.length} 张补课卡`;
    head.append(tag, title);
    const oneliner = document.createElement('p'); oneliner.className = 'thread-oneliner';
    oneliner.textContent = '默认只展示简历能够证明的真实经历；原理补课和通用方法分开放，避免背成不存在的项目。';
    const switcher = document.createElement('div'); switcher.className = 'resume-level-switch';
    resumeLevelOptions.forEach((option) => {
      const count = resumeQuestions.filter((question) => question.experienceLevel === option.key).length;
      const button = document.createElement('button');
      button.className = `resume-level-card ${option.key} ${state.resumeLevel === option.key ? 'active' : ''}`;
      button.setAttribute('aria-pressed', String(state.resumeLevel === option.key));
      const strong = document.createElement('strong'); strong.textContent = `${option.label} · ${count}`;
      const small = document.createElement('span'); small.textContent = option.short;
      const copy = document.createElement('small'); copy.textContent = option.description;
      button.append(strong, small, copy);
      button.addEventListener('click', () => {
        state.resumeLevel = option.key;
        selectQuestion(activeQuestions()[0]?.id);
        render();
      });
      switcher.append(button);
    });
    const hint = document.createElement('p'); hint.className = 'thread-hint';
    hint.textContent = `${resumeLevelInfo(state.resumeLevel).label}：${resumeLevelInfo(state.resumeLevel).description}`;
    banner.append(head, oneliner, switcher, hint);
    pane.insertBefore(banner, list);
    return;
  }
  if (state.category === '全部') return;
  const info = categoryThread[state.category];
  if (!info) return;
  const banner = document.createElement('section');
  banner.id = 'category-thread'; banner.className = `thread-banner ${info.heavy ? 'heavy' : ''}`;
  const head = document.createElement('div'); head.className = 'thread-head';
  const tag = document.createElement('span'); tag.className = 'thread-tag'; tag.textContent = '本类主线';
  const title = document.createElement('h3'); title.textContent = categoryLabel(state.category);
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
  [['personal', '个人首页'], ['domains', '能力版图'], ['path', '准备主线'], ['cross', '项目串讲'], ['priority', '长期优先级']].forEach(([key, label]) => {
    const b = document.createElement('button');
    b.className = `map-tab ${state.mapTab === key ? 'active' : ''}`; b.textContent = label;
    b.addEventListener('click', () => { state.mapTab = key; renderMap(container); });
    tabs.append(b);
  });
  container.append(tabs);
  if (state.mapTab === 'personal') container.append(renderPersonalDashboard());
  else if (state.mapTab === 'domains') container.append(renderMapDomains());
  else if (state.mapTab === 'path') container.append(renderMapPath());
  else if (state.mapTab === 'cross') container.append(renderMapCross());
  else container.append(renderMapPriority());
}

function openCollection(view, category = '全部') {
  state.view = view; state.category = category; state.query = '';
  if (view === 'resume') state.resumeLevel = 'direct';
  const searchInput = el('search-input'); if (searchInput) searchInput.value = '';
  selectQuestion(activeQuestions()[0]?.id); render();
}

function tutorialChapterKey(tutorial, chapter) { return `${tutorial.id}:${chapter.id}`; }

function tutorialThemeClass(tutorial) {
  if (tutorial.id === 'asr-from-audio-to-delivery') return 'is-asr';
  if (tutorial.id === 'tts-from-text-to-streaming-speech') return 'is-tts';
  return '';
}

function openTutorial(tutorialId = state.tutorialId, chapterIndex) {
  const tutorial = tutorialById(tutorialId) || tutorials[0];
  state.tutorialId = tutorial.id;
  const targetChapter = chapterIndex ?? state.tutorialChapterById[tutorial.id] ?? 0;
  state.mode = 'review'; state.view = 'course';
  state.tutorialChapter = Math.max(0, Math.min(targetChapter, tutorial.chapters.length - 1));
  state.tutorialChapterById[tutorial.id] = state.tutorialChapter;
  saveTutorialProgress(); render();
  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openTutorialQuestion(questionId) {
  const question = questions.find((item) => item.id === questionId);
  if (!question) return;
  state.mode = 'review'; state.query = ''; state.kind = '全部'; state.selectedId = question.id; state.detailLevel = 'deep';
  if (question.resumeCard) {
    state.view = 'resume'; state.category = '全部'; state.resumeLevel = question.experienceLevel;
  } else {
    state.view = 'list'; state.category = question.category;
  }
  const searchInput = el('search-input'); if (searchInput) searchInput.value = '';
  render(); scrollToMobileDetail();
}

function tutorialSection(section) {
  const wrap = document.createElement('section'); wrap.className = 'course-section';
  const heading = document.createElement('h3'); heading.textContent = section.title; wrap.append(heading);
  if (section.paragraphs) section.paragraphs.forEach((value) => { const p = document.createElement('p'); p.textContent = value; wrap.append(p); });
  if (section.steps) {
    const ol = document.createElement('ol'); ol.className = 'course-steps';
    section.steps.forEach((value) => { const li = document.createElement('li'); li.textContent = value; ol.append(li); });
    wrap.append(ol);
  }
  if (section.callout) { const callout = document.createElement('div'); callout.className = 'course-callout'; callout.textContent = section.callout; wrap.append(callout); }
  return wrap;
}

function renderTutorialCourse(container) {
  const tutorial = tutorialById(state.tutorialId) || tutorials[0];
  const chapter = tutorial.chapters[state.tutorialChapter] || tutorial.chapters[0];
  const completedCount = tutorial.chapters.filter((item) => state.completedTutorialChapters.has(tutorialChapterKey(tutorial, item))).length;
  container.replaceChildren();

  const top = document.createElement('div'); top.className = 'course-topbar';
  const back = document.createElement('button'); back.className = 'course-back'; back.textContent = '← 返回个人首页';
  back.addEventListener('click', () => { state.view = 'map'; state.mapTab = 'personal'; render(); });
  const progressCopy = document.createElement('span'); progressCopy.textContent = `已完成 ${completedCount} / ${tutorial.chapters.length} 章`;
  top.append(back, progressCopy); container.append(top);

  const hero = document.createElement('header'); hero.className = 'course-hero';
  const heroCopy = document.createElement('div');
  const eyebrow = document.createElement('p'); eyebrow.className = 'course-eyebrow'; eyebrow.textContent = tutorial.eyebrow;
  const title = document.createElement('h2'); title.textContent = tutorial.title;
  const summary = document.createElement('p'); summary.textContent = tutorial.summary;
  heroCopy.append(eyebrow, title, summary);
  const courseMeta = document.createElement('div'); courseMeta.className = 'course-meta';
  const outcome = document.createElement('p'); outcome.innerHTML = `<strong>结课能力</strong>${tutorial.outcome}`;
  const audience = document.createElement('p'); audience.innerHTML = `<strong>适用场景</strong>${tutorial.audience}`;
  courseMeta.append(outcome, audience); hero.append(heroCopy, courseMeta); container.append(hero);

  const progress = document.createElement('div'); progress.className = 'course-progress'; progress.setAttribute('aria-label', '课程完成进度');
  const bar = document.createElement('i'); bar.style.width = `${completedCount / tutorial.chapters.length * 100}%`; progress.append(bar); container.append(progress);

  const shell = document.createElement('div'); shell.className = 'course-shell';
  const rail = document.createElement('nav'); rail.className = 'course-rail'; rail.setAttribute('aria-label', '课程章节');
  const railTitle = document.createElement('strong'); railTitle.textContent = '课程目录'; rail.append(railTitle);
  tutorial.chapters.forEach((item, index) => {
    const button = document.createElement('button');
    const isDone = state.completedTutorialChapters.has(tutorialChapterKey(tutorial, item));
    button.className = `course-chapter-link ${index === state.tutorialChapter ? 'active' : ''} ${isDone ? 'done' : ''}`;
    button.setAttribute('aria-current', index === state.tutorialChapter ? 'step' : 'false');
    const number = document.createElement('span'); number.textContent = isDone ? '✓' : String(item.number).padStart(2, '0');
    const copy = document.createElement('span'); copy.textContent = item.title;
    button.append(number, copy); button.addEventListener('click', () => openTutorial(tutorial.id, index)); rail.append(button);
  });

  const article = document.createElement('article'); article.className = 'course-article';
  const chapterHead = document.createElement('header'); chapterHead.className = 'course-chapter-head';
  const chapterKicker = document.createElement('p'); chapterKicker.textContent = `第 ${chapter.number} 章 · ${chapter.duration}`;
  const chapterTitle = document.createElement('h2'); chapterTitle.textContent = chapter.title;
  const goal = document.createElement('p'); goal.className = 'course-goal'; goal.innerHTML = `<strong>本章目标</strong>${chapter.goal}`;
  const bridge = document.createElement('p'); bridge.className = 'course-bridge'; bridge.innerHTML = `<strong>为什么现在学</strong>${chapter.bridge}`;
  chapterHead.append(chapterKicker, chapterTitle, goal, bridge); article.append(chapterHead);
  chapter.sections.forEach((section) => article.append(tutorialSection(section)));

  const exercise = document.createElement('section'); exercise.className = 'course-exercise';
  const exerciseTitle = document.createElement('h3'); exerciseTitle.textContent = chapter.exercise.title;
  const exercisePrompt = document.createElement('p'); exercisePrompt.textContent = chapter.exercise.prompt;
  const checks = document.createElement('ul'); chapter.exercise.checks.forEach((value) => { const li = document.createElement('li'); li.textContent = value; checks.append(li); });
  exercise.append(exerciseTitle, exercisePrompt, checks); article.append(exercise);

  const related = document.createElement('section'); related.className = 'course-related';
  const relatedTitle = document.createElement('h3'); relatedTitle.textContent = '本章关联题卡 · 用于追问训练'; related.append(relatedTitle);
  const relatedGrid = document.createElement('div');
  chapter.questionIds.map((id) => questions.find((item) => item.id === id)).filter(Boolean).forEach((question) => {
    const button = document.createElement('button');
    const badge = document.createElement('span'); badge.textContent = question.experienceLabel || categoryLabel(question.category);
    const titleText = document.createElement('strong'); titleText.textContent = question.title;
    button.append(badge, titleText); button.addEventListener('click', () => openTutorialQuestion(question.id)); relatedGrid.append(button);
  });
  related.append(relatedGrid); article.append(related);

  if (state.tutorialChapter === tutorial.chapters.length - 1) {
    const capstone = document.createElement('section'); capstone.className = 'course-capstone';
    const capTitle = document.createElement('h3'); capTitle.textContent = tutorial.capstone.title;
    const capPrompt = document.createElement('p'); capPrompt.textContent = tutorial.capstone.prompt;
    const capChecks = document.createElement('ul'); tutorial.capstone.checklist.forEach((value) => { const li = document.createElement('li'); li.textContent = value; capChecks.append(li); });
    capstone.append(capTitle, capPrompt, capChecks); article.append(capstone);
  }

  const controls = document.createElement('div'); controls.className = 'course-controls';
  if (state.tutorialChapter > 0) { const previous = document.createElement('button'); previous.className = 'button ghost'; previous.textContent = '← 上一章'; previous.addEventListener('click', () => openTutorial(tutorial.id, state.tutorialChapter - 1)); controls.append(previous); }
  const key = tutorialChapterKey(tutorial, chapter); const isDone = state.completedTutorialChapters.has(key);
  const complete = document.createElement('button'); complete.className = `button ${isDone ? 'mastered' : 'primary'}`;
  complete.textContent = isDone ? '✓ 本章已完成' : (state.tutorialChapter < tutorial.chapters.length - 1 ? '完成本章，进入下一章 →' : '完成课程');
  complete.addEventListener('click', () => {
    state.completedTutorialChapters.add(key); saveTutorialProgress();
    if (state.tutorialChapter < tutorial.chapters.length - 1) openTutorial(tutorial.id, state.tutorialChapter + 1); else render();
  });
  controls.append(complete); article.append(controls);
  shell.append(rail, article); container.append(shell);
}

function renderPersonalDashboard() {
  const wrap = document.createElement('div'); wrap.className = 'personal-dashboard';
  const hero = document.createElement('section'); hero.className = 'personal-hero';
  const copy = document.createElement('div'); copy.className = 'personal-hero-copy';
  const kicker = document.createElement('p'); kicker.className = 'personal-kicker'; kicker.textContent = 'ZENG ZHITAO · INTERVIEW OS';
  const title = document.createElement('h3'); title.textContent = '把项目经验，内化成可迁移的面试能力';
  const summary = document.createElement('p');
  summary.textContent = '以语音、多模态、端侧部署和生成式 AI 为专业主线，以实验可信度、系统设计与 Tech Lead 为交付闭环。';
  copy.append(kicker, title, summary);
  const stats = document.createElement('div'); stats.className = 'personal-stats';
  [
    [questions.length, '全部题卡'], [directResumeQuestions.length, '真实项目卡'], [domains.length, '能力主题'], [state.masteredIds.size, '已掌握'],
  ].forEach(([value, label]) => {
    const item = document.createElement('div');
    const strong = document.createElement('strong'); strong.textContent = String(value);
    const text = document.createElement('span'); text.textContent = label;
    item.append(strong, text); stats.append(item);
  });
  hero.append(copy, stats); wrap.append(hero);

  const courseLibrary = document.createElement('div'); courseLibrary.className = 'course-library';
  tutorials.forEach((tutorial, index) => {
    const completedChapters = tutorial.chapters.filter((chapter) => state.completedTutorialChapters.has(tutorialChapterKey(tutorial, chapter))).length;
    const courseCard = document.createElement('section'); courseCard.className = `featured-course ${tutorialThemeClass(tutorial)}`;
    const courseCopy = document.createElement('div');
    const courseKicker = document.createElement('span'); courseKicker.textContent = index === 0 ? 'FIRST GUIDED COURSE' : `GUIDED COURSE ${String(index + 1).padStart(2, '0')}`;
    const courseTitle = document.createElement('h3'); courseTitle.textContent = tutorial.title;
    const courseText = document.createElement('p'); courseText.textContent = tutorial.summary;
    courseCopy.append(courseKicker, courseTitle, courseText);
    const courseAction = document.createElement('div');
    const courseCount = document.createElement('strong'); courseCount.textContent = `${completedChapters} / ${tutorial.chapters.length}`;
    const courseLabel = document.createElement('span'); courseLabel.textContent = completedChapters ? '继续上次学习' : '从第 1 章开始';
    const courseButton = document.createElement('button'); courseButton.textContent = completedChapters ? '继续教程 →' : '开始教程 →'; courseButton.addEventListener('click', () => openTutorial(tutorial.id));
    courseAction.append(courseCount, courseLabel, courseButton); courseCard.append(courseCopy, courseAction); courseLibrary.append(courseCard);
  });
  wrap.append(courseLibrary);

  const heading = document.createElement('div'); heading.className = 'personal-section-head';
  const eyebrow = document.createElement('span'); eyebrow.textContent = 'LONG-TERM TRACKS';
  const h = document.createElement('h3'); h.textContent = '我的六条准备主线';
  const note = document.createElement('p'); note.textContent = '先把自己的经历讲透，再沿主航道加深，最后用通用知识库补齐短板。';
  heading.append(eyebrow, h, note); wrap.append(heading);

  const grid = document.createElement('div'); grid.className = 'personal-track-grid';
  personalTracks.forEach((track) => {
    const card = document.createElement('section'); card.className = `personal-track ${track.resume ? 'is-resume' : ''}`;
    const code = document.createElement('span'); code.className = 'personal-track-code'; code.textContent = track.code;
    const name = document.createElement('h4'); name.textContent = track.title;
    const description = document.createElement('p'); description.textContent = track.summary;
    card.append(code, name, description);
    if (track.resume) {
      const button = document.createElement('button'); button.className = 'personal-open'; button.textContent = `先练 ${directResumeQuestions.length} 张真实项目卡`;
      button.addEventListener('click', () => openCollection('resume'));
      card.append(button);
    } else {
      const chips = document.createElement('div'); chips.className = 'personal-track-chips';
      track.categories.forEach((category) => {
        const button = document.createElement('button'); button.className = 'cat-chip';
        const count = filterQuestions(questions, category, '', '全部').length;
        button.textContent = `${categoryLabel(category)} · ${count}`;
        button.addEventListener('click', () => openCollection('list', category));
        chips.append(button);
      });
      card.append(chips);
    }
    grid.append(card);
  });
  wrap.append(grid);
  return wrap;
}

function renderMapDomains() {
  const wrap = document.createElement('div'); wrap.className = 'domain-grid';
  domains.forEach((d) => {
    const card = document.createElement('section'); card.className = `domain-card ${d.heavy ? 'heavy' : ''}`;
    const head = document.createElement('div'); head.className = 'domain-head';
    const badge = document.createElement('span'); badge.className = 'domain-badge'; badge.textContent = d.id;
    const name = document.createElement('h3'); name.textContent = d.name + (d.heavy ? ' 【个人核心】' : '');
    head.append(badge, name);
    const why = document.createElement('p'); why.className = 'domain-why'; why.textContent = d.why;
    const chips = document.createElement('div'); chips.className = 'cat-chips';
    d.categories.forEach((cat) => {
      const chip = document.createElement('button'); chip.className = 'cat-chip'; chip.textContent = cat.label || categoryLabel(cat.name);
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
  const intro = document.createElement('p'); intro.className = 'map-intro'; intro.textContent = '优先级跟随个人经历与长期方向，而不是跟随某一份 JD；目标岗位变化时，只调整投入权重。';
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
  document.body.classList.toggle('map-mode', state.view === 'map');
  document.body.classList.toggle('course-mode', state.view === 'course');
  document.body.classList.toggle('course-asr-mode', state.view === 'course' && state.tutorialId === 'asr-from-audio-to-delivery');
  document.body.classList.toggle('course-tts-mode', state.view === 'course' && state.tutorialId === 'tts-from-text-to-streaming-speech');
  renderMode();
  renderCategories();
  renderKindSwitch();
  renderProgress();
  renderQuestionPane();
  renderDetail();
  el('timer').textContent = formatRemaining(state.remaining);
}
function startMock() { state.mode = 'mock'; state.view = 'list'; state.mockQuestions = sampleQuestions(questions, 5); state.selectedId = state.mockQuestions[0]?.id; state.revealIndex = 0; state.detailLevel = 'deep'; state.remaining = 2700; clearInterval(state.timerId); state.timerId = setInterval(tick, 1000); render(); }
function returnReview() { state.mode = 'review'; state.view = 'map'; state.mapTab = 'personal'; state.revealIndex = 0; state.detailLevel = 'quick'; clearInterval(state.timerId); state.timerId = null; state.selectedId = questions[0].id; render(); }
el('search-input').addEventListener('input', (event) => { state.query = event.target.value; if (state.view !== 'resume') state.view = 'list'; selectQuestion(activeQuestions()[0]?.id); render(); });
el('clear-search').addEventListener('click', () => { const view = state.view === 'resume' ? 'resume' : 'list'; state.query = ''; state.category = '全部'; state.kind = '全部'; state.view = view; el('search-input').value = ''; selectQuestion(activeQuestions()[0]?.id); render(); });
el('start-mock').addEventListener('click', startMock); el('return-review').addEventListener('click', returnReview);
document.addEventListener('keydown', (event) => {
  const card = document.querySelector('.diagram-card.is-expanded');
  if (!card) return;
  if (event.key === 'Escape') { closeExpandedDiagram(card); return; }
  if (event.key !== 'Tab') return;
  const focusable = [...card.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')]
    .filter((node) => getComputedStyle(node).display !== 'none');
  if (!focusable.length) return;
  const first = focusable[0], last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
window.addEventListener('resize', () => updateDiagramOverflow());
render();
