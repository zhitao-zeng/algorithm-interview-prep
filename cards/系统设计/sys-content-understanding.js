export default {
  "id": "sys-content-understanding",
  "kind": "concept",
  "category": "系统设计",
  "title": "内容理解 Pipeline 设计",
  "difficulty": "Medium",
  "prompt": "如何设计一套多模态内容理解 pipeline，把图文/视频转成可被召回与排序使用的特征？",
  "quickAnswer": "内容理解 pipeline 将原始多模态素材经离线/近线/在线三层抽取成结构化标签与向量。离线做重模型批处理建库，近线做增量更新，在线做轻量实时补全。产出统一特征服务供召回与排序复用。",
  "explanationFocus": "是什么：内容理解 pipeline 是一套把原始图文/视频转成结构化标签、 embedding 与质量分的特征生产链路，让推荐系统的召回与排序能“读懂”物料。",
  "approach": "分层处理：离线用重多模态模型批量抽取全量物料特征入特征库；近线消费素材变更事件做增量更新；在线对极新物料用轻模型实时补特征。统一特征服务(Feature Store)对外提供低延迟读取，并保证训练与推理特征口径一致。",
  "code": "def extract_features(item, model, mode='offline'):\n    # 多模态特征抽取：文本/图像/视频融合\n    vec = model.encode(item.text, item.image)\n    tags = model.classify(item)\n    return {'vec': vec, 'tags': tags, 'ts': now()}\n\ndef serve(item_id):\n    # 在线读取统一特征\n    return feature_store.get(item_id)",
  "complexity": "O(物料规模) 离线 / O(1) 在线读取",
  "beginnerSummary": "系统需要先“看懂”每个视频或图文讲了什么。我们用模型把素材变成一组标签和向量(类似给它贴关键词和坐标)，再存进一个公共仓库，召回和排序都能来查。",
  "derivation": [
    "为什么需要：推荐要匹配用户兴趣与物料内容，必须先把非结构化的多模态素材变成可计算的特征。",
    "怎么实现：分层抽取——离线重模型全量建库、近线增量更新、在线轻模型补新，统一经 Feature Store 对外服务。",
    "有什么代价：重模型算力昂贵、链路长带来特征新鲜度延迟，多模态对齐与版本管理复杂。",
    "怎么评测：用特征覆盖度、标签准确率、下游召回/排序增益与特征新鲜度(P95 更新延迟) 衡量。"
  ],
  "edgeCases": [
    "刚发布的极新物料尚未来得及离线建特征，需在线轻模型兜底避免无特征可用。",
    "视频长时长抽取成本高，需关键帧采样与分段聚合降成本。",
    "多语言/低质量素材识别不准，需质量分过滤与人工校验回流。"
  ],
  "pitfalls": [
    "训练用离线重特征、服务用在线轻特征，导致训练-服务特征不一致(特征穿越)。",
    "把所有计算堆在在线链路，拖垮推荐主路径延迟。"
  ],
  "prerequisites": [
    "多模态表示学习(图文/视频 embedding)",
    "Feature Store 与特征一致性概念",
    "流式消息队列(Kafka)基础"
  ],
  "workedExample": [
    "场景：短视频平台每日新增 1000 万条，需为每条产出内容向量与标签。",
    "离线 Spark 批跑多模态大模型，产出向量写入特征库(小时级)；近线消费上传事件做分钟级增量。",
    "新视频上线 30 秒内由在线轻模型补特征，召回即可命中。"
  ],
  "lineByLine": [
    "def extract_features(...)：对单条物料调用多模态模型，融合文本与图像编码得到向量并打标签，附带时间戳。",
    "def serve(...)：在线直接按 item_id 从 Feature Store 读取已计算好的特征，做到 O(1) 低延迟。"
  ],
  "followUps": [
    {
      "question": "离线特征和在线特征不一致会带来什么问题？",
      "answer": "会造成训练-服务偏差(特征穿越)，离线评测指标好但线上效果差，是推荐系统最隐蔽的坑之一，需用统一 Feature Store 与 Same-Code 抽取规避。"
    },
    {
      "question": "为什么需要近线层而不只靠离线？",
      "answer": "纯离线有小时级延迟，新物料无法及时被推荐；近线消费变更事件做分钟级增量更新，兼顾成本与新鲜度。"
    }
  ],
  "followUpAnswers": [
    "会造成训练-服务偏差(特征穿越)，离线评测指标好但线上效果差，是推荐系统最隐蔽的坑之一，需用统一 Feature Store 与 Same-Code 抽取规避。",
    "纯离线有小时级延迟，新物料无法及时被推荐；近线消费变更事件做分钟级增量更新，兼顾成本与新鲜度。"
  ]
};
