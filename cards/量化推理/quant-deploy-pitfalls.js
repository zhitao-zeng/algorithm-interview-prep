export default {
  "kind": "concept",
  "id": "quant-deploy-pitfalls",
  "category": "量化推理",
  "difficulty": "Hard",
  "title": "部署量化模型的坑",
  "prompt": "把量化模型部署上线有哪些常见坑，怎么规避？",
  "quickAnswer": "常见坑：①数值溢出(INT32 累加/FP8 范围没 clamp)；②dequant 开销未融合导致反而变慢；③推理框架不支持某精度组合(退化存省不加速)；④零点/scale 形状对齐错；⑤校准分布漂移使线上掉点；⑥混精度调度复杂易错。规避靠：显存/时延/精度三维实测、用成熟 kernel、校准数据贴近线上、逐步灰度。",
  "approach": "上线前三维(显存/时延/精度)实测+灰度，逐坑 checklist。",
  "explanationFocus": "是什么：部署量化模型的工程陷阱，集中在数值正确性、性能与框架兼容性，需实测规避。",
  "bruteForce": "量化完直接替换上线，不测 P99 与兼容性。",
  "derivation": [
    "为什么需要：量化省了资源但引入新失败模式，线上出问题代价高。",
    "怎么实现：核对 kernel 支持精度、融合 dequant、clamp 防溢出、校验 scale/零点形状、用线上分布校准、灰度对比。",
    "有什么代价：排查需时间；部分框架对混合精度支持差需自写算子。",
    "怎么评测：A/B 灰度比精度与时延，监控 P99 与异常输出。"
  ],
  "invariant": "线上分布≈校准分布且 kernel 到位时，量化才安全加速。",
  "walkthrough": "某服务上 INT8 后 P99 涨 30%，发现 dequant 未融合；融合后反降 15%，且校准补了线上语料后精度回平。",
  "edgeCases": [
    "框架偷偷回退到 FP16 计算。",
    "长尾输入触发溢出 NaN。",
    "多卡 kernel 行为不一致。"
  ],
  "code": "# Python (部署前断言)\ndef sanity(quant_model, sample):\n    assert not torch.isnan(quant_model(sample)).any()   # 防溢出NaN\n    # 校验 scale/零点形状、kernel 实际精度路径",
  "codeNotes": [
    "务必断言无 NaN/Inf。",
    "检查框架是否真走低精度路径。"
  ],
  "complexity": "排查成本 O(问题定位)；正确部署后推理同正常量化。",
  "followUps": [
    {
      "question": "怎么发现框架偷偷回退 FP16？",
      "answer": "用 profiler 看是否真调用 INT8/FP8 kernel，或对比显存/时延是否达预期，未达即可能回退。"
    },
    {
      "question": "溢出通常出现在哪？",
      "answer": "INT32 累加溢出或 FP8/E4M3 超 448 未 clamp，导致 NaN/Inf，需分块与 clamp。"
    }
  ],
  "followUpAnswers": [
    "profiler 验证真实路径。",
    "clamp 防 FP8 溢出。"
  ],
  "pitfalls": [
    "不测 P99 只信均值。",
    "忽略框架精度回退。"
  ],
  "beginnerSummary": "量化上线像把大货车换成小卡车省油(省显存)，但得先确认桥(框架)限高能过、别超载(溢出)、别因改装(未融合)反而更慢。否则省了油却半路抛锚。",
  "prerequisites": [
    "量化引入新失败模式。",
    "框架支持决定能否加速。",
    "线上分布需匹配校准。"
  ],
  "workedExample": [
    "dequant 未融合 → P99 涨 30%。",
    "补线上语料校准 → 精度回平。"
  ],
  "lineByLine": [
    "核对 kernel 精度支持。",
    "融合 dequant 防变慢。",
    "clamp 防溢出 NaN。",
    "灰度实测三维指标。"
  ],
  "diagram": "量化模型 ─▶ [溢出?][回退?][变慢?] ─▶ 实测 ─▶ 灰度上线"
};
