export default {
  "id": "asr-architecture-compare",
  "category": "ASR 专项",
  "difficulty": "Medium",
  "title": "主流 ASR 架构横评与选型",
  "prompt": "Whisper、Paraformer、Zipformer-Transducer 与 Qwen3-ASR 四类架构的核心差异是什么，如何按场景选型？",
  "quickAnswer": "Whisper 是 Encoder-Decoder 自回归、Paraformer 用 SAN 非自回归并行、Zipformer-Transducer 做单元级流式对齐、Qwen3-ASR 大模型化；端侧选 Paraformer/Whisper-tiny，高准确选 Qwen3，流式选 Zipformer。",
  "code": "class ASRBackbone:\n    \"\"\"统一不同架构（Whisper/Paraformer/Zipformer/Qwen3）的推理接口便于横评。\"\"\"\n    def __init__(self, arch: str):\n        self.arch = arch\n    def transcribe(self, audio):\n        return {\"whisper\": self._enc_dec,\n                \"paraformer\": self._san_parallel,\n                \"zipformer\": self._transducer,\n                \"qwen3-asr\": self._llm}.get(self.arch)(audio)",
  "complexity": "时间 O(1)（路由）/ 推理随架构 O(N·L)，空间 O(1)",
  "beginnerSummary": "四个“翻译官”各有绝活：Whisper 全能但慢，Paraformer 并行快，Zipformer 流式对齐好，Qwen3 大模型最聪明但最吃资源。",
  "derivation": [
    "为什么需要：四类架构在准确率、延迟、流式与端侧成本上权衡不同，统一接口才能公平横评并按场景选型。",
    "怎么实现：Whisper 用 Encoder-Decoder+自回归；Paraformer 用 SAN 做非自回归并行预测；Zipformer-Transducer 做单元级流式对齐；Qwen3-ASR 走大模型化。统一 transcribe 接口横评。",
    "有什么代价：大模型（Qwen3）准确高但显存/延迟大；Transducer 需对齐训练复杂；统一接口要适配各自前后处理。",
    "怎么评测：在 11 语种盲测跑三层口径，按指标与端侧约束选：端侧用 Paraformer/Whisper-tiny，高准确用 Qwen3，流式用 Zipformer。"
  ],
  "edgeCases": [
    "Whisper 自回归易重复解码（hallucination），长音频需 chunk。",
    "Paraformer 非自回归对同音字易错，需语言模型兜底。",
    "Zipformer-Transducer 训练需预测网络/对齐，调参复杂。",
    "Qwen3-ASR 在端侧显存不足必须量化或回退。"
  ],
  "pitfalls": [
    "把 Whisper 当万能，端侧硬上导致延迟爆表。",
    "横评时前后处理不一致（归一化/采样率）导致指标不可比。"
  ],
  "prerequisites": [
    "Encoder-Decoder 与自回归解码",
    "Transducer 与 CTC 对齐",
    "非自回归（NAR）建模"
  ],
  "workedExample": [
    "步骤1：用 ASRBackbone 封装四架构，输入同一音频。",
    "步骤2：在盲测集跑三层口径，记录 CER 与延迟。",
    "步骤3：端侧 200MB 选 Paraformer，高准确选 Qwen3-ASR。"
  ],
  "lineByLine": [
    "class ASRBackbone: 定义统一基座封装类。",
    "def __init__(self, arch): self.arch = arch 记录所选架构名。",
    "def transcribe(self, audio): 对外统一推理接口。",
    "return {...}.get(self.arch)(audio) 按架构名分发到对应内部实现。"
  ],
  "followUps": [
    {
      "question": "Paraformer 的 SAN 是什么？",
      "answer": "SAN（Self-Attention Network）结合 CIF 预测时长，实现非自回归并行输出，去掉自回归延迟，推理快但需处理重复/漏字。"
    },
    {
      "question": "Transducer 相比 CTC 好在哪？",
      "answer": "Transducer 引入预测网络与联合网络做帧-标签单元级对齐，不要求帧独立假设，流式与长静音更稳，对齐更精细。"
    }
  ],
  "followUpAnswers": [
    "SAN（Self-Attention Network）结合 CIF 预测时长，实现非自回归并行输出，去掉自回归延迟，推理快但需处理重复/漏字。",
    "Transducer 引入预测网络与联合网络做帧-标签单元级对齐，不要求帧独立假设，流式与长静音更稳，对齐更精细。"
  ],
  "invariant": "transcribe 对任意已知 arch 必分发到对应实现且返回解码文本，未知 arch 触发 KeyError 需调用方保证合法值。",
  "walkthrough": "ASRBackbone('paraformer').transcribe(audio) → 查表命中 _san_parallel 并行解码返回文本；'qwen3-asr' → _llm 大模型解码。",
  "kind": "code"
};
