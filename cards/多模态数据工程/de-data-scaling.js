export default {
  "id": "de-data-scaling",
  "category": "多模态数据工程",
  "difficulty": "Medium",
  "title": "数据 scaling law",
  "prompt": "多模态预训练中存在怎样的数据 scaling law？如何用它来预测不同数据规模下的模型表现并指导数据采购？",
  "quickAnswer": "经验上多模态模型损失随训练 token 数 D 与模型参数 N 呈幂律下降：L ≈ a·D^(-α) + c。可利用小规模实验外推大模型/大数据下的 loss 与下游指标，从而在预算内决定\"加数据还是加参数\"更划算。",
  "approach": "在若干数据规模上训练小模型测 loss，拟合幂律参数 α、a、c，再用其外推目标规模，并结合边际收益决定是否继续采购数据。",
  "explanationFocus": "是什么：数据 scaling law 描述模型性能（通常用损失）随数据量、参数量等资源平滑变化的幂律规律；它让团队用小规模实验预测大规模收益，指导数据采购与算力分配。",
  "bruteForce": "朴素做法：凭直觉直接买最大数据、训最大模型，不做任何可预测的成本-收益分析。",
  "invariant": "核心不变式：在固定算力/模型下，loss 与数据量的对数呈近似线性（幂律），拟合曲线外推误差随距离增大而增大。",
  "walkthrough": "在 D=10M/30M/100M/300M 上训同架构小模型得 loss=3.2/2.9/2.6/2.35；对 log L 做线性回归得纯幂律 L≈13.8·D^(-0.091)，外推 D=1B 得约 2.1。相比把参数翻倍（边际收益更小），加数据更划算，故优先采购数据。",
  "code": "def scaling_loss(D, a, alpha, c):\n    return a * (D ** (-alpha)) + c\ndef fit(points):\n    import numpy as np\n    xs = np.log([p[0] for p in points])\n    ys = np.log([p[1] - 0.0 for p in points])\n    k, _ = np.polyfit(xs, ys, 1)\n    return -k  # alpha 近似",
  "complexity": "拟合为 O(点数) 的线性回归，预测为 O(1)；真正的成本在小规模训练实验本身。",
  "beginnerSummary": "像施肥实验：先在小块地试不同施肥量看产量，画出\"肥越多产越高但增幅变缓\"的曲线，再推算大规模该买多少肥最值。",
  "diagram": "log D ───────────────►\n loss\n 3.2 |*\n 2.9 | *\n 2.6 |  *\n 2.35|   *\n      └─ 幂律下降，外推到 1B",
  "derivation": [
    "为什么需要：训练昂贵，需事前估计\"加数据/加算力\"的边际收益以优化预算。",
    "怎么实现：多规模小实验测 loss，拟合幂律并外推目标规模。",
    "有什么代价：小规模与目标规模存在分布/正则差异，外推有误差，且只反映 loss 非下游。",
    "怎么评测：用实际大规模训练结果回校拟合参数，看预测误差是否在可接受范围。"
  ],
  "edgeCases": [
    "数据质量随规模下降（后期买的更脏）破坏幂律。",
    "过拟合使小模型拟合失真。",
    "下游任务指标并非严格幂律，需单独拟合。",
    "数据去重程度不同改变有效 D。"
  ],
  "pitfalls": [
    "把 loss 的 scaling 直接等同下游收益，忽略任务饱和。",
    "用质量不一致的数据点拟合导致 α 失真。"
  ],
  "prerequisites": [
    "幂律与对数坐标",
    "线性回归拟合",
    "损失与下游指标关系"
  ],
  "workedExample": [
    "points=[(10M,3.2),(30M,2.9),(100M,2.6),(300M,2.35)]。",
    "polyfit 得 alpha≈0.09，外推 D=1B 得 loss≈2.1。",
    "对比加参数的边际收益更低 → 决策优先扩数据。"
  ],
  "lineByLine": [
    "def scaling_loss(D,a,alpha,c): 幂律损失预测函数。",
    "def fit(points): 用多点拟合幂律指数。",
    "xs=np.log([p[0]...]); ys=np.log([p[1]...]) 取对数做线性化。",
    "k,_=np.polyfit(xs,ys,1); return -k 斜率即 alpha 近似。"
  ],
  "codeNotes": [
    "真实拟合需对常数 c 做更严谨的非线性回归，示例为简化。"
  ],
  "followUps": [
    {
      "question": "scaling law 能预测下游准确率吗？",
      "answer": "只能近似且误差更大，通常先预测 loss 再经验映射到下游，关键任务需单独小规模实测。"
    },
    {
      "question": "数据变脏后 law 还成立吗？",
      "answer": "不成立，有效数据量受质量与去重影响，需用有效 D 而非原始 D 拟合。"
    }
  ],
  "followUpAnswers": [
    "只能近似且误差更大，通常先预测 loss 再经验映射到下游，关键任务需单独小规模实测。",
    "不成立，有效数据量受质量与去重影响，需用有效 D 而非原始 D 拟合。"
  ],
  "kind": "concept"
};
