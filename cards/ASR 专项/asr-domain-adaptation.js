export default {
  "id": "asr-domain-adaptation",
  "category": "ASR 专项",
  "difficulty": "Medium",
  "title": "域适应与灾难性遗忘防控",
  "prompt": "业务域 ASR 域适应时，如何用双域门禁与通用数据回放避免灾难性遗忘？",
  "quickAnswer": "业务域微调时回放约 10% 通用数据作双域门禁，只有业务域 CER 下降且通用域不退化才合并权重；业务 19.27%→12.24%，通用 9.31%→9.03%。",
  "code": "def accept_domain_adaptation(biz_cer_before, biz_cer_after,\n                             gen_cer_before, gen_cer_after):\n    \"\"\"只有业务域 CER 下降且通用域 CER 不退化才放行。\"\"\"\n    return biz_cer_after < biz_cer_before and gen_cer_after <= gen_cer_before",
  "complexity": "时间 O(1)，空间 O(1)",
  "beginnerSummary": "学新口音别把普通话忘光；每次上岗前考两门：新业务变好、老本事不退化才让上线。",
  "derivation": [
    "为什么需要：只在业务域数据上微调会让通用域 CER 反弹（灾难性遗忘），需约束双域同时达标。",
    "怎么实现：双域门禁在业务域损失外回放约 10% 通用数据，并以“业务降且通用不退化”作为放行准则。",
    "有什么代价：回放通用数据占用训练 batch，延缓业务域收敛；门禁需双域验证集，增加评估成本。",
    "怎么评测：业务域 CER 19.27%→12.24%，通用域 9.31%→9.03%，双域均满足才合并权重。"
  ],
  "edgeCases": [
    "业务域验证集过小，CER 波动让门禁时放时拒，需多次评估取稳。",
    "通用数据回放比例调太高，业务域提升被稀释到不显著。",
    "两域数据分布重叠时“不退化”约束形同虚设，需确认域边界。",
    "门禁通过但线上分布漂移，需持续监控。"
  ],
  "pitfalls": [
    "只盯业务域 CER 下降就上线，通用域已悄悄退化。",
    "回放比例拍脑袋，未以双域折中做消融。"
  ],
  "prerequisites": [
    "灾难性遗忘（catastrophic forgetting）",
    "经验回放（replay）",
    "CER 评测"
  ],
  "workedExample": [
    "步骤1：业务域微调，batch 中混入 10% 通用数据做回放。",
    "步骤2：每轮在业务/通用双验证集测 CER。",
    "步骤3：业务 19.27%→12.24% 且通用 9.31%→9.03% 时 accept_domain_adaptation 返回 True，合并权重。"
  ],
  "lineByLine": [
    "def accept_domain_adaptation(...) 输入双域前后 CER。",
    "return biz_cer_after < biz_cer_before 业务域必须提升（CER 下降）。",
    "and gen_cer_after <= gen_cer_before 且通用域不退化（允许持平）。",
    "整体返回布尔，作为权重合并闸门。"
  ],
  "followUps": [
    {
      "question": "10% 回放比例怎么来的？",
      "answer": "以双域 CER 折中做小范围消融（5%/10%/20%），选业务提升明显且通用不退化的最小比例，定在约 10%。"
    },
    {
      "question": "除了回放还有哪些防遗忘手段？",
      "answer": "可用 LoRA/adapter 只训新增参数、EWC 正则约束重要权重，或梯度手术隔离双域梯度，回放是最直接可控的。"
    }
  ],
  "followUpAnswers": [
    "以双域 CER 折中做小范围消融（5%/10%/20%），选业务提升明显且通用不退化的最小比例，定在约 10%。",
    "可用 LoRA/adapter 只训新增参数、EWC 正则约束重要权重，或梯度手术隔离双域梯度，回放是最直接可控的。"
  ],
  "invariant": "当且仅当业务域 CER 严格下降且通用域 CER 不上升时，accept_domain_adaptation 返回 True。",
  "walkthrough": "biz 19.27→12.24（降）、gen 9.31→9.03（降）→ 返回 True 放行；若 gen 9.31→9.50（升）→ 返回 False 拒收。",
  "kind": "code"
};
