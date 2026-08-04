export default {
  "id": "ir-microbatch",
  "category": "推理框架",
  "difficulty": "Medium",
  "title": "微批处理与调度",
  "prompt": "微批处理（micro-batching）如何在固定显存下平衡大批次吞吐与延迟？",
  "quickAnswer": "把大批次切成多个微批依次前向，再累加结果，既享受大批次的矩阵利用率，又避免一次性占用过多激活显存。",
  "approach": "将请求按 micro_batch_size 分组，逐微批做前向并把输出拼接；prefill 与 decode 均可用微批降低峰值显存、平滑延迟。",
  "explanationFocus": "是什么：微批处理是把一个逻辑大批次拆成若干较小的微批次依次执行、结果再合并的技术，用于在显存受限时仍获得接近大批次的算力效率。",
  "bruteForce": "朴素做法：要么一次跑整个大批次（显存峰值高、易 OOM），要么每条单独跑（矩阵利用率低、吞吐差）。",
  "invariant": "不变式：所有微批的输出拼接后等于整批一次性前向的数值结果（忽略浮点累加顺序差异）。",
  "walkthrough": "执行追踪：调度器把 N 条请求按 micro=4 切片；逐片前向得到 logits；按原始顺序 concat；若训练/梯度场景则逐微批反传后累加梯度。",
  "complexity": "说明：峰值激活显存降为 1/micro，总计算量不变，kernel 启动次数增多；吞吐略低于整批但远低于逐条。",
  "beginnerSummary": "一次跑太多显存放不下，一条条跑又太慢。微批处理把大堆请求切成小份依次算，再拼回结果，省显存又不丢速度。",
  "diagram": "batch(12) -> [mb4][mb4][mb4]\n             fwd  fwd  fwd\n              \\    |    /\n               concat -> out(12)",
  "code": "def microbatched(fn, batch, micro=4):\n    outs = []\n    for i in range(0, len(batch), micro):\n        outs.append(fn(batch[i:i+micro]))   # 逐微批前向\n    return concat(outs, axis=0)",
  "derivation": [
    "为什么需要：大批次矩阵利用率高但激活显存随批次线性增长，易 OOM；微批在显存与效率间折中。",
    "怎么实现：将批次按 micro_batch_size 切片，逐片执行前向并累积输出；需要保持切片间无跨样本依赖（如因果掩码仅限各自样本内）。",
    "有什么代价：kernel 启动次数增多、可能引入额外拷贝；若各微批形状不同需 padding 或分别调用。",
    "怎么评测：扫不同 micro 值，记录峰值显存、吞吐与 P99 延迟，选满足显存约束下的最高效率点。"
  ],
  "edgeCases": [
    "批次不是 micro 整数倍时末批更小，需避免形状假设错误。",
    "因果注意力下微批内不能跨样本泄漏，掩码需按样本边界。",
    "微批过小时退化为逐条，失去大矩阵收益。",
    "需要梯度时各微批反传结果须正确累加。"
  ],
  "pitfalls": [
    "微批间共享了不该共享的 KV 或统计，造成样本泄漏。",
    "忽视末批尺寸导致 concat 维度不匹配报错。"
  ],
  "prerequisites": [
    "批处理 matmul 与显存占用关系",
    "Transformer 前向与注意力掩码"
  ],
  "workedExample": [
    "prefill 96 token、显存只够 32：拆成 3 个 micro=32 依次前向，峰值显存降为 1/3，结果拼接一致。",
    "decode 阶段把连续批的活跃序列按 micro=8 切片前向，平滑变长 batch 的峰值。"
  ],
  "lineByLine": [
    "range(0, len(batch), micro) 产生各微批起点。",
    "fn(batch[i:i+micro]) 对单微批做前向，复用同一份权重。",
    "concat 按样本轴拼回，恢复整批输出顺序。"
  ],
  "codeNotes": [
    "推理中微批常与 packed/padded 表示结合，使每个微批都是规整张量以最大化 kernel 效率。"
  ],
  "followUps": [
    {
      "question": "微批处理与连续批处理的关系？",
      "answer": "连续批决定每步哪些序列活跃，微批决定这批活跃序列如何切片前向；二者正交，可叠加使用以兼顾调度灵活与显存可控。"
    },
    {
      "question": "micro 取多大合适？",
      "answer": "在显存上限内尽量取大以提高矩阵利用率，常见取使峰值激活刚好低于显存阈值的整批除数。"
    }
  ],
  "followUpAnswers": [
    "连续批决定每步哪些序列活跃，微批决定这批活跃序列如何切片前向；二者正交，可叠加使用以兼顾调度灵活与显存可控。",
    "在显存上限内尽量取大以提高矩阵利用率，常见取使峰值激活刚好低于显存阈值的整批除数。"
  ],
  "kind": "concept"
};
