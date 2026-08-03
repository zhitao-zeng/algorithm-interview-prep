export default {
  "id": "ir-trtllm",
  "category": "推理框架",
  "difficulty": "Hard",
  "title": "TensorRT-LLM",
  "prompt": "TensorRT-LLM 是如何通过图优化与内核融合在 NVIDIA GPU 上实现低延迟高吞吐推理的？",
  "quickAnswer": "TensorRT-LLM 把 LLM 计算图捕获为可优化的计算图，做算子融合（如 QKV/Attention/RoPE 融合）、量化（FP8/INT8）、KV Cache 分页与高效内核（FlashAttention），并通过 in-flight batching 动态调度。最终在编译期确定最优 kernel 与内存布局，运行时几乎零 Python 开销，延迟与吞吐显著优于原生框架。",
  "approach": "抓住\"编译期优化\"主线：图捕获→算子融合与量化→生成高度优化的 engine；运行时用分页 KV + 连续批处理。理解它偏 NVIDIA 生态、需构建 engine。",
  "explanationFocus": "是什么：TensorRT-LLM 是 NVIDIA 面向 GPU 的高性能 LLM 推理库，它将模型编译成高度优化的执行引擎，通过算子融合、量化、分页 KV 与定制内核，在编译期固化最优执行路径以获得极低延迟与高吞吐。",
  "bruteForce": "朴素 PyTorch 推理逐算子调用、大量小块 kernel 启动与临时张量分配，GPU 利用率低、显存带宽未吃满，延迟高且波动大。",
  "invariant": "核心不变量：给定相同模型权重与构建配置，编译出的 engine 在固定输入形状范围内的数值与调度行为可复现，且 KV 块生命周期由运行时严格管理不越界。",
  "walkthrough": "以 LLaMA-70B 在 4×A100 为例，开启 FP8 + 连续批处理，TRT-LLM 将 QKV 投影与 RoPE 融合为单 kernel，attention 用 FlashAttention；相比 HF 推理吞吐从约 900 tok/s 提升到 3000+ tok/s，P99 延迟降约 3 倍。",
  "code": "def build_engine(onnx_graph, cfg):\n    builder = trt.Builder(logger)\n    net = builder.create_network()          # 捕获为计算图\n    net = fuse_qkv_rope(net)                # 算子融合\n    net = quantize(net, cfg.precision)      # FP8/INT8\n    engine = builder.build_engine(net,\n        profile=cfg.shapes)                 # 编译期定形状/内核\n    return engine",
  "complexity": "构建为一次性 O(模型规模) 编译开销；运行推理核心仍为 O(n²) 注意力，但融合内核将常数因子降数倍，吞吐近线性随 GPU 数扩展。",
  "beginnerSummary": "像把一道复杂菜谱提前优化成一条流水线，把多步合并成一步、用更省料的火候，开火后每桌出菜又快又稳。",
  "diagram": "PyTorch 逐算子:  [A]->[B]->[C]->[D]  多 kernel 启动\nTRT-LLM 融合:    [A∘B∘C∘D] 单 kernel\n   + 量化(FP8) + 分页KV + 连续批",
  "derivation": [
    "为什么需要：原生逐算子执行 kernel 启动与显存搬运开销大，GPU 算力吃不满。",
    "怎么实现：捕获计算图，做融合/量化/分页 KV，编译为 engine，运行时 in-flight batching 调度。",
    "有什么代价：构建 engine 耗时且绑定特定 GPU 架构与形状配置，跨硬件需重新编译；INT8/FP8 有精度风险。",
    "怎么评测：对比同硬件下吞吐(tok/s)、首 token 延迟与 P99，及量化后精度回落是否可接受。"
  ],
  "edgeCases": [
    "动态形状超出构建 profile 范围，engine 回退或报错，需设多 profile。",
    "FP8 在低精度敏感层（如残差/layernorm）需跳过以免精度崩。",
    "跨 GPU 架构（Ampere→Hopper）engine 不兼容，须重编译。"
  ],
  "pitfalls": [
    "以为 TRT-LLM 跨平台通用，忽视其强 NVIDIA/架构绑定。",
    "盲目全层 INT8，忽略敏感层保精度导致输出退化。"
  ],
  "prerequisites": [
    "GPU 计算图、kernel 融合与量化基础",
    "KV Cache 与连续批处理概念"
  ],
  "workedExample": [
    "捕获 LLaMA 图后融合 QKV+RoPE 为单 kernel，减少 3 次独立启动为 1 次，带宽占用降约 40%。",
    "构建 FP8 engine 仅在 attention 输出层保留 FP16，70B 模型吞吐 900→3100 tok/s，精度仅掉 0.3%。"
  ],
  "lineByLine": [
    "builder.create_network() 把模型捕获为可分析的计算图。",
    "fuse_qkv_rope(net) 将多个小算子合并，减少 kernel 启动与中间张量。",
    "quantize(net, precision) 按配置做 FP8/INT8 量化降低算力与带宽。",
    "build_engine(..., profile) 编译期确定形状与最优内核，产出可部署 engine。"
  ],
  "codeNotes": [
    "profile/shapes 需覆盖实际请求长度分布，否则运行时需回退到最慢路径。"
  ],
  "followUps": [
    {
      "question": "TRT-LLM 与 vLLM 怎么选？",
      "answer": "延迟/吞吐极致且锁定 NVIDIA 时选 TRT-LLM；要易用、跨模型快速迭代、显存分页复用选 vLLM；二者也可组合（vLLM 后端接 TRT 内核）。"
    },
    {
      "question": "FP8 量化主要省在哪里？",
      "answer": "省在矩阵乘与 attention 的算力与显存带宽，权重和激活用 8 位表示使吞吐近翻倍，但需 Hopper 以上支持且对敏感层保高精度。"
    }
  ],
  "followUpAnswers": [
    "延迟/吞吐极致且锁定 NVIDIA 时选 TRT-LLM；要易用、跨模型快速迭代、显存分页复用选 vLLM；二者也可组合（vLLM 后端接 TRT 内核）。",
    "省在矩阵乘与 attention 的算力与显存带宽，权重和激活用 8 位表示使吞吐近翻倍，但需 Hopper 以上支持且对敏感层保高精度。"
  ],
  "kind": "concept"
};
