export default {
  "id": "gen-controlnet",
  "kind": "concept",
  "category": "生成式模型",
  "title": "ControlNet / Adapter",
  "difficulty": "Medium",
  "prompt": "ControlNet / Adapter 是如何在预训练扩散模型上注入边缘 / 姿态 / 深度等条件、实现可控生成的？",
  "quickAnswer": "ControlNet 复制一份可训练的编码器分支（常零初始化）接收条件图（如边缘 Canny、姿态 OpenPose、深度），其输出通过残差加到冻结的主扩散 U-Net 各层，从而在不破坏原模型的前提下注入空间结构控制。Adapter 类（如 T2I-Adapter）则用轻量小网络把条件编码后加为额外特征，更省参数。",
  "code": "class ControlNet(nn.Module):\n    def __init__(self, unet):\n        self.blocks = clone(unet.blocks)   # 可训练副本\n        self.zero = nn.ZeroConv2d()        # 零卷积稳定\n    def forward(self, x, t, cond, hint):\n        feat = self.blocks(x, t, cond)\n        return self.zero(feat) + hint      # 残差注入主网",
  "complexity": "O(H·W·C) + 约 1× 额外分支",
  "beginnerSummary": "给画家递一张“线稿/骨架”当底图：ControlNet 学会照着这张结构图来上色创作，使生成结果既自由又严格符合你给的形状。",
  "explanationFocus": "是什么：ControlNet 是一类在冻结的预训练扩散模型外挂一个条件编码分支、通过零初始化残差把边缘/姿态/深度等空间条件注入生成过程的可控生成方法。",
  "approach": "锁定原始权防止灾难性遗忘，复制编码器接收条件图，每层输出经 zero-conv 加到主网对应层；训练只更新新分支，使其学会把结构信号转化为特征调制。",
  "derivation": [
    "为什么需要：纯文生图难以精确控制构图/姿态，需空间条件。",
    "怎么实现：克隆可训分支 + zero-conv 残差注入，条件图编码对齐主网分辨率。",
    "有什么代价：多一份分支显存与推理成本；条件图质量直接决定控制力。",
    "怎么评测：定量比条件对齐度（如姿态误差）与 FID，人工看保真。"
  ],
  "edgeCases": [
    "zero-conv 初始化保证训练初期不干扰主网。",
    "条件图分辨率需与主网特征对齐（下采样匹配）。",
    "多条件可堆叠多个 ControlNet（multi-control）。"
  ],
  "pitfalls": [
    "忘记冻结主网→原生成能力被破坏。",
    "条件图与文本冲突时以哪一为准需调权重。"
  ],
  "prerequisites": [
    "预训练扩散 U-Net",
    "残差连接",
    "零初始化技巧"
  ],
  "workedExample": [
    "用 Canny 提取原图边缘作 hint。",
    "ControlNet 分支编码 hint 并残差注入 SD U-Net。",
    "给新文本“赛博朋克”，生成同构图不同风格图。"
  ],
  "lineByLine": [
    "blocks 是主网编码器可训练副本，从条件图学习结构。",
    "zero 为零卷积，初期输出 0，保护主网。",
    "forward 把分支特征经 zero-conv 加回主网，实现可控调制。"
  ],
  "followUps": [
    {
      "question": "ControlNet 与 Adapter 区别？",
      "answer": "ControlNet 复制完整编码器分支更重更准；Adapter 用轻量网络编码条件，参数少、快但控制力弱。"
    },
    {
      "question": "zero-conv 为何重要？",
      "answer": "零初始化使新分支初始无贡献，避免随机初始化破坏已训好的主网生成。"
    },
    {
      "question": "多条件怎么融合？",
      "answer": "可并联多个 ControlNet 分别控制，或用 union 版单网络多条件输入。"
    }
  ],
  "followUpAnswers": [
    "ControlNet 复制完整编码器分支更重更准；Adapter 用轻量网络编码条件，参数少、快但控制力弱。",
    "零初始化使新分支初始无贡献，避免随机初始化破坏已训好的主网生成。",
    "可并联多个 ControlNet 分别控制，或用 union 版单网络多条件输入。"
  ],
  "order": 9
};
