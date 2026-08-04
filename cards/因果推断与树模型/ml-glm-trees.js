export default {
  "id": "ml-glm-trees",
  "category": "因果推断与树模型",
  "difficulty": "Hard",
  "title": "GLM Trees 在保险定价与因果推断中的应用",
  "prompt": "GLM Trees 如何把广义线性模型与决策树结合，用于保险费率厘定与异质性处理效应估计？",
  "quickAnswer": "GLM Trees 在树的每个叶子拟合一个 GLM（如 Gamma+Log 链接、带 exposure 偏移），先递归按偏差减小分裂，再在叶内做可解释回归。保险上每片叶子给出费率乘数，因果上每片叶子对应一个子群体，其系数即该群体的条件处理效应（CATE）。",
  "code": "import numpy as np\nimport statsmodels.api as sm\n\ndef fit_glm_leaf(X, y, exposure):\n    Xd = sm.add_constant(X)\n    model = sm.GLM(y, Xd,\n                   family=sm.families.Gamma(),\n                   var_weights=exposure,\n                   link=sm.families.links.Log())\n    res = model.fit()\n    return res.params, res.predict(Xd)\n\ndef deviance_reduction(y, exposure, left_idx, right_idx):\n    def dev(idx):\n        mu = y[idx].sum() / exposure[idx].sum()\n        return -2 * (np.log(mu) * y[idx].sum() - mu * exposure[idx].sum()).sum()\n    return dev(np.concatenate([left_idx, right_idx])) - dev(left_idx) - dev(right_idx)",
  "complexity": "时间 O(n·d·L)，空间 O(n)（n 样本、d 特征、L 叶子）",
  "beginnerSummary": "普通 GLM 给所有人一套公式，GLM Tree 先把客户按风险切成几堆，每堆各自算一套费率公式，既像树一样能抓差异，又像回归一样可解释。",
  "derivation": [
    "为什么需要：纯 GLM 假设全局线性且交互有限，纯树对连续目标噪声大；保险需要可解释的费率且要处理异质性效应。",
    "怎么实现：在树节点用 GLM 偏差作分裂准则，叶子内拟合带 exposure 的 Gamma/Log GLM，逐层递归得到分段 GLM。",
    "有什么代价：分裂-拟合交替使调参复杂，叶子 GLM 在样本少时不稳定，需限制最小叶子 exposure 与树深。",
    "怎么评测：对比全局 GLM 的偏差残差、看叶子费率单调性是否合理，并以外样本赔付比（actual/expected）校验校准。"
  ],
  "edgeCases": [
    "某叶子 exposure 过小会导致 Gamma GLM 无法收敛，须设最小曝光阈值。",
    "连续特征严格单调性（如年龄越大费率越高）可能被树切出违反业务规则的叶子，需后处理约束。",
    "零膨胀赔付（多数 0 小额）建议改用 Tweedie 族而非 Gamma。",
    "高基数类别需先分箱，否则分裂过碎。"
  ],
  "pitfalls": [
    "把叶子预测当独立模型，忽略 exposure 加权导致小样本叶子误导全局费率。",
    "用普通 MSE 分裂而非偏差，对右偏赔付不敏感。",
    "误把树深度当可解释性保证，深层叶子系数仍难向精算师解释。"
  ],
  "prerequisites": [
    "广义线性模型（连接函数、指数族）",
    "偏差（deviance）与似然比",
    "决策树递归分裂"
  ],
  "workedExample": [
    "车险数据含车龄、地区、NCD 等级，目标为年赔付额、exposure 为 exposed-years。",
    "GLM Tree 先按地区分两堆，再按车龄细分，每片叶子拟合 Log-Gamma GLM 得到费率乘数。",
    "对比全局 GLM 偏差降低 8%，且高风险子群体 CATE 明显更高，用于差异化定价。"
  ],
  "lineByLine": [
    "import numpy/statsmodels：载入数值与 GLM 拟合库。",
    "sm.add_constant(X)：为 GLM 加入截距项。",
    "sm.GLM(..., family=Gamma(), var_weights=exposure, link=Log)：用曝光作方差权重、对数链接建模右偏赔付。",
    "model.fit()：IRWLS 迭代求极大似然系数与预测。",
    "deviance_reduction：按叶子 GLM 偏差下降决定最优二分点，dev 用对数似然近似偏差。"
  ],
  "followUps": [
    {
      "question": "GLM Trees 与 GBDT 在保险定价上如何取舍？",
      "answer": "GBDT 预测更准但黑盒、难满足监管可解释与单调性；GLM Tree 精度略低却每片叶子可写成费率公式，便于精算师复核与合规，常做主模型+树模型对照。"
    },
    {
      "question": "怎么用 GLM Tree 做异质性处理效应（CATE）估计？",
      "answer": "把处理×协变量交互纳入叶子 GLM，每片叶子系数即该子群体的条件平均处理效应，树结构自动发现效应差异最大的细分人群。"
    }
  ],
  "followUpAnswers": [
    "GBDT 预测更准但黑盒、难满足监管可解释与单调性；GLM Tree 精度略低却每片叶子可写成费率公式，便于精算师复核与合规，常做主模型+树模型对照。",
    "把处理×协变量交互纳入叶子 GLM，每片叶子系数即该子群体的条件平均处理效应，树结构自动发现效应差异最大的细分人群。"
  ],
  "explanationFocus": "是什么：GLM Trees 是一种混合模型——它在决策树的每个叶子节点拟合一个广义线性模型，而非常数预测；这样既保留树的异质性分割能力，又让每片叶子输出可解释、带 Exposure 加权的回归系数，常用于保险费率厘定。",
  "approach": "核心思路是用 GLM 的偏差（deviance）作为树分裂准则，自顶向下递归把样本切到不同子群体，再在叶内用 Gamma/Log 等族拟合带曝光权重的回归，最终得到“分段可解释 GLM”，并可把处理交互纳入叶子以估计 CATE。",
  "kind": "concept"
};
