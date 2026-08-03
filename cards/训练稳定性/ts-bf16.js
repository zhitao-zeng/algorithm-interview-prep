export default {
  "id": "ts-bf16",
  "category": "训练稳定性",
  "difficulty": "Medium",
  "title": "bf16混合精度陷阱",
  "prompt": "使用bf16混合精度训练有哪些常见陷阱，为什么bf16不会溢出却仍可能数值不稳定？",
  "quickAnswer": "bf16指数位与fp32相同（8位）几乎不溢出，但尾数只有8位，相对精度约3e-3，易在加法/减法和归约中丢失低位。陷阱包括：softmax/exp在大logit下精度差、layernorm的减均值除方差累积误差、优化器状态若也用bf16导致更新量被吞、loss scaling误用（bf16不需要fp16式loss scaling）。",
  "approach": "weight/master用fp32或保持bf16但把优化器state（一阶/二阶矩）放fp32；前向用bf16、对精度敏感算子（softmax、layernorm、loss）保留fp32；不要为bf16做loss scaling；监控grad_norm是否异常抖动。",
  "explanationFocus": "是什么：bf16混合精度指用bf16（1-8-7位）承载前向/反向张量以省显存带宽，fp32仅用于易损计算；其陷阱源于尾数位过少导致低位精度丢失，而非溢出。",
  "bruteForce": "全bf16训练所有张量与优化器状态，看似省显存但更新量常因尾数不足被舍入成0，模型不收敛。",
  "invariant": "关键数值（loss、layernorm统计量、优化器矩）的运算结果应与fp32参考的相对误差在1e-2量级内，否则视为精度陷阱触发。",
  "walkthrough": "7B模型在8卡A100用bf16：optimizer用AdamW，若将m/v也设为bf16，第20k步发现更新量|Δw|<3e-3（bf16可表示最小非零增量约2e-3）被大量舍入成0，loss停滞；改为fp32 m/v后恢复。",
  "code": "import torch\n\ndef build_optim_bf16(model):\n    # 优化器状态用fp32，参数用bf16\n    return torch.optim.AdamW(\n        [{\"params\": model.parameters(), \"dtype\": torch.bfloat16}],\n        lr=3e-4,\n    )\n\nwith torch.autocast(\"cuda\", dtype=torch.bfloat16):\n    out = model(x)                     # 前向bf16\n    loss = torch.nn.functional.cross_entropy(out.float(), y)  # 敏感算子转fp32\n",
  "complexity": "时间：与fp16混合精度相当，autocast几乎零额外开销；空间：激活/权重省一半，优化器state若fp32则仍占fp32开销。",
  "beginnerSummary": "bf16像账本只记到\"元\"不记\"分\"，大额不会算爆但小数被抹掉；所以要把关键记账（优化器）留到能记\"分\"的fp32账本上。",
  "diagram": "\n fp32 master ─┐\n              ├─> bf16 前向/反向 (省显存)\n bf16 weights ┘\n 敏感算子: softmax/layernorm/loss -> 转回 fp32\n 优化器 m/v -> fp32 (防更新量被舍入吞掉)\n",
  "derivation": [
    "为什么需要：bf16省一半显存与带宽、不溢出，但尾数不足会丢精度，需规避敏感计算。",
    "怎么实现：autocast设bf16，softmax/loss等转fp32，优化器state保持fp32，不启用loss scaling。",
    "有什么代价：fp32优化器state仍占内存；频繁dtype转换有微小开销；部分老算子不支持bf16需回退。",
    "怎么评测：对比fp32基线的loss曲线，前1k步相对误差<1e-2且最终收敛相当即合格。"
  ],
  "edgeCases": [
    "把loss scaling用于bf16：多余且可能引入错误，bf16不需要。",
    "优化器state用bf16：小更新量被舍入成0，模型停滞。",
    "老GPU无bf16 TensorCore：autocast回退fp32，性能反而下降。",
    "layernorm在bf16下方差估计偏，长序列尤其明显。"
  ],
  "pitfalls": [
    "沿用fp16的loss scaling习惯到bf16，造成误导。",
    "以为bf16\"不会溢出就绝对安全\"，忽略尾数精度损失。"
  ],
  "prerequisites": [
    "浮点表示（指数/尾数）",
    "混合精度训练",
    "优化器状态结构"
  ],
  "workedExample": [
    "AdamW的m/v设为bf16后，更新量被舍入，loss在20k步停滞。",
    "将m/v改fp32后，更新量恢复，loss继续下降。",
    "cross_entropy输入out.float()后，长尾类别分类精度提升0.8个点。"
  ],
  "lineByLine": [
    "AdamW(..., dtype=bf16) 让参数以bf16参与计算。",
    "torch.autocast(\"cuda\", dtype=bf16) 自动把支持算子转bf16。",
    "out.float() 把logits转回fp32再做softmax，避免尾数误差。",
    "cross_entropy在fp32下计算，保证loss数值稳定。"
  ],
  "codeNotes": [
    "bf16无需loss scaling，这是与fp16最易混淆的差异点。"
  ],
  "followUps": [
    {
      "question": "bf16和fp16该怎么选？",
      "answer": "支持bf16的Ampere及以后GPU优先bf16（不溢出、无需scaling）；老架构只能用fp16并配dynamic loss scaling。"
    },
    {
      "question": "为什么优化器状态最好fp32？",
      "answer": "Adam的m/v及更新量是累加小量，bf16尾数不足会把这些小增量舍入为0，使参数停滞。"
    }
  ],
  "followUpAnswers": [
    "支持bf16的Ampere及以后GPU优先bf16（不溢出、无需scaling）；老架构只能用fp16并配dynamic loss scaling。",
    "Adam的m/v及更新量是累加小量，bf16尾数不足会把这些小增量舍入为0，使参数停滞。"
  ],
  "kind": "concept"
};
