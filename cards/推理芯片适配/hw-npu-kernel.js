export default {
  "id": "hw-npu-kernel",
  "category": "推理芯片适配",
  "difficulty": "Hard",
  "title": "NPU 算子移植与调优",
  "prompt": "把 PyTorch 算子移植到国产 NPU 上并达到理想性能，需要经历哪些关键步骤？",
  "quickAnswer": "先把算子用芯片 SDK 的图级或算子级接口重写，通过 host 侧下发编译成二进制 kernel。再用 profiling 工具定位访存与计算瓶颈，通过分块 tiling、向量化、流水并行把峰值算力吃满。最后做精度比对，保证输出与 CUDA/CPU 参考实现误差在阈值内。",
  "approach": "先确认算子属于芯片软件栈的已支持集合，能复用就复用；不支持则写自定义算子并用 CCE/HLK 等 DSL 表达计算。核心策略是把计算图映射到芯片的 AI Core 矩阵单元与向量单元，并通过 double buffer 与流水掩盖访存延迟。",
  "explanationFocus": "是什么：NPU 算子移植是把框架层算子改写成芯片专用计算 kernel，并接入芯片驱动与编译栈，使模型在该硬件上正确且高效地推理。",
  "bruteForce": "直接把整图用通用循环在 host CPU 上模拟执行，不利用任何硬件加速单元，正确性容易保证但性能极差。",
  "invariant": "无论怎样分块与调度，算子在数学上必须等价于参考实现，输出逐元素误差不超过既定阈值。",
  "walkthrough": "以 shape=(1024,1024) 的矩阵乘为例，NPU 单核算力 128 TFLOPS(FP16)，理论耗时 2*1024^3/128e12≈16.7ms；但实测若不分块只有 12 TFLOPS 有效算力，差距来自 MTE 访存带宽 400GB/s 未打满。通过 128x128 分块让 L0 缓存命中后有效算力升到 110 TFLOPS。",
  "code": "def npu_gemm_tiling(a, b, block=128):\n    # a: (M,K) on device, b: (K,N)\n    M, K = a.shape\n    N = b.shape[1]\n    out = npu_zeros((M, N))\n    for i in range(0, M, block):\n        for j in range(0, N, block):\n            for k in range(0, K, block):\n                # 调用芯片矩阵单元，单次计算 block^2 输出\n                out[i:i+block, j:j+block] += npu_mmad(\n                    a[i:i+block, k:k+block],\n                    b[k:k+block, j:j+block])\n    return out",
  "complexity": "时间复杂度 O(M*N*K)，与算法规模一致；额外空间为分块缓存 O(block^2)，用以隐藏访存延迟。",
  "beginnerSummary": "就像把一道菜从家用灶台搬到大型中央厨房，要先按新厨房的厨具重新写操作流程，再反复试做保证口味不变且出餐更快。",
  "diagram": "  PyTorch op\n      |\n  图级下沉(ATC/编译)\n      |\n  +---+-------------+\n  |  AI Core 调度   |\n  |  MTE   Cube VEC |\n  +---+-------------+\n      |\n  精度比对 <-> 参考实现",
  "derivation": [
    "为什么需要：框架算子默认面向通用硬件，必须重写为芯片专有 kernel 才能调用矩阵/向量单元并获得加速。",
    "怎么实现：用芯片 DSL 描述计算，编译器生成二进制，host 侧用 ACL/Runtime 下发并管理 tensor 生命周期。",
    "有什么代价：移植需熟悉硬件架构，调试周期长，且可能遇到硬件不支持的算子形状而需拆分或回退。",
    "怎么评测：用相同输入跑参考实现与 NPU 实现，比较余弦相似度与最大绝对误差，并测端到端吞吐与利用率。"
  ],
  "edgeCases": [
    "动态 shape 导致 kernel 需每次重编译，应走 shape 白名单或 shape 推理。",
    "非 16/32 对齐的尾块，需要 padding 或单独小 kernel 处理。",
    "算子不支持时降级到 CPU 执行，带来 host-device 拷贝开销。",
    "batch=1 的小算子 launch 开销占比过高，应融合或合并。"
  ],
  "pitfalls": [
    "只验证了均值误差而忽略个别通道最大误差，部署后在某些输入上精度崩塌。",
    "误以为编译通过即高性能，未做 profiling 导致实际利用率仅 10%。"
  ],
  "prerequisites": [
    "矩阵乘法与计算图基本概念",
    "芯片计算单元(Cube/Vector)与存储层级认知",
    "框架算子注册与自定义算子机制"
  ],
  "workedExample": [
    "将 LayerNorm 移植到 NPU：先查软件栈无原生支持，改为 reduce+向量运算组合实现。",
    "实测与 CPU 参考最大误差 3e-3(FP16)，满足 <5e-3 阈值后上线。"
  ],
  "lineByLine": [
    "for i,j,k 三重循环把大矩阵拆成 block×block 的小块，逐个送进矩阵单元。",
    "npu_mmad 调用芯片 Cube 单元完成一次小块矩阵乘并累加，避免反复读写全局内存。",
    "out 累加各 k 块结果，最终等价于完整 GEMM，块大小由 L0 缓存容量决定。"
  ],
  "codeNotes": [
    "block 取值需匹配硬件 L0 缓存块(常见 128 或 256)，过大反而放不下。"
  ],
  "followUps": [
    {
      "question": "如何判断一个算子是否值得写自定义 kernel 而不是用已有算子拼？",
      "answer": "先估算该算子在端到端耗时占比，占比低时组合即可；占比高且现有拼法利用率低、访存来回多，再投入自定义 kernel。"
    },
    {
      "question": "移植后精度不达标怎么办？",
      "answer": "先定位是算法拆分导致还是数值范围问题，尝试在敏感层用 FP32 或混合精度，并对 reduction 顺序做对齐。"
    }
  ],
  "followUpAnswers": [
    "先估算该算子在端到端耗时占比，占比低时组合即可；占比高且现有拼法利用率低、访存来回多，再投入自定义 kernel。",
    "先定位是算法拆分导致还是数值范围问题，尝试在敏感层用 FP32 或混合精度，并对 reduction 顺序做对齐。"
  ],
  "kind": "concept"
};
