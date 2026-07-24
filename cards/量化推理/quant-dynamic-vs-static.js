export default {
  "kind": "concept",
  "id": "quant-dynamic-vs-static",
  "category": "量化推理",
  "difficulty": "Medium",
  "title": "动态量化与静态量化",
  "prompt": "动态量化和静态量化有什么区别，各适合什么场景？",
  "quickAnswer": "静态量化在离线阶段(用校准数据)就固定好激活的 scale，推理时直接查表，速度快但依赖校准质量；动态量化在每次推理时现场计算激活 scale(权重仍离线量化)，免校准、对输入分布鲁棒，但每步多一次统计开销。激活波动大/难校准时常选动态，追求极致时延选静态。",
  "approach": "权重离线量化；激活按需选择静态(快)或动态(稳)。",
  "explanationFocus": "是什么：二者区别在激活 scale 何时确定——静态离线定、动态推理时定。",
  "bruteForce": "激活也用固定全局 scale 且从不校准。",
  "derivation": [
    "为什么需要：激活随输入变，固定 scale 可能不准；动态可自适应但耗算力。",
    "怎么实现：静态=校准得激活 scale 存下；动态=每步对当前激活求 max 现算 scale 再量化。",
    "有什么代价：静态需好校准否则崩；动态每步统计+量化开销，时延略高。",
    "怎么评测：同模型比较静态/动态精度与时延，按场景取舍。"
  ],
  "invariant": "权重通常都离线量化；差异仅在激活 scale 时机。",
  "walkthrough": "LSTM/小模型动态量化常见且稳；LLM 大张量多用静态(W8A8)以省开销。",
  "edgeCases": [
    "动态对小 batch 开销占比高。",
    "静态校准偏则整模型偏移。",
    "混合: 权重静态+激活动态。"
  ],
  "code": "# Python (动态激活量化)\ndef dynamic_act_quant(x, bits=8):\n    s = x.abs().amax() / (2**(bits-1)-1)         # 本步现算\n    return (x / s).round().clamp(-(2**(bits-1)), 2**(bits-1)-1), s",
  "codeNotes": [
    "动态免校准, 对分布漂移鲁棒。",
    "每步统计带来少量开销。"
  ],
  "complexity": "动态每步 O(元素) 统计；静态零在线统计。",
  "followUps": [
    {
      "question": "为什么 LLM 多用静态？",
      "answer": "大矩阵激活分布相对稳定且为省每步统计开销，配合校准/平滑做静态 W8A8 更划算。"
    },
    {
      "question": "动态量化需要校准吗？",
      "answer": "不需要，激活 scale 推理时现算；但权重通常仍离线静态量化。"
    }
  ],
  "followUpAnswers": [
    "动态免校准更鲁棒。",
    "静态更快需好校准。"
  ],
  "pitfalls": [
    "静态不校准直接上线。",
    "动态开销被低估(小 batch)。"
  ],
  "beginnerSummary": "静态像提前印好尺子(快但万一印错就一直错)；动态像每次现量(稳但每次多花点量时间)。量体重用动态更准，流水线量产用静态更快。",
  "prerequisites": [
    "激活随输入变化。",
    "scale 决定量化精度。",
    "权重常离线量化。"
  ],
  "workedExample": [
    "静态: 校准定 scale, 查表用。",
    "动态: 每步 amax 现算 scale。"
  ],
  "lineByLine": [
    "权重离线量化。",
    "静态: 校准存激活 scale。",
    "动态: 推理时算激活 scale。",
    "按场景选其一。"
  ],
  "diagram": "静态: 校准─▶存scale─▶推理查表(快)\n动态: 推理─▶现算scale─▶量化(稳)"
};
