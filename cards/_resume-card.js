import { explainResumePrerequisite } from './_resume-glossary.js';
import { resumeGrounding } from './_resume-grounding.js';

export function makeResumeCard({
  id,
  category,
  title,
  prompt,
  quickAnswer,
  why,
  implementation,
  tradeoffs,
  evaluation,
  prerequisites,
  workedExample,
  edgeCases,
  pitfalls,
  followUps,
  complexity,
  difficulty = 'Hard',
  order,
}) {
  const grounding = resumeGrounding(id);
  const direct = grounding.level === 'direct';
  const evidenceChain = direct
    ? [
      `要证明的主张：${title}`,
      `控制变量与实现：${implementation}`,
      `第一份具体证据：${workedExample[0]}`,
      `第二份对照证据：${workedExample[1]}`,
      `上线或决策门槛：${evaluation}`,
    ]
    : [
      `定位：这是“${grounding.label}”，不是新增的一段项目经历。`,
      `和简历的关系：${grounding.source}`,
      `需要理解的核心：${grounding.safeAnswer}`,
      `用于理解的例子：${workedExample[0]}`,
      `回答边界：${grounding.boundary}`,
    ];
  return {
    id,
    category,
    difficulty,
    ...(order ? { order } : {}),
    title,
    prompt,
    quickAnswer,
    resumeCard: true,
    experienceLevel: grounding.level,
    experienceLabel: grounding.label,
    resumeSource: grounding.source,
    safeAnswer: grounding.safeAnswer,
    claimBoundary: grounding.boundary,
    explanationFocus: `这道题真正考察的不是名词记忆，而是你能否解释“${title}”背后的判断依据，并用可复核证据说明结论。${why}`,
    approach: implementation,
    complexity,
    beginnerSummary: `${grounding.label}。${grounding.safeAnswer}`,
    interviewAnswer: [
      `先定范围：${grounding.label}。`,
      `30 秒安全回答：${grounding.safeAnswer}`,
      `简历依据：${grounding.source}`,
      `被继续追问时：${grounding.boundary}`,
    ],
    evidenceChain,
    derivation: [
      `为什么需要：${why}`,
      `怎么实现：${implementation}`,
      `有什么代价：${tradeoffs}`,
      `怎么评测：${evaluation}`,
    ],
    prerequisites: prerequisites.map(explainResumePrerequisite),
    workedExample: [
      `第 1 步：${workedExample[0]}`,
      `第 2 步：${workedExample[1]}`,
      `第 3 步：主动检查失败边界——${edgeCases[0]}。出现这种情况时，不能继续沿用正常样本的结论。`,
      `第 4 步：说明取舍——${tradeoffs}`,
      `第 5 步：按预先约定的口径收口——${evaluation}`,
    ],
    comparison: [
      { a: '弱回答', b: '强回答', note: `弱回答只复述“${title}”的术语；强回答会给出控制变量、具体对照、失败切片和决策门槛。` },
      { a: '最好数字', b: '可复核证据', note: `单个最好数字不能证明结论；需要把“${implementation}”与逐样本结果、回归护栏和复现条件一起说明。` },
    ],
    edgeCases,
    followUps,
    pitfalls,
    kind: 'concept',
  };
}
