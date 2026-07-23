export default {
  "kind": "concept",
  "id": "inf-speculative-decoding",
  "category": "大模型推理原理",
  "difficulty": "Hard",
  "title": "什么是 Speculative Decoding（投机解码）？为什么可以无损加速？",
  "prompt": "什么是 Speculative Decoding？为什么它可以“无损”地加速自回归生成？",
  "quickAnswer": "用一个更小的 Draft Model 自回归提议若干候选 token，再用 Target Model 一次性并行验证这批候选；接受/拒绝按目标模型分布做重要性采样，因此输出分布与单独用 Target Model 完全一致（无损）。加速来自“用一次大模型前向验证多个 token”，当接受率较高时等效减少大模型步数。",
  "approach": "Draft 提议 + Target 并行验证 + 按目标分布在接受/拒绝边界做重要性采样，保证边际分布不变。",
  "explanationFocus": "是什么：SD 用小模型草稿、大模型并行校验；为什么无损：验证步骤按目标分布重采样，接受/拒绝概率保证与自回归 Target 同分布。",
  "bruteForce": "只用 Target 逐 token 生成（每步一次大模型前向），延迟高、GPU 算力在 Decode 阶段大量闲置。",
  "derivation": [
    "为什么需要：Decode 每步只算 1 个 token 却要搬全部权重，算力闲置；想少跑大模型前向步数。",
    "怎么实现：Draft Model 自回归产出 γ 个候选；Target Model 对这 γ+1 个位置一次前向算出各位置分布；从左到右按接受概率决定是否采纳，首个被拒位置之后由 Target 重采样接续。",
    "为什么无损：接受/拒绝用目标分布在草稿分布上的重要性权重，数学上保证最终序列的边际分布等于 Target 自回归分布。",
    "怎么评测：看接受率(acceptance rate)、加速比(speedup=朴素步数/SD步数)、以及输出分布与 baseline 的 KL。"
  ],
  "invariant": "输出分布 = Target Model 自回归分布；加速只来自“更少的大模型前向步数”，不来自近似。",
  "walkthrough": "假设 Draft 每次提议 γ=4 个 token，Target 一次前向验证 5 个位置；若前 3 个被接受、第 4 个被拒，则本回合净产出 3 个 token 且仅用 1 次大模型前向（朴素需 3 次）。",
  "edgeCases": [
    "Draft 太弱/接受率低：每轮几乎都被拒，反而多花 Draft 计算，加速≈0 甚至变慢。",
    "Batch 很大时：大模型前向本身被 Batch 填满，Draft 省下的步数收益被稀释，甚至不加速。",
    "长上下文/大 KV：验证步的 KV 读取成本随序列增长，可能吃掉收益。"
  ],
  "code": "# Python\ndef speculative_step(draft_probs, target_probs, gamma=4, rng=None):\n    # draft_probs/target_probs: list[list[float]], 每个位置对词表的概率\n    # 概念示意: 按目标分布/草稿分布比值接受, 保证无损\n    import random\n    rng = rng or random\n    accepted = 0\n    for i in range(gamma):\n        t = max(range(len(draft_probs[i])), key=lambda v: draft_probs[i][v])  # 草稿提议 token\n        p_target = target_probs[i][t]\n        p_draft = draft_probs[i][t]\n        accept_p = min(1.0, p_target / max(p_draft, 1e-9))  # 接受概率\n        if rng.random() <= accept_p:\n            accepted += 1\n        else:\n            break\n    return accepted  # 本回合净产出 token 数",
  "codeNotes": [
    "这是概念示意: 真实实现按序列联合分布做接受/拒绝, 且 Draft 常为自回归或多头。",
    "关键不变式: 接受概率用目标分布/草稿分布的比值, 保证边际分布无损。"
  ],
  "complexity": "每轮 1 次 Target 前向(验证 γ+1 位置) + γ 次 Draft 前向；理论加速比受接受率与 γ 约束，并非线性，上限由接受率决定。",
  "followUps": [
    {
      "question": "Draft Model 和 Target Model 分别做什么？",
      "answer": "Draft 是更小/更快的模型，自回归产出一批候选 token；Target 是大模型，对这批候选做一次并行前向并逐位置验证、按需重采样接续。"
    },
    {
      "question": "为什么 Target 能一次验证多个 token？",
      "answer": "自回归验证时，第 i 个位置的 Target 分布只依赖前面已确定的前缀；把 Draft 提议的 γ 个候选连同前缀拼成一个长度为 γ+1 的序列，Target 一次前向即可算出每个位置的分布。"
    },
    {
      "question": "Acceptance Rate 如何影响加速比？",
      "answer": "接受率越高，每轮净产出的 token 越多、大模型前向步数越少；加速比随接受率上升，但受 γ 与 Draft 额外开销约束，并非线性。"
    },
    {
      "question": "Draft 越强越好吗？",
      "answer": "不一定。Draft 越强往往越慢(参数更多)，其额外前向开销会抵消省下的 Target 步数；实际取 Draft 速度与接受率的折中。"
    },
    {
      "question": "为什么大 Batch 时不一定加速？",
      "answer": "大 Batch 下大模型前向的算力已被充分利用，Decode 瓶颈从“步数”转向“每步算力/带宽”，Draft 减少步数的收益被稀释。"
    },
    {
      "question": "EAGLE 与普通 Draft Model 有什么区别？",
      "answer": "普通 SD 用独立小模型自回归提议；EAGLE 在 Target 的高层特征上训练一个轻量自回归头，直接预测下一层特征再还原 token，草稿与 Target 特征空间对齐，接受率通常更高。"
    }
  ],
  "followUpAnswers": [
    "Draft 提议候选，Target 并行验证。",
    "一次前向算 γ+1 个位置分布。",
    "接受率越高加速越大但有上限。",
    "Draft 不是越强越好，权衡速度与接受率。",
    "大 Batch 下步数收益被稀释。",
    "EAGLE 在高层特征上预测，对齐更好。"
  ],
  "pitfalls": [
    "把 SD 说成“用小模型替代大模型”（错：大模型仍决定分布，只是少跑步数）。",
    "忽略无损来自接受/拒绝的重要性采样，误以为只是近似加速。",
    "以为接受率越高越该无限增大 γ（γ 增大边际收益递减且增 Draft 成本）。",
    "（事实核查·2025）投机解码 = 小草稿模型 draft 多个 token + 大目标模型并行 verify（一次前向验证一整段）。加速比取决于草稿接受率，且草稿模型本身有开销；并非所有场景都划算（高接受率才显著加速）。"
  ],
  "beginnerSummary": "大模型生成文字是一个字一个字蹦的，每蹦一个字都要把整个模型算一遍，很慢。投机解码的思路是：先让一个“小车模”（Draft）一口气猜好几个字，再让“大车模”（Target）一次性检查这几个字对不对；对的就收下，错的就从错的地方重新猜。因为“收还是不收”是按大车模的真实概率决定的，所以最终写出来的内容和只用大车模一模一样（无损），但大车模跑的次数少了，就快了。",
  "prerequisites": [
    "自回归生成是一个 token 一个 token 产出。",
    "大模型每步前向成本高、Decode 受带宽限制。",
    "概率分布可以做重要性采样/重采样。"
  ],
  "workedExample": [
    "Draft 提议 γ=4，Target 一次验证 5 个位置；前 3 个被接受 → 本回合净得 3 token，仅 1 次大模型前向（朴素需 3 次）。",
    "若第 1 个就被拒，本回合只得 0 个草稿 token，仍消耗 1 次 Draft+1 次 Target 前向，净亏。"
  ],
  "lineByLine": [
    "Draft 自回归产出 γ 个候选 token。",
    "Target 对前缀+γ 候选一次前向算各位置分布。",
    "从左到右按接受概率 min(1, p_t/p_d) 决定收/拒。",
    "首个拒绝处由 Target 重采样接续，保证无损。",
    "本回合净产出 = 接受数，大模型前向只 1 次。"
  ],
  "diagram": "Speculative Decoding:\n  Draft Model (小/快)\n      | 自回归提议 γ 个候选\n      v\n  Target Model (大) -- 一次前向验证 γ+1 位置\n      | 按 p_target/p_draft 接受/拒绝\n      v\n  接受片段保留，拒绝处 Target 重采样\n  输出分布 == Target 自回归分布 (无损)"
};
