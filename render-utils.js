// 纯展示层辅助函数：不修改题卡源数据，也不依赖 DOM。

export function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 正文公式只接受显式的 LaTeX 分隔符：\(...\) 为行内公式，\[...\] 为块级公式。
// 不解析 $...$，避免把 “A100 $2/h，A10 $0.8/h” 一类金额误判成数学表达式。
export function splitMathText(value) {
  const source = String(value == null ? '' : value);
  const segments = [];
  const delimiters = [
    { open: '\\(', close: '\\)', displayMode: false },
    { open: '\\[', close: '\\]', displayMode: true },
  ];
  const pushText = (text) => {
    if (!text) return;
    const previous = segments.at(-1);
    if (previous?.type === 'text') previous.value += text;
    else segments.push({ type: 'text', value: text });
  };

  let cursor = 0;
  while (cursor < source.length) {
    let next = null;
    for (const delimiter of delimiters) {
      const index = source.indexOf(delimiter.open, cursor);
      if (index !== -1 && (!next || index < next.index)) next = { ...delimiter, index };
    }
    if (!next) {
      pushText(source.slice(cursor));
      break;
    }

    const contentStart = next.index + next.open.length;
    const closeIndex = source.indexOf(next.close, contentStart);
    if (closeIndex === -1) {
      pushText(source.slice(cursor));
      break;
    }

    pushText(source.slice(cursor, next.index));
    const expression = source.slice(contentStart, closeIndex).trim();
    const raw = source.slice(next.index, closeIndex + next.close.length);
    if (expression) segments.push({ type: 'math', value: expression, displayMode: next.displayMode, raw });
    else pushText(raw);
    cursor = closeIndex + next.close.length;
  }

  return segments;
}

const LEADERS = new Set(['O', 'Ω', 'Θ']);
const BLOCKING_PREFIX = /[A-Za-z0-9_./\\]/;
const BLOCKING_SUFFIX = /[A-Za-z0-9_./\\]/;
const CJK = /[\u3400-\u9fff]/;

const METRIC_KEYWORDS = [
  ['时间', '时间'], ['time', '时间'],
  ['空间', '空间'], ['space', '空间'], ['内存', '空间'],
  ['显存', '显存'], ['vram', '显存'], ['gpu memory', '显存'],
  ['通信', '通信'], ['all-reduce', '通信'], ['all-to-all', '通信'], ['reduce-scatter', '通信'], ['all-gather', '通信'], ['带宽', '带宽'],
  ['hbm', '访存'], ['访存', '访存'],
  ['延迟', '延迟'], ['耗时', '延迟'], ['latency', '延迟'], ['ttft', '延迟'], ['tpot', '延迟'],
  ['成本', '成本'], ['cost', '成本'],
  ['吞吐', '吞吐'], ['qps', '吞吐'],
  ['参数量', '参数量'], ['参数规模', '参数量'], ['总参数', '参数量'], ['可训练参数', '参数量'], ['权重大小', '参数量'], ['parameter count', '参数量'], ['model size', '参数量'],
  ['利用率', '利用率'], ['mfu', '利用率'],
  ['气泡', '气泡'], ['bubble', '气泡'],
  ['计算', '计算'], ['算力', '计算'],
  ['平均', '平均'], ['最坏', '最坏'], ['最好', '最好'], ['摊还', '摊还'],
  ['召回', '检索'], ['检索', '检索'],
  ['prefill', 'Prefill'], ['decode', 'Decode'],
  ['训练', '训练'], ['推理', '推理'], ['生成', '生成'], ['构建', '构建'], ['评测', '评测'], ['调度', '调度'],
];

export function inferMetricLabel(context, fallback = '复杂度', anchor = String(context == null ? '' : context).length) {
  const source = String(context == null ? '' : context).toLowerCase();
  let best = { distance: Infinity, label: fallback };
  for (const [keyword, label] of METRIC_KEYWORDS) {
    let index = source.indexOf(keyword);
    while (index !== -1) {
      const distance = Math.abs(index + keyword.length / 2 - anchor);
      if (distance < best.distance) best = { distance, label };
      index = source.indexOf(keyword, index + keyword.length);
    }
  }
  return best.label;
}

