export default {
  "id": "rs-causal-rec",
  "kind": "concept",
  "category": "推荐系统",
  "title": "因果推荐：IPW 与双重稳健去偏",
  "difficulty": "Hard",
  "prompt": "推荐中的曝光偏置(selection bias)如何用 IPW 与 doubly-robust 估计量去除，反事实数据增广又是怎样补充未观测曝光的，它和 rs-debias 的去偏视角如何衔接？",
  "quickAnswer": "曝光偏置指用户只见到了系统决定曝光的物品，观测点击不等于喜好。IPW 用倾向得分 P(曝光|特征)的倒数加权，把观测样本反转为无偏总体估计；doubly-robust 再叠加模型直接预估与 IPW 残差，任一层正确即得无偏。反事实增广用因果图生成\"若曝光会怎样\"的补充样本。它与 rs-debias 同属去偏，rs-debias 偏工程纠偏、因果推荐偏辨识因果效应。",
  "code": "import numpy as np\n\ndef ipw_loss(y, pred, propensity):\n    # y: 观测点击; pred: 模型预估; propensity: 曝光倾向 P(o=1|x)\n    w = y / (propensity + 1e-6)            # 逆概率加权去 selection bias\n    return np.mean(w * (y - pred) ** 2)\n\ndef doubly_robust(y, pred, imputed, propensity):\n    # DR: 直接误差 + IPW 纠偏的残差, 任一层正确即无偏\n    direct = y - pred\n    ipw = (y - imputed) / (propensity + 1e-6)\n    return np.mean(direct - (1 - propensity) * ipw)\n\ndef propensity_model(score, eps=0.1):\n    # 曝光倾向截断防极端权重\n    return np.clip(score, eps, 1 - eps)",
  "complexity": "IPW/DR: O(N·d)，N 样本数",
  "beginnerSummary": "只因餐厅把某道菜放在门口，你点它的概率就高，不代表你最爱它；IPW 像按\"被摆在门口的概率\"反着加权，把这种位置优势削掉，看清你真实喜好。",
  "explanationFocus": "是什么：因果推荐用因果推断框架(倾向得分、反事实)去除曝光/选择偏置，使模型估计的是\"用户本会对物品作何反应\"而非\"系统让ta看到什么\"；IPW 与 doubly-robust 是两种核心无偏估计量。",
  "approach": "用倾向得分模型估 P(曝光|上下文)，IPW 以 1/e 加权纠偏；doubly-robust 结合直接预估与 IPW 残差得双重稳健；反事实增广补未观测曝光样本。",
  "derivation": [
    "为什么需要：观测数据被系统曝光策略选择， naive 训练会放大流行/位置偏置。",
    "怎么实现：训倾向模型得 e(x)，IPW 损失 y/e，DR 加直接项与残差。",
    "有什么代价：倾向估计不准会给极端权重，需截断(clip)与正则。",
    "怎么评测：在随机曝光或无偏数据集上比 naive 模型，看偏差下降。"
  ],
  "edgeCases": [
    "倾向得分 e→0 时 IPW 权重爆炸，需截断到 [eps, 1-eps]。",
    "未曝光物品无 label，反事实增广需谨慎避免引入假标签。",
    "倾向模型本身受历史偏置影响，需用随机流量或纠偏特征。"
  ],
  "pitfalls": [
    "直接用观测点击训练而不加权，模型复刻并放大历史曝光偏置。",
    "把 DR 的 IPW 残差符号写反，去偏变成加偏。"
  ],
  "prerequisites": [
    "因果推断与倾向得分",
    "推荐系统曝光偏置(selection bias)"
  ],
  "workedExample": [
    "倾向 e=0.3、观测 y=1、pred=0.8；IPW 权重=1/0.3≈3.33，加权误差=(1-0.8)×3.33=0.67，远大于未加权 0.2，迫使模型不依赖曝光多的物品。",
    "DR：imputed=0.75、e=0.3，direct=0.2，ipw 残差=(1-0.75)/0.3≈0.83，(1-e)=0.7；DR 项=0.2 - 0.7×0.83≈-0.38，相对 IPW 更稳定。"
  ],
  "lineByLine": [
    "def ipw_loss：用 1/倾向 对观测样本反概率加权。",
    "w = y/(propensity+eps)：曝光越少权重越大, 抵消选择偏置。",
    "def doubly_robust：直接误差减 (1-e) 倍的 IPW 残差。",
    "def propensity_model：把倾向截断, 防极端权重。"
  ],
  "followUps": [
    {
      "question": "IPW 和 doubly-robust 哪个更稳？",
      "answer": "DR 在倾向模型或结果模型任一层正确时即无偏，比 IPW 对倾向估计误差更鲁棒；代价是要额外训一个 imputation 模型，且两者都需倾向截断。"
    },
    {
      "question": "它和 rs-debias 的去偏视角有何联系？",
      "answer": "rs-debias 偏工程侧(位置/流行度纠偏、负采样校正)，因果推荐偏辨识因果效应(用 IPW/DR 估真实因果)；二者目标一致，因果框架能给 rs-debias 提供更严谨的理论依据。"
    }
  ],
  "followUpAnswers": [
    "DR 在倾向模型或结果模型任一层正确时即无偏，比 IPW 对倾向估计误差更鲁棒；代价是要额外训一个 imputation 模型，且两者都需倾向截断。",
    "rs-debias 偏工程侧(位置/流行度纠偏、负采样校正)，因果推荐偏辨识因果效应(用 IPW/DR 估真实因果)；二者目标一致，因果框架能给 rs-debias 提供更严谨的理论依据。"
  ],
  "order": 20
};
