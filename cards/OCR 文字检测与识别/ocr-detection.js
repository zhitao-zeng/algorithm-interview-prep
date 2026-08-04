export default {
  "id": "ocr-detection",
  "category": "OCR 文字检测与识别",
  "difficulty": "Medium",
  "title": "文本检测（DBNet / EAST / CTPN）",
  "prompt": "DBNet、EAST、CTPN 在文本检测范式上有何区别，像素级与框级预测各自适合什么场景？",
  "quickAnswer": "CTPN 基于固定宽度 anchor 序列做框级检测，适合横向文本；EAST 做像素级几何回归(旋转矩形)；DBNet 用可微分二值化做像素级概率图，边缘更精准且易部署。",
  "code": "import torch\nimport torch.nn.functional as F\n\ndef dbnet_threshold_map(prob, adaptive_th, k=50.0):\n    \"\"\"可微分二值化：近似阶跃融合概率图与自适应阈值图\"\"\"\n    return 1.0 / (1.0 + torch.exp(-k * (prob - adaptive_th)))\n\ndef dbnet_postprocess(binary, min_area=3, thresh=0.3):\n    \"\"\"由二值图取连通域得到文本框\"\"\"\n    masks = (binary > thresh).float()\n    boxes = connected_components(masks, min_area)  # cv2/自定义连通域\n    return boxes\n",
  "complexity": "时间 O(H·W)，空间 O(H·W)",
  "beginnerSummary": "文本检测像是先在图上“描出所有写字的地方”。像素级方法是给每个像素打分再连成块；框级方法是直接预测一个个候选框。",
  "derivation": [
    "为什么需要：自然场景文字形状、方向、尺度多变，传统滑窗分类太慢，需要端到端定位文本区域。",
    "怎么实现：CTPN 用 RNN 串联水平 anchor 预测；EAST 像素回归旋转矩形五参数；DBNet 用阈值图做可微二值化得到清晰边界。",
    "有什么代价：像素级方法对极端长宽比和密集小字敏感，需要后处理(连通域/NMS)；框级方法对弯曲文本不友好。",
    "怎么评测：用文本框 IoU(0.5/0.7)计算 Precision/Recall/Hmean，关注小字与多方向子集。"
  ],
  "edgeCases": [
    "竖直排列的中文标题",
    "极度细长或密集的小字",
    "与背景对比度极低的文本",
    "弯曲艺术字"
  ],
  "pitfalls": [
    "把 DBNet 二值图阈值设死导致断笔",
    "CTPN 直接用于竖排或弯曲文本",
    "忽略尺度归一化造成小目标漏检"
  ],
  "prerequisites": [
    "卷积网络基础",
    "锚框(anchor)机制",
    "图像二值化"
  ],
  "workedExample": [
    "ICDAR2015 自然场景图：DBNet 输出概率图后经可微二值化得清晰文本边界。",
    "对一张含竖排店招的图，EAST 用旋转矩形直接覆盖，CTPN 需拆成多段。"
  ],
  "lineByLine": [
    "import torch: 引入深度学习框架。",
    "def dbnet_threshold_map(prob, adaptive_th, k): 实现可微二值化近似阶跃。",
    "torch.exp(-k*(prob-adaptive_th)): k 越大越接近硬阈值。",
    "def dbnet_postprocess: 对二值图取连通域并过滤小区域得到最终框。"
  ],
  "followUps": [
    {
      "question": "DBNet 的可微分二值化相比固定阈值有什么训练优势？",
      "answer": "梯度可回传到阈值图，使网络在训练时就能学出“哪里该被二值化为文本”的软边界，推理时仍能用标准二值化加速。"
    },
    {
      "question": "弯曲文本检测为什么单靠旋转矩形不够？",
      "answer": "旋转矩形无法拟合弧线，需要多边形(如 PSENet/CTPN+分割)或参数曲线表示，否则长弧文字会被截断或引入大量背景。"
    }
  ],
  "followUpAnswers": [
    "梯度可回传到阈值图，使网络在训练时就能学出“哪里该被二值化为文本”的软边界，推理时仍能用标准二值化加速。",
    "旋转矩形无法拟合弧线，需要多边形(如 PSENet/CTPN+分割)或参数曲线表示，否则长弧文字会被截断或引入大量背景。"
  ],
  "invariant": "prob 与 adaptive_th 在二值化后始终保持同分辨率 H×W，逐像素独立变换。",
  "walkthrough": "输入 640×640 概率图 prob 与阈值图 adaptive_th；k=50 时 prob-adaptive_th 经 sigmoid 近似阶跃，>0 处趋近 1；postprocess 取 >0.3 连通域，过滤面积<3 的噪声，输出文本多边形。",
  "kind": "code"
};
