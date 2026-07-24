export default {
  "kind": "concept",
  "id": "quant-int8-sym-asym",
  "category": "量化推理",
  "difficulty": "Easy",
  "title": "INT8 对称与非对称量化",
  "prompt": "INT8 对称量化和非对称量化公式分别是什么，怎么选？",
  "quickAnswer": "对称量化假设分布关于 0 对称：x_q=round(x/s)，s=max(|x|)/127，零点 z=0；非对称量化 x_q=round(x/s)+z，z 把最小值平移到 0，能更好贴合 [0,255] 或 [min,max] 的非对称分布。权重多对称、激活(ReLU 后非负)常非对称。",
  "approach": "权重用对称，激活用非对称(或统一对称+per-channel)。",
  "explanationFocus": "是什么：对称量化零点恒为 0、公式最简；非对称量化引入零点平移以贴合偏置分布。",
  "bruteForce": "直接 round(x*127/max) 不涉及零点，对全非负张量浪费一半码点。",
  "derivation": [
    "为什么需要：ReLU 后激活全非负，若强制对称会把一半 INT8 码点浪费在负半轴，非对称可省码点提精度。",
    "怎么实现：对称 s=max|x|/127,z=0；非对称 s=(max-min)/255,z=round(-min/s)，量化=round(x/s)+z。",
    "有什么代价：非对称多存一个零点、反量化多一步减法，硬件略复杂。",
    "怎么评测：同张量下比较对称/非对称的相对量化误差(SNR)与下游精度。"
  ],
  "invariant": "INT8 共 256 个码点；非对称把码点铺满实际 [min,max]。",
  "walkthrough": "激活范围 [0,6]，非对称 s=6/255≈0.0235,z=0,码点铺满；若对称则 [-6,6] 浪费负半轴。",
  "edgeCases": [
    "权重近对称但略有偏，对称足够。",
    "激活含 0 占比高，非对称更稳。",
    "混合: 权重对称+激活非对称是常见组合。"
  ],
  "code": "# Python\ndef sym_asym_quant(x, sym=True, bits=8):\n    if sym:\n        s = x.abs().max() / (2**(bits-1)-1)\n        return (x / s).round(), s, 0\n    qmax = 2**bits - 1\n    s = (x.max() - x.min()) / qmax\n    z = (-x.min() / s).round()\n    return (x / s).round() + z, s, z",
  "codeNotes": [
    "对称 z=0 硬件最友好。",
    "非对称 z 用 int 存储, 反量化 x≈(x_q-z)*s。"
  ],
  "complexity": "O(元素) 统计 max/min；反量化每元素一次乘/加减。",
  "followUps": [
    {
      "question": "为什么权重常用对称？",
      "answer": "权重(尤其预训练)分布近似零中心且含正负，对称不浪费码点且公式简单、kernel 高效。"
    },
    {
      "question": "零点 z 存成浮点还是整数？",
      "answer": "z 通常存为整数(与量化值同类型)，反量化时再参与整数运算或转浮点，避免额外精度损失。"
    }
  ],
  "followUpAnswers": [
    "权重对称、激活非对称最常见。",
    "z 多为整数以省存储。"
  ],
  "pitfalls": [
    "对全非负激活用对称，浪费一半动态范围。",
    "忘记零点参与反量化导致偏移。"
  ],
  "beginnerSummary": "INT8 像一把只有 256 格的尺。对称尺以 0 为中心(左右各 127 格)，适合正负都有的情况；非对称尺把 0 格挪到最小处，256 格全用来量\"非负\"的东西——测身高(总≥0)就用非对称更精细。",
  "prerequisites": [
    "INT8 有 256 个整数码点。",
    "权重分布常含正负。",
    "ReLU 后激活非负。"
  ],
  "workedExample": [
    "对称: x∈[-1,1], s=1/127, 量化=round(127x)。",
    "非对称: x∈[0,6], s=6/255,z=0。"
  ],
  "lineByLine": [
    "求张量范围(min/max 或 |max|)。",
    "算 scale 与零点。",
    "浮点除 scale 后 round。",
    "存整数, 反量化乘回 scale 减 z。"
  ],
  "diagram": "对称:  -127 .... 0 .... 127   (z=0)\n非对称: 0 .... 255        (z 平移, 铺满[min,max])"
};
