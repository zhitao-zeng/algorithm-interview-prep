export default {
  "kind": "concept",
  "id": "quant-ptq-vs-qat",
  "category": "量化推理",
  "difficulty": "Medium",
  "title": "PTQ 与 QAT 的区别",
  "prompt": "训练后量化(PTQ)和量化感知训练(QAT)有什么区别，怎么选？",
  "quickAnswer": "PTQ 在训练完成后用一小批校准数据直接量化，零重训、成本低，是部署首选；QAT 在训练时插入伪量化节点让网络\"提前适应\"低精度，精度更好但需训练数据与算力。低比特(INT4)或敏感模型常需 QAT 兜底。",
  "approach": "默认先 PTQ 看精度；掉点严重时再上 QAT 微调。",
  "explanationFocus": "是什么：PTQ 是事后量化(无需训练)，QAT 是把量化误差纳入训练(需微调)的两种范式。",
  "bruteForce": "直接把 FP16 权重截断成低精度 INT8，不校准也不训练。",
  "derivation": [
    "为什么需要：PTQ 想零成本落地，QAT 想在低比特下保精度，二者解决\"成本 vs 精度\"的权衡。",
    "怎么实现：PTQ 统计校准集的 min/max 求缩放并量化；QAT 在前向插 STE 伪量化(quant-dequant)，反向仍用 FP 梯度更新权重。",
    "有什么代价：PTQ 对极低位或 outlier 多时易掉点；QAT 需重训、数据/算力开销大、流程复杂。",
    "怎么评测：同一测试集比较 PTQ 与 QAT 的精度差与显存/时延，权衡 ROI。"
  ],
  "invariant": "同样比特下 QAT 精度≥PTQ；PTQ 成本远低于 QAT。",
  "walkthrough": "7B 模型 PTQ INT8 通常掉点<1%；压到 INT4 若 PTQ 掉 5 分，QAT 微调可拉回 3 分。",
  "edgeCases": [
    "校准数据分布偏离推理分布，PTQ 缩放失真。",
    "QAT 需冻结/解冻策略，否则 STE 把权重推到饱和区。",
    "小模型对量化更敏感，更常需 QAT。"
  ],
  "code": "# Python (伪量化 STE)\ndef fake_quant(x, bits=8):\n    qmin, qmax = -(2**(bits-1)), 2**(bits-1)-1\n    scale = x.abs().max() / qmax\n    x_q = (x / scale).round().clamp(qmin, qmax)   # 前向量化\n    return x_q * scale                              # 反量化; 反向 STE 直通梯度",
  "codeNotes": [
    "STE: 反向时把 round 的梯度当作 1(直通估计)。",
    "QAT 最终只保留量化后的整型权重用于部署。"
  ],
  "complexity": "PTQ 仅前向+统计 O(校准样本·元素)；QAT 多一次训练 O(epoch·数据)。",
  "followUps": [
    {
      "question": "什么时候必须上 QAT？",
      "answer": "当 PTQ 在目标比特(如 INT4)下精度不达标，或模型很小/很敏感时；以及需要端到端联合优化缩放因子时。"
    },
    {
      "question": "QAT 会不会破坏已训好的权重？",
      "answer": "会微调权重以适应量化，通常从小学习率恢复或只动伪量化参数，权重整体变化可控。"
    }
  ],
  "followUpAnswers": [
    "PTQ 优先，QAT 兜底。",
    "STE 是 QAT 训练稳定的关键技巧。"
  ],
  "pitfalls": [
    "认为 PTQ 永远够用(低比特常不够)。",
    "QAT 学习率过大把权重洗坏。"
  ],
  "beginnerSummary": "PTQ 像把写好的稿子直接缩写印刷，快但可能漏字；QAT 像边写边用缩写方式练习，最后成稿更顺、但要重写一遍。没钱没时间先 PTQ，要极致精度再 QAT。",
  "prerequisites": [
    "了解量化的基本缩放。",
    "知道反向传播与梯度。",
    "有(或没有)现成训练数据。"
  ],
  "workedExample": [
    "PTQ: 取 128 条样本统计 scale 即量化完成。",
    "QAT: 在线性层前后插 fake_quant 再训 1~3 epoch。"
  ],
  "lineByLine": [
    "PTQ: 加载 FP 权重。",
    "PTQ: 跑校准集统计范围。",
    "PTQ: 计算 scale 并取整存储。",
    "QAT: 插伪量化, 反向前向带 round。"
  ],
  "diagram": "PTQ: 训练完成 ─▶ 校准 ─▶ 量化部署 (零重训)\nQAT: 训练完成 ─▶ 插伪量化 ─▶ 微调 ─▶ 量化部署 (更高精度)"
};
