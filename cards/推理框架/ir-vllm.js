export default {
  "id": "ir-vllm",
  "category": "推理框架",
  "difficulty": "Medium",
  "title": "vLLM 内部机制",
  "prompt": "vLLM 的核心优化 PagedAttention 是什么，它如何解决 KV Cache 显存碎片与吞吐瓶颈？",
  "quickAnswer": "vLLM 把 KV Cache 切成固定大小的\"页（block）\"，像操作系统虚拟内存一样用块表把逻辑序列映射到物理显存块，支持非连续存储与按需分配。这消除了连续大块预留造成的碎片，使显存利用率从约 20% 提升到 90%+，并让连续批处理（continuous batching）得以高效进行，吞吐可提升数倍。",
  "approach": "理解两块：① KV 按 block 分页、块表映射，请求结束即回收 block；② continuous batching 不等待整批结束，每个 step 动态加减请求，最大化 GPU 占用。",
  "explanationFocus": "是什么：vLLM 是高分片吞吐的 LLM 推理与服务引擎，其核心 PagedAttention 借鉴操作系统分页思想，将 KV Cache 切块并用块表管理，消除显存碎片并支持连续批处理，从而在相同显存下服务更多并发请求。",
  "bruteForce": "朴素自写推理为每个请求预留\"最大长度×层×隐藏维\"的连续 KV 缓冲，内部大量预留未用、且请求间无法共享，显存迅速耗尽、吞吐极低。",
  "invariant": "核心不变量：每个逻辑 token 位置都能通过块表唯一映射到某个物理 block 内的偏移，且 block 在引用计数为 0 时被立即回收，保证映射一致与零泄漏。",
  "walkthrough": "设 block=16 token、隐藏维 4096、32 层、FP16；单请求 2048 token 传统法预留整块连续显存约 1.2GB，vLLM 仅分配 128 个 block 实际占用，碎片趋零；在 A100 上同显存并发从 8 路升到 40+ 路。",
  "code": "class BlockTable:\n    def __init__(self, block_size=16):\n        self.block_size = block_size\n        self.free = list(range(1024))      # 物理块池\n        self.mapping = {}                  # seq_id -> [phys_block]\n    def append(self, seq_id, tokens):\n        # 按需分配物理块，逻辑连续、物理可不连续\n        while tokens:\n            if seq_id not in self.mapping or len(self.mapping[seq_id])*self.block_size == len(allocated):\n                self.mapping.setdefault(seq_id, []).append(self.free.pop())\n            tokens = tokens[self.block_size:]",
  "complexity": "分配/映射为 O(序列长度/block_size) 的块操作；注意力计算仍为 O(n²) 但受高利用率带来的更多并发摊薄；块表查询 O(1)。",
  "beginnerSummary": "像图书馆把书拆成标准书匣按需上架，读者要哪几页就抽哪几个匣，不用为一本书空出整排书架，书架利用率从两成涨到九成。",
  "diagram": "逻辑序列 [tok0..tokN]\n   │ 块表映射\n   ▼\n物理块: [B3][B7][B1][B9]  (可不连续)\n   ▲\n   └── 引用计数=0 即回收",
  "derivation": [
    "为什么需要：连续 KV 预留造成巨大碎片与预留浪费，显存成为吞吐天花板。",
    "怎么实现：KV 按固定 block 分页，用 block table 做逻辑-物理映射，请求动态申请/释放 block，配合 continuous batching。",
    "有什么代价：块表查询与跨块注意力带来少量额外开销，block 过小则元数据膨胀、过大则碎片回升，需调 block_size。",
    "怎么评测：对比同显存下的最大并发数、显存利用率与 token/s 吞吐，看碎片率是否趋零。"
  ],
  "edgeCases": [
    "block_size 过小导致块表元数据开销超过收益。",
    "共享前缀（同 system prompt）可借 copy-on-write 共享 block，否则重复占显存。",
    "长序列跨大量 block，注意力需多次 gather，带宽压力上升。"
  ],
  "pitfalls": [
    "以为 vLLM 只是批处理更快，忽视 PagedAttention 才是显存利用率提升的根源。",
    "把 block_size 设得过大，碎片问题回潮。"
  ],
  "prerequisites": [
    "Transformer 自注意力与 KV Cache 机制",
    "操作系统分页/虚拟内存与显存管理常识"
  ],
  "workedExample": [
    "请求 A 需 2048 token，block=16，则分配 128 个物理块；请求结束引用计数归零，128 块立即归还空闲池。",
    "10 个并发各 1k token 传统法预留 10×最大长度显存，vLLM 仅用实际块，空闲池仍可接新请求，并发翻倍。"
  ],
  "lineByLine": [
    "self.free = list(range(1024)) 维护物理块空闲池，模拟显存块资源。",
    "self.mapping[seq_id] 保存该序列占用的物理块列表，逻辑连续物理可不连续。",
    "self.free.pop() 按需取块，避免一次性预留整段连续显存。",
    "引用计数归零即回收，保障显存零泄漏与高复用。"
  ],
  "codeNotes": [
    "真实 vLLM 用引用计数支持多序列共享 block（如 beam search、前缀共享）。"
  ],
  "followUps": [
    {
      "question": "PagedAttention 与 Continuous Batching 什么关系？",
      "answer": "PagedAttention 解决显存碎片使更多请求能驻留；Continuous Batching 利用这种驻留能力在每个 step 动态调度，两者共同成就高吞吐，缺一不可。"
    },
    {
      "question": "vLLM 的前缀缓存如何与分页结合？",
      "answer": "相同 system prompt 的 block 通过引用计数被多序列共享（copy-on-write），新请求命中前缀时直接复用物理块，省去重复计算。"
    }
  ],
  "followUpAnswers": [
    "PagedAttention 解决显存碎片使更多请求能驻留；Continuous Batching 利用这种驻留能力在每个 step 动态调度，两者共同成就高吞吐，缺一不可。",
    "相同 system prompt 的 block 通过引用计数被多序列共享（copy-on-write），新请求命中前缀时直接复用物理块，省去重复计算。"
  ],
  "kind": "concept"
};
