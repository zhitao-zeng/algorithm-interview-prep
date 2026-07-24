export default {
  "kind": "concept",
  "id": "mm-latency",
  "category": "多模态模型",
  "difficulty": "Medium",
  "title": "端到端多模态推理延迟",
  "prompt": "多模态模型端到端推理里，图像编码开销占多大，怎么分析？",
  "quickAnswer": "端到端延迟 = 图像预处理 + 视觉编码器前向 + 连接器 + LLM 自回归(含视觉 KV)。视觉编码器是一次性固定开销，而 LLM 自回归随输出长度增长；视觉 token 多会拉长 LLM 的每步注意力(KV 缓存)。分析时要拆分各段耗时，优化常落在减小视觉 token 数、量化编码器、或并行预处理与首 token。",
  "approach": "拆段计时(预处理/编码/连接/LLM) → 定位瓶颈 → 减 token/量化/并行。",
  "explanationFocus": "是什么：端到端多模态推理延迟分析是把一次问答的总耗时拆成图像预处理、视觉编码、连接器与 LLM 生成几段，找出瓶颈并优化。",
  "bruteForce": "只测总时长不拆分：不知该优化哪。",
  "derivation": [
    "为什么需要：延迟决定体验与成本，多模态比纯文本多了视觉链路，必须量化各部分占比。",
    "怎么实现：对各阶段打点计时；视觉编码是一次 O(V^2) 固定成本，LLM 是输出长度相关的自回归成本，视觉 token 还增大每步 KV。",
    "有什么代价：减 token 可能损精度；量化编码器略降质量；并行受数据依赖限制(编码须先于 LLM)。",
    "怎么评测：分段 P50/P99 延迟、吞吐、质量-延迟 Pareto。"
  ],
  "invariant": "相同输入与配置下各段耗时稳定可复现。",
  "walkthrough": "总 1.2s：预处理 0.05s + ViT 0.25s + 连接 0.01s + LLM(100 token) 0.89s。",
  "edgeCases": [
    "长输出时 LLM 主导，视觉占比变小。",
    "高分辨率切图使编码占比上升。",
    "batch 推理时共享编码降本。"
  ],
  "code": "def profile(model, img, prompt):\n    t0 = now(); v = encode_image(img)          # 视觉编码\n    t1 = now(); h = connector(v)               # 连接\n    t2 = now(); out = llm_generate(h, prompt)  # 自回归\n    t3 = now()\n    return {'enc': t1-t0, 'conn': t2-t1, 'llm': t3-t2}",
  "codeNotes": [
    "编码与 LLM 是两段主要成本。",
    "视觉 token 数放大 LLM 每步。"
  ],
  "complexity": "编码 O(V^2)；LLM 自回归 O(L·(T+V)^2) 近似。",
  "followUps": [
    {
      "question": "视觉编码和 LLM 哪个更慢？",
      "answer": "短输出时编码占比明显；长输出时 LLM 自回归随长度主导，但视觉 token 仍放大每步成本。"
    },
    {
      "question": "怎么降延迟？",
      "answer": "减视觉 token 数、量化/蒸馏编码器、缓存重复图像编码、并行预处理与首 token 生成。"
    }
  ],
  "followUpAnswers": [
    "取决于输出长度。",
    "减 token/量化/缓存/并行。"
  ],
  "pitfalls": [
    "只盯总延迟不拆分瓶颈。",
    "为降延迟过度减 token 损精度。"
  ],
  "beginnerSummary": "一次看图问答像做菜：洗切(预处理)、炒菜(视觉编码)、装盘(连接)、慢慢摆盘解说(LLM 一字字生成)。洗切炒菜是一次性固定功夫，解说越长越费时；图越清楚(切片多)炒菜越久。要先分别掐表才知道该优化哪步。",
  "prerequisites": [
    "多模态比文本多视觉链路。",
    "LLM 自回归随输出增长。",
    "需分段定位瓶颈。"
  ],
  "workedExample": [
    "总 1.2s 拆为 enc0.25/conn0.01/llm0.89。",
    "长输出时 LLM 主导。"
  ],
  "lineByLine": [
    "分段打点计时。",
    "视觉编码是固定开销。",
    "LLM 随输出长度增长。",
    "按瓶颈优化 token/量化/并行。"
  ],
  "diagram": "输入 ─▶ 预处理 ─▶ 视觉编码 ─▶ 连接 ─▶ LLM生成\n   计时拆分各段 → 定位瓶颈"
};
