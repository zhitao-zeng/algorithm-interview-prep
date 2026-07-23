export default {
  "kind": "concept",
  "id": "audio-encoder-adapter",
  "category": "语音大模型",
  "difficulty": "Medium",
  "title": "Audio Encoder 与 Adapter",
  "prompt": "语音大模型里 Audio Encoder 和 Adapter 分别干什么？为什么不能把 Encoder 输出直接喂 LLM？",
  "quickAnswer": "Encoder（如 Whisper/HuBERT）输出高帧率声学特征；Adapter 通过下采样（CTC 合并或卷积/pooling）与时序投影把帧率降到 LLM 词率、并把维度映射到 LLM 词空间。",
  "approach": "Encoder（如 Whisper/HuBERT）输出高帧率声学特征；Adapter 通过下采样与时序投影把帧率降到 LLM 词率、并把维度映射到 LLM 词空间。",
  "explanationFocus": "Encoder 给“声学特征”，Adapter 做“帧率压缩+空间投影”两件事。",
  "bruteForce": "把 50Hz 的 Encoder 帧逐帧当 token 喂 LLM，上下文长度爆炸、训练崩。",
  "derivation": [
    "Encoder 帧率(如 50Hz)与 LLM 接收的 token 率(常 12.5Hz 或更低)不匹配。",
    "高帧率意味着序列过长，自注意力 O(N²) 成本不可接受。",
    "Adapter 用 CTC 前缀合并/卷积/pooling 压缩冗余帧，再做线性投影对齐语义空间。"
  ],
  "invariant": "Adapter 必须保持“时间顺序”与“内容不丢”，只是降低帧率与换维度。",
  "walkthrough": "举例：Encoder 出 (T=200, 768)，Adapter 用 4 倍下采样+线性→ (50, 4096) 喂 LLM。",
  "edgeCases": [
    "流式：Adapter 必须支持 chunk 级下采样，不能看未来帧。",
    "静音段：CTC 合并会把静音帧大量压缩，需保证不吞掉边界词。",
    "多语种：Encoder 表征偏移，Adapter 需足够容量桥接。"
  ],
  "code": "# Python\ndef audio_adapter(feats, proj, downsample=4):\n    # feats: (B, T, D_a) -> (B, T//downsample, D_llm)\n    x = proj(feats)                 # 维度投影到 LLM 词空间\n    return x[:, ::downsample, :]    # 等距下采样压缩帧率",
  "codeNotes": [
    "CTC 式合并可做到内容感知的下采样（冗余帧多压、关键帧少压）。",
    "下采样率需与 LLM 位置编码/上下文预算匹配。"
  ],
  "complexity": "时间 O(B·T·D_a·D_llm)，下采样后 LLM 侧成本按 T/ds 计，整体降为原来的 1/ds² 量级（注意力）。",
  "followUps": [
    {
      "question": "为什么不是简单 pooling 而是常用 CTC 合并？",
      "answer": "Pooling 等距丢弃可能切坏一个音节；CTC 前缀合并依据模型输出合并“重复/blank”帧，更贴合语音边界，保留语义完整性。"
    },
    {
      "question": "Adapter 一般训哪些部分？",
      "answer": "常冻结 Encoder 与 LLM，只训 Adapter（投影+下采样），显存低、收敛快；后期再端到端微调。"
    }
  ],
  "followUpAnswers": [
    "Q-Former 用可学习 query 做跨模态下采样。",
    "先训 Adapter 对齐，再解冻 LLM 做 SFT。"
  ],
  "pitfalls": [
    "下采样率过大导致辅音/短词丢失。",
    "Adapter 没对齐语义空间，LLM 读不懂特征。"
  ],
  "beginnerSummary": "Audio Encoder 像“听觉皮层”，把声音变成一串高频率的特征向量（比如每秒 50 个）。但大模型的“词”没那么密（比如每秒 12 个）。Adapter 就是中间的“翻译+压缩器”：先把特征投影到大模型熟悉的维度，再按固定步长抽稀，让序列变短。这样大模型既能听懂声音，又不会被超长序列拖垮。",
  "prerequisites": [
    "声音特征是一串按时间排列的向量。",
    "大模型按 token 序列处理，序列越长越慢。",
    "需要把“帧特征”变成“短而对齐的 token 表示”。"
  ],
  "workedExample": [
    "Encoder 出 200 帧 → Adapter 投影到 4096 维 → 每 4 帧取 1 帧 → 50 个向量喂 LLM。",
    "若不做 Adapter 直接喂 200 帧，LLM 自注意力成本约 16 倍于 50 帧。"
  ],
  "lineByLine": [
    "Encoder 输出高帧率声学特征 (B,T,D_a)。",
    "proj 把维度映射到 LLM 词空间 D_llm。",
    "downsample 等距抽稀，帧率降到 LLM 可接受范围。",
    "输出作为 LLM 的前缀 token 序列。"
  ],
  "diagram": "Encoder(50Hz) ─▶ (B,T,768)\n                    │ proj\n                    ▼\n                 (B,T,4096)\n                    │ 每4帧取1 (downsample)\n                    ▼\n              Adapter 输出 (B,50,4096) ─▶ LLM"
};
