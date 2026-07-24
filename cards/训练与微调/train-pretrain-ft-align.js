export default {
  "kind": "concept",
  "id": "train-pretrain-ft-align",
  "category": "训练与微调",
  "difficulty": "Easy",
  "title": "预训练 vs 微调 vs 对齐 三者关系",
  "prompt": "预训练、微调和对齐三者的目标与关系是什么？",
  "quickAnswer": "预训练学通用语言/世界知识，微调学特定任务格式，对齐(RLHF/DPO)让行为符合人类偏好；三者是能力→任务→价值的递进。",
  "approach": "预训练在海量无标注文本上自监督得底座；微调用标注数据教任务；对齐用偏好数据调行为，层层叠加不互斥。",
  "explanationFocus": "是什么：预训练是在大规模语料上自监督学语言与知识（底座）；微调是用任务数据调整权重以胜任具体任务（SFT）；对齐是通过偏好优化让输出安全有用符合人类价值（RLHF/DPO），三者是『通才→专才→合意』的递进。",
  "bruteForce": "跳过预训练直接微调小数据，模型无通用能力且易过拟合；或只预训练不微调/对齐，不会按指令且可能输出不当内容。",
  "derivation": [
    "为什么需要：三步分别解决『知识/语言』『任务遵循』『价值对齐』，缺一不可。",
    "怎么实现：预训练=MLM/CLM 海量语料；微调=SFT 指令数据；对齐=RM+PPO 或 DPO 偏好对。",
    "有什么代价：预训练算力最大；微调需高质量指令；对齐需人工偏好标注且训练不稳。",
    "怎么评测：预训练看困惑度/知识基准；微调看任务指标；对齐看人类胜率与安全性。"
  ],
  "invariant": "顺序通常 预训练→微调→对齐，但现代常『预训练+已含 SFT 的指令预训练』混合（建议二次核对各模型实际 pipeline）。",
  "walkthrough": "LLaMA 先 1.4T token 预训练→再用指令数据 SFT 得对话能力→最后 RLHF 让回答更安全有用。",
  "edgeCases": [
    "预训练已混入指令数据则 SFT 阶段弱化",
    "只对齐不微调可能指令遵循差",
    "三者数据分布不一致引发偏移"
  ],
  "code": "def pipeline():\n    model = pretrain(corpus)      # 1. 底座\n    model = sft(model, instruct)  # 2. 任务\n    model = align(model, prefs)   # 3. 对齐\n    return model",
  "codeNotes": [
    "三步可迭代、可插 PEFT 省资源",
    "现代趋势把 SFT 融入预训练末段"
  ],
  "complexity": "预训练 O(语料×参数) 最大；微调/对齐小 1-2 数量级。",
  "followUps": [
    {
      "question": "能只做对齐不做微调吗？",
      "answer": "不推荐；对齐依赖模型已有指令遵循能力，跳过 SFT 直接 RLHF 往往指令遵循与稳定性都差。"
    },
    {
      "question": "预训练能否包含对齐？",
      "answer": "可部分包含（如纳入安全语料），但精细偏好对齐仍需专门的 RLHF/DPO 阶段。"
    }
  ],
  "followUpAnswers": [
    "不推荐；对齐依赖模型已有指令遵循能力，跳过 SFT 直接 RLHF 往往指令遵循与稳定性都差。",
    "可部分包含（如纳入安全语料），但精细偏好对齐仍需专门的 RLHF/DPO 阶段。"
  ],
  "pitfalls": [
    "混淆微调与对齐的目标，用 KD 做对齐",
    "顺序颠倒导致能力或指令性缺失"
  ],
  "beginnerSummary": "预训练像『通识教育』攒知识，微调像『职业培训』学干活，对齐像『公司文化培训』学做人；三者层层加工出一个好用的 AI。",
  "prerequisites": [
    "预训练目标",
    "SFT",
    "RLHF/DPO 对齐"
  ],
  "workedExample": [
    "Step1 预训练 1.4T token 得底座",
    "Step2 SFT 10万指令，Step3 DPO 1万偏好对"
  ],
  "lineByLine": [
    "pretrain: 自监督底座",
    "sft: 任务格式",
    "align: 偏好对齐"
  ],
  "diagram": "预训练(知识) → 微调(任务) → 对齐(价值)"
};
