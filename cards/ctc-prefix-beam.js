export default {
  "kind": "code",
  "id": "ctc-prefix-beam",
  "category": "ASR 专项",
  "difficulty": "Hard",
  "title": "CTC Prefix Beam Search",
  "prompt": "说明 prefix beam 为什么维护 p_blank 和 p_nonblank。",
  "quickAnswer": "同一前缀以 blank/nonblank 结尾的转移不同；分开累计才能正确处理重复字符。",
  "approach": "同一前缀以 blank/nonblank 结尾的转移不同；分开累计才能正确处理重复字符。",
  "explanationFocus": "CTC Prefix Beam Search：同一前缀以 blank/nonblank 结尾的转移不同；分开累计才能正确处理重复字符。",
  "bruteForce": "《CTC Prefix Beam Search》可枚举所有对齐或转写路径再求和/比较，但路径数随帧数指数增长。",
  "derivation": [
    "Greedy 每帧独立取最大，忽略「之前选了什么」对后续的影响。",
    "Prefix Beam 用 DP 同时跟踪「以 blank 收尾」与「以标签收尾」两条状态，正确累加合并前后的概率。",
    "beam 宽度 k 在精度与计算间折中，复杂度约 O(T·k·V)。"
  ],
  "invariant": "每步保存的分数完整覆盖 CTC Prefix Beam Search：同一前缀以 blank/nonblank 结尾的转移不同；分开累计才能正确处理重复字符。 下所有合法历史，而不会重复或遗漏对齐路径。",
  "walkthrough": "演练《CTC Prefix Beam Search》时写出两三帧的 token、blank 与前缀/状态转移。",
  "edgeCases": [
    "空输入（len(log_probs)==0）：应返回空或报错（code 已校验）。",
    "beam_size=1：退化为接近 Greedy。",
    "标签重复（如 \"AA\"）：靠 blank 分隔正确保留。"
  ],
  "code": "# Python\nimport math\n\ndef _logadd(a,b):\n    if a == -math.inf: return b\n    if b == -math.inf: return a\n    m=max(a,b); return m+math.log(math.exp(a-m)+math.exp(b-m))\n\ndef ctc_prefix_beam(log_probs, blank, beam_size=3):\n    if beam_size<=0: raise ValueError(\"beam_size must be positive\")\n    if len(log_probs) == 0: return []\n    vocab=len(log_probs[0]); beams={(): (0.0,-math.inf)}\n    for frame in log_probs:\n        if len(frame)!=vocab or not 0<=blank<vocab: raise ValueError(\"invalid log_probs or blank\")\n        nxt={}\n        for prefix,(pb,pnb) in beams.items():\n            total=_logadd(pb,pnb); old=nxt.get(prefix,(-math.inf,-math.inf))\n            nxt[prefix]=(_logadd(old[0],total+float(frame[blank])),old[1])\n            for token,value in enumerate(frame):\n                if token==blank: continue\n                lp=float(value); last=prefix[-1] if prefix else None\n                if token==last:\n                    same=nxt.get(prefix,(-math.inf,-math.inf)); nxt[prefix]=(same[0],_logadd(same[1],pnb+lp))\n                    ext=prefix+(token,); prev=nxt.get(ext,(-math.inf,-math.inf)); nxt[ext]=(prev[0],_logadd(prev[1],pb+lp))\n                else:\n                    ext=prefix+(token,); prev=nxt.get(ext,(-math.inf,-math.inf)); nxt[ext]=(prev[0],_logadd(prev[1],total+lp))\n        beams=dict(sorted(nxt.items(),key=lambda item:_logadd(*item[1]),reverse=True)[:beam_size])\n    return list(max(beams.items(),key=lambda item:_logadd(*item[1]))[0])",
  "codeNotes": [
    "概率累积应在 log 域使用 log-sum-exp。",
    "流式场景要明确何时提交稳定前缀和截断缓存。"
  ],
  "complexity": "时间 O(T·beam·V log(beam·V))（含候选排序），峰值空间 O(beam·V·T)（候选前缀 tuple）",
  "followUps": [
    {
      "question": "如何融合语言模型？",
      "answer": "扩展新前缀时加入 λ·LM(prefix+token) 与长度奖励，再按总分排序。"
    },
    {
      "question": "为什么必须区分 p_b/p_nb？",
      "answer": "重复字符从 nonblank 直接扩展会违反 CTC 合并规则；只有区分末尾状态才能正确计算。"
    }
  ],
  "followUpAnswers": [
    "扩展分数时加上 λ·LM(prefix+c) 和长度奖励。",
    "同一前缀有多条对齐路径，概率应相加；对数域用 log-sum-exp。"
  ],
  "pitfalls": [
    "重复 token 转移未用 blank 路径隔离，导致同一标签被错误合并或重复累计概率。",
    "beam_size 不限制，复杂度退化为穷举。"
  ],
  "beginnerSummary": "CTC Prefix Beam Search 是比 Greedy 更准的解码：在 beam 宽度内维护若干「前缀」（已部分解码的标签序列），每读一帧，对每个前缀考虑两种扩展——「输出 blank（前缀不变）」和「输出某个标签（前缀追加该标签）」——用动态规划累计概率，只保留总分最高的若干前缀，最后取最优。它能利用标签转移概率，避免 Greedy 的短视。",
  "prerequisites": [
    "维护两类概率：以 blank 结尾的前缀概率（prefix stays）、以某标签结尾的前缀概率（prefix extends）。",
    "每帧用当前帧的 log 概率更新所有候选前缀的两条路径。",
    "beam_size 限制同时保留的前缀数量，控制开销。"
  ],
  "workedExample": [
    "t0：\"\"(1.0)。t1：\"C\"(0.6)、\"\"(0.4)。t2：\"CA\"(0.5)、\"C\"(0.3)（保留概率最高的前缀）。",
    "最终取最高前缀，合并重复 + 去 blank 得结果；beam 越大越接近全局最优。"
  ],
  "lineByLine": [
    "初始化前缀集合 {\"\" : (blank_prob=1, label_prob=0)}。",
    "对每帧：对每个前缀，用帧 log 概率更新「blank 路径」（前缀不变）与「label 路径」（追加该 label）。",
    "处理重复标签：连续相同标签只能经 blank 路径合并，避免重复计数。",
    "按总概率排序保留 top-beam_size 前缀，最终取最优。"
  ],
  "diagram": "前缀波束 beam=2:\nt0: \"\"        (1.0)\nt1: \"C\"(0.6), \"\"(0.4)\nt2: \"CA\"(0.5), \"C\"(0.3)\n保留高概率前缀, 空白/非空白两路扩展\n最终取最高前缀 → 去 blank"
};
