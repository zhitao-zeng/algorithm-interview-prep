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

const GREEK_LATEX = {
  'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma', 'δ': '\\delta', 'ε': '\\varepsilon', 'ζ': '\\zeta', 'η': '\\eta', 'θ': '\\theta',
  'ι': '\\iota', 'κ': '\\kappa', 'λ': '\\lambda', 'μ': '\\mu', 'ν': '\\nu', 'ξ': '\\xi', 'ο': 'o', 'π': '\\pi',
  'ρ': '\\rho', 'σ': '\\sigma', 'τ': '\\tau', 'υ': '\\upsilon', 'φ': '\\phi', 'χ': '\\chi', 'ψ': '\\psi', 'ω': '\\omega',
  'Α': 'A', 'Β': 'B', 'Γ': '\\Gamma', 'Δ': '\\Delta', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Θ': '\\Theta',
  'Ι': 'I', 'Κ': 'K', 'Λ': '\\Lambda', 'Μ': 'M', 'Ν': 'N', 'Ξ': '\\Xi', 'Ο': 'O', 'Π': '\\Pi',
  'Ρ': 'P', 'Σ': '\\Sigma', 'Τ': 'T', 'Υ': '\\Upsilon', 'Φ': '\\Phi', 'Χ': 'X', 'Ψ': '\\Psi', 'Ω': '\\Omega',
};
const SUPERSCRIPT_LATEX = {
  '²': '^{2}', '³': '^{3}', '⁴': '^{4}', 'ⁿ': '^{n}', 'ᵏ': '^{k}', 'ᵐ': '^{m}', 'ᵀ': '^{T}',
};
const AUTO_MATH_WORDS = new Set([
  'avg', 'aux', 'batch', 'cos', 'data', 'decode', 'dim', 'exp', 'head', 'heads', 'hyp', 'key', 'log', 'logits',
  'layernorm', 'loss', 'max', 'mean', 'min', 'model', 'neg', 'old', 'pos', 'pred', 'prefill', 'prob', 'query',
  'rank', 'ref', 'reward', 'rms', 'rmsnorm', 'round', 'score', 'seq', 'sigmoid', 'simple', 'sin', 'softmax',
  'space', 'sqrt', 'std', 'student', 'sum', 'teacher', 'test', 'time', 'token', 'total', 'train', 'value', 'var',
]);
const ALLOWED_SUBSCRIPTS = new Set([
  '0', '1', '2', 'aux', 'avg', 'data', 'gt', 'h', 'head', 'heads', 'hyp', 'i', 'in', 'j', 'k', 'l', 'm', 'max',
  'min', 'model', 'n', 'neg', 'new', 'old', 'out', 'p', 'pos', 'pred', 'q', 'ref', 'simple', 't', 'test', 'token',
  'total', 'train', 'v',
]);

