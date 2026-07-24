export default {
  "kind": "concept",
  "id": "quant-calibration",
  "category": "量化推理",
  "difficulty": "Medium",
  "title": "量化校准流程",
  "prompt": "PTQ 的校准(calibration)流程是什么，校准数据怎么选？",
  "quickAnswer": "校准是用一小批(通常 128~1024 条)代表性数据前向统计各张量/通道的激活范围(min/max 或百分位)，据此确定 scale/零点。数据应覆盖真实推理分布(领域、长度、语言)，否则统计失真导致缩放错配。常见策略：minmax、熵(KL)、百分位(如 99.9%)裁剪。",
  "approach": "取代表性样本前向收集激活统计，选裁剪策略定 scale。",
  "explanationFocus": "是什么：校准是用少量真实数据估计量化参数(scale/零点)的过程，决定 PTQ 精度上限。",
  "bruteForce": "用权重范围代替激活范围，或随机噪声校准。",
  "derivation": [
    "为什么需要：激活 scale 依赖输入分布，不校准就只能猜，极易削掉正常值。",
    "怎么实现：加载模型→喂校准批→钩子收集每层激活→按策略(minmax/percentile/KL)算范围→生成量化参数。",
    "有什么代价：需领域数据、需前向一遍；策略与样本量影响结果。",
    "怎么评测：用校准后的 PTQ 跑精度评测，对比不同策略/样本量的掉点。"
  ],
  "invariant": "校准分布≈推理分布时，PTQ 精度最佳。",
  "walkthrough": "用 512 条领域文本校准 7B 模型 INT8，PPL 与 FP16 差<0.3。",
  "edgeCases": [
    "校准用英语、推理中文→失真。",
    "minmax 被单个 outlier 拉爆。",
    "样本太少统计不稳。"
  ],
  "code": "# Python (百分位校准)\ndef calibrate(act_samples, q=99.9):\n    a = torch.cat(act_samples)\n    maxv = torch.quantile(a.abs(), q/100)        # 裁剪极端值\n    scale = maxv / (2**(8-1)-1)                  # INT8 对称\n    return scale",
  "codeNotes": [
    "百分位比 minmax 更抗 outlier。",
    "KL 校准在权重量化中也常用。"
  ],
  "complexity": "O(校准样本·前向)=一次性；远小于训练。",
  "followUps": [
    {
      "question": "校准多少条数据够？",
      "answer": "通常 128~1024 条代表性样本即可，关键是覆盖分布而非数量极大。"
    },
    {
      "question": "minmax 和百分位怎么选？",
      "answer": "有 outlier 时优先百分位(如 99.9%)或 KL 裁剪，纯 minmax 易被极端值毁掉。"
    }
  ],
  "followUpAnswers": [
    "覆盖分布比数量重要。",
    "百分位抗 outlier。"
  ],
  "pitfalls": [
    "校准与推理分布不一致。",
    "用 minmax 被 outlier 拉爆。"
  ],
  "beginnerSummary": "量体重前先称几次\"典型体型\"的人定标尺(校准)。若拿举重运动员当标准去量普通人，标尺就歪了——所以校准数据得像真实用户。",
  "prerequisites": [
    "激活分布依赖输入。",
    "scale 由范围决定。",
    "PTQ 不需训练。"
  ],
  "workedExample": [
    "512 条领域样本前向。",
    "百分位 99.9 定 scale。"
  ],
  "lineByLine": [
    "收集代表性样本。",
    "前向钩子取激活。",
    "按策略算范围。",
    "生成 scale/零点。"
  ],
  "diagram": "样本 ─▶ 前向 ─▶ 激活统计 ─▶ scale/零点 ─▶ 量化"
};
