export function filterQuestions(questions, category = '全部', query = '', kind = '全部') {
  const needle = query.trim().toLowerCase();
  return questions.filter((question) => {
    const matchesCategory = category === '全部' || question.category === category;
    const matchesKind = kind === '全部' || question.kind === kind;
    const haystack = `${question.id} ${question.title} ${question.prompt}`.toLowerCase();
    return matchesCategory && matchesKind && (!needle || haystack.includes(needle));
  });
}

export function sampleQuestions(questions, count, random = Math.random) {
  const pool = [...questions];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

export function getEmptyState(items) {
  return items.length
    ? { visible: false, message: '', canClear: false }
    : { visible: true, message: '没有找到匹配题目', canClear: true };
}

export function formatRemaining(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

export function detailSections(card, level = 'quick') {
  const kind = card?.kind || 'concept';
  if (kind === 'code') {
    // 代码题：强调真实现、朴素做法、循环不变量、执行追踪与逐行讲解
    const quick = [
      ['beginnerSummary', '入门概览', 'text'],
      ['diagram', '解题图例', 'diagram'],
      ['code', 'Python 标准代码', 'code'],
      ['bruteForce', '朴素做法', 'text'],
      ['complexity', '复杂度', 'text'],
      ['followUps', '常见追问', 'qa'],
      ['pitfalls', '易错点', 'list'],
    ];
    const deep = [
      ['beginnerSummary', '入门概览', 'text'],
      ['diagram', '解题图例', 'diagram'],
      ['prerequisites', '前置概念', 'concepts'],
      ['walkthrough', '执行追踪', 'text'],
      ['workedExample', '示例演练', 'steps'],
      ['derivation', '推导过程', 'steps'],
      ['code', 'Python 标准代码', 'code'],
      ['lineByLine', '逐行讲解', 'lineNotes'],
      ['invariant', '循环不变量', 'text'],
      ['complexity', '复杂度', 'text'],
      ['edgeCases', '边界情况', 'cards'],
      ['followUps', '常见追问', 'qa'],
      ['pitfalls', '易错点', 'list'],
    ];
    const fields = level === 'deep' ? deep : quick;
    return fields.map(([key, title, type]) => ({ key, title, type, value: card?.[key] }));
  }
  // 概念题：强调是什么/核心思路、五段式拆解、对比一览与延伸阅读
  const quick = [
    ['beginnerSummary', '入门概览', 'text'],
    ['diagram', '示意图解', 'diagram'],
    ['explanationFocus', '是什么', 'text'],
    ['approach', '核心思路', 'text'],
    ['code', '示意代码（公式）', 'code'],
    ['complexity', '说明', 'text'],
    ['followUps', '常见追问', 'qa'],
    ['pitfalls', '易错点', 'list'],
  ];
  const deep = [
    ['beginnerSummary', '入门概览', 'text'],
    ['diagram', '示意图解', 'diagram'],
    ['prerequisites', '前置概念', 'concepts'],
    ['explanationFocus', '是什么', 'text'],
    ['approach', '核心思路', 'text'],
    ['derivation', '五段式拆解', 'steps'],
    ['workedExample', '示例场景', 'steps'],
    ['code', '示意代码（公式）', 'code'],
    ['comparison', '对比一览', 'compare'],
    ['references', '延伸阅读', 'refs'],
    ['edgeCases', '边界情况', 'cards'],
    ['followUps', '常见追问', 'qa'],
    ['pitfalls', '易错点', 'list'],
  ];
  const fields = level === 'deep' ? deep : quick;
  return fields.map(([key, title, type]) => ({ key, title, type, value: card?.[key] }));
}

export function validateQuestionCard(card, { beginner = false } = {}) {
  const missing = [];
  const addMissing = (field) => {
    if (!missing.includes(field)) missing.push(field);
  };
  const isNonEmptyString = (value) => typeof value === 'string' && value.trim();
  const hasNonEmptyStrings = (field, minimum = 1) => (
    Array.isArray(card?.[field])
    && card[field].length >= minimum
    && card[field].every(isNonEmptyString)
  );
  const hasValidFollowUps = () => (
    Array.isArray(card?.followUps)
    && card.followUps.length >= 2
    && (
      card.followUps.every(isNonEmptyString)
      || card.followUps.every(
        (followUp) => isNonEmptyString(followUp?.question) && isNonEmptyString(followUp?.answer),
      )
    )
  );
  const scalarFields = [
    'id',
    'prompt',
    'quickAnswer',
    'code',
    'complexity',
  ];
  const arrayFields = [
    'derivation',
    'edgeCases',
    'pitfalls',
  ];

  for (const field of scalarFields) {
    if (typeof card?.[field] !== 'string' || !card[field].trim()) addMissing(field);
  }

  for (const field of arrayFields) {
    if (!hasNonEmptyStrings(field)) addMissing(field);
  }

  const legacyScalarFields = ['bruteForce', 'invariant', 'walkthrough'];
  const legacyArrayFields = ['codeNotes', 'followUpAnswers'];
  for (const field of legacyScalarFields) {
    if (field in (card ?? {}) && !isNonEmptyString(card[field])) addMissing(field);
  }
  for (const field of legacyArrayFields) {
    if (field in (card ?? {}) && !hasNonEmptyStrings(field)) addMissing(field);
  }

  if (!beginner && !hasValidFollowUps()) addMissing('followUps');
  if (Array.isArray(card?.edgeCases) && card.edgeCases.length < 3) addMissing('edgeCases');
  if (Array.isArray(card?.pitfalls) && card.pitfalls.length < 2) addMissing('pitfalls');
  if (Array.isArray(card?.followUpAnswers) && card.followUpAnswers.length < 2) {
    addMissing('followUpAnswers');
  }
  if (
    Array.isArray(card?.followUps)
    && Array.isArray(card?.followUpAnswers)
    && card.followUps.length !== card.followUpAnswers.length
  ) {
    addMissing('followUpAnswers');
  }

  if (beginner) {
    if (!isNonEmptyString(card?.beginnerSummary)) addMissing('beginnerSummary');
    for (const field of ['prerequisites', 'workedExample', 'lineByLine']) {
      if (!hasNonEmptyStrings(field, 2)) addMissing(field);
    }
    if (
      !Array.isArray(card?.followUps)
      || card.followUps.length < 2
      || card.followUps.some(
        (followUp) => !isNonEmptyString(followUp?.question) || !isNonEmptyString(followUp?.answer),
      )
    ) {
      addMissing('followUps');
    }
  }

  // kind 分支：仅对"已存在但非法形状"的字段报错，兼容旧卡（不强制缺失字段）
  const kind = card?.kind;
  if (kind === 'code') {
    if ('invariant' in (card ?? {}) && !isNonEmptyString(card.invariant)) addMissing('invariant');
    if ('walkthrough' in (card ?? {}) && !isNonEmptyString(card.walkthrough)) addMissing('walkthrough');
  } else if (kind === 'concept') {
    if ('explanationFocus' in (card ?? {}) && !isNonEmptyString(card.explanationFocus)) addMissing('explanationFocus');
    if ('approach' in (card ?? {}) && !isNonEmptyString(card.approach)) addMissing('approach');
  }

  return { valid: missing.length === 0, missing };
}
