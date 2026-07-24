export default {
  "kind": "concept",
  "id": "onnx-trt-deploy-best-practice",
  "category": "ONNX/TensorRT",
  "difficulty": "Medium",
  "title": "TRT 部署最佳实践流程",
  "prompt": "生产环境部署 TensorRT 的最佳实践流程是什么？",
  "quickAnswer": "最佳实践：①固定训练框架导出合规 ONNX(opset 固定、动态轴声明)；②解析查不支持 op 并补齐 plugin；③选精度策略(FP16 起，敏感模型 INT8 校准或 QAT)；④设动态 profile 与 workspace；⑤离线 build 并序列化 engine(按目标 GPU 架构)；⑥建精度/延迟回归门禁；⑦运行时 deserialize+context 推理、预热与监控。",
  "approach": "导出标准化 → 解析/插件 → 精度策略 → build(离线) → 回归校验 → 运行时部署与监控。",
  "explanationFocus": "是什么：TRT 部署最佳实践是一套从导出到上线、可重复且可控质量的标准流程。",
  "bruteForce": "手工临时导出+build+上线：不可重复、易出事故。",
  "derivation": [
    "为什么需要：生产要求可复现、可回滚、质量可控。",
    "怎么实现：把各步脚本化/流水线化，加 op 清单、版本矩阵、精度门禁。",
    "有什么代价：前期工程化投入，但显著降低线上风险。",
    "怎么评测：每个模型走同一流程，门禁拦住精度/性能不合格产物。"
  ],
  "invariant": "走标准流程的产物在各环境结果一致且达标。",
  "walkthrough": "CI 中：导出 onnx→解析检查→FP16 build→精度门禁(top-1 掉<0.5%)→产物入库；上线 deserialize 即跑，p99 稳定。",
  "edgeCases": [
    "引擎需按生产 GPU 架构 rebuild。",
    "精度门禁阈值需按模型定。",
    "回滚需保留旧 engine 版本。"
  ],
  "code": "# Python (概念)：标准部署流水线入口\ndef deploy_pipeline(onnx_path, gpu_arch, precision='fp16'):\n    engine = build_engine(onnx_path, precision)        # 离线\n    assert verify_accuracy(engine), '精度门禁未过'\n    tag = f\"{gpu_arch}-{precision}\"\n    publish(engine, tag)                               # 入库\n    return tag",
  "codeNotes": [
    "build 离线、产物按架构标记。",
    "门禁拦掉点变更。"
  ],
  "complexity": "工程化一次性；每次部署低成本。",
  "followUps": [
    {
      "question": "为什么 engine 要按架构标记入库？",
      "answer": "engine 绑 compute capability，混用会加载失败，按架构存不同产物便于回滚与分发。"
    },
    {
      "question": "精度门禁设多少合理？",
      "answer": "按任务容忍度，如分类 top-1 掉<0.5%、检测 mAP 掉<1%，并以回归集自动判。"
    }
  ],
  "followUpAnswers": [
    "engine 绑架构需分存。",
    "门禁阈值按任务定。"
  ],
  "pitfalls": [
    "把 build 放线上请求路径。",
    "不留旧 engine 版本导致无法回滚。"
  ],
  "beginnerSummary": "最佳实践像开餐厅的标准 SOP：从统一备料(导出)、查漏补缺(插件)、定火候(精度)、提前练熟(离线 build)、质量抽检(门禁)到正式出餐并监控，每一步都写进流程，保证无论谁来做都稳定好吃、出问题能回退。",
  "prerequisites": [
    "生产要可复现可控。",
    "engine 绑定硬件架构。",
    "质量需自动校验。"
  ],
  "workedExample": [
    "CI：导出→解析→FP16 build→精度门禁→入库。",
    "上线 deserialize 即跑，p99 稳定可回滚。"
  ],
  "lineByLine": [
    "标准化导出合规 ONNX。",
    "解析补齐 plugin 与精度策略。",
    "离线 build 并按架构存 engine。",
    "门禁校验后上线并监控。"
  ],
  "diagram": "导出→解析→精度→build(离线)→门禁→上线+监控"
};
