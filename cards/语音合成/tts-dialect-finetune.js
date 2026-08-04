export default {
  "id": "tts-dialect-finetune",
  "category": "语音合成",
  "difficulty": "Hard",
  "title": "方言声线微调与崩坏归因",
  "prompt": "对北京话/河南话/天津话等方言做声线微调时，常见的崩坏原因有哪些，如何用统一数据与回归流程控制稳定性？",
  "quickAnswer": "崩坏多源于训练数据被噪声/混响污染、采样率与响度混杂、以及 code-switching 分布偏移；应统一采样率与响度、控制混读比例，并建立音色相似度/自然度/韵律/稳定性的回归流程。",
  "code": "def finetune_dialect(base_ckpt, dialect_data, config):\n    # 统一采样率 24k、统一响度 -23 LUFS 后再微调\n    data = normalize(dialect_data, sr=24000, lufs=-23)\n    model = load(base_ckpt)\n    return train(model, data, control_codeswitch=config[\"code_switch_prob\"])",
  "complexity": "时间 O(epochs·N)，空间 O(model)（N 为样本数）",
  "beginnerSummary": "就像教一个普通话老师学方言，若录音环境嘈杂、音量不一、还夹带太多普通话，就会\"学歪\"；统一条件再系统验收才能学好。",
  "derivation": [
    "为什么需要：方言数据稀缺且脏，直接微调易崩坏、音色漂移。",
    "怎么实现：统一重采样与响度归一化，控制 code-switch 比例，在基模型上低学习率微调。",
    "有什么代价：统一处理会损失部分自然方言特征；低资源下易过拟合。",
    "怎么评测：回归流程覆盖音色相似度(ECAPA)、自然度 MOS、韵律偏差与稳定性(崩坏率)。"
  ],
  "edgeCases": [
    "方言中夹杂普通话词比例过高导致偏移。",
    "录音自发混响/底噪未清洗污染模型。",
    "不同说话人音高范围差异大需归一化。",
    "小语种样本极少导致过拟合崩坏。"
  ],
  "pitfalls": [
    "直接用原始脏数据微调导致音色污染与尖叫。",
    "只看 MOS 忽略稳定性，线上偶发崩坏未被发现。"
  ],
  "prerequisites": [
    "说话人自适应与微调基础",
    "音频预处理(重采样/响度归一化)"
  ],
  "workedExample": [
    "收集天津话音频→统一 24k、响度 -23 LUFS→基模型低 lr 微调。",
    "回归集上跑相似度/自然度/韵律/稳定性四维打分验收。"
  ],
  "lineByLine": [
    "data = normalize(dialect_data, sr=24000, lufs=-23)：统一数据条件。",
    "model = load(base_ckpt)：加载通用基模型。",
    "train(model, data, control_codeswitch=...)：控制混读比例训练。"
  ],
  "followUps": [
    {
      "question": "如何量化\"混响污染\"的影响？",
      "answer": "在回归集对比有无去混响的崩坏率与自然度，统计混响强度与 MOS 的相关性，定位污染样本。"
    },
    {
      "question": "稳定性回归流程包含哪些指标？",
      "answer": "音色相似度(ECAPA 余弦)、自然度 MOS、韵律偏差(基频/时长 KL)、崩坏率(异常 loss 比例)四维综合。"
    }
  ],
  "followUpAnswers": [
    "在回归集对比有无去混响的崩坏率与自然度，统计混响强度与 MOS 的相关性，定位污染样本。",
    "音色相似度(ECAPA 余弦)、自然度 MOS、韵律偏差(基频/时长 KL)、崩坏率(异常 loss 比例)四维综合。"
  ],
  "explanationFocus": "是什么：方言声线微调是在通用 TTS 基模型上用方言数据做自适应，使音色与口音方言化。本课关注崩坏归因与稳定化流程。",
  "approach": "先统一数据条件(采样率/响度/去噪去混响)、控制 code-switching 分布，再用低学习率微调，并以\"音色相似度+自然度+韵律+稳定性\"四维回归验收。",
  "kind": "concept"
};
