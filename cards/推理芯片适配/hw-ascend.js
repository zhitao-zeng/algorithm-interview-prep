export default {
  "id": "hw-ascend",
  "category": "推理芯片适配",
  "difficulty": "Medium",
  "title": "昇腾与国产 NPU 软件栈",
  "prompt": "昇腾（Ascend）NPU 的软件栈主要由哪些层次组成，各层分别承担什么职责？",
  "quickAnswer": "昇腾软件栈以 CANN（Compute Architecture for Neural Networks）为核心，自顶向下分为应用层（AscendCL API）、图引擎层（GE 图编译与融合）、算子库层（TBE 与高性能算子）、运行时层（Runtime 驱动与任务调度）和固件驱动层，最终映射到 Da Vinci 架构的 AI Core 上执行。",
  "approach": "按\"应用接口→图编译→算子库→运行时→硬件\"的纵向分层展开：AscendCL 提供 C++/Python 接口；GE 负责整图解析、子图切分与融合；TBE 用 DSL 生成针对 Cube/Vector 单元的算子；Runtime 把算子打包成任务流下发到 AI Core。",
  "explanationFocus": "是什么：昇腾 NPU 软件栈是一套由 CANN 统一封装的层次化软件体系，把深度学习框架的计算图翻译并调度到 Da Vinci AI Core 上执行。",
  "bruteForce": "最朴素的做法是让框架直接逐算子调用 NPU 驱动，每个算子单独申请显存、单独下发任务，不做图级融合与内存复用，导致大量 Host-NPU 同步与零散调度开销。",
  "invariant": "在任意时刻，Runtime 保证\"已提交的任务在依赖满足后才被 AI Core 取走执行\"，即任务流中的依赖边始终成立，硬件无需关心上层框架语义。",
  "walkthrough": "以 ResNet 推理为例：框架导出 ONNX → GE 解析为计算图 → 切分为 NPU 子图 → 融合 Conv+BN+Add → TBE 编译为算子 → Runtime 将融合算子与数据一并下发 → AI Core 的 Cube 单元完成矩阵乘、Vector 单元完成激活。",
  "complexity": "软件栈本身不计入算法复杂度，但图编译与融合通常将算子数从 O(N) 降到 O(融合后子图数)；运行时任务下发是 O(算子数) 的调度开销，融合显著降低常数因子。",
  "beginnerSummary": "可以把昇腾软件栈想象成一座工厂：AscendCL 是接单窗口，GE 是工艺规划师负责合并工序，TBE 是车间把工序做成专用机器，Runtime 是调度员把机器送上生产线（AI Core）。",
  "diagram": "Host App\n   | (AscendCL API)\n   v\nGE Graph Engine (parse / fuse)\n   |\n   v\nTBE Operator Lib (compile)\n   |\n   v\nRuntime (task dispatch)\n   |\n   v\nAscend NPU (Da Vinci AI Core)",
  "code": "def ascend_utilization(active_cycles, total_cycles):\n    \"\"\"粗略估计一个融合算子在 AI Core 上的算力利用率\"\"\"\n    if total_cycles <= 0:\n        return 0.0\n    return active_cycles / total_cycles",
  "derivation": [
    "为什么需要：深度学习框架的计算图语义与 Da Vinci 硬件指令集之间存在巨大鸿沟，必须有一层软件把图翻译成可高效执行的任务流，否则 NPU 算力无法被充分利用。",
    "怎么实现：CANN 用 GE 把计算图解析成中间表示，做子图切分与算子融合，再交给 TBE 用 DSL 生成针对 Cube/Vector 单元的算子，最后由 Runtime 打包成任务流下发到 AI Core。",
    "有什么代价：分层带来编译与算子开发复杂度，自定义算子需用 TBE 重写并调优；图编译耗时在首帧明显，通常通过离线编译与算子预编译缓存来缓解。",
    "怎么评测：端到端用推理吞吐（samples/s）与首帧时延评测；底层用 AI Core 利用率、Cube/Vector 单元占用率与内存带宽利用率衡量各层是否有效。"
  ],
  "edgeCases": [
    "动态 shape 输入：编译期无法确定张量尺寸，需要 GE 走动态分档或实际 shape 重编译，否则报错或退化为低效路径。",
    "算子不支持：某算子无 TBE 实现时回退到 CPU 或 AiCPU 执行，造成 Host-NPU 往返，性能骤降。",
    "跨芯片切图：当图过大超过单卡内存，需 GE 做图切分与多卡流水，否则 OOM。",
    "混合精度图：FP16 与 FP32 混合时需在融合边界插入 cast，错误插入会引入精度或性能问题。"
  ],
  "pitfalls": [
    "误以为 AscendCL 直接对接硬件：实际中间有 GE/TBE/Runtime 多层，调优应定位在真正瓶颈层而非盲目改应用代码。",
    "忽视首帧编译开销：在线编译导致首请求慢，生产环境应预热或离线预编译算子库。"
  ],
  "prerequisites": [
    "计算图（Graph）与算子（Operator）的基本概念",
    "异构计算的 Host-Device 分工与任务调度模型"
  ],
  "workedExample": [
    "示例1：ResNet-50 图像分类，框架导出 ONNX 后由 GE 融合 Conv+BN+ReLU，推理吞吐较逐算子下发提升约 2 倍。",
    "示例2：动态 batch 语音识别，配置 shape range 让 GE 预编译多个档位，避免每次重编译。"
  ],
  "lineByLine": [
    "def ascend_utilization(active_cycles, total_cycles): 定义函数，入参为 AI Core 实际计算周期与总周期。",
    "if total_cycles <= 0: return 0.0 防御除零，没有周期时利用率定义为 0。",
    "return active_cycles / total_cycles 用活跃周期占比近似算力利用率，是软件栈评测中常用的硬件侧指标。"
  ],
  "codeNotes": [
    "该示意用活跃周期占比表达\"利用率\"，真实场景中还需扣除等待数据搬运（MTE）的空洞周期。"
  ],
  "followUps": [
    {
      "question": "GE 的算子融合和通用图编译器（如 TVM/XLA）的融合有什么异同？",
      "answer": "相似点是都基于计算图做子图融合与调度；不同点是 GE 深度绑定 Da Vinci 硬件特征（Cube/Vector 单元、L1/L0 缓存），融合策略更偏硬件亲和，而 TVM/XLA 更通用、跨后端。"
    },
    {
      "question": "为什么自定义算子通常要写 TBE 而不是普通 C++？",
      "answer": "因为 Da Vinci 的 Cube/Vector 是专用 SIMD/SIMT 单元，TBE 提供的 DSL 能映射到其指令并自动做流水与内存复用，普通 C++ 无法发挥硬件峰值算力。"
    }
  ],
  "followUpAnswers": [
    "相似点是都基于计算图做子图融合与调度；不同点是 GE 深度绑定 Da Vinci 硬件特征，融合策略更偏硬件亲和。",
    "因为 Da Vinci 的 Cube/Vector 是专用单元，TBE 的 DSL 能映射其指令并自动做流水与内存复用。"
  ],
  "kind": "concept"
};
