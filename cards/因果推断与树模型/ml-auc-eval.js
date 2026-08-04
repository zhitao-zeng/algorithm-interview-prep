export default {
  "id": "ml-auc-eval",
  "category": "因果推断与树模型",
  "difficulty": "Medium",
  "title": "分类模型评测：AUC 与 ROC 曲线",
  "prompt": "如何用 Wilcoxon-Mann-Whitney 视角从排序计算 AUC，并解释 ROC 曲线与 AUC 在类别不平衡下的局限？",
  "quickAnswer": "AUC 等价于随机抽一正一负样本、正样本得分更高的概率：AUC=(∑rank_pos - n_pos(n_pos+1)/2)/(n_pos·n_neg)。ROC 是不同阈值下 TPR 对 FPR 的轨迹，AUC 是其下面积。类别极不平衡时 AUC 仍稳但 PR 曲线/AUPRC 更能反映稀有正类表现。",
  "code": "import numpy as np\n\ndef roc_auc(y_true, y_score):\n    y_true = np.asarray(y_true)\n    y_score = np.asarray(y_score)\n    order = np.argsort(y_score)\n    ranks = np.empty(len(y_score), dtype=float)\n    ranks[order] = np.arange(1, len(y_score) + 1)\n    ties = np.isclose(y_score[order][1:], y_score[order][:-1])\n    ranks[order][1:][ties] = (ranks[order][1:][ties] + ranks[order][:-1][ties]) / 2.0\n    n_pos = y_true.sum()\n    n_neg = len(y_true) - n_pos\n    return float((ranks[y_true == 1].sum() - n_pos * (n_pos + 1) / 2) / (n_pos * n_neg))\n\ndef compute_roc(y_true, y_score, n=100):\n    thr = np.linspace(0, 1, n)\n    fpr = [float(((y_score >= t) & (y_true == 0)).mean()) for t in thr]\n    tpr = [float(((y_score >= t) & (y_true == 1)).mean()) for t in thr]\n    return fpr, tpr",
  "complexity": "时间 O(n log n)（排序），空间 O(n)",
  "beginnerSummary": "AUC 就像给模型打分：随便抓一个会出险的和一个不会出险的，看模型能不能把“会出险”排得更靠前，排对的概率就是 AUC。",
  "derivation": [
    "为什么需要：单一阈值准确率在不平衡数据上会失真，需要衡量模型整体排序能力而不依赖截断点。",
    "怎么实现：按得分排序赋秩，正类秩和减去最小可能秩和再除以正负对数得 AUC；ROC 遍历阈值记录 (FPR,TPR)。",
    "有什么代价：AUC 对得分绝对值与校准不敏感，且极不平衡时高 AUC 也可能漏掉多数正类，需配 PR 曲线。",
    "怎么评测：报告 AUC 及置信区间，结合 KS、Gini（=2·AUC-1）与 PR-AUC，在业务阈值处看精确率/召回。"
  ],
  "edgeCases": [
    "所有得分相同时秩取平均，AUC 退化为 0.5。",
    "正类为 0 或全为正时分母为零，AUC 无定义须报错或跳过。",
    "存在并列得分需平均秩，否则 AUC 有偏。",
    "样本量极小导致 AUC 置信区间极宽，需 bootstrap。"
  ],
  "pitfalls": [
    "类别不平衡时只看 AUC 忽略 AUPRC，会高估稀有事件模型。",
    "用准确率替代 AUC，在 99% 负类时模型全预测负即得 99% 却无排序力。",
    "把训练集 AUC 当泛化能力，未做验证集评估。"
  ],
  "prerequisites": [
    "混淆矩阵（TP/FP/TN/FN）",
    "真正率 TPR 与假正率 FPR",
    "排序与秩次统计基础"
  ],
  "workedExample": [
    "精算赔付标签中正类（出险）仅占 3%，模型输出概率得分。",
    "按 roc_auc 算得 AUC=0.914，说明随机抽一出一险一不出险，模型 91.4% 概率把出险者排前。",
    "但 AUPRC 仅 0.21，提示稀有正类绝对识别仍有限，需配合阈值调优。"
  ],
  "lineByLine": [
    "np.argsort(y_score)：得升序索引，作为赋秩基础。",
    "ranks[order]=arange(1..n)：把样本按得分从低到高赋 1..n 秩。",
    "ties 平均秩处理：并列得分取平均秩避免偏差。",
    "n_pos/n_neg 统计正负样本数，构造 AUC 分母。",
    "rank_pos 求和减最小秩和后除以正负对数，得到 Mann-Whitney 式 AUC。",
    "compute_roc：遍历阈值输出 FPR/TPR 序列供画 ROC。"
  ],
  "followUps": [
    {
      "question": "Gini 系数和 AUC 的关系是什么，精算为何常用 Gini？",
      "answer": "精算 Gini = 2·AUC - 1，把随机 0.5 映射到 0，更直观表示区分度提升；监管与再保常用 Gini 报告模型排序力。"
    },
    {
      "question": "什么情况下 AUC 高但业务价值低？",
      "answer": "当正类极稀有且业务关注绝对召回时，AUC 高只说明排序好，若top分段覆盖不足正类，实际捕获率低，需看 PR 曲线与lift。"
    }
  ],
  "followUpAnswers": [
    "精算 Gini = 2·AUC - 1，把随机 0.5 映射到 0，更直观表示区分度提升；监管与再保常用 Gini 报告模型排序力。",
    "当正类极稀有且业务关注绝对召回时，AUC 高只说明排序好，若top分段覆盖不足正类，实际捕获率低，需看 PR 曲线与lift。"
  ],
  "explanationFocus": "是什么：AUC 是 ROC 曲线下面积，等价于随机抽一个正样本和一个负样本、模型把正样本排在负样本之前的概率；它衡量的是排序质量而非绝对概率，对阈值选择不敏感。",
  "approach": "核心思路是把样本按预测得分排序并赋秩，用正类秩和公式 (∑rank_pos - n_pos(n_pos+1)/2)/(n_pos·n_neg) 直接计算 AUC，同时遍历阈值得到 ROC；类别不平衡时辅以 PR-AUC 与 Gini=2AUC-1。",
  "kind": "concept"
};
