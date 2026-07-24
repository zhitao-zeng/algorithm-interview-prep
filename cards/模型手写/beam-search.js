export default {
  "kind": "code",
  "id": "beam-search",
  "category": "模型手写",
  "difficulty": "Hard",
  "title": "Beam Search",
  "prompt": "解释束搜索的状态、打分和终止。",
  "quickAnswer": "每步扩展每条 beam 的 top 候选，累计 logprob，保留全局前 beam_size 条。",
  "approach": "每步扩展每条 beam 的 top 候选，累计 logprob，保留全局前 beam_size 条。",
  "explanationFocus": "Beam Search：每步扩展每条 beam 的 top 候选，累计 logprob，保留全局前 beam_size 条。",
  "bruteForce": "《Beam Search》的朴素实现直接按定义展开张量运算，正确但常忽略数值稳定性与向量化。",
  "derivation": [
    "贪心每步只留 1 条，容易因一步之差错过好结果；穷举指数爆炸。",
    "Beam 用固定宽度 k 做剪枝，复杂度约 O(k·L·V)。",
    "分数通常取对数概率之和（乘性概率转加法），并除以长度做长度归一化避免偏好短句。"
  ],
  "invariant": "实现始终保持 Beam Search：每步扩展每条 beam 的 top 候选，累计 logprob，保留全局前 beam_size 条。 的形状约束、概率归一化或尺度约束。",
  "walkthrough": "用一个极小张量演练《Beam Search》，逐步核对形状和中间数值。",
  "edgeCases": [
    "beam_size=1：退化为贪心搜索。",
    "某 beam 已 finished：移出候选池，不再扩展。",
    "空输入/最大长度 0：直接返回空或起点。"
  ],
  "code": "# Python\nimport numpy as np\n\ndef beam_search(log_probs, beam_size=3, eos=0):\n    log_probs = np.asarray(log_probs, dtype=float)  # (T,V,V)\n    if log_probs.ndim != 3: raise ValueError(\"log_probs must be (T,V,V)\")\n    if beam_size <= 0: raise ValueError(\"beam_size must be positive\")\n    vocab = log_probs.shape[-1]\n    if log_probs.shape[1] != vocab or not 0 <= eos < vocab: raise ValueError(\"invalid EOS or vocabulary shape\")\n    beams = [((), 0.0, False)]; finished = []\n    for t in range(log_probs.shape[0]):\n        candidates = []\n        for seq, score, done in beams:\n            if done: candidates.append((seq, score, True)); continue\n            row = log_probs[t, seq[-1] if seq else 0]\n            for token in np.argsort(row)[-beam_size:]:\n                token = int(token); new_score = score + float(row[token])\n                if token == eos: candidates.append((seq, new_score, True))\n                else: candidates.append((seq+(token,), new_score, False))\n        candidates.sort(key=lambda item: item[1], reverse=True)\n        beams = candidates[:beam_size]\n        finished.extend(item for item in beams if item[2])\n        if beams and all(done for _, _, done in beams): break\n    pool = finished if finished else beams\n    return list(max(pool, key=lambda item: item[1])[0]) if pool else []",
  "codeNotes": [
    "优先使用稳定的库算子和 keepdims/keepdim。",
    "注释每个张量的 batch、序列、通道维度。"
  ],
  "complexity": "时间 O(T·beam·V log V)，候选排序另有 O(T·beam² log beam)；峰值空间 O(beam²·T)（候选完整序列），保留束 O(beam·T)",
  "followUps": [
    {
      "question": "为什么累计 log 概率可以相加？",
      "answer": "路径概率是每步条件概率的乘积，取对数后乘积变成加法，同时避免下溢。"
    },
    {
      "question": "如何处理不同长度的偏置？",
      "answer": "短序列少乘几项天然分数较高，可除以长度或使用 length penalty，再比较最终 beam。"
    }
  ],
  "followUpAnswers": [
    "使用 log-sum-exp、减最大值、eps 与高精度累积。",
    "用分块、缓存、稀疏化或 fused kernel。"
  ],
  "pitfalls": [
    "beam_size 不校验（≤0）导致空搜索或除零。",
    "不对分数做长度归一化，生成过度偏好短序列。"
  ],
  "beginnerSummary": "序列生成（翻译、ASR）常用 Beam Search 在「质量」与「开销」间折中：每步保留当前最可能的 top-k 条部分序列（beam），对每条扩展下一个 token，再在所有候选里只留总分最高的 k 条继续。相比贪心（k=1）更不易陷局部最优，相比穷举又省得多的计算。",
  "prerequisites": [
    "维护 k 条「前缀路径」，每条带累计对数概率分数。",
    "每步对所有 beam 的候选做扩展，按分数排序只保留前 k。",
    "遇到结束符（或达到最大长度）的路径移入「已完成」集合，最终从中选最优。"
  ],
  "workedExample": [
    "机器翻译，beam=2。步1候选 \"I\"(0.4)、\"He\"(0.3)；步2各自扩展，保留总分前2：\"I am\"(0.5)、\"He is\"(0.45)（\"I is\" 0.2 被淘汰）。",
    "最终在已完成路径里取分数最高者。"
  ],
  "lineByLine": [
    "校验 beam_size>0（beam_size<=0 报错），初始化 beam 为起点 + 0 分。",
    "循环 L 步：对每条 beam 取下一步 logits，生成候选 (前缀, 新token, 新分数)。",
    "所有候选按分数排序，保留前 k（finished 路径单独收集）。",
    "达到最大长度或全 finished，从结果选最优返回。"
  ],
  "diagram": "机器翻译, beam=2\n步1: 候选 \"I\"(0.4), \"He\"(0.3)\n步2: 各扩展, 保留总分前2:\n     \"I am\"(0.5), \"He is\"(0.45)\n     (\"I is\" 0.2 淘汰)\n每步只留 top-k 条路径"
};
