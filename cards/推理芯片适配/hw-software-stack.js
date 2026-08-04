export default {
  "id": "hw-software-stack",
  "category": "推理芯片适配",
  "difficulty": "Medium",
  "title": "芯片软件栈与图编译",
  "prompt": "通用 AI 芯片的软件栈通常如何分层，图编译器在其中扮演什么角色？",
  "quickAnswer": "典型分层为：前端框架接口 → 图表示/IR → 图编译器（解析、优化、融合、调度、代码生成）→ 运行时 → 驱动 → 硬件。图编译器是\"大脑\"，把高层计算图等价变换为高效、可映射到硬件的任务序列。",
  "approach": "按\"前端→IR→编译器优化→后端代码生成→运行时\"流水线描述：编译器负责常量折叠、算子融合、布局变换、内存规划与 kernel 选型，输出硬件可执行的调度计划。",
  "explanationFocus": "是什么：芯片软件栈是一组把框架计算图逐步 lowering 到硬件指令的软件层，图编译器位于中间，负责图级优化与代码生成。",
  "bruteForce": "朴素方式：框架把每个算子翻译成一次独立 kernel 调用，不做融合与内存复用，Host 频繁同步，kernel 启动与访存开销占主导。",
  "invariant": "图编译器保证\"任意合法优化变换前后，计算图的数值语义（给定相同输入得到相同输出）保持不变\"。",
  "walkthrough": "以 Transformer 解码一步为例：前端导出图 → IR 规范化 → 融合 QKV 三个 MatMul → 做层归一化折叠 → 内存规划复用 KV Cache → 生成针对该芯片矩阵单元的 kernel → 运行时按调度计划下发。",
  "complexity": "编译期优化为图规模上的多项式复杂度（融合/调度搜索常为常数或 O(E·V)）；运行期开销随算子数下降而减小，融合主要削减常数因子而非渐近阶。",
  "beginnerSummary": "软件栈像翻译流水线：框架说\"我要算什么\"，IR 是中间语言，图编译器是润色与重组译文的编辑，运行时把最终译文交给芯片\"朗读\"出来。",
  "diagram": "Framework (PyTorch/TF)\n   | export graph\n   v\nIR (Graph / ONNX)\n   |\n   v\nGraph Compiler (opt+fuse+codegen)\n   |\n   v\nRuntime + Driver\n   |\n   v\nAI Accelerator",
  "code": "def compile_graph(graph, target):\n    graph = fuse_ops(normalize(graph))\n    plan = schedule(graph, target)\n    return codegen(plan, target)",
  "derivation": [
    "为什么需要：框架的高级算子语义无法直接映射到专用硬件指令，需要一层把\"算什么\"转换为\"怎么高效算\"。",
    "怎么实现：用统一 IR 表示计算图，依次做规范化、常量折叠、算子融合、数据布局变换、内存规划，再针对目标芯片做调度与 kernel 代码生成。",
    "有什么代价：编译复杂度与图规模相关，自动调优（autotuning）可能很耗时；过激进的融合会增大寄存器/共享内存占用，触发 spill。",
    "怎么评测：用端到端时延、吞吐与硬件利用率评测；编译质量用融合率、内存复用率与生成的 kernel 是否命中高性能路径衡量。"
  ],
  "edgeCases": [
    "动态控制流（if/loop 依赖输入）：静态图编译器无法展开，需要动态 shape/控制流支持或回退到解释执行。",
    "自定义/罕见算子：无对应融合规则时退化为单算子 kernel，可能破坏整体流水线。",
    "极致内存受限：内存规划失败会导致 OOM，需要重算（recomputation）或卸载策略。",
    "多目标芯片：同一 IR 需为不同后端生成不同 kernel，调度策略不可硬编码。"
  ],
  "pitfalls": [
    "把图编译器当成黑盒：调优时应先 profiling 看是融合不足还是 kernel 本身慢，再决定改编译器策略还是手写算子。",
    "过度融合：融合过大导致片上内存溢出或寄存器压力上升，反而变慢。"
  ],
  "prerequisites": [
    "计算图与中间表示（IR）的基本概念",
    "编译器优化基础（融合、常量折叠、内存规划）"
  ],
  "workedExample": [
    "示例1：把 Conv+BN+ReLU 融合为单 kernel，省去中间张量写回，时延下降明显。",
    "示例2：对动态 batch 文本模型启用动态 shape 编译，避免每步重编译。"
  ],
  "lineByLine": [
    "def compile_graph(graph, target): 入口，入参是计算图与目标芯片描述。",
    "graph = fuse_ops(normalize(graph)) 先规范化再融合，确保融合规则能稳定匹配模式。",
    "plan = schedule(graph, target) 针对目标芯片做任务与内存调度。",
    "return codegen(plan, target) 生成最终可在该芯片运行的 kernel 代码。"
  ],
  "codeNotes": [
    "示意省略了 autotuning 与代价模型，真实编译器会在 schedule 阶段搜索最优 tile 与并行策略。"
  ],
  "followUps": [
    {
      "question": "图编译器做算子融合的主要收益来自哪里？",
      "answer": "主要来自减少中间张量的显存读写（访存常是瓶颈）、降低 kernel 启动开销，以及让编译器在一次调度内做跨算子的寄存器/共享内存复用。"
    },
    {
      "question": "IR 为什么要分层（functional IR / loop IR / hardware IR）？",
      "answer": "分层让高层做语义级优化、低层做硬件亲和优化，每层只关心本层可决策的变换，便于跨后端复用前端与复用后端。"
    }
  ],
  "followUpAnswers": [
    "主要来自减少中间张量显存读写、降低 kernel 启动开销，以及跨算子内存复用。",
    "分层让高层做语义优化、低层做硬件亲和优化，便于前后端复用。"
  ],
  "kind": "concept"
};
