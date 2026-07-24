export default {
  "kind": "concept",
  "id": "onnx-trt-build-engine",
  "category": "ONNX/TensorRT",
  "difficulty": "Medium",
  "title": "TensorRT 构建引擎流程",
  "prompt": "TensorRT 构建 engine 的完整流程是什么？",
  "quickAnswer": "流程为：创建 Logger/Builder → 建 NetworkDefinition(通常 EXPLICIT_BATCH) → 用 Parser(如 OnnxParser)解析模型 → 配 BuilderConfig(精度 flag、workspace、profile、INT8 校准器) → builder.build_serialized_network 生成 engine → 序列化保存；运行时反序列化建 ExecutionContext 执行。",
  "approach": "Builder+Network+Parser 构建图 → Config 设优化 → build → serialize → 运行时 deserialize+context 推理。",
  "explanationFocus": "是什么：build engine 是把网络定义编译成可执行、GPU 专属优化计划(engine)的离线过程。",
  "bruteForce": "每次推理都重新解析与优化：不可接受的重。",
  "derivation": [
    "为什么需要：优化一次固化，避免运行时重复付出编译成本。",
    "怎么实现：builder 读网络与 config，做融合/调优/量化后产出序列化 blob。",
    "有什么代价：build 耗时长、绑定 GPU 架构、配置项多易错。",
    "怎么评测：build 成功且 engine 推理结果正确、性能达标。"
  ],
  "invariant": "同配置 build 出的 engine 推理结果应一致。",
  "walkthrough": "resnet50 onnx build(FP16)：build 约 20s，产出 50MB engine，加载后单次推理 3ms。",
  "edgeCases": [
    "EXPLICIT_BATCH 才能支持多数 ONNX 模型。",
    "workspace 太小调优不充分。",
    "engine 必须在同架构 GPU 加载。"
  ],
  "code": "# Python：标准 build 流程\ndef build_and_save(onnx_path, engine_path):\n    import tensorrt as trt\n    logger = trt.Logger()\n    builder = trt.Builder(logger)\n    flag = 1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH)\n    net = builder.create_network(flag)\n    parser = trt.OnnxParser(net, logger)\n    parser.parse_from_file(onnx_path)\n    config = builder.create_builder_config()\n    config.set_flag(trt.BuilderFlag.FP16)\n    engine = builder.build_serialized_network(net, config)\n    open(engine_path, 'wb').write(engine)",
  "codeNotes": [
    "EXPLICIT_BATCH 是关键标志。",
    "engine 是二进制，跨架构无效。"
  ],
  "complexity": "build 离线 O(图规模×调优)；一次付出。",
  "followUps": [
    {
      "question": "为什么 engine 要序列化保存？",
      "answer": "build 慢，序列化后部署时 deserialize 即可，避免线上重复编译。"
    },
    {
      "question": "EXPLICIT_BATCH 是什么？",
      "answer": "显式批次维度模式，支持动态 shape 与更完整 ONNX 语义，是推荐默认。"
    }
  ],
  "followUpAnswers": [
    "序列化避免线上重编译。",
    "EXPLICIT_BATCH 支持动态与完整语义。"
  ],
  "pitfalls": [
    "忘记 EXPLICIT_BATCH 导致 ONNX 解析失败。",
    "在请求路径里 build engine。"
  ],
  "beginnerSummary": "构建 engine 像按菜谱(ONNX)在自家灶台上预先排练并写下一页\"最快执行清单\"(engine)：事先花点时间练熟，之后每次照单做就行，不用边做边想。",
  "prerequisites": [
    "模型已导出为 ONNX。",
    "优化可离线一次性完成。",
    "engine 与 GPU 架构绑定。"
  ],
  "workedExample": [
    "ONNX → Parser 解析进 Network。",
    "Config 开 FP16 → build → 存 engine。"
  ],
  "lineByLine": [
    "建 Builder 与 Network(EXPLICIT_BATCH)。",
    "OnnxParser 解析模型入图。",
    "配 Config(精度/workspace)。",
    "build_serialized_network 并写文件。"
  ],
  "diagram": "Builder ─ Network ─ Parser(ONNX) ─▶ Config ─▶ build ─▶ engine(blob)"
};
