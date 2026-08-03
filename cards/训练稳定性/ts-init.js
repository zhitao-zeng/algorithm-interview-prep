export default {
  "id": "ts-init",
  "category": "训练稳定性",
  "difficulty": "Easy",
  "title": "初始化稳定性",
  "prompt": "参数初始化为什么影响训练稳定性，深度模型中常用哪些初始化策略？",
  "quickAnswer": "不好的初始化会让前向激活方差随层数爆炸/消失，或让梯度在反向中消失/爆炸，导致早期loss平台或NaN。常用：Xavier（tanh/线性，保持输入输出方差一致）、Kaiming/He（ReLU系，考虑非负激活折半）、正交初始化（RNN/Transformer）、残差分支近零初始化（如ResNet最后BN/零初始化以保恒等）。",
  "approach": "按激活函数选初始化：ReLU系用He、tanh/sigmoid用Xavier；深层残差把捷径外的分支初始化成近零使初始为恒等；大模型可用固定缩放（如transformer的缩放因子1/√d）。",
  "explanationFocus": "是什么：初始化是给参数赋初值，目标是让前向每一层输出方差和反向梯度方差都大致恒定（不随深度爆炸或消失），从而保证训练从一开始就数值稳定。",
  "bruteForce": "全零初始化：所有神经元学成一样、对称权重无法打破；或大随机初始化（如N(0,1)）使深层激活方差指数增长直接NaN。",
  "invariant": "理想下对任意层l，Var(h_l)≈Var(h_{l-1})且Var(∂L/∂h_l)≈Var(∂L/∂h_{l+1})，即前向/反向方差跨层近似不变。",
  "walkthrough": "100层MLP，用N(0,0.1)初始化：第1层激活方差0.01，到第50层放大到1e6（爆炸），反向梯度变成NaN。改He初始化（σ=√(2/fan_in)≈0.14）后，各层激活方差稳定在~1.0，前10步loss即从2.3平滑降到1.9。",
  "code": "import torch.nn as nn\n\ndef init_weights(m):\n    if isinstance(m, nn.Linear):\n        # He/Kaiming 初始化，适配ReLU系\n        nn.init.kaiming_normal_(m.weight, nonlinearity=\"relu\")\n        nn.init.zeros_(m.bias)\n    elif isinstance(m, nn.LayerNorm):\n        nn.init.ones_(m.weight); nn.init.zeros_(m.bias)\n",
  "complexity": "时间：初始化为一次性 O(参数量)；错误初始化导致训练失败的成本是整轮重训 O(步数×参数量)。",
  "beginnerSummary": "初始化像调音响初始音量：太大一开机就爆音（梯度爆炸），太小听不见（梯度消失）；合适音量各层都清晰可闻。",
  "diagram": "\n 错误: 激活方差 0.01 -> 1 -> 100 -> 1e6 (爆炸)\n 正确(He): 1.0 -> 1.0 -> 1.0 -> 1.0 (恒定)\n 反向梯度同理保持恒定\n",
  "derivation": [
    "为什么需要：方差随深度漂移会让早期训练失效或NaN，必须从源头控制。",
    "怎么实现：按激活选Xavier/He，残差分支近零初始化，LayerNorm给单位权重。",
    "有什么代价：选错初始化仅影响早期稳定性，纠正成本是一次重启，代价低但易忽视。",
    "怎么评测：前向随机输入跑几层，检查各层激活方差是否在[0.5,2]且反向梯度有限。"
  ],
  "edgeCases": [
    "残差分支不近零初始化：初始就不是恒等，深层易不稳定。",
    "LayerNorm权重非1：缩放激活破坏方差守恒。",
    "RNN用Xavier仍梯度消失，宜用正交初始化。",
    "bias未零初始化：引入常值偏置累积。"
  ],
  "pitfalls": [
    "对ReLU用Xavier导致方差偏小、深层信号弱。",
    "全零初始化造成对称权重无法打破。"
  ],
  "prerequisites": [
    "方差Propagation直觉",
    "激活函数特性",
    "前反向信号流"
  ],
  "workedExample": [
    "100层MLP用N(0,0.1)初始化，第50层激活方差达1e6爆炸。",
    "改用kaiming_normal_(nonlinearity=relu)后各层方差稳定~1.0。",
    "前10步loss从2.3平滑降到1.9，无NaN。"
  ],
  "lineByLine": [
    "isinstance(m,nn.Linear) 对线性层施加He初始化。",
    "kaiming_normal_ 按fan_in缩放，适配ReLU保持方差。",
    "zeros_(m.bias) 偏置置零避免常值偏移。",
    "LayerNorm给ones权重、zeros偏置保单位变换。"
  ],
  "codeNotes": [
    "transformer中常配合缩放因子1/√d控制残差叠加幅度。"
  ],
  "followUps": [
    {
      "question": "Xavier和He的核心区别？",
      "answer": "Xavier假设对称激活（tanh）使输入输出方差一致；He针对ReLU类非负激活，因一半输出为0故用因子2放大。"
    },
    {
      "question": "残差网络为何要零初始化分支？",
      "answer": "让初始映射近似恒等f(x)=x，深层堆叠不破坏已有特征，训练更易起步。"
    }
  ],
  "followUpAnswers": [
    "Xavier假设对称激活（tanh）使输入输出方差一致；He针对ReLU类非负激活，因一半输出为0故用因子2放大。",
    "让初始映射近似恒等f(x)=x，深层堆叠不破坏已有特征，训练更易起步。"
  ],
  "kind": "concept"
};
