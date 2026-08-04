export default {
  "id": "ocr-pp-ocrv6",
  "category": "OCR 文字检测与识别",
  "difficulty": "Medium",
  "title": "PP-OCRv6 与轻量 OCR 体系",
  "prompt": "PP-OCRv6 的轻量 OCR 体系在检测、方向、识别三个模型上做了哪些关键设计，为什么适合工业落地？",
  "quickAnswer": "PP-OCRv6 采用更优的轻量检测/识别 backbone 与知识蒸馏、方向分类协同，端到端精度与速度平衡，提供 mobile/server 多级模型，易于训练部署与导出。",
  "code": "from paddle import nn\n\nclass PPOCRv6Pipeline:\n    def __init__(self, det, cls, rec):\n        self.det, self.cls, self.rec = det, cls, rec\n\n    def infer(self, img):\n        boxes = self.det(img)                     # 文本检测\n        outs = []\n        for b in boxes:\n            crop = warp_by_box(img, b)\n            crop = self.cls.correct(crop)         # 方向校正\n            outs.append(self.rec(crop))           # 文本识别\n        return outs\n\ndef export_static(model, path):\n    \"\"\"导出为静态图便于端侧/服务端部署\"\"\"\n    nn.static.save_inference_model(path, model)\n",
  "complexity": "时间 O(检测+Σ识别)，空间 O(模型权重+最大批特征)",
  "beginnerSummary": "PP-OCRv6 像一套“检测→转正→识别”的标准流水线工具箱，官方把三个小模型调好打包，拿来就能跑，还能按手机或服务器的算力选大小。",
  "derivation": [
    "为什么需要：工业 OCR 既要精度又要能在端侧实时跑，单模型难兼顾，需要模块化轻量体系。",
    "怎么实现：分别优化检测(SVTR/轻 backbone)、方向分类(浅 CNN)、识别(轻量序列模型)，并用蒸馏与量化压缩，提供统一推理接口。",
    "有什么代价：模块化带来多次前向与后处理开销；轻量化会牺牲部分极端场景精度，需要按业务选模型档位。",
    "怎么评测：在标准中文/英文/多语言基准上对比精度与 FPS，并测端侧 latency 与内存占用。"
  ],
  "edgeCases": [
    "极长横幅文本超出识别最大宽",
    "中英混排",
    "低光照/运动模糊",
    "竖排与艺术字"
  ],
  "pitfalls": [
    "直接替换 backbone 而不重训识别头导致错位",
    "忽略导出格式与运行时算子差异",
    "未对齐三个模型的输入预处理"
  ],
  "prerequisites": [
    "OCR 流水线",
    "模型量化/蒸馏",
    "推理部署基础"
  ],
  "workedExample": [
    "对一张含中英文发票，det 出 20 框，cls 将 2 个倒置框转正，rec 输出 20 段文本。",
    "移动端选 PP-OCRv6 mobile 模型，在骁龙上达到实时且内存可控。"
  ],
  "lineByLine": [
    "class PPOCRv6Pipeline: 组装三模型流水线。",
    "boxes=self.det(img): 先检测所有文本位置。",
    "self.cls.correct(crop): 逐框方向校正。",
    "self.rec(crop): 识别校正后文本；export_static 导出部署。"
  ],
  "followUps": [
    {
      "question": "PP-OCRv6 相比 v5 主要改进在哪？",
      "answer": "在检测/识别 backbone、训练策略(更强数据增广与蒸馏)和导出链路上优化，同等算力下精度更高、延迟更低。"
    },
    {
      "question": "如何从 PP-OCRv6 迁移到 TensorRT？",
      "answer": "将检测/识别模型导出为 ONNX 再构建 TensorRT 引擎，配合固定输入尺寸与 buffer 复用可显著降延迟与峰值显存。"
    }
  ],
  "followUpAnswers": [
    "在检测/识别 backbone、训练策略(更强数据增广与蒸馏)和导出链路上优化，同等算力下精度更高、延迟更低。",
    "将检测/识别模型导出为 ONNX 再构建 TensorRT 引擎，配合固定输入尺寸与 buffer 复用可显著降延迟与峰值显存。"
  ],
  "invariant": "infer 对每个检测框恰好执行一次方向校正与一次识别，输出顺序与 boxes 顺序一致。",
  "walkthrough": "img 经 det 得 3 框；框A 直立直接识别；框B 被 cls 判 180° 旋转后识别；框C 90° 转回；最终返回 3 段文本，顺序对应原框序。",
  "kind": "code"
};
