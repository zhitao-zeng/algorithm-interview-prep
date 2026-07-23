export default {
  "kind": "concept",
  "id": "cb-static-problems",
  "category": "Continuous Batching",
  "difficulty": "Medium",
  "title": "静态 Batching 的问题",
  "prompt": "静态 Batching（Static Batching）有哪些典型问题？",
  "quickAnswer": "静态 batching 有三个主要问题：(1) padding 浪费——为对齐长度给短序列补 pad，这些 pad 仍占算力；(2) 气泡/等待——必须等整批最慢请求结束才换批，短请求空占；(3) 显存按最大长度预留，长尾请求撑爆 batch 容量。Continuous Batching 逐个击破这些问题。",
  "approach": "把静态批的\"对齐 + 整批同步 + 整批预留\"三点逐一换成动态策略。",
  "explanationFocus": "是什么：静态 Batching 指预先凑满固定 batch、对齐长度、等整批结束后统一换下一批的调度方式，其问题集中在 padding、气泡与显存预留。",
  "bruteForce": "每个 batch 取固定数量请求，padding 到相同长度，等最长请求生成完毕再整体出队。",
  "derivation": [
    "为什么需要：理解静态批的问题才能论证连续的必要性——padding 让无意义 token 参与计算，气泡让算力空转，显存预留让 batch 容量被少数长请求吃掉。",
    "怎么实现：静态批通常在预处理阶段把序列 pad 到 batch 内最大长度，attention 用 mask 屏蔽 pad；换批以请求为单位整体进行。",
    "有什么代价：pad 比例越高浪费越大；整批等待导致 P99 延迟差；为安全预留显存使并发上限被迫调低。",
    "怎么评测：统计 pad token 占比、平均气泡步、实际可达并发数，对比连续方案。"
  ],
  "invariant": "静态批内有效计算占比 = 真实 token 数 / (pad 后 token 数)，越低越浪费。",
  "walkthrough": "batch=4，长度 [4, 32, 8, 64]，pad 到 64 → pad 后共 256 token，真实仅 108，有效占比 42%，近六成算力打水漂。",
  "edgeCases": [
    "长度方差小：padding 浪费低，静态批尚可接受。",
    "个别超长请求：拉高整体 pad 长度，连累整批。",
    "batch 末尾凑不满：剩余 slot 全 pad，浪费放大。"
  ],
  "code": "# Python\ndef padding_waste(lengths):\n    max_len = max(lengths)\n    padded = sum(max_len for _ in lengths)\n    real = sum(lengths)\n    return 1 - real / padded  # pad 浪费比例",
  "codeNotes": [
    "pad 到 batch 内最大长度，越长尾浪费越高。",
    "连续 batching 不强制同长度，天然免 padding。"
  ],
  "complexity": "浪费比例随长度方差增大；换批等待使尾延迟劣化。",
  "followUps": [
    {
      "question": "padding 和气泡哪个更致命？",
      "answer": "高并发长尾下气泡（等待）通常更致命，因为它直接拉高 P99；短序列密集时 padding 浪费也不可忽视。"
    },
    {
      "question": "静态批能不能不 pad？",
      "answer": "不 pad 就无法组成规整张量并行计算，GPU 核要求规整形状，所以静态批必须 pad 或分桶。"
    }
  ],
  "followUpAnswers": [
    "长尾下气泡更致命，拉高 P99。",
    "静态批必须 pad 才能规整并行。"
  ],
  "pitfalls": [
    "把\"对齐长度\"和\"等整批\"混为一谈，其实是两个独立问题。",
    "以为显存预留只影响内存，其实它压低了可达并发。"
  ],
  "beginnerSummary": "静态批像把不同身高的人硬塞进同样高的箱子，矮的周围塞满泡沫（padding）；又像全班必须等最慢的同学交卷才能下课（气泡）。两种做法都让有用的空间和时间被白白占用。",
  "prerequisites": [
    "attention 需要规整张量。",
    "batch 内长度不齐需 padding。",
    "显存按预留长度分配。"
  ],
  "workedExample": [
    "长度 [4,32,8,64] pad 到 64。",
    "256 token 中仅 108 有效，浪费 58%。"
  ],
  "lineByLine": [
    "取 batch 内最大长度。",
    "每个序列 pad 到该长度。",
    "求和得 pad 后总 token。",
    "用 1 - 真实/总 得到浪费比例。"
  ],
  "diagram": "静态批: [4,32,8,64] → pad 到 64 → 泡沫占 58%\n问题: padding + 气泡 + 显存预留"
};
