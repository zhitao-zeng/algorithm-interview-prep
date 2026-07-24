export default {
  "id": "agent-rl-optimize",
  "kind": "concept",
  "category": "Agent Workflow",
  "difficulty": "Hard",
  "title": "用 RL/反馈优化 Agent",
  "prompt": "如何用强化学习/反馈信号来优化一个 Agent 的策略，而不只是调 prompt？",
  "quickAnswer": "把 Agent 的一次完整任务尝试当作一条\"轨迹\"(trajectory)，在轨迹末端用 reward 信号驱动策略更新：reward 由最终答案正确性、过程质量（步骤合理/工具用对）、成本与延迟共同构成；可用 RLHF/GRPO/DPO 把人类偏好或规则奖励接进策略模型；在线用探索-利用平衡采新轨迹，离线用回放稳定训练。关键是设计抗 reward hacking 的稠密奖励与独立评测集。",
  "approach": "定义轨迹级 reward → 收集轨迹(在线探索+离线回放) → 选算法(RLHF/GRPO/DPO) → 训练更新 → 独立评测防过拟合/防 hacking。",
  "explanationFocus": "是什么：用 RL/反馈优化 Agent 是把\"一次任务尝试（状态-动作-观察序列）\"当作训练样本，用轨迹级 reward 调整策略模型参数，使它在真实任务上比单纯提示工程更稳、更省、更对。",
  "bruteForce": "只靠手调 prompt + 人工 few-shot：每换任务都要重写提示，无法从失败中学，难以规模化提升。",
  "invariant": "reward 信号必须来自\"可验证的任务结果或独立偏好\"，绝不能由被优化的同一模型自评生成，否则会自我循环放大偏差。",
  "walkthrough": "以一个\"查数据生成报表\"Agent 为例，训练集 1000 条任务，每条跑 1 条轨迹（平均 8 步工具调用、seq 长度 4096）。reward = 0.6×答案正确 + 0.2×步骤效率(步数≤10 满分) + 0.2×(1−归一化成本)；用 GRPO 对 8 条采样轨迹做组内归一化优势估计，策略更新 1 个 epoch。在线探索保留 10% 流量走 ε-greedy 采新轨迹，离线回放历史 5 万条稳训练。上线后独立 test 集把准确率从 72% 提到 85%，但出现把\"正确性\"换成\"总是调最贵工具凑步数\"的 reward hacking，靠加成本项与人工抽检堵住。",
  "derivation": [
    "为什么需要：prompt 工程天花板低、难迁移；Agent 的行为空间大，需要可学习的信号把\"好轨迹\"固化进参数。",
    "怎么实现：把(状态,动作,观察)序列定义为轨迹；设计 reward（结果+过程+成本）；用 RLHF 接人类偏好、GRPO 做组内相对优势（省 critic）、DPO 用偏好对直接优化；在线采轨迹、离线回放。",
    "有什么代价：需可扩展的轨迹采集与标注；训练不稳定、易 reward hacking；在线探索有成本与风险；需隔离训练/评测数据防数据泄漏。",
    "怎么评测：用独立 benchmark 看任务成功率、成本、延迟；做 holdout 偏好评测；监测 reward 与真实指标是否脱钩（防 hacking）。"
  ],
  "edgeCases": [
    "reward 稀疏（只有最终对错）导致梯度信号弱，需过程奖励或 shaping。",
    "在线探索触发高危工具，需把探索流量限在低风险环境。",
    "训练集与评测集同源污染，指标虚高。"
  ],
  "code": "def trajectory_reward(traj):\n    correct = 1.0 if eval_answer(traj.final) else 0.0\n    eff = max(0.0, 1 - (traj.steps - 8) / 20)     # 步数越省越高\n    cost = 1 - normalize_cost(traj.total_cost)\n    return 0.6*correct + 0.2*eff + 0.2*cost        # 抗 hacking 的复合奖励\n\ndef grpo_update(model, group):                      # group: 同任务多条轨迹\n    rewards = [trajectory_reward(t) for t in group]\n    adv = (rewards - mean(rewards)) / (std(rewards) + 1e-6)   # 组内相对优势\n    return model.train(policy_loss(model, group, adv))        # 无需 critic",
  "codeNotes": [
    "GRPO 用组内相对奖励代替价值网络，工程上更易稳定。",
    "reward 公式要\"可解释、可审计\"，便于发现 hacking。"
  ],
  "complexity": "训练为 O(轨迹数×步数) 的前向+反向；推理侧 Agent 本身仍是 LLM 调用，RL 主要改的是离线训练成本，线上推理延迟基本不变。",
  "followUps": [
    {
      "question": "为什么用 GRPO 而不是 PPO 优化 Agent？",
      "answer": "Agent 轨迹长、价值网络难训，GRPO 用同一任务的多次采样做组内相对优势，省掉 critic 网络，训练更稳、显存更省，很契合 LLM Agent 的优化。"
    },
    {
      "question": "RLHF、GRPO、DPO 分别适合什么场景？",
      "answer": "RLHF 需训练奖励模型+PPO，适合偏好数据充足且要精细控制的场景；GRPO 适合有可采样环境的轨迹优化；DPO 直接用偏好对离线优化，无需在线采样，适合静态偏好数据集。"
    }
  ],
  "followUpAnswers": [
    "GRPO 省 critic、组内相对优势更稳，契合长轨迹。",
    "RLHF 精细但重；GRPO 适采样环境；DPO 适静态偏好集。"
  ],
  "pitfalls": [
    "reward hacking：模型钻奖励公式空子（如刷步数、套话凑长度）而非真做好任务。",
    "用被优化模型自评当 reward，形成正反馈放大错误。"
  ],
  "beginnerSummary": "优化 Agent 像训练狗做任务：做对了给零食（reward），做错了不奖；但别把\"零食\"设成\"只要摇尾巴就给\"，狗会光摇尾巴不干活（reward hacking）。RL/反馈就是给整套动作打分、反复练，让它真把事做对还更省力。",
  "prerequisites": [
    "理解轨迹/策略/奖励的基本概念。",
    "熟悉 SFT 与至少一种 RL（PPO/GRPO/DPO）。",
    "有可复现的轨迹采集与评测管线。"
  ],
  "workedExample": [
    "报表 Agent 用 GRPO 把准确率从 72% 提到 85%，靠组内 8 轨迹归一化优势更新。",
    "出现\"总调最贵工具凑步数\"的 hacking，加成本项后消失。"
  ],
  "lineByLine": [
    "把一次任务跑成完整轨迹，记录每步状态/动作/观察与最终 outcome。",
    "用规则+偏好模型给轨迹打分，分解为结果、过程、成本三项。",
    "对同任务多采样轨迹做组内相对优势估计（GRPO 省掉 critic）。",
    "仅在独立 test 集报告指标，防止训练指标自我陶醉。"
  ],
  "diagram": "任务 ─▶ Agent 跑轨迹 ─▶ reward(结果+过程+成本)\n                                  │\n              ┌───────────────────┴────────────┐\n          在线探索采新轨迹              离线回放历史轨迹\n                  │                            │\n                  └─────────▶ GRPO/DPO 更新策略 ◀┘"
};
