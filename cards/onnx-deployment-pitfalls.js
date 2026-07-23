export default {
  "kind": "concept",
  "id": "onnx-deployment-pitfalls",
  "category": "ONNX/TensorRT",
  "difficulty": "Medium",
  "title": "部署痛点",
  "prompt": "ONNX/TensorRT 部署常见痛点（op 不支持/版本兼容/精度对齐）有哪些，怎么应对？",
  "quickAnswer": "三大痛点：①算子不支持(TRT 无对应 op)→改写图或写 plugin；②版本兼容(opset 与 TRT 版本错配、engine 绑架构)→对齐导出与运行时版本、按卡 rebuild；③精度对齐(低精度掉点)→用校准/QAT、敏感层回退、逐层比对定位。系统性做法是建自动化导出+校验流水线。",
  "approach": "导出合规 ONNX → 解析查不支持 op → 对齐版本 → 量化策略选择 → 端到端精度与延迟校验。",
  "explanationFocus": "是什么：部署痛点指在 ONNX/TRT 链路中导致 build 失败或精度/性能不达预期的常见障碍。",
  "bruteForce": "遇到报错再临时改：不可重复、易遗漏。",
  "derivation": [
    "为什么需要：真实模型常踩这些坑，需系统化规避。",
    "怎么实现：建立导出规范(opset 固定)、不支持 op 清单与 plugin 库、版本矩阵、精度回归测试。",
    "有什么代价：前期建设成本，但长期降低故障率。",
    "怎么评测：用回归集验证各模型精度/延迟达标且可重复 build。"
  ],
  "invariant": "成熟链路下，同输入同配置结果应可复现且精度达标。",
  "walkthrough": "建流水线后：op 不支持自动路由 plugin；版本矩阵覆盖 TRT 8.x/9.x；精度回归门禁拦住掉点 >0.5% 的变更。",
  "edgeCases": [
    "同模型不同 TRT 版行为微差。",
    "A100 与 T4 engine 不互通。",
    "某层 INT8 掉点需单独回退。"
  ],
  "code": "# Python (概念)：部署前自动检查清单\ndef pre_deploy_check(onnx_path, trt_version):\n    checks = []\n    checks.append(check_supported_ops(onnx_path))      # 不支持 op?\n    checks.append(check_opset_compat(trt_version))     # 版本兼容?\n    checks.append(verify_numeric(onnx_path))           # 精度对齐?\n    return all(checks)",
  "codeNotes": [
    "清单化可自动化。",
    "精度门禁防回归。"
  ],
  "complexity": "流水线一次性建设；每次部署低成本。",
  "followUps": [
    {
      "question": "engine 换显卡怎么办？",
      "answer": "按目标 GPU 架构重新 build engine，不能跨 compute capability 复用。"
    },
    {
      "question": "精度掉点怎么定位？",
      "answer": "逐层比对 ORT 与 TRT 输出，定位首个误差放大层，针对性回退精度或改实现。"
    }
  ],
  "followUpAnswers": [
    "按架构 rebuild engine。",
    "逐层比对定位掉点层。"
  ],
  "pitfalls": [
    "把 engine 当可移植文件跨卡用。",
    "只测整体精度不查逐层，难定位。"
  ],
  "beginnerSummary": "部署像把菜谱交给新厨房：有时缺某种厨具(op不支持)、有时说明书版本对不上(版本兼容)、有时火候变了味道偏(精度对齐)。与其每次手忙脚乱，不如先列张检查表统一把关。",
  "prerequisites": [
    "链路长易出多点故障。",
    "版本与硬件强相关。",
    "精度需可回归验证。"
  ],
  "workedExample": [
    "建 op 不支持清单与 plugin 库。",
    "版本矩阵+精度门禁拦掉点变更。"
  ],
  "lineByLine": [
    "规范导出 opset。",
    "查不支持 op 并路由 plugin。",
    "对齐 TRT 版本与架构。",
    "精度/延迟回归校验。"
  ],
  "diagram": "痛点: op不支持 / 版本错 / 精度偏\n应对: plugin库 / 版本矩阵 / 精度回归"
};
