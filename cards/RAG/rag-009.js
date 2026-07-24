export default {
  "kind": "concept",
  "id": "rag-009",
  "category": "RAG",
  "difficulty": "Medium",
  "title": "RAG 中上下文压缩怎么做？",
  "prompt": "RAG 检索内容过多时，如何进行上下文压缩(context compression)？",
  "quickAnswer": "用 LLM 或重排器对召回块抽取与问题相关的句子/子句，或生成摘要，再喂 LLM，降低噪声与 token 成本。",
  "approach": "在检索与生成间插入『压缩层』：抽取式(取相关句)或生成式(摘要)，保留信号去掉冗余。",
  "explanationFocus": "是什么：上下文压缩是对检索到的长片段做精简，只保留回答问题所需内容，缓解『lost in the middle』与 token 浪费。",
  "bruteForce": "把检索到的 10 个整块原样塞进 prompt：噪声多、关键信息被埋中间、token 贵且易超窗。",
  "derivation": [
    "为什么需要：召回块常含大量无关句子，既占窗口又稀释注意力，尤其长上下文『中间遗忘』明显。",
    "怎么实现：抽取式用 LLM 标出相关句(compressive retrieval)；生成式用小型 LLM 把多块压成摘要；或与 rerank 配合只取高分句。",
    "有什么代价：压缩本身多一次 LLM 调用(延迟/成本)；抽取过狠可能丢关键信息。",
    "怎么评测：对比压缩前后 Faithfulness 与 Answer Relevancy，确认未丢要点。"
  ],
  "invariant": "经验法则：压缩保『相关信号』弃『冗余噪声』，压缩后 Faithfulness 不应下降。",
  "walkthrough": "召回 5 段共 4000 token，压缩层抽取与『年假天数』相关 6 句约 600 token，LLM 据此作答，token 省 85% 且答案更聚焦。",
  "edgeCases": [
    "压缩过度删除关键句致漏答",
    "生成式摘要引入幻觉",
    "多块矛盾信息被压掉一方",
    "压缩延迟抵消检索收益"
  ],
  "code": "def compress(query, chunks, llm):\n    sys = '只提取与问题相关的句子，不要改写或补充。'\n    kept = []\n    for c in chunks:\n        kept.append(llm.generate(sys + f'\\n问题:{query}\\n文本:{c}'))\n    return '\\n'.join(kept)",
  "codeNotes": [
    "抽取式要求『只取原句』降低幻觉",
    "也可先 rerank 再仅压缩 top 片段省成本"
  ],
  "complexity": "压缩 O(块数) 次 LLM 调用；生成式输出长度远小于原输入。",
  "followUps": [
    {
      "question": "抽取式与生成式压缩怎么选？",
      "answer": "要保原意可溯源选抽取式；要高度浓缩且可接受改写选生成式，但需警惕摘要幻觉。"
    },
    {
      "question": "压缩和 rerank 冲突吗？",
      "answer": "不冲突，常先 rerank 取 top 再压缩，既排得准又压得狠。"
    }
  ],
  "followUpAnswers": [
    "要保原意可溯源选抽取式；要高度浓缩且可接受改写选生成式，但需警惕摘要幻觉。",
    "不冲突，常先 rerank 取 top 再压缩，既排得准又压得狠。"
  ],
  "pitfalls": [
    "压缩丢关键句",
    "生成式摘要编内容",
    "为压缩多一次调用却拖慢",
    "未先 rerank 导致压缩对象过多"
  ],
  "beginnerSummary": "上下文压缩像『高亮重点』：把一大段里和问题有关的句子划出来，删掉废话再给 AI 看。",
  "prerequisites": [
    "rerank 概念",
    "LLM 抽取/摘要能力"
  ],
  "workedExample": [
    "召回多块长文本",
    "LLM 抽取每块的『相关句』拼接后喂生成模型"
  ],
  "lineByLine": [
    "定义只提取不改写的系统提示",
    "逐块让 LLM 抽取相关句",
    "拼接保留句作为精简上下文"
  ],
  "diagram": "chunks -> [Compress: keep relevant sentences] -> short context -> LLM"
};
