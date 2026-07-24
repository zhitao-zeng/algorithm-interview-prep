export default {
  "kind": "concept",
  "id": "quant-weight-act-kv",
  "category": "量化推理",
  "difficulty": "Medium",
  "title": "权重/激活/KV 量化对比",
  "prompt": "权重量化、激活量化、KV 量化分别量化什么，为何要分开看？",
  "quickAnswer": "权重量化压缩静态参数(省显存、易离线)；激活量化压缩每层中间输出(需处理 outlier、常留较高精度)；KV 量化压缩注意力缓存(随序列长度线性增长、是长上下文显存主因)。三者动态特性不同，故粒度与敏感度策略不同，常见组合 W4A16(权重4位/激活16位)+KV4/8位。",
  "approach": "权重可激进量化；激活与 KV 偏保守或细粒度。",
  "explanationFocus": "是什么：三者分别量化\"静态参数/中间激活/注意力缓存\"，因动态性与敏感度不同而采用不同策略。",
  "bruteForce": "只量化权重，KV 和激活全 FP16，长上下文仍爆显存。",
  "derivation": [
    "为什么需要：权重固定好压；激活逐样本变、含 outlier；KV 随上下文线性涨，是长文本显存杀手。",
    "怎么实现：权重离线 PTQ(INT4/INT8)；激活用 per-token/per-group 或 SmoothQuant；KV 用 INT8/INT4 按 head/group 量化。",
    "有什么代价：激活量化易掉点需细粒度；KV 量化在长序列才显现收益且可能影响注意力精度。",
    "怎么评测：分别消融看显存/精度，长上下文重点看 KV 量化收益。"
  ],
  "invariant": "KV 显存 ∝ 序列长度；权重显存 ∝ 参数量。",
  "walkthrough": "13B 模型 KV 在 4k→32k 上下文可从 2GB 涨到 16GB，INT8 KV 量化可减半。",
  "edgeCases": [
    "激活 outlier 使整 token 量化失真。",
    "KV 量化过粗损伤长程注意力。",
    "部分层对 KV 精度极敏感。"
  ],
  "code": "# Python (KV 量化示意)\ndef quantize_kv(k, bits=8):\n    # 按 head/group 量化 key/value 缓存\n    s = k.abs().amax(dim=-1, keepdim=True) / (2**(bits-1)-1)\n    k_q = (k / s).round().clamp(-(2**(bits-1)), 2**(bits-1)-1)\n    return k_q, s                                 # 注意时重算 s 反量化",
  "codeNotes": [
    "KV 量化常 per-head 或 per-group 保注意力质量。",
    "W4A16 不量化激活, 故激活仍 FP16。"
  ],
  "complexity": "权重离线 O(参数)；激活/KV 在线 O(序列·维度)，需低开销 kernel。",
  "followUps": [
    {
      "question": "为什么 KV 量化对长上下文最关键？",
      "answer": "KV 随序列长度线性增长，长文本时它才是显存主因，量化可直接延长可服务上下文长度。"
    },
    {
      "question": "W4A16 为什么不量化激活？",
      "answer": "激活含 outlier 且逐样本变，量化易掉点；留 FP16 保精度、只压权重最划算。"
    }
  ],
  "followUpAnswers": [
    "KV 是长上下文显存主因。",
    "W4A16 权衡精度与收益。"
  ],
  "pitfalls": [
    "混为一谈用同一粒度套三者。",
    "忽略 KV 长序列才显收益。"
  ],
  "beginnerSummary": "权重像书架上的固定藏书(压成小开本就省地)；激活像每次对话临时写的便签(内容多变、有重点词)；KV 像越聊越长的备忘录(聊得越久越长)。三样东西\"压缩难度\"不同，得分开处理。",
  "prerequisites": [
    "模型参数静态、激活逐样本变。",
    "注意力 KV 随序列增长。",
    "量化粒度影响精度。"
  ],
  "workedExample": [
    "权重 INT4: 13B 约 6.5GB→3.25GB。",
    "KV INT8: 32k 上下文 16GB→8GB。"
  ],
  "lineByLine": [
    "权重: 离线缩放量化。",
    "激活: 细粒度/动态处理 outlier。",
    "KV: 按 head/group 量化缓存。",
    "组合 W4A16+KV8 得综合收益。"
  ],
  "diagram": "权重(静态) ─▶ INT4 省显存\n激活(动态) ─▶ 细粒度/留16\nKV(随长度) ─▶ INT8 解长上下文"
};
