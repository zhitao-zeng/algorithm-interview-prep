export default {
  "id": "ts-oom-recompute",
  "category": "训练稳定性",
  "difficulty": "Hard",
  "title": "显存OOM与重计算",
  "prompt": "训练大模型时显存OOM，如何用重计算（梯度检查点）换取显存，代价是什么？",
  "quickAnswer": "OOM主要来自激活值（随序列长度和batch线性增长）。重计算/梯度检查点只保存少数层边界的激活，反向时重新前向算中间激活，用约30%额外算力换数倍显存。配合bf16、零冗余优化器（ZeRO）可进一步降费。需权衡：重计算越多省显存越多但更慢。",
  "approach": "先profile显存构成（参数/优化器/激活），定位激活为主；用torch.utils.checkpoint对transformer层包裹，选checkpoint策略（每1层或每N层）；评估时间-显存拐点，确定最佳N。",
  "explanationFocus": "是什么：显存OOM指激活+参数+优化器状态超出GPU显存；重计算（gradient checkpointing）是反向时丢弃中间激活、需要时再前向重算，以计算换显存的技术。",
  "bruteForce": "直接减小batch到1甚至micro batch=1，虽不OOM但吞吐极低、batch统计失真，收敛变差。",
  "invariant": "重计算前后参数梯度在数学上完全一致：丢弃的激活在反向时通过同输入重新前向精确重建，梯度结果不变，只是多花前向算力。",
  "walkthrough": "13B模型、seq_len=4096、micro batch=4，单卡80GB：不重计算激活占58GB OOM；用checkpoint每1层后激活降到19GB，可放下；代价是反向多一次前向，单step时间从1.8s升到2.4s（约+33%）。",
  "code": "import torch\nfrom torch.utils.checkpoint import checkpoint\n\ndef block_forward(block, x):\n    return checkpoint(block, x, use_reentrant=False)  # 不保存中间激活\n\ndef transformer_stack(blocks, x):\n    for blk in blocks:\n        x = block_forward(blk, x)   # 每层边界才存激活\n    return x\n",
  "complexity": "空间：激活显存从 O(L) 降到 O(√(或边界数))，可省数倍；时间：反向需重算前向，总算力约增30%-40%。",
  "beginnerSummary": "重计算像做菜不把每道工序半成品都摆桌上，用完就收，需要时用同样原料重做一遍——费点功夫但桌面（显存）清爽了。",
  "diagram": "\n 普通: [L0 act][L1 act][L2 act]...[L11 act]  -> 占满\n 重算: [L0 act]          [L4 act]          [L8 act]\n        反向时重算 L1-L3 / L5-L7 / L9-L11\n",
  "derivation": [
    "为什么需要：大模型激活随层数×序列×batch增长，单卡放不下导致OOM。",
    "怎么实现：checkpoint包裹层，只存边界激活，反向重新前向重建中间激活。",
    "有什么代价：多一次前向约+30%算力；use_reentrant=False避免旧接口RNG问题。",
    "怎么评测：同配置下loss曲线与无重算一致，且峰值显存降到阈值内、step时间增幅可接受。"
  ],
  "edgeCases": [
    "use_reentrant=True在含dropout/RNG算子时会因随机性不一致导致梯度错误。",
    "序列极长（>32k）即便重计算仍OOM，需配flash-attention省注意力激活。",
    "重计算与DDP结合时每个micro step都重算，吞吐下降明显。",
    "某些自定义算子不支持checkpoint需手动实现重算。"
  ],
  "pitfalls": [
    "误以为重计算会改变梯度——其实数值等价，只是更慢。",
    "checkpoint粒度太细（每层都存）省显存有限却仍慢，太粗则省不够。"
  ],
  "prerequisites": [
    "训练显存构成（参数/优化器/激活）",
    "前向/反向计算图",
    "Transformer结构"
  ],
  "workedExample": [
    "profile显示激活占58GB、参数+优化器22GB，确认激活是瓶颈。",
    "对12层transformer每1层checkpoint，激活降到19GB，80GB卡可跑micro batch=4。",
    "单step从1.8s升到2.4s，吞吐降33%但换来临batch翻倍。"
  ],
  "lineByLine": [
    "checkpoint(block, x, use_reentrant=False) 包裹单层，反向重算其内激活。",
    "block_forward 封装调用，使代码清晰且统一策略。",
    "transformer_stack 仅在每层边界隐式保存输入激活。",
    "反向传播时checkpoint内部重新跑block前向重建中间值。"
  ],
  "codeNotes": [
    "优先用use_reentrant=False以兼容RNG与较新PyTorch；配合flash-attn进一步降激活。"
  ],
  "followUps": [
    {
      "question": "重计算与ZeRO如何配合？",
      "answer": "重计算省激活、ZeRO省参数/优化器状态，二者针对不同显存成分可叠加，常见组合是ZeRO-2+checkpoint。"
    },
    {
      "question": "如何选checkpoint粒度？",
      "answer": "按显存缺口选：缺口小则每N层checkpoint，缺口大则每层；目标是刚好放下且step时间增幅<40%。"
    }
  ],
  "followUpAnswers": [
    "重计算省激活、ZeRO省参数/优化器状态，二者针对不同显存成分可叠加，常见组合是ZeRO-2+checkpoint。",
    "按显存缺口选：缺口小则每N层checkpoint，缺口大则每层；目标是刚好放下且step时间增幅<40%。"
  ],
  "kind": "concept"
};
