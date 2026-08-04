export default {
  "id": "ml-xgboost",
  "category": "因果推断与树模型",
  "difficulty": "Hard",
  "title": "XGBoost 与 Random Forest 原理及精算建模应用",
  "prompt": "XGBoost 在精算赔付预测中把 AUC 做到 0.914，请说明它的目标函数、与 Random Forest 的核心差异，以及工程上如何调参防止过拟合？",
  "quickAnswer": "XGBoost 是加法模型，目标函数含可微损失 + 二阶泰勒近似的正则化项（叶子权重与叶子数惩罚）；Random Forest 靠 Bagging 与随机特征子空间降低方差。XGBoost 通过 max_depth、min_child_weight、subsample、eta 与早停控制复杂度，精算场景常用小树深 + 小 eta 配合 early_stopping 稳定到 AUC≈0.914。",
  "code": "import xgboost as xgb\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import roc_auc_score\n\ndef train_xgb(X, y, params=None):\n    X_tr, X_val, y_tr, y_val = train_test_split(X, y, test_size=0.2, random_state=42)\n    dtrain = xgb.DMatrix(X_tr, label=y_tr)\n    dval = xgb.DMatrix(X_val, label=y_val)\n    p = params or {\"max_depth\": 4, \"eta\": 0.05,\n                   \"subsample\": 0.8, \"colsample_bytree\": 0.8,\n                   \"objective\": \"binary:logistic\", \"eval_metric\": \"auc\"}\n    bst = xgb.train(p, dtrain, num_boost_round=600,\n                    evals=[(dval, \"val\")], early_stopping_rounds=40, verbose_eval=False)\n    pred = bst.predict(dval)\n    return bst, roc_auc_score(y_val, pred)",
  "complexity": "时间 O(n·k·d·log n)，空间 O(n·d)（n 样本数，k 棵树，d 树深）",
  "beginnerSummary": "Random Forest 像很多专家各自看一部分资料后投票，稳但偏保守；XGBoost 像新手逐个修正前人的错误，学到更精细的规律，所以 AUC 更高但也要管住别学过头。",
  "derivation": [
    "为什么需要：精算赔付高度非线性且类别不平衡，线性模型与单棵深树都难兼顾偏差与方差，需要可加、可正则、可并行的强学习器。",
    "怎么实现：以加法模型迭代加入回归树，目标函数用二阶泰勒展开近似损失，解析求得每片叶子最优权重，并加 λ·||w||² 与 γ·T 作正则。",
    "有什么代价：树深与轮数过大会过拟合，需靠 max_depth、min_child_weight、subsample、eta 与早停约束，训练成本也高于单棵 RF。",
    "怎么评测：用验证集 AUC 与早停监控，精算上还可看 Gini、KS 与校准后的赔付分布，确保 0.914 在样本外稳定。"
  ],
  "edgeCases": [
    "类别极不平衡时正样本占比 <1%，需设 scale_pos_weight 或分层抽样。",
    "缺失值 XGBoost 原生支持但 RF 需先 impute，否则 sklearn 会报错。",
    "特征含高基数类别（保单号）须先做目标编码或 hash，避免树分裂过碎。",
    "样本量巨大时要用 sparse DMatrix 与 GPU hist 直方图树方法降内存。"
  ],
  "pitfalls": [
    "把 early_stopping 的验证集同时用于选超参，会造成乐观偏差。",
    "eta 过小但 num_boost_round 不足会让模型欠拟合，需二者联动调。",
    "精算常误用准确率评测，赔付稀有事件下 AUC 比准确率更能反映排序能力。"
  ],
  "prerequisites": [
    "决策树分裂准则（信息增益 / Gini）",
    "梯度下降与泰勒二阶展开",
    "Bagging 与 Boosting 方差-偏差权衡"
  ],
  "workedExample": [
    "取 100 万条车险保单，标签为是否发生赔款，特征含车龄、地区、历史出险。",
    "设 max_depth=4、eta=0.05、subsample=0.8，训练 600 轮早停在 360 轮，验证集 AUC=0.914。",
    "对比 Random Forest 同数据 AUC 约 0.895，说明 boosting 在此非线性精算任务更优。"
  ],
  "lineByLine": [
    "import xgboost / sklearn 工具：载入训练与评测依赖。",
    "train_test_split(test_size=0.2)：划分训练与验证，固定 random_state 保证可复现。",
    "xgb.DMatrix(...)：把 ndarray 转成 XGBoost 高效内部格式，支持缺失标记。",
    "params 中 max_depth/eta/subsample/colsample_bytree：控制单树复杂度与随机性防过拟合。",
    "xgb.train(..., early_stopping_rounds=40)：在验证集 AUC 不再提升 40 轮后停，返回最优轮模型。",
    "roc_auc_score(y_val, pred)：用 AUC 量化排序能力，对应精算 0.914 指标。"
  ],
  "followUps": [
    {
      "question": "XGBoost 的二阶展开相比只用一阶梯度（如 SGB）好在哪？",
      "answer": "二阶项给出损失的曲率信息，使每片叶子权重有解析最优解 w*=-G/(H+λ)，收敛更快、对尺度更稳，也更易处理自定义可微损失。"
    },
    {
      "question": "精算场景如何防止 XGBoost 预测赔付概率被校准偏移？",
      "answer": "用 Platt/Isotonic 在校验集上做概率校准，并以可靠性图检查；业务上再用单德维特平滑或暴露加权修正尾部，避免极端保单概率失真。"
    }
  ],
  "followUpAnswers": [
    "二阶项给出损失的曲率信息，使每片叶子权重有解析最优解 w*=-G/(H+λ)，收敛更快、对尺度更稳，也更易处理自定义可微损失。",
    "用 Platt/Isotonic 在校验集上做概率校准，并以可靠性图检查；业务上再用单德维特平滑或暴露加权修正尾部，避免极端保单概率失真。"
  ],
  "explanationFocus": "是什么：XGBoost 是一种梯度提升树实现，以加法方式逐棵加入回归树，并在目标函数中显式加入正则项，兼具高准确率与防过拟合能力；它把损失用二阶泰勒展开，使每片叶子权重可解析求解。",
  "approach": "核心思路是把预测写成 K 棵树的和 f(x)=Σ_k f_k(x)，每轮拟合上一轮残差的二阶近似梯度方向，用 max_depth/subsample/eta/早停控制复杂度，最终以验证集 AUC（精算场景 0.914）衡量排序质量。",
  "kind": "concept"
};
