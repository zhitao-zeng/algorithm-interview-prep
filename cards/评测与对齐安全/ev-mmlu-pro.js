export default {
  "id": "ev-mmlu-pro",
  "category": "评测与对齐安全",
  "difficulty": "Medium",
  "title": "MMLU-Pro 评测",
  "prompt": "MMLU-Pro 相比 MMLU 做了哪些改进，为什么能更准确衡量大模型的知识推理能力？",
  "quickAnswer": "MMLU-Pro 将选项扩展到 10 个、剔除过于简单或带噪声的题目、增加多步推理题比例，并采用更严谨的评测协议降低随机猜对率，从而更可靠地区分顶尖模型的知识与推理水平。",
  "approach": "从\"题目难度、选项数、噪声、评测协议\"四个维度对比 MMLU，说明 MMLU-Pro 如何把随机基线从 25% 降到 10% 并提升推理占比，使榜单区分度更高。",
  "explanationFocus": "是什么：MMLU-Pro 是 MMLU 的升级版知识推理基准，覆盖 14 个学科、约 1.2 万道选择题，把选项数提升到 10 个并强化多步推理，用来更细粒度衡量大模型的专业知识掌握度。",
  "bruteForce": "最朴素的做法是在 MMLU 原 4 选项上直接微调和报告准确率，但模型可凭选项位置偏差和记忆题拿高分，无法反映真实推理能力，且 4 选 1 随机基线高达 25%。",
  "invariant": "评测结论必须可复现：固定题目、选项顺序与解码参数后，同一模型多次运行准确率波动应小于 1%，否则排名不可信。",
  "walkthrough": "先加载 MMLU-Pro 的 14 类题目；统一把选项打乱并随机化位置；用 few-shot CoT 提示调用模型；统计 10 选 1 准确率并按学科分组，与 MMLU 做差异分析。",
  "complexity": "评测以推理调用次数衡量：每题约 1 次生成加 1 次答案抽取，总调用约 1.2 万次；人工成本集中在题库清洗与重写阶段，属一次性开销。",
  "beginnerSummary": "简单说，MMLU-Pro 就是\"更难、更严谨的 MMLU\"：题目更像考试难题，选项从 4 个变 10 个，瞎猜更难蒙对，能更好看出模型是真懂还是靠记忆。",
  "diagram": "+-------------+        +-----------------+\n| MMLU 4 opt  |  -->   | MMLU-Pro 10 opt |\n+-------------+        +-----------------+\n      |                       |\n random 25%              random 10%\n      v                       v\n  noise high            reasoning-heavy",
  "code": "def eval_mmlu_pro(model, questions):\n    correct = 0\n    for q in questions:\n        pred = model.answer(q.shuffle_options())\n        if pred == q.gold:\n            correct += 1\n    return correct / len(questions)",
  "derivation": [
    "为什么需要：MMLU 许多题目过于简单或带噪声，4 选 1 随机基线高，顶尖模型准确率趋近饱和，难以区分真实能力差距。",
    "怎么实现：删除简单题、增加研究生级多步推理题，把选项数从 4 扩到 10，并统一打乱选项顺序、采用 CoT 协议评测。",
    "有什么代价：题目更难导致整体分数下降、方差变大；题库构建与人工复核成本高，且对解码参数更敏感。",
    "怎么评测：报告总体与各学科 10 选 1 准确率，对比 MMLU 看区分度提升，并做多次运行的一致性检验。"
  ],
  "edgeCases": [
    "选项顺序随机化后若模型存在位置偏差，准确率会显著波动，需固定打乱种子。",
    "题目含 LaTeX 公式或图表描述时，纯文本评测可能误判答案格式。",
    "学科间难度不均，单一总体准确率会掩盖某些学科的退步。",
    "CoT 解码温度不为 0 时，多次运行结果不可直接比较。"
  ],
  "pitfalls": [
    "把 MMLU 与 MMLU-Pro 分数直接横比会误解进步，二者量纲不同。",
    "忽略多次运行方差，用单次结果给模型排座次容易得出错误结论。"
  ],
  "prerequisites": [
    "了解 MMLU 基准的结构、学科划分与 4 选 1 评测方式。",
    "理解 few-shot 提示与思维链（CoT）推理的基本机制。"
  ],
  "workedExample": [
    "场景一：某模型 MMLU 96% 但 MMLU-Pro 仅 62%，说明其优势更多来自记忆而非推理。",
    "场景二：将选项顺序随机化三次，模型准确率在 60%~64% 间抖动，说明存在轻微位置偏差需报告均值。"
  ],
  "lineByLine": [
    "def eval_mmlu_pro(model, questions): 定义评测函数，接收模型与题目列表。",
    "for q in questions: 遍历每道题，准备单独计分。",
    "pred = model.answer(q.shuffle_options()) 打乱选项后调用模型得到预测。",
    "if pred == q.gold: correct += 1 命中标准答案则累加。",
    "return correct / len(questions) 返回整体准确率。"
  ],
  "codeNotes": [
    "q.shuffle_options() 模拟评测中的选项随机化，是避免位置偏差的关键步骤。"
  ],
  "followUps": [
    {
      "question": "MMLU-Pro 的 10 选 1 随机基线是多少，对排名意味着什么？",
      "answer": "随机基线为 10%，相比 MMLU 的 25% 更能压低瞎猜得分，使模型间差异更显著、排名更稳定。"
    },
    {
      "question": "为什么 MMLU-Pro 还要保留 few-shot CoT 而不是直接零样本？",
      "answer": "CoT 能激发模型的推理链、更贴近真实解题过程，但需固定示例与解码参数以保证可复现。"
    }
  ],
  "followUpAnswers": [
    "随机基线为 10%，相比 MMLU 的 25% 更能压低瞎猜得分，使模型间差异更显著、排名更稳定。",
    "CoT 能激发模型的推理链、更贴近真实解题过程，但需固定示例与解码参数以保证可复现。"
  ],
  "kind": "concept"
};