// 用括号深度扫描 O(...)/Ω(...)/Θ(...)，而不是用正则猜嵌套边界。
// 返回的 source 永远来自原字符串；解析失败时不产生 formula，正文保持原样。
export function splitComplexity(value) {
  const source = String(value == null ? '' : value);
  const segments = [];
  let textStart = 0;
  let cursor = 0;

  while (cursor < source.length) {
    const leader = source[cursor];
    const previous = cursor > 0 ? source[cursor - 1] : '';
    if (!LEADERS.has(leader) || (previous && BLOCKING_PREFIX.test(previous))) {
      cursor += 1;
      continue;
    }

    let open = cursor + 1;
    while (source[open] === ' ' || source[open] === '\t') open += 1;
    if (source[open] !== '(') {
      cursor += 1;
      continue;
    }

    let depth = 0;
    let close = -1;
    for (let index = open; index < source.length; index += 1) {
      if (source[index] === '(') depth += 1;
      else if (source[index] === ')') {
        depth -= 1;
        if (depth === 0) {
          close = index;
          break;
        }
      }
    }
    if (close === -1) {
      cursor = open + 1;
      continue;
    }
    const next = source[close + 1] || '';
    const afterNext = source[close + 2] || '';
    const blockedSuffix = next && BLOCKING_SUFFIX.test(next)
      && !(next === '/' && afterNext && !/[A-Za-z0-9_.\\]/.test(afterNext));
    if (blockedSuffix) {
      cursor = close + 1;
      continue;
    }

    if (cursor > textStart) segments.push({ type: 'text', value: source.slice(textStart, cursor) });
    const formulaSource = source.slice(cursor, close + 1);
    segments.push({
      type: 'formula',
      value: formulaSource,
      latex: complexityToLatex(formulaSource),
      label: '复杂度',
    });
    cursor = close + 1;
    textStart = cursor;
  }

  if (textStart < source.length) segments.push({ type: 'text', value: source.slice(textStart) });
  if (!segments.length && source) segments.push({ type: 'text', value: source });
  segments.forEach((segment, index) => {
    if (segment.type !== 'formula') return;
    const before = segments[index - 1]?.type === 'text' ? metricEdge(segments[index - 1].value, 'left') : '';
    const after = segments[index + 1]?.type === 'text' ? metricEdge(segments[index + 1].value, 'right') : '';
    segment.label = inferMetricLabel(`${before} ${after}`, '复杂度', before.length);
  });
  return segments;
}

function metricEdge(value, side) {
  const parts = String(value == null ? '' : value).split(/[，,。；;、/|+]/);
  const edge = side === 'left' ? parts.at(-1) : parts[0];
  return side === 'left' ? edge.slice(-48) : edge.slice(0, 48);
}

export function complexityToLatex(value) {
  const source = String(value == null ? '' : value).trim();
  if (!source || CJK.test(source) || /[$%"'`~]/.test(source)) return null;
  if (!/^(?:O|Ω|Θ)\s*\([\s\S]*\)$/.test(source)) return null;
  // 不把明显不完整的表达式交给 KaTeX，例如 O(h·)。
  if (/[+\-*/·×]\s*\)$/.test(source)) return null;

  const superscripts = {
    '²': '^{2}', '³': '^{3}', '⁴': '^{4}', 'ⁿ': '^{n}', 'ᵏ': '^{k}', 'ᵐ': '^{m}',
  };
  return source
    .replace(/^O/, '\\mathrm{O}')
    .replace(/^Ω/, '\\Omega')
    .replace(/^Θ/, '\\Theta')
    .replace(/[²³⁴ⁿᵏᵐ]/g, (symbol) => superscripts[symbol])
    .replace(/\^([A-Za-z0-9]+)/g, '^{$1}')
    .replace(/·/g, '\\cdot ')
    .replace(/×/g, '\\times ')
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/±/g, '\\pm ')
    .replace(/√\s*([A-Za-z0-9]+)/g, '\\sqrt{$1}')
    .replace(/([A-Za-z0-9}])′/g, '$1^{\\prime}')
    .replace(/\blog\b/g, '\\log')
    .replace(/\bmin\b/g, '\\min')
    .replace(/\bmax\b/g, '\\max');
}

export function complexityView(value) {
  const source = String(value == null ? '' : value);
  const segments = splitComplexity(source);
  const bigOFormulas = segments.filter((segment) => segment.type === 'formula');
  return {
    source,
    // 有 O/Ω/Θ 时优先展示这些结构化表达式；否则把明确的等式子句作为纯文本公式行。
    // 后者不送入 KaTeX，既覆盖 “bubble ≈ ...” 等公式，也不会误猜中文 TeX。
    formulas: bigOFormulas.length ? bigOFormulas : extractEquationClauses(source),
  };
}

export function extractEquationClauses(value) {
  const source = String(value == null ? '' : value);
  return source
    .split(/[；;。]/)
    .map(extractEquationClause)
    .filter(Boolean);
}

