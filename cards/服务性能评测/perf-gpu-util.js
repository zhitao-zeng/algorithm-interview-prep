export default {
  "kind": "concept",
  "id": "perf-gpu-util",
  "category": "服务性能评测",
  "difficulty": "Hard",
  "title": "GPU 利用率评测（MFU / SM 占用）",
  "prompt": "如何评测 LLM 推理的 GPU 利用率，MFU 是什么？",
  "quickAnswer": "表层看 nvidia-smi 的 GPU-Util（时间片忙闲），但更关键的是 MFU（Model FLOPs Utilization）= 实际可达 FLOPs / 峰值 FLOPs，衡量算力被模型有效利用的程度。decode 受内存带宽限制、MFU 常很低（个位数%），prefill 才接近高 MFU；评测应区分阶段并看 MFU 与显存带宽利用率，定位瓶颈是算力还是带宽。",
  "approach": "评测方法：先用理论公式算 FLOPs（基于参数量与 token 数，乘性因子 2 来自矩阵乘每个输出元素一次乘加），除以实测耗时得到实际 TFLOPs，再除以峰值 TFLOPs 得 MFU；同时用 nsight/nvml 取 SM 占用、显存带宽利用率，结合阶段（prefill/decode）定位瓶颈。理想是\"prefill 高 MFU（算力瓶颈）、decode 认知其低 MFU 正常（带宽瓶颈）\"。",
  "explanationFocus": "是什么：GPU 利用率评测在大模型推理里要从\"表面忙不忙\"深入到\"算力有没有真被用满\"。表层看 nvidia-smi 的 GPU-Util（时间片上有没有 kernel 在跑），但更关键的是 MFU（Model FLOPs Utilization，模型浮点利用率）= 实际可达 FLOPs / 峰值 FLOPs，衡量算力被模型有效利用的程度。decode（逐 token 生成）阶段受内存带宽限制，MFU 常很低；prefill（处理输入）阶段才接近高 MFU。评测应区分阶段并看 MFU，而非仅看 Util。",
  "bruteForce": "只看 nvidia-smi 显示 100%：误以为满载高效，其实 GPU 可能在频繁访存、SM 大量空转等带宽，真实 MFU 仅个位数。这种\"假忙\"最容易被误读，导致优化方向完全错误（去优化算力而非带宽）。",
  "derivation": [
    "为什么需要：Util 高不代表高效，decode 频繁访存使 SM 空转等待权重，需 MFU 揭示真实算力利用；否则会误把\"假忙\"当\"高效\"。",
    "怎么实现：MFU = (2 × 参数量 × token数) / (峰值TFLOPs × 时长)；用 nsight/nvml 取 SM 占用与显存带宽，区分 prefill/decode 两阶段分别报告。",
    "有什么代价：精确 FLOPs 计数需知道算子实现细节（是否有融合、是否含激活）；decode 因 batch 小、访存主导，MFU 天然低，不能简单当作\"没优化好\"。",
    "怎么评测：分 prefill/decode 报告 MFU，结合显存带宽利用率定位瓶颈是算力还是带宽，再决定优化方向（提 batch/换 kernel 还是降访存）。"
  ],
  "invariant": "核心公式 MFU = 实际FLOPs / (峰值FLOPs × 时间)。判据：decode 阶段 MFU 低且显存带宽利用率高 → 带宽瓶颈；prefill 阶段 MFU 高 → 算力被用满。MFU 不是越高越好，decode 天然低属正常，关键在\"分阶段的合理解读\"。",
  "walkthrough": "具体算一笔账：以 7B 模型输出 1k token 为例，峰值算力 312 TFLOPs（fp16），耗时 4s。理论 FLOPs = 2 × 参数量 × token数 = 2 × 7e9 × 1e3 = 1.4e13 FLOPs；实际 TFLOPs = 1.4e13 / (4 × 1e12) ≈ 3.5 TFLOPs；MFU = 3.5 / 312 ≈ 1.1%。这正是典型 decode 阶段\"带宽受限\"的特征——GPU 灯亮着，但大部分时间在等权重从显存搬过来，算力几乎闲置。",
  "edgeCases": [
    "Util 高但 MFU 低的带宽瓶颈：灯亮工人等料，最典型也最易被误判。",
    "小 batch decode 张量未铺满：矩阵太\"瘦\"，GPU 并行度没用上，MFU 低属预期。",
    "kernel 启动开销拉低大 batch 效率：频繁小 kernel 的 launch 开销吃掉有效计算时间。",
    "多卡并行时单卡 MFU 掩盖通信墙：张量/流水并行引入的通信等待不体现在算力上。"
  ],
  "code": "# Python\ndef mfu(params, tokens, peak_tflops, seconds):\n    actual = 2 * params * tokens / (seconds * 1e12)   # TFLOPs\n    return actual / peak_tflops                        # 0..1\ndef gpu_util_busy(samples):\n    return sum(samples) / len(samples)",
  "codeNotes": [
    "decode 低 MFU 多因带宽非算力，优化方向是减访存（量化、KV 压缩、投机解码）而非堆算力。",
    "区分 prefill/decode 阶段评测，否则会把正常低 MFU 误判为问题。",
    "草图 mfu() 用理论公式估；真实评测还要 nvml 采带宽，二者结合才完整。"
  ],
  "complexity": "评测本身是 O(时长) 的采样 + 计数：记录耗时、用 nvml/nsight 采 SM 与带宽曲线，再用公式算 MFU；开销可忽略。难点不在计算而在\"正确归因\"——要把观测到的 MFU 与阶段、 batch 大小、kernel 效率对齐。",
  "followUps": [
    {
      "question": "MFU 低一定不好吗？",
      "answer": "decode 阶段天然低 MFU（受带宽限制），属正常，不代表没优化好；但 prefill 阶段低 MFU 说明 batch 太小或 kernel 差，值得优化。判断好坏必须先看阶段，不能一概而论。"
    },
    {
      "question": "怎么提升 MFU？",
      "answer": "提升有效 batch 让矩阵更胖、用更优融合 kernel 减少冗余读写、用张量并行把权重切小降低单卡访存、或用投机解码提升每步有效计算量。对 decode 主要是降访存而非提算力。"
    },
    {
      "question": "GPU-Util 和 MFU 该看哪个？",
      "answer": "都看但含义不同：Util 看\"忙不忙\"（时间片占用），MFU 看\"出力多少\"（算力利用）。定位瓶颈时 MFU + 带宽利用率更关键，单看 Util 极易误判为高效。"
    }
  ],
  "followUpAnswers": [
    "decode 阶段天然低 MFU（受带宽限制），属正常，不代表没优化好；但 prefill 阶段低 MFU 说明 batch 太小或 kernel 差，值得优化。判断好坏必须先看阶段，不能一概而论。",
    "提升有效 batch 让矩阵更胖、用更优融合 kernel 减少冗余读写、用张量并行把权重切小降低单卡访存、或用投机解码提升每步有效计算量。对 decode 主要是降访存而非提算力。",
    "都看但含义不同：Util 看\"忙不忙\"（时间片占用），MFU 看\"出力多少\"（算力利用）。定位瓶颈时 MFU + 带宽利用率更关键，单看 Util 极易误判为高效。"
  ],
  "pitfalls": [
    "把 GPU-Util 当效率：Util 只反映\"时间片上有没有活\"，不代表算力被有效使用，decode 常高 Util 低 MFU。",
    "不区分 prefill/decode 阶段：把 decode 的正常低 MFU 误认为优化不足，白做功。",
    "只看均值 MFU：长尾请求或偶发大 batch 会拉偏，应结合分位数与带宽曲线。"
  ],
  "beginnerSummary": "工厂比喻：Util 像\"机器灯亮着没闲着\"，MFU 像\"工人真在使劲干还是站着等物料\"。灯亮（Util 高）但工人老等零件（带宽瓶颈），实际产出（MFU）很低——光看灯亮会误以为高效。所以评测工厂不能只看灯，要看工人到底出了多少力。",
  "prerequisites": [
    "FLOPs 与峰值算力：理解矩阵乘 FLOPs ≈ 2×M×N×K，以及 GPU 标称峰值 TFLOPs 的含义。",
    "内存带宽瓶颈：明白 decode 每生成一个 token 都要读一遍全部权重，受显存带宽而非算力限制。",
    "prefill/decode 差异：知道两阶段计算特征不同，评测必须分开看。"
  ],
  "workedExample": [
    "decode MFU≈1.1% 的典型计算：7B 模型输出 1k token、峰值 312 TFLOPs、耗时 4s，实际仅 3.5 TFLOPs，MFU 约 1.1%，属带宽受限而非异常。",
    "prefill MFU 高才是算力利用好：输入 2k token 一次性矩阵乘，batch 大、访存可摊薄，MFU 可达 40%~70%，说明算力被吃满。",
    "对比：同一张卡，prefill MFU 60% 而 decode MFU 1%，定位到优化重点应放在\"降 decode 访存\"（如量化、投机解码）而非\"加算力\"。"
  ],
  "lineByLine": [
    "算理论 FLOPs：2 × 参数量 × token数，乘性 2 来自一次乘加。",
    "测实际耗时：用高精度计时（CUDA event）记录该阶段 wall-clock。",
    "求实际 TFLOPs 与 MFU：FLOPs / (秒 × 1e12) 再除峰值，得到利用率。",
    "结合带宽定位瓶颈：若 MFU 低且带宽利用率高→带宽瓶颈；MFU 高→算力用满。"
  ],
  "diagram": "GPU-Util(灯亮) ─┐\n                  ├─ 高Util低MFU → 带宽瓶颈\nMFU(真出力)  ─┘   高MFU        → 算力用满"
};
