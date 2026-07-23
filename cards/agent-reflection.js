export default {
  "kind": "concept",
  "id": "agent-reflection",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "反思（reflection）/ self-critique",
  "prompt": "Agent 的反思（reflection）/ self-critique 机制是什么？",
  "quickAnswer": "反思让 Agent 在产出后\"以评论者视角\"检查自己的答案/计划，发现错误、偏差或遗漏，再迭代修正。常用两角色(生成者 vs 批评者)或让同一模型自我打分；它把\"一次性输出\"升级为\"生成-批评-改进\"的闭环，显著提升复杂任务质量。",
  "approach": "生成答案→自我/他者批评→指出问题→修订→再评估。",
  "explanationFocus": "是什么：反思是 Agent 在行动/回答后主动评估质量与正确性，并据此改进的自我修正机制。",
  "bruteForce": "只生成一次就交付：错误无法被发现，尤其多步推理易累积小错。",
  "derivation": [
    "为什么需要：模型首稿常含逻辑漏洞、事实错误或偏离目标，需二次校验。",
    "怎么实现：把\"原答案+任务要求\"交给批评提示(或独立 critic 模型)产出反馈，再把反馈拼回让模型修订；可多轮直至通过或达上限。",
    "有什么代价：多一轮即多一次模型调用；critic 也可能误判；需停止条件防无限改。",
    "怎么评测：看修订前后质量提升、收敛步数、是否引入新错。"
  ],
  "invariant": "每轮修订必须显式对照\"批评意见\"，不能凭空重写。",
  "walkthrough": "写代码：v1 生成→critic 指出\"未处理空输入\"→v2 补边界→critic 通过。共 2 轮修订、1 条关键反馈。",
  "edgeCases": [
    "critic 与生成者同模型易互相包庇。",
    "过度反思导致改坏原好答案。",
    "无停止条件陷入改不完。"
  ],
  "code": "def reflect(llm, task, draft, rounds=3):\n    cur = draft\n    for i in range(rounds):\n        feedback = llm(f\"Critique:\\n{task}\\n{cur}\")  # 批评者视角\n        if feedback.is_pass():\n            break\n        cur = llm(f\"Revise per feedback:\\n{feedback}\\n{cur}\")\n    return cur",
  "codeNotes": [
    "critic 与 actor 可用不同模型降偏。",
    "需明确的通过/停止信号。"
  ],
  "complexity": "成本 = 生成轮数×(生成+批评)调用；通常 2-4 轮收敛。",
  "followUps": [
    {
      "question": "反思和 ReAct 区别？",
      "answer": "ReAct 在行动循环中纠偏，反思在产出后做质量评审；可叠加：ReAct 推进、反思把关。"
    },
    {
      "question": "怎么避免越改越差？",
      "answer": "保留 best-so-far、用客观校验(测试/评分)决定留哪个版本，而非盲信 critic。"
    }
  ],
  "followUpAnswers": [
    "ReAct 推进，反思把关。",
    "保留最优+客观校验。"
  ],
  "pitfalls": [
    "没有停止条件导致无限反思烧 token。",
    "critic 与 actor 同源缺乏独立判断。"
  ],
  "beginnerSummary": "反思像写完后自己当校对：先写一版，再假装是老师挑毛病(\"这里漏了空值处理\")，然后照着改，直到挑不出错。比一次写完就交更可靠。",
  "prerequisites": [
    "模型能扮演批评者角色。",
    "有可量化的质量判据。",
    "需明确的停止条件。"
  ],
  "workedExample": [
    "代码 v1 被指出缺空值处理。",
    "v2 修订后 critic 通过。"
  ],
  "lineByLine": [
    "生成初稿。",
    "用批评提示产出反馈。",
    "对照反馈修订。",
    "循环至通过或达上限。"
  ],
  "diagram": "Draft -> Critique -> Revise -> Critique -> ... -> Pass"
};
