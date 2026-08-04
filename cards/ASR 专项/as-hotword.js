export default {
  "id": "as-hotword",
  "category": "ASR 专项",
  "difficulty": "Medium",
  "title": "热词与自定义词",
  "prompt": "当用户提到“自定义唤醒词/专有名词”时，如何提升 ASR 的识别准确率而不重新训练模型？",
  "quickAnswer": "在解码阶段对热词对应的输出单元做偏置（logit bias）或构造热词级 FST 并入解码图，也可用浅融合（shallow fusion）把热词语言模型加权；无需重训声学模型即可显著提升命中率。",
  "approach": "方案一是解码时对热词 token/音素路径的 logits 加固定 boost；二是在 WFST 中挂热词子图做偏向；三是用热词白名单走单独的高效匹配（如二遍解码）并发射偏置。",
  "explanationFocus": "是什么：热词（hotword）机制是在不重新训练声学模型的前提下，通过解码期偏置或融合让系统更倾向于输出用户指定的词或专有名词。",
  "bruteForce": "朴素做法是把热词加入训练语料重训，成本高、迭代慢，且无法在运行时由用户动态指定。",
  "invariant": "偏置只改变词序概率倾向而不破坏声学似然的单调性：非热词路径仍可正常被选中，只是热词路径在分数上获得可控加成。",
  "walkthrough": "加载热词列表 → 映射为输出词/音素序列 → 在 beam 搜索每步对匹配前缀的假设 logits 加 boost → 解码得到偏向热词的结果 → 可选二遍重打分抑制误触发。",
  "complexity": "运行时开销极小（仅解码期加偏置 O(V) 或 FST 合并一次），无需 GPU 重训；内存随热词表线性增长。",
  "beginnerSummary": "热词就像给识别系统“提个醒”：在解码时给指定词加分，让它更可能被正确写出，而不必重新训练模型。",
  "diagram": "beam search\n   |\nhotword bias (+boost)\n   |\nrescored hypotheses\n   |\nfinal text",
  "code": "import re\n\ndef bias_hotword(logits, hotwords, boost=3.0):\n    for w in hotwords:\n        logits[w] += boost\n    return logits",
  "derivation": [
    "为什么需要：人名、品牌、专有名词在训练集稀少，默认 ASR 易写错，且用户希望运行时自定义而无需重训。",
    "怎么实现：解码时对热词对应输出单元 logits 加 boost，或在 WFST 中并入热词子图做偏向，或用浅融合加热词 LM。",
    "有什么代价：boost 过大易误触发（把相似音也判成热词），且热词表过长会拖慢解码或引入冲突。",
    "怎么评测：用热词命中率（Recall）与误触发率（False Alarm）衡量，并在不同 boost 下画 PR 曲线。"
  ],
  "edgeCases": [
    "同音词冲突：热词“小智”与“小志”音近，boost 易串。",
    "热词拆字：未登录字导致热词无法映射到输出单元。",
    "极小 boost：几乎无效；极大 boost：非热词场景被强行改写。",
    "热词表几万条：解码图过大、内存与延迟上升。"
  ],
  "pitfalls": [
    "只对词表 ID 加偏置却忽略子词/BPE 切分，导致热词根本匹配不上。",
    "boost 固定不变，未随置信度自适应，安静与嘈杂环境误触发差异大。"
  ],
  "prerequisites": [
    "Beam Search 解码与 logits",
    "WFST / 分词（BPE）表示"
  ],
  "workedExample": [
    "将“CodeBuddy”加入热词表、boost=4.0，在 100 条含该词音频上命中率从 62% 提升到 95%。",
    "boost=8.0 时误触发率从 0.5% 升到 6%，说明需调参平衡。"
  ],
  "lineByLine": [
    "for w in hotwords：遍历用户指定的热词。",
    "logits[w] += boost：对热词对应输出单元分数加偏置。",
    "return logits：返回偏置后的分布供 beam 搜索采样。"
  ],
  "codeNotes": [
    "需确保 w 是解码词表或子词序列的索引，而非原始字符串。"
  ],
  "followUps": [
    {
      "question": "热词与上下文偏置（contextual bias）有何区别？",
      "answer": "热词通常基于词表 ID 加偏置；上下文偏置进一步用编码器隐状态做动态注意力偏置，能处理长上下文短语。"
    },
    {
      "question": "如何避免热词误触发？",
      "answer": "用二遍解码只在候选接近热词时加分，或按声学置信度阈值门控 boost。"
    }
  ],
  "followUpAnswers": [
    "热词通常基于词表 ID 加偏置；上下文偏置进一步用编码器隐状态做动态注意力偏置，能处理长上下文短语。",
    "用二遍解码只在候选接近热词时加分，或按声学置信度阈值门控 boost。"
  ],
  "kind": "code"
};
