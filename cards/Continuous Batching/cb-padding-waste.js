export default {
  "kind": "concept",
  "id": "cb-padding-waste",
  "category": "Continuous Batching",
  "difficulty": "Easy",
  "title": "可变长序列与 padding 浪费",
  "prompt": "为什么可变长序列会导致 padding 浪费，又是怎么被 Continuous Batching 解决的？",
  "quickAnswer": "为在 GPU 上规整并行，静态批必须把短序列 pad 到批内最长长度，这些 pad token 也要过一遍 attention 却毫无意义，白白吃算力与显存。Continuous Batching 不要求批内等长——它按请求独立管理长度与 KV，每个请求只计算自己的真实 token，从根本上消除 padding。",
  "approach": "用\"逐请求独立长度 + 分页 KV\"替代\"整批对齐长度\"。",
  "explanationFocus": "是什么：padding 浪费源于静态批对规整张量的要求，而连续 batching 通过请求级独立长度管理天然免 padding。",
  "bruteForce": "把 batch 内所有序列 pad 到 max_len，再整体做 attention（mask 掉 pad）。",
  "derivation": [
    "为什么需要：GPU 算子偏好规整形状，静态批只能靠 padding 凑齐，长度方差越大浪费越夸张。",
    "怎么实现：连续 batching 中每个请求维护自己的序列长度与 KV 页，attention 仅对自身历史 token 计算，不需要与其他请求对齐。",
    "有什么代价：不同长度请求拼在同一 batch 需要支持变长/分块注意力（如 ragged tensor 或分页），kernel 实现更复杂。",
    "怎么评测：统计 pad token 占比下降，以及相同算力下有效 token 吞吐提升。"
  ],
  "invariant": "连续批内无 pad token，每个位置的算力都对应真实 token。",
  "walkthrough": "长度 [10, 500, 20]，静态 pad 到 500 → 980 个 pad token 空算；连续批各算各的，0 padding。",
  "edgeCases": [
    "极长短混合：padding 浪费最严重，连续收益最大。",
    "几乎等长：padding 本来就少，收益有限。",
    "超长单请求：连续批中它独占，不影响他人。"
  ],
  "code": "# Python\ndef pad_overhead(seqs):\n    m = max(len(s) for s in seqs)\n    pads = sum(m - len(s) for s in seqs)\n    return pads  # 静态批必算的无用 token 数",
  "codeNotes": [
    "pad 数 = Σ(max_len - 各长度)。",
    "连续批没有 max_len 概念。"
  ],
  "complexity": "节省的算力正比于 pad 占比，长尾场景可达 50%+。",
  "followUps": [
    {
      "question": "连续批不做 padding，attention 怎么算？",
      "answer": "用变长/分页注意力，每个请求只对自己已生成的 KV 做因果注意力，不同请求长度互不干扰。"
    },
    {
      "question": "padding 还会影响显存吗？",
      "answer": "会，pad 也占 KV 缓存与激活，连续批释放这部分后可用显存更高、并发更大。"
    }
  ],
  "followUpAnswers": [
    "变长/分页注意力按请求独立算。",
    "pad 也占 KV，连续批省下显存。"
  ],
  "pitfalls": [
    "以为只要 batch 小就无所谓 padding。",
    "把 padding 浪费和气泡当成同一回事。"
  ],
  "beginnerSummary": "把高矮不一的人排进统一高度的格子，矮的周围填泡沫。泡沫不占座位但占箱子体积还增加搬运重量——这就是 padding。连续批让每个人用自己的真实高度，泡沫消失。",
  "prerequisites": [
    "GPU 偏好规整张量。",
    "attention 对历史 token 计算。",
    "KV 随序列长度增长。"
  ],
  "workedExample": [
    "长度 [10,500,20] pad 到 500。",
    "980 个 pad 空算；连续批 0 padding。"
  ],
  "lineByLine": [
    "找批内最大长度。",
    "每个短序列补到该长度。",
    "累加得到 pad 总数。",
    "连续批取消该步骤。"
  ],
  "diagram": "静态: 10,500,20 → 全 pad 到 500 (浪费980)\n连续: 各算各的真实长度, 0 pad"
};
