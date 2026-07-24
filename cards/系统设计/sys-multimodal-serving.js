export default {
  "id": "sys-multimodal-serving",
  "kind": "concept",
  "category": "系统设计",
  "title": "多模态模型服务架构",
  "difficulty": "Hard",
  "prompt": "如何设计支撑图文/视频的多模态模型在线服务架构？",
  "quickAnswer": "多模态服务把预处理(解码/resize/OCR/抽帧)与模型推理解耦成流水线，用队列削峰与动态批处理提升吞吐，结合结果缓存与分级降级保障稳定性。视频需抽帧与异步处理控制成本。",
  "explanationFocus": "是什么：多模态模型服务架构是把图像/文本/视频联合模型以流水线方式在线提供预测的系统，重点解决预处理重、算力贵与流量突发下的稳定服务。",
  "approach": "把解码、抽帧、resize、文本分词等预处理前置成独立服务；主模型做 dynamic batching；用消息队列做异步与削峰；对重复请求做结果缓存；超时或过载时分级降级(跳过视频帧/返回缓存)。监控吞吐、队列深度与 GPU 利用率。",
  "code": "def preprocess(item):\n    # 多模态预处理流水线\n    frames = sample_frames(item.video, n=8) if item.video else []\n    return encode_text(item.text), resize(item.image), frames\n\ndef serve(req, cache):\n    key = hash(req.item)\n    return cache.get(key) or model.infer(preprocess(req.item))",
  "complexity": "O(帧数×模型) 视频 / O(batch) 吞吐",
  "beginnerSummary": "多模态模型既要看图又要读文，处理前得先把图解码、视频抽几帧、文字分词，这些准备很费时。于是把准备工作和模型分开排成流水线，攒批一起算，并加缓存和降级保证不卡死。",
  "derivation": [
    "为什么需要：多模态输入预处理重且异构，直接耦合推理会拖垮延迟与吞吐。",
    "怎么实现：预处理独立化、dynamic batching、队列异步削峰、结果缓存与分级降级。",
    "有什么代价：流水线拉长尾延迟，抽帧增加算力，缓存有一致性与命中率挑战。",
    "怎么评测：吞吐(QPS)、P99 延迟、GPU 利用率、缓存命中率与降级率。"
  ],
  "edgeCases": [
    "超长视频抽帧过多撑爆显存，需按长度自适应抽帧数。",
    "重复热门素材反复计算，靠结果缓存命中降本。",
    "预处理节点故障导致主模型饿死，需背压与隔离。"
  ],
  "pitfalls": [
    "把重预处理放在推理主路径，导致 GPU 长期等待数据。",
    "降级策略过激直接跳过多模态信号，效果断崖。"
  ],
  "prerequisites": [
    "多模态模型推理流程",
    "dynamic batching 与队列削峰",
    "缓存与降级设计"
  ],
  "workedExample": [
    "场景：图文短视频理解服务，峰值 8000 QPS。",
    "预处理服务抽 8 帧+分词，主模型 batch=32 动态聚合，GPU 利用率 75%。",
    "热门素材缓存命中率 40%，过载时跳过视频帧降级，P99 守在 50ms。"
  ],
  "lineByLine": [
    "def preprocess(...)：对视频抽帧、图像 resize、文本编码，统一成模型输入张量。",
    "def serve(...)：先按 item 哈希查缓存，未命中才走预处理+推理，降低重复计算。"
  ],
  "followUps": [
    {
      "question": "视频多模态服务如何控制成本？",
      "answer": "用关键帧采样而非全帧、动态抽帧数随视频长度调整、结果缓存命中热门，以及 dynamic batching 提升 GPU 利用率，多重手段压低成本。"
    },
    {
      "question": "多模态服务的降级怎么做才不影响体验？",
      "answer": "分级降级：先跳过视频帧只用图文，再退回纯文本或缓存结果，保证可用性的同时尽量保留信号，避免直接失败。"
    }
  ],
  "followUpAnswers": [
    "用关键帧采样而非全帧、动态抽帧数随视频长度调整、结果缓存命中热门，以及 dynamic batching 提升 GPU 利用率，多重手段压低成本。",
    "分级降级：先跳过视频帧只用图文，再退回纯文本或缓存结果，保证可用性的同时尽量保留信号，避免直接失败。"
  ]
};
