export default {
  "kind": "concept",
  "id": "agent-cot",
  "category": "Agent Workflow",
  "difficulty": "Easy",
  "title": "多步推理链路（chain-of-thought）",
  "prompt": "Agent 里的多步推理链路（chain-of-thought）是什么？",
  "quickAnswer": "CoT 让模型在给答案前先显式写出中间推理步骤，把\"跳跃式作答\"变成\"可检查的思维链\"。在 Agent 中，CoT 既用于单步内部推理，也通过多轮\"思考→行动→观察\"把推理链延伸到真实环境，从而提升复杂、多约束任务的正确性与可解释性。",
  "approach": "问题→逐步推理→(可选行动)→结论。",
  "explanationFocus": "是什么：Chain-of-Thought 是引导模型显式生成中间推理步骤再作答的技术；在 Agent 中它贯穿单步思考与多步行动循环。",
  "bruteForce": "直接要答案：模型易跳步、算错或漏约束，且错因不可见。",
  "derivation": [
    "为什么需要：复杂问题需分解与中间验证，直接作答错误率高且难排查。",
    "怎么实现：在 prompt 加\"一步步思考\"或用 few-shot 展示推理链；Agent 中每轮输出 Thought 再 Action，把推理外显。",
    "有什么代价：更多 token 与延迟；长链可能中途跑偏需纠正。",
    "怎么评测：看复杂题准确率、推理步合理性、错误可追溯性。"
  ],
  "invariant": "最终答案必须能从显式推理链推导出来，不能\"结论与过程脱节\"。",
  "walkthrough": "算账题：CoT 写\"收入-成本=利润；先算成本 100+20=120，再 200-120=80\"。3 步推导，错步易定位。",
  "edgeCases": [
    "推理链中途跑偏：需反思纠偏。",
    "过度冗长浪费 token。",
    "结论与过程矛盾。"
  ],
  "code": "def cot(llm, q):\n    prompt = q + \"\\nLet's think step by step.\"\n    chain = llm(prompt)                       # 显式推理链\n    return extract_answer(chain)              # 从链中提答案",
  "codeNotes": [
    "答案应从链中解析而非另生成。",
    "长链需配合反思纠偏。"
  ],
  "complexity": "成本 ≈ 推理链长度×单步 token；通常换来明显准确率提升。",
  "followUps": [
    {
      "question": "CoT 和 ReAct 关系？",
      "answer": "CoT 是推理外显技术，ReAct 把 CoT 的思考与工具行动交错，是 CoT 在 Agent 中的延伸。"
    },
    {
      "question": "所有任务都要 CoT 吗？",
      "answer": "简单直答任务不必，CoT 主要增益需要多步分解的复杂推理题。"
    }
  ],
  "followUpAnswers": [
    "ReAct=CoT+工具行动。",
    "仅复杂推理题需 CoT。"
  ],
  "pitfalls": [
    "结论与推理过程脱节。",
    "不分任务无脑加 CoT 烧 token。"
  ],
  "beginnerSummary": "CoT 像小学列竖式：不让你心算直接报数，而是把\"先算这个、再算那个\"一步步写清楚。写下来既不容易错，老师(调试者)也能看清哪步算歪了。",
  "prerequisites": [
    "模型具备逐步推理能力。",
    "任务可分解为中间步。",
    "能从链中解析最终答案。"
  ],
  "workedExample": [
    "算账题 3 步推导。",
    "错步因外显而可定位。"
  ],
  "lineByLine": [
    "提示模型逐步思考。",
    "模型产出推理链。",
    "从链中提取答案。",
    "必要时反思纠偏中间步。"
  ],
  "diagram": "Q -> step1 -> step2 -> ... -> A"
};
