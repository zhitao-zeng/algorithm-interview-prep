export default {
  "id": "as-conformer",
  "category": "ASR 专项",
  "difficulty": "Medium",
  "title": "Conformer 模型",
  "prompt": "Conformer 是如何把卷积的局部建模与 Transformer 的全局建模结合起来的？",
  "quickAnswer": "Conformer 在 Transformer 块中插入卷积子模块，采用 Macaron 结构（卷积放在 FFN 前后各一半）并用多头自注意力捕获全局依赖，从而同时建模语音的局部声学细节与长程上下文。",
  "approach": "以 Transformer 编码块为骨架，在 FFN 之前和之后各加一个卷积模块（Macaron 0.5 权重），中间保留多头自注意力；卷积模块使用 pointwise → GLU → depthwise → BN → Swish → pointwise 的结构并做下采样感知。",
  "explanationFocus": "是什么：Conformer 是一种用于语音识别的编码器架构，它在 Transformer 模块两侧分别加入卷积子模块，用 Macaron 结构同时捕获局部细节与全局依赖，是流式/非流式 ASR 的主流 backbone。",
  "bruteForce": "朴素做法只用一个深层 CNN 或只用一个深层 Transformer：CNN 感受野有限、难以捕获长程依赖，Transformer 则对局部纹理建模弱且对长序列算力开销大。",
  "invariant": "每个 Conformer block 输入输出形状相同（残差连接保证），无论卷积与注意力顺序如何调换，训练前后序列长度 T 与通道 d_model 始终不变。",
  "walkthrough": "输入 80 维 fbank 经下采样到 T×512；逐 block 执行 x+0.5·FFN → x+Conv → x+MHSA → x+0.5·FFN；堆叠若干 block 后接线性层输出至 CTC/RNN-T 预测网络。",
  "complexity": "时间复杂度约 O(T·d² + T²·d)（注意力占主导），卷积为线性；参数量主要来自注意力与卷积的 pointwise 层，相比纯 Transformer 增加约 15%~30% 参数但 WER 明显下降。",
  "beginnerSummary": "Conformer = CNN 的局部感知 + Transformer 的全局感知，像一个“既看细节又看全局”的编码器，是现代 ASR 的常用结构。",
  "diagram": "   input (T x d)\n     |\n  FFN(0.5)\n     |\n  ConvModule\n     |\n    MHSA\n     |\n  FFN(0.5)\n     |\n   output",
  "code": "import math\n\ndef conformer_block(x, d_model=512):\n    # Macaron: 卷积在 FFN 两侧各半\n    x = x + 0.5 * ffn(x)\n    x = x + conv_module(x)\n    x = x + multi_head_attention(x)\n    x = x + 0.5 * ffn(x)\n    return x",
  "derivation": [
    "为什么需要：纯 CNN 感受野受限、纯 Transformer 局部建模弱且长序列算力高，语音同时需要局部声学与长程语义，因此需要二者融合。",
    "怎么实现：在 Transformer 块内加入卷积子模块，采用 Macaron 结构（FFN 前后各 0.5 权重）并保留 MHSA，卷积模块用 pointwise-GLU-depthwise-BN-Swish 组合。",
    "有什么代价：相比纯 Transformer 增加约 15%~30% 参数与少量卷积算力，且实现与调参更复杂（卷积与注意力权重需平衡）。",
    "怎么评测：在 LibriSpeech/中文数据集上对比 WER，观察随层数、卷积核、注意力头数的收益，并测长音频 RTF 与显存占用。"
  ],
  "edgeCases": [
    "极长短音频：序列过长时注意力 O(T²) 显存爆掉，需要分块或流式处理。",
    "小卷积核：核太小局部能力弱，核太大引入延迟与参数。",
    "训练不稳定：卷积与注意力并行相加时梯度尺度不同，需要合理初始化与学习率预热。",
    "下采样倍率不匹配：卷积与注意力对长度假设不一致会导致形状对齐错误。"
  ],
  "pitfalls": [
    "把卷积放在注意力之前就当成普通 Transformer，忘了 Macaron 的 0.5 权重与对称结构。",
    "忽视 Swish/BN 在推理时的融合，导致部署 RTF 偏高。"
  ],
  "prerequisites": [
    "Transformer 自注意力与位置编码",
    "卷积神经网络（depthwise separable conv）与 pooling"
  ],
  "workedExample": [
    "输入 16kHz 语音提 80 维 fbank，4 倍下采样得到 T=200 帧、d=512，送入 16 层 Conformer 得到上下文表示。",
    "在 AISHELL 上用 Conformer 替换 Transformer 编码器，WER 从 5.8% 降到 4.7%。"
  ],
  "lineByLine": [
    "x = x + 0.5 * ffn(x)：Macaron 前半 FFN 残差，权重 0.5 平衡容量。",
    "x = x + conv_module(x)：卷积捕获局部声学模式，如共振峰过渡。",
    "x = x + multi_head_attention(x)：注意力捕获跨帧长程依赖，如词内协同发音。",
    "x = x + 0.5 * ffn(x)：Macaron 后半 FFN 再次非线性变换并残差相加。"
  ],
  "codeNotes": [
    "ffn/conv_module/multi_head_attention 均保持形状 (T, d_model)，靠残差保证形状不变。"
  ],
  "followUps": [
    {
      "question": "Conformer 与 Conformer-T 的差别是什么？",
      "answer": "Conformer-T 减少注意力头数与层数、用相对位置编码以降低延迟，适合流式场景。"
    },
    {
      "question": "卷积模块为什么用 GLU 而不是 ReLU？",
      "answer": "GLU 提供门控能力，缓解梯度饱和并提升表示容量，在语音任务上更稳定。"
    }
  ],
  "followUpAnswers": [
    "Conformer-T 减少注意力头数与层数、用相对位置编码以降低延迟，适合流式场景。",
    "GLU 提供门控能力，缓解梯度饱和并提升表示容量，在语音任务上更稳定。"
  ],
  "kind": "code"
};
