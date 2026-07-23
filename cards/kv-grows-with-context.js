export default {
  "kind": "concept",
  "id": "kv-grows-with-context",
  "category": "KV Cache",
  "difficulty": "Easy",
  "title": "KV Cache 随上下文增长",
  "prompt": "上下文长度增加时，KV Cache 如何增长？",
  "quickAnswer": "KV Cache 与上下文长度 L 严格成正比：每多一个 token，就要在每一层、每个 KV 头多存一份 K 和 V。所以 L 翻倍，KV 显存翻倍。这也是“长上下文很贵”的根本原因——且生成过程中 L 还在随输出不断增长。",
  "approach": "KV 对 L 线性：L↑ ⇒ KV↑ 同比例。",
  "explanationFocus": "是什么：KV 显存 ∝ 上下文长度 L，每增加一个 token 就固定多一份 (层×头×维) 的 K/V。",
  "bruteForce": "以为上下文加倍只慢一点 → 实际显存与成本都加倍。",
  "derivation": [
    "为什么需要：理解长上下文成本来源，才能定最大上下文与定价。",
    "怎么实现：每生成一个 token，KV 追加一个位置的数据。",
    "有什么代价：L 翻倍 KV 翻倍；长文档/多轮对话成本线性叠加。",
    "怎么评测：测不同 L 的 KV 显存与每步延迟，验证线性关系。"
  ],
  "invariant": "fixed (B,N,hkv,dkv,bytes) 下，KV(L) = k·L，k 为常数。",
  "walkthrough": "L 从 4k→32k（×8），单请求 KV 从 2.1GB→16.8GB（同结构）；再叠加生成输出，L 持续涨。",
  "edgeCases": [
    "最大上下文设很大但实际短：按实际 L 计费，不浪费。",
    "流式输出：L = prompt + 已生成，运行中也增长。",
    "RoPE/位置编码不影响 KV 体量，只影响内容。"
  ],
  "code": "# Python\ndef kv_vs_context(Ls, k_per_token_bytes):\n    return [L * k_per_token_bytes for L in Ls]   # 严格线性",
  "codeNotes": [
    "k = 2·N·hkv·dkv·bytes，与 L 无关。",
    "所以“长上下文”成本本质来自 KV 线性增长。"
  ],
  "complexity": "O(L)；生成过程中每步 +O(1) 位置。",
  "followUps": [
    {
      "question": "为什么长上下文服务贵？",
      "answer": "不是权重变大，而是每个请求的 KV 随 L 线性涨、且常驻；并发下总 KV = B×L×结构，显存与成本都线性于 L。"
    },
    {
      "question": "能只存重要 token 的 KV 吗？",
      "answer": "可以，KV 驱逐/压缩（如 H2O、StreamingLLM 的注意力槽）丢弃低注意力历史 token 的 KV，用近似换显存，但可能损长程依赖。"
    }
  ],
  "followUpAnswers": [
    "H2O 驱逐低注意力 KV。",
    "用 PagedAttention 配合动态长度。"
  ],
  "pitfalls": [
    "低估长上下文的线性成本。",
    "以为设大 max_len 就占满显存（按需增长）。"
  ],
  "beginnerSummary": "笔记是“按字计费”的：你多写一千字，桌上就多一千字份量的笔记，厚度严格线性增加。上下文从 4 千字拉到 3 万字，笔记厚度就变 8 倍。这就是为什么“支持超长上下文”听起来酷，实际很费桌子。",
  "prerequisites": [
    "每 token 都存 K/V。",
    "KV 对 L 线性。",
    "生成中 L 还在涨。"
  ],
  "workedExample": [
    "L 4k→32k（×8）：KV 2.1GB→16.8GB。",
    "多轮对话累计历史，L 持续增大。"
  ],
  "lineByLine": [
    "每 token 在每层每头存 K,V。",
    "L 增加 ⇒ KV 同比例增加。",
    "生成中 L = prompt + 已生成，持续增长。",
    "长上下文成本本质来自此线性。"
  ],
  "diagram": "L: 4k ─▶ KV 2GB\nL: 32k ─▶ KV 16GB  (×8)\nL: 128k ─▶ KV 68GB (×32)\n严格线性, 生成中还持续增长"
};
