export default {
  "id": "ev-hallucination-detect",
  "kind": "concept",
  "category": "评测与对齐安全",
  "title": "幻觉检测：事实性校验与引用溯源",
  "difficulty": "Hard",
  "prompt": "如何检测和度量多模态大模型的幻觉？事实性校验、引用溯源与幻觉基准分别怎么做？",
  "quickAnswer": "幻觉指模型生成与输入或事实不符的内容。检测分两类：忠实性幻觉（与原文/图像矛盾）用蕴含/矛盾分类器或 NLI 对齐；事实性幻觉（编造知识）用检索知识库或权威源校验。引用溯源要求生成时附带可核查出处，再用检索增强验证。基准如 TruthfulQA、HallusionBench、POPE（对象存在幻觉）提供量化指标（准确率、F1、幻觉率）。",
  "complexity": "O(K·N) 检索校验",
  "beginnerSummary": "幻觉就是模型『一本正经地胡说』。检测方法像事实核查员：拿它说的话去和原文、图片或外部资料对照，看是否对得上。",
  "explanationFocus": "是什么：幻觉检测是度量模型输出中『与给定上下文（图像/文档）矛盾』或『与真实世界事实不符』的比例，方法包括蕴含一致性校验、检索事实核查、引用溯源与专门基准评测。",
  "approach": "把响应拆成原子陈述，逐句与证据（图像/检索文档）做蕴含或矛盾判断（NLI/LLM 裁判）；事实性幻觉用 RAG 召回权威段落核验；引用溯源要求模型标注出处再由校验器确认可支持。基准侧用 POPE（二元存在性）、HallusionBench（图文一致性）、TruthfulQA（真实性）报告幻觉率。",
  "code": "from typing import List\n\ndef check_claim(claim: str, evidence: List[str], nli) -> bool:\n    # 任一证据蕴含该陈述则视为可信，否则判幻觉\n    for e in evidence:\n        if nli.entail(claim, e) == 'entail':\n            return True\n    return False\n\ndef hallucination_rate(claims, evidences, nli):\n    bad = sum(not check_claim(c, ev, nli) for c, ev in zip(claims, evidences))\n    return bad / len(claims)",
  "derivation": [
    "为什么需要：幻觉直接破坏可信度与安全性，尤其在医疗/法律等高风险场景必须量化。",
    "怎么实现：原子化陈述+证据对齐（NLI 或 LLM 裁判），或 RAG 事实核查；基准侧构造易错/诱导题统计幻觉率。",
    "有什么代价：NLI/检索可能本身有误判（假阴性把真话当幻觉）；原子化拆分易丢失上下文；基准易被过拟合。",
    "怎么评测：报告幻觉率、F1、与人工标注一致性；分类型（对象/属性/关系/事实）细分误差来源。"
  ],
  "edgeCases": [
    "图像中对象存在但极小/模糊，POPE 二分类易误判。",
    "引用溯源中模型编造看似合理但不存在的出处。",
    "证据缺失时无法判定，需区分『未知』与『幻觉』。",
    "多步推理中部分前提错导致最终结论错，归因困难。"
  ],
  "pitfalls": [
    "用同一 LLM 既生成又当裁判，自我偏好低估幻觉。",
    "把『表达差异』当『事实矛盾』，原子化过粗造成虚高幻觉率。"
  ],
  "prerequisites": [
    "自然语言推断（NLI）与蕴含/矛盾判定。",
    "检索增强生成（RAG）与证据对齐基础。"
  ],
  "workedExample": [
    "POPE 把『图中有 X 吗』做成正负平衡二分类，用准确率/F1 度量对象存在幻觉。",
    "HallusionBench 用刻意误导的图文对，测模型是否盲从语言先验而忽略图像事实。"
  ],
  "lineByLine": [
    "from typing import List：引入列表类型标注。",
    "def check_claim(...)：对单条陈述遍历证据做蕴含判定。",
    "if nli.entail(...): return True：任一证据支持即视为可信。",
    "def hallucination_rate(...)：统计不可信比例作为幻觉率。"
  ],
  "followUps": [
    {
      "question": "忠实性幻觉与事实性幻觉有何区别？",
      "answer": "忠实性幻觉指输出与给定上下文（图像/文档/对话）矛盾，可内部校验；事实性幻觉指违背外部世界真实知识，需要检索权威源或知识库来核查，二者检测手段不同。"
    },
    {
      "question": "引用溯源为什么不能完全杜绝幻觉？",
      "answer": "模型可能编造看似合法但不存在的引用（幻觉引用），或引用与结论不相关；溯源只把责任转移给用户核查，仍需后端检索验证链接/段落真实支持该陈述。"
    }
  ],
  "followUpAnswers": [
    "忠实性幻觉指输出与给定上下文（图像/文档/对话）矛盾，可内部校验；事实性幻觉指违背外部世界真实知识，需要检索权威源或知识库来核查，二者检测手段不同。",
    "模型可能编造看似合法但不存在的引用（幻觉引用），或引用与结论不相关；溯源只把责任转移给用户核查，仍需后端检索验证链接/段落真实支持该陈述。"
  ]
};
