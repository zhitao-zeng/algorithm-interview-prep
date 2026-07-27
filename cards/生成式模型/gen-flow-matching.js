export default {
  "id": "gen-flow-matching",
  "kind": "concept",
  "category": "生成式模型",
  "title": "Flow Matching / Rectified Flow",
  "difficulty": "Hard",
  "prompt": "Flow Matching / Rectified Flow 的思路是什么？它与扩散模型的关系、以及要预测的速度场分别是什么？",
  "quickAnswer": "Flow Matching 用连续归一化流把噪声直线“推”向数据：学习一个速度场 v_θ(x,t) 使得沿 ODE 积分可从 N(0,I) 到达数据分布。Rectified Flow 是其实例，用 x_t=(1-t)x0 + t ε 的直线路径构造监督。它与扩散等价在“都可把噪声变数据”，但 FM 走直线、步数更少、训练目标更简单（直接回归速度）。",
  "code": "def fm_loss(model, x0, t):\n    noise = torch.randn_like(x0)\n    xt = (1 - t) * x0 + t * noise      # 直线插值路径\n    ut = noise - x0                     # 目标速度场\n    return ((model(xt, t) - ut) ** 2).mean()",
  "complexity": "O(S·H·W·C)，ODE 积分步 S",
  "beginnerSummary": "扩散像在迷雾里随机游走接近目标，Flow Matching 则学习一条“风场”，让每一点顺着风（速度场）稳稳滑向数据，路径更直更快。",
  "explanationFocus": "是什么：Flow Matching 是一类基于连续归一化流的生成方法，通过回归一个把噪声映射到数据的速度场，用确定性 ODE 完成采样。",
  "approach": "构造从噪声到数据的简单概率路径（如直线 Rectified Flow），在任意 t 采样点 x_t 并监督网络预测该处速度 u_t；采样时用 ODE 求解器积分 v_θ。",
  "derivation": [
    "为什么需要：扩散随机 SDE 路径曲折、步数多；FM 用 ODE 直线路径更快更可控。",
    "怎么实现：定义条件路径与速度，用回归损失训练 v_θ，ODE 求解采样。",
    "有什么代价：需选好路径与 ODE 步数；路径太直在复杂分布上可能需更多步。",
    "怎么评测：比 FID 与采样步数，验证 ODE 一致性（同种子确定性）。"
  ],
  "edgeCases": [
    "t=0 全为数据、t=1 全为噪声，端点处速度定义需连续。",
    "直线路径对多模态分布可“穿越”低密度区，需足够网络容量。",
    "与扩散互转：RF 可视为特殊方差 schedule 的扩散。"
  ],
  "pitfalls": [
    "把速度场当成噪声预测——两者量纲与语义不同，需换目标。",
    "忽略 ODE 求解器误差，步数过少会偏离目标分布。"
  ],
  "prerequisites": [
    "连续归一化流",
    "ODE 求解器",
    "扩散模型基础"
  ],
  "workedExample": [
    "采样 x0 与噪声 ε，随机 t∈[0,1] 算直线插值 x_t。",
    "目标速度 u_t = ε - x0，监督 v_θ(xt,t) 回归。",
    "采样从 ε 起用 Euler 集成 50 步得 x0_hat。"
  ],
  "lineByLine": [
    "xt 按 (1-t)x0 + t·noise 在数据与噪声间线性混合。",
    "ut = noise - x0 是该直线处的真实速度方向。",
    "model(xt,t) 预测速度，MSE 直接监督，比 ELBO 更简洁。"
  ],
  "followUps": [
    {
      "question": "Flow Matching 与扩散本质区别？",
      "answer": "扩散是随机 SDE、预测噪声；FM 是确定性 ODE、预测速度场，路径更直、步数更少但可互相近似。"
    },
    {
      "question": "Rectified Flow 为何叫“直”？",
      "answer": "它用直线概率路径，使最优传输方向近似直线，采样式 OT 意义下最短。"
    },
    {
      "question": "能和蒸馏结合吗？",
      "answer": "可以，RF + 蒸馏（如 SD3、FLUX）可几步出图。"
    }
  ],
  "followUpAnswers": [
    "扩散是随机 SDE、预测噪声；FM 是确定性 ODE、预测速度场，路径更直、步数更少但可互相近似。",
    "它用直线概率路径，使最优传输方向近似直线，采样式 OT 意义下最短。",
    "可以，RF + 蒸馏（如 SD3、FLUX）可几步出图。"
  ],
  "order": 6
};
