export default {
  "id": "sysd-multimodal-feature-platform",
  "kind": "concept",
  "category": "系统设计",
  "title": "多模态特征平台：离线/近线/在线特征生产与在线服务架构",
  "difficulty": "Medium",
  "prompt": "在设计一个支撑多模态大模型训练与推理的特征平台时，如何组织离线、近线与在线三类特征的生产与在线服务架构？",
  "quickAnswer": "多模态特征平台把特征分为离线(批)、近线(分钟级流)、在线(实时)三类。离线用 Spark/Flink 批作业产出历史特征落特征库，近线用流计算近实时更新，在线通过 Feature Store 加低延迟 KV(Redis/Tair) 提供毫秒级读取。核心是用统一的特征注册表与同一套变换代码保证线上线下一致性，避免训练/serving 偏置。",
  "code": "from typing import Dict\n\nclass FeatureStore:\n    def __init__(self, offline, online):\n        self.offline = offline   # 离线特征仓库\n        self.online = online     # 在线低延迟 KV\n\n    def get(self, entity_id: str) -> Dict:\n        feat = self.online.get(entity_id)\n        if feat is None:\n            feat = self.offline.fetch(entity_id)\n        return feat",
  "complexity": "在线读取 O(1)，近线更新 O(吞吐量)",
  "beginnerSummary": "特征平台就像给模型准备食材的中央厨房：离线把大量历史食材提前做好冷藏，近线把刚到的食材快速处理，在线随时按需取用。关键是保证训练和上线时拿到的是同一种食材，不然模型会‘水土不服’。",
  "explanationFocus": "是什么：多模态特征平台是统一管理图像、文本、音频等多模态特征从生产到在线服务的系统，按时效性分离线、近线、在线三层，并用特征注册表保证线上线下口径一致。",
  "approach": "核心思路是‘统一注册 + 分层生产 + 一致读取’：用特征注册表定义特征口径与版本；离线批作业产出历史特征，近线流作业分钟级更新，在线经 Feature Store 统一低延迟读取；训练与 serving 复用同一变换代码以消除偏置。",
  "derivation": [
    "为什么需要：多模态模型训练与推理都依赖图文音等特征，若线上线下各算各的会产生偏置，需要统一生产、管理与一致性保障。",
    "怎么实现：建立特征注册表定义特征口径；离线批产出历史特征、近线流作业近实时更新、在线经 Feature Store 统一读取；训练与 serving 复用同一变换逻辑。",
    "有什么代价：特征版本冗余带来存储成本、近线/在线一致性存在时延、特征血缘与回溯回填带来运维复杂度。",
    "怎么评测：线上线下特征分布一致性校验、点查 P99 延迟、特征新鲜度(产出到可用时延)、训练-推理偏置指标。"
  ],
  "edgeCases": [
    "新实体冷启动暂无在线特征，需回源离线或填充默认值。",
    "特征口径变更需全量回溯回填，否则历史训练数据错位。",
    "多模态特征维度巨大，在线 KV 内存成本高，需要降维或量化。",
    "流作业滞后使近线特征落后，需监控新鲜度并在超时降级到离线。"
  ],
  "pitfalls": [
    "线上线下用不同代码实现同一特征，产生训练/serving 偏置。",
    "特征未做版本管理，模型重训时无法复现当时特征口径。"
  ],
  "prerequisites": [
    "特征工程与 Feature Store 基本概念",
    "批流计算(Spark/Flink)与 KV 存储原理"
  ],
  "workedExample": [
    "离线每日产出用户历史图文交互特征，落 HDFS/特征库供训练采样。",
    "用户实时上传图片，近线流提取 embedding 更新在线特征，推理时直接低延迟读取。"
  ],
  "lineByLine": [
    "class FeatureStore 定义统一特征读写入口，封装离线与在线两类存储。",
    "def get 在线优先读取低延迟 KV，未命中再回源离线，保证可用性与一致性。"
  ],
  "followUps": [
    {
      "question": "如何保证线上线下特征完全一致？",
      "answer": "复用同一份特征变换逻辑(封装成库，训练与 serving 都调用)；通过特征注册表统一口径与版本；定期对账分布并做一致性校验。"
    },
    {
      "question": "近线特征延迟过大怎么办？",
      "answer": "设置新鲜度 SLO 并监控，超时降级到离线特征或上一次值并告警；优化流作业并行度与检查点间隔。"
    }
  ],
  "followUpAnswers": [
    "复用同一份特征变换逻辑(封装成库，训练与 serving 都调用)；通过特征注册表统一口径与版本；定期对账分布并做一致性校验。",
    "设置新鲜度 SLO 并监控，超时降级到离线特征或上一次值并告警；优化流作业并行度与检查点间隔。"
  ],
  "order": 11
};
