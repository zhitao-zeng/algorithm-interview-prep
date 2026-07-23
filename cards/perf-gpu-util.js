export default {
  "kind": "concept",
  "id": "perf-gpu-util",
  "category": "服务性能评测",
  "difficulty": "Hard",
  "title": "GPU 利用率评测（MFU / SM 占用）",
  "prompt": "如何评测 LLM 推理的 GPU 利用率，MFU 是什么？",
  "quickAnswer": "表层看 nvidia-smi 的 GPU-Util(时间片忙闲)，但更关键的是 MFU(Model FLOPs Utilization)=实际可达 FLOPs/峰值 FLOPs，衡量算力被模型有效利用的程度。decode 受内存带宽限制 MFU 常很低，prefill 才接近高 MFU；评测应区分阶段并看 MFU 而非仅看 Util。",
  "approach": "用理论 FLOPs(基于参数量与 token 数)除以实测耗时得实际 TFLOPs，再除峰值得 MFU；同时看 SM 占用与显存带宽。",
  "explanationFocus": "是什么：GPU 利用率评测从表面 GPU-Util 深入到 MFU(模型算力利用率)，揭示推理是否真把算力用满，decode 阶段常受带宽限制而 MFU 低。",
  "bruteForce": "只看 nvidia-smi 100%：误以为满载高效，其实可能在等显存带宽，MFU 仅个位数。",
  "derivation": [
    "为什么需要：Util 高不代表高效，decode 频繁访存使 SM 空转，需 MFU 看真实算力利用。",
    "怎么实现：MFU = (2×参数量×token数) / (峰值TFLOPs×时长)；用 nsight/nvml 取 SM 与带宽。",
    "有什么代价：精确 FLOPs 计数需知算子实现；decode 因 batch 小 MFU 天然低，属正常。",
    "怎么评测：分 prefill/decode 报告 MFU，结合显存带宽利用率定位瓶颈是算力还是带宽。"
  ],
  "invariant": "MFU = 实际FLOPs / (峰值FLOPs×时间)；decode MFU 低且带宽利用率高→带宽瓶颈，prefill MFU 高→算力瓶颈。",
  "walkthrough": "7B 模型输出 1k token，峰值 312 TFLOPs(fp16)，耗时 4s → 实际=2×7e9×1e3/4e12≈3.5 TFLOPs，MFU≈1.1%，典型 decode 带宽受限。",
  "edgeCases": [
    "Util 高但 MFU 低的带宽瓶颈。",
    "小 batch decode 张量未铺满。",
    "kernel 启动开销拉低大 batch 效率。"
  ],
  "code": "# Python\ndef mfu(params, tokens, peak_tflops, seconds):\n    actual = 2 * params * tokens / (seconds * 1e12)   # TFLOPs\n    return actual / peak_tflops                        # 0..1\ndef gpu_util_busy(samples):\n    return sum(samples) / len(samples)",
  "codeNotes": [
    "decode 低 MFU 多因带宽非算力。",
    "区分 prefill/decode 阶段评测。"
  ],
  "complexity": "O(时长) 采样 + 计数。",
  "followUps": [
    {
      "question": "MFU 低一定不好吗？",
      "answer": "decode 阶段天然低 MFU(带宽受限)，正常；但 prefill 低 MFU 说明批太小或 kernel 差，可优化。"
    },
    {
      "question": "怎么提升 MFU？",
      "answer": "增大有效 batch、用更优融合 kernel、张量并行摊薄、或投机解码提升每步有效计算。"
    }
  ],
  "followUpAnswers": [
    "decode 低 MFU 正常(带宽限)。",
    "提 MFU:大batch/融合kernel/并行。"
  ],
  "pitfalls": [
    "把 GPU-Util 当效率。",
    "不区分 prefill/decode 阶段。"
  ],
  "beginnerSummary": "工厂：Util 像\"机器灯亮着没闲着\"，MFU 像\"工人真在使劲干还是站着等物料\"。灯亮(Util高)但工人老等零件(带宽瓶颈)，实际产出(MFU)很低——光看灯亮会误以为高效。",
  "prerequisites": [
    "FLOPs 与峰值算力。",
    "内存带宽瓶颈。",
    "prefill/decode 差异。"
  ],
  "workedExample": [
    "decode MFU≈1.1% 典型带宽受限。",
    "prefill MFU 高才是算力利用好。"
  ],
  "lineByLine": [
    "算理论 FLOPs。",
    "测实际耗时。",
    "求实际 TFLOPs 与 MFU。",
    "结合带宽定位瓶颈。"
  ],
  "diagram": "GPU-Util(灯亮) ─┐\n                  ├─ 高Util低MFU → 带宽瓶颈\nMFU(真出力)  ─┘   高MFU        → 算力用满"
};
