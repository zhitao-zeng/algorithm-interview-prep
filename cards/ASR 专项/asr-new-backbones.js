export default {
  "id": "asr-new-backbones",
  "category": "ASR 专项",
  "difficulty": "Medium",
  "title": "大模型化语音基座趋势与取舍",
  "prompt": "FireRedASR2 与 Qwen3-ASR 代表的大模型化 ASR 相比经典 Transducer，在准确率与延迟上如何取舍？",
  "quickAnswer": "低延迟（<300ms）走 Zipformer-Transducer，宽松且难口音走 Qwen3-ASR、通用高准确走 FireRedASR2；大模型更准但吃资源，Transducer 在端侧流式仍不可替代。",
  "code": "def choose_backbone(scenario: str, latency_sla_ms: float) -> str:\n    \"\"\"大模型化 ASR 与经典 Transducer 的取舍：低延迟用 Transducer，高准确用大模型。\"\"\"\n    if latency_sla_ms < 300:\n        return \"zipformer-transducer\"\n    return \"qwen3-asr\" if scenario == \"hard-accent\" else \"fireredasr2\"",
  "complexity": "时间 O(1)，空间 O(1)",
  "beginnerSummary": "大模型像请专家审卷更准但慢，Transducer 像流水线工人快但偶尔错；急用选快的，难活选准的。",
  "derivation": [
    "为什么需要：大模型化 ASR（FireRedASR2、Qwen3-ASR）靠海量数据与参数提升准确率，但推理成本高，需与经典 Transducer 按延迟/准确率取舍。",
    "怎么实现：以端侧延迟 SLA 与场景难度分流：低延迟走 Zipformer-Transducer，难口音/低资源走高准确大模型。",
    "有什么代价：大模型显存与首字延迟高，需量化/蒸馏才能端侧落地；Transducer 在极难口音上准确率上限低于大模型。",
    "怎么评测：在 11 语种盲测对比 CER 与首字延迟，大模型在难样本显著更优，Transducer 在延迟敏感场景胜出。"
  ],
  "edgeCases": [
    "大模型量化过度导致难口音准确率回落，需选合适位宽。",
    "延迟 SLA 卡在 300ms 边界，需实测而非拍阈值。",
    "端侧无 NPU 时大模型即使量化也跑不动，必须 Transducer。",
    "低资源语种大模型优势被数据量限制，差距缩小。"
  ],
  "pitfalls": [
    "盲目上大模型忽视端侧延迟，线上超时。",
    "用 Transducer 硬刚难口音，准确率达不到业务要求。"
  ],
  "prerequisites": [
    "Transducer 与流式对齐",
    "大模型化 ASR（LLM-based）",
    "量化与蒸馏"
  ],
  "workedExample": [
    "步骤1：测端侧延迟 SLA，若 <300ms 选 Zipformer-Transducer。",
    "步骤2：SLA 宽松且场景为 hard-accent，选 Qwen3-ASR。",
    "步骤3：通用高准确场景选 FireRedASR2，并在盲测验证 CER 优势。"
  ],
  "lineByLine": [
    "def choose_backbone(scenario, latency_sla_ms): 输入场景与延迟上限。",
    "if latency_sla_ms < 300: return 'zipformer-transducer' 延迟敏感走经典 Transducer。",
    "return 'qwen3-asr' if scenario == 'hard-accent' else 'fireredasr2' 宽松场景下难口音用 Qwen3，否则 FireRedASR2。",
    "函数即准确率/延迟取舍的路由。"
  ],
  "followUps": [
    {
      "question": "大模型化 ASR 为何更准？",
      "answer": "借助 LLM 的强语言模型与海量多语种数据，对同音字、上下文和难口音的语言学约束更强，CER 在难样本显著低于 Transducer。"
    },
    {
      "question": "Transducer 还有存在价值吗？",
      "answer": "有；在端侧低延迟、流式硬实时场景，Zipformer-Transducer 的单元级对齐与低首字延迟仍是大模型难以替代的，尤其资源受限设备。"
    }
  ],
  "followUpAnswers": [
    "借助 LLM 的强语言模型与海量多语种数据，对同音字、上下文和难口音的语言学约束更强，CER 在难样本显著低于 Transducer。",
    "有；在端侧低延迟、流式硬实时场景，Zipformer-Transducer 的单元级对齐与低首字延迟仍是大模型难以替代的，尤其资源受限设备。"
  ],
  "invariant": "choose_backbone 对任意合法输入必从 {'zipformer-transducer','qwen3-asr','fireredasr2'} 中返回一个，且延迟<300ms 时必为 zipformer-transducer。",
  "walkthrough": "scenario='hard-accent', sla=500 → 不进低延迟分支，scenario 命中返回 'qwen3-asr'；sla=200 → 返回 'zipformer-transducer' 不论场景。",
  "kind": "code"
};
