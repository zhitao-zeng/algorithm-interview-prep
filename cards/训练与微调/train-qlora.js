export default {
  "id": "train-qlora",
  "kind": "concept",
  "category": "训练与微调",
  "difficulty": "Hard",
  "title": "QLoRA（4-bit 量化底座 + LoRA）",
  "prompt": "QLoRA 如何在单张消费级显卡上微调大模型？",
  "code": "from transformers import BitsAndBytesConfig\nimport torch\nbnb = BitsAndBytesConfig(\n    load_in_4bit=True,\n    bnb_4bit_quant_type='nf4',\n    bnb_4bit_compute_dtype=torch.bfloat16,\n    bnb_4bit_use_double_quant=True)",
  "diagram": "底座(fp16)──量化──▶4-bit NF4(冻结)\n                        │反量化前向\nLoRA(fp16)──训练──▶  merged 输出",
  "explanationFocus": "是什么：QLoRA（Quantized LoRA）是 LoRA 的显存优化版——它把预训练底座权重用 4-bit NormalFloat(NF4) 量化并冻结，仅以 fp16/bf16 训练插入的 LoRA 低秩适配器（Adapter），并配合『双重量化（double quantization）』与『分页优化器（paged optimizer）』进一步压低显存，使 65B 模型可在单张 48G 显卡、7B 模型可在 24G 甚至 16G 消费级显卡上微调，而质量接近全精度 LoRA。",
  "quickAnswer": "QLoRA 用 bitsandbytes 把底座量化为 4-bit NF4 并冻结，前向时反量化为高精度计算；仅 LoRA 适配器保持 fp16/bf16 可训；再加双重量化（把量化所用的 scale 常数也量化）与分页优化器（用 NVMe 分页防峰值 OOM），把显存压到单卡可训。相对 16-bit LoRA 质量损失通常 <0.5%，但显存降到约 1/4。",
  "beginnerSummary": "QLoRA 先把大模型『压成 4-bit 缩略图』冻住不动，再在上面训练一个很小的 LoRA 外挂（像给冻住的巨人贴几张便利贴）。因为主体不训，显存砍到 1/4，单张游戏显卡也能微调巨模型。双重量化是把『记录压缩方式的便签』再压缩一次，分页优化器是显存不够时先借硬盘顶一下，防训练中途爆显存。",
  "walkthrough": "以 Mistral-7B 为例：fp16 底座 14.5GB → 4-bit NF4 底座 3.6GB；LoRA 适配器约 0.03GB 可训；激活值 2-4GB；优化器状态（Adam，仅 LoRA 部分）约 0.06GB；CUDA 上下文 ~1GB；双重量化再省约 0.4GB/1B 参数。合计约 7-9GB，可放进单张 16GB 显卡（如 4060 Ti 16G）微调。若是 65B 模型，fp16 需 ~130GB（多卡），QLoRA 4-bit 底座 ~48GB + 适配器与开销，单张 48G A6000 即可。",
  "approach": "① 用 BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type='nf4', bnb_4bit_compute_dtype=bf16, bnb_4bit_use_double_quant=True) 加载冻结底座；② 前向时 bitsandbytes 在算子内反量化到 compute_dtype 计算；③ 用 PEFT 注入 LoRA（通常 target 到 q_proj/v_proj 等），仅适配器参数 requires_grad=True；④ 分页优化器在显存峰值超限时把优化器状态分页到 CPU/NVMe，防止 OOM。训练循环与普通 HF Trainer 一致。",
  "bruteForce": "直接用 fp16 加载并全参数微调 65B 需约 780GB 显存（权重 130G + 优化器动量/方差 2×130G + 梯度 130G + 激活），远超单卡；纯 LoRA（fp16 底座）仍需 ~130G 底座 + 少量适配器，依然要多卡。两者都把巨量显存花在『底座』上，而底座在微调时本不该变。",
  "invariant": "底座恒为 4-bit 冻结、仅 LoRA 适配器可训；NF4 是针对零均值正态权重分布最优的 4-bit 数据类型（比 INT4 信息损失更小）；compute_dtype 必须与硬件支持匹配（老卡不支持 bf16 则退 fp16），否则前向出现 NaN。凡把底座设为可训或 compute_dtype 不匹配，都会破坏显存优势或数值稳定。",
  "complexity": "前向计算量与原 fp16 模型相同（反量化在算子内融合，几乎不增 FLOPs），但每次线性层多一步 dequant；显存从 fp16 底座的 2 bytes/param 降到 4-bit 的 0.5 bytes/param，约 1/4，加上双重量化再省约 0.4GB/1B 参数。训练速度比 fp16 LoRA 略慢（因反量化开销与可能更低的 compute_dtype 算力），但通常慢 10%~30%，换来显存降 4 倍。注意激活值与优化器状态仍按 compute_dtype 占用，长序列/大 batch 时这两项可能重新成为瓶颈。",
  "derivation": [
    "为什么需要：大模型底座占微调显存的主体（fp16 下 2 bytes/param × 参数量）。量化底座可省约 4× 显存，使消费级 GPU（24G/16G）也能微调原来需多卡的大模型，democratize 微调。同时 LoRA 已证明只训低秩适配器即可接近全微调效果，QLoRA 把 LoRA 的底座也压下去。",
    "怎么实现：用 BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type='nf4', bnb_4bit_compute_dtype=bf16, bnb_4bit_use_double_quant=True) 加载；计算时 bitsandbytes 把 4-bit 权重反量化到 bf16 做矩阵乘。LoRA 照常注入、仅适配器 requires_grad=True。双重量化把每个量化块的 scale（fp32 常数）再量化成 8-bit，进一步省显存。",
    "有什么代价：4-bit 有量化误差——文献（Dettmers et al. 2023）报告相对 16-bit 全微调质量差 <0.5%，多数任务几乎无感；但极小模型上 4-bit 误差可能更明显。反向只更新 LoRA，能力上限受低秩 r 约束，复杂任务可能欠拟合。compute_dtype 不匹配会引发 NaN。分页优化器在极端峰值时会借 CPU 内存，拖慢速度。",
    "怎么评测：对比 16-bit LoRA 与 QLoRA 在同一基准（如 MMLU、特定下游任务）的分数差距，监控训练显存峰值是否落在单卡预算内；并抽查若干样本输出质量，确认 4-bit 未引入系统性退化（如乱码、重复）。若差距 >1% 再考虑调高 nf4→混合精度或增大 LoRA r。"
  ],
  "edgeCases": [
    "老 GPU（如 Pascal/早期 Turing）不支持 bf16 计算，需退 fp16 compute_dtype，否则前向 NaN 或报错。",
    "双重量化在超大模型（>30B）上额外省约 0.4GB/1B 参数，但对小模型收益可忽略，且略微增计算。",
    "4-bit 量化误差在参数极少的小模型（<100M）上相对占比更大，可能明显掉点，此时应改用 8-bit 或更保守量化。",
    "序列很长时激活值显存会重新超过底座节省，需配合梯度检查点（gradient checkpointing）或减小 batch。"
  ],
  "pitfalls": [
    "误把底座也设为可训（set_trainable 范围错误），失去 4-bit 省显存的意义，显存回到 fp16 全量水平。",
    "compute_dtype 与硬件不匹配（在不支持 bf16 的卡上用 bf16）引发 NaN，应退 fp16。",
    "忘记开 double_quant 或分页优化器，长序列训练峰值 OOM。"
  ],
  "prerequisites": [
    "LoRA 原理：低秩适配器如何用 A·B 近似 ΔW，以及只训适配器为何省显存。",
    "量化基础（NF4/INT4）：理解 4-bit 非均匀量化对正态权重的适配性，以及 dequant 过程。",
    "bitsandbytes / PEFT 库：知道如何用 BitsAndBytesConfig 加载 4-bit 模型、用 PEFT 注入 LoRA。",
    "显存构成：权重/梯度/优化器状态/激活 各占多少，为何底座量化收益最大。"
  ],
  "workedExample": [
    "例 1（7B 单卡）：Mistral-7B fp16 底座 14.5G → 4-bit NF4 3.6G；+ LoRA 0.03G + 激活 3G + 优化器 0.06G + CUDA 1G + 双重量化省 ~0.4G ≈ 7-8G，放 16G 卡可行。",
    "例 2（65B 单卡）：LLaMA-65B fp16 需 ~130G 底座，QLoRA 4-bit 底座 ~48G + 适配器与开销 ≈ 可放单张 48G A6000，而全微调需 8×A100。",
    "例 3（质量对比）：在 GSM8K 上 16-bit LoRA 得 62.3%，QLoRA 得 61.9%，差距 0.4% < 0.5%，验证『几乎无感』。"
  ],
  "lineByLine": [
    "load_in_4bit=True：以 4-bit 加载并冻结底座，省 4× 显存。",
    "bnb_4bit_quant_type='nf4'：用针对零均值正态权重最优的 NF4 量化，比 INT4 误差小。",
    "bnb_4bit_compute_dtype=torch.bfloat16：前向反量化到 bf16 计算，需硬件支持。",
    "bnb_4bit_use_double_quant=True：把量化 scale 常数再量化一次，进一步省显存（约 0.4G/1B 参数）。"
  ],
  "codeNotes": [
    "nf4 针对正态权重分布信息最优：它把 16 个非均匀电平按分位数摆布，使零附近密、尾部疏，契合权重正态性。",
    "double_quant 压缩的是 scale 而非权重：每个量化块有一个 fp32 scale，对其再量化可省可观常量显存，几乎无损。",
    "compute_dtype 决定数值稳定：在不支持 bf16 的旧卡务必改 fp16，否则 NaN。"
  ],
  "followUps": [
    {
      "question": "QLoRA 与 LoRA 质量差多少？",
      "answer": "Dettmers 等 2023 年论文报告：相对 16-bit 全微调，QLoRA 在多数基准上质量差 <0.5%（如 MMLU、GSM8K 差距在 0.3~0.5 个点），绝大多数下游任务几乎无感。只有在参数极小的模型或极难的细粒度任务上差距才会扩大到 1% 以上，此时可考虑 8-bit 底座或增大 LoRA 秩 r。"
    },
    {
      "question": "4-bit 误差从哪来？",
      "answer": "NF4 把权重映射到 16 个非均匀电平，量化时舍入（rounding）引入微小误差；但因 NF4 的分位数摆布契合权重的零均值正态分布，误差集中在近零处、对最终输出影响很小。反量化时这些小误差被放大回 fp16 范围，整体表现为接近无感的精度损失。"
    },
    {
      "question": "什么情况下不该用 QLoRA？",
      "answer": "当你有充足多卡显存（如 8×A100）且追求极致精度时，直接 16-bit 全微调或 LoRA 更简单稳定；或当模型很小（<100M）时 4-bit 相对误差占比大，8-bit 更稳；又或任务对数值精度极度敏感（如某些数值推理），应优先保精度而非省显存。"
    }
  ],
  "followUpAnswers": [
    "Dettmers 等 2023 年论文报告：相对 16-bit 全微调，QLoRA 在多数基准上质量差 <0.5%（如 MMLU、GSM8K 差距在 0.3~0.5 个点），绝大多数下游任务几乎无感。只有在参数极小的模型或极难的细粒度任务上差距才会扩大到 1% 以上，此时可考虑 8-bit 底座或增大 LoRA 秩 r。",
    "NF4 把权重映射到 16 个非均匀电平，量化时舍入（rounding）引入微小误差；但因 NF4 的分位数摆布契合权重的零均值正态分布，误差集中在近零处、对最终输出影响很小。反量化时这些小误差被放大回 fp16 范围，整体表现为接近无感的精度损失。",
    "当你有充足多卡显存（如 8×A100）且追求极致精度时，直接 16-bit 全微调或 LoRA 更简单稳定；或当模型很小（<100M）时 4-bit 相对误差占比大，8-bit 更稳；又或任务对数值精度极度敏感（如某些数值推理），应优先保精度而非省显存。"
  ]
};
