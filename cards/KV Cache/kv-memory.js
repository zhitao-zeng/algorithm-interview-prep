export default {
  "kind": "concept",
  "id": "kv-memory",
  "category": "KV Cache",
  "difficulty": "Medium",
  "title": "KV Cache 为什么占显存",
  "prompt": "KV Cache 为什么占显存？",
  "quickAnswer": "KV Cache 要在整个生成过程中常驻显存：每个 token 在每一层、每个 KV 头都要存一份 Key 和 Value 向量。总量 ≈ 2（K 和 V）× 层数 × 序列长度 × KV 头数 × 每头维度 × 字节数。层数、上下文长度、并发一上去，乘积迅速变成几十 GB。",
  "approach": "显存 = 2×层数×长度×KV头数×头维×字节，多项相乘量级大。",
  "explanationFocus": "是什么：KV Cache 常驻显存，体量 = 2·N·L·Hkv·dkv·bytes，随层数/长度/并发乘积膨胀。",
  "bruteForce": "只盯模型权重显存，忽略 KV → 长上下文直接 OOM。",
  "derivation": [
    "为什么需要：缓存必须在生成全程留在显存供每步读取。",
    "怎么实现：按 (请求, 层, 头, 位置) 分配连续/分页显存块存储 K、V。",
    "有什么代价：L 或 B 翻倍，KV 显存翻倍，常是长上下文 OOM 首因。",
    "怎么评测：测不同 (B,L) 下的 KV 显存，占总显存比例，找到并发上限。"
  ],
  "invariant": "KV 显存 ∝ B × L × N × Hkv（Hkv=KV 隐维），与模型总参数量无关、只与结构相关。",
  "walkthrough": "7B 模型 N=32, Hkv=4096, FP16：单请求 L=4096 → 2·32·4096·4096·2B≈2.1GB；L=128k → ~68GB，超过权重本身。",
  "edgeCases": [
    "长上下文(L 大)：KV 可超过模型权重显存。",
    "高并发(B 大)：KV 总量 = 单请求 × B。",
    "GQA/MQA：Hkv 减小，KV 显著下降。"
  ],
  "code": "# Python\ndef kv_bytes(batch, layers, seq, kv_heads, head_dim, dtype_bytes=2):\n    per_tok = 2 * layers * seq * kv_heads * head_dim * dtype_bytes  # K和V\n    return per_tok * batch",
  "codeNotes": [
    "FP16=2B, FP8/INT8=1B, INT4=0.5B 可大幅压缩。",
    "Group Query Attention 让 kv_heads << 注意力头数。"
  ],
  "complexity": "O(B·L·N·Hkv)；与生成步数线性相关增长（每步 append 新位置）。",
  "followUps": [
    {
      "question": "KV 会比权重还大吗？",
      "answer": "会。长上下文下单请求 KV 就能超过 7B 权重(~14GB)；如 L=128k 时 KV 可达数十 GB，所以长上下文服务常受 KV 而非权重限制。"
    },
    {
      "question": "怎么减小 KV 显存？",
      "answer": "GQA/MQA 减 KV 头数、KV 量化(INT8/FP8/INT4)、KV 驱逐/压缩(如 H2O)、Prefix Cache 跨请求复用、PagedAttention 减碎片。"
    }
  ],
  "followUpAnswers": [
    "GQA 是性价比最高的减 KV 手段。",
    "KV 量化几乎零质量损可省一半。"
  ],
  "pitfalls": [
    "只预算权重显存，漏算 KV。",
    "以为 KV 与上下文长度无关。"
  ],
  "beginnerSummary": "笔记要一直摊在桌上才方便翻，所以占地方。这份笔记的厚度 = “层数 × 已写字数 × 每个字记的要点数”。字写得越多（上下文越长）、同时开几个文档（并发）越高，桌子（显存）越快被笔记占满——常常不是书（权重）占满，而是笔记占满。",
  "prerequisites": [
    "KV 需常驻显存供读取。",
    "每个 token 每层每头都有 K,V。",
    "多项相乘量级大。"
  ],
  "workedExample": [
    "7B, N=32, Hkv=4096, FP16：L=4k → ~2.1GB；L=128k → ~68GB。",
    "GQA(kv_heads=8 vs 32) 直接把 KV 降到 1/4。"
  ],
  "lineByLine": [
    "每个 token 在每层每 KV 头存 K 和 V。",
    "总量=2·N·L·Hkv·dkv·bytes。",
    "随 L、B 线性膨胀。",
    "常是长上下文 OOM 主因。"
  ],
  "diagram": "KV 显存 ∝ B × L × N × Hkv\nB:并发 L:上下文 N:层数 Hkv:KV隐维\nFP16: 2B/参数\n→ 长上下文时 KV 可超过权重本身"
};
