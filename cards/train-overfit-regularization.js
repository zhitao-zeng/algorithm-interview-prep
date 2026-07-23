export default {
  "kind": "concept",
  "id": "train-overfit-regularization",
  "category": "训练与微调",
  "difficulty": "Easy",
  "title": "微调过拟合与正则（早停、dropout、权重衰减）",
  "prompt": "微调时如何防止过拟合，常用正则手段有哪些？",
  "quickAnswer": "用早停（监控验证损失）、dropout、权重衰减（WD），以及参数高效方法(LoRA)本身限制容量来抗过拟合。",
  "approach": "监控验证集早停；全微调加 dropout 与 AdamW 的权重衰减；小数据优先用 LoRA 减小可训参数，从源头降过拟合风险。",
  "explanationFocus": "是什么：微调过拟合指模型在训练集上拟合噪声、验证/泛化下降；正则手段包括早停（验证损失回升即停）、dropout（随机置零防共适应）、权重衰减（L2 约束权重规模），以及用 LoRA 限制可训容量。",
  "bruteForce": "小数据上全量微调多 epoch 不加任何正则，模型死记训练样本、验证损失先降后飙升，泛化崩塌。",
  "derivation": [
    "为什么需要：微调数据常远小于预训练，全量更新易过拟合，需约束可训空间。",
    "怎么实现：早停用验证损失拐点；dropout p=0.05-0.1；AdamW 设 weight_decay（如 0.01）；或只用 LoRA 冻结主体。",
    "有什么代价：正则过强欠拟合（如 dropout 太大、WD 太高学不动）；早停需可靠验证集。",
    "怎么评测：画训练/验证损失曲线，看差距（过拟合标志）与早停点，下游实测泛化。"
  ],
  "invariant": "小数据首选 LoRA+轻正则；早停看验证集拐点（建议二次核对 dropout/WD 与基座兼容性）。",
  "walkthrough": "1K 指令微调：全微调 5 epoch 验证损失在第 3 epoch 后升（过拟合），改用 LoRA(r=16)+早停第 3 epoch 后泛化最佳。",
  "edgeCases": [
    "验证集与训练同源导致早停误判",
    "基座已含 dropout，重复加需注意",
    "WD 对 LoRA 参数通常不设或很小"
  ],
  "code": "def should_stop(train_loss, val_loss, best, patience=3):\n    if val_loss < best:\n        return False, val_loss  # 更新最优\n    patience -= 1\n    return patience <= 0, best",
  "codeNotes": [
    "早停需记录最优 val_loss 与计数",
    "patience 防止短暂波动误停"
  ],
  "complexity": "O(1) 判定，无训练开销。",
  "followUps": [
    {
      "question": "LoRA 本身为什么抗过拟合？",
      "answer": "可训参数极少、原权重冻结，假设空间受限，天然降低小数据过拟合。"
    },
    {
      "question": "权重衰减和 L2 正则完全一样吗？",
      "answer": "在 SGD 中等价；AdamW 把 WD 解耦出动量，效果与 naive L2 不同且更稳。"
    }
  ],
  "followUpAnswers": [
    "可训参数极少、原权重冻结，假设空间受限，天然降低小数据过拟合。",
    "在 SGD 中等价；AdamW 把 WD 解耦出动量，效果与 naive L2 不同且更稳。"
  ],
  "pitfalls": [
    "早停无干净验证集导致误判",
    "对 LoRA 参数设过大 WD 反而抑制学习"
  ],
  "beginnerSummary": "微调过拟合像『背题不解题』：早停是见好就收，dropout 是随机让部分神经元『请假』防勾结，权重衰减是给参数戴紧箍咒别长太野。",
  "prerequisites": [
    "过拟合与泛化",
    "Dropout",
    "权重衰减/AdamW"
  ],
  "workedExample": [
    "训练损失降到 0.2 但验证升到 1.5 → 过拟合",
    "加 LoRA + 早停(patience=3) 后验证稳定在 0.9"
  ],
  "lineByLine": [
    "def should_stop(...): 早停判定",
    "val_loss<best 则继续并更新最优",
    "patience 耗尽则停"
  ],
  "diagram": "epoch: 训练↓ 验证↓→↑(过拟合) 早停在拐点"
};
