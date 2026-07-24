export default {
  "kind": "concept",
  "id": "agent-eval",
  "category": "Agent Workflow",
  "difficulty": "Hard",
  "title": "Agent 的评测",
  "prompt": "怎么评测一个 Agent（正确性 / 效率 / 成本）？",
  "quickAnswer": "Agent 评测是多维的：正确性看任务成功率与轨迹质量(是否走合理路径)，效率看步数/延迟，成本看 token 与工具调用费用；还需评\"鲁棒性\"(扰动下是否仍对)与\"安全性\"。常用 held-out 基准+LLM-as-judge 评轨迹，配合离线回放与在线 A/B。难点在于任务多样、路径非唯一、需过程与结果双评。",
  "approach": "定指标→构造基准→跑轨迹→结果+过程双评→成本归因。",
  "explanationFocus": "是什么：Agent 评测是用正确性、效率、成本、鲁棒性等多维指标，对 Agent 的最终结果与中间轨迹进行量化衡量的体系。",
  "bruteForce": "只看最终答案对错：忽略走了 50 步绕路或烧了天价 token。",
  "derivation": [
    "为什么需要：Agent 行为路径开放、成本高，单看结果无法指导优化。",
    "怎么实现：建任务基准；记录全轨迹；用规则+LLM-judge 评正确性；统计步数/延迟/token；做扰动与对抗测试鲁棒性。",
    "有什么代价：构造高质量基准贵；LLM-judge 有偏；过程评标注成本高。",
    "怎么评测：看指标稳定性、与人工评分的相关性、是否能区分好坏 Agent。"
  ],
  "invariant": "同一任务多次运行应可复现统计结论，评测需固定随机与工具 Mock。",
  "walkthrough": "评 100 任务：成功率 82%、平均 6.3 步、平均 4.1k token、扰动后掉到 70%。对比 v2 步数降 20%、成功率持平→采纳。",
  "edgeCases": [
    "任务无唯一正确答案：需 judge 而非精确匹配。",
    "工具非幂等导致不可复现。",
    "成本指标被缓存掩盖。"
  ],
  "code": "def evaluate(agent, bench, runs=3):\n    stats = {\"succ\":0,\"steps\":0,\"tokens\":0}\n    for case in bench:\n        for _ in range(runs):\n            traj = agent.run(case, mock_tools=True)   # 工具 Mock 可复现\n            stats[\"succ\"]  += judge_correct(traj)\n            stats[\"steps\"] += len(traj.actions)\n            stats[\"tokens\"]+= traj.tokens\n    return normalize(stats)",
  "codeNotes": [
    "工具用 Mock 保证可复现。",
    "过程与结果都要记。"
  ],
  "complexity": "评测成本 = 任务数×运行次数×单次开销；需控制规模。",
  "followUps": [
    {
      "question": "为什么需要 LLM-as-judge？",
      "answer": "Agent 路径开放、答案非唯一，规则匹配不够，需语义级评判轨迹与结果质量。"
    },
    {
      "question": "效率和成本冲突怎么权衡？",
      "answer": "用成功率-成本帕累托前沿选部署点，并对高价值任务放宽预算。"
    }
  ],
  "followUpAnswers": [
    "路径开放需语义评判。",
    "帕累托前沿选平衡点。"
  ],
  "pitfalls": [
    "只评结果忽略过程成本。",
    "评测不可复现致结论漂移。"
  ],
  "beginnerSummary": "评 Agent 像考员工不只看交付物：还看他用了几步、花了多少钱、绕没绕路、换种问法还答对不。综合打分才知道谁真\"又好又省\"。",
  "prerequisites": [
    "有任务基准与判据。",
    "能记录完整轨迹。",
    "工具可 Mock 复现。"
  ],
  "workedExample": [
    "100 任务跑 3 次取统计。",
    "对比 v1/v2 的步数与成功率。"
  ],
  "lineByLine": [
    "用 Mock 工具跑基准。",
    "记录轨迹与 token。",
    "judge 评正确性与过程。",
    "归一化出多维指标。"
  ],
  "diagram": "Bench -> Agent(run) -> Trajectory -> Judges -> Metrics"
};
