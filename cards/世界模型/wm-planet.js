export default {
  "id": "wm-planet",
  "category": "世界模型",
  "difficulty": "Medium",
  "title": "PlaNet 潜空间规划",
  "prompt": "PlaNet 为什么选择在“潜空间”而不是“像素空间”里做模型预测控制（MPC）规划？",
  "quickAnswer": "PlaNet 学习一个紧凑潜动力学后，用基于模型的规划（如 CEM）在潜空间里搜索未来若干步的动作序列，只把最终选中动作执行一步并重新规划；潜空间维度低、可微分且噪声小，使短视界规划既快又稳。",
  "approach": "学习 RSSM 风格的潜模型；规划时用 CEM 在潜空间采样并优化一段动作序列，使预测回报之和最大；每步只执行最优序列的第一步，然后以新观测重规划（receding horizon）。",
  "explanationFocus": "是什么：PlaNet 是一种基于模型的强化学习方法，它先学习把像素压缩为潜状态的动力学，再在潜空间内用随机优化（CEM）做模型预测控制，每步只执行规划出的第一个动作并反复重规划。",
  "bruteForce": "朴素做法：在像素空间直接做 MPC，需要对高维图像做前向生成与优化，计算爆炸且梯度难传。",
  "invariant": "不变式：潜空间规划的回报估计应随真实执行逐步收敛；重规划后第一步动作在相邻时刻应平滑变化而非剧烈跳变。",
  "walkthrough": "1) 编码当前观测为潜状态；2) 用 CEM 采样多组动作序列；3) 在潜动力学中展开得到预测回报；4) 选最优序列并执行第一步；5) 取得新观测后重新编码并重规划。",
  "complexity": "说明：规划代价随视界长度与 CEM 样本数线性增长，但远低于像素级 MPC；每步真实交互仅一次。",
  "beginnerSummary": "入门概览：PlaNet 像下棋——它先在脑内（潜空间）往后算几步挑出最佳走法，只走一步，再看棋盘重新算，避免被高像素噪声干扰。",
  "diagram": "obs_t --> encode --> s_t\n                  |\n            [ CEM planner ]\n         sample action seqs a[1..H]\n                  |\n         rollout in latent --> returns\n                  |\n          pick best --> execute a_1 only\n                  |\n             obs_{t+1} --> re-plan",
  "code": "def planet_plan(latent, actor, critic, horizon=12, iters=10):\n    # 在潜空间用 CEM 规划动作序列\n    return cem(latent, actor, critic, horizon, iters)",
  "derivation": [
    "为什么需要：像素空间规划维度高、不可微、噪声大，难以高效搜索动作；需要低维、平滑且可预测的潜空间。",
    "怎么实现：训练潜动力学模型（编码+转移+解码），在其上以 CEM 迭代优化有限视界内的动作序列，最大化预测累积回报。",
    "有什么代价：视界有限导致短视，CEM 是黑盒优化不保证全局最优；模型误差会让规划偏离真实最优。",
    "怎么评测：在 control suite 对比无模型方法与更长视界规划，观察样本效率与最终回报随视界的变化。"
  ],
  "edgeCases": [
    "视界过短时规划只顾眼前，遇到需长期铺垫的任务失败。",
    "潜模型误差在边界区域变大，CEM 可能选出危险动作。",
    "回报函数尺度不一时 CEM 的精英筛选失效，需要标准化。"
  ],
  "pitfalls": [
    "把规划视界设得过长，CEM 样本爆炸且误差累积，反而不如短视界重规划。",
    "每步执行多步动作而非仅第一步，失去 receding horizon 的纠错能力。"
  ],
  "prerequisites": [
    "模型预测控制（MPC）与 CEM 优化",
    "潜变量序列模型与回报估计"
  ],
  "workedExample": [
    "示例：在“ cheetah run ”中 PlaNet 用 8 步潜规划即超过 D4PG 等无模型方法的数据效率。",
    "示例：遮挡环境下，潜规划借助历史状态仍能选出前进动作，而像素 MPC 直接失效。"
  ],
  "lineByLine": [
    "def planet_plan(latent, actor, critic, horizon=12, iters=10): 在潜空间里规划一段动作序列。",
    "return cem(latent, actor, critic, horizon, iters) 用交叉熵方法迭代优化使预测回报最大的动作序列。",
    "cem 内部对多组动作序列并行展开潜动力学并取精英样本更新分布，从而逼近局部最优。"
  ],
  "codeNotes": [
    "horizon 通常取 12 步左右：足够捕获短程因果，又控制 CEM 采样成本与模型误差。"
  ],
  "followUps": [
    {
      "question": "PlaNet 与 Dreamer 的根本区别？",
      "answer": "PlaNet 用显式 CEM 规划每步重规划且只训练世界模型，Dreamer 进一步在想象轨迹上用梯度训练 actor/critic。"
    },
    {
      "question": "CEM 为什么不替换为梯度优化？",
      "answer": "潜动力学常不可导或不平滑，CEM 作为无梯度采样优化更稳，且易并行评估多组动作。"
    }
  ],
  "followUpAnswers": [
    "PlaNet 用显式 CEM 规划每步重规划且只训练世界模型，Dreamer 进一步在想象轨迹上用梯度训练 actor/critic。",
    "潜动力学常不可导或不平滑，CEM 作为无梯度采样优化更稳，且易并行评估多组动作。"
  ],
  "kind": "concept"
};
