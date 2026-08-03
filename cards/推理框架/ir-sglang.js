export default {
  "id": "ir-sglang",
  "category": "推理框架",
  "difficulty": "Hard",
  "title": "SGLang 与 RaggedTensor",
  "prompt": "SGLang 提出的 RadixAttention 与 RaggedTensor 是如何优化多轮/结构化提示的 KV 复用的？",
  "quickAnswer": "SGLang 用 RadixAttention 把共享前缀组织成基数树（radix tree），让不同请求自动复用相同前缀的 KV Cache；其 RaggedTensor 则用变长行（ragged）的高效张量表示，配合前向内核直接处理不等长序列的拼接与复用，避免反复拷贝。结果是多轮对话、Few-shot、Agent 调用等大量重复前缀场景下显存与延迟大幅下降。",
  "approach": "抓两点：① 基数树管理前缀 KV，命中即共享、淘汰用 LRU；② RaggedTensor 用偏移量描述变长序列，单次内核完成批处理，省去 pad/copy。",
  "explanationFocus": "是什么：SGLang 是高吞吐结构化生成框架，RadixAttention 通过基数树自动复用提示前缀的 KV Cache，RaggedTensor 用变长行张量高效表达并拼接不等长序列，二者共同消除结构化/多轮场景中的重复计算。",
  "bruteForce": "朴素做法是每轮把完整对话历史重新拼成定长张量、重新算全部 KV，历史越长重复计算越多，显存与延迟线性恶化。",
  "invariant": "核心不变量：基数树中每个节点对应一段唯一 token 前缀，其子树的 KV 完全一致且可被任意共享该前缀的请求复用，淘汰时整子树失效。",
  "walkthrough": "假设 8 个请求共享同一 200-token system prompt；朴素法重复算 8×200=1600 token 的 KV，SGLang 命中基数树只算 1 次 200 token，再各算各自 50 token 后缀；首 token 延迟降约 4 倍，显存省 7/8。",
  "code": "class RadixCache:\n    def __init__(self):\n        self.root = {}                       # 基数树: 前缀 -> 子节点/KV\n    def match(self, tokens):\n        node, used = self.root, 0\n        for t in tokens:                     # 沿树走最长公共前缀\n            if t in node:\n                node = node[t]; used += 1\n            else:\n                break\n        return used, node                    # 返回可复用长度与节点\n    def insert(self, tokens, kv):\n        node = self.root\n        for t in tokens:\n            node = node.setdefault(t, {})    # 逐 token 建/复用节点\n        node['kv'] = kv",
  "complexity": "前缀匹配 O(前缀长度)，插入 O(序列长度)；复用使重复前缀计算从 O(N×M) 降到 O(N+M)，RaggedTensor 内核为 O(总token)。",
  "beginnerSummary": "像几个人写报告都引用同一段公开前言，SGLang 只把这段前言写一次大家共用，谁要改自己的正文就只写正文，不重复抄前言。",
  "diagram": "基数树:\nroot ─a─b─c─(KV共享)   ← 200-token 公共前缀\n              ├─d(请求1后缀)\n              ├─e(请求2后缀)\n              └─f(请求3后缀)",
  "derivation": [
    "为什么需要：Agent/多轮/Few-shot 中大量请求共享前缀，朴素重算浪费惊人。",
    "怎么实现：用基数树按 token 路径管理前缀 KV，命中复用、未命中补算并写回；RaggedTensor 用偏移量拼变长序列单次内核处理。",
    "有什么代价：树与淘汰策略（LRU）带来管理开销；前缀冲突或污染需谨慎，错误的共享会输出串味结果。",
    "怎么评测：对比相同结构化负载下的 TTFT、吞吐与 KV 命中率，看复用率是否接近理论上限。"
  ],
  "edgeCases": [
    "前缀仅差一个 token 也会分裂成不同树路径，需合理分块避免碎片。",
    "LRU 淘汰正被用的前缀会触发重算，需引用计数保护。",
    "不同请求虽前缀相同但采样温度不同，KV 仍可共享（自回归前段与采样无关）。"
  ],
  "pitfalls": [
    "混淆\"前缀共享\"与\"输出共享\"，误以为生成内容也会复用。",
    "忽视淘汰策略，缓存无限增长拖垮显存。"
  ],
  "prerequisites": [
    "KV Cache 与前缀复用概念",
    "基数树/前缀树与变长张量（Ragged/CSR）表示"
  ],
  "workedExample": [
    "请求1前缀 [a,b,c,d]，请求2前缀 [a,b,c,e]，基数树共享 [a,b,c] 的 KV，仅 d、e 各自补算。",
    "8 请求共 200-token system 前缀，命中树后单算一次，总 KV 计算从 1600 降到约 250 token 当量。"
  ],
  "lineByLine": [
    "match() 沿树走最长公共前缀，返回可复用长度 used。",
    "if t in node 命中则继续下钻，否则断开开始新分支。",
    "insert() 逐 token setdefault 建/复用节点，写回 KV。",
    "node[\"kv\"]=kv 把该前缀对应的缓存挂到叶子，供后续请求命中。"
  ],
  "codeNotes": [
    "真实实现需配 LRU/引用计数淘汰，且 KV 按层存于连续块以便 gather。"
  ],
  "followUps": [
    {
      "question": "SGLang 的 RadixAttention 与 vLLM 前缀缓存有何异同？",
      "answer": "两者都共享前缀 KV；vLLM 用 block 级引用计数共享，SGLang 用基数树做更细的前缀匹配与自动淘汰，结构化场景复用率更高。"
    },
    {
      "question": "RaggedTensor 解决什么？",
      "answer": "它用偏移量表达变长行，避免 pad 到最长序列与多次拷贝，让不等长请求在一次内核中高效批处理，降低延迟与显存。"
    }
  ],
  "followUpAnswers": [
    "两者都共享前缀 KV；vLLM 用 block 级引用计数共享，SGLang 用基数树做更细的前缀匹配与自动淘汰，结构化场景复用率更高。",
    "它用偏移量表达变长行，避免 pad 到最长序列与多次拷贝，让不等长请求在一次内核中高效批处理，降低延迟与显存。"
  ],
  "kind": "concept"
};
