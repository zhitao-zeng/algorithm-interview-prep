export default {
  "kind": "concept",
  "id": "mm-deploy",
  "category": "多模态模型",
  "difficulty": "Hard",
  "title": "部署：视觉编码器与 LLM 协同",
  "prompt": "线上部署多模态模型时，视觉编码器和 LLM 该怎么协同部署才高效？",
  "quickAnswer": "部署要点：视觉编码器与 LLM 可分开服务——编码器(常更小)做图像→token 的离线/前置计算并可缓存；LLM 负责生成。用批处理、KV 缓存、编码器量化(INT8/FP8)、Tokenizer 并行、以及把视觉 token 预计算后复用(同图多问)来降本。还要处理变长视觉 token 的 padding 与动态 batch。",
  "approach": "编码器前置+缓存 → LLM 批生成+KV缓存 → 量化/分离部署 → 同图复用。",
  "explanationFocus": "是什么：视觉编码器与 LLM 协同部署是把图像转 token 的前置计算与语言生成解耦，通过分离服务、缓存、量化与批处理实现高吞吐低延迟。",
  "bruteForce": "每次请求都重跑整条链路：重复编码、浪费算力。",
  "derivation": [
    "为什么需要：线上要并发、低延迟、低成本，重复编码与同步阻塞会拖垮吞吐。",
    "怎么实现：图像编码前置(可异步/队列)，视觉 token 缓存供多轮/多问复用；LLM 独立扩缩容并开 KV 缓存与连续批处理；编码器量化降显存。",
    "有什么代价：分离带来一致性/版本管理复杂度；缓存需键管理与失效；变长视觉 token 需动态 padding。",
    "怎么评测：吞吐(QPS)、P99 延迟、单请求成本、缓存命中率。"
  ],
  "invariant": "同一图像编码结果可缓存复用，且不影响最终生成一致性。",
  "walkthrough": "同图 10 问：编码 1 次缓存，10 次 LLM 生成复用视觉 token，编码成本降为 1/10。",
  "edgeCases": [
    "同图多分辨率需分别缓存。",
    "动态 batch 中视觉 token 长度不一。",
    "模型版本升级需清缓存。"
  ],
  "code": "def serve(image, question, cache, encoder, llm):\n    key = hash(image, enc_version)\n    vt = cache.get(key) or cache.set(key, encoder(image))   # 编码缓存\n    return llm.generate(concat(vt, question))               # 复用视觉 token",
  "codeNotes": [
    "编码缓存是同图多问关键优化。",
    "版本号纳入缓存键防不一致。"
  ],
  "complexity": "编码 O(V^2) 一次；LLM 生成随问数线性但共享视觉 token。",
  "followUps": [
    {
      "question": "为什么把编码器前置缓存？",
      "answer": "图像编码是确定且可复用的，同图多次提问只编码一次，显著降低总成本与首 token 延迟。"
    },
    {
      "question": "变长视觉 token 怎么批处理？",
      "answer": "用动态 padding/打包(packing)与连续批处理，避免被最长序列拖慢。"
    }
  ],
  "followUpAnswers": [
    "同图复用、降本提速。",
    "动态 padding/打包批处理。"
  ],
  "pitfalls": [
    "每请求重编码浪费算力。",
    "缓存键忽略分辨率/版本致错答。"
  ],
  "beginnerSummary": "部署就像餐厅后厨：看图翻译(编码)这活儿可提前做好并存着，同一张图被问十次只翻一次(缓存)；写答案的大厨(LLM)单独排班、能同时接多单。把\"翻译\"和\"写答案\"分开、复用、批量，餐厅才能又快又省。",
  "prerequisites": [
    "图像编码确定可缓存。",
    "LLM 生成可批处理。",
    "需降延迟与成本。"
  ],
  "workedExample": [
    "同图 10 问编码仅 1 次。",
    "编码器 FP8 量化省显存。"
  ],
  "lineByLine": [
    "图像编码前置并缓存。",
    "视觉 token 供多问复用。",
    "LLM 独立扩缩+KV缓存。",
    "量化与动态批处理降本。"
  ],
  "diagram": "图像 ─▶ 编码器(前置/缓存) ─▶ 视觉token ─┐\n                                          ├─▶ LLM批生成(复用)\n提问 ───────────────────────────────────┘"
};
