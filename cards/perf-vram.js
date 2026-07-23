export default {
  "kind": "concept",
  "id": "perf-vram",
  "category": "服务性能评测",
  "difficulty": "Medium",
  "title": "显存占用评测",
  "prompt": "如何评测大模型推理服务的显存占用，主要被什么吃掉？",
  "quickAnswer": "显存主要由模型权重、KV Cache、激活与临时缓冲占用。评测需分别测算：权重≈参数量×精度字节；KV Cache≈2×层数×batch×seq×hidden×dtype；并在不同 batch/seq 下实测峰值，作为容量上限依据。",
  "approach": "分项估算 + 实测峰值：用 torch 的 reserved/allocated 配合压测观察上限，定位是权重还是 KV 先撞墙。",
  "explanationFocus": "是什么：显存占用评测是量化权重、KV Cache、激活等各部分显存并测峰值，判断能开多大 batch/上下文。",
  "bruteForce": "只报模型权重大小：忽略 KV Cache 随 batch/seq 线性膨胀，实际能扛的并发远小于预期。",
  "derivation": [
    "为什么需要：显存是首要硬约束，决定了最大并发与上下文长度，直接关系成本。",
    "怎么实现：权重=参数量×字节；KV=2×n_layers×batch×seq_len×hidden×dtype_bytes；用 nvidia-smi/CUDA malloc 测峰值。",
    "有什么代价：长上下文与高并发让 KV 主导显存，估算需覆盖最大配置。",
    "怎么评测：在 max batch 与 max seq 下压测，记录分配峰值与安全余量。"
  ],
  "invariant": "总显存 ≈ 权重 + KV_Cache(batch,seq) + 激活；KV 随 batch×seq 线性增长，是可变主项。",
  "walkthrough": "7B fp16 权重≈14GB；batch=16,seq=4k,32层,hidden=4096 → KV≈2×32×16×4096×4096×2B≈64GB，远超权重，需分页注意力。",
  "edgeCases": [
    "碎片导致分配失败但总量够。",
    "fp16 与量化(int8/int4)权重差数倍。",
    "激活随 micro-batch 波动。"
  ],
  "code": "# Python\ndef kv_bytes(n_layers, batch, seq, hidden, dtype_b=2):\n    return 2 * n_layers * batch * seq * hidden * dtype_b   # KV 总字节\ndef weight_bytes(params, dtype_b=2):\n    return params * dtype_b                                # 权重字节",
  "codeNotes": [
    "KV 的 2 来自 K 与 V 两套缓存。",
    "量化能大幅降权重显存。"
  ],
  "complexity": "O(1) 估算；实测 O(压测时长)。",
  "followUps": [
    {
      "question": "PagedAttention 解决什么？",
      "answer": "把 KV 按块分页管理，消除碎片、按需分配，显著提升有效 batch 容量。"
    },
    {
      "question": "为什么长上下文更怕显存？",
      "answer": "KV 随 seq 线性增长，长上下文下 KV 主导显存，权重反而次要。"
    }
  ],
  "followUpAnswers": [
    "PagedAttention 消除 KV 碎片。",
    "长上下文 KV 主导显存。"
  ],
  "pitfalls": [
    "只算权重忽略 KV。",
    "用理论值不留安全余量。"
  ],
  "beginnerSummary": "冰箱：模型权重像一台固定大小的冰箱本体，KV Cache 像里面越放越满的食材——来的人(batch)越多、点的菜(seq)越长，食材就越占地方。算容量得把\"本体的体积\"和\"会膨胀的存货\"都算上。",
  "prerequisites": [
    "KV Cache 概念。",
    "fp16/int8/int4 精度字节数。",
    "batch 与 seq 影响显存。"
  ],
  "workedExample": [
    "7B fp16 权重14GB；KV 在长上下文下达 64GB。",
    "量化到 int4 权重降到 3.5GB。"
  ],
  "lineByLine": [
    "算权重显存。",
    "算 KV 随 batch×seq 的显存。",
    "加激活与余量。",
    "实测峰值校验。"
  ],
  "diagram": "显存 = 权重(固定)\n        + KV Cache(batch×seq, 膨胀)\n        + 激活(波动)\n        ───────────▶ 峰值"
};
