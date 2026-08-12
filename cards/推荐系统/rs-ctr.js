export default {
  "id": "rs-ctr",
  "kind": "concept",
  "category": "推荐系统",
  "title": "CTR 预估演进：从 LR 到 DCN 交叉网络",
  "difficulty": "Medium",
  "prompt": "CTR 预估模型从 LR 到 FM、DeepFM，再到 DCN 的交叉网络(cross network)，DCN 是如何显式建模高阶特征交叉的，DCN v2 又为何要做低秩分解来压缩 cross 层参数？",
  "quickAnswer": "DCN 用交叉网络以逐层外积方式显式构造高阶交叉，避免 DNN 隐式学习的低效。v1 的 cross 层参数量随维度平方增长，v2 引入低秩分解 W=W_down·W_up+diag(v) 把参数从 O(d²) 降到 O(rd)，并支持专家混合捕捉多语义交叉。显式高阶交叉能在不加深 DNN 的前提下提升 CTR 表达力。",
  "code": "import numpy as np\n\ndef cross_layer(x0, x, W, b):\n    # DCN v1: x_{l+1} = x0 ⊙ (W x_l + b) + x_l\n    return x0 * (W @ x + b) + x\n\ndef cross_layer_lowrank(x0, x, W_down, W_up, v, b):\n    # DCN v2: W = W_down @ W_up + diag(v)，低秩分解降参数量\n    W = W_down @ W_up + np.diag(v)\n    return x0 * (W @ x + b) + x",
  "complexity": "v1 cross: O(L·d²)；v2 低秩: O(L·r·d)，L 为交叉层数",
  "beginnerSummary": "LR 只把积木并排摆(线性)，DNN 偷偷揉成复杂形状却说不清怎么揉；DCN 像乐高说明书，明确写出\"第1块×第3块\"这种组合规则，v2 再把说明书压成摘要版省纸。",
  "explanationFocus": "是什么：DCN(Deep & Cross Network)是一类用\"交叉网络\"逐层显式构造特征高阶交叉、再与 DNN 并联输出做 CTR 预估的模型；DCN v2 进一步用低秩分解压缩交叉层权重矩阵。",
  "approach": "交叉层按 x_{l+1}=x_0⊙(W_l x_l+b_l)+x_l 迭代，每步把原始输入 x_0 与当前表示的线性变换逐元素乘，显式产生高阶交叉；v2 将 W_l 低秩分解以降参。",
  "derivation": [
    "为什么需要：DNN 隐式学交叉效率低且需很深，LR/FM 只到一/二阶，显式高阶交叉更直接。",
    "怎么实现：cross 层 x_{l+1}=x_0⊙(W x_l+b)+x_l 迭代 L 层；v2 令 W=W_down W_up+diag(v) 低秩分解。",
    "有什么代价：v1 参数 O(d²) 在 d 大时昂贵；低秩会有轻微表达损失，需选 r 平衡。",
    "怎么评测：用 AUC/LogLoss 对比 DeepFM/DCN，看同参数量下 CTR 增益与训练内存。"
  ],
  "edgeCases": [
    "输入维度 d 很大(如 1024+)时 v1 cross 层参数爆炸，必须用 v2 低秩。",
    "数值溢出：逐层外积若在 sigmoid 前过大需做归一化或 clip。",
    "x_0 含未归一化连续特征时，⊙ 会把量纲放大，需先标准化。"
  ],
  "pitfalls": [
    "把 cross 层当成普通全连接，漏掉与 x_0 的逐元素乘，退化成 MLP。",
    "低秩秩 r 设过大等于 v1，设过小丢交叉信息，需按验证集调。"
  ],
  "prerequisites": [
    "Embedding 与特征交叉基础",
    "FM/DeepFM 与 CTR 对数损失"
  ],
  "workedExample": [
    "设输入维度 d=1024、交叉层数 L=3：v1 每层参数 d²+d≈105万，3 层约 315万；v2 取低秩 r=32，每层 2·(1024·32)+2·1024≈69k，3 层约 21万，参数降至约 1/15。",
    "交叉层数实验：L=2 时 Criteo AUC 0.802，L=4 升到 0.805 但训练慢 40%，L=6 出现过拟合，故工业常用 2~4 层。"
  ],
  "lineByLine": [
    "def cross_layer：实现 DCN v1 单层，公式 x0⊙(W@x+b)+x。",
    "x0 * (W @ x + b)：原输入与线性变换逐元素乘，制造交叉项。",
    "def cross_layer_lowrank：v2 先把 W 拆成 W_down@W_up+diag(v) 再同样计算。",
    "W_down @ W_up：低秩用 r×d 与 d×r 两小矩阵近似大矩阵以省参。"
  ],
  "followUps": [
    {
      "question": "DCN 的 cross 层和 FM 的二阶交叉有什么区别？",
      "answer": "FM 只到二阶且交叉由隐向量内积给出；DCN cross 层通过多层嵌套产生任意阶显式交叉，FM 是浅层、DCN 是深度显式交叉。"
    },
    {
      "question": "DCN v2 的低秩分解会损失什么？",
      "answer": "低秩把 W 限制为低维子空间，可能漏掉极端稀疏特征间的特殊交叉；实践中用多专家低秩(MoL)弥补，r 与专家数按验证集选。"
    }
  ],
  "followUpAnswers": [
    "FM 只到二阶且交叉由隐向量内积给出；DCN cross 层通过多层嵌套产生任意阶显式交叉，FM 是浅层、DCN 是深度显式交叉。",
    "低秩把 W 限制为低维子空间，可能漏掉极端稀疏特征间的特殊交叉；实践中用多专家低秩(MoL)弥补，r 与专家数按验证集选。"
  ],
  "order": 11
};
