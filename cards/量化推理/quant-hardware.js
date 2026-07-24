export default {
  "kind": "concept",
  "id": "quant-hardware",
  "category": "量化推理",
  "difficulty": "Medium",
  "title": "量化硬件支持",
  "prompt": "GPU 上 INT8/FP8 的加速靠什么硬件，为什么需要专门支持？",
  "quickAnswer": "加速来自 Tensor Core/AMX 等矩阵乘加速器对 INT8（及新卡 FP8）的原生支持：整数 MAC 比 FP16 更省芯片面积、更高吞吐，且低精度让每字节带宽搬更多数。但前提是权重/激活确实以低精度存储与计算，并调用对应 kernel（如 CUTLASS/rocBLAS/库内 IMMA 指令），否则只是省了显存、算力毫无收益。老卡不支持 FP8 时，FP8 权重只能退化为\"存省但不加速\"。",
  "approach": "先确认目标硬件代数支持哪些低精度（Ampere 起有 INT8 Tensor Core、Hopper 加 FP8），再选用对应 GEMM kernel 与量化方案，并实测吞吐确认达成预期倍数，而不是只看\"权重量化成了 INT8\"。",
  "explanationFocus": "是什么：量化加速依赖专为低精度矩阵乘设计的硬件单元（如 NVIDIA Tensor Core、Intel AMX），普通 CUDA core 即便处理整数也并没有更快。只有当权重和激活真的以 INT8/FP8 存储、并由对应 kernel 在整数/低精度域内直接乘加，才能同时拿到\"算力翻倍 + 带宽减半\"的收益。",
  "bruteForce": "权重存成 INT8 但用 FP16 kernel 先反量化再算：只省了显存、算力毫无收益，还多了反量化的开销。常见于\"量化了却没换 kernel\"的配置错误，误以为已经加速。",
  "derivation": [
    "为什么需要：低精度值本身不会自动变快，必须有硬件在整数/FP8 域直接乘加，才能既提升算力密度又省带宽，否则量化只剩一半意义。",
    "怎么实现：Ampere+ 有 INT8 Tensor Core，Hopper 加 FP8；通过 CUTLASS/库调用 IMMA/FP8 指令，让 GEMM 在整数/低精度域内完成乘加而非先反量化。",
    "有什么代价：旧 GPU 无对应支持则只能\"存省、算不快\"；需精度匹配的 kernel，混精度（如 FP8 权重 + FP16 累加）调度复杂，且要校准保精度。",
    "怎么评测：在目标卡上实测 INT8/FP8 GEMM 吞吐 vs FP16，确认达成预期倍数，并测端到端推理延迟与精度损失是否在可接受范围。"
  ],
  "invariant": "加速 = 算力倍数 × 带宽节省，且需\"硬件支持 + 对应 kernel\"双到位；缺任一环节，低精度只剩\"省显存\"这一半收益。",
  "walkthrough": "A100 的 INT8 Tensor Core 理论峰值约 FP16 的 2×；H100 进一步加入 FP8 支持，FP8 峰值约 FP16 的 2×。实测一个 4096×4096×4096 的 GEMM，FP16 约 120 TFLOPS、INT8 约 230 TFLOPS，接近理论倍数；但若错误地先用 FP16 kernel 反量化计算，吞吐仍是 120 TFLOPS，加速归零。",
  "edgeCases": [
    "老卡（如 Volta/Turing 之前）无 FP8：FP8 模型只能退化为\"存省\"，计算仍走 FP16 路径。",
    "kernel 不支持某精度组合（如 FP8 权重配 FP16 激活的某变体）：需选对量化方案，否则回退。",
    "小矩阵吃不满 Tensor Core：形状不对齐时占用率低，加速远不及预期。",
    "per-tensor 与 per-channel 量化对 kernel 支持不同：选错影响精度或无法走快路径。"
  ],
  "code": "# Python (选择 kernel 伪代码)\ndef pick_gemm(dtype):\n    if dtype == 'int8' and gpu_has('tensor_core'): return int8_tc_gemm\n    if dtype == 'fp8'  and gpu_has('fp8'):         return fp8_gemm\n    return fp16_gemm                                    # 否则退回",
  "codeNotes": [
    "Tensor Core 吞吐随精度翻倍（8→4→2 字节对应 INT8→FP8→FP16 的密度变化）。",
    "带宽节省与字节数成正比：权重越小搬得越快，这是量化的另一半收益。",
    "真实部署需配合量化校准与 kernel 选择，伪代码只是路由逻辑。"
  ],
  "complexity": "硬件固定峰值下，实际加速受 kernel 占用率、矩阵形状（是否吃满 Tensor Core 的 mma 形状）、量化/反量化开销影响。小矩阵或批量=1 时占用率低，加速打折扣；大矩阵且形状对齐时才能逼近理论 2×。",
  "followUps": [
    {
      "question": "只存 INT8 不加速可能吗？",
      "answer": "会。如果权重以 INT8 存储、却仍用 FP16 kernel 先反量化成浮点再计算，那么只有\"显存占用减半\"这一半收益，算力完全没提升，甚至多了反量化开销。要拿到算力加速，必须真正走低精度 GEMM kernel（Tensor Core 的 IMMA 指令），让乘加在整数域完成。所以\"量化存储\"和\"量化计算\"要配套。"
    },
    {
      "question": "CPU 上量化有用吗？",
      "answer": "有用。Intel CPU 的 AVX-VNNI、AMX 提供 INT8 矩阵指令，能在 CPU 推理上显著加速；ARM 的 NEON/SVE 也有定点乘加。只是 CPU 的 Tensor Core 等价物吞吐不如 GPU，适合边缘、低成本或无法上 GPU 的场景。同样原则：要有对应指令/kernel 且权重真正以低精度计算，否则也只是省内存。"
    }
  ],
  "followUpAnswers": [
    "会。如果权重以 INT8 存储、却仍用 FP16 kernel 先反量化成浮点再计算，那么只有\"显存占用减半\"这一半收益，算力完全没提升，甚至多了反量化开销。要拿到算力加速，必须真正走低精度 GEMM kernel（Tensor Core 的 IMMA 指令），让乘加在整数域完成。所以\"量化存储\"和\"量化计算\"要配套。",
    "有用。Intel CPU 的 AVX-VNNI、AMX 提供 INT8 矩阵指令，能在 CPU 推理上显著加速；ARM 的 NEON/SVE 也有定点乘加。只是 CPU 的 Tensor Core 等价物吞吐不如 GPU，适合边缘、低成本或无法上 GPU 的场景。同样原则：要有对应指令/kernel 且权重真正以低精度计算，否则也只是省内存。"
  ],
  "pitfalls": [
    "以为\"存成低精度\"就自动快：存储省了，算力没动，必须配套低精度 GEMM kernel。",
    "在旧卡上期待 FP8 加速：硬件根本没有 FP8 单元，结果只有带宽收益。",
    "忽略校准（calibration）导致低精度 kernel 出精度崩坏，反而要回退。"
  ],
  "beginnerSummary": "低精度数据像轻便行李（用更少字节，省带宽），但得有对应的\"快速通道\"（Tensor Core）才能真正跑得快。如果还是走普通安检通道（FP16 kernel），行李是轻了、搬得省劲，但过关速度没变——只省了显存，没拿到算力加速。所以\"存成 INT8\"和\"算成 INT8\"是两回事。",
  "prerequisites": [
    "Tensor Core 做矩阵乘加速：理解其以 mma 形状批量处理低精度乘加、算力密度高于 FP32/FP16 CUDA core。",
    "低精度省带宽：权重字节数减半/ quarter，显存与带宽需求同比例下降。",
    "需专门 kernel 调用：CUTLASS/rocBLAS 等库把低精度指令暴露出来，框架要选对。"
  ],
  "workedExample": [
    "A100 INT8 峰值 ≈ FP16 2×：4096³ GEMM 实测 230 vs 120 TFLOPS。",
    "H100 增加 FP8 支持：同等形状 FP8 再上一个台阶，但需 FP8 kernel 才能兑现。",
    "错误路径：INT8 权重 + FP16 kernel，吞吐仍是 120 TFLOPS，加速归零。"
  ],
  "lineByLine": [
    "查硬件支持精度：用 gpu_has 判断是否有 tensor_core / fp8 单元，决定能走哪条快路径。",
    "选匹配 GEMM kernel：int8_tc_gemm / fp8_gemm 才在硬件低精度域内计算。",
    "低精度域乘加：直接整数/FP8 乘加，拿到算力与带宽双收益。",
    "否则退回 fp16_gemm：无支持时保正确性与基本的显存节省，但无加速。"
  ],
  "diagram": "数据(INT8/FP8) ─▶ Tensor Core ─▶ 高吞吐\n无支持 ─▶ FP16 kernel ─▶ 仅省显存"
};
