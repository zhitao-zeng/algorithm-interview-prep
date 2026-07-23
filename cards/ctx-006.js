export default {
  "kind": "concept",
  "id": "ctx-006",
  "category": "长上下文与位置编码",
  "difficulty": "Hard",
  "title": "RoPE 外推方案对比：PI / NTK / YaRN 优劣",
  "prompt": "PI、NTK-aware、YaRN 三种 RoPE 扩窗方案各有什么优劣，该如何选型？",
  "quickAnswer": "PI 最简单但>4x 局部失真且需千步微调；NTK-aware 保高频、可 zero-shot 但中频 OOD；YaRN 分段+温度最稳且微调最省（1/10 token），是开源默认；免训练外推则选 ALiBi 类。",
  "approach": "按『是否保高频 / 是否需微调 / 扩展倍数 / 实现成本』四维对比三方案。",
  "explanationFocus": "是什么：这是一道横向对比题——PI、NTK-aware、YaRN 都是 RoPE 模型的上下文扩窗法，差别在于『如何分配插值压力』与『是否修正注意力熵』，直接决定局部保真度、微调成本与最大可扩倍数。",
  "bruteForce": "逐个方案试错成本高；更优是先按维度理解各自失配点：PI 毁高频、NTK 中频 OOD、YaRN 补两者加温度。",
  "derivation": [
    "为什么需要：不同业务对『扩展倍数/微调预算/短任务保真』要求不同，必须能按约束选型而非盲选。",
    "怎么实现：PI 用位置×s 全局均匀压缩；NTK-aware 抬高基频 b'=b·s^(d/(d−2)) 保高频；YaRN 在 NTK-by-parts 上加温度与 dynamic scaling；三者都可叠加 Dynamic 变体。",
    "有什么代价：PI 简单但局部失真且≈1000 步微调；NTK 可 zero-shot 但中频仍 OOD、大倍数需微调；YaRN 最稳最省微调，但参数(α,β,t)需按模型族调。",
    "怎么评测：同 s 下比 PPL 曲线、Passkey/needle 准确率、短上下文基准掉点；看『lost in middle』与最大可用长度。"
  ],
  "invariant": "选型不变式：扩展倍数小(≤4x)且想省事→PI；想免/少微调→NTK/dynamic；追求最大长度与短任务保真→YaRN；完全免训练外推→ALiBi。",
  "walkthrough": "例：目标 32K、仅数百步预算→YaRN（s=8，400 步达 128K 级）；纯推理不改权重→dynamic NTK；训短测长硬外推→ALiBi。",
  "edgeCases": [
    "PI 在 >4x 时质量不可逆下降，不要硬撑。",
    "NTK 实际扩展比要设得比目标更高（部分维外推）。",
    "YaRN 的 α/β/t 是模型族相关经验值，迁移需重调。"
  ],
  "code": "def compare_methods(s, dim=128, base=10000.0):\n    pi_base = base                      # PI: 位置×1/s\n    ntk_base = base * (s ** (dim/(dim-2)))\n    return {'PI_scale': 1/s, 'NTK_base': ntk_base,\n            'YaRN': 'NTK-by-parts + temp'}\n\n# 选型提示(建议二次核对各模型族最优超参)\nRECOMMEND = {'<=4x+省事': 'PI', '免/少微调': 'NTK/dynamic',\n             '最大长度+保真': 'YaRN', '免训练外推': 'ALiBi'}",
  "codeNotes": [
    "三方案核心区别仅在『如何改频率/位置』，其余 RoPE 计算不变。",
    "RECOMMEND 为经验选型，具体超参建议二次核对论文/模型卡。"
  ],
  "complexity": "三者预计算均 O(dim)，推理零额外开销；主要差异在微调步数与可扩上限，而非算力。",
  "followUps": [
    {
      "question": "为什么 YaRN 微调比 PI 省那么多？",
      "answer": "分段插值保住了高频与局部结构、温度修正了注意力分布，模型只需少量适应即可，约 1/10 token、1/2.5 步数。"
    },
    {
      "question": "三者能组合或叠加吗？",
      "answer": "可以且常叠加 Dynamic Scaling（按当前长度调 s），YaRN 本身即 NTK-by-parts 的升级；ALiBi 是另一路线不混用。"
    }
  ],
  "followUpAnswers": [
    "分段插值保住了高频与局部结构、温度修正了注意力分布，模型只需少量适应即可，约 1/10 token、1/2.5 步数。",
    "可以且常叠加 Dynamic Scaling（按当前长度调 s），YaRN 本身即 NTK-by-parts 的升级；ALiBi 是另一路线不混用。"
  ],
  "pitfalls": [
    "以为『扩窗方法越强越该无脑用 YaRN』而忽略超参调优成本。",
    "混淆各方案缩放方向（PI 压位置、NTK/YaRN 改频率）。"
  ],
  "beginnerSummary": "PI 像整把尺子压扁（近邻也糊），NTK 只拉大尺度保近邻，YaRN 再补一刀把注意力聚焦度调回来——一个比一个稳，但也一个比一个稍复杂。",
  "prerequisites": [
    "PI 位置插值",
    "NTK-aware 插值",
    "YaRN 三件套"
  ],
  "workedExample": [
    "目标 32K，预算 400 步：选 YaRN（s=8）。",
    "纯推理不改权重：选 dynamic NTK；硬外推：选 ALiBi。"
  ],
  "lineByLine": [
    "compare_methods：对比三种方案的基频/缩放。",
    "RECOMMEND：按约束（倍数/微调/外推）给出经验选型。",
    "注释提醒超参需二次核对，避免盲用。"
  ],
  "diagram": "方案   局部保真  免微调  最大倍数  实现\nPI      ✗        ✗       ~4x     易\nNTK     ✓        △      中       中\nYaRN    ✓        △      大       中+\nALiBi   短任务弱  ✓      大       易"
};
