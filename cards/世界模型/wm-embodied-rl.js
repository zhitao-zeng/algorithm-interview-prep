export default {
  "id": "wm-embodied-rl",
  "category": "世界模型",
  "difficulty": "Medium",
  "title": "具身强化学习基础",
  "prompt": "从世界模型的角度，具身智能体（embodied agent）为什么更需要“先建模世界”而不是端到端直接学策略？",
  "quickAnswer": "具身任务中真实交互昂贵、反馈稀疏且物理延迟高，端到端策略样本效率差；世界模型把高维感官压缩为可预测潜空间，让 agent 在内部“想象”中预演动作、规划与迁移，从而用更少真实试错学会鲁棒行为。",
  "approach": "先训练一个覆盖观测-动作-奖励的世界模型，再用 imagination / MPC 在其上训练或搜索策略；真实环境仅用于收集数据与周期性校正模型分布偏移。",
  "explanationFocus": "是什么：具身强化学习指智能体在真实或仿真物理环境中，通过视觉/触觉等感官与动作交互来学习技能；引入世界模型后，它把“与物理世界试错”转化为“先在世界模型里试错”，特别适合样本昂贵、反馈稀疏的具身场景。",
  "bruteForce": "朴素做法：端到端用 PPO 在真实机器人上直接学，每步都要真实动作与漫长回合，碰撞与损耗成本高。",
  "invariant": "不变式：世界模型下学到的策略迁移到真实环境后，其回合回报应不低于同数据量下纯真实训练的回报（否则建模无意义）。",
  "walkthrough": "1) 在仿真/真实中收集交互数据；2) 训练世界模型（观测编码、动力学、奖励）；3) 在想象轨迹上优化策略；4) 部署到实体并收集校正数据；5) 迭代缩小 sim-to-real 差距。",
  "complexity": "说明：成本主要在真实数据采集与模型训练；相比纯真实 RL，真实步数大幅下降，但需额外承担建模与校准开销。",
  "beginnerSummary": "入门概览：具身智能体就是“有身体的 AI”。让它直接在真实机器上乱试太贵太慢，所以先教它一个内部世界模型，在脑内多练几遍再上手。",
  "diagram": "robot/sim <--> (obs, action, reward)\n      |\n      v\n[ collect data ] --> [ world model ]\n                        |\n                 imagine trajectories\n                        |\n                  [ policy/planner ]\n                        |\n                  deploy & correct",
  "code": "def embodied_episode(env, policy, max_steps=200):\n    obs = env.reset()\n    total = 0.0\n    for _ in range(max_steps):\n        action = policy(obs)\n        obs, reward = env.step(action)\n        total += reward\n    return total",
  "derivation": [
    "为什么需要：具身环境真实交互慢、贵且稀疏奖励，端到端样本效率不足以支撑复杂技能。",
    "怎么实现：用世界模型压缩感官并预测未来与奖励，在潜空间做 imagination 或 MPC 训练策略，再以少量真实数据校正。",
    "有什么代价：sim-to-real 与模型误差会削弱迁移；建模本身需数据与算力，且可能学到“幻觉捷径”。",
    "怎么评测：在真实/仿真基准对比样本效率、成功率与泛化，看世界模型是否带来数据量级的节省。"
  ],
  "edgeCases": [
    "真实传感器噪声与仿真不一致，导致学得的策略在实体上失灵（sim-to-real gap）。",
    "奖励极稀疏时世界模型的奖励预测失真，策略失去方向。",
    "动作延迟（执行滞后）让一步动作影响多帧观测，朴素建模错位。"
  ],
  "pitfalls": [
    "只在世界模型里训练却长期不回真实环境校正，分布偏移累积直至策略崩溃。",
    "把仿真指标当真实指标，忽略摩擦、延迟等未被建模的物理差异。"
  ],
  "prerequisites": [
    "强化学习（策略梯度 / 值函数）",
    "世界模型与潜空间动力学"
  ],
  "workedExample": [
    "示例：机械臂用 Dreamer 类世界模型在仿真预训练，再少量真实抓取数据微调，成功率显著提升。",
    "示例：四足机器人先在潜空间想象行走轨迹，再部署，减少真实跌倒次数。"
  ],
  "lineByLine": [
    "def embodied_episode(env, policy, max_steps=200): 跑一个具身回合收集回报。",
    "obs = env.reset() 重置环境拿到初始观测。",
    "action = policy(obs) 策略根据当前观测给出动作。",
    "obs, reward = env.step(action) 环境执行动作并返回新观测与奖励。"
  ],
  "codeNotes": [
    "真实回合是数据来源也是最终评测；世界模型的价值在于用更少的此类回合达到同等技能。"
  ],
  "followUps": [
    {
      "question": "世界模型能完全替代真实交互吗？",
      "answer": "不能。真实环境用于初始数据与持续校正，模型无法覆盖的分布外情形仍需真实试错。"
    },
    {
      "question": "具身 RL 与离线 RL 的区别？",
      "answer": "离线 RL 只用固定数据集学策略，不在线交互；具身世界模型仍可主动在仿真/真实中收集数据并校正。"
    }
  ],
  "followUpAnswers": [
    "不能。真实环境用于初始数据与持续校正，模型无法覆盖的分布外情形仍需真实试错。",
    "离线 RL 只用固定数据集学策略，不在线交互；具身世界模型仍可主动在仿真/真实中收集数据并校正。"
  ],
  "kind": "concept"
};
