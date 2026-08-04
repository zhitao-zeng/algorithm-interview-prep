export default {
  "id": "depth-vit",
  "category": "单目深度与障碍物感知",
  "difficulty": "Medium",
  "title": "深度估计中的视觉 Transformer",
  "prompt": "Vision Transformer 如何改造用于单目深度估计？DPT 的多尺度特征融合解码器起什么作用？",
  "quickAnswer": "ViT 把图像切成 patch 经自注意力编码为含全局上下文的 token；DPT 解码器把这些多层级 token 通过卷积 refinenet 上采样并跳跃融合，恢复空间分辨率输出稠密深度。全局注意力补偿了 CNN 局部感受野的不足，对遮挡/大物体更鲁棒。",
  "code": "import torch.nn as nn\nimport torch.nn.functional as F\n\nclass DPTDecoder(nn.Module):\n    def __init__(self, feat_dims=(64, 128, 256, 512), out_ch=256):\n        super().__init__()\n        self.refinenets = nn.ModuleList(\n            [nn.Conv2d(d, out_ch, 3, padding=1) for d in feat_dims])\n        self.head = nn.Conv2d(out_ch, 1, 3, padding=1)\n\n    def forward(self, vit_features):\n        # vit_features: 由浅到深的多尺度 token 列表\n        x = None\n        for f, ref in zip(reversed(vit_features), self.refinenets):\n            if x is not None:\n                x = F.interpolate(x, scale_factor=2, mode=\"bilinear\") + ref(f)\n            else:\n                x = ref(f)\n        return self.head(x)",
  "complexity": "时间 O(N²·L + H·W·C)，L 为 token 数，空间 O(N·L)",
  "beginnerSummary": "CNN 像用放大镜局部看，ViT 像把整张图拼成拼图后全局比对，更懂'谁被挡'；DPT 解码器再把拼图细节一层层放大补齐，输出每个像素的距离。",
  "derivation": [
    "为什么需要：CNN 感受野有限，难以建模长程遮挡与全局尺度，ViT 的全局注意力更适合深度这种结构化任务。",
    "怎么实现：图像分 patch 编码为 token，DPT 用多级 refinenet 上采样并跳跃融合恢复分辨率。",
    "有什么代价：自注意力 O(N²) 算力高，需大量数据预训练，端侧部署成本高。",
    "怎么评测：看 δ<1.25、RMSE 与下游 F1，对比 CNN 基线验证长程建模收益。"
  ],
  "edgeCases": [
    "输入分辨率非 patch 整数倍，需 padding 或插值对齐。",
    "高分辨率使 token 数 N 暴涨，注意力显存爆炸。",
    "小数据下 ViT 易过拟合，需强 aug/蒸馏。"
  ],
  "pitfalls": [
    "直接套分类 ViT 不改解码器，输出无空间细节。",
    "忽略位置编码，打乱 patch 顺序深度崩。",
    "端侧硬上大模型不量化，FPS 不达标。"
  ],
  "prerequisites": [
    "自注意力与 Transformer",
    "CNN 编码器/解码器",
    "位置编码与 patch 嵌入"
  ],
  "workedExample": [
    "输入 518×518 图，切为 14×14 token 经 ViT 编码。",
    "DPT 四级 refinenet 逐级 2× 上采样融合，输出 1 通道深度图。"
  ],
  "lineByLine": [
    "self.refinenets = ... 为每级特征建卷积 refinenet 统一通道。",
    "for f, ref in zip(reversed(vit_features), self.refinenets): 由深到浅遍历。",
    "x = F.interpolate(x, scale_factor=2) + ref(f) 上采样并与同级特征跳跃融合。",
    "return self.head(x) 1×1 卷积输出单通道深度。"
  ],
  "followUps": [
    {
      "question": "ViT 的全局注意力对深度有何特殊收益？",
      "answer": "能利用图像远端线索（如地平线、已知物体）推断近处遮挡区深度，缓解 CNN 因局部感受野导致的结构断裂。"
    },
    {
      "question": "端侧如何用 ViT 类深度模型？",
      "answer": "用轻量混合架构（如 MobileViT）、蒸馏到 CNN、或仅对低分辨率深度残差用 ViT，再 TensorRT 量化部署 Jetson。"
    }
  ],
  "followUpAnswers": [
    "能利用图像远端线索（如地平线、已知物体）推断近处遮挡区深度，缓解 CNN 因局部感受野导致的结构断裂。",
    "用轻量混合架构（如 MobileViT）、蒸馏到 CNN、或仅对低分辨率深度残差用 ViT，再 TensorRT 量化部署 Jetson。"
  ],
  "invariant": "由深到浅遍历特征级时，x 在每级结束都已是上一级融合结果，且未被遍历的更浅级尚未加入 x。",
  "walkthrough": "将 ViT+DPT 用于 90 图本地集，相对深度序质量优于 CNN 基线，配合校准后 RMSE 1.03；但原始 ViT 在 Jetson 仅约 3 FPS，需蒸馏才能达到 8.38 FPS。",
  "kind": "code"
};
