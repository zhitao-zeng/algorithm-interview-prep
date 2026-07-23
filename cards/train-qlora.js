export default {
  "kind": "concept",
  "id": "train-qlora",
  "category": "训练与微调",
  "difficulty": "Hard",
  "title": "QLoRA（4-bit 量化底座 + LoRA）",
  "prompt": "QLoRA 如何在单张消费级显卡上微调大模型？",
  "quickAnswer": "将底座量化为 4-bit NF4 冻结，仅以 fp16/bf16 训练 LoRA 适配器，配合双量化与分页优化器把显存压到单卡可训。",
  "approach": "用 bitsandbytes 的 NF4 4-bit 加载冻结底座，前向时反量化计算；LoRA 适配器保持高精度可训；双重量化压缩 scale、分页优化器防 OOM。",
  "explanationFocus": "是什么：QLoRA（Quantized LoRA）把底座权重用 4-bit NormalFloat(NF4) 量化并冻结，仅训练高精度 LoRA 适配器，使 65B 模型可在单张 48G 显卡、7B 在 24G 上微调且质量接近全精度。",
  "bruteForce": "直接用 fp16 加载并全微调 65B 需约 780G 显存，远超单卡；纯 LoRA 仍需 fp16 底座 ~130G，仍要多卡。",
  "derivation": [
    "为什么需要：大模型底座占显存主体，量化可省 4× 内存，使消费级 GPU 也能微调。",
    "怎么实现：BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type='nf4')；compute_dtype=bf16 前向反量化；LoRA 照常训练。",
    "有什么代价：4-bit 有量化误差（文献称相对全精 <0.5% 质量差）；反向只更新 LoRA，能力上限受低秩约束。",
    "怎么评测：对比 16-bit LoRA 与 QLoRA 在基准上的差距，监控显存峰值是否达单卡可训。"
  ],
  "invariant": "底座 4-bit 冻结、仅 LoRA 可训；NF4 针对正态权重最优（建议二次核对各卡 compute_dtype 支持）。",
  "walkthrough": "Mistral-7B：fp16 14.5G → 4-bit NF4 3.6G；加 LoRA(~0.03G)、激活(2-4G)、优化器(0.06G)、CUDA(~1G) 共约 7-9G，可放 16G 卡。",
  "edgeCases": [
    "部分老 GPU 不支持 bf16 计算需退 fp16",
    "双量化可再省 ~0.4G/1B 参数",
    "4-bit 误差在极小模型上可能更明显"
  ],
  "code": "from transformers import BitsAndBytesConfig\nimport torch\nbnb = BitsAndBytesConfig(\n    load_in_4bit=True,\n    bnb_4bit_quant_type='nf4',\n    bnb_4bit_compute_dtype=torch.bfloat16,\n    bnb_4bit_use_double_quant=True)",
  "codeNotes": [
    "nf4 针对零均值正态权重信息最优",
    "double_quant 进一步量化 scale 常数省显存"
  ],
  "complexity": "前向含反量化，计算量同原模型；显存降至约 1/4 底座。",
  "followUps": [
    {
      "question": "QLoRA 与 LoRA 质量差多少？",
      "answer": "文献报告相对 16-bit 全微调质量差 <0.5%，多数任务几乎无感。"
    },
    {
      "question": "4-bit 误差从哪来？",
      "answer": "NF4 把权重映射到 16 个非均匀电平，舍入引入微小误差，但正态权重分布使误差集中在近零处影响小。"
    }
  ],
  "followUpAnswers": [
    "文献报告相对 16-bit 全微调质量差 <0.5%，多数任务几乎无感。",
    "NF4 把权重映射到 16 个非均匀电平，舍入引入微小误差，但正态权重分布使误差集中在近零处影响小。"
  ],
  "pitfalls": [
    "误把底座也设为可训，失去 4-bit 省显存意义",
    "compute_dtype 与硬件不匹配引发 NaN"
  ],
  "beginnerSummary": "QLoRA 先把大模型『压成 4-bit 缩略图』冻住，再在上面训小 LoRA 外挂，显存砍到 1/4，单张游戏显卡也能微调巨模型。",
  "prerequisites": [
    "LoRA 原理",
    "量化(NF4/INT4)",
    "bitsandbytes/PEFT"
  ],
  "workedExample": [
    "配置 NF4 4-bit 加载 LLaMA-65B，显存 ~48G",
    "注入 LoRA 训练，仅适配器占可训参数"
  ],
  "lineByLine": [
    "load_in_4bit=True：4-bit 加载底座",
    "bnb_4bit_quant_type='nf4'：正态最优量化",
    "bnb_4bit_use_double_quant=True：量化 scale 再压缩"
  ],
  "diagram": "底座(fp16)──量化──▶4-bit NF4(冻结)\n                        │反量化前向\nLoRA(fp16)──训练──▶  merged 输出"
};
