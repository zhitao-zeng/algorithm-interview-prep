export default {
  "kind": "concept",
  "id": "rag-007",
  "category": "RAG",
  "difficulty": "Medium",
  "title": "RAG 系统怎么评测？",
  "prompt": "RAG 的核心评测指标 Faithfulness / Answer Relevancy / Context Recall / Context Precision 各自衡量什么？",
  "quickAnswer": "Faithfulness 答案是否忠于上下文；Answer Relevancy 答案是否切题；Context Recall 该召回的是否召回；Context Precision 召回中相关的是否靠前。",
  "approach": "用 RAGAS 等框架，以 LLM-as-judge 对检索与生成两阶段分别打分。",
  "explanationFocus": "是什么：RAG 评测分检索侧(Context Recall/Precision)与生成侧(Faithfulness/Answer Relevancy)，分别卡住『找得全/排得准』与『答得忠/答得切』。",
  "bruteForce": "只看最终答案像不像：无法区分是检索错还是生成错，且人工评测不可规模化。",
  "derivation": [
    "为什么需要：RAG 有检索与生成两条失败链路，需分别量化定位瓶颈。",
    "怎么实现：Context Recall=标注相关片段被召回比例；Context Precision=召回片段中相关者排名质量；Faithfulness=答案可被上下文蕴含的比例；Answer Relevancy=答案与问题相关度。多用 LLM 裁判按 Rubric 打分。",
    "有什么代价：需标注或强 LLM 裁判，成本与波动存在；指标间可能此消彼长。",
    "怎么评测：固定测试集定期跑 RAGAS，监控四项趋势与回归。"
  ],
  "invariant": "经验法则：召回类治『没找全』，精确/忠实类治『找错/编错』；先保 Context Recall 再提 Precision。",
  "walkthrough": "100 题测试集：Context Recall 0.82(应召回的 82% 已进入上下文)，Faithfulness 0.91(答案 91% 有依据)，Answer Relevancy 0.88。",
  "edgeCases": [
    "无标准答案时只能靠 LLM 裁判带主观性",
    "Context Recall 依赖高质量标注",
    "Faithfulness 高但 Answer Relevancy 低(答非所问)",
    "指标互相掣肘需综合看"
  ],
  "code": "from ragas import evaluate\nfrom ragas.metrics import faithfulness, answer_relevancy, context_recall, context_precision\nscore = evaluate(dataset, metrics=[faithfulness, answer_relevancy, context_recall, context_precision])",
  "codeNotes": [
    "RAGAS 以 LLM 为裁判自动打分",
    "需提供 question/answer/contexts/reference 字段"
  ],
  "complexity": "每样本多次 LLM 调用，评测成本随样本与指标数线性增长。",
  "followUps": [
    {
      "question": "四项指标哪个优先？",
      "answer": "先保 Context Recall(找不全后面白搭)，再提 Context Precision 与 Faithfulness，最后看 Answer Relevancy。"
    },
    {
      "question": "没有标注能评测吗？",
      "answer": "可用 LLM-as-judge 做无参考评估(如 faithfulness 只比答案与上下文)，但 Context Recall 仍建议少量标注。"
    }
  ],
  "followUpAnswers": [
    "先保 Context Recall(找不全后面白搭)，再提 Context Precision 与 Faithfulness，最后看 Answer Relevancy。",
    "可用 LLM-as-judge 做无参考评估(如 faithfulness 只比答案与上下文)，但 Context Recall 仍建议少量标注。"
  ],
  "pitfalls": [
    "只看最终答案忽略分段定位",
    "误信单一指标",
    "LLM 裁判波动未做多次取平均",
    "Context Recall 无标注导致失真"
  ],
  "beginnerSummary": "评测就像考试：Context Recall 考『资料找全没』，Precision 考『找对没排前没』，Faithfulness 考『照资料答没』，Relevancy 考『答到点没』。",
  "prerequisites": [
    "RAG  pipeline",
    "LLM-as-judge 思路"
  ],
  "workedExample": [
    "准备 question/contexts/answer/reference 数据集",
    "RAGAS 对四项指标分别打分看趋势"
  ],
  "lineByLine": [
    "import ragas 与四项指标",
    "evaluate 接收数据集",
    "LLM 裁判按 rubric 打分",
    "返回各指标均值"
  ],
  "diagram": "Retrieve -> Context Recall / Context Precision\nGenerate -> Faithfulness / Answer Relevancy"
};
