export default {
  "id": "asr-chinavoices",
  "category": "ASR 专项",
  "difficulty": "Hard",
  "title": "ChinaVoices 竞赛消融与负收益定位",
  "prompt": "在 ChinaVoices 竞赛中，如何通过全参 vs decoder-only、外部数据 vs Reference Set、Hard Focus、多任务学习的消融，定位外部语料正字法不一致、过采样遗忘、LID 梯度干扰等负收益来源并拿到 CER 13.423%？",
  "quickAnswer": "逐因素消融全参/decoder-only、外部数据/RefSet、Hard Focus、多任务，定位外部语料正字法不一致、过采样遗忘、LID 梯度干扰为负收益后修正，最终 CER 13.423%（第 2）。",
  "code": "def ablation_log(name: str, cer: float, baseline_cer: float) -> dict:\n    \"\"\"记录消融实验：对比全参/decoder-only、外部数据/RefSet、Hard Focus、多任务。\"\"\"\n    return {\"ablation\": name, \"cer\": cer,\n            \"delta\": round(cer - baseline_cer, 3),\n            \"positive\": cer < baseline_cer}",
  "complexity": "时间 O(1)，空间 O(1)",
  "beginnerSummary": "像做对照实验：每次只换一个配方，看哪味“药材”让成绩变好或变差，最后挑出拖后腿的并拿到第二。",
  "derivation": [
    "为什么需要：竞赛多策略叠加易互相吞噬收益，必须逐因素消融才能定位负收益来源。",
    "怎么实现：系统消融全参微调 vs decoder-only、外部数据 vs Reference Set、Hard Focus、多任务学习；用 ablation_log 记录每项 delta 与正负。",
    "有什么代价：消融需多组训练，算力开销大；外部语料需先做正字法对齐，否则引入噪声。",
    "怎么评测：定位外部语料正字法不一致、过采样导致遗忘、LID 梯度干扰为负收益后修正，最终 ASR CER 13.423%（第 2 名）。"
  ],
  "edgeCases": [
    "外部语料与比赛集正字法（数字/标点）不一致，消融呈负收益需先归一。",
    "过采样某域导致其他域遗忘，CER 反弹。",
    "多任务中 LID 弱监督（67.57%）梯度干扰拉低 ASR。",
    "decoder-only 在全参下过拟合小 RefSet。"
  ],
  "pitfalls": [
    "多策略一把梭不消融，负收益被正收益掩盖。",
    "把 Reference Set 与外部数据混用未控制变量，结论不可信。"
  ],
  "prerequisites": [
    "消融实验设计",
    "正字法归一化",
    "多任务梯度干扰（见 asr-lid）"
  ],
  "workedExample": [
    "步骤1：baseline 全参微调得 CER 基准。",
    "步骤2：逐项加 decoder-only、外部数据、Hard Focus、多任务，ablation_log 记录 delta。",
    "步骤3：发现外部数据负收益（正字法不一致）与多任务负收益（LID 干扰），修正后 CER 13.423% 第 2。"
  ],
  "lineByLine": [
    "def ablation_log(name, cer, baseline_cer): 定义消融记录，输入实验名与本次 CER。",
    "delta = round(cer - baseline_cer, 3) 计算相对基准的变化。",
    "positive = cer < baseline_cer 判断该项是否正向。",
    "返回结构化记录便于横向比较各消融。"
  ],
  "followUps": [
    {
      "question": "Hard Focus 是什么？",
      "answer": "Hard Focus 是对难例（高错词/易混音）做聚焦采样或加权训练，提升难样本召回；但若与过采样叠加会触发遗忘需平衡。"
    },
    {
      "question": "外部数据负收益怎么修？",
      "answer": "先对外部语料做与比赛集一致的正字法归一（数字、标点、繁简），再做去重与比例控制，负收益转正向。"
    }
  ],
  "followUpAnswers": [
    "Hard Focus 是对难例（高错词/易混音）做聚焦采样或加权训练，提升难样本召回；但若与过采样叠加会触发遗忘需平衡。",
    "先对外部语料做与比赛集一致的正字法归一（数字、标点、繁简），再做去重与比例控制，负收益转正向。"
  ],
  "invariant": "ablation_log 输出的 delta 恒等于 round(cer - baseline_cer, 3)，positive 为真当且仅当 cer < baseline_cer，自洽无矛盾。",
  "walkthrough": "name='external_data', cer=14.0, baseline=13.5 → delta=0.5, positive=False 记为负收益；修正后 cer=13.2 → delta=-0.3, positive=True。",
  "kind": "code"
};
