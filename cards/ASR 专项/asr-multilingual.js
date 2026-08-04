export default {
  "id": "asr-multilingual",
  "category": "ASR 专项",
  "difficulty": "Hard",
  "title": "多语种 ASR 分路建模与统一评测体系",
  "prompt": "如何为覆盖 11 个语种的多语种 ASR 设计分路建模与统一评测体系，并基于文字单元与端侧约束进行基座选型？",
  "quickAnswer": "按语种文字单元（字符/BPE/词）与端侧内存/算力约束分路选择基座（西语等用 Paraformer、英文用 Zipformer-Transducer、中文用 Paraformer，受限端侧用 Whisper-tiny），并用 CER/WER、语义质量、Translation-Aware 下游影响三层口径统一横评；盲测 7 语种整体 CER 9.15% vs 商用基线 30.77%。",
  "code": "def select_asr_backbone(lang: str, text_unit: str, edge_budget_mb: float) -> str:\n    \"\"\"按语种、文字单元与端侧内存约束选择 ASR 基座。\"\"\"\n    edge_friendly = {\"es\": \"paraformer\", \"en\": \"zipformer\", \"zh\": \"paraformer\"}\n    if edge_budget_mb < 200:  # 端侧硬约束\n        return edge_friendly.get(lang, \"whisper-tiny\")\n    return \"qwen3-asr\" if text_unit == \"char\" else \"whisper-large\"",
  "complexity": "时间 O(1)（路由）/ 评测 O(N·L)（编辑距离），空间 O(1)",
  "beginnerSummary": "不同语言像不同字母表，不能一把尺子量；把每种语言交给最擅长它的“翻译官”，再用统一考试卷打分。",
  "derivation": [
    "为什么需要：11 个语种文字单元差异巨大（西语词/中文字符/BPE），单模型与单指标无法公平横评，且端侧内存/算力约束要求分路选型而非统一大模型。",
    "怎么实现：按语种路由到最合适基座（西语/中文用 Paraformer、英文用 Zipformer-Transducer、端侧硬约束用 Whisper-tiny），并用统一评测脚本对全量语种跑三层口径。",
    "有什么代价：多基座带来部署与维护复杂度；盲测需要独立标注集，构造成本高；分路路由在语种错判时会降级。",
    "怎么评测：以 CER/WER（文字单元）、语义质量（LLM 判等/语义相似度）、Translation-Aware（翻译下游 BLEU 影响）三层口径统一横评，盲测 7 语种整体 CER 9.15% vs 商用基线 30.77%。"
  ],
  "edgeCases": [
    "语种路由把方言/混合语错判为相邻语种，触发不匹配基座导致 CER 飙升。",
    "文字单元为字符的中文与为词的西语编辑距离分母不同，跨语种直接比较 CER 不公平。",
    "语料极少的低资源语种缺乏盲测集，三层口径中 Translation-Aware 无法计算。",
    "端侧显存不足时回退 Whisper-tiny，准确率断崖式下降。"
  ],
  "pitfalls": [
    "仅用 WER 横评中文会严重失真（应用 CER），必须按文字单元切换指标。",
    "盲测集若与训练域同源则高估 9.15%，需保证盲测独立采样。"
  ],
  "prerequisites": [
    "编辑距离与 CER/WER 定义",
    "多语种文字单元（字符/BPE/词）差异",
    "端侧推理内存与算力约束"
  ],
  "workedExample": [
    "步骤1：对西语 10k 抽样的测试集分别用 Paraformer 与商用 API 转写，统计词级 WER。",
    "步骤2：把 7 语种盲测集统一送三层评测脚本，得出整体 CER 9.15% 与基线 30.77%。",
    "步骤3：端侧 200MB 预算下路由到 Whisper-tiny，验证内存约束满足。"
  ],
  "lineByLine": [
    "def select_asr_backbone(...) 定义路由函数，输入语种、文字单元与端侧预算。",
    "if edge_budget_mb < 200: 端侧硬约束优先，低于 200MB 直接走轻量基座。",
    "return edge_friendly.get(lang, 'whisper-tiny') 按语种查表返回端侧友好基座，未命中兜底。",
    "return 'qwen3-asr' if text_unit == 'char' else 'whisper-large' 非端侧时按文字单元在大模型间选型。"
  ],
  "followUps": [
    {
      "question": "盲测 CER 9.15% 这个口径的分母用字符还是词？",
      "answer": "盲测 7 语种统一按各自文字单元：中文/日等用字符（CER），西/英等用词（WER），最终以语种加权汇报，避免跨单元直接平均。"
    },
    {
      "question": "端侧预算从 200MB 放宽到 1GB 时路由会变吗？",
      "answer": "会变；预算≥200MB 不再走 edge_friendly 表，而是进入大模型分支，中文/日文进 qwen3-asr，其他进 whisper-large。"
    },
    {
      "question": "Translation-Aware 层如何量化对下游的影响？",
      "answer": "把 ASR 输出喂给固定翻译模型得到 BLEU，与用真值文本翻译的 BLEU 求差，差值越小说明 ASR 错误对下游翻译影响越可控。"
    }
  ],
  "followUpAnswers": [
    "盲测 7 语种统一按各自文字单元：中文/日等用字符（CER），西/英等用词（WER），最终以语种加权汇报，避免跨单元直接平均。",
    "会变；预算≥200MB 不再走 edge_friendly 表，而是进入大模型分支，中文/日文进 qwen3-asr，其他进 whisper-large。",
    "把 ASR 输出喂给固定翻译模型得到 BLEU，与用真值文本翻译的 BLEU 求差，差值越小说明 ASR 错误对下游翻译影响越可控。"
  ],
  "invariant": "对任意输入 (lang, text_unit, edge_budget_mb)，函数始终返回某一真实存在且与该语种文字单元兼容的基座名，不会返回空或非法值。",
  "walkthrough": "输入 lang='es', text_unit='word', edge_budget_mb=180 → 命中 edge_budget<200 分支，edge_friendly['es']='paraformer' 返回；若 edge_budget_mb=600，则跳过端侧分支，text_unit='word' 非 'char'，返回 'whisper-large'。",
  "kind": "code"
};
