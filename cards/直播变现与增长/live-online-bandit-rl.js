export default {
  id: 'live-online-bandit-rl', category: '直播变现与增长', kind: 'concept', difficulty: 'Hard', order: 9,
  title: '在线 Bandit 与强化学习怎样安全落地',
  prompt: '如何利用直播实时反馈优化策略，又避免在线探索伤害用户、收入或安全？',
  quickAnswer: '单步选动作可先用 contextual bandit，在上下文下平衡探索与利用；多步会话和长期影响才考虑 MDP/RL。先用日志策略概率做 IPS/DR 离线评估，再以白名单动作、预算、频控、风险约束和小流量灰度上线；持续监控 reward 分解、策略漂移和守卫指标，异常立即回退。不能让模型自由探索价格、支付或高风险内容。',
  beginnerSummary: '在线学习像一边营业一边试菜单：可以小范围尝试，但必须限定可试的菜、预算和停损线。只有“当前选哪个”时 bandit 往往够用；当前动作还会改变后续状态时才需要完整 RL。',
  explanationFocus: '安全在线学习的核心不是算法名，而是动作空间、反馈延迟、反事实评估、风险约束和可回滚发布。',
  approach: '先定义状态、动作、reward 和禁区；记录行为策略 propensity；用回放/IPS/DR 做离线候选筛选；shadow→小流量→分阶段放量；为 reward hacking、异常动作占比、延迟和长期指标设自动熔断。',
  derivation: ['Bandit 只考虑当前上下文与动作回报，状态转移较弱时更简单稳健。', 'RL 用折扣累计回报表达长期影响，但样本效率、稳定性和离线评估更困难。', 'off-policy 评估需要知道旧策略选择动作的概率，并控制极端重要性权重。', '约束策略把安全、频控、合规和预算放在优化器之外的硬边界。'],
  prerequisites: ['Contextual Bandit、MDP、策略与折扣回报', 'IPS/DR 离线策略评估和 A/B 灰度'],
  workedExample: ['假设只在三种已审核礼物入口样式间选择，可用 bandit 小流量探索；不能让模型生成任意价格或支付动作。', '若奖励只写即时付费，策略可能高频打扰用户；加入退出、投诉、留存和频控约束后才接近真实目标。'],
  diagram: '日志 + propensity ─▶ 离线 OPE ─▶ 候选策略\n候选策略 ─▶ shadow ─▶ 小流量 ─▶ 分阶段放量\n安全约束 / 守卫监控 ───────────▶ 熔断回退',
  complexity: '在线决策必须满足单请求延迟预算；离线 OPE 的主要风险是方差和支持集不足，而非简单的计算量。',
  edgeCases: ['新策略选择日志中几乎没出现的动作，无法可靠离线评估。', '奖励延迟跨天，在线更新误把未回传样本当负例。', '多策略同时运行造成反馈归因不清。'],
  pitfalls: ['把任何实时模型更新都称为强化学习。', '没有记录行为策略概率，却声称用 IPS 得到可靠离线结论。'],
  followUps: [{ question: '什么时候 bandit 比 RL 更合适？', answer: '动作主要影响当前回报、状态转移弱且需要更易评估部署时，bandit 通常是更稳的起点。' }, { question: '怎样防 reward hacking？', answer: '拆分 reward、增加体验和风险约束，监控动作分布及异常行为，并用人工审计和长期 A/B 验证。' }]
};
