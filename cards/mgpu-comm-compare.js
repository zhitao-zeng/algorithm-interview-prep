export default {
  "kind": "concept",
  "id": "mgpu-comm-compare",
  "category": "多GPU并行",
  "difficulty": "Medium",
  "title": "各种并行的通信量对比",
  "prompt": "DP、TP、PP、EP、ZeRO 的通信模式和通信量各有什么特点？",
  "quickAnswer": "DP/ZeRO 通信在梯度(全参 all-reduce/reduce-scatter)、量正比参数量；TP 每层 all-reduce 量正比激活(s·h)、频率高但每次小、需高带宽；PP 仅相邻 stage 传激活/梯度、量最小但引入 bubble；EP 是 all-to-all、量正比 token×hidden、对拓扑最敏感；ZeRO-3 额外参数 all-gather。选并行就是在这几种通信形状与硬件带宽间权衡。",
  "approach": "按通信原语(reduce/all-reduce/all-to-all/point-to-point)与通信量归类对比。",
  "explanationFocus": "是什么：不同并行维度的通信本质不同——DP 是梯度 all-reduce、TP 是层内 all-reduce、PP 是相邻 stage 点对点、EP 是 all-to-all、ZeRO 加参数 gather，通信量与频率决定它们适合的硬件拓扑。",
  "bruteForce": "不分清通信模式就乱组合 → 某维通信在低速链路爆掉。",
  "derivation": [
    "为什么需要：并行策略必须匹配硬件(单机 NVLink vs 跨机 IB/以太网)，否则通信成瓶颈，需先量化各模式。",
    "怎么实现：DP/ZeRO 用 ring all-reduce(量≈2·P·(t-1)/t)；TP 每层 all-reduce(量≈2·s·h)；PP 点对点(量≈单层激活)；EP all-to-all(量≈tokens·h)；按拓扑把高带宽需求(TP/EP)放单机、低带宽(PP/DP)放跨机。",
    "有什么代价：TP/EP 频率高依赖带宽，PP 用 bubble 换低通信，没有免费方案。",
    "怎么评测：用通讯量公式估算各模式耗时，结合实测 MFU/扩展效率。"
  ],
  "invariant": "通信总量与模型规模、并行度相关，但正确实现下数值不变。",
  "walkthrough": "175B、tp=8 单机 NVLink、pp=4 跨机 IB、dp=64：TP 高频小通信走 NVLink，PP 低频激活走 IB，整体平衡。",
  "edgeCases": [
    "TP 跨机时 all-reduce 量虽小但频率高，仍易堵。",
    "EP all-to-all 在跨机几乎不可用。",
    "ZeRO-3 gather 与 TP 通信叠加需调度。"
  ],
  "code": "# Python (概念)\ndef comm_volume(mode, P, s, h, t):\n    if mode == 'dp':   return 2 * P * (t - 1) / t      # 梯度 all-reduce\n    if mode == 'tp':   return 2 * s * h / t             # 每层 all-reduce\n    if mode == 'pp':   return s * h                     # 相邻 stage 激活\n    if mode == 'ep':   return s * h                     # all-to-all\n    return 0",
  "codeNotes": [
    "DP 量 ∝ 参数量 P；TP 量 ∝ 激活 s·h。",
    "PP 最低但换 bubble；EP 对拓扑最敏感。"
  ],
  "complexity": "DP/ZeRO: O(P); TP: O(s·h)/层; PP: O(单层激活); EP: O(s·h) all-to-all。",
  "followUps": [
    {
      "question": "为什么 TP 必须配 NVLink？",
      "answer": "TP 每层都 all-reduce、通信频率极高，只有 NVLink 几百 GB/s 才能隐藏；跨机带宽低会让每层通信累积成瓶颈。"
    },
    {
      "question": "哪种并行通信量最小？",
      "answer": "PP 仅相邻 stage 传激活/梯度，通信量最小，代价是 bubble；EP 的 all-to-all 通常最吃网络。"
    }
  ],
  "followUpAnswers": [
    "TP 高频 all-reduce 需 NVLink 带宽。",
    "PP 通信量最小(代价 bubble)。"
  ],
  "pitfalls": [
    "只看单次量忽略通信频率。",
    "把 TP/EP 放到跨机低速链路。"
  ],
  "beginnerSummary": "几种分工方式\"对答案\"的方式不同：数据并行是大家各自算完把全部答案汇总(all-reduce)；张量并行是每层都要对一次小答案；流水线并行只在相邻工位传半成品(量最小但有空等)；专家并行是所有人互相寄快递(all-to-all，最费网络)。选哪种要看你们办公室内部传话快不快。",
  "prerequisites": [
    "了解各并行基本通信原语。",
    "知道带宽决定通信可行性。",
    "理解 bubble 与通信的权衡。"
  ],
  "workedExample": [
    "TP 每层 all-reduce 量 ∝ s·h、频率高。",
    "PP 仅相邻 stage 传激活，量最小。"
  ],
  "lineByLine": [
    "DP/ZeRO: 梯度 all-reduce。",
    "TP: 层内 all-reduce。",
    "PP: 相邻 stage 点对点。",
    "EP: all-to-all，最吃网络。"
  ],
  "diagram": "通信原语:\nDP/ZeRO ─ all-reduce (量∝参数量)\nTP      ─ all-reduce/层 (量∝激活, 高频)\nPP      ─ p2p 激活 (量最小, 有 bubble)\nEP      ─ all-to-all (最吃网络)"
};
