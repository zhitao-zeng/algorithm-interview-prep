export default {
  "kind": "concept",
  "id": "quant-outlier-smoothquant",
  "category": "量化推理",
  "difficulty": "Hard",
  "title": "Outlier 问题与 SmoothQuant",
  "prompt": "大模型激活里的 outlier 是什么，SmoothQuant 怎么解决？",
  "quickAnswer": "LLM 激活存在极少数极大值的 outlier 通道，使量化 scale 被拉大、其余值被压成 0，精度崩。SmoothQuant 把激活的量化难度按通道\"平滑\"迁移到权重上：对激活除以平滑系数 s_c、对权重乘 s_c，使两者动态范围都更均衡，从而激活也能安全 INT8 量化(W8A8)。",
  "approach": "引入通道平滑系数，平衡激活与权重的量化难度。",
  "explanationFocus": "是什么：SmoothQuant 通过数学等价变换，把难以量化的激活 outlier 难度转移到更易量化的权重上，实现 W8A8。",
  "bruteForce": "直接 INT8 量化激活，outlier 让绝大多数值舍入成 0。",
  "derivation": [
    "为什么需要：激活 outlier 通道幅度是正常值几十倍，均匀量化后正常通道信息全丢。",
    "怎么实现：Y=X·W，引入对角 s，Y=(X·s^{-1})·(s·W)，选 s_c 使 X/s_c 与 s_c·W 范围均衡(常按通道激活/权重范围比取幂)。",
    "有什么代价：权重被放大后可能更易溢出，需配合权重量化；s 需校准确定。",
    "怎么评测：比较 W8A8(有/无 Smooth)精度与速度，平滑后常近 FP16 且显著更快。"
  ],
  "invariant": "变换前后 Y 数学等价；难度从激活移到权重。",
  "walkthrough": "OPT-13B 直接 W8A8 掉点严重，加 SmoothQuant 后精度几乎持平 FP16、吞吐翻倍。",
  "edgeCases": [
    "s 选太极端把权重推到溢出。",
    "不同层最优 s 不同需逐层校准。",
    "与 AWQ/GPTQ 可叠加。"
  ],
  "code": "# Python (SmoothQuant 系数)\ndef smooth_scales(act, w, alpha=0.5):\n    # act: [tokens, ic], w: [ic, oc]\n    a = act.abs().max(0)                         # 每输入通道激活范围\n    wmax = w.abs().amax(0)                       # 每输入通道权重范围\n    s = (a.pow(alpha) / wmax.pow(1-alpha)).clamp(min=1e-4)\n    return s                                      # X/=s, W*=s 后各自量化",
  "codeNotes": [
    "α 调激活/权重间难度分配, 常 0.5。",
    "变换等价, 不改变数学输出。"
  ],
  "complexity": "O(校准·通道) 求范围 + O(参数) 缩放；在线零额外计算。",
  "followUps": [
    {
      "question": "为什么能把难度移到权重？",
      "answer": "Y=XW 可在两侧同乘对角 s 保持等价；权重分布更平滑、更耐量化，于是整体更易压到 INT8。"
    },
    {
      "question": "SmoothQuant 和 AWQ 冲突吗？",
      "answer": "不冲突，SmoothQuant 解决激活侧、AWQ 保护权重侧，可组合用于更激进的 W4A8。"
    }
  ],
  "followUpAnswers": [
    "核心是等价变换转移难度。",
    "可与 AWQ/GPTQ 叠加。"
  ],
  "pitfalls": [
    "直接量化激活不处理 outlier。",
    "s 过度放大权重致溢出。"
  ],
  "beginnerSummary": "班里有个巨高个(outlier)，老师按他身高定尺，结果其他同学全被量成\"矮子\"。SmoothQuant 把尺\"折中\"：让高个稍微蹲一点、矮个稍微垫一点(等价变换)，于是所有人用同一把尺都能量准。",
  "prerequisites": [
    "激活存在极端 outlier 通道。",
    "Y=X·W 可两侧同乘对角阵。",
    "权重比激活更耐量化。"
  ],
  "workedExample": [
    "激活某通道 max=60, 正常≈2。",
    "乘 s 后激活降到≈8, 权重相应放大。"
  ],
  "lineByLine": [
    "统计激活/权重通道范围。",
    "按 α 求平滑系数 s。",
    "激活除 s、权重乘 s。",
    "两侧分别 INT8 量化。"
  ],
  "diagram": "X(有outlier)·W  ─▶ (X/s)·(sW)\n 激活范围↓   权重范围↑  → 都可 INT8"
};
