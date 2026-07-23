export default {
  "kind": "concept",
  "id": "kv-mha-mqa-gqa",
  "category": "KV Cache",
  "difficulty": "Medium",
  "title": "MHA / MQA / GQA 对 KV Cache 的影响",
  "prompt": "Multi-Head Attention、MQA 和 GQA 对 KV Cache 有什么影响？",
  "quickAnswer": "在 MHA 中每个注意力头都有独立的 K/V，KV 头数=注意力头数，缓存最大；MQA 让所有 Query 头共享同一组 K/V（KV 头数=1），KV 最小但表达力下降；GQA 取中间：若干 Query 头为一组共享一组 K/V（KV 头数介于 1 与头数之间），在显存与质量间取得平衡，是当下主流。",
  "approach": "KV 头数决定 KV 体积：MHA 最大，MQA 最小，GQA 折中。",
  "explanationFocus": "是什么：注意力变体的核心差别在“KV 头数 hkv”——MHA=h=n_heads，MQA=h=1，GQA=h=groups，直接决定 KV 缓存大小。",
  "bruteForce": "一律用 MHA → KV 最大，长上下文/并发受限。",
  "derivation": [
    "为什么需要：标准 MHA 的 KV 在高并发/长上下文下太贵，需减少 KV 头数。",
    "怎么实现：MQA 所有 Q 头共享 1 组 K/V；GQA 把 Q 头分组，每组共享 1 组 K/V；训练时即按此结构。",
    "有什么代价：KV 头越少，跨头信息越难区分，质量略降；需训练适配。",
    "怎么评测：对比同规模下三者的 KV 显存、吞吐与下游精度。"
  ],
  "invariant": "KV 体积比 = hkv_MHA : hkv_GQA : hkv_MQA = n_heads : n_kv_heads : 1；以 32 Q 头 / 8 KV 头为例 = 32 : 8 : 1（每组 4 个 Q head 共享 1 个 KV 头，共 8 组）。",
  "walkthrough": "n_heads=32：MHA hkv=32，GQA(4组) hkv=8，MQA hkv=1 → KV 依次 1 : 1/4 : 1/32。",
  "edgeCases": [
    "GQA 分组数需调参（如 8/4/2 组）。",
    "MQA 质量损失较大，少单独使用。",
    "推理框架需支持按 GQA 结构加载 KV。"
  ],
  "code": "# Python\ndef kv_heads(n_layers, n_kv_heads, seq, dkv):\n    return n_layers * seq * n_kv_heads * dkv * 2   # K和V\n\n# MHA: n_kv_heads = n_heads (e.g. 32)\n# GQA: n_kv_heads = groups   (e.g. 8)\n# MQA: n_kv_heads = 1",
  "codeNotes": [
    "GQA 是 LLaMA2/3 等主流选择。",
    "KV 头数下降主要减少 KV 投影、KV Cache 体积与 Decode 时 KV 读取带宽；每个 Q head 仍计算自身注意力，Attention FLOPs 不简单按 KV 头数等比下降。"
  ],
  "complexity": "KV O(B·L·N·hkv·dkv)；hkv 是三者唯一变量。",
  "followUps": [
    {
      "question": "GQA 为什么比 MQA 更常用？",
      "answer": "MQA 把所有头压成 1 组 K/V，表达力损失明显；GQA 分组保留了一定头间差异，质量接近 MHA 而 KV 已大幅缩小，性价比最高。"
    },
    {
      "question": "GQA 分组数怎么选？",
      "answer": "通常取能整除 n_heads 的数（如 32 头取 8/4/2 组）；组越少 KV 越小但质量越低，按显存预算与精度要求权衡。"
    }
  ],
  "followUpAnswers": [
    "LLaMA 系列默认 GQA。",
    "KV 头数=组数，调组数即调 KV。"
  ],
  "pitfalls": [
    "以为三者只影响速度不影响 KV。",
    "忽略 GQA 需要训练时即采用该结构。"
  ],
  "beginnerSummary": "MHA 像每人写自己专属笔记（最详细但最占地方）；MQA 像全组共用一份笔记（最省地方但信息混）；GQA 是折中——几个人合写一份共享笔记，既省地方又保留小组差异。厂家大多选 GQA：省下的桌子刚好够开更多并发。",
  "prerequisites": [
    "KV 头数决定 KV 体积。",
    "MHA 每头独立 K/V。",
    "共享 K/V 能减显存。"
  ],
  "workedExample": [
    "32 头：MHA hkv=32，GQA(8组) hkv=8，MQA hkv=1。",
    "KV 体积比 32 : 8 : 1。"
  ],
  "lineByLine": [
    "MHA: KV头=注意力头, 最大。",
    "MQA: KV头=1, 最小。",
    "GQA: 分组共享, 折中。",
    "KV体积 ∝ KV头数。"
  ],
  "diagram": "MHA : 头1..32 各持KV ─▶ hkv=32 (大)\nGQA : 8组(每组4个Q头), 共享KV ─▶ hkv=8 (中)\nMQA : 全部共享1份KV ─▶ hkv=1 (小)\nKV体积: MHA > GQA > MQA"
};
