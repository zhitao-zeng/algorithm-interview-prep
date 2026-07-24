export default {
  "id": "agent-eval-trajectory",
  "kind": "concept",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "轨迹级评测工程",
  "prompt": "为什么评测 Agent 不能只看最终答案，轨迹级评测工程该怎么做？",
  "quickAnswer": "只看最终答案会掩盖\"靠运气/靠贵工具/绕远路\"的成功，无法指导优化。轨迹级评测在离线用 replay 回放完整(状态-动作-观察)序列做可复现打分，在线上用 A/B 对比策略；除任务成功率外，还要盯工具调用成功率、单次成本、p99 延迟等 SLO，并借助 AgentBench/WebArena/τ-bench 这类带轨迹标注的 benchmark。核心是\"既要结果对，也要过程好、成本低、可复现\"。",
  "approach": "定义轨迹级指标(成功率+工具成功率+成本+延迟) → 离线 replay 回放 → 在线 A/B → 接入标准 benchmark → 持续看板。",
  "explanationFocus": "是什么：轨迹级评测工程是把 Agent 的\"完整执行轨迹（而非仅最终答案）\"作为评测对象，通过离线 replay、在线 A/B、工具/成本/延迟 SLO 与标准 benchmark，全面衡量其正确性、效率与可靠性的工程方法。",
  "bruteForce": "只在测试集上比\"最终答案对错\"：一个靠 50 次重试或调最贵模型蒙对的 Agent，指标上看不出问题，上线后成本爆炸。",
  "invariant": "任何一次评测结果都必须可复现——固定输入、工具桩与随机种子，使同一轨迹能被 replay 出一致分数，否则指标无法信任。",
  "walkthrough": "以\"订票 Agent\"评测为例，评测集 500 条任务。离线 replay：把历史 2 万条真实轨迹用确定性工具桩回放，统计任务成功率 82%、工具调用成功率 95%、平均成本 $0.03/任务、p99 延迟 4.2s。线上 A/B：新策略对小流量 5% 用户，对比旧策略，发现成功率+3pp 但成本+40%，触发成本 SLO 告警。接入 τ-bench 做带轨迹标注的评测，发现新策略在\"多轮工具依赖\"子集掉到 60%。最终结论：新策略在简单任务更省，复杂轨迹反而差，需回退该子集。",
  "derivation": [
    "为什么需要：最终答案对≠过程好，隐藏的高成本/高风险/低可靠会在线上爆雷，需要过程可见。",
    "怎么实现：离线用工具桩 replay 历史轨迹做可复现打分；线上小流量 A/B 比策略差异；定义工具成功率、成本、p99 延迟 SLO；接入 AgentBench/WebArena/τ-bench 等带轨迹标注的 benchmark。",
    "有什么代价：需构建工具桩与确定性回放环境；轨迹标注与指标采集工程量大；A/B 需流量与统计显著性保障。",
    "怎么评测：用可复现 replay 的稳定性、A/B 的提升显著性、benchmark 分项（不同难度/工具依赖）达标率来反评\"评测本身\"的覆盖度。"
  ],
  "edgeCases": [
    "工具本身偶发超时，评测需区分\"Agent 错\"还是\"工具抖\"，用工具桩固化。",
    "同一任务多种合法轨迹，评测不能用字符串精确匹配，需语义/约束判分。",
    "线上 A/B 流量不足，差异不显著易误判。"
  ],
  "code": "def eval_trajectory(traj, tool_stub, seed=42):\n    set_seed(seed); reset(tool_stub)                 # 可复现\n    for step in traj.steps:\n        out = tool_stub.call(step.tool, step.args)   # 确定性工具桩\n        if not step.expected(out):                   # 过程校验\n            return Score(success=False, why=\"tool mismatch\")\n    return Score(success=eval_final(traj.final),\n                 cost=traj.total_cost, p99=traj.latency_p99)",
  "codeNotes": [
    "评测与训练同理：可复现是信任前提，必须固化工具与随机源。",
    "指标要\"分项+过程\"，单看最终答案会漏掉成本/可靠性雷。"
  ],
  "complexity": "离线 replay 为 O(轨迹数×步数) 的工具桩调用，可并行批处理；在线 A/B 额外占小流量。指标聚合为 O(轨迹数)，瓶颈在轨迹存储与回放环境搭建。",
  "followUps": [
    {
      "question": "AgentBench、WebArena、τ-bench 各自适合评什么？",
      "answer": "AgentBench 偏多领域任务广度（OS/DB/游戏等）；WebArena 偏真实网站端到端操作；τ-bench 偏\"带工具调用的多轮对话\"与工具依赖，尤其适合客服/预订类需轨迹标注的场景。"
    },
    {
      "question": "线上 A/B 怎么做才不会被随机抖动误导？",
      "answer": "保证足够流量与随机分流，预先算所需样本量达到统计显著性（如 p<0.05）；同时盯成功率与成本/延迟 SLO，避免单指标假阳性；用分层/互斥桶减少方差。"
    }
  ],
  "followUpAnswers": [
    "AgentBench 多领域广度；WebArena 真实网站；τ-bench 多轮工具依赖。",
    "算样本量达显著性、分流随机、成功率与 SLO 同盯。"
  ],
  "pitfalls": [
    "只看最终成功率，放任成本与延迟悄悄恶化。",
    "replay 未固定随机种子/工具桩，分数抖动无法信。"
  ],
  "beginnerSummary": "评 Agent 像评厨师：不能只尝最后一道菜（最终答案）就说好——他可能用了最贵的食材、绕了十道弯、还慢得要命。轨迹级评测是把\"从备料到出菜的全过程\"回放打分：菜对不对、手法对不对、花了多少钱、用了多久，甚至请不同评委（benchmark）分项打分。",
  "prerequisites": [
    "能采集与存储完整执行轨迹。",
    "有确定性工具桩与回放环境。",
    "理解 A/B 实验与统计显著性。"
  ],
  "workedExample": [
    "2 万条历史轨迹 replay：成功率 82%、工具成功率 95%、p99 4.2s，定位到\"多轮依赖\"子集偏弱。",
    "新策略 A/B：成功率+3pp 但成本+40%，触发成本 SLO 回退。"
  ],
  "lineByLine": [
    "先把每次运行的完整轨迹（含工具入参/出参）落盘，作为评测原料。",
    "离线用确定性工具桩 replay，固定种子，输出可复现的过程指标。",
    "在线上以小流量 A/B 对比策略，监控成功率/成本/延迟 SLO。",
    "把任务按难度与工具依赖拆分子集，分别看 benchmark 分项，避免被平均值掩盖。"
  ],
  "diagram": "Agent 运行 ─▶ 存完整轨迹(状态/动作/观察)\n                    │\n        ┌───────────┼────────────┐\n    离线 replay         在线 A/B        标准 benchmark\n    (工具桩+种子)      (小流量对比)     (AgentBench/WebArena/τ-bench)\n        │                │                │\n        └──────▶ 指标看板 ◀┘\n   成功率 | 工具成功率 | 成本 | p99延迟"
};
