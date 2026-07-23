export default {
  "kind": "concept",
  "id": "onnx-trt-llm-intro",
  "category": "ONNX/TensorRT",
  "difficulty": "Hard",
  "title": "TRT-LLM 简介",
  "prompt": "TRT-LLM 是什么，为什么大模型部署要用它而不是直接用 TensorRT？",
  "quickAnswer": "TRT-LLM 是 NVIDIA 面向大语言模型(LLM)的高性能推理库，基于 TensorRT 构建并针对 Transformer 做了专门优化：如高效的 KV-Cache 管理、连续批处理(continuous batching)、融合的 attention 内核、量化(FP8/INT4/AWQ)等；直接用通用 TRT 难高效表达自回归生成与动态 KV-Cache，故用专门库。",
  "approach": "模型(如 LLaMA)经 TRT-LLM 构建 → 优化 attention/KV-Cache/批处理 → 用其 runtime 做生成式推理。",
  "explanationFocus": "是什么：TRT-LLM 是建立在 TensorRT 之上、专为 LLM 自回归生成优化的推理库。",
  "bruteForce": "用通用 TRT 逐 token 跑 attention：KV-Cache 与批处理低效。",
  "derivation": [
    "为什么需要：LLM 有长序列、KV-Cache、变长生成，通用 TRT 不原生优化这些。",
    "怎么实现：TRT-LLM 提供 LLM 友好的 API 与融合算子，底层仍编译为 TRT engine。",
    "有什么代价：模型支持列表有限、构建复杂、显存占用大需分片。",
    "怎么评测：测吞吐(token/s)、首 token 延迟(TTFT)、多请求并发与精度(困惑度)。"
  ],
  "invariant": "TRT-LLM 输出分布应与参考实现(如 HF)在采样前 logits 一致。",
  "walkthrough": "LLaMA-7B 经 TRT-LLM FP16：单卡吞吐较 HF 原生约 3×，continuous batching 下并发提升明显。",
  "edgeCases": [
    "超长上下文需分页 KV-Cache(paged attention)。",
    "多卡需 tensor/pipeline 并行。",
    "量化(INT4/AWQ)需对应权重预处理。"
  ],
  "code": "# Python (概念)：TRT-LLM 构建示意\ndef build_llm_engine(model_dir):\n    from tensorrt_llm import Builder\n    builder = Builder()\n    # 定义 LLM 网络(FP16/量化)、KV-Cache 与并行策略\n    engine = builder.build(model_dir, precision='fp16',\n                           kv_cache='paged', mapping={'tp': 1})\n    return engine",
  "codeNotes": [
    "底层仍是 TRT engine。",
    "KV-Cache 管理是核心。"
  ],
  "complexity": "构建复杂 O(模型规模)；推理针对生成优化。",
  "followUps": [
    {
      "question": "TRT-LLM 和通用 TensorRT 关系？",
      "answer": "TRT-LLM 在通用 TRT 之上加了 LLM 专属优化与运行时，最终仍产出 TRT engine。"
    },
    {
      "question": "continuous batching 是什么？",
      "answer": "把不同请求在不同解码步动态拼批，提升 GPU 利用率，是 LLM 高吞吐关键。"
    }
  ],
  "followUpAnswers": [
    "TRT-LLM 基于 TRT 之上。",
    "连续批处理提升利用率。"
  ],
  "pitfalls": [
    "把 TRT-LLM 当通用 CV 推理库——它专注 LLM。",
    "忽略 KV-Cache 显存导致 OOM。"
  ],
  "beginnerSummary": "TRT-LLM 像在通用工厂(TRT)里专门给\"写长文章\"装的流水线：它懂得边写边记住前面写过的段落(KV-Cache)、把多人的稿子穿插着一起排(连续批处理)，而通用工厂原本不擅长这种边写边改的活。",
  "prerequisites": [
    "LLM 是自回归生成。",
    "KV-Cache 是性能关键。",
    "通用 TRT 不善表达生成。"
  ],
  "workedExample": [
    "LLaMA-7B 用 TRT-LLM FP16 构建。",
    "吞吐较 HF 约 3×，并发显著提升。"
  ],
  "lineByLine": [
    "用 TRT-LLM 定义 LLM 网络。",
    "配置 KV-Cache 与并行策略。",
    "build 出底层 TRT engine。",
    "用其 runtime 做生成推理。"
  ],
  "diagram": "LLM ─▶ TRT-LLM(融合Attn/KV-Cache/批处理) ─▶ TRT engine"
};
