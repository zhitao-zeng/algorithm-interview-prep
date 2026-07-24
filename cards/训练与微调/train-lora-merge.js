export default {
  "kind": "concept",
  "id": "train-lora-merge",
  "category": "训练与微调",
  "difficulty": "Easy",
  "title": "LoRA 的 merge 与推理部署",
  "prompt": "训练好的 LoRA 适配器如何合并进原权重并部署？",
  "quickAnswer": "部署时把 ΔW=α/r·BA 加回冻结权重 W 得到 W'=W+ΔW，合并后模型与原结构一致、零额外推理延迟。",
  "approach": "推理前或导出时计算 merged=W+(α/r)BA 替换原层；或保留基座+适配器用库动态加载，按任务热插拔。",
  "explanationFocus": "是什么：LoRA merge 是把训练得到的低秩增量 α/r·BA 直接加回原权重 W，得到等价全参数权重 W'，使部署模型结构不变、无需额外计算分支。",
  "bruteForce": "部署时同时加载底座与适配器并每步做 BA 分支加法，虽可行但增加显存与少量延迟，且需框架支持。",
  "derivation": [
    "为什么需要：合并后可用标准推理引擎（vLLM 等）服务，避免 PEFT 依赖、降低延迟。",
    "怎么实现：merged_weight = W + (alpha/r)·B@A；替换 Linear 权重；多适配器则分别合并或运行时切换。",
    "有什么代价：合并后失去『一个底座多任务热插拔』的灵活性，需为每任务存一份合并权重；大 r 合并计算一次。",
    "怎么评测：合并前后对同一输入输出数值一致（误差在浮点容差内），基准分数不变。"
  ],
  "invariant": "合并公式 W'=W+(α/r)BA；合并后结构与基座一致（建议二次核对 scaling 是否含 α/r）。",
  "walkthrough": "W(4096×4096)、r=16：merged=W+(2.0)·B@A，B@A 仅 131K 参数；合并后单卡推理与基座同速。",
  "edgeCases": [
    "多 LoRA 想共存需分别合并或动态加载",
    "量化底座(QLoRA)合并需先反量化",
    "合并后无法再单独调 α"
  ],
  "code": "def merge_lora(W, A, B, alpha, r):\n    # 把 LoRA 增量合并回原权重\n    scaling = alpha / r\n    return W + scaling * (B @ A)",
  "codeNotes": [
    "B@A 形状需与 W 一致（注意转置约定）",
    "合并是一次性 O(d·k·r) 操作"
  ],
  "complexity": "合并 O(d·k·r)，远小于原权重 d·k；推理零额外开销。",
  "followUps": [
    {
      "question": "合并和动态加载适配器怎么选？",
      "answer": "要热插拔多任务选动态加载；要极致部署简单与兼容选合并。"
    },
    {
      "question": "QLoRA 适配器能直接合并吗？",
      "answer": "需先把 4-bit 底座反量化为 fp16，再合并 LoRA，得到 fp16 合并权重。"
    }
  ],
  "followUpAnswers": [
    "要热插拔多任务选动态加载；要极致部署简单与兼容选合并。",
    "需先把 4-bit 底座反量化为 fp16，再合并 LoRA，得到 fp16 合并权重。"
  ],
  "pitfalls": [
    "漏乘 α/r 导致合并幅度错误",
    "转置顺序错使 B@A 形状不匹配"
  ],
  "beginnerSummary": "LoRA 训完可把『外挂』焊回原模型，得到普通大模型，部署时不用任何特殊框架、速度不变；但焊死后就不好换任务了。",
  "prerequisites": [
    "LoRA 原理",
    "权重矩阵运算",
    "推理引擎部署"
  ],
  "workedExample": [
    "取 W 与训练好的 A、B，alpha=32,r=16",
    "merged = W + 2.0*(B@A) 得到可部署权重"
  ],
  "lineByLine": [
    "scaling = alpha / r：还原缩放",
    "B @ A：低秩增量矩阵",
    "W + scaling*(B@A)：合并为新权重"
  ],
  "diagram": "W ─┐\n     ├─ + ─▶ W'(部署)\nα/r·BA─┘"
};