function extractEquationClause(rawClause) {
  let clause = String(rawClause).trim();
  if (!clause || /例如|譬如|比如/.test(clause)) return null;
  const operatorMatch = findTopLevelEquationOperator(clause);
  if (!operatorMatch) return null;

  // 公式后的说明从顶层逗号开始，不把整段中文解释塞进居中的公式行。
  let depth = 0;
  for (let index = operatorMatch.index + operatorMatch[0].length; index < clause.length; index += 1) {
    if ('（(['.includes(clause[index])) depth += 1;
    else if ('）)]'.includes(clause[index])) depth = Math.max(0, depth - 1);
    else if (depth === 0 && (clause[index] === '，' || clause[index] === ',')) {
      clause = clause.slice(0, index).trim();
      break;
    }
  }

  const operator = findTopLevelEquationOperator(clause);
  if (!operator) return null;
  const lhs = clause.slice(0, operator.index).trim();
  const rhs = clause.slice(operator.index + operator[0].length).trim();
  if (!lhs || !rhs || /^[\d.,，]/.test(lhs) || lhs.length > 28 || rhs.length > 72 || clause.length > 96) return null;
  if (/需|但是|但|因此|所以|建议|说明|可能|否则|意味着/.test(clause)) return null;
  if (/\s(?:时|则|会)\b|时占用率/.test(rhs)) return null;

  const shortLhs = lhs.replace(/^整体|^总/, '').trim();
  const inferred = inferMetricLabel(lhs, '关系式');
  const label = inferred === '关系式' && shortLhs.length <= 10 ? shortLhs : inferred;
  return { type: 'formula', value: clause, latex: null, label };
}

function findTopLevelEquationOperator(source) {
  let depth = 0;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if ('（(['.includes(char)) { depth += 1; continue; }
    if ('）)]'.includes(char)) { depth = Math.max(0, depth - 1); continue; }
    if (depth !== 0) continue;
    if (char === '≈' || char === '∝') return { 0: char, index, length: 1 };
    if (char === '=' && source[index - 1] !== '<' && source[index - 1] !== '>' && source[index - 1] !== '!' && source[index + 1] !== '=') {
      return { 0: char, index, length: 1 };
    }
  }
  return null;
}

const FLOW_ARROW = /\s*(?:-->|->|→|⇒|==>|=>|─+[>▶►])\s*/;

function hasUnsafeTopLevelLabel(label) {
  let depth = 0;
  for (const char of label) {
    if ('（(['.includes(char)) depth += 1;
    else if ('）)]'.includes(char)) depth = Math.max(0, depth - 1);
    else if (depth === 0 && (char === '/' || char === ',' || char === '，')) return true;
  }
  return depth !== 0;
}

// 只识别无分支、无标注、无回环的一行短链。复杂图保留原 ASCII，绝不猜结构。
export function parseSimpleFlowChain(value) {
  const source = String(value == null ? '' : value).trim();
  if (!source || source.includes('\n') || source.length > 240) return null;
  if (/<->|<--|↔|-{3,}>|--[^>\n]+-->|─[^▶►>\n]{1,24}─+[▶►>]|\.{3}|…|[↑↓?{};；"'`]/.test(source)) return null;
  const labels = source.split(FLOW_ARROW).map((label) => label.trim());
  if (labels.length < 2 || labels.length > 8) return null;
  if (labels.some((label) => !label || label.length > 42 || /--/.test(label) || hasUnsafeTopLevelLabel(label))) return null;
  // 非末节点里的大段空白通常表示同一行画了第二条泳道，不能串成单链。
  if (labels.slice(0, -1).some((label) => /\s{2,}\S/.test(label))) return null;
  if (new Set(labels).size !== labels.length) return null;
  return labels;
}

export function diagramHtml(value) {
  const source = String(value == null ? '' : value);
  const tokenPattern = /(-->|->|→|⇒|↔|==>|=>|─+[>▶►]|\[[^\]\n]{1,64}\]|[┌┐└┘├┤┬┴┼│─╭╮╰╯╱╲]+)/gu;
  let html = '';
  let cursor = 0;
  for (const match of source.matchAll(tokenPattern)) {
    html += escapeHtml(source.slice(cursor, match.index));
    const token = match[0];
    const className = token.startsWith('[') ? 'diagram-node' : /(?:>|▶|►|→|⇒|↔)$/.test(token) ? 'arrow' : 'diagram-connector';
    html += `<span class="${className}">${escapeHtml(token)}</span>`;
    cursor = match.index + token.length;
  }
  return html + escapeHtml(source.slice(cursor));
}
