export default {
  "id": "ci-uplift",
  "kind": "concept",
  "category": "因果推断",
  "title": "uplift/增量建模与 Qini 曲线",
  "difficulty": "Hard",
  "prompt": "uplift 建模与普通响应模型有什么本质区别？常用哪几类方法，Qini 曲线如何衡量其增益？",
  "quickAnswer": "普通模型预测 P(Y=1)，uplift 预测增量 Δ=P(Y=1|T=1)−P(Y=1|T=0)(即处理对个体的因果效应)。方法包括两类法(class transformation)、双模型差(分别训 T=1/0 模型相减)、因果森林(直接建模异质效应)。Qini 曲线按预测 uplift 降序分组，画累计增益，曲线下面积类似 AUM 衡量排序质量。",
  "code": "import numpy as np\n\ndef class_transformation_label(t, y):\n    # 两类法: 处理且转化=+1, 对照且未转化=+1, 其余=-1\n    return np.where((t == 1) & (y == 1), 1,\n            np.where((t == 0) & (y == 0), 1, -1))\n\ndef qini_curve(uplift_pred, t, y, n_bins=10):\n    order = np.argsort(-uplift_pred)\n    cum_gain, treated, control = [], 0.0, 0.0\n    for i in order:\n        if t[i] == 1: treated += y[i]\n        else: control += y[i]\n        n_t = max(1, int((t[:i + 1] == 1).sum()))\n        n_c = max(1, int((t[:i + 1] == 0).sum()))\n        cum_gain.append((treated / n_t) - (control / n_c))\n    return cum_gain",
  "complexity": "两类法/双模型 O(N·d)；因果森林 O(N·d·T)；Qini O(N log N)",
  "beginnerSummary": "普通模型猜\"谁会买\"，uplift 猜\"推了才买、不推就不买\"的人，把优惠只发给这种\"可被说服者\"，避免给本来就会买的人白送券。",
  "explanationFocus": "是什么：uplift(增量)建模估计处理对每个个体的因果效应增量 Δ_i，目标是找出\"只对处理有正向反应\"的人群做精准干预，而非预测结果本身。",
  "approach": "用两类法/双模型差/因果森林估计个体 uplift，再按 uplift 排序投放，用 Qini 曲线评估增益。",
  "derivation": [
    "为什么需要：整体 ATE 小不代表无人受益，营销预算应投给增量最大的人群。",
    "怎么实现：两类法把问题转成单模型分类；双模型差分别训两组再相减；因果森林直接估异质效应。",
    "有什么代价：需要同时含处理与对照的数据；个体 uplift 方差大、对样本量敏感。",
    "怎么评测：用 Qini 曲线/增益图衡量排序质量，看高 uplift 群体真实增量。"
  ],
  "edgeCases": [
    "数据需同时含处理与对照(随机实验或更严谨观测)，否则无偏增量不可得。",
    "样本量不足时分位桶不稳定，Qini 曲线抖动大。",
    "异质效应估计方差大，单一个体 uplift 不可靠，需群体层面使用。"
  ],
  "pitfalls": [
    "把响应模型(P(Y))当 uplift 用，把预算给本来就会转化的人。",
    "未做随机实验就估 uplift，观测混杂使增量估计偏倚。"
  ],
  "prerequisites": [
    "潜在结果框架",
    "因果森林/随机森林基础"
  ],
  "workedExample": [
    "1000 人随机推送券，处理组转化 12%、对照组 8%，整体 uplift=4%。",
    "按预测 uplift 降序前 20% 人群，Qini 增益=(0.30−0.08)=0.22，远高于随机的 0.04，说明精准投放显著增效。"
  ],
  "lineByLine": [
    "def class_transformation_label：把(处理且转化)与(对照且未转化)标 +1，其余 −1，转成单模型可学标签。",
    "def qini_curve：按预测 uplift 降序遍历，累计处理/对照转化率差。",
    "cum_gain.append：每步记录当前累计增益，连成 Qini 曲线用于评估排序。"
  ],
  "followUps": [
    {
      "question": "两类法有什么局限？",
      "answer": "它把问题压成单一标签，丢失了处理组与对照组各自的绝对值信息，对类别不平衡和标签定义敏感，且只能给出排序而非校准的增量值；双模型差或因果森林通常更灵活。"
    },
    {
      "question": "Qini 系数和 AUC 有什么关系？",
      "answer": "Qini 曲线类似 uplift 排序的增益曲线，Qini 系数近似其相对曲线下面积；它衡量\"按模型 uplift 降序投放\"相比随机投放能多获得多少转化增量，越高说明模型越会把预算投给真正受影响的用户。"
    }
  ],
  "followUpAnswers": [
    "它把问题压成单一标签，丢失了处理组与对照组各自的绝对值信息，对类别不平衡和标签定义敏感，且只能给出排序而非校准的增量值；双模型差或因果森林通常更灵活。",
    "Qini 曲线类似 uplift 排序的增益曲线，Qini 系数近似其相对曲线下面积；它衡量\"按模型 uplift 降序投放\"相比随机投放能多获得多少转化增量，越高说明模型越会把预算投给真正受影响的用户。"
  ],
  "order": 10
};
