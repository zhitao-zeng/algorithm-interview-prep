export default {
  "id": "hw-graph-compile",
  "category": "推理芯片适配",
  "difficulty": "Hard",
  "title": "图编译器与算子融合调度",
  "prompt": "图编译器在进行算子融合与调度时，主要解决哪些问题，又面临哪些权衡？",
  "quickAnswer": "图编译器要解决\"把计算图等价变换为高性能任务序列\"，核心问题包括：融合哪些算子（减少访存/启动开销）、如何切分任务到计算单元、如何规划内存复用、如何为每种 shape 选最优 kernel。权衡集中在编译时间、融合收益与片上资源限制之间。",
  "approach": "围绕\"融合决策、任务切分、内存规划、kernel 选择、代价模型\"展开，并强调融合会增大单 kernel 资源占用，需在收益与资源间平衡。",
  "explanationFocus": "是什么：图编译器的融合调度指在保持数值语义前提下，决定哪些算子合并为一个 kernel、如何切分与排队执行、以及如何复用内存的过程。",
  "bruteForce": "朴素调度：按拓扑序逐算子下发，每个算子独立分配/释放显存，不做融合，结果正确但访存与启动开销巨大。",
  "invariant": "无论怎样融合与重排，编译器保证\"任意两点间的真实数据依赖边不被违反，且输出数值等价\"。",
  "walkthrough": "以 LLaMA 解码为例：识别 QKV 三个 MatMul 可横向融合 → 将其切分为适配矩阵单元 tile 大小的子任务 → 规划 KV Cache 复用显存 → 为当前 seq_len 选最优 GEMM kernel → 生成调度图下发。",
  "complexity": "融合搜索通常为图上的启发式/贪心（近似多项式），autotuning 调度可能指数级，实践中用代价模型剪枝；运行期开销与融合后 kernel 数成正比。",
  "beginnerSummary": "图编译器像厨师长：决定把哪些步骤合并（切菜+腌渍一起做省时间），把活分给几个灶台，并安排好案板（内存）不打架。",
  "diagram": "Graph\n  | fuse\n  v\nFused Kernels\n  | schedule (tile)\n  v\nMemory Plan\n  | codegen\n  v\nTask Stream -> Cores",
  "code": "def schedule_fused(fused_ops, cores, mem_budget):\n    tasks = [tile(op, cores) for op in fused_ops]\n    plan = allocate(mem_budget)\n    return assign(tasks, plan)",
  "derivation": [
    "为什么需要：默认逐算子执行受限于访存带宽与启动开销，必须把多个算子合并并在片上完成数据传递才能逼近峰值。",
    "怎么实现：编译器在 IR 上做融合模式匹配，生成融合 kernel，再用代价模型选择 tile/并行度，结合内存预算做规划并生成任务流。",
    "有什么代价：融合增大寄存器/共享内存占用，过度融合触发 spill 或超出预算；搜索最优调度耗编译时间，需要缓存编译结果。",
    "怎么评测：用融合率、访存节省量、端到端时延与硬件单元利用率评测；同时监控是否因融合导致 OOM 或 spill。"
  ],
  "edgeCases": [
    "跨数据流依赖：融合会拉长关键路径，若其中某算子必须等外部输入则无法合并。",
    "内存预算不足：融合后中间张量过大，需拆融合或启用重算。",
    "动态 shape：固定 tile 不适配变化 seq_len，需分档或动态 tiling。",
    "融合破坏数值稳定：如融合后累加顺序改变引入误差，需要保留原始计算顺序。"
  ],
  "pitfalls": [
    "只追求高融合率：忽视资源预算导致 spill，反而比不融合更慢。",
    "忽略调度搜索成本：在在线场景反复 autotune，拖慢首请求。"
  ],
  "prerequisites": [
    "计算图融合（operator fusion）原理",
    "硬件执行模型（tile、并行单元、片上内存层级）"
  ],
  "workedExample": [
    "示例1：把 LayerNorm 的减均值、除方差、仿射三步融合，省去两次张量写回。",
    "示例2：attention 中 QK^T 与 softmax 与 PV 在片上连续计算，避免把大矩阵落回 HBM。"
  ],
  "lineByLine": [
    "def schedule_fused(fused_ops, cores, mem_budget): 入口，入参为融合后的算子列表、核心数与内存预算。",
    "tasks = [tile(op, cores) for op in fused_ops] 把每个融合算子切成适配核心数的子任务。",
    "plan = allocate(mem_budget) 在预算内规划片上/显存复用。",
    "return assign(tasks, plan) 将任务分配到规划好的内存与计算单元上执行。"
  ],
  "codeNotes": [
    "示意省略代价模型，真实调度会用 profiling 反馈迭代选择最优 tile。"
  ],
  "followUps": [
    {
      "question": "融合与内存复用之间是什么关系？",
      "answer": "融合通过把中间结果保留在更快的片上内存来减少 HBM 读写，内存复用进一步让不同生命周期的张量共用同一块空间，二者共同削减访存瓶颈。"
    },
    {
      "question": "代价模型在调度中起什么作用？",
      "answer": "代价模型近似估计不同 tile 与融合方案的时延/带宽，用于在指数级搜索空间中剪枝，选出接近最优的调度而不必真机穷举。"
    }
  ],
  "followUpAnswers": [
    "融合把中间结果留在片上减少 HBM 读写，内存复用让不同张量共用空间，二者共同削访存瓶颈。",
    "代价模型近似估计各方案的时延/带宽，用于在搜索空间中剪枝选优而不必真机穷举。"
  ],
  "kind": "concept"
};
