export default {
  "kind": "concept",
  "id": "quant-speedup",
  "category": "量化推理",
  "difficulty": "Easy",
  "title": "量化加速比计算",
  "prompt": "量化带来的加速比应该怎么估算与实测？",
  "quickAnswer": "加速比=基线时延/量化时延，理论来自算力倍数(低精度 MAC 更多)与带宽节省(字节更少)的瓶颈项取 min；实测需在目标硬件跑端到端(含 decode 与 prefill)取均值与 P99。要区分\"仅省显存\"(无算速收益)与\"真加速\"，并扣除 dequant/调度开销。",
  "approach": "先算 Roofline 理论上下限，再端到端实测。",
  "explanationFocus": "是什么：量化加速比是量化后相较 FP16 的时延缩减，由算力与带宽双重瓶颈决定，需实测。",
  "bruteForce": "只看字节数减半就声称 2× 加速。",
  "derivation": [
    "为什么需要：宣称加速要可验证，且不同阶段(prefill 算力 bound / decode 带宽 bound)主导因素不同。",
    "怎么实现：算力比=峰值 MAC 倍数；带宽比=字节比；加速受两者中较小者限制；端到端计时取均值/P99。",
    "有什么代价：kernel 启动、dequant、混精度调度会侵蚀理论值。",
    "怎么评测：固定输入/批大小，重复计时取稳定值，报告加速比与显存降幅。"
  ],
  "invariant": "实际加速 ≤ min(算力倍数, 带宽倍数)。",
  "walkthrough": "INT8 理论算力 2×、带宽 2×，但 decode 受带宽限制实际约 1.6×；prefill 近 1.9×。",
  "edgeCases": [
    "小 batch decode 受带宽非算力。",
    "kernel 开销侵蚀加速。",
    "不同序列长度瓶颈切换。"
  ],
  "code": "# Python\ndef speedup(t_fp16, t_quant):\n    return t_fp16 / t_quant                     # 端到端实测\n# 理论: min(peak_mac_ratio, bw_ratio) 再扣 overhead",
  "codeNotes": [
    "prefill 算力瓶颈, decode 带宽瓶颈。",
    "务必排除冷启动与预热。"
  ],
  "complexity": "计时 O(重复次数)；理论为硬件常数比。",
  "followUps": [
    {
      "question": "为什么实际加速常低于理论？",
      "answer": "dequant、kernel 启动、混精度调度与未打满的占用率都会侵蚀理论峰值。"
    },
    {
      "question": "prefill 和 decode 加速一样吗？",
      "answer": "不一样：prefill 大矩阵乘受算力瓶颈，decode 小矩阵受带宽瓶颈，二者加速比不同。"
    }
  ],
  "followUpAnswers": [
    "开销侵蚀理论值。",
    "prefill/decode 瓶颈不同。"
  ],
  "pitfalls": [
    "只按字节比宣称加速。",
    "没排除预热/冷启动。"
  ],
  "beginnerSummary": "加速好比\"抄近路省时间\"：省下的时间受两条路里更慢那条限制(木桶短板)。还得扣掉\"换鞋(dequant)\"耽误的时间，才是真正快了多少。",
  "prerequisites": [
    "Roofline: 算力/带宽瓶颈。",
    "INT8/FP8 字节更少。",
    "端到端时延可测。"
  ],
  "workedExample": [
    "理论 min(2×,2×)=2×。",
    "实测 decode 1.6×。"
  ],
  "lineByLine": [
    "算算力与带宽理论比。",
    "取瓶颈较小者。",
    "端到端计时。",
    "扣开销得实际加速。"
  ],
  "diagram": "加速 ≤ min(算力倍数, 带宽倍数) − 开销"
};
