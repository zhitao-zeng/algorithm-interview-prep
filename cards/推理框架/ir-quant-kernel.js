export default {
  "id": "ir-quant-kernel",
  "category": "推理框架",
  "difficulty": "Hard",
  "title": "量化推理 kernel",
  "prompt": "量化推理 kernel 如何在低比特权重下完成矩阵乘并保持数值正确？",
  "quickAnswer": "权重以 INT8/INT4 存储并以反量化因子记录，GEMM 用低比特张量核心计算，再在线乘 scale 还原到 FP16 累加，省带宽又保精度。",
  "approach": "离线把权重量化到低比特并保存 scale/zero；推理 kernel 直接加载低比特权重，在 tensor core 上做整数乘加，最后用反量化因子还原。",
  "explanationFocus": "是什么：量化推理 kernel 是专为低比特（INT8/FP8/INT4）权重或激活编写的矩阵乘算子，通过压缩存储与高吞吐低精度计算单元来降低显存带宽与算力消耗。",
  "bruteForce": "朴素做法：权重以 FP16 存储并做标准 FP16 GEMM，带宽随模型增大成为瓶颈，显存也吃紧。",
  "invariant": "不变式：反量化后的有效权重 W_eff = dequant(W_q, scale, zero) 在数值上逼近原始 FP 权重，且累加在足够精度（如 FP32/INT32）下进行。",
  "walkthrough": "执行追踪：加载 INT8 权重与 scale；kernel 内做整数矩阵乘得到 INT32 累加；乘 scale 并加 zero 还原；与激活 FP 运算得到输出。",
  "complexity": "说明：带宽降为 1/2（INT8）或 1/4（INT4），tensor core 整数吞吐更高；代价是量化误差、反量化开销与缩放因子管理。",
  "beginnerSummary": "模型权重用 FP16 太大太占带宽。量化 kernel 把它们压成 8 位或 4 位整数，算完再乘回缩放系数还原，又快又省。",
  "diagram": "W_fp16 --quant--> W_int8 + scale\nkernel: X_fp16 @ W_int8 -> INT32 acc\n        acc * scale + zero -> Y_fp16",
  "code": "def dequant(w_int8, scale, zero):\n    return w_int8.to(float32) * scale + zero\n\ndef matmul_q(x, w_int8, scale, zero):\n    acc = x @ dequant(w_int8, scale, zero).T   # 推理中在 tensor core 内联反量化\n    return acc",
  "derivation": [
    "为什么需要：大模型权重体积与访存带宽随规模线性增长，FP16 GEMM 受带宽限制；低比特可成倍降带宽并提升单位算力。",
    "怎么实现：离线用校准集确定 per-tensor 或 per-channel 的 scale/zero，将权重量化为 INT8/INT4；kernel 在 tensor core 做整数 GEMM，在累加后在线乘 scale 还原。",
    "有什么代价：引入量化误差，需校准与可能的小幅精度损失；group/channeI 量化增加 scale 存储与索引开销。",
    "怎么评测：在下游任务精度与困惑度上对比量化前后，同时测吞吐与显存带宽利用率，确认损失可接受。"
  ],
  "edgeCases": [
    "激活分布异常大时 scale 选错会严重削尾，需稳健校准（如百分位）。",
    "per-channel 量化需 kernel 按输出通道取不同 scale，索引复杂度上升。",
    "INT4 需两位打包，反量化时要注意位序与符号。",
    "反量化若放到累加后单点乘 scale，与 FP 顺序不同会带来微小数值差。"
  ],
  "pitfalls": [
    "只在权重侧量化而激活仍 FP16，却误用整型 tensor core 导致类型不匹配。",
    "scale/zero 与权重维度不对齐（per-tensor vs per-channel），还原严重失真。"
  ],
  "prerequisites": [
    "矩阵乘（GEMM）与张量核心基本原语",
    "均匀/对称量化与校准概念"
  ],
  "workedExample": [
    "权重 FP16 7B 模型约 14GB；INT8 量化后约 7GB，带宽减半，decode 受带宽限制时吞吐近翻倍。",
    "per-channel INT8 对每输出通道设 scale，相比 per-tensor 在激活异常层精度更稳。"
  ],
  "lineByLine": [
    "dequant 用 scale/zero 把整型权重还原为近似浮点，体现量化定义。",
    "x @ dequant(...).T 是概念上的等效 GEMM；真实 kernel 在整数域完成乘加再反量化。",
    "scale/zero 通常随权重一并加载，按需逐通道或逐组应用。"
  ],
  "codeNotes": [
    "高效 kernel（如 GPTQ/AWQ 的 CUDA 实现）把反量化融合进 MMA 指令，避免先展开成 FP16 再乘，从而真正省带宽。"
  ],
  "followUps": [
    {
      "question": "权重量化与激活量化（KV 量化）如何配合？",
      "answer": "常同时采用：权重 INT8/INT4 省存储与带宽，KV Cache 用 FP8 或 INT8 进一步压缩显存；二者 scale 独立管理，最终在算力足够高精度的累加器中合并。"
    },
    {
      "question": "INT4 与 INT8 怎么选？",
      "answer": "INT8 精度损失小、kernel 成熟，首选；INT4 更省带宽但需更细的 group 量化与校准，适合带宽极受限且对精度容忍的场景。"
    }
  ],
  "followUpAnswers": [
    "常同时采用：权重 INT8/INT4 省存储与带宽，KV Cache 用 FP8 或 INT8 进一步压缩显存；二者 scale 独立管理，最终在算力足够高精度的累加器中合并。",
    "INT8 精度损失小、kernel 成熟，首选；INT4 更省带宽但需更细的 group 量化与校准，适合带宽极受限且对精度容忍的场景。"
  ],
  "kind": "concept"
};
