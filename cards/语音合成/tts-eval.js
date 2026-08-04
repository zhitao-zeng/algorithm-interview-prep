export default {
  "id": "tts-eval",
  "category": "语音合成",
  "difficulty": "Medium",
  "title": "TTS 主客观评测",
  "prompt": "如何对 TTS 系统做全面评测，覆盖 MOS、说话人相似度与自然度等主客观指标？",
  "quickAnswer": "主观用 MOS/相似度/自然度人工打分与 AB 测试；客观用说话人编码器余弦相似度、STOI/PESQ、音素错误率与稳定性指标，二者结合判断优劣。",
  "code": "def compute_mos(scores: list) -> float:\n    # 主观打分平均，过滤异常评分\n    scores = remove_outliers(scores)\n    return sum(scores) / len(scores)\n\ndef speaker_similarity(a, b):\n    return cosine(encoder(a), encoder(b))",
  "complexity": "时间 O(N)，空间 O(1)（N 为样本数）",
  "beginnerSummary": "像餐厅评分既看食客打分(主观)也看营养检测(客观)，主客观结合才可靠。",
  "derivation": [
    "为什么需要：自然度/相似度单看指标会失真，需主客观互补。",
    "怎么实现：主观 MOS+相似度打分与 ABX；客观用 ECAPA 余弦、PESQ/STOI、WER。",
    "有什么代价：人工评测贵且慢、方差大；客观指标与听感不完全一致。",
    "怎么评测：用评测集给出各指标均值与置信区间，跨系统 AB 显著性检验。"
  ],
  "edgeCases": [
    "评测员疲劳导致打分漂移。",
    "参考音频与合成域不匹配拉低相似度。",
    "短句 MOS 方差大需增大样本。",
    "客观指标高但听感差的特例需人工复检。"
  ],
  "pitfalls": [
    "只用客观指标(如 PESQ)误判自然度。",
    "样本量小导致 MOS 无统计意义。"
  ],
  "prerequisites": [
    "说话人验证/编码器",
    "语音质量客观指标"
  ],
  "workedExample": [
    "收集 50 句合成音频，20 人打 MOS 与相似度(1-5)。",
    "客观算 ECAPA 余弦与 PESQ，综合排序。"
  ],
  "lineByLine": [
    "def compute_mos(scores)：主观 MOS 计算入口。",
    "scores = remove_outliers(scores)：剔除异常评分保证稳健。",
    "return sum(scores) / len(scores)：返回平均 MOS。",
    "cosine(encoder(a), encoder(b))：说话人余弦相似度。"
  ],
  "followUps": [
    {
      "question": "客观相似度与主观相似度不一致怎么办？",
      "answer": "检查编码器域偏置，补充 ABX 与细粒度聚类分析定位偏差来源。"
    },
    {
      "question": "如何用稳定性指标补充 MOS？",
      "answer": "加崩坏率/异常 loss 占比，避免高 MOS 掩盖偶发崩溃。"
    }
  ],
  "followUpAnswers": [
    "检查编码器域偏置，补充 ABX 与细粒度聚类分析定位偏差来源。",
    "加崩坏率/异常 loss 占比，避免高 MOS 掩盖偶发崩溃。"
  ],
  "explanationFocus": "是什么：TTS 评测用主观(人听打分)与客观(自动指标)共同衡量自然度、相似度与稳定性。本课给出可落地的指标组合。",
  "approach": "主观以 MOS/相似度/ABX 为主，客观以说话人余弦、PESQ/STOI、WER 与稳定性指标为辅，跨系统做显著性检验综合判定。",
  "kind": "concept"
};
