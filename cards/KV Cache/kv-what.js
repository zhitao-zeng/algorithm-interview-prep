export default {
  "kind": "concept",
  "id": "kv-what",
  "category": "KV Cache",
  "difficulty": "Easy",
  "title": "KV Cache 是什么",
  "prompt": "KV Cache 是什么？",
  "quickAnswer": "KV Cache 是推理时缓存的 Key/Value 张量：每个已处理 token 的 Attention 层 K、V 计算结果被存下来，后续生成新 token 时直接复用，避免对历史 token 重算注意力。它是 Decode 自回归能高效进行的关键。",
  "approach": "把每个 token 在各层的 K、V 缓存下来，后续步拼接复用。",
  "explanationFocus": "是什么：KV Cache = 已处理 token 在每一层 Attention 的 Key 与 Value 向量缓存，供后续步注意力查询复用。",
  "bruteForce": "不缓存，每生成一个 token 都对全部历史重算 K/V 与注意力 → O(n²) 每步。",
  "derivation": [
    "为什么需要：自回归逐 token 生成时，历史 token 的 K/V 不变，重算纯属浪费。",
    "怎么实现：每层 Attention 算完 K、V 后 append 到缓存；新 token 的 Q 与缓存里全部 K 做点积。",
    "有什么代价：缓存随层数、序列长、并发线性增长，占用大量显存。",
    "怎么评测：看 KV Cache 显存占比、是否成为 OOM 主因、命中率（Prefix Cache）。"
  ],
  "invariant": "第 t 步的注意力只新增当前 token 的 K/V，历史 K/V 完全复用缓存。",
  "walkthrough": "输入 32 token → 各层算出 K,V 并缓存；生成第 33 个 token 时，Q33 与缓存的 K[1..32] 做注意力，再把 K33,V33 追加。",
  "edgeCases": [
    "长上下文：KV 持续累积，显存线性涨。",
    "流式分块：每块结束要保留跨块 KV。",
    "多请求：各自独立 KV，并发决定总显存。"
  ],
  "code": "# Python\ndef attention_with_kv(x, Wq, Wk, Wv, cache):\n    q = x @ Wq\n    k = x @ Wk; v = x @ Wv\n    cache.k.append(k); cache.v.append(v)     # 缓存 K,V\n    K = cat(cache.k); V = cat(cache.v)\n    return softmax(q @ K.T / sqrt(d)) @ V",
  "codeNotes": [
    "K 与 V 都要缓存（Q 只需当前步，不必缓存）。",
    "缓存按 (层, 请求, 头, 位置) 组织。"
  ],
  "complexity": "每 Decode 步注意力 O(n·d)（n 为已缓存长度）；总 KV 显存 O(B·L·N·H)。",
  "followUps": [
    {
      "question": "为什么只缓存 K 和 V，不缓存 Q？",
      "answer": "Q 是“查询方”，每个新 token 只用自己的 Q 去查历史 K/V；历史 token 的 Q 不会再被使用，缓存无意义且浪费显存。"
    },
    {
      "question": "KV Cache 存在哪？",
      "answer": "存在 GPU 显存（HBM）里，按层/请求/头/位置索引，Decode 每步读取参与注意力计算。"
    }
  ],
  "followUpAnswers": [
    "PagedAttention 用分块管理 KV 显存。",
    "GQA/MQA 减少需缓存的 KV 头数。"
  ],
  "pitfalls": [
    "以为缓存的是“注意力结果”（其实缓存的是 K/V）。",
    "忽视 KV 随序列线性膨胀。"
  ],
  "beginnerSummary": "模型每说一个字，都要回头看前面所有字。与其每次都重新“读一遍前面的字并记住它们的含义”，不如第一次读完就把“含义笔记”（Key/Value）存起来，以后直接翻笔记。KV Cache 就是这本笔记，省掉了大量重复劳动。",
  "prerequisites": [
    "Attention 需要每个 token 的 K 和 V。",
    "历史 token 的 K/V 在生成过程中不变。",
    "生成是逐 token 自回归的。"
  ],
  "workedExample": [
    "32 token 输入：各层算 K,V 缓存；生成第 33 token 时 Q33 查缓存 K[1..32]。",
    "不缓存则每步重算 32 个 token 的 K/V，浪费 32× 计算。"
  ],
  "lineByLine": [
    "每层对输入算 Q、K、V。",
    "把 K、V 按位置追加到缓存。",
    "新 token 的 Q 与全部缓存 K 做注意力。",
    "新 K、V 再追加，供下一步用。"
  ],
  "diagram": "token_1..t ─▶ 各层算 K,V ─▶ 缓存(K,V)\n新 token_t+1: Q_{t+1} × [K_1..K_t] ─▶ 注意力\n再 append K_{t+1},V_{t+1}"
};
