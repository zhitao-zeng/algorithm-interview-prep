export default {
  "kind": "concept",
  "id": "train-continual-learning",
  "category": "训练与微调",
  "difficulty": "Hard",
  "title": "持续学习策略（replay / EWC / 模型编辑）",
  "prompt": "缓解灾难性遗忘的持续学习策略有哪些？",
  "quickAnswer": "常用回放(replay)旧数据、正则化(EWC 惩罚重要权重变动)、参数隔离/模型编辑，按场景组合使用。",
  "approach": "replay 混旧样本重练；EWC 用 Fisher 信息给重要权重加二次惩罚；模型编辑直接定位并修改特定知识神经元。",
  "explanationFocus": "是什么：持续学习是在不重训全部历史的前提下让模型顺序学新任务且不遗忘，主要策略有经验回放（保留并重练旧样本）、正则约束（如 EWC 保护重要参数）、以及模型编辑（精准修改特定知识）。",
  "bruteForce": "每来新任务就从头在所有历史数据上重训，算力不可行；或只训新任务则灾难性遗忘。",
  "derivation": [
    "为什么需要：真实场景任务流式到来，无法永远存全量或重训，需权衡『学新』与『记旧』。",
    "怎么实现：replay 维护样本缓冲池混合训练；EWC 损失加 λ·Σ F_i(θ_i-θ*_i)²；模型编辑用定位+局部更新（如 ROME）。",
    "有什么代价：replay 需存数据且有隐私顾虑；EWC 近似 Fisher 有偏、超参 λ 难调；编辑只适用局部事实。",
    "怎么评测：测『前向迁移/后向迁移』与遗忘率，看多任务序列末端各任务保持度。"
  ],
  "invariant": "回放最有效但需数据；EWC 轻量但有近似误差；编辑适合点状知识（建议二次核对各法适用边界）。",
  "walkthrough": "EWC：先算旧任务参数 Fisher 对角 F，新任务损失加 λΣF_i(θ_i-θ*_i)²，重要权重变动被抑，旧任务掉分减半。",
  "edgeCases": [
    "回放缓冲池大小有限导致长序列仍遗忘",
    "EWC 的 λ 过大则学不动新任务",
    "模型编辑可能引发未预料的副作用"
  ],
  "code": "def ewc_loss(base_loss, theta, theta_star, fisher, lam=1000):\n    reg = sum(f * (t - ts)**2 for f, t, ts in zip(fisher, theta, theta_star))\n    return base_loss + lam * reg",
  "codeNotes": [
    "fisher 为旧任务参数重要性（Fisher 信息对角）",
    "lam 控制保护强度，需验证集调"
  ],
  "complexity": "EWC 增加 O(参数) 正则项；replay 增加旧样本前向成本。",
  "followUps": [
    {
      "question": "replay 和 EWC 哪个更好？",
      "answer": "replay 通常效果更好但有数据存储成本，EWC 无需存数据但近似有偏；常组合使用。"
    },
    {
      "question": "模型编辑适合什么场景？",
      "answer": "适合纠正或注入少量事实性知识（如改错日期），不适合大规模能力更新。"
    }
  ],
  "followUpAnswers": [
    "replay 通常效果更好但有数据存储成本，EWC 无需存数据但近似有偏；常组合使用。",
    "适合纠正或注入少量事实性知识（如改错日期），不适合大规模能力更新。"
  ],
  "pitfalls": [
    "EWC 的 Fisher 用旧任务近似，跨任务可能失准",
    "回放数据泄露隐私或分布偏移"
  ],
  "beginnerSummary": "持续学习像『边学新课边复习旧课』：replay 是重做旧题，EWC 是给重要脑细胞贴『别乱改』标签，编辑是精准改某个记错的知识点。",
  "prerequisites": [
    "灾难性遗忘",
    "Fisher 信息",
    "正则化"
  ],
  "workedExample": [
    "维护 1000 条旧样本缓冲池，每新任务混 10% 回放",
    "或用 EWC 给 Top 重要权重加惩罚，λ=1000"
  ],
  "lineByLine": [
    "def ewc_loss(...): 定义带正则的损失",
    "reg 累加各参数重要性×变动平方",
    "base_loss + lam*reg：约束重要权重"
  ],
  "diagram": "新任务梯度 ─┬─ 学新\n              └─ EWC 惩罚 ─ 护旧权重"
};
