export default {
  "id": "ts-grad-clip",
  "category": "训练稳定性",
  "difficulty": "Easy",
  "title": "梯度裁剪与梯度累积",
  "prompt": "梯度裁剪（grad clip）和梯度累积（grad accumulation）分别解决什么问题，怎么配合使用？",
  "quickAnswer": "梯度裁剪按范数给梯度封顶（如5.0），防止个别batch的巨型梯度把参数甩飞，主要提升稳定性；梯度累积把多个小batch的梯度相加后再更新，用更小显存模拟大batch，主要提升吞吐与收敛质量。二者正交可叠加：累积完再clip再step。",
  "approach": "先决定目标global batch，按显存上限算micro batch与累积步数；每个micro step loss.backward()累加梯度，不调optimizer.step()；累积结束后统一clip_grad_norm_再step并zero_grad。",
  "explanationFocus": "是什么：梯度裁剪是把参数梯度整体范数限制在某阈值内（超出的按比例缩放）；梯度累积是把K个micro-batch的梯度求和当作一个大batch的梯度，从而用micro batch显存跑出global batch效果。",
  "bruteForce": "直接放大global batch到目标值，单卡一次性前向反向——显存不够直接OOM，且大batch对LR调度更敏感。",
  "invariant": "累积K步后等效梯度 = 各micro step梯度的算术和（即均值的K倍），clip与step在累积完成后只做一次。",
  "walkthrough": "目标global batch=2048，单卡显存只够micro batch=128，故累积K=16步。每micro step梯度范数约1.8，累积后约28.7；设clip=5.0，则整体缩放到5.0再更新，等效学习率被合理约束。",
  "code": "import torch\n\ndef train_step(model, opt, batches, accum=16, clip=5.0):\n    opt.zero_grad()\n    for i, (x, y) in enumerate(batches):\n        loss = model(x, y) / accum        #  loss按K归一，等效大batch均值\n        loss.backward()                    #  梯度累加到 .grad\n        if (i + 1) % accum == 0:\n            torch.nn.utils.clip_grad_norm_(model.parameters(), clip)\n            opt.step(); opt.zero_grad()\n",
  "complexity": "时间：与总样本数线性相关，累积不增加前向次数；空间：显存仅存1个micro batch激活，省下(K-1)倍，复杂度 O(micro_batch激活)。",
  "beginnerSummary": "梯度裁剪像给车速装限速器，防止某一下踩太猛翻车；梯度累积像分几次搬砖，凑够一趟的量再一起装车，省力气。",
  "diagram": "\n micro0 -> backward -> grad += g0\n micro1 -> backward -> grad += g1\n  ...\n microK -> backward -> grad += gK\n            clip(grad, 5.0)\n            opt.step()  (每K步一次)\n",
  "derivation": [
    "为什么需要：个别batch梯度可能爆炸使loss突刺；大global batch显存装不下，需拆成micro batch。",
    "怎么实现：backward累加梯度、loss除以K做均值归一，累积满K步后clip再step。",
    "有什么代价：累积使单step延迟变K倍、总步数减少但每步更贵；clip过小会拖慢收敛。",
    "怎么评测：观察grad_norm被削顶频率，理想是大多数step不触发clip，且loss平稳下降。"
  ],
  "edgeCases": [
    "accum=1时退化为普通训练，clip仍生效。",
    "loss未除以accum导致等效LR放大K倍，收敛不稳。",
    "clip阈值过小使有效梯度恒为阈值，模型学不动。",
    "分布式下DDP已在卡间all-reduce，clip应在累积后做一次而非每micro步。"
  ],
  "pitfalls": [
    "忘记把loss除以accum，等效学习率被放大K倍。",
    "每micro step都step，变成小batch而非累积大batch。"
  ],
  "prerequisites": [
    "反向传播与梯度",
    "优化器step/zero_grad语义",
    "混合精度"
  ],
  "workedExample": [
    "micro batch=128、accum=16，单卡跑出global batch=2048。",
    "loss=loss/16后backward，累积16步grad_norm约28.7，clip=5.0缩放到5.0。",
    "每16步opt.step一次，显存占用仅为单micro batch的1.2倍。"
  ],
  "lineByLine": [
    "opt.zero_grad() 清空历史梯度，防止跨大step泄漏。",
    "loss = model(x,y)/accum 把loss按累积步数归一，使累加梯度等价于大batch均值。",
    "loss.backward() 梯度累加到各参数.grad而非覆盖。",
    "if (i+1)%accum==0 满K步才clip并step，实现累积。",
    "clip_grad_norm_ 把整体梯度范数限制到clip阈值内。"
  ],
  "codeNotes": [
    "DDP场景只在rank0或任意卡clip即可，因为各卡梯度已同步一致。"
  ],
  "followUps": [
    {
      "question": "按范数clip和按值clip有何区别？",
      "answer": "按范数(clip_grad_norm_)整体缩放保持方向，最常用；按值(clip_grad_value_)逐元素截断会改变方向，可能引入偏差。"
    },
    {
      "question": "梯度累积与gradient checkpointing能否同用？",
      "answer": "可以，二者正交：checkpointing省激活显存，累积省batch显存，常一起用支持超大模型。"
    }
  ],
  "followUpAnswers": [
    "按范数(clip_grad_norm_)整体缩放保持方向，最常用；按值(clip_grad_value_)逐元素截断会改变方向，可能引入偏差。",
    "可以，二者正交：checkpointing省激活显存，累积省batch显存，常一起用支持超大模型。"
  ],
  "kind": "concept"
};
