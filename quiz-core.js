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
  if (card?.resumeCard) {
    const deepDiveTitle = card.experienceLevel === 'direct'
      ? '项目深挖：为什么、怎么做、代价、评测'
      : '延伸补课（不等于项目经历）';
    const evidenceTitle = card.experienceLevel === 'direct' ? '本题证据链' : '与简历的关系';
    const quick = [
      ['beginnerSummary', '先确认：这是不是我做过的', 'text'],
      ['resumeSource', '简历原文依据', 'text'],
      ['safeAnswer', '我可以安全地这样回答', 'text'],
      ['claimBoundary', '不要越界', 'text'],
      ['followUps', '常见追问', 'qa'],
      ['pitfalls', '容易说错的地方', 'list'],
    ];
    const deep = [
      ['beginnerSummary', '先确认：这是不是我做过的', 'text'],
      ['resumeSource', '简历原文依据', 'text'],
      ['safeAnswer', '我可以安全地这样回答', 'text'],
      ['claimBoundary', '不要越界', 'text'],
      ['technicalPrompt', '深入时，面试官可能这样问', 'text'],
      ['interviewAnswer', '被追问时的回答顺序', 'steps'],
      ['prerequisites', '术语拆解', 'concepts'],
      ['evidenceChain', evidenceTitle, 'steps'],
      ['derivation', deepDiveTitle, 'steps'],
      ['workedExample', '一步一步走完整案例', 'steps'],
      ['comparison', '弱回答与强回答', 'compare'],
      ['complexity', '成本与复杂度', 'text'],
      ['edgeCases', '失败边界', 'cards'],
      ['followUps', '常见追问', 'qa'],
      ['pitfalls', '容易说错的地方', 'list'],
    ];
    const fields = level === 'deep' ? deep : quick;
    return fields.map(([key, title, type]) => ({ key, title, type, value: card?.[key] }));
  }
  if (card?.speechTeachingV2) {
    const codeTitle = card.codeMode === 'executable'
      ? '可运行实现 / 核心代码'
      : '实现草图（用于理解，不保证可直接运行）';
    const codeNotesTitle = card.codeMode === 'executable' ? '逐行讲解' : '草图说明';
    const quick = [
      ['beginnerSummary', '先讲人话', 'text'],
      ['knowledgeBoundary', '先分清：这是知识还是经历', 'text'],
      ['interviewAnswer', '面试回答：30 秒到 2 分钟', 'steps'],
      ['conceptPath', '学习路径', 'steps'],
      ['followUps', '常见追问', 'qa'],
      ['pitfalls', '容易弄错的地方', 'list'],
    ];
    const deep = [
      ['beginnerSummary', '先讲人话', 'text'],
      ['knowledgeBoundary', '先分清：这是知识还是经历', 'text'],
      ['interviewAnswer', '面试回答：30 秒到 2 分钟', 'steps'],
      ['prerequisites', '术语拆解', 'concepts'],
      ['conceptPath', '从问题到答案', 'steps'],
      ['diagram', '结构图解', 'diagram'],
      ['derivation', '为什么、怎么做、代价、评测', 'steps'],
      ['guidedExample', '一步一步走完整案例', 'steps'],
      ['code', codeTitle, 'code'],
      ['lineByLine', codeNotesTitle, 'lineNotes'],
      ['complexity', '成本与复杂度', 'text'],
      ['references', '原论文与官方资料', 'refs'],
      ['edgeCases', '失败边界', 'cards'],
      ['followUps', '常见追问', 'qa'],
      ['pitfalls', '容易弄错的地方', 'list'],
    ];
    const fields = level === 'deep' ? deep : quick;
    return fields.map(([key, title, type]) => ({ key, title, type, value: card?.[key] }));
  }
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
    ['complexity', '公式与复杂度', 'text'],
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
  const kind = card?.kind;
  const scalarFields = [
    'id',
    'prompt',
    'quickAnswer',
    'complexity',
  ];
  if (kind === 'code') scalarFields.push('code');
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
    for (const field of ['prerequisites', 'workedExample']) {
      if (!hasNonEmptyStrings(field, 2)) addMissing(field);
    }
    if (kind === 'code' && !hasNonEmptyStrings('lineByLine', 2)) addMissing('lineByLine');
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
  if (kind === 'code') {
    if ('invariant' in (card ?? {}) && !isNonEmptyString(card.invariant)) addMissing('invariant');
    if ('walkthrough' in (card ?? {}) && !isNonEmptyString(card.walkthrough)) addMissing('walkthrough');
  } else if (kind === 'concept') {
    if ('explanationFocus' in (card ?? {}) && !isNonEmptyString(card.explanationFocus)) addMissing('explanationFocus');
    if ('approach' in (card ?? {}) && !isNonEmptyString(card.approach)) addMissing('approach');
  }

  if (card?.resumeCard) {
    for (const field of ['experienceLevel', 'experienceLabel', 'resumeSource', 'safeAnswer', 'claimBoundary', 'technicalTitle', 'technicalPrompt']) {
      if (!isNonEmptyString(card?.[field])) addMissing(field);
    }
    if (!['direct', 'supporting', 'general'].includes(card.experienceLevel)) addMissing('experienceLevel');
    if (!hasNonEmptyStrings('interviewAnswer', 4)) addMissing('interviewAnswer');
    if (!hasNonEmptyStrings('evidenceChain', 5)) addMissing('evidenceChain');
    if (
      !Array.isArray(card?.comparison)
      || card.comparison.length < 2
      || card.comparison.some((row) => !isNonEmptyString(row?.a) || !isNonEmptyString(row?.b) || !isNonEmptyString(row?.note))
    ) addMissing('comparison');
  }

  if (card?.speechTeachingV2) {
    if (!hasNonEmptyStrings('interviewAnswer', 4)) addMissing('interviewAnswer');
    if (!hasNonEmptyStrings('conceptPath', 4)) addMissing('conceptPath');
    if (!hasNonEmptyStrings('guidedExample', 4)) addMissing('guidedExample');
    if (!['executable', 'illustrative', 'none'].includes(card.codeMode)) addMissing('codeMode');
    if (
      !hasNonEmptyStrings('prerequisites', 2)
      || card.prerequisites.some((term) => !term.includes('：') || term.length < 24)
    ) addMissing('prerequisites');
  }

  return { valid: missing.length === 0, missing };
}
