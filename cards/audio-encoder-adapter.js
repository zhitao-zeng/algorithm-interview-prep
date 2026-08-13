export default {
  kind: 'concept',
  id: 'audio-encoder-adapter',
  category: '语音大模型',
  difficulty: 'Medium',
  title: 'Audio Encoder 与 Adapter',
  prompt: 'Audio Encoder 的输出为什么通常要经过 Adapter 才接入 LLM？Adapter 具体解决哪三类不匹配？',
  quickAnswer: 'Encoder 把波形变成高帧率声学表示；Adapter 通常解决三件事：把维度投到 LLM hidden size、压缩时间轴、把音频表示的分布对齐到 LLM 可学习的输入。不是“绝对不能直接喂”，而是直接输入往往过长、维度不匹配且训练困难。',
  approach: '先写出 Encoder 输出形状，再根据 LLM 上下文预算选择卷积、pooling、Q-Former 或其他压缩方式，最后用下游任务和信息保留实验选择压缩率。',
  explanationFocus: 'Adapter 不只是线性换维度，还承担序列压缩和模态对齐。',
  bruteForce: '对每个音频帧只做线性投影后全部送入 LLM，虽然理论上可行，但长音频会迅速占满上下文并放大注意力成本。',
  derivation: [
    '为什么需要：音频帧通常比文本 token 密得多，且 encoder hidden size 与 LLM hidden size 不同。',
    '怎么实现：先用卷积/pooling/Q-Former 等压缩时间轴，再用线性层或 MLP 投影；训练时可先冻结大组件只学 adapter。',
    '有什么代价：压缩过强会丢短音素、语气或时间信息；压缩过弱则上下文和显存成本过高。',
    '怎么评测：画压缩率—任务效果—延迟曲线，并单独检查短词、数字、噪声和长音频。',
  ],
  invariant: '压缩只能缩短时间轴，不能破坏时间顺序和任务需要的关键信息。',
  walkthrough: '示意输入为 (B,T,D_audio)，Adapter 输出 (B,T/r,D_llm)。真正要调的是压缩率 r 与下游效果的折中。',
  edgeCases: [
    '简单等距抽帧可能正好丢掉很短的辅音或数字。',
    '流式场景不能使用依赖未来整段音频的压缩。',
    '不同语言和采样率可能需要不同压缩率或位置处理。',
  ],
  code: "def adapter_forward(audio_features, temporal_compressor, projection):\n    shorter = temporal_compressor(audio_features)\n    return projection(shorter)",
  codeNotes: [
    'temporal_compressor 可以是卷积、pooling、Q-Former 或其他可学习模块。',
    '这段草图刻意不把“每四帧取一帧”写成唯一方案。',
  ],
  complexity: 'Adapter 自身通常近似随音频帧数线性增长；它更大的价值是把后续 LLM 序列从 T 缩到 T/r，使注意力和 KV 成本明显下降。',
  followUps: [
    { question: 'Q-Former 相比固定 pooling 有什么区别？', answer: 'Q-Former 用可学习 query 读取变长音频，更能按内容选择信息；代价是额外注意力计算和训练复杂度。' },
    { question: '压缩率怎么定？', answer: '不能只拍一个 4 倍。要结合 LLM 上下文预算，比较多档压缩率在任务效果、长音频和延迟上的曲线。' },
  ],
  followUpAnswers: [
    '先给形状变化，再说明压缩策略与验证方法。',
    '冻结哪些模块是训练策略，不是 Adapter 的定义。',
  ],
  pitfalls: [
    '说“连续向量不在 LLM 词表，所以不能输入”——LLM 可以接收投影后的 soft tokens。',
    '把固定步长抽帧当成不会丢信息的标准做法。',
  ],
  beginnerSummary: 'Encoder 像把声音写成一大本密密麻麻的笔记，Adapter 要做三件事：把笔记格式改成大模型能读的维度、删掉重复部分、尽量保留真正有用的内容。压缩太少会太慢，压缩太多又会漏字，所以必须用实验选。',
  prerequisites: [
    '音频特征：Encoder 输出按时间排列的高帧率向量。',
    '投影层与表征对齐：把一种 hidden size 映射到另一种 hidden size。',
    'Transformer 自注意力：序列越长，计算与缓存通常越昂贵。',
  ],
  workedExample: [
    '示意：比较 2 倍、4 倍和 8 倍压缩，不预设哪一档最好。',
    '若 8 倍在平均集没掉点，却在短数字和人名上明显变差，就不能只凭平均值上线。',
  ],
  lineByLine: [
    '先压缩时间轴。',
    '再投影到 LLM hidden size。',
    '通过下游任务与切片评测选择压缩模块和比例。',
  ],
  diagram: '波形 ─▶ Audio Encoder ─▶ (B,T,D_audio)\n                              │ 时间压缩\n                              ▼\n                         (B,T/r,D_audio) ─▶ 投影 ─▶ (B,T/r,D_llm) ─▶ LLM',
  references: [
    { title: 'Qwen2.5-Omni Technical Report', url: 'https://arxiv.org/abs/2503.20215' },
  ],
};
