export default {
  "id": "gen-autoregressive-video",
  "kind": "concept",
  "category": "生成式模型",
  "title": "自回归视频生成",
  "difficulty": "Hard",
  "prompt": "自回归视频生成是怎么做的？先把视频 tokenize 再 Transformer 自回归，与扩散路线的权衡是什么？",
  "quickAnswer": "自回归视频先用 VQ-VAE / 视频 tokenizer 把每段视频压成离散 token 序列，再用 GPT 式 Transformer 按时间/空间顺序逐 token 预测下一 token。优势是天然支持可变长、强时序因果与可控编辑；劣势是串行解码慢、易误差累积。与扩散比：扩散并行去噪质量高但时长受限，自回归更利于长视频与组合。",
  "code": "from torch import arange\ndef ar_video(tokenizer, gpt, z0, steps):\n    z = z0.unsqueeze(0)\n    for i in range(steps):                 # 自回归逐 token 生成\n        logits = gpt(z)[:, -1]\n        nxt = logits.argmax(-1, keepdim=True)\n        z = torch.cat([z, nxt], dim=1)\n    return tokenizer.decode(z)",
  "complexity": "O(L²·d)，L 为 token 数",
  "beginnerSummary": "像写文章一样“一个字接一个字”地生成视频：先把画面变成一串符号，再用大模型顺着时间往下续写，写到哪算到哪。",
  "explanationFocus": "是什么：自回归视频生成是把视频离散化为 token 序列、用 Transformer 按因果顺序逐 token 预测来生成视频的范式（如 VideoPoet、Sora 部分路线）。",
  "approach": "训练视频 tokenizer 得到离散码本，把视频转 token；再用标准自回归语言模型学习 P(z_i|z_<i)，采样时逐 token 延展并解码回像素/视频。",
  "derivation": [
    "为什么需要：扩散难做任意长且可编辑的视频，AR 用序列天然支持。",
    "怎么实现：VQ-VAE 量化 + Transformer LM，按光栅/时空顺序自回归。",
    "有什么代价：串行解码 O(L) 慢，错误会累积传播；离散量化损细节。",
    "怎么评测：用 FVD +  tokenizer 重建指标，及人工连贯/编辑可控性。"
  ],
  "edgeCases": [
    "长序列 O(L²) 注意力需分块/线性注意力。",
    "码本塌陷会降低表达力，需 codebook 正则。",
    "自回归易“跑题”，需强条件约束。"
  ],
  "pitfalls": [
    "以为 tokenizer 无损——量化必有损，影响清晰度。",
    "忽略误差累积，长视频末尾易崩。"
  ],
  "prerequisites": [
    "VQ-VAE / 向量量化",
    "Transformer 语言模型",
    "视频扩散对比"
  ],
  "workedExample": [
    "用 VQ-VAE 把 4 秒视频编码成 1024 个离散 token。",
    "GPT 模型在 token 上做因果建模并训练。",
    "推理时给首帧 token，自回归续写后续帧 token 后解码。"
  ],
  "lineByLine": [
    "z0 是已生成的初始 token 序列。",
    "循环里 gpt(z) 输出下一位置 logits。",
    "argmax 取最可能 token 并拼回序列，逐步延展。",
    "tokenizer.decode 把整条序列还原成视频。"
  ],
  "followUps": [
    {
      "question": "AR 与扩散视频谁更好？",
      "answer": "AR 擅长度与编辑/组合，扩散擅画质与短时连贯；目前多融合（如扩散当 tokenizer 解码器）。"
    },
    {
      "question": "如何缓解误差累积？",
      "answer": "用 classifier-free 引导、重看前文窗口、或周期性锚定关键帧。"
    },
    {
      "question": "token 顺序怎么设计？",
      "answer": "可按空间光栅、时间优先或时空交替，影响因果性与并行度。"
    }
  ],
  "followUpAnswers": [
    "AR 擅长度与编辑/组合，扩散擅画质与短时连贯；目前多融合（如扩散当 tokenizer 解码器）。",
    "用 classifier-free 引导、重看前文窗口、或周期性锚定关键帧。",
    "可按空间光栅、时间优先或时空交替，影响因果性与并行度。"
  ],
  "order": 8
};
