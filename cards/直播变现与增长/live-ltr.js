export default {
  id: 'live-ltr', category: '直播变现与增长', kind: 'concept', difficulty: 'Hard', order: 6,
  title: 'LTR：Pointwise、Pairwise 与 Listwise 怎么选',
  prompt: '直播间、主播或礼物候选排序为什么是 Learning to Rank 问题？三类 LTR 目标如何比较？',
  quickAnswer: 'Pointwise 把每个候选独立做分类/回归，简单且容易校准；Pairwise 学同一请求中正负候选的相对顺序，更贴近排序但样本对很多；Listwise 直接优化整页列表或 NDCG 近似，更接近最终目标但训练复杂。工业上可用 GBDT/LambdaMART 或 DNN 排序，关键是按 request 分组、处理曝光偏差，并用列表指标和线上实验评估。',
  beginnerSummary: '推荐不是判断一个直播间“好不好”，而是在同一次请求的多个候选里决定谁排前面。LTR 的三种方法分别把训练单位看成一个候选、一对候选或整张列表。',
  explanationFocus: 'LTR 的核心是相对次序和展示位置；若把不同请求的候选随意混在一起，训练目标会失真。',
  approach: '以 request/session 为 query group；构造点击、停留、互动和付费标签；先做 pointwise 基线，再比较 pairwise/listwise；使用 NDCG、MRR、GAUC 与校准指标；最后用 A/B 检查真实行为和守卫指标。',
  derivation: ['Pointwise：优化单样本预测误差，部署简单，但不直接感知列表内部交换。', 'Pairwise：让偏好候选分数高于另一个候选，需控制负采样与样本对规模。', 'Listwise/Lambda：用列表指标变化决定梯度权重，更关注头部位置。', '去偏：训练数据由旧策略曝光产生，需要位置特征、随机流量或 IPS 等方法减轻选择偏差。'],
  prerequisites: ['推荐系统召回、粗排、精排与重排', 'AUC、GAUC、NDCG 和位置偏差'],
  workedExample: ['同一请求有 A/B/C 三个直播间，真实反馈偏好为 B>A>C；pairwise 可构造 B>A、B>C、A>C，而不是拿另一位用户的候选随意配对。', '若新模型只把第 50 名和第 51 名换位，业务价值通常小于交换第 1 名和第 10 名；NDCG/Lambda 类目标会体现位置差异。'],
  diagram: 'Pointwise：候选 ─▶ 标签\nPairwise：(候选 A, 候选 B) ─▶ 谁更优\nListwise：[A, B, C, ...] ─▶ 整体顺序 / NDCG',
  complexity: 'Pointwise 约随样本数增长；朴素 Pairwise 可产生平方级样本对，通常需采样；Listwise 成本随每个 query 的候选数和排序操作增长。',
  edgeCases: ['一个请求只有正反馈或没有反馈，pairwise 难构造。', '未曝光候选没有可直接观察的标签。', '付费标签稀疏且延迟，容易被点击等稠密目标压制。'],
  pitfalls: ['把普通二分类模型换个名字就称为完整 LTR。', '离线随机切分曝光样本，造成同一用户或未来信息泄漏。'],
  followUps: [{ question: 'LambdaMART 为什么常用于排序？', answer: '它用树模型拟合非线性表格特征，并按候选交换对 NDCG 等指标的影响构造 Lambda 梯度，直接强调关键排序位置。' }, { question: 'LTR 和重排有什么区别？', answer: 'LTR 通常学习候选相关性/价值分数；重排还显式处理多样性、频控、生态、公平和规则约束。' }]
};
