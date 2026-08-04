export default {
  "id": "hw-utilization-opt",
  "category": "推理芯片适配",
  "difficulty": "Hard",
  "title": "算力利用率优化",
  "prompt": "如何系统性地定位并提升推理芯片上的算力利用率（MFU/HFU）？",
  "quickAnswer": "先用 profiling 区分瓶颈在算力、带宽还是调度：带宽受限就做算子融合与量化降访存；算力受限就提升算术强度、用专用指令（Tensor Core/MMA）；调度受限就做异步流水、双缓冲与多流并行。用 MFU=实际 FLOPs/峰值 FLOPs 量化目标。",
  "approach": "采用\"测量→归因→对症优化\"的闭环：先定位瓶颈类型（compute/bandwidth/scheduling），再分别用融合、量化、专用指令、流水隐藏等手段，最后用利用率指标验证。",
  "explanationFocus": "是什么：算力利用率（如 MFU/HFU）衡量实际达到的浮点吞吐占硬件峰值的比例，是评价芯片适配质量的核心指标。",
  "bruteForce": "朴素优化：不加分析地全局融合或盲目上更低精度，结果某些层反而变慢，且无法解释瓶颈来源。",
  "invariant": "任何优化都不得改变模型数值语义（在允许误差内），即利用率提升必须建立在\"输出一致\"的约束上。",
  "walkthrough": "以大模型推理为例：profiler 显示 MFU 仅 25% 且 HBM 带宽打满 → 做权重 INT8 量化降访存 → 融合 attention 子结构 → 启用双缓冲隐藏剩余延迟 → MFU 升至 50%+。",
  "complexity": "诊断本身为 O(profile 采样) 的一次性成本；优化收益取决于瓶颈类型，融合/量化通常把受限段常数因子显著降低，无法改变算法渐近复杂度。",
  "beginnerSummary": "算力利用率像工厂开工率：先查是机器慢、原料供不上还是调度乱，再对症修；MFU 就是\"实际产出/满产产能\"。",
  "diagram": "Profiler\n  | bottleneck?\n  v\n[Compute] -> use Tensor instr\n[Bandwidth] -> fuse + quant\n[Schedule] -> pipeline + multi-stream",
  "code": "def mfu(actual_flops, peak_flops, time_s):\n    if time_s <= 0:\n        return 0.0\n    return actual_flops / (peak_flops * time_s)",
  "derivation": [
    "为什么需要：硬件标称峰值常远高于实测吞吐，利用率低意味着钱花在设备上却没换来性能，必须系统性定位浪费来源。",
    "怎么实现：用 profiler 拆解时间到计算/访存/同步，按 Roofline 判定瓶颈，再分别用融合降访存、量化/专用指令提强度、异步流水与多流隐藏延迟来提升。",
    "有什么代价：优化常相互制约（融合增内存、量化损精度、多流增显存），需在做取舍时回归精度与容量预算。",
    "怎么评测：用 MFU/HFU、带宽利用率与端到端时延/吞吐评测；以\"相同精度下时延下降\"作为优化有效的判据。"
  ],
  "edgeCases": [
    "小 batch 场景：计算强度低，利用率天然受限，靠增大 batch 或算子融合改善。",
    "稀疏/结构化跳过：启用稀疏加速后 MFU 计算口径需对齐硬件实际生效的 FLOPs。",
    "多租户争用：共享芯片时利用率被邻居干扰，需隔离或 QoS。",
    "精度混合：FP16 与 INT8 峰值不同，MFU 分母要按实际数据类型取对应峰值。"
  ],
  "pitfalls": [
    "只看吞吐不看利用率：高吞吐可能来自大 batch 而非高效适配，掩盖真实低利用率。",
    "优化错瓶颈：带宽是瓶颈时去优化计算指令，毫无收益。"
  ],
  "prerequisites": [
    "Roofline 模型与算术强度",
    "性能 profiling 与瓶颈归因方法"
  ],
  "workedExample": [
    "示例1：profiler 显示带宽打满，做 Conv+BN 融合与 INT8 权重，MFU 从 20% 升到 45%。",
    "示例2：解码阶段启用双缓冲与多流，计算单元气泡从 35% 降到 8%。"
  ],
  "lineByLine": [
    "def mfu(actual_flops, peak_flops, time_s): 计算利用率，入参为实际 FLOPs、峰值 FLOPs 与耗时（秒）。",
    "if time_s <= 0: return 0.0 防御除零。",
    "return actual_flops / (peak_flops * time_s) 用实际吞吐除以峰值吞吐得到 MFU。"
  ],
  "codeNotes": [
    "MFU 分母必须用与数据类型对应的峰值 FLOPs，否则跨精度比较会失真。"
  ],
  "followUps": [
    {
      "question": "MFU 和 HFU（硬件利用率）有何区别？",
      "answer": "MFU 用模型有效 FLOPs 作分子，反映算法层面的利用率；HFU 用硬件实际发出的指令 FLOPs，包含冗余/重算，通常更高，二者差值揭示框架开销。"
    },
    {
      "question": "小 batch 下利用率低，是否一定要增大 batch？",
      "answer": "不一定。增大 batch 改善强度但增加时延与显存，端侧/低时延场景更可用算子融合、量化与流水来在不增大 batch 的前提下提利用率。"
    }
  ],
  "followUpAnswers": [
    "MFU 用模型有效 FLOPs 作分子反映算法层利用率；HFU 用硬件实际发出 FLOPs 含冗余，通常更高，差值揭示框架开销。",
    "不一定。增大 batch 改善强度但增加时延与显存，低时延场景可用融合/量化/流水在不增 batch 下提利用率。"
  ],
  "kind": "concept"
};
