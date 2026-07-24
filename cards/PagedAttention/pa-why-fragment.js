export default {
  "kind": "concept",
  "id": "pa-why-fragment",
  "category": "PagedAttention",
  "difficulty": "Medium",
  "title": "为什么需要 PagedAttention（KV 显存碎片）",
  "prompt": "为什么需要 PagedAttention，传统的 KV 显存分配有什么问题？",
  "quickAnswer": "传统推理为每个请求一次性预留\"最大上下文长度\"的连续 KV 显存。但真实序列往往短得多，导致大量内部碎片（预留未用）；不同长度的请求交错又产生外部碎片，碎片无法被别人利用。PagedAttention 用定长块按需分配，把碎片压缩到仅末块，并让空闲块全局复用。",
  "approach": "指出连续预分配的内部/外部碎片，引出分块按需分配。",
  "explanationFocus": "是什么：传统 KV 分配因\"按最大长度连续预留\"产生严重碎片，PagedAttention 用分页把碎片降到最低。",
  "bruteForce": "每请求预分配 max_seq_len 的连续 KV 张量。",
  "derivation": [
    "为什么需要：请求实际长度远小于预留上限，且长短不一，连续大块既浪费又难以复用。",
    "怎么实现：把 KV 显存切成统一 block，请求用到哪就分配哪，不再预留整段。",
    "有什么代价：需要块分配器与映射表的管理开销（换来碎片大幅降低）。",
    "怎么评测：统计\"已分配但未使用\"的 KV 字节占比（碎片率），对比连续方案。"
  ],
  "invariant": "连续方案中 已分配 KV 显存 = B × max_len × 结构；分页方案中 ≈ B × 实际_len × 结构 + 末块少量浪费。",
  "walkthrough": "max_len=2048，10 个请求平均实际长 300：连续方案分配 10×2048，利用率约 15%；分页方案约 300/block_size×block_size，利用率近 100%。",
  "edgeCases": [
    "极短请求：连续方案浪费最严重（预留 2048 只用 10）。",
    "请求长度方差大：外部碎片难以拼接复用。",
    "并发高峰：碎片累积导致提前 OOM、拒绝请求。"
  ],
  "code": "# Python\ndef fragment_waste(reserved_len, actual_len):\n    # 连续预分配: 每个请求预留 reserved_len 的 KV\n    return reserved_len - actual_len   # 未使用的内部碎片\n\ndef total_waste(requests, reserved_len):\n    return sum(fragment_waste(reserved_len, r) for r in requests)",
  "codeNotes": [
    "浪费与\"预留值 − 实际值\"成正比。",
    "并发越高，绝对浪费越大。"
  ],
  "complexity": "连续方案碎片 O(B·(max_len − E[len]))；分页方案碎片 O(B·block_size)。",
  "followUps": [
    {
      "question": "内部碎片和外部碎片在 KV 场景分别指什么？",
      "answer": "内部碎片=单个请求预留的大块里没用到的部分；外部碎片=多个请求释放后留下的、因不连续而无法被新长请求利用的小空洞。"
    },
    {
      "question": "为什么碎片问题在 LLM 推理里特别突出？",
      "answer": "因为 KV 随序列线性膨胀且并发高，连续预留的浪费被 B 和 max_len 双重放大，直接决定能并发多少个请求。"
    }
  ],
  "followUpAnswers": [
    "碎片率 = 未用 KV / 已分配 KV。",
    "并发越高碎片绝对量越大。"
  ],
  "pitfalls": [
    "以为只要显存总量够就不会 OOM——碎片也能让分配失败。",
    "低估\"预留最大长度\"在短请求下的浪费比例。"
  ],
  "beginnerSummary": "餐厅给每位客人按\"最大饭量\"预留一整张大桌子，可大多数人只吃一点点，空位既不能被别人坐、又占着地方——这就是内部碎片。PagedAttention 改成\"来一个人摆一套餐具\"，谁还在吃就加一套，空位立刻能给新客人，桌子利用率拉满。",
  "prerequisites": [
    "KV 显存随序列长度增长。",
    "请求实际长度远小于预留上限。",
    "连续大块难以被他人复用。"
  ],
  "workedExample": [
    "max_len=2048、平均实际 300：连续方案利用率约 15%。",
    "分页方案仅末块浪费，利用率近 100%。"
  ],
  "lineByLine": [
    "连续方案按 max_len 预留。",
    "实际只用一小段 → 内部碎片。",
    "长短交错 → 外部碎片。",
    "分块按需分配消除二者。"
  ],
  "diagram": "连续: [========预留2048========] 实际用[==300==]....浪费\n分页: [blk][blk][blk] 用多少占多少, 空闲块全局复用"
};
