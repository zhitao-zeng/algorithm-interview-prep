export default {
  "id": "cg-semantic-guard",
  "category": "LLM 约束生成与自动评测",
  "difficulty": "Medium",
  "title": "semantic guard 语义护栏",
  "prompt": "semantic guard 语义护栏如何用向量相似度在生成前或生成后拦截偏离白名单语义的内容？",
  "quickAnswer": "把白名单参考句编码成向量，对生成文本编码后计算最大余弦相似度，低于阈值即判定偏离语义分布并拦截或改写。",
  "code": "from sentence_transformers import SentenceTransformer\n\nclass SemanticGuard:\n    def __init__(self, model: SentenceTransformer):\n        self.model = model\n    def guard(self, text: str, safe_refs: list, thr: float = 0.7) -> bool:\n        # 与白名单语义距离过远则拦截\n        v = self.model.encode([text] + safe_refs)\n        sims = v[0] @ v[1:].T\n        return float(sims.max()) >= thr\n",
  "complexity": "时间 O(r*d)，空间 O(r*d)（r 白名单条数，d 向量维）",
  "beginnerSummary": "像门禁：先录好‘自己人’的脸，陌生人脸相似度太低就拦在门外。",
  "derivation": [
    "为什么需要：即使格式合规，模型也可能生成偏离业务语义的离题或违规内容，需要语义层面的护栏。",
    "怎么实现：预编码白名单参考向量，实时对生成文本编码并取最大余弦相似度，低于阈值即拦截。",
    "有什么代价：需维护向量库与阈值，语义边界样本易误拦；跨领域需重新建库。",
    "怎么评测：用正常/越界样本测拦截准确率与误拦率，调阈值平衡召回。"
  ],
  "edgeCases": [
    "同义改写导致相似度偏低被误拦，需扩充白名单覆盖 paraphrase。",
    "多主题混说时单向量不足以代表，需分段 guards。",
    "阈值在长短文本上分布漂移，需按长度归一。",
    "敌意提示注入使语义伪装，需结合关键词硬规则。"
  ],
  "pitfalls": [
    "只用单一全局阈值，忽略了不同业务域的语义密度差异。",
    "白名单过小，导致大量正常长尾被拦。"
  ],
  "prerequisites": [
    "句向量编码与余弦相似度",
    "向量库与近邻检索",
    "阈值调参与风险评估"
  ],
  "workedExample": [
    "白名单为‘订单查询/退款政策’句，生成‘如何攻击系统’相似度 0.2 < 0.7，被拦截。",
    "生成‘查我的退款进度’相似度 0.85，放行。"
  ],
  "lineByLine": [
    "from sentence_transformers：引入句向量模型。",
    "__init__：保存预加载的编码模型。",
    "self.model.encode([text] + safe_refs)：把待检文本与白名单一起编码。",
    "sims.max() >= thr：取最大相似度判断是否落入白名单语义域。"
  ],
  "followUps": [
    {
      "question": "护栏误拦率高怎么降？",
      "answer": "扩充白名单覆盖 paraphrase 与同义表述，并按业务域分别设阈值，再对边界样本引入人工复审。"
    },
    {
      "question": "生成前与生成后护栏有何取舍？",
      "answer": "生成前用前缀约束更省，生成后用向量护栏更灵活；通常两者结合，前者防结构、后者防语义。"
    }
  ],
  "followUpAnswers": [
    "扩充白名单覆盖 paraphrase 与同义表述，并按业务域分别设阈值，再对边界样本引入人工复审。",
    "生成前用前缀约束更省，生成后用向量护栏更灵活；通常两者结合，前者防结构、后者防语义。"
  ],
  "explanationFocus": "是什么：semantic guard 语义护栏是用向量相似度把生成内容与白名单语义域比对，偏离即拦截的二层防护机制。",
  "approach": "预编码白名单参考向量，对生成文本编码后取最大余弦相似度，低于阈值判定偏离语义分布并拦截或改写。",
  "kind": "concept"
};
