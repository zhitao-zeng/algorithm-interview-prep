export default {
  "id": "gen-aigc-product-stack",
  "kind": "concept",
  "category": "生成式模型",
  "title": "AIGC 产品技术栈",
  "difficulty": "Medium",
  "prompt": "AIGC 产品技术栈（如文生图 / 文生视频管线）从 prompt 理解、多阶段生成到工程化部署的整体架构是怎样的？",
  "quickAnswer": "典型管线：① prompt 理解（LLM 改写/扩写、标签解析、安全过滤）；② 调度与条件组装（文本编码、控制条件）；③ 生成核心（LDM/DiT 多阶段：base+refiner 或 图生图/视频）；④ 后处理（超分、人脸修复、水印）；⑤ 工程化（模型服务、缓存、队列、GPU 批处理、流式与成本/时延优化）。各层解耦可独立迭代。",
  "code": "def aigc_pipeline(prompt):\n    p = llm_rewrite(prompt)            # prompt 理解/扩写\n    cond = text_enc(p); ctrl = parse_control(p)\n    img = base_model(cond, ctrl)       # 多阶段生成\n    img = refiner(img); img = upscale(img)\n    return watermark(safety_filter(img))",
  "complexity": "端到端 O(各阶段之和)",
  "beginnerSummary": "一键出图背后是一条流水线：先把你的话“翻译”成机器懂的要求，再分阶段画图、精修、质检、上线，每一环都能单独升级。",
  "explanationFocus": "是什么：AIGC 产品技术栈是把 prompt 理解、条件生成、后处理与工程部署串成可服务化管线的整体架构，决定体验、成本与稳定性。",
  "approach": "分层解耦：语义层（LLM 改写+安全）、生成层（多阶段扩散/Transformer）、质量层（超分/修复/水印）、服务层（推理优化、批处理、缓存、队列），以配置化串联并监控时延与成本。",
  "derivation": [
    "为什么需要：单模型难兼顾质量/速度/安全/成本，需系统拆分。",
    "怎么实现：模块化管线 + 阶段模型（base/refiner）+ 服务化。",
    "有什么代价：链路长增时延，需缓存与流式；多模型增显存成本。",
    "怎么评测：端到端时延、成本/图、成功率与质量指标全链路监控。"
  ],
  "edgeCases": [
    "prompt 含敏感词需前置安全拦截。",
    "高并发需请求排队与批量推理提吞吐。",
    "长视频需分段+异步流水线防超时。"
  ],
  "pitfalls": [
    "把生成模型当黑盒直接上线→缺安全与重试易崩。",
    "忽略缓存命中率→重复计算浪费成本。"
  ],
  "prerequisites": [
    "扩散 / Transformer 生成",
    "LLM 提示工程",
    "推理服务与 GPU 优化"
  ],
  "workedExample": [
    "用户 “一只戴帽子的猫” → LLM 扩写为带风格/构图的描述。",
    "文本编码 + 可选 ControlNet 姿态条件组装。",
    "base 模型出 512²，refiner 提质，ESRGAN 超分到 1024²。",
    "加水印与安全过滤后返回，端到端 <3s。"
  ],
  "lineByLine": [
    "llm_rewrite 把口语 prompt 结构化、补全细节。",
    "text_enc 与 parse_control 生成条件与可控信号。",
    "base_model 做主体生成，refiner/upscale 提质。",
    "最后安全过滤加水印保障合规与可追溯。"
  ],
  "followUps": [
    {
      "question": "base+refiner 为何分两阶段？",
      "answer": "base 控结构与语义、refiner 提细节，拆分可在质量与速度间灵活权衡。"
    },
    {
      "question": "如何降成本？",
      "answer": "提示缓存、批量推理、步数蒸馏（LCM）、模型量化与多卡调度。"
    },
    {
      "question": "流式生成怎么做？",
      "answer": "分阶段返回潜变量预览或逐步解码，配合进度与可中断设计。"
    }
  ],
  "followUpAnswers": [
    "base 控结构与语义、refiner 提细节，拆分可在质量与速度间灵活权衡。",
    "提示缓存、批量推理、步数蒸馏（LCM）、模型量化与多卡调度。",
    "分阶段返回潜变量预览或逐步解码，配合进度与可中断设计。"
  ]
};
