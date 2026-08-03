export default {
  "id": "vg-autoregressive",
  "category": "视频生成",
  "difficulty": "Hard",
  "title": "自回归视频生成",
  "prompt": "自回归（如视频 token 逐个/逐块预测）如何生成视频，与扩散模型在训练目标和推理上有何不同？",
  "quickAnswer": "自回归把视频离散成 token 序列，训练时最大化下一 token 的似然（交叉熵），推理时按序采样并以前面 token 为条件。与扩散不同：扩散在连续潜空间去噪、并行去噪多步；自回归是离散、严格串行、天然支持长度延展与 LLM 对齐。代价是推理慢（O(序列长)）且错误会沿序列累积。",
  "approach": "先讲 tokenizer→token 序列→因果 LM 训练，再对比扩散的训练（噪声预测）与推理（并行去噪），最后讲速度/错误累积权衡。",
  "explanationFocus": "是什么：自回归视频生成把视频表示为 token 序列，用类似语言模型的方式一个接一个（或一块接一块）预测后续 token，从而\"写\"出整段视频，是离散化路线代表（如 VideoPoet、Sora 的 token 版思路）。",
  "bruteForce": "最朴素自回归是对每个像素逐点预测，序列长度 = T·H·W·3，根本不可训练；必须先靠 tokenizer 把序列压到千级 token。",
  "invariant": "在给定前缀 token 的条件下，下一 token 的预测分布应等于数据真实条件分布；生成任意前缀的概率等于各步条件概率连乘。",
  "walkthrough": "视频经 tokenizer 成 1024 个 token，Transformer 12 层、维度 1024、上下文 2048；训练用交叉熵，推理温度 0.9 逐 token 采样，生成 1024 token 需 1024 次前向，单卡约 3 秒。",
  "code": "import torch\n\ndef ar_sample(model, prefix, n_new, temperature=0.9):\n    tokens = list(prefix)\n    for _ in range(n_new):\n        logits = model(torch.tensor(tokens))[-1]      # 取最后位置\n        probs = torch.softmax(logits / temperature, -1)\n        nxt = torch.multinomial(probs, 1).item()\n        tokens.append(nxt)\n    return tokens",
  "complexity": "训练 O(N·L²·D)（L 为上下文），推理串行 O(N) 次前向；相比扩散可并行去噪，自回归单步快但总步数=token 数，长视频明显更慢。",
  "beginnerSummary": "自回归像接龙写句子：每写一个词都看着前面写好的，一个接一个把\"视频密码\"写完，再整体解压成动画；扩散则像同时给整张模糊图一点点擦清。",
  "diagram": "[<bos>] → t1 → t2 → t3 → ... → tN → 解码器 → 视频\n   │因果注意力│ 每个只看左边",
  "derivation": [
    "为什么需要：离散 token 能与语言模型统一、便于长度延展与可控生成。",
    "怎么实现：tokenizer 离散化 + 因果 Transformer 最大化似然。",
    "有什么代价：串行推理慢、错误累积、量化有损。",
    "怎么评测：token 级困惑度 + 解码后 FVD 与人工评分。"
  ],
  "edgeCases": [
    "生成中途出现无效/越界 token 索引需 clamp 或重采样。",
    "长序列超出上下文窗口需分段并衔接前缀。",
    "低温采样易模式崩溃、高温易时序乱跳，需调温度。"
  ],
  "pitfalls": [
    "把训练时 teacher forcing 与推理时自采样分布差（exposure bias）忽略，导致推理崩坏。",
    "误用双向注意力当因果，训练指标好但推理不能用。"
  ],
  "prerequisites": [
    "Transformer 与因果注意力",
    "视频 tokenizer/VQ",
    "最大似然与交叉熵"
  ],
  "workedExample": [
    "VideoPoET 风格：文本 token 与视频 token 拼接，自回归同时建模，生成 16 帧需约 1k 视频 token。",
    "同样 1024 token，扩散 25 步并行 vs 自回归 1024 步串行，自回归吞吐更低但可控性更强。"
  ],
  "lineByLine": [
    "def ar_sample(model, prefix, n_new, temperature=0.9)：自回归采样函数。",
    "logits = model(torch.tensor(tokens))[-1]：前向得最后位置下一 token 的 logits。",
    "probs = torch.softmax(logits / temperature, -1)：温度缩放后转概率。",
    "nxt = torch.multinomial(probs, 1).item()：按概率采样一个 token。",
    "tokens.append(nxt)：追加到序列继续生成。"
  ],
  "codeNotes": [
    "温度越高多样性越强但越易失控；可用 top-k/top-p 截断提升稳定性。"
  ],
  "followUps": [
    {
      "question": "自回归和扩散怎么结合？",
      "answer": "常见是用扩散在连续潜空间去噪、自回归管时序/语义规划，或 tokenizer 端统一后用扩散解码 token。"
    },
    {
      "question": "自回归的错误累积怎么缓解？",
      "answer": "用置信度重采样、插入周期性\"锚点\"帧、或在训练加一定比例自生成样本做微调。"
    }
  ],
  "followUpAnswers": [
    "常见是用扩散在连续潜空间去噪、自回归管时序/语义规划，或 tokenizer 端统一后用扩散解码 token。",
    "用置信度重采样、插入周期性\"锚点\"帧、或在训练加一定比例自生成样本做微调。"
  ],
  "kind": "concept"
};
