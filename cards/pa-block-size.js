export default {
  "kind": "concept",
  "id": "pa-block-size",
  "category": "PagedAttention",
  "difficulty": "Medium",
  "title": "block size（块大小）的选择权衡",
  "prompt": "PagedAttention 的 block size 该怎么选，有什么权衡？",
  "quickAnswer": "block size 是分页的最小分配单位（常见 16 token）。太小：内部碎片小，但 block table 更长、元数据更多、kernel 启动/寻址开销更大；太大：块数少、管理开销低，但末块内部碎片回弹、前缀共享粒度变粗。实践中 16 是经验甜点，兼顾碎片、元数据与 kernel 效率。",
  "approach": "权衡\"碎片细度\"与\"管理/元数据开销\"，取经验值 16。",
  "explanationFocus": "是什么：block size 决定分页粒度，需在\"碎片小\"与\"元数据/开销低\"之间权衡，常用 16 token。",
  "bruteForce": "盲目取极大或极小 block size。",
  "derivation": [
    "为什么需要：block size 同时影响碎片率、表大小与 kernel 效率，必须选。",
    "怎么实现：固定一个 token 数（如 16）作为分配与共享的粒度。",
    "有什么代价：极端值各有问题（详见边界），需折中。",
    "怎么评测：扫不同 block size，看显存利用率、吞吐量与管理开销的拐点。"
  ],
  "invariant": "平均碎片 ≈ block_size/2 个 token 的 KV；block table 长度 = ceil(len/block_size)。",
  "walkthrough": "block=16 vs block=4：同样 100 请求平均长 300，block=4 的表长是 block=16 的 4 倍，元数据与 gather 次数更多，但末块平均浪费更小；block=64 则末块平均浪费 32 token/请求，碎片回弹。",
  "edgeCases": [
    "block=1：退化为逐 token 管理，开销爆炸。",
    "block 很大：共享粒度粗，前缀命中率可能下降。",
    "与 kernel 最优线程块大小相关，需联合调。"
  ],
  "code": "# Python\ndef block_overhead(block_size, seq_len):\n    n_blocks = (seq_len + block_size - 1) // block_size\n    frag = 0 if seq_len % block_size == 0 else block_size - (seq_len % block_size)\n    meta = n_blocks * PTR_BYTES        # 块表元数据随块数增长\n    return frag, meta                   # 小block: frag小meta大; 大block反之",
  "codeNotes": [
    "碎片与 block_size 同量级。",
    "元数据随块数反相关于 block_size。"
  ],
  "complexity": "管理开销 O(块数)=O(len/block_size)；碎片 O(block_size)。",
  "followUps": [
    {
      "question": "为什么不是越大越好？",
      "answer": "越大末块浪费越多（平均多半个 block），且前缀共享只能按整块对齐，粒度粗会降低命中率；所以存在收益拐点。"
    },
    {
      "question": "16 是怎么来的？",
      "answer": "是工程经验值：在常见模型维度与 kernel 配置下，16 token 的 KV 块大小平衡了碎片、表开销与 GPU kernel 效率，vLLM 默认即如此。"
    }
  ],
  "followUpAnswers": [
    "碎片随 block 增大而回弹。",
    "16 是经验甜点。"
  ],
  "pitfalls": [
    "以为 block 越小越省——忽视元数据与 kernel 开销。",
    "以为 block 越大越省——忽视末块碎片与共享粒度。"
  ],
  "beginnerSummary": "分页就像决定\"一册笔记写多少页\"。册子太薄（block 小）：几乎不浪费纸，但目录厚、翻页次数多；册子太厚（block 大）：目录薄、翻得少，可最后一册常常只写几页就剩一大半空白。折中一册写 16 页，既省纸又不多翻——这就是 block size 的甜点。",
  "prerequisites": [
    "碎片随 block 增大而增多。",
    "元数据随块数增多。",
    "kernel 寻址有固定开销。"
  ],
  "workedExample": [
    "block=4：表长是 block=16 的 4 倍，开销大。",
    "block=64：末块平均浪费约 32 token。"
  ],
  "lineByLine": [
    "block 小 → 碎片小但表大。",
    "block 大 → 表小但碎片大。",
    "共享粒度随 block 变粗。",
    "经验值 16 折中。"
  ],
  "diagram": "block=4 : frag小, 表长4x, 开销大\nblock=16: 甜点\nblock=64: frag大(平均32), 共享粗\n碎片∝block, 元数据∝1/block"
};
