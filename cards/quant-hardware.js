export default {
  "kind": "concept",
  "id": "quant-hardware",
  "category": "量化推理",
  "difficulty": "Medium",
  "title": "量化硬件支持",
  "prompt": "GPU 上 INT8/FP8 的加速靠什么硬件，为什么需要专门支持？",
  "quickAnswer": "加速来自 Tensor Core/AMX 等矩阵乘加速器对 INT8(及新卡的 FP8)的原生支持：整数 MAC 比 FP16 更省面积、更高吞吐，且带宽因低精度减半/ quarter。但前提是权重/激活确实以低精度存储与计算，并调用对应 kernel(如 CUTLASS/rocBLAS)，否则只是省显存而无加速。",
  "approach": "确认硬件代数支持的目标精度，并选用对应 GEMM kernel。",
  "explanationFocus": "是什么：量化加速依赖专为低精度矩阵乘设计的硬件单元(Tensor Core/AMX)，普通 CUDA core 算整数并不快。",
  "bruteForce": "权重存 INT8 但用 FP16 kernel 反量化再算，无加速。",
  "derivation": [
    "为什么需要：低精度值本身不快，必须有硬件在整数/FP8 域直接乘加才能提速并省带宽。",
    "怎么实现：Ampere+ 有 INT8 Tensor Core，Hopper 加 FP8；通过 CUTLASS/库调用 IMMA/FP8 指令。",
    "有什么代价：旧 GPU 无支持则只能存省、算不快；需精度匹配的 kernel，混精度调度复杂。",
    "怎么评测：在目标卡上实测 INT8/FP8 GEMM 吞吐 vs FP16，确认达成预期倍数。"
  ],
  "invariant": "加速=算力倍数×带宽节省，且需硬件+ kernel 双到位。",
  "walkthrough": "A100 INT8 Tensor Core 理论峰值约 FP16 的 2×；H100 FP8 约 2× 于 FP16。",
  "edgeCases": [
    "老卡无 FP8，FP8 模型退化为存省。",
    "kernel 不支持某精度组合。",
    "小矩阵吃不满 Tensor Core。"
  ],
  "code": "# Python (选择 kernel 伪代码)\ndef pick_gemm(dtype):\n    if dtype == 'int8' and gpu_has('tensor_core'): return int8_tc_gemm\n    if dtype == 'fp8'  and gpu_has('fp8'):         return fp8_gemm\n    return fp16_gemm                                    # 否则退回",
  "codeNotes": [
    "Tensor Core 吞吐随精度翻倍(8→4→2字节)。",
    "带宽节省与字节数成正比。"
  ],
  "complexity": "硬件固定峰值；实际受 kernel 占用率与形状影响。",
  "followUps": [
    {
      "question": "只存 INT8 不加速可能吗？",
      "answer": "会，若仍用 FP16 kernel 反量化计算，只省显存、算力无收益，必须走低精度 GEMM。"
    },
    {
      "question": "CPU 上量化有用吗？",
      "answer": "有，AVX-VNNI/AMX 提供 INT8 指令，CPU 推理也能显著加速。"
    }
  ],
  "followUpAnswers": [
    "加速要硬件+ kernel 双到位。",
    "CPU 也有 INT8 指令。"
  ],
  "pitfalls": [
    "以为存低精度就自动快。",
    "在旧卡上期待 FP8 加速。"
  ],
  "beginnerSummary": "低精度数据像轻便行李(省带宽)，但得有对应的\"快速通道\"(Tensor Core)才能真正跑得快。若还是走普通安检(FP16 kernel)，行李轻了却没快多少。",
  "prerequisites": [
    "Tensor Core 做矩阵乘加速。",
    "低精度省带宽。",
    "需专门 kernel 调用。"
  ],
  "workedExample": [
    "A100 INT8 峰值≈FP16 2×。",
    "H100 增加 FP8 支持。"
  ],
  "lineByLine": [
    "查硬件支持精度。",
    "选匹配 GEMM kernel。",
    "低精度域乘加。",
    "实测吞吐确认加速。"
  ],
  "diagram": "数据(INT8/FP8) ─▶ Tensor Core ─▶ 高吞吐\n无支持 ─▶ FP16 kernel ─▶ 仅省显存"
};
