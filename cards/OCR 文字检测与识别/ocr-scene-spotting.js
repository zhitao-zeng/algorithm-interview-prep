export default {
  "id": "ocr-scene-spotting",
  "category": "OCR 文字检测与识别",
  "difficulty": "Hard",
  "title": "场景文本 spotting（检测+识别联合）",
  "prompt": "场景文本 spotting 如何把检测与识别联合训练，相比两阶段分离有什么优势与难点？",
  "quickAnswer": "spotting 用统一网络(如基于实例分割或 Transformer)同时输出文本位置与内容，共享特征、端到端优化；优势是特征复用与上下文一致，难点是任务平衡与长尾字符标注。",
  "code": "import torch\nimport torch.nn as nn\n\nclass TextSpotter(nn.Module):\n    def __init__(self, backbone, det_head, rec_head):\n        super().__init__()\n        self.backbone = backbone\n        self.det_head = det_head          # 输出文本实例掩膜/框\n        self.rec_head = rec_head          # 基于实例特征做识别\n\n    def forward(self, x):\n        feat = self.backbone(x)\n        det_out = self.det_head(feat)\n        rec_out = self.rec_head(feat, det_out[\"instances\"])  # 共享特征+实例\n        return {\"det\": det_out, \"rec\": rec_out}\n\ndef spotter_loss(det_out, rec_out, det_gt, rec_gt):\n    return det_loss(det_out, det_gt) + 1.0 * rec_loss(rec_out, rec_gt)\n",
  "complexity": "时间 O(骨干+两 Head)，空间 O(共享特征+实例缓存)",
  "beginnerSummary": "spotting 像一个“边指边读”的高手：看到字的同时就说出它是什么、在哪，而不是先找再读两个人分工，信息更连贯。",
  "derivation": [
    "为什么需要：分离两阶段存在误差累积与重复计算，端到端 spotting 可利用共享特征提升一致性与效率。",
    "怎么实现：共享 backbone，检测头出实例，识别头在实例特征上解码；联合损失端到端训练。",
    "有什么代价：两任务梯度需平衡，训练更复杂；对未出现过的字符/语言域泛化更难，标注成本更高。",
    "怎么评测：用端到端指标(IoU+内容)算 Hmean，并分子集看检测与识别各自贡献。"
  ],
  "edgeCases": [
    "遮挡/部分可见文本",
    "极密集文本实例重叠",
    "未见字符或新语种",
    "旋转与弯曲文本实例"
  ],
  "pitfalls": [
    "检测与识别损失权重失衡导致一方塌缩",
    "实例特征对齐错误使识别读错实例",
    "训练数据偏置使 spotting 退化成纯检测"
  ],
  "prerequisites": [
    "实例分割",
    "检测+识别联合建模",
    "多任务损失平衡"
  ],
  "workedExample": [
    "基于 Mask TextSpotter：实例分割出每个字区域，mask 特征送识别头输出字符。",
    "对比两阶段：spotter 在弯曲文本上因共享上下文少一次特征提取，端到端快且更一致。"
  ],
  "lineByLine": [
    "class TextSpotter: 联合检测识别模型。",
    "self.backbone: 共享特征提取。",
    "det_head 出实例、rec_head 在实例上识别。",
    "spotter_loss: 检测+识别联合损失端到端回传。"
  ],
  "followUps": [
    {
      "question": "spotting 与 detection+recognition 解耦如何取舍？",
      "answer": "追求一致性与速度是选 spotting；需要单独替换/升级识别器或做 GT-crop Oracle 分析时，解耦更灵活可控。"
    },
    {
      "question": "联合训练如何防止识别头拖累检测？",
      "answer": "用梯度裁剪、任务权重调度或在识别头加 stop-gradient 早期冻结，先稳定检测再放开识别。"
    }
  ],
  "followUpAnswers": [
    "追求一致性与速度是选 spotting；需要单独替换/升级识别器或做 GT-crop Oracle 分析时，解耦更灵活可控。",
    "用梯度裁剪、任务权重调度或在识别头加 stop-gradient 早期冻结，先稳定检测再放开识别。"
  ],
  "invariant": "rec_head 使用的实例特征来自 det_out['instances']，每个识别输出与唯一检测实例一一对应。",
  "walkthrough": "x→backbone 得 feat；det_head 输出 3 个实例掩膜；rec_head 对每个实例 crop 特征并解码，返回 3 段文本；spotter_loss 将检测与识别误差求和反传。",
  "kind": "code"
};
