export default {
  "kind": "concept",
  "id": "rec-realtime",
  "category": "搜索推荐",
  "difficulty": "Medium",
  "title": "实时推荐 / 流处理",
  "prompt": "推荐系统的实时推荐 / 流处理是什么？",
  "quickAnswer": "实时推荐指用户刚产生行为就尽快反映到下一次推荐（分钟/秒级），依赖流处理（Flink/Kafka）实时更新用户特征与画像、刷新物品统计与召回。它让推荐\"跟手\"，提升时效性与转化；挑战是流批一致性、延迟与特征新鲜度。",
  "approach": "行为日志 → 流处理实时算特征 → 更新特征存储 → 下次请求即用。",
  "explanationFocus": "是什么：实时推荐用流处理把用户刚发生的行为秒级汇入特征与画像，使下一刷推荐立刻反映最新兴趣。",
  "bruteForce": "只用 T+1 离线特征：用户刚点完，下一刷还按旧兴趣推，时效差。",
  "derivation": [
    "为什么需要：兴趣随时变，离线特征滞后让用户感觉\"推荐不懂我\"。",
    "怎么实现：行为进 Kafka，Flink 实时算滑动窗口统计/更新兴趣向量，写入特征存储；线上读取近实时特征重新召回/排序。",
    "有什么代价：流计算与离线口径需一致，否则线上线下漂移；延迟与正确性权衡。",
    "怎么评测：看特征新鲜度(行为到可用时延)、实时通道对 CTR/时长的提升。"
  ],
  "invariant": "实时特征的语义必须与离线特征同源，仅时间窗口更短。",
  "walkthrough": "用户点击→Kafka→Flink 5s 内更新兴趣向量→特征存储→下个请求读取新向量召回 top。",
  "edgeCases": [
    "流批口径不一致：AB 掉点难查。",
    "迟到/乱序数据：需 watermark。",
    "实时写入失败：需降级到离线。"
  ],
  "code": "# Python (思路)\ndef on_event(ev, flink, store):\n    feat = flink.update_window(ev.user, ev, window='5m')  # 实时统计\n    store.put('rt:' + str(ev.user), feat)         # 写特征存储\ndef serve(user, store, recall):\n    rt = store.get('rt:' + str(user))             # 读近实时特征\n    return recall(user, rt)",
  "codeNotes": [
    "Kafka+Flink 做实时管道。",
    "特征存储统一读写。"
  ],
  "complexity": "流处理 O(事件率·窗口)；线上读取 O(特征存储)，端到端延迟由管道决定(秒级)。",
  "followUps": [
    {
      "question": "流处理和离线特征怎么保持一致？",
      "answer": "用同一套特征定义(特征平台)，离线按天、实时按滑动窗口算同一语义；以离线为基准校验实时，避免口径漂移。"
    },
    {
      "question": "实时推荐延迟一般做到多少？",
      "answer": "从行为到影响推荐常见秒级到分钟级：特征更新亚分钟，召回/排序重算在请求时完成；越实时越贵，按场景取舍。"
    }
  ],
  "followUpAnswers": [
    "同源语义防漂移。",
    "实时特征秒级生效。"
  ],
  "pitfalls": [
    "实时离线口径不一致。",
    "忽略乱序/迟到致统计错。"
  ],
  "beginnerSummary": "你刚点赞了一个烘焙视频，下一秒刷到更多烘焙——这就是实时推荐。背后有根\"传送带\"(流处理)：你的每次点击立刻被小工(Flink)统计进你的兴趣档案，下次刷视频时系统就读最新档案。相比\"今晚才更新明天才变\"(离线)，实时让你感觉\"它秒懂我\"。",
  "prerequisites": [
    "兴趣随时变需快速反映。",
    "存在流处理与特征存储。",
    "流批语义需一致。"
  ],
  "workedExample": [
    "点击经 Kafka 进 Flink 5s 内更新特征。",
    "下个请求读近实时特征重新召回。"
  ],
  "lineByLine": [
    "行为进消息队列。",
    "流处理实时算特征。",
    "写特征存储。",
    "请求时读取重召回。"
  ],
  "diagram": "用户行为 ─▶ Kafka ─▶ Flink(窗口) ─▶ 特征存储\n                                          ▲\n下次请求 ──读取──┘"
};
