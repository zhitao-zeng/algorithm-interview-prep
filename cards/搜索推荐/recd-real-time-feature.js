export default {
  "id": "recd-real-time-feature",
  "kind": "concept",
  "category": "搜索推荐",
  "title": "实时特征与样本拼接：线上线下一致性",
  "difficulty": "Hard",
  "prompt": "推荐系统的实时特征（用户最近行为、实时 embedding）如何生产与拼接？如何保证线上线下特征一致性，并处理 label 延迟？",
  "quickAnswer": "实时特征靠流式窗口(如 Flink)聚合用户近 N 分钟行为并写特征库；样本拼接需把曝光请求时点的特征与延迟回传的 label 对齐。线上线下一致性靠同一套特征 SDK/快照，label 延迟用归因窗口与回刷解决。",
  "code": "def build_sample(req_features, action_log, label_window=3600):\n    # 以请求时刻特征为准，回查窗口内动作作为 label\n    feat_snapshot = req_features.copy()      # 推理时点快照\n    label = 0\n    for act in action_log:\n        if 0 < act.ts - req_features.ts <= label_window:\n            label = 1                          # 窗口内转化记正\n    return feat_snapshot, label              # 特征与 label 解耦拼接",
  "complexity": "O(M) 回查 (M 窗口内动作)",
  "beginnerSummary": "用户刚看完一个视频，下一刷就该体现这个偏好。实时特征就是\"把刚才的行为立刻用上\"，而样本拼接要保证训练时用的特征和当时线上看的一致。",
  "explanationFocus": "是什么：实时特征与样本拼接指在推荐链路中低延迟地生产用户/物品近期行为特征，并将\"请求时点特征\"与\"延迟回传 label\"正确对齐，保证训练与serving特征一致性的工程体系。",
  "approach": "流式计算近实时行为特征写入在线存储；推理时同一 SDK 取特征并落快照；离线以请求快照+回查 label 窗口拼接训练样本；用特征监控与回放校验消除穿越与时点不一致。",
  "derivation": [
    "为什么需要：静态天级特征滞后，无法捕捉当下兴趣；label 延迟导致正负样本错位。",
    "怎么实现：Flink 窗口聚合→特征库；请求落快照；回查归因窗口打 label。",
    "有什么代价：流式链路复杂、一致性校验成本高，label 回刷引入重算。",
    "怎么评测：特征一致性 diff 率、label 归因准确率、离线在线指标 gap。"
  ],
  "edgeCases": [
    "label 延迟超过默认窗口导致漏标正样本。",
    "特征库读取超时降级到旧值引入噪声。",
    "同一请求多路重试造成重复曝光需去重。"
  ],
  "pitfalls": [
    "训练用 T+1 特征而线上用实时特征，造成穿越。",
    "忽略 label 延迟把未转化误当负例。"
  ],
  "prerequisites": [
    "流式计算(Flink/Kafka)基础",
    "特征存储与在线 serving"
  ],
  "workedExample": [
    "用户 10:00 曝光视频，10:05 点击；label_window=3600 内回查到点击 → label=1。",
    "训练样本使用 10:00 请求时点特征快照(含当时近 5 分钟行为)，与点击 label 拼接，避免用 10:05 才产生的特征造成穿越。"
  ],
  "lineByLine": [
    "def build_sample：构造训练样本。",
    "feat_snapshot = req_features.copy：保存推理时点特征防穿越。",
    "for act in action_log：回查窗口内动作。",
    "if 0<dt<=window: label=1：在归因窗口内记正样本。"
  ],
  "followUps": [
    {
      "question": "线上线下特征不一致最常见的根因？",
      "answer": "同一特征在训练(离线SQL)与线上(实时服务)实现逻辑不同，或时间戳/窗口边界不一致，导致穿越与离线在线 gap。"
    },
    {
      "question": "label 延迟怎么处理才不误导模型？",
      "answer": "设足够长的归因窗口并做回刷，对未到窗口的样品延迟打标或暂存，避免把\"还没转化\"误判为负。"
    }
  ],
  "followUpAnswers": [
    "同一特征在训练(离线SQL)与线上(实时服务)实现逻辑不同，或时间戳/窗口边界不一致，导致穿越与离线在线 gap。",
    "设足够长的归因窗口并做回刷，对未到窗口的样品延迟打标或暂存，避免把\"还没转化\"误判为负。"
  ],
  "order": 25
};
