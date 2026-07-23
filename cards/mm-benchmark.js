export default {
  "kind": "concept",
  "id": "mm-benchmark",
  "category": "多模态模型",
  "difficulty": "Easy",
  "title": "多模态评测基准",
  "prompt": "评测多模态大模型常用哪些基准，各自测什么？",
  "quickAnswer": "常用：MMBench(多维能力选择题)、MME(感知+认知是/否题，测幻觉)、POPE(对象存在幻觉)、SEED-Bench(图/视频选择题)、MMMU(大学级多学科推理)、TextVQA(图中文字)、DocVQA(文档)、Video-Bench(视频)。它们分别覆盖感知、推理、OCR、文档、视频与幻觉，需组合看而非单一分数。",
  "approach": "按能力维度选基准：感知/推理/OCR/文档/视频/幻觉 各取代表。",
  "explanationFocus": "是什么：多模态评测基准是标准化的\"考题集\"，用来客观比较模型在感知、推理、OCR、视频等各方面的能力。",
  "bruteForce": "只看一个总分：掩盖短板(如强推理弱 OCR)。",
  "derivation": [
    "为什么需要：模型能力多维，单一指标会被刷分，需分维度可比较、可诊断。",
    "怎么实现：人工/模型构造标准化题目(选择/判断/问答)，统一协议评测准确率或 GPT 评判，报告分项。",
    "有什么代价：基准会被训练数据污染；GPT 评判有偏差；覆盖不全。",
    "怎么评测：看分项雷达图、对比同规模模型、关注幻觉类子项。"
  ],
  "invariant": "同一模型在相同基准与协议下得到可复现分数。",
  "walkthrough": "MME 满分 2800(感知1400+认知1400)；POPE 准确率越高幻觉越少。",
  "edgeCases": [
    "基准泄露到训练集：分数虚高。",
    "开放式题靠 GPT 评判不稳定。",
    "视频基准标注成本极高。"
  ],
  "code": "def eval_on_bench(model, dataset):\n    score = 0\n    for item in dataset:\n        pred = model(item['image'], item['question'])\n        score += grade(pred, item['answer'])     # 选择/判断/匹配\n    return score / len(dataset)",
  "codeNotes": [
    "选择题可直接判等。",
    "开放题需 GPT/人工评判。"
  ],
  "complexity": "评测成本 = 题数 × 单次推理；视频更贵。",
  "followUps": [
    {
      "question": "为什么不能只看一个分数？",
      "answer": "总分高可能靠强项拉高，短板(如 OCR/幻觉)被掩盖，需分项诊断。"
    },
    {
      "question": "MME 和 POPE 区别？",
      "answer": "MME 覆盖感知+认知多子类；POPE 专注对象存在幻觉的二选一评测。"
    }
  ],
  "followUpAnswers": [
    "总分掩盖短板。",
    "MME 多维、POPE 专幻觉。"
  ],
  "pitfalls": [
    "被单一高分误导。",
    "忽视基准污染导致虚高。"
  ],
  "beginnerSummary": "评测基准就像各科试卷：语文卷(MME 感知认知)、防瞎编卷(POPE 测幻觉)、认字卷(TextVQA 看图中文字)、看视频卷(Video-Bench)。只看总分像只看总分不看偏科，得哪科强哪科弱都看才行。",
  "prerequisites": [
    "能力需多维可比较。",
    "需标准化题目与协议。",
    "分数应可复现。"
  ],
  "workedExample": [
    "MME 满分 2800。",
    "POPE 准确率测幻觉。"
  ],
  "lineByLine": [
    "按维度选基准。",
    "构造标准化题目。",
    "统一协议评测。",
    "报告分项而非总分。"
  ],
  "diagram": "模型 ─▶ [MMBench, MME, POPE, MMMU, TextVQA...] ─▶ 分项雷达"
};
