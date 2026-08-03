export default {
  "id": "ts-loss-spike",
  "category": "训练稳定性",
  "difficulty": "Medium",
  "title": "Loss突刺与NaN排查",
  "prompt": "训练过程中loss突然飙升出现NaN，应该如何系统性地排查与定位根因？",
  "quickAnswer": "先确认NaN首次出现的step，回滚到上一个正常checkpoint，然后逐步缩小嫌疑范围：数据（坏样本/噪声过大）、数值（fp16下溢/溢出）、算子（log(0)、sqrt负数、除以0）、超参（学习率过高、warmup不足）。最终通过梯度范数监控与逐层数值检查定位到具体层。",
  "approach": "采用\"时间回滚+空间二分\"策略：用tensorboard记录每步loss/grad_norm，定位首次异常step；随后开nan/inf检测（torch.autograd.detect_anomaly或设置非有限值钩子），对可疑层包裹数值检查，必要时把fp16关成fp32对比，确认是精度还是数据问题。",
  "explanationFocus": "是什么：loss突刺（spike）指相邻step间loss数量级暴涨，NaN则是出现非有限值；二者都是训练不稳定信号，说明前向或反向的数值在某处失效。",
  "bruteForce": "每步把整个模型权重dump成numpy逐元素检查是否含inf/nan，再人工比对哪一层最先出现，成本极高且无法复现长训练。",
  "invariant": "稳定训练下：前向输出、梯度、权重更新量都应保持有限（finite）且梯度范数在一个合理区间（如<10）。一旦某层输出非有限，后继层必被污染。",
  "walkthrough": "8卡A100（每卡80GB），global batch=2048，peak grad_norm正常约2.3。第31250步grad_norm从2.3跳到1.7e9，loss变NaN。回滚到第31200步checkpoint，在embedding后接hook：发现某token id=50257（越界）查表得全0向量，下游layernorm除0得NaN。",
  "code": "import torch\n\ndef detect_nonfinite_hook(module, inp, out):\n    if isinstance(out, torch.Tensor) and not torch.isfinite(out).all():\n        raise RuntimeError(f\"NaN/Inf in {module.__class__.__name__}\")\n    return out\n\n# 怀疑的层注册hook\nsuspect_layer.register_forward_hook(detect_nonfinite_hook)\n\ntorch.autograd.set_detect_anomaly(True)  # 反向时定位首个NaN出处\n",
  "complexity": "hook监控 O(1) 每步常数开销；detect_anomaly 使反向约慢1.5-2倍；全量dump权重 O(参数量)，仅在本地复现时使用。",
  "beginnerSummary": "训练像烧一锅汤，突然溢出来（NaN）说明某个原料坏了或火太大。做法是先把锅退回上一锅还能喝的状态，然后一勺勺尝，找到第一勺坏掉的原料。",
  "diagram": "\n step: ... 31248 31249 31250 31251\n loss:  2.31  2.29  NaN   NaN\n grad:  2.3   2.4   1.7e9  ---\n            ^首次非有限值，回滚到此之前\n [embedding] -> [layer0] -> ... -> NaN  (二分定位层)\n",
  "derivation": [
    "为什么需要：NaN会让整个训练作废，必须快速定位根因才能恢复，否则反复重训浪费数千GPU小时。",
    "怎么实现：记录每步loss/grad_norm曲线，定位首次异常step；开启anomaly检测与forward hook，逐层二分找到首个非有限输出。",
    "有什么代价：detect_anomaly使反向变慢约1.5-2倍，只在排查时开启；回滚会丢失少量已训step，但远小于重训成本。",
    "怎么评测：修复后连续观察500步grad_norm平稳且loss单调下降，无新NaN出现即算通过。"
  ],
  "edgeCases": [
    "单卡出现NaN但其他卡正常：通常是该卡数据含越界id，需检查dataloader分片。",
    "bf16下不出现但fp16出现：说明是fp16下溢/溢出，不是数据问题。",
    "仅在eval阶段出现NaN而train正常：多为eval未关dropout或统计量未更新。",
    "warmup结束后才出现：典型学习率跳变过大导致。"
  ],
  "pitfalls": [
    "只看loss不看grad_norm，会晚好几步才发现已污染。",
    "用最后一个checkpoint恢复而非NaN前最近的正常checkpoint，可能把坏权重带回来。"
  ],
  "prerequisites": [
    "前向/反向传播",
    "混合精度训练基础",
    "梯度范数监控"
  ],
  "workedExample": [
    "复现：第31250步设置torch.autograd.set_detect_anomaly(True)，反向报错指向cross_entropy。",
    "定位：embedding层forward hook在31250步抛NaN，确认输入含id=50257越界token。",
    "修复：tokenizer截断到vocab_size-1，重训31200步后恢复，grad_norm回到2.3。"
  ],
  "lineByLine": [
    "def detect_nonfinite_hook 定义前向hook，捕获模块输出。",
    "if not torch.isfinite(out).all() 检查输出是否全为有限值，否则抛错定位层。",
    "suspect_layer.register_forward_hook 把hook挂到怀疑层上。",
    "set_detect_anomaly(True) 在反向时自动追踪第一个产生NaN的算子。"
  ],
  "codeNotes": [
    "hook只在排查期开启，生产训练移除以避免性能损耗。"
  ],
  "followUps": [
    {
      "question": "如何在不拖慢训练的前提下持续监控NaN？",
      "answer": "用forward hook仅检查isfinite（开销极小），只在异常时记录；不要用detect_anomaly常驻，它显著拖慢反向。"
    },
    {
      "question": "fp16和bf16在NaN表现上有何差异？",
      "answer": "fp16指数位少易溢出/下溢产生NaN；bf16指数位与fp32相同几乎不溢出，NaN多来自数据而非精度。"
    }
  ],
  "followUpAnswers": [
    "用forward hook仅检查isfinite（开销极小），只在异常时记录；不要用detect_anomaly常驻，它显著拖慢反向。",
    "fp16指数位少易溢出/下溢产生NaN；bf16指数位与fp32相同几乎不溢出，NaN多来自数据而非精度。"
  ],
  "kind": "concept"
};