export function plainMathToLatex(value) {
  let source = String(value == null ? '' : value).trim();
  if (!source || CJK.test(source) || /[$`"']/u.test(source)) return null;

  source = convertSquareRoots(source)
    .replace(/\|\|([^|\n]{1,100})\|\|/g, '\\lVert $1 \\rVert')
    .replace(/([Α-Ωα-ω])\u0304/gu, (_, symbol) => `\\bar{${GREEK_LATEX[symbol] || symbol}}`)
    .replace(/\bN\s*(?=\()/g, '\\mathcal{N}')
    .replace(/\bE\s*(?=\[)/g, '\\mathbb{E}')
    .replace(/\bsoftmax\b/gi, '\\operatorname{softmax}')
    .replace(/\bsigmoid\b/gi, '\\operatorname{sigmoid}')
    .replace(/\b(?:LayerNorm|RMSNorm|RMS|KL|CE|mean|std|round)\b/g, (name) => `\\operatorname{${name}}`)
    .replace(/\blog\b/gi, '\\log')
    .replace(/\bln\b/gi, '\\ln')
    .replace(/\bexp\b/gi, '\\exp')
    .replace(/\bmin\b/gi, '\\min')
    .replace(/\bmax\b/gi, '\\max')
    .replace(/∑|Σ/g, '\\sum ')
    .replace(/∏|Π/g, '\\prod ')
    .replace(/[Α-Ωα-ω]/gu, (symbol) => GREEK_LATEX[symbol] || symbol)
    .replace(/[²³⁴ⁿᵏᵐᵀ]/gu, (symbol) => SUPERSCRIPT_LATEX[symbol] || symbol)
    .replace(/_(?!\{)([A-Za-z0-9]+(?:_[A-Za-z0-9]+)*)/g, (_, subscript) => {
      const escaped = subscript.replace(/_/g, '\\_');
      return subscript.length > 1 ? `_{\\mathrm{${escaped}}}` : `_{${subscript}}`;
    })
    .replace(/\^(?!\{)([-A-Za-z0-9]+)/g, (_, exponent) => (
      /^[A-Za-z]{2,}$/.test(exponent) ? `^{\\mathrm{${exponent}}}` : `^{${exponent}}`
    ))
    .replace(/∫/g, '\\int ')
    .replace(/∞/g, '\\infty ')
    .replace(/≈/g, '\\approx ')
    .replace(/≃|≅/g, '\\simeq ')
    .replace(/∝/g, '\\propto ')
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/≪/g, '\\ll ')
    .replace(/≫/g, '\\gg ')
    .replace(/±/g, '\\pm ')
    .replace(/∈/g, '\\in ')
    .replace(/∉/g, '\\notin ')
    .replace(/⊂/g, '\\subset ')
    .replace(/⊆/g, '\\subseteq ')
    .replace(/∪/g, '\\cup ')
    .replace(/∩/g, '\\cap ')
    .replace(/⊙/g, '\\odot ')
    .replace(/⊗/g, '\\otimes ')
    .replace(/·|⋅/g, '\\cdot ')
    .replace(/×/g, '\\times ')
    .replace(/−/g, '-')
    .replace(/∇/g, '\\nabla ')
    .replace(/‖/g, '\\Vert ')
    .replace(/′/g, '^{\\prime}')
    .replace(/(?<!\|)\|(?!\|)/g, '\\mid ')
    .replace(/~/g, '\\sim ')
    .replace(/\s+/g, ' ')
    .trim();
  return source || null;
}

function convertSquareRoots(value) {
  const source = String(value);
  let result = '';
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] !== '√') {
      result += source[index];
      continue;
    }
    let start = index + 1;
    while (/\s/.test(source[start] || '')) start += 1;
    if (source[start] === '(') {
      let depth = 0, close = -1;
      for (let cursor = start; cursor < source.length; cursor += 1) {
        if (source[cursor] === '(') depth += 1;
        else if (source[cursor] === ')' && --depth === 0) { close = cursor; break; }
      }
      if (close !== -1) {
        result += `\\sqrt{${convertSquareRoots(source.slice(start + 1, close))}}`;
        index = close;
        continue;
      }
    }
    const token = source.slice(start).match(/^[A-Za-zΑ-Ωα-ω0-9_]+/u)?.[0];
    if (token) {
      result += `\\sqrt{${token}}`;
      index = start + token.length - 1;
    } else {
      result += source[index];
    }
  }
  return result;
}

function trimCandidate(source, index, raw) {
  const left = raw.match(/^[\s,;:]*/u)?.[0].length || 0;
  const right = raw.match(/[\s,;:]*$/u)?.[0].length || 0;
  return { start: index + left, end: index + raw.length - right, raw: raw.slice(left, raw.length - right) };
}

function hasBalancedDelimiters(raw) {
  const stack = [];
  const opening = new Set(['(', '[', '{']);
  const closing = { ')': '(', ']': '[', '}': '{' };
  for (const char of raw) {
    if (opening.has(char)) stack.push(char);
    else if (closing[char] && stack.pop() !== closing[char]) return false;
  }
  return stack.length === 0;
}

function isFormulaRun(raw) {
  if (!raw || raw.length > 180 || /(?:->|=>|--|:\/\/)/.test(raw)) return false;
  if (/[-~]\s*[A-Za-z]{3,}\b/.test(raw)) return false;
  const words = raw.match(/[A-Za-z]{3,}/g) || [];
  if (words.some((word) => !AUTO_MATH_WORDS.has(word.toLowerCase()))) return false;
  const hasRelation = /(?:^|[^!])=(?!=)|[≈≃≅∝≤≥≪≫<>]/.test(raw);
  const hasTildeDistribution = /~/.test(raw) && /(?:_[A-Za-z0-9]+|\bN\s*\()/.test(raw);
  const signalCount = (raw.match(/[Α-Ωα-ω]|_[A-Za-z0-9]+|[²³⁴ⁿᵏᵐᵀ]|[√∑Σ∏∫∞]/gu) || []).length;
  const hasOperatorChain = signalCount >= 2 && /[·⋅×*/+\-−]/.test(raw);
  if (!hasRelation && !hasTildeDistribution && !hasOperatorChain) return false;
  if (hasRelation) {
    const relation = raw.match(/(?:^|[^!])=(?!=)|[≈≃≅∝≤≥≪≫<>]/)?.[0] || '';
    const index = raw.indexOf(relation.trim());
    if (index <= 0 || index >= raw.length - relation.trim().length) return false;
  }
  return /[A-Za-zΑ-Ωα-ω]/u.test(raw);
}

function addCandidate(candidates, source, index, raw) {
  const candidate = trimCandidate(source, index, raw);
  if (!candidate.raw || candidate.end <= candidate.start) return;
  if (!hasBalancedDelimiters(candidate.raw)) return;
  if (/^[+*/·⋅×≈≃≅∝≤≥≪≫=<>|~]|[+\-*/·⋅×≈≃≅∝≤≥≪≫=<>|~√∑Σ∏Π∫]$/u.test(candidate.raw)) return;
  const latex = plainMathToLatex(candidate.raw);
  if (latex) candidates.push({ ...candidate, latex });
}

function collectImplicitMathCandidates(source) {
  const candidates = [];
  const formulaRun = /[A-Za-zΑ-Ωα-ω0-9_{}\[\]().,;:!+\-−*/^·⋅×≈≃≅∝≤≥≪≫=<>|‖~√∇∑Σ∏Π∫∞∈∉⊂⊆∪∩⊙⊗±′²³⁴ⁿᵏᵐᵀ\u0304 ]{3,}/gu;
  for (const match of source.matchAll(formulaRun)) {
    const candidate = trimCandidate(source, match.index, match[0]);
    if (isFormulaRun(candidate.raw)) addCandidate(candidates, source, candidate.start, candidate.raw);
  }

  const functionStart = /\b(?:Pr|KL|p|q|P|N)\s*\(/g;
  for (const match of source.matchAll(functionStart)) {
    const open = source.indexOf('(', match.index);
    let depth = 0, close = -1;
    for (let index = open; index < source.length; index += 1) {
      if (source[index] === '(') depth += 1;
      else if (source[index] === ')') {
        depth -= 1;
        if (depth === 0) { close = index; break; }
      }
    }
    if (close !== -1 && !/[A-Za-z0-9_]/.test(source[close + 1] || '')) {
      addCandidate(candidates, source, match.index, source.slice(match.index, close + 1));
    }
  }

  const atomicPatterns = [
    /\|\|[^|\n]{1,100}\|\|(?:[²³⁴ⁿᵏᵐ]|^[A-Za-z0-9]+)?/gu,
    /√(?:\([^\n)]{1,100}\)|[A-Za-zΑ-Ωα-ω0-9_]+)/gu,
    /[∑Σ∏Π](?:_[^\s,，。;；]+)?[A-Za-zΑ-Ωα-ω0-9_²³⁴ⁿᵏᵐ]*/gu,
    /\b(?:\d+|[A-Z])(?:\s*[×x]\s*(?:\d+|[A-Z])){1,4}\b/g,
    /\b[A-Z]{1,4}(?:ᵀ|\^T)/gu,
    /[Α-Ωα-ω](?:\u0304)?(?:_[A-Za-z0-9]+|[₀-₉]+)?(?:\^[A-Za-z0-9]+|[²³⁴ⁿᵏᵐᵀ]+)?/gu,
    /\b[A-Za-z]_[A-Za-z0-9]+(?:\^[A-Za-z0-9]+|[²³⁴ⁿᵏᵐᵀ]+)?/g,
    /\b(?:x|y|z)[tT0-9]+\b/g,
    /\b[A-Za-z][A-Za-z0-9]*[²³⁴ⁿᵏᵐᵀ]+\b/gu,
  ];
  for (const pattern of atomicPatterns) {
    for (const match of source.matchAll(pattern)) {
      const raw = match[0];
      const previous = source[match.index - 1] || '';
      const next = source[match.index + raw.length] || '';
      if (/[Α-Ωα-ω]/u.test(raw) && ((next === '-' && /[A-Za-z]/.test(source[match.index + raw.length + 1] || '')) || previous === '-')) continue;
      const subscript = raw.match(/^[A-Za-z]_([A-Za-z0-9]+)/)?.[1];
      if (subscript && !ALLOWED_SUBSCRIPTS.has(subscript.toLowerCase()) && !/^\d+$/.test(subscript)) continue;
      if (/^x(?:32|64|86)$/.test(raw)) continue;
      addCandidate(candidates, source, match.index, raw);
    }
  }
  return candidates;
}

function splitImplicitMathText(value) {
  const source = String(value == null ? '' : value);
  const withComplexity = splitComplexity(source);
  const segments = [];
  for (const segment of withComplexity) {
    if (segment.type === 'formula') {
      segments.push({ type: 'math', value: segment.value, latex: segment.latex, displayMode: false, raw: segment.value });
      continue;
    }
    const text = segment.value;
    const candidates = collectImplicitMathCandidates(text)
      .sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
    const selected = [];
    let coveredUntil = -1;
    for (const candidate of candidates) {
      if (candidate.start < coveredUntil) continue;
      selected.push(candidate);
      coveredUntil = candidate.end;
    }
    let cursor = 0;
    for (const candidate of selected) {
      if (candidate.start > cursor) segments.push({ type: 'text', value: text.slice(cursor, candidate.start) });
      segments.push({ type: 'math', value: candidate.raw, latex: candidate.latex, displayMode: false, raw: candidate.raw });
      cursor = candidate.end;
    }
    if (cursor < text.length) segments.push({ type: 'text', value: text.slice(cursor) });
  }
  return segments;
}

// 显式公式优先；普通文本再做保守识别。返回的 raw/text 拼接后始终等于原文。
export function splitRichText(value) {
  const segments = [];
  for (const segment of splitMathText(value)) {
    const next = segment.type === 'math'
      ? [{ ...segment, latex: segment.value }]
      : splitImplicitMathText(segment.value);
    for (const item of next) {
      const previous = segments.at(-1);
      if (item.type === 'text' && previous?.type === 'text') previous.value += item.value;
      else segments.push(item);
    }
  }
  return segments;
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
