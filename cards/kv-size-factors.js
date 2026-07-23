export default {
  "kind": "concept",
  "id": "kv-size-factors",
  "category": "KV Cache",
  "difficulty": "Medium",
  "title": "KV Cache 大小相关参数",
  "prompt": "KV Cache 大小和哪些参数有关？",
  "quickAnswer": "KV Cache 显存 ≈ 2 × 层数 N × 上下文长度 L × KV 头数 hkv × 每头维度 dkv × 每参数字节数（精度）。此外还与并发 Batch B 成正比。模型总参数量不直接决定 KV 大小，决定它的是注意力结构（头数/维度）与序列、并发。",
  "approach": "KV 大小由 结构参数(N,hkv,dkv) × 序列/并发(L,B) × 精度 决定。",
  "explanationFocus": "是什么：KV 体量公式 KV = 2·N·L·hkv·dkv·bytes，与精度和并发 B 成正比，与总参数量无关。",
  "bruteForce": "凭模型大小粗略估显存 → 严重失准（KV 取决于注意力结构）。",
  "derivation": [
    "为什么需要：要准确预算并发上限，必须拆出每个因子。",
    "怎么实现：数清层数、KV 头数、头维、序列、并发、精度，代入公式。",
    "有什么代价：任一因子翻倍（尤其 L、B）都线性推高显存。",
    "怎么评测：扫 L、B 画 KV 显存曲线，定 SLA 内最大并发。"
  ],
  "invariant": "KV 对 L、B 严格线性；对 hkv、dkv、N 线性；对精度线性。",
  "walkthrough": "同模型换 GQA（hkv 32→8）：KV 直接降到 1/4，无需改权重。",
  "edgeCases": [
    "MQA：hkv=1，KV 极小但质量略降。",
    "FP8：bytes 减半。",
    "动态 L：实际按已生成长度计费，非最大上下文。"
  ],
  "code": "# Python\ndef kv_size_mb(B, N, L, hkv, dkv, bytes_p=2):\n    params = 2 * B * N * L * hkv * dkv\n    return params * bytes_p / 1e6",
  "codeNotes": [
    "权重显存 ∝ 总参数，KV 显存 ∝ 注意力结构×序列，两者独立。",
    "调 GQA 或精度比换模型更能控 KV。"
  ],
  "complexity": "O(B·L·N·hkv·dkv)；评估为 O(1) 代入公式。",
  "followUps": [
    {
      "question": "为什么总参数量不决定 KV？",
      "answer": "KV 只来自注意力层的 K/V 投影输出，维度由 (hkv,dkv) 定，与 FFN/词表等大部分参数无关；所以 70B 与 7B 若结构相同，单 token KV 相近。"
    },
    {
      "question": "哪个因子最容易爆？",
      "answer": "上下文长度 L 与并发 B，二者都是“使用方”参数，随业务需求上涨且无上限感，最常触发 OOM。"
    }
  ],
  "followUpAnswers": [
    "优先用 GQA 控 hkv。",
    "用 KV 量化控 bytes。"
  ],
  "pitfalls": [
    "用总参数量估 KV。",
    "忽略并发 B 对 KV 的乘法效应。"
  ],
  "beginnerSummary": "笔记厚度由五个旋钮决定：写了多少层（层数）、写多长（上下文）、每字记几个要点（KV 头数×维度）、几个人同时写（并发）、用多粗的笔（精度）。和“书有多厚（模型多大）”关系不大——和“你记笔记的方式”关系最大。",
  "prerequisites": [
    "KV 来自注意力层输出。",
    "显存随多项乘积增长。",
    "精度影响每参数字节。"
  ],
  "workedExample": [
    "B=1,N=32,L=4096,hkv=32,dkv=128,FP16: KV≈2·1·32·4096·32·128·2B≈2.1GB。",
    "hkv 改 8 → 0.53GB。"
  ],
  "lineByLine": [
    "层数 N 越多，每层都存 KV。",
    "长度 L、并发 B 线性放大。",
    "KV 头数/维度决定单位置体积。",
    "精度决定每参数字节。"
  ],
  "diagram": "KV = 2 · N · L · hkv · dkv · bytes\n影响因素:\n N 层数      ↑线性\n L 上下文    ↑线性(最易爆)\n hkv KV头数  ↑线性(GQA可控)\n dkv 头维    ↑线性\n bytes 精度  ↑线性(FP8减半)\nB 并发: 整体 ×B"
};
