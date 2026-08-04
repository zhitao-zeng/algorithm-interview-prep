export default {
  "id": "de-data-mix-strategy",
  "category": "多模态数据工程",
  "difficulty": "Hard",
  "title": "数据混合策略",
  "prompt": "多模态预训练时，如何设计不同来源/模态数据的混合比例与课程式调度策略？",
  "quickAnswer": "常用“先定各域数据域（domain）与模态权重，再用静态比例或 DoReMi 式可学习比例做采样，并叠加课程式由易到难升温”的策略；最终以多任务验证集上的综合指标反搜比例。",
  "approach": "核心思路是“把数据当超参来优化”。先按能力维度切分数据域（图文、视频、OCR、纯文本等），用经验比例做静态混合；再用小规模代理训练学习各域权重（如 DoReMi），或按训练阶段做课程式升温（先单模态后多模态、先干净后噪声）。",
  "explanationFocus": "是什么：数据混合策略是决定“每个训练 step 从哪些数据域、以什么概率采样，以及随时间如何变化”的方案，直接影响多模态模型的能力平衡。",
  "bruteForce": "朴素做法：把所有数据无差别拼接后随机打乱训练，或凭直觉给某类数据固定权重。前者会让海量低质域淹没稀有高质域，后者难以复现且易偏科。",
  "invariant": "不变式：任何 step 采样到的各域样本比例，必须落在预设混合分布的容差内；课程式调度中“难/噪声域”的累计采样占比随 step 单调不减。",
  "walkthrough": "1) 按能力切分数据域并估计规模；2) 设初始混合比例；3) 小代理模型用 DoReMi 学最优比例；4) 全量训练用该比例 + 课程升温；5) 多任务验证集回测并微调比例。",
  "complexity": "说明：代理训练学比例为 O(proxy_steps * domains)，全量混合后采样为 O(1) 查表；主要成本在多次全量验证回测。",
  "beginnerSummary": "入门概览：模型要学很多能力，不能把所有数据一锅炖。我们给每类数据（图、文、视频…）分配采样比例，必要时让模型在训练中先学简单的、再学难的。",
  "diagram": "[domain A] \\\n[domain B]  >--> [sampler] --> [train step]\n[domain C] /        ^\n                    |\n            [DoReMi / curriculum]",
  "code": "import numpy as np\n\ndef sample_domain(probs, rng=np.random):\n    domains = list(probs.keys())\n    weights = np.array([probs[d] for d in domains])\n    weights = weights / weights.sum()\n    return rng.choice(domains, p=weights)",
  "derivation": [
    "为什么需要：不同域数据量差几个数量级，均匀采样会让稀有高价值域（如 OCR、视频）被淹没，且训练阶段对难易数据的需求不同。",
    "怎么实现：定义域与比例后，可用静态权重采样；更优做法是 DoReMi 用小型代理模型最大化域似然梯度来学比例，或课程式随 step 调整难域权重。",
    "有什么代价：代理训练与多次回测耗费算力；课程式若升温过快会导致灾难性遗忘单模态能力，需平滑过渡。",
    "怎么评测：在覆盖各能力的多任务验证集上做综合评分，并对比“混合比例 vs 单项能力”的 Pareto 前沿，选均衡点或按产品侧重取舍。"
  ],
  "edgeCases": [
    "某域数据量极小但极重要，静态比例下几乎不被采样，需设最小采样保底。",
    "多语言文本域分布长尾，单一权重会压低低资源语种。",
    "课程升温与学习率 schedule 耦合，升温过快引发不稳定。",
    "新加入域未重新搜索比例，破坏原有能力平衡。"
  ],
  "pitfalls": [
    "直接用全量数据做 DoReMi 代理训练，成本失控，应使用小规模代理与早停。",
    "只用单一下游指标反搜比例，导致模型在该指标过拟合而在其他能力掉点。"
  ],
  "prerequisites": [
    "数据域划分与统计分布基础",
    "课程学习（curriculum learning）概念"
  ],
  "workedExample": [
    "初始比例：图文 50%、纯文本 30%、OCR 10%、视频 10%；DoReMi 代理后将 OCR 调到 14% 显著提升图表理解。",
    "课程式：前 10% step 仅单模态文本/图像，之后逐步引入 10%→30% 的多模态配对数据。"
  ],
  "lineByLine": [
    "def sample_domain(probs, rng)：定义按概率抽样数据域的函数。",
    "weights = np.array([...])：取出各域权重并归一化。",
    "weights = weights / weights.sum()：保证和为 1 满足概率分布。",
    "return rng.choice(domains, p=weights)：按归一化权重随机抽样一个域。"
  ],
  "codeNotes": [
    "真实训练应把该采样器接到数据加载器的多路 iterator 上，而非每 step 单独调用。"
  ],
  "followUps": [
    {
      "question": "DoReMi 与人工设定比例相比优势在哪？",
      "answer": "DoReMi 用代理模型在域似然上自动学比例，能发现人类直觉遗漏的域间权衡，且对数据规模变化更鲁棒，但需要额外代理训练成本。"
    },
    {
      "question": "如何避免混合策略导致低资源能力退化？",
      "answer": "对每个关键能力设最小采样保底比例，并在验证集中为低资源能力设更高监控权重，比例回测时纳入其指标。"
    }
  ],
  "followUpAnswers": [
    "DoReMi 用代理模型在域似然上自动学比例，能发现人类直觉遗漏的域间权衡，且对数据规模变化更鲁棒，但需要额外代理训练成本。",
    "对每个关键能力设最小采样保底比例，并在验证集中为低资源能力设更高监控权重，比例回测时纳入其指标。"
  ],
  "kind": "concept"
};
