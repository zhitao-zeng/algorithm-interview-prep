export default {
  "kind": "concept",
  "id": "mgpu-tp-infer",
  "category": "多GPU并行",
  "difficulty": "Medium",
  "title": "多卡推理中的张量并行",
  "prompt": "推理阶段使用张量并行和训练有何不同，要注意什么？",
  "quickAnswer": "推理用 TP 与训练同构(列切+行切、层内 all-reduce)，但推理无反向、不需存优化器与梯度，显存主要用于权重与 KV-cache；瓶颈常在 KV-cache 与访存带宽而非算力。推理常把 TP 与批次/流水结合，并尽量把 TP 限制在单机 NVLink，同时用 KV-cache 分片(SP/上下文并行)解决长序列显存。",
  "approach": "复用 TP 切权重，重点管理 KV-cache 显存与访存带宽。",
  "explanationFocus": "是什么：推理中的 TP 同样把每层权重行/列切到多卡并 all-reduce 汇总，但场景只前向、无梯度/优化器，显存与瓶颈转移到权重加 KV-cache 的访存上。",
  "bruteForce": "单卡推理大模型 → 权重+KV-cache 撑爆显存或吞吐过低。",
  "derivation": [
    "为什么需要：大模型推理单卡放不下权重+KV-cache，或吞吐达不到 SLA，需要多卡分摊权重并提升并发。",
    "怎么实现：权重沿用训练 TP 切分；prefill 阶段可做上下文并行切序列；decode 阶段每步都要 all-reduce 隐藏态；KV-cache 按层或序列分片到各卡。",
    "有什么代价：decode 每 token 都触发一次 all-reduce，通信延迟敏感；TP 度过大时通信占比上升、收益递减。",
    "怎么评测：首 token 延迟、吞吐(tokens/s)、KV-cache 显存上限、不同 tp 度的延迟-吞吐曲线。"
  ],
  "invariant": "推理输出分布与单卡一致；TP 仅改变计算分布。",
  "walkthrough": "70B 模型 tp=4 推理：每卡权重 1/4，prefill 切序列降 KV-cache，decode 每步 all-reduce 一次。",
  "edgeCases": [
    "decode 阶段每步 all-reduce，延迟敏感。",
    "KV-cache 随序列/并发线性增长。",
    "小 batch 时访存带宽常是瓶颈而非算力。"
  ],
  "code": "# Python (概念)\ndef infer_tp(x, W_shard, kv_shard, world):\n    h = x @ W_shard\n    h = all_reduce_sum(h, world)        # decode 每步汇总\n    return attention(h, kv_shard)",
  "codeNotes": [
    "推理无反向，省梯度/优化器显存。",
    "KV-cache 需另行分片管理。"
  ],
  "complexity": "权重显存 1/tp；decode 每步一次 all-reduce，延迟 ∝ 通信。",
  "followUps": [
    {
      "question": "推理 TP 为什么比训练更怕通信延迟？",
      "answer": "decode 是自回归逐 token 生成，每步都要一次 all-reduce 才能出下一个 token，通信延迟直接累加进延迟；训练可靠大 batch 摊薄通信。"
    },
    {
      "question": "推理 KV-cache 怎么并行？",
      "answer": "可用上下文并行/序列并行把 KV-cache 沿序列维切到多卡，或用 PP 让不同层在不同卡，缓解单卡 KV-cache 显存压力。"
    }
  ],
  "followUpAnswers": [
    "decode 逐 token，通信延迟累加。",
    "KV-cache 沿序列/层分片。"
  ],
  "pitfalls": [
    "把训练 TP 配置直接套推理忽略延迟。",
    "低估 KV-cache 显存增长。"
  ],
  "beginnerSummary": "多人合算一道只往前推的题(推理不用回头改)：权重撕开分给大家，每算一步都得对一次答案才能写下一笔。麻烦在于答题是一步一步来的，每步对答案的等待都会拖慢出结果；另外大家还得存\"前面说过的话\"(KV-cache)，这话越长越占地方。",
  "prerequisites": [
    "了解 TP 训练切分。",
    "知道推理无反向、无优化器。",
    "了解 KV-cache 概念。"
  ],
  "workedExample": [
    "70B 模型 tp=4，每卡权重 1/4。",
    "decode 每步 all-reduce 一次。"
  ],
  "lineByLine": [
    "权重按 TP 切到各卡。",
    "prefill 切序列降 KV-cache。",
    "decode 每步 all-reduce 隐藏态。",
    "KV-cache 按层/序列分片。"
  ],
  "diagram": "推理(仅前向):\n权重 1/tp 各卡 ── 每步 all-reduce ──→ 下一 token\nKV-cache 沿序列/层分片防 OOM"
};
