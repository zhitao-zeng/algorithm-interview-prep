export default {
  "kind": "concept",
  "id": "kv-without",
  "category": "KV Cache",
  "difficulty": "Easy",
  "title": "不使用 KV Cache 的后果",
  "prompt": "不使用 KV Cache 会发生什么？",
  "quickAnswer": "不使用 KV Cache 时，每生成一个新 token 都要把前面全部 token 重新过一遍模型算出它们的 K/V 再做注意力。计算量随序列长度平方乃至立方增长，延迟随生成长度急剧恶化，长文本/长对话几乎不可服务，且浪费大量算力。",
  "approach": "无缓存=每步重算全历史，复杂度爆炸。",
  "explanationFocus": "是什么：去掉 KV Cache 后，注意力无法复用历史中间结果，退化成每步重算整段历史。",
  "bruteForce": "就是“不使用 KV Cache”本身——每步全量重算。",
  "derivation": [
    "为什么需要（反面）：要说明缓存不可或缺，先看缺失代价。",
    "怎么实现（缺失时）：每步把 [历史+新] 整体重新前向，重算所有 K/V。",
    "有什么代价：O(n²) 每步、O(n³) 总计计算，延迟随长度爆炸，且重复 I/O。",
    "怎么评测：测无缓存下生成长度 vs 延迟曲线，对比有缓存版本。"
  ],
  "invariant": "无缓存时，第 k 步注意力计算量随 k 增长，整体不可线性扩展。",
  "walkthrough": "n=1000 时，每步要重算 1000 个 token 的 K/V；第 1000 步成本是首步的 1000 倍，端到端不可行。",
  "edgeCases": [
    "短文本（n<32）：差距尚可接受，但仍浪费。",
    "流式场景：每来一字重算全对话，延迟累加。",
    "训练时：训练本就并行看全序列，不存在“缓存”概念，只有推理 Decode 需要。"
  ],
  "code": "# Python\ndef without_cache_per_step(n):\n    # 第 k 步重算前 k 个 token 的注意力\n    return [k*k for k in range(1, n+1)]   # 每步 O(k^2)\n\ndef total(per_step):\n    return sum(per_step)",
  "codeNotes": [
    "真实还有每层线性层重算，成本更高。",
    "仅注意力部分就已是立方级。"
  ],
  "complexity": "每步 O(n²)（含维度），总计 O(n³)；有缓存时分别为 O(n) 与 O(n²)。",
  "followUps": [
    {
      "question": "训练为什么不用 KV Cache？",
      "answer": "训练时一个 batch 内的所有 token 并行可见，一次前向就拿到全部 K/V，不存在“逐 token 生成重算”的问题；KV Cache 是推理自回归特有的优化。"
    },
    {
      "question": "有没有不靠缓存也能快的办法？",
      "answer": "线性注意力、状态空间模型(SSM/Mamba)、稀疏注意力等尝试降低对全历史 KV 的依赖，但在标准 Transformer 推理里 KV Cache 仍是最实用方案。"
    }
  ],
  "followUpAnswers": [
    "Mamba/SSM 用隐状态替代 KV。",
    "线性注意力近似softmax注意力。"
  ],
  "pitfalls": [
    "混淆训练与推理对 KV 的需求。",
    "低估无缓存时延迟随长度爆炸的速度。"
  ],
  "beginnerSummary": "没有笔记本，你每写一句都得把整篇从头默读一遍才能接话。文章越长，每接一句越慢，写到第 1000 句时要重读 1000 句——根本写不下去。KV Cache 就是那本让你直接翻看的笔记，缺了它，长文生成会慢到不可用。",
  "prerequisites": [
    "生成要反复参考历史。",
    "历史 K/V 可复用。",
    "无缓存=重复劳动。"
  ],
  "workedExample": [
    "n=1000：第 1000 步重算 1000 个 token 的 K/V，成本为首步 1000×。",
    "有缓存则每步仅算 1 个新 token。"
  ],
  "lineByLine": [
    "无缓存：每步重算全历史。",
    "第 k 步成本随 k 平方。",
    "总计算立方级，延迟爆炸。",
    "长文本/长对话不可服务。"
  ],
  "diagram": "无KV: 步1算1, 步2算2, 步3算3 ... 步n算n → 总~n^2/步, ~n^3总\n有KV: 每步只算1 → 总~n^2"
};
