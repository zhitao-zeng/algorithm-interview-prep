export default {
  "kind": "concept",
  "id": "mm-preprocess",
  "category": "多模态模型",
  "difficulty": "Easy",
  "title": "推理时图像预处理流水线",
  "prompt": "多模态模型在推理时，一张图进模型前要经过怎样的预处理流水线？",
  "quickAnswer": "推理流水线通常是：解码图像 → resize/pad 到模型输入尺寸 → 归一化(均值方差) → 转 tensor → 切 patch → 视觉编码器 → 连接器对齐 → 拼入 LLM 提示。高分辨率还需切图/动态分辨率。任何一步不一致(如训练/推理归一化不同)都会掉点，因此预处理必须与训练严格对齐。",
  "approach": "解码 → resize/pad → 归一化 → tensor → patch → 编码 → 对齐 → 入 LLM。",
  "explanationFocus": "是什么：推理时图像预处理流水线是图像从原始文件变成模型可消费视觉 token 的一系列固定步骤，必须与训练时一致。",
  "bruteForce": "直接把任意尺寸原图喂编码器：尺寸不匹配、分布漂移。",
  "derivation": [
    "为什么需要：模型只在固定尺寸/分布上训过，原始图尺寸、值域不一，必须先标准化。",
    "怎么实现：统一解码、按策略 resize/pad、用训练同款均值方差归一化、转 CHW tensor、再走 patch+编码器+连接器。",
    "有什么代价：resize 丢细节；pad 引入无效 token；高分辨率切图增加序列与延迟。",
    "怎么评测：对齐性测试(同图同输出)、端到端精度与预处理耗时占比。"
  ],
  "invariant": "同一图像在相同配置下得到确定且可复现的预处理结果。",
  "walkthrough": "原图 1000x800 → resize 最短边 336 → pad 到 336x336 → 归一化 → patch14 → 576 token。",
  "edgeCases": [
    "非 RGB(含 alpha)：需转 RGB。",
    "极端长宽比：pad 浪费 token。",
    "训练/推理归一化不一致：严重掉点。"
  ],
  "code": "def preprocess(img, size=336, mean=(0.485,0.456,0.406), std=(0.229,0.224,0.225)):\n    img = decode_rgb(img)\n    img = resize_shortest(img, size)\n    img = pad_to_square(img, size)\n    t = to_tensor(img).normalize(mean, std)     # 与训练一致\n    return t",
  "codeNotes": [
    "均值方差必须和训练一致。",
    "pad 会增加无效视觉 token。"
  ],
  "complexity": "预处理 O(像素)；主导成本是编码器而非预处理本身。",
  "followUps": [
    {
      "question": "为什么训练推理归一化必须一致？",
      "answer": "否则输入分布偏移，编码器表征整体偏移，下游精度明显下滑。"
    },
    {
      "question": "高分辨率怎么处理？",
      "answer": "切图(把大图分成若干子图各编码)或动态分辨率，再合并视觉 token。"
    }
  ],
  "followUpAnswers": [
    "避免输入分布偏移掉点。",
    "切图或动态分辨率。"
  ],
  "pitfalls": [
    "忽视训练/推理预处理差异。",
    "pad 引入大量无效 token 拖慢。"
  ],
  "beginnerSummary": "预处理就像照相亲前的统一化妆标准： everyone 先调成同样的尺寸、同样的亮度色调，再进场。如果训练和考试时的\"化妆标准\"不一样，模型就会认不出人。高个子(高分辨率)还得裁成几张标准照分别处理。",
  "prerequisites": [
    "模型只在固定尺寸/分布训练。",
    "归一化影响表征分布。",
    "训练推理须一致。"
  ],
  "workedExample": [
    "1000x800 → 最短边 336 → pad 正方形。",
    "归一化后切 14 patch → 576 token。"
  ],
  "lineByLine": [
    "解码为 RGB。",
    "resize 最短边并 pad 方形。",
    "按训练均值方差归一化。",
    "转 tensor 后切 patch 编码。"
  ],
  "diagram": "文件 ─▶ 解码RGB ─▶ resize/pad ─▶ 归一化 ─▶ tensor ─▶ patch ─▶ 编码"
};
