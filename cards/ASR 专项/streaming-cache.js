export default {
  "kind": "code",
  "id": "streaming-cache",
  "category": "ASR 专项",
  "difficulty": "Hard",
  "title": "流式 ASR 缓存",
  "prompt": "Transformer/Conformer 流式识别如何缓存。",
  "quickAnswer": "缓存历史 KV 或左上下文；每个 chunk 只算新增帧，并控制右上下文带来的延迟。",
  "approach": "缓存历史 KV 或左上下文；每个 chunk 只算新增帧，并控制右上下文带来的延迟。",
  "explanationFocus": "流式 ASR 缓存：缓存历史 KV 或左上下文；每个 chunk 只算新增帧，并控制右上下文带来的延迟。",
  "bruteForce": "《流式 ASR 缓存》可枚举所有对齐或转写路径再求和/比较，但路径数随帧数指数增长。",
  "derivation": [
    "非流式（整句编码）延迟 = 整句长度，无法满足实时字幕/对话。",
    "分块 + 缓存让每块的依赖局限于「历史若干块」，延迟降到单块尺度，且复用已算特征省算力。",
    "右侧 look-ahead 能进一步提升精度，但会增加少量延迟，需权衡。"
  ],
  "invariant": "每步保存的分数完整覆盖 流式 ASR 缓存：缓存历史 KV 或左上下文；每个 chunk 只算新增帧，并控制右上下文带来的延迟。 下所有合法历史，而不会重复或遗漏对齐路径。",
  "walkthrough": "演练《流式 ASR 缓存》时写出两三帧的 token、blank 与前缀/状态转移。",
  "edgeCases": [
    "left_context<0：非法，校验报错。",
    "首块（无历史）：left context 为空，仅用当前块。",
    "chunk 边界切在词中间：靠上下文缓存缓解截断错误。"
  ],
  "code": "# Python\nimport numpy as np\n\ndef streaming_encode(chunks,encode_chunk,left_context=16):\n    if left_context<0: raise ValueError(\"left_context must be non-negative\")\n    cache=None; outputs=[]\n    for chunk in chunks:\n        chunk=np.asarray(chunk,dtype=float); context=chunk if cache is None else np.concatenate([cache,chunk],axis=0)\n        outputs.append(encode_chunk(context,0 if cache is None else len(cache))); cache=context[-left_context:] if left_context else context[:0]\n    return outputs,cache",
  "codeNotes": [
    "概率累积应在 log 域使用 log-sum-exp。",
    "流式场景要明确何时提交稳定前缀和截断缓存。"
  ],
  "complexity": "时间随块数线性，空间取决于缓存的历史块数（left_context）。",
  "followUps": [
    {
      "question": "如何降低首字延迟？",
      "answer": "减小 chunk 和右上下文，或采用更早的稳定前缀提交；代价是吞吐和上下文可能下降。"
    },
    {
      "question": "为什么缓存必须截断？",
      "answer": "无限缓存会让每个 chunk 的注意力和显存随音频总长度线性增长，最终失去流式优势。"
    }
  ],
  "followUpAnswers": [
    "减小 chunk 和右上下文，或使用更早的稳定前缀策略。",
    "无限缓存会使计算和显存随音频长度线性增长。"
  ],
  "pitfalls": [
    "left_context 为负或不合法却不校验，导致索引错误。",
    "缓存不随窗口滑动而无限增长，内存泄漏。"
  ],
  "beginnerSummary": "流式 ASR 不能等整段音频结束再识别，而是把音频切成小块（chunk）逐块送入编码器，并用「缓存（cache）」保留历史 chunk 的高层特征，使当前块能利用上下文。常见做法：每个 chunk 的编码器输出拼上左侧历史上下文（left context）与可选的右侧前瞻（look-ahead），解码器基于增量缓存产出部分结果，大幅降低延迟。",
  "prerequisites": [
    "音频分块：固定长度 chunk（如 1 秒）依次到达，逐块处理。",
    "缓存保存前面若干 chunk 的编码器隐状态，作为当前块的 left context。",
    "left_context 控制能看到多少历史；若 <0 非法（code 已校验）。"
  ],
  "workedExample": [
    "chunk1 [0:1s] 进编码器，结果存入 cache。",
    "chunk2 [1:2s] 编码时拼接 cache 中的历史高层特征（left context），得到含上下文的表示，再增量解码。",
    "类似地 chunk3 复用 chunk1+2 的缓存，延迟始终只取决于单块长度。"
  ],
  "lineByLine": [
    "接收新 chunk，对其做编码器前向，得到当前块特征。",
    "从 cache 取 left_context 个历史块特征，与当前块拼接（或做交叉注意力）。",
    "将当前块（含上下文）送入解码器，基于增量缓存更新部分输出。",
    "把当前块特征写入 cache，滑动窗口淘汰过旧块。"
  ],
  "diagram": "流式音频分块:\nchunk1 [0:1s] → encoder → cache\nchunk2 [1:2s] → 复用 chunk1 高层特征(cache)\n            └ 拼接历史上下文\n输出增量解码, 低延迟"
};
