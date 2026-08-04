export default {
  "id": "wm-dreamer",
  "category": "世界模型",
  "difficulty": "Hard",
  "title": "DreamerV3 强化学习世界模型",
  "prompt": "DreamerV3 这类“在想象中训练”的世界模型，为什么能在稀疏奖励与高维观测下稳定学习？",
  "quickAnswer": "DreamerV3 先学习一个紧凑的潜空间世界模型（RSSM），然后在“想象”出的长轨迹上用同一个模型训练 actor 与 critic，把规划转化为在潜空间内的梯度更新，从而用较少真实交互学到策略，且对奖励尺度与超参更鲁棒。",
  "approach": "交替进行：用真实回放数据更新世界模型（表征+动力学+奖励+折扣）；用世界模型想象多步轨迹，在该想象轨迹上通过 λ-回报更新 actor 与 critic；critic 提供价值，actor 最大化预期回报。",
  "explanationFocus": "是什么：DreamerV3 是一种基于模型的强化学习方法，它先学习环境的“世界模型”（把高维观测压缩为潜状态并预测未来），再完全在模型生成的“想象轨迹”上训练策略与价值网络，从而大幅减少与环境的交互次数。",
  "bruteForce": "朴素做法：无模型 RL（如 PPO / SAC）直接在真实环境中采样更新，每步都要真实交互，稀疏奖励下样本效率极低。",
  "invariant": "不变式：世界模型在真实数据上的预测误差应有界；想象轨迹上的价值估计应与真实 rollout 的回报趋势一致（分布偏移不过大）。",
  "walkthrough": "1) 收集真实经验存入回放池；2) 训练 RSSM 重构观测并预测奖励/折扣；3) 从当前状态想象固定步数轨迹；4) 用想象轨迹的 λ-回报更新 critic；5) actor 经想象轨迹的策略梯度提升。",
  "complexity": "说明：单次更新需先训世界模型再在想象轨迹上训策略，计算来自序列长度与想象步数；真实环境交互次数显著低于无模型方法。",
  "beginnerSummary": "入门概览：Dreamer 像是先在脑海里“彩排”很多遍再动手的选手——它先学会环境的内部模型，然后在脑内想象未来，从中学会该怎么行动。",
  "diagram": "real env --> replay buffer --> [ world model (RSSM) ]\n                                    |    (imagine H steps)\n                                    v\n                          [ imagined trajectories ]\n                                    |\n                          +---------+---------+\n                          v                   v\n                    [ actor update ]    [ critic update ]",
  "code": "def dreamer_update(world_model, replay, actor, critic, horizon=15):\n    world_model.learn(replay.sample())\n    traj = world_model.imagine(actor, horizon=horizon)\n    actor.learn(traj)\n    critic.learn(traj)",
  "derivation": [
    "为什么需要：高维像素观测与稀疏奖励让无模型 RL 样本效率极低，真实交互昂贵或危险，需要“先建模再规划”。",
    "怎么实现：用 RSSM 把观测编码为随机潜状态并用循环网络预测下一步，联合训练重构、奖励与折扣；策略与价值在想象轨迹上用 λ-回报与策略梯度优化。",
    "有什么代价：世界模型误差会随想象步数累积，分布偏移可能让策略在真实环境失效；训练计算更重，且对模型容量敏感。",
    "怎么评测：在 Minecraft、机器人操控等基准上对比样本效率与最终回报，看是否在更少真实步数下达到同等或更好表现。"
  ],
  "edgeCases": [
    "奖励极稀疏时世界模型难以学到有用的价值信号，需要更长的想象 horizons 与课程。",
    "环境存在随机性（如彩票开奖）时确定性动力学预测会低估不确定性。",
    "长期任务中想象轨迹误差累积，策略可能学到“幻觉”里的捷径。"
  ],
  "pitfalls": [
    "盲目加大想象步数会让梯度被错误动力学带偏，反而降低真实表现。",
    "忽视世界模型重构质量，只优化策略，导致想象与真实分布脱节。"
  ],
  "prerequisites": [
    "强化学习基础（value / policy / λ-return）",
    "RSSM 与潜变量序列模型"
  ],
  "workedExample": [
    "示例：在 Minecraft 捡钻石任务中，DreamerV3 仅用约 10^8 环境步就学会完整流程，远超无模型基线。",
    "示例：机械臂抓取中，先在想象轨迹上预训练策略，再少量真实数据微调，显著降低实物损耗。"
  ],
  "lineByLine": [
    "def dreamer_update(world_model, replay, actor, critic, horizon=15): 一次性完成世界模型与策略的更新。",
    "world_model.learn(replay.sample()) 用真实回放数据提升潜动力学与奖励预测精度。",
    "traj = world_model.imagine(actor, horizon=horizon) 让 actor 在世界模型里 rollout 出想象轨迹。",
    "actor.learn(traj); critic.learn(traj) 基于想象轨迹同时优化策略与价值网络。"
  ],
  "codeNotes": [
    "把环境交互与策略更新解耦是世界模型 RL 的核心：策略只在想象中更新，真实环境仅用于补充回放数据。"
  ],
  "followUps": [
    {
      "question": "DreamerV3 相比 V1/V2 的关键改进？",
      "answer": "V3 引入更鲁棒的无归一化组件（如 Symlog 变换、MLP 表征）与体裁无关的设计，使其同一套超参跨任务稳定。"
    },
    {
      "question": "想象轨迹长度 H 怎么选？",
      "answer": "太短学不到长程因果，太长误差累积；通常 15 步左右作为折中，并按任务动态调整。"
    },
    {
      "question": "如何检测世界模型失效？",
      "answer": "监控想象价值与真实 rollout 回报的偏差、以及重构误差的突然上升，作为重新收集真实数据的信号。"
    }
  ],
  "followUpAnswers": [
    "V3 引入更鲁棒的无归一化组件（如 Symlog 变换、MLP 表征）与体裁无关的设计，使其同一套超参跨任务稳定。",
    "太短学不到长程因果，太长误差累积；通常 15 步左右作为折中，并按任务动态调整。",
    "监控想象价值与真实 rollout 回报的偏差、以及重构误差的突然上升，作为重新收集真实数据的信号。"
  ],
  "kind": "concept"
};
