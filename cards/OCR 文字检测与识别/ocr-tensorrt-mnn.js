export default {
  "id": "ocr-tensorrt-mnn",
  "category": "OCR 文字检测与识别",
  "difficulty": "Hard",
  "title": "端侧 OCR（TensorRT / MNN）",
  "prompt": "将 PP-OCRv6 small 从 CPU MNN 迁移到 TensorRT 时，如何在加速约 3.1 倍的同时把峰值显存降低约 220 MiB？",
  "quickAnswer": "用固定输入尺寸构建 TensorRT 引擎并启用 FP16；通过输入输出 buffer 复用(预分配并跨推理周期复用同一块显存)避免重复分配，从而降低 HWM 约 220 MiB，整体较 CPU MNN 加速约 3.1 倍。",
  "code": "import pycuda.driver as cuda\nimport tensorrt as trt\n\nclass TRTOCREngine:\n    def __init__(self, engine_path):\n        self.runtime = trt.Runtime(trt.Logger())\n        with open(engine_path, \"rb\") as f:\n            self.engine = self.runtime.deserialize_cuda_engine(f.read())\n        self.context = self.engine.create_execution_context()\n        # 预分配并复用 buffer，避免每次推理重新分配\n        self.buffers = [cuda.mem_alloc(self.engine.get_binding_shape(i).numel() * 4)\n                        for i in range(self.engine.num_bindings)]\n\n    def infer(self, host_in):\n        cuda.memcpy_htod(self.buffers[0], host_in)\n        self.context.execute_v2(self.buffers)      # 复用同一组 buffer\n        cuda.memcpy_dtoh(self.host_out, self.buffers[1])\n        return self.host_out\n",
  "complexity": "时间 O(引擎固定计算)，空间 O(预分配 buffer 总量，复用不变)",
  "beginnerSummary": "把 OCR 从“手机 CPU 上慢慢算”搬到“显卡专用加速通道”；buffer 复用就像复用同一个托盘而不是每单都新买托盘，省下约 220 MiB 临时占用的显存。",
  "derivation": [
    "为什么需要：端侧实时 OCR 对延迟与显存敏感，CPU MNN 在某些设备上达不到实时，且反复分配显存抬高峰值。",
    "怎么实现：用 ONNX 构建 TensorRT 引擎开 FP16，预分配输入输出 cuda buffer 并在多次推理间复用，消除 per-infer 的 malloc/free。",
    "有什么代价：TensorRT 引擎与硬件/驱动绑定、构建耗时；FP16 在极端动态范围上略有精度损失，需要校准验证。",
    "怎么评测：对比 CPU MNN 与 TensorRT 的端到端延迟，统计峰值显存(HWM)，确认加速约 3.1× 且 HWM 降约 220 MiB 且精度无回退。"
  ],
  "edgeCases": [
    "输入尺寸与引擎构建尺寸不一致导致推理失败",
    "多线程并发复用同一 buffer 引发竞争",
    "动态 batch 超出引擎最大 batch",
    "显存碎片化"
  ],
  "pitfalls": [
    "每次推理都重新分配 buffer 抵消优化收益",
    "FP16 未校准造成小字精度下降",
    "忽略引擎与驱动版本绑定"
  ],
  "prerequisites": [
    "TensorRT 基础",
    "CUDA 内存管理",
    "模型导出(ONNX)"
  ],
  "workedExample": [
    "同张图 CPU MNN 推理 310ms，TensorRT FP16 约 100ms，加速约 3.1×。",
    "启用 buffer 复用后，连续推理 HWM 由 ~520 MiB 降至 ~300 MiB，约省 220 MiB。"
  ],
  "lineByLine": [
    "class TRTOCREngine: TensorRT OCR 推理封装。",
    "deserialize_cuda_engine: 加载预构建引擎。",
    "cuda.mem_alloc(...): 预分配每个 binding 的 buffer。",
    "self.context.execute_v2(self.buffers): 每次推理复用同一组 buffer 省去分配。"
  ],
  "followUps": [
    {
      "question": "为什么 buffer 复用能降低峰值显存？",
      "answer": "每次推理若临时分配再释放，分配器在并发/碎片下会保留更高水位；预分配并长期复用使显存占用稳定在上界，HWM 明显下降。"
    },
    {
      "question": "TensorRT 与 MNN 该如何选型？",
      "answer": "有 NVIDIA GPU/算力允许时选 TensorRT 拿更高吞吐；无 GPU 的嵌入式 ARM 选 MNN 等 CPU/NPU 推理框架更合适。"
    }
  ],
  "followUpAnswers": [
    "每次推理若临时分配再释放，分配器在并发/碎片下会保留更高水位；预分配并长期复用使显存占用稳定在上界，HWM 明显下降。",
    "有 NVIDIA GPU/算力允许时选 TensorRT 拿更高吞吐；无 GPU 的嵌入式 ARM 选 MNN 等 CPU/NPU 推理框架更合适。"
  ],
  "invariant": "self.buffers 在多次 infer 调用间保持不变且容量足以容纳最大绑定张量，execute_v2 始终使用同一组指针。",
  "walkthrough": "加载引擎→预分配 2 个 buffer(输入/输出)；infer 时仅做 host→device 拷贝、execute_v2 复用 buffer、device→host 拷贝；连续 100 次推理不重新分配，HWM 稳定在预分配值。",
  "kind": "code"
};
