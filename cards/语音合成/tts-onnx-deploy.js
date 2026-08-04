export default {
  "id": "tts-onnx-deploy",
  "category": "语音合成",
  "difficulty": "Medium",
  "title": "sherpa-onnx 量化与端侧部署",
  "prompt": "如何把 TTS 模型用 sherpa-onnx 做 INT8 量化、打包并在端侧运行交付？",
  "quickAnswer": "将训练好的模型/声码器导出为 ONNX，用 sherpa-onnx 的量化工具做 INT8 校准量化，打包为端侧资源(模型+词典+配置)，通过 OfflineTts API 在 CPU/移动端推理。",
  "code": "import sherpa_onnx\n\ndef export_int8(model, path):\n    # INT8 量化后由 sherpa-onnx 加载，端侧交付\n    sess = sherpa_onnx.OfflineTts(\n        model=path, num_threads=4,\n        provider=\"coreml\"  # 或 \"cpu\"\n    )\n    return sess  # 端侧 INT8 推理",
  "complexity": "时间 O(inference)，空间 O(model_size)",
  "beginnerSummary": "像把大冰箱压缩成小冰柜还能用——量化让模型变小变快，端侧手机也能跑得动。",
  "derivation": [
    "为什么需要：原始浮点模型体积大、端侧算力有限，需压缩与统一运行时。",
    "怎么实现：导出 ONNX→校准 INT8 量化→封装资源→sherpa-onnx 加载推理。",
    "有什么代价：INT8 可能引入轻微音质损失，需校准集代表性强。",
    "怎么评测：对比量化前后 MOS 与崩坏率、测端侧延迟与内存占用。"
  ],
  "edgeCases": [
    "校准集不含方言导致量化后方言崩坏。",
    "移动端算子不支持需替换实现。",
    "多说话人配置打包遗漏导致缺音色。",
    "不同芯片(ARM/x86)数值差异需验证。"
  ],
  "pitfalls": [
    "校准集太小导致量化误差大、音质明显下降。",
    "忘记关闭训练态(BN/dropout)再导出，推理结果漂移。"
  ],
  "prerequisites": [
    "ONNX 导出与推理基础",
    "模型量化(INT8)概念"
  ],
  "workedExample": [
    "导出 VITS+HiFi-GAN 为 ONNX→量化工具生成 int8 模型。",
    "端侧用 OfflineTts 加载，num_threads 调优跑通推理。"
  ],
  "lineByLine": [
    "import sherpa_onnx：引入端侧推理库。",
    "sherpa_onnx.OfflineTts(model=path, ...)：构建离线 TTS 会话。",
    "provider=\"coreml\"：选择端侧后端(或 cpu/NPU)。"
  ],
  "followUps": [
    {
      "question": "INT8 量化为何需要校准集？",
      "answer": "校准确定激活值动态范围(scale/zero-point)，代表性不足会截断分布致精度下降、崩坏增多。"
    },
    {
      "question": "sherpa-onnx 相比直接用 PyTorch 部署的优势？",
      "answer": "跨平台统一、无 Python 依赖、体积小、支持移动/嵌入式，便于端侧交付与集成。"
    }
  ],
  "followUpAnswers": [
    "校准确定激活值动态范围(scale/zero-point)，代表性不足会截断分布致精度下降、崩坏增多。",
    "跨平台统一、无 Python 依赖、体积小、支持移动/嵌入式，便于端侧交付与集成。"
  ],
  "explanationFocus": "是什么：sherpa-onnx 是基于 ONNX Runtime 的跨平台语音工具链，支持把 TTS 模型量化并在端侧(手机/嵌入式)离线运行。本课关注 INT8 量化与打包交付。",
  "approach": "将模型导出 ONNX，用校准集做 INT8 量化以压缩体积、降低延迟，再与词典/配置打包，通过 OfflineTts API 在 CPU 或 NPU 后端推理。",
  "kind": "concept"
};
