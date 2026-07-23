export default {
  "kind": "concept",
  "id": "rag-004",
  "category": "RAG",
  "difficulty": "Easy",
  "title": "RAG 文档切块(chunking)怎么做？",
  "prompt": "RAG 中文档切块(chunking)有哪些策略，大小与重叠怎么设？",
  "quickAnswer": "按固定 token/字符切并留重叠(如 512 token、重叠 64~128)，或用递归/按语义/层级切分，使每块语义完整且适配 embedding 与上下文。",
  "approach": "以『单块能独立回答一个问题、且不超过模型窗口』为约束选切分粒度。",
  "explanationFocus": "是什么：chunking 把长文档切成检索单元，粒度直接影响召回精度与上下文利用率，是 RAG 工程第一道关。",
  "bruteForce": "整篇文档当一块：块太大稀释相似度、检索命中后噪声多、易超窗口；或不切直接喂全文，不可规模化。",
  "derivation": [
    "为什么需要：embedding 对长文本会『平均掉』重点，且 LLM 上下文有限，必须切成适中单元。",
    "怎么实现：固定大小切(按 token/字符/句子)；递归切(优先段落→句→词)；语义切(按相似度断点)；层级切(父块检索、子块喂入)。重叠区保留跨块上下文。",
    "有什么代价：块太小丢失上下文、块太大稀释相关性；重叠增加冗余与存储；语义切计算更贵。",
    "怎么评测：用端到端 Faithfulness/Context Recall 反推，A/B 不同块大小选最优。"
  ],
  "invariant": "经验法则：块大小匹配 embedding 最佳长度(常 256~512 token)，重叠约 10~20% 防断句丢失。",
  "walkthrough": "一篇 5000 字制度：按 512 token 切、重叠 64 token，得约 12 块；查询命中第 3 块及其重叠邻块即可完整回答。",
  "edgeCases": [
    "在句子中间切断导致语义残缺",
    "表格/代码被切坏",
    "重叠过大造成重复上下文",
    "块太小使单块无法独立成义",
    "层级切需同时维护父/子索引映射"
  ],
  "code": "def chunk(text, size=512, overlap=64):\n    toks = text.split()\n    step = size - overlap\n    return [' '.join(toks[i:i+size]) for i in range(0, len(toks), step)]",
  "codeNotes": [
    "step = size - overlap 控制滑动窗口",
    "生产建议按 token 而非字符切，中文按字/词需留意"
  ],
  "complexity": "切分 O(文本长度)，与块数线性相关；语义切额外 O(块数) 相似度计算。",
  "followUps": [
    {
      "question": "语义切分 vs 固定切分？",
      "answer": "语义切按内容断点保留完整含义、召回更准但慢；固定切简单可复现，适合大多场景打底。"
    },
    {
      "question": "层级(chunk)有什么用？",
      "answer": "用大父块做检索保证上下文、用小子块喂 LLM 省 token，兼顾召回与精度。"
    }
  ],
  "followUpAnswers": [
    "语义切按内容断点保留完整含义、召回更准但慢；固定切简单可复现，适合大多场景打底。",
    "用大父块做检索保证上下文、用小子块喂 LLM 省 token，兼顾召回与精度。"
  ],
  "pitfalls": [
    "块太大稀释相关性",
    "在句中断切损语义",
    "忽略重叠导致边界信息丢失",
    "未对表格代码特殊处理的切法"
  ],
  "beginnerSummary": "切块像把一本厚书拆成便于检索的小节：每节自成一义，相邻节留点重叠避免把一句话腰斩。",
  "prerequisites": [
    "token 与文本表示",
    "embedding 输入长度限制"
  ],
  "workedExample": [
    "把长文按 512 token 滑动窗口切块，重叠 64",
    "每块独立向量化入库，查询命中后取该块及邻块"
  ],
  "lineByLine": [
    "text.split() 粗略分词",
    "step 为滑动步长",
    "range 按 step 取窗口",
    "拼接成块返回"
  ],
  "diagram": "[====block1====]\n    [====block2====]  <- overlap\n        [====block3====]"
};
