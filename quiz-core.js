export function filterQuestions(questions, category = '全部', query = '') {
  const needle = query.trim().toLowerCase();
  return questions.filter((question) => {
    const matchesCategory = category === '全部' || question.category === category;
    const haystack = `${question.id} ${question.title} ${question.prompt}`.toLowerCase();
    return matchesCategory && (!needle || haystack.includes(needle));
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
  const quick = [
    ['quickAnswer', '快速结论', 'text'],
    ['code', 'Python 标准代码', 'code'],
    ['complexity', '复杂度', 'text'],
    ['followUps', '常见追问', 'list'],
    ['pitfalls', '易错点', 'list'],
  ];
  const deep = [
    ['bruteForce', '暴力解法', 'text'],
    ['derivation', '推导过程', 'steps'],
    ['invariant', '不变量', 'text'],
    ['walkthrough', '手动演练', 'text'],
    ['edgeCases', '边界情况', 'cards'],
    ['codeNotes', '代码要点', 'list'],
  ];
  const fields = level === 'deep' ? [...quick, ...deep] : quick;
  return fields.map(([key, title, type]) => ({ key, title, type, value: card?.[key] }));
}

export function validateQuestionCard(card) {
  const missing = [];
  const addMissing = (field) => {
    if (!missing.includes(field)) missing.push(field);
  };
  const scalarFields = [
    'id',
    'prompt',
    'quickAnswer',
    'bruteForce',
    'invariant',
    'walkthrough',
    'code',
    'complexity',
  ];
  const arrayFields = [
    'derivation',
    'codeNotes',
    'edgeCases',
    'followUps',
    'followUpAnswers',
    'pitfalls',
  ];

  for (const field of scalarFields) {
    if (typeof card?.[field] !== 'string' || !card[field].trim()) addMissing(field);
  }

  for (const field of arrayFields) {
    if (
      !Array.isArray(card?.[field])
      || card[field].length === 0
      || card[field].some((item) => typeof item !== 'string' || !item.trim())
    ) {
      addMissing(field);
    }
  }

  if (Array.isArray(card?.edgeCases) && card.edgeCases.length < 3) addMissing('edgeCases');
  if (Array.isArray(card?.pitfalls) && card.pitfalls.length < 2) addMissing('pitfalls');
  if (Array.isArray(card?.followUps) && card.followUps.length < 2) addMissing('followUps');
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

  return { valid: missing.length === 0, missing };
}
