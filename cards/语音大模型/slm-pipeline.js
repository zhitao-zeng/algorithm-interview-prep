export default {
  "id": "slm-pipeline",
  "category": "语音大模型",
  "difficulty": "Medium",
  "title": "语音大模型端到端 Pipeline",
  "prompt": "请描述语音大模型（Speech LLM）的端到端 pipeline，并说明 audio encoder、token 化、LLM、audio decoder 各自的作用？",
  "quickAnswer": "语音 LLM 把音频经 encoder 抽取表征并离散化为 token，与文本 token 拼接进 LLM 做自回归推理，输出 token 再经 audio decoder 还原为波形。端到端让语义理解与语音生成在同一框架内完成。",
  "code": "from dataclasses import dataclass\n\ndef speech_llm_step(audio, encoder, llm, decoder):\n    feat = encoder(audio)            # 1. 音频编码器抽取连续表征\n    tokens = encoder.quantize(feat)  # 2. 量化成离散语音 token\n    out = llm(tokens)                # 3. LLM 自回归生成 token\n    wav = decoder(out)               # 4. audio decoder 合成波形\n    return wav",
  "complexity": "时间 O(T*d + N*C)，空间 O(T + N)（T 音频帧数，N 生成 token 数）",
  "beginnerSummary": "就像先把你说的话转成一种'密码本里的编号'，大模型读编号思考后写出新编号，再由合成器把编号变回声音，全程只走这一条流水线。",
  "derivation": [
    "为什么需要：纯文本 LLM 无法直接吃音频，需要一个统一接口把声音变成模型能处理的 token，从而支持语音理解与生成。",
    "怎么实现：用 audio encoder 抽取表征并量化成离散 token，与文本 token 拼进 LLM，生成端再用 audio decoder 还原波形。",
    "有什么代价：量化会损失声学细节，且自回归生成逐 token 延迟高，长音频的 encoder 计算量随时长线性增长。",
    "怎么评测：用语音识别词错率 WER、语音合成 MOS、以及端到端任务准确率综合衡量整条链路质量。"
  ],
  "edgeCases": [
    "输入静音或极短音频时 encoder 输出为空，需补 <pad> 或 <silent> 特殊 token。",
    "多说话人重叠音频会让 token 混淆，需要说话人分离或流式分轨预处理。",
    "生成 token 出现 <eos> 提前触发会导致语音截断，需配置最小生成长度。",
    "长音频超出上下文窗口需分块并保留 chunk 边界的语义连续。"
  ],
  "pitfalls": [
    "把 audio decoder 当作普通 vocoder 直接接 LLM 输出，忽略 token 与声学帧率不匹配会导致节奏错乱。",
    "混淆连续表征与离散 token，直接把连续向量拼进 LLM 会破坏词表对齐。"
  ],
  "prerequisites": [
    "Transformer 与自回归语言模型基础",
    "音频特征（Mel 谱/codec）与矢量量化原理"
  ],
  "workedExample": [
    "用户说'今天天气如何' → Whisper encoder 输出 50 帧特征 → 量化为 32 个语义 token。",
    "LLM 生成回复 token 序列 → audio decoder 以 25Hz 帧率合成 1.8s 波形回答。"
  ],
  "lineByLine": [
    "feat = encoder(audio)：调用音频编码器把原始波形抽取成连续隐表征。",
    "tokens = encoder.quantize(feat)：用码本把连续特征离散化成语音 token 序列。",
    "out = llm(tokens)：把语音 token 送进 LLM 做自回归生成得到回复 token。",
    "wav = decoder(out)：audio decoder 把回复 token 还原成可播放的波形。"
  ],
  "followUps": [
    {
      "question": "如何处理流式场景下的 audio token 生成？",
      "answer": "采用 chunk-wise streaming encoder 与 LLM 的 KV-cache，按固定帧块增量编码并在收到部分 token 即触发 decoder 预热。"
    },
    {
      "question": "为什么不直接用连续表征而要用离散 token？",
      "answer": "离散 token 能复用文本 LLM 的词表与交叉熵训练范式，且便于做 next-token 预测，连续向量拼接则破坏词表对齐并难以定义生成目标。"
    }
  ],
  "followUpAnswers": [
    "采用 chunk-wise streaming encoder 与 LLM 的 KV-cache，按固定帧块增量编码并在收到部分 token 即触发 decoder 预热。",
    "离散 token 能复用文本 LLM 的词表与交叉熵训练范式，且便于做 next-token 预测，连续向量拼接则破坏词表对齐并难以定义生成目标。"
  ],
  "explanationFocus": "是什么：语音大模型端到端 pipeline 指从原始音频输入到合成音频输出的一条统一链路，核心是 audio encoder 把声音编码为 token、LLM 负责语义推理、audio decoder 再把 token 还原成声音。",
  "approach": "核心思路是把音频和文本统一到离散 token 空间，使同一个自回归 LLM 既能理解语音又能生成语音，从而用一个模型覆盖听、想、说三个环节。",
  "kind": "concept"
};
