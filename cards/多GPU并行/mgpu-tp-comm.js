export default {
  "kind": "concept",
  "id": "mgpu-tp-comm",
  "category": "多GPU并行",
  "difficulty": "Medium",
  "title": "TP 的通信开销 all-reduce",
  "prompt": "张量并行的通信开销主要来自哪里，怎么估算？",
  "quickAnswer": "TP 每层前向/反向各需一次 all-reduce，通信量约等于该层输出激活大小(对隐藏维 h、序列 s、tp=t，约 2·s·h/t 每方向)。瓶颈在卡间带宽：NVLink 几百 GB/s 可隐藏，跨机以太网则难以承受。优化靠计算/通信重叠、通信算子融合与尽量把 TP 放在单机内。",
  "approach": "量化每层 all-reduce 量，用计算掩盖通信、提升带宽利用率。",
  "explanationFocus": "是什么：TP 的通信开销主要来自每层一次 all-reduce(汇总局部结果)，其通信量正比于层输出张量大小，受卡间互联带宽决定。",
  "bruteForce": "忽视通信，跨机跑 TP → 通信盖过计算，反而更慢。",
  "derivation": [
    "为什么需要：行切 GEMM 的结果必须跨卡求和，这是 TP 不可避免的同步点。",
    "怎么实现：每层 all-reduce 用 ring/tree 算法，传输量约 2·(数据量)·(t-1)/t；用非阻塞通信在计算 GEMM 时同时发，重叠掩盖。",
    "有什么代价：通信量与 s·h 成正比、随 tp 略降；t 越大通信占比越高；跨节点带宽低时成为主导。",
    "怎么评测：通信时间/计算时间比、MFU、不同 tp 度的扩展效率。"
  ],
  "invariant": "all-reduce 后各卡得到完全相同的聚合值，与单卡一致。",
  "walkthrough": "h=4096,s=2048,tp=8：每层激活约 4096×2048×2B≈16MB，all-reduce 双向约 32MB；NVLink 600GB/s 下 <0.1ms。",
  "edgeCases": [
    "tp 越大单卡通信占比越高。",
    "跨机以太网跑 TP 通信灾难。",
    "通信/计算重叠可显著降低有效开销。"
  ],
  "code": "# Python (概念)\ndef tp_layer_with_overlap(x, W_shard, world):\n    y = x @ W_shard\n    req = all_reduce_start(y, world)     # 非阻塞启动\n    z = compute_next(x)                  # 同时算下一块\n    return all_reduce_wait(req)",
  "codeNotes": [
    "all_reduce_start/wait 实现重叠。",
    "通信量 ≈ 2·s·h·bytes。"
  ],
  "complexity": "每层 all-reduce 量 ≈ 2·s·h/t×bytes；受带宽 B: 时间 ≈ 量/B。",
  "followUps": [
    {
      "question": "为什么 TP 不适合跨机？",
      "answer": "跨机带宽(几十 GB/s)远低于 NVLink(几百 GB/s)，而 TP 每层都 all-reduce、通信频繁，低带宽会让通信时间超过计算节省，净收益为负。"
    },
    {
      "question": "怎么降低 TP 通信影响？",
      "answer": "把 TP 限制在单机 NVLink 域内、用非阻塞通信与计算重叠、融合多个小 all-reduce、并适当减小 tp 度。"
    }
  ],
  "followUpAnswers": [
    "跨机低带宽使 TP 通信不划算。",
    "重叠计算/通信 + 限单机 NVLink。"
  ],
  "pitfalls": [
    "以为 TP 度越大越好——通信占比上升。",
    "把 TP 跨机部署导致更慢。"
  ],
  "beginnerSummary": "几个人分算一道大题，每算完一步就得把各自的小结果凑一起加总(对答案)。这\"对答案\"的次数很多、每次都要传不少数字。如果大家坐一桌(NVLink)传得飞快还好；要是隔着电话(跨机网络)慢慢念，反而不如一个人算。",
  "prerequisites": [
    "了解 all-reduce 汇总语义。",
    "知道带宽决定通信耗时。",
    "已理解 TP 行切需要求和。"
  ],
  "workedExample": [
    "h=4096,s=2048,tp=8，每层激活约 16MB。",
    "NVLink 600GB/s 下 all-reduce <0.1ms。"
  ],
  "lineByLine": [
    "每层行切产生局部结果。",
    "触发 all-reduce 跨卡求和。",
    "计算同时发通信以重叠。",
    "等待聚合结果继续前向。"
  ],
  "diagram": "卡0 ─┐\n卡1 ─┼─ all-reduce (量≈2·s·h/t) ─→ 各卡同值\n...\n卡t ─┘   带宽↑ 开销↓ (NVLink >> 以太网)"
};
