export default {
  "kind": "concept",
  "id": "kv-gqa-saves",
  "category": "KV Cache",
  "difficulty": "Medium",
  "title": "GQA 为什么降低推理显存",
  "prompt": "GQA 为什么能降低推理显存？",
  "quickAnswer": "GQA（Grouped Query Attention）把多个 Query 头分成若干组，每组共享同一份 Key/Value。于是需要缓存的 KV 头数从“全部注意力头数”降到“组数”，KV Cache 体积同步缩小为原来的 组数/头数。显存下来后，同等显存能撑更长上下文或更高并发。",
  "approach": "GQA 靠减少 KV 头数直接等比缩小 KV 缓存。",
  "explanationFocus": "是什么：GQA 让 g 个 Q 头共享 1 组 K/V，使需缓存的 KV 头数 = 组数 < 注意力头数，KV 显存等比下降。",
  "bruteForce": "用 MHA 又想高并发/长上下文 → 显存迅速不够。",
  "derivation": [
    "为什么需要：MHA 的 KV 头数=注意力头数，是显存大户，限制并发与上下文。",
    "怎么实现：结构上将 Q 头分组，每组对应 1 个 KV 头；推理时该组所有 Q 复用同 K/V。",
    "有什么代价：KV 头减少会轻微损质量，需训练时即采用 GQA 并调组数。",
    "怎么评测：对比 GQA 与 MHA 的 KV 显存、最大并发、下游指标。"
  ],
  "invariant": "KV 头数缩小倍数 = n_heads / n_kv_heads（如 32 Q 头 / 8 KV 头 = 4×；即 8 组，每组 4 个 Q head）。注意这是 KV 体积/Cache 的缩小，非 Attention 总 FLOPs 的 4×。",
  "walkthrough": "n_heads=32, groups=8：KV 头从 32 降到 8，KV 显存变 1/4；同显存下并发或上下文可翻约 4×。",
  "edgeCases": [
    "组数=1 退化成 MQA（更省但质量更低）。",
    "组数=n_heads 退化成 MHA（无收益）。",
    "需权重本身按 GQA 训练，不能事后把 MHA 权重硬改。"
  ],
  "code": "# Python\ndef gqa_kv_ratio(n_heads, n_groups):\n    return n_heads / n_groups   # KV 缩小倍数\n\n# 32 heads, 8 groups -> KV 变为 1/4",
  "codeNotes": [
    "缩小的是 KV 头数，主要减少 KV 投影、Cache 大小与 KV 读取带宽；每个 Q head 仍算自身注意力输出，不能把整段 Attention FLOPs 简单除以组数。",
    "主流模型(LLaMA2/3, Mistral)默认 GQA。"
  ],
  "complexity": "KV 显存降为 MHA 的 n_groups/n_heads；推理注意力计算同比例变轻。",
  "followUps": [
    {
      "question": "GQA 会影响推理速度吗？",
      "answer": "会且正面：KV 头少了，每步读取与注意力计算都变轻，配合更大 batch 吞吐提升；主要收益在显存→更高并发。"
    },
    {
      "question": "能不能把已有 MHA 模型转 GQA？",
      "answer": "不行直接转；需重新训练/微调让权重适配 GQA 结构，否则精度崩。新模型应在训练时就定好 GQA 组数。"
    }
  ],
  "followUpAnswers": [
    "训新模型直接选 GQA。",
    "GQA 同时降显存与算力。"
  ],
  "pitfalls": [
    "以为 GQA 只是推理技巧可后加。",
    "组数选错（太多无功、太少损质）。"
  ],
  "beginnerSummary": "GQA 让几个人合写一份共享笔记：原来 32 个人各写一份（MHA），现在 8 人合一份、共 4 份笔记（GQA）。笔记总量变成 1/4，桌子立刻空出三倍——同样大的桌子能开更多会（更高并发）或写更长文档（更长上下文）。",
  "prerequisites": [
    "KV 头数决定 KV 体积。",
    "GQA 分组共享 K/V。",
    "需训练时采用该结构。"
  ],
  "workedExample": [
    "32 头 8 组：KV 头 32→8，KV 显存 1/4。",
    "同显存下可支撑的 KV Cache 容量与并发请求数约 ×4（KV 维度），实际并发仍受算力与调度限制。"
  ],
  "lineByLine": [
    "Q 头分成 g 组。",
    "每组共享 1 份 K/V。",
    "需缓存 KV 头数 = g。",
    "KV 显存缩小 n_heads/g 倍。"
  ],
  "diagram": "MHA: 32人 × 32份笔记\nGQA: 32 Q头 / 8 KV头 = 8份KV (每4个Q头共享1份)\nKV 显存: 1/4\n并发/上下文(KV维度): ≈×4"
};
