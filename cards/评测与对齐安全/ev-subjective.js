export default {
  "id": "ev-subjective",
  "kind": "concept",
  "category": "评测与对齐安全",
  "title": "主观评测：ELO/偏好对战与 LLM-as-Judge",
  "difficulty": "Medium",
  "prompt": "主观评测里 ELO 排名、偏好对战和 LLM-as-Judge 分别是怎么做的？如何保证与人类偏好对齐？",
  "quickAnswer": "偏好对战让评测者（人类或强模型）在成对回答中选更优者，ELO/Bradley-Terry 把胜负压成连续分数做全局排名。LLM-as-Judge 用强模型替代人类打分以降本提速，但需校准偏差（位置、长度、自我偏好）。与人类对齐靠人工标注黄金集定期度量一致性（如 Cohen's κ、准确率），并采用多裁判、去偏 prompt 与不确定性校准。",
  "complexity": "O(M·log K) 对战收敛",
  "beginnerSummary": "很多答案没有唯一标准答案，于是让『裁判』比较两个回答谁更好，积攒大量对战结果后算出每个模型的相对强弱分数。",
  "explanationFocus": "是什么：主观评测针对开放式、无标准答案的任务，通过成对偏好比较（人类或模型裁判）并基于 ELO/Bradley-Terry 模型估计模型相对质量分数，LLM-as-Judge 则是用强语言模型充当自动裁判。",
  "approach": "先采成对对战数据（A/B 互换位置消除位置偏置），用 Bradley-Terry 最大似然估计各模型胜率参数得到 ELO 分数；LLM-as-Judge 时固定评分 rubric、双盲互换、多裁判投票，并用人标黄金集计算与人类的相关系数来校准可信度。",
  "code": "import math\n\ndef btl_update(ra, rb, sa, lr=0.1):\n    # sa=1 表示 a 胜，0 表示 b 胜；按梯度更新 ELO\n    ea = 1 / (1 + 10 ** ((rb - ra) / 400))\n    return ra + lr * 400 * (sa - ea), rb - lr * 400 * (sa - ea)\n\ndef judge_pair(prompt, a, b, model):\n    # 双盲：随机交换顺序调用两次取一致\n    return model.score(prompt, a, b)",
  "derivation": [
    "为什么需要：开放生成无标准答案，客观精确匹配失效，必须用相对偏好刻画质量。",
    "怎么实现：收集成对对战，Bradley-Terry 假设 P(A>B)=σ(ra-rb)，用梯度上升最大化观测胜负的对数似然估计各 r。",
    "有什么代价：人类标注昂贵且方差大；LLM-as-Judge 有位置/长度/自我偏好等系统偏差，且可能互相『讨好』放大错误共识。",
    "怎么评测：用人类黄金对战集算裁判与人类的一致性（准确率/κ）；报告不同裁判方差、对战次数置信区间与跨集稳定性。"
  ],
  "edgeCases": [
    "平局或两者都差时裁判被迫选优，需引入『平局/都拒』选项。",
    "位置偏置：答案出现在前/后影响选择，必须双盲互换取多数。",
    "长度偏置：裁判偏好更长更啰嗦的回答，需用 rubrics 约束。",
    "自我偏好：裁判更偏好同家族模型输出，需交叉验证。"
  ],
  "pitfalls": [
    "只用单一 LLM 裁判且不校验，把模型偏见当成『客观质量』。",
    "对战样本非随机（同类难度的题才该对战），否则 ELO 失真。"
  ],
  "prerequisites": [
    "Bradley-Terry / ELO 概率模型与最大似然估计。",
    "人类偏好标注与一致性指标（κ、ICC）。"
  ],
  "workedExample": [
    "Chatbot Arena 用人类对战累积百万级对局，按 ELO 排开源/闭源模型榜。",
    "用 GPT-4 当裁判对 1000 对回答打分，与人类子集一致性 80% 才肯上线替代人工抽检。"
  ],
  "lineByLine": [
    "import math：虽未直接用，预留对数运算空间，体现模块依赖。",
    "def btl_update(...)：ELO 梯度更新，sa 为实际赛果（1/0）。",
    "ea = 1/(1+10**(...))：按分差算期望胜率。",
    "return ra+..., rb-...：胜者加分、负者减分，零和保持总分解散。"
  ],
  "followUps": [
    {
      "question": "LLM-as-Judge 的主要偏差有哪些、如何缓解？",
      "answer": "主要有位置偏置、长度偏置、自我偏好与风格偏见。缓解：双盲互换位置取多数、固定结构化 rubric、多裁判投票、用更强调节温度、并用人标集持续校准。"
    },
    {
      "question": "ELO 与 Bradley-Terry 的关系？",
      "answer": "ELO 是 Bradley-Terry 的特例：把胜率建模为分差 logistic，ELO 分数为 r 的对数值映射；BT 更自然地支持多模型联合最大似然估计与置信区间。"
    }
  ],
  "followUpAnswers": [
    "主要有位置偏置、长度偏置、自我偏好与风格偏见。缓解：双盲互换位置取多数、固定结构化 rubric、多裁判投票、用更强调节温度、并用人标集持续校准。",
    "ELO 是 Bradley-Terry 的特例：把胜率建模为分差 logistic，ELO 分数为 r 的对数值映射；BT 更自然地支持多模型联合最大似然估计与置信区间。"
  ]
};
