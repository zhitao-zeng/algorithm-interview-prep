export default {
  "kind": "concept",
  "id": "onnx-trt-fp16-int8",
  "category": "ONNX/TensorRT",
  "difficulty": "Medium",
  "title": "FP16 / INT8 支持",
  "prompt": "TensorRT 中 FP16 和 INT8 分别怎么支持，区别是什么？",
  "quickAnswer": "FP16 是半精度，几乎无损且只需开 BuilderFlag.FP16 即可自动转换，提速省显存；INT8 是 8 位定点，需做校准(calibration)确定每层缩放因子，精度可能下降但延迟/带宽收益更大，需用校准集估计激活分布。",
  "approach": "FP16：开 flag 直接降精度；INT8：提供校准器估计激活范围 → 计算 scale → 量化执行。",
  "explanationFocus": "是什么：FP16/INT8 是 TRT 支持的低精度推理模式，用更少比特表示张量以换速度。",
  "bruteForce": "全程 FP32：精度高但慢、显存与带宽吃紧。",
  "derivation": [
    "为什么需要：FP32 在带宽/算力上浪费，GPU 有更强 FP16/INT8 吞吐。",
    "怎么实现：FP16 直接类型转换；INT8 需校准得到激活 min/max→scale→量化/反量化。",
    "有什么代价：INT8 引入量化误差，需校准集与敏感性分析。",
    "怎么评测：用验证集测精度(如 top-1)与延迟/吞吐。"
  ],
  "invariant": "低精度输出相对 FP32 应落在任务可接受误差内。",
  "walkthrough": "resnet50：FP16 精度几乎不变、延迟降约 2×；INT8 精度掉 <0.5% 但延迟再降约 1.8×。",
  "edgeCases": [
    "对量化敏感的层(如 detection 的 bbox 头)可保持 FP16。",
    "无校准集时 INT8 不可用。",
    "某些算子不支持 INT8 需回退。"
  ],
  "code": "# Python (概念)：INT8 校准器骨架\ndef make_int8_calibrator(data_loader):\n    import tensorrt as trt\n    class Calib(trt.IInt8MinMaxCalibrator):\n        def __init__(self): self.b = 0\n        def get_batch(self, names):\n            try:\n                return [next(data_loader).numpy()]\n            except StopIteration:\n                return None\n        def get_algorithm(self): return trt.CalibrationAlgoType.ENTROPY_CALIBRATION_2\n    return Calib()",
  "codeNotes": [
    "校准只需少量代表样本。",
    "ENTROPY_CALIBRATION_2 较常用。"
  ],
  "complexity": "校准 O(样本数×图规模)；推理收益显著。",
  "followUps": [
    {
      "question": "INT8 为什么需要校准？",
      "answer": "要确定每层激活的量化范围(scale/zero-point)，否则截断误差大、精度崩。"
    },
    {
      "question": "FP16 要校准吗？",
      "answer": "不需要，FP16 是确定性的窄浮点，开 flag 即可，误差极小。"
    }
  ],
  "followUpAnswers": [
    "INT8 靠校准定 scale。",
    "FP16 免校准直接开。"
  ],
  "pitfalls": [
    "以为 INT8 免调参——校准集不具代表性会精度崩。",
    "对所有层无差别 INT8——敏感层应回退 FP16。"
  ],
  "beginnerSummary": "FP16 像把厘米刻度换成半厘米，读数略粗但几乎不影响判断；INT8 像只记\"大/中/小\"三档，省很多空间但得先拿一批样品摸清每档对应多大(校准)，否则会记错。",
  "prerequisites": [
    "精度与速度可权衡。",
    "GPU 有低精度高吞吐单元。",
    "量化需知道数值范围。"
  ],
  "workedExample": [
    "FP16 开 flag，精度几乎不变，延迟降 2×。",
    "INT8 校准后精度掉 <0.5%，延迟再降 1.8×。"
  ],
  "lineByLine": [
    "FP16 直接开 BuilderFlag。",
    "INT8 需构造校准器。",
    "校准器喂代表样本估范围。",
    "生成 scale 并量化执行。"
  ],
  "diagram": "FP32 ─▶ FP16(直接)   FP32 ─▶[校准估范围]─▶ INT8(需 scale)"
};
