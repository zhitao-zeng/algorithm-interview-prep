export default {
  "kind": "concept",
  "id": "onnx-trt-int8-calibration",
  "category": "ONNX/TensorRT",
  "difficulty": "Hard",
  "title": "INT8 校准流程",
  "prompt": "TensorRT 的 INT8 校准（calibration）流程是什么，为什么需要它？",
  "quickAnswer": "INT8 校准是估计每层激活张量分布以确定量化 scale/zero-point 的过程：提供一个有代表性的校准数据集，TRT 在 build 期跑前向收集每层激活的 min/max(或用熵/百分位算法)，据此生成量化参数，使 FP32→INT8 的截断误差最小；无校准则无法安全量化。",
  "approach": "准备代表性校准集 → 实现 IInt8Calibrator(喂样本) → 选算法(ENTROPY/LEGACY) → build 时收集分布 → 生成 INT8 engine。",
  "explanationFocus": "是什么：INT8 校准是用少量代表样本统计激活分布、为每层确定量化参数的离线过程。",
  "bruteForce": "直接按固定范围[-1,1]量化：截断严重、精度崩。",
  "derivation": [
    "为什么需要：INT8 只有 256 个值，必须知道真实数值范围才能少丢信息。",
    "怎么实现：校准器逐 batch 喂数据，TRT 记录每层激活直方图，用熵/百分位选最优截断点→scale。",
    "有什么代价：校准集需具代表性；算法选择影响精度。",
    "怎么评测：用验证集测 INT8 相对 FP32 的精度掉点是否在可接受范围。"
  ],
  "invariant": "校准后 INT8 输出精度掉点应在任务容忍内。",
  "walkthrough": "用 500 张代表图校准 resnet50 INT8：top-1 掉 0.3%，延迟较 FP16 再降 1.8×。",
  "edgeCases": [
    "校准集分布偏离线上数据→精度崩。",
    "某些层对量化极敏感需回退 FP16。",
    "校准缓存可保存复用避免重跑。"
  ],
  "code": "# Python：熵校准器实现骨架\ndef int8_calibrator(loader):\n    import tensorrt as trt\n    class Ent(trt.IInt8EntropyCalibrator2):\n        def __init__(self): self.it = iter(loader)\n        def get_batch(self, names):\n            try: return [next(self.it).numpy()]\n            except StopIteration: return None\n        def read_calibration_cache(self): return None\n        def write_calibration_cache(self, c): open('cal.bin','wb').write(c)\n    return Ent()",
  "codeNotes": [
    "缓存校准结果可加速重 build。",
    "校准样本数不必多但要代表。"
  ],
  "complexity": "校准 O(样本×图规模)；一次离线。",
  "followUps": [
    {
      "question": "校准集要多少样本？",
      "answer": "通常几百到一千张具代表性样本即可，关键是覆盖输入分布而非数量极大。"
    },
    {
      "question": "校准缓存有什么用？",
      "answer": "把量化参数存盘，之后 build 直接读缓存，省去重跑前向收集分布。"
    }
  ],
  "followUpAnswers": [
    "几百张代表样本足够。",
    "缓存避免重跑校准。"
  ],
  "pitfalls": [
    "用训练集随机小批当校准集却分布偏移。",
    "对所有层强制 INT8 不顾敏感性。"
  ],
  "beginnerSummary": "INT8 校准像先拿一批\"典型样品\"量一量每件工具的常用大小区间，据此标好刻度(scale)；以后只按这个刻度记\"大中小\"，既省空间又不至于记错。样品不典型，刻度就歪了。",
  "prerequisites": [
    "INT8 只有 256 个离散值。",
    "需知激活真实范围。",
    "量化引入截断误差。"
  ],
  "workedExample": [
    "500 张代表图喂校准器。",
    "resnet INT8 top-1 掉 0.3%，延迟再降 1.8×。"
  ],
  "lineByLine": [
    "准备代表性校准数据。",
    "实现 calibrator 喂样本。",
    "build 期收集激活分布。",
    "用熵算法定 scale 并量化。"
  ],
  "diagram": "校准样本 ─▶ 前向收集分布 ─▶ 熵选截断点 ─▶ scale ─▶ INT8 engine"
};
