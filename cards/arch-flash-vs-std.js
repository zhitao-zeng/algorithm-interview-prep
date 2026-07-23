export default {
  "kind": "concept",
  "id": "arch-flash-vs-std",
  "category": "Transformer 架构",
  "difficulty": "Medium",
  "title": "FlashAttention 与标准注意力复杂度差异",
  "prompt": "FlashAttention 与标准注意力在复杂度与显存上到底差在哪？",
  "quickAnswer": "两者 FLOPs 同为 O(N²d)；但标准显存 O(N²)、HBM 访问 ~4N²，Flash 显存 O(N)、访问 O(N²/B+Nd)。",
  "approach": "固定 FLOPs 不变，比较中间矩阵物化与否带来的显存与 IO 差异。",
  "explanationFocus": "是什么：标准注意力需物化并反复读写 N×N 分数矩阵（显存 O(N²)、HBM 访问约 4N²）；FlashAttention 通过 tiling 不物化该矩阵，显存降到 O(N)、HBM 访问降到 O(N²/B+Nd)，输出等价。",
  "bruteForce": "逐元素存下 S 与 P 两个 N×N 矩阵，长序列下显存与带宽都成为瓶颈。",
  "derivation": [
    "为什么需要：N 增大 2 倍，标准注意力显存/带宽需求涨 4 倍，限制上下文长度。",
    "怎么实现：Flash 用块循环+在线 softmax，使中间值始终在 SRAM。",
    "有什么代价：FLOPs 不变（仍是 O(N²d)），仅重排；需专用 fused kernel。",
    "怎么评测：固定 N 测显存峰值与 wall-clock；同 N 下输出数值一致。"
  ],
  "invariant": "不变量：FLOPs 恒定 O(N²d)，复杂度提升只来自 IO 与显存，而非算法近似。",
  "walkthrough": "N=4096,d=128：标准 S 约 4096²×2B≈32MB/头×32头≈1GB；Flash 仅保留块级状态，显存降一个数量级。",
  "edgeCases": [
    "短序列（N 很小）时 Flash 优势不明显，kernel 启动开销占比上升。",
    "因果掩码可省掉约一半块计算。",
    "不同 GPU 的 SRAM 大小决定最佳块尺寸 B。"
  ],
  "code": "def complexity_note(N, d, B=128):\n    std_mem = N * N          # O(N^2) 分数矩阵\n    flash_mem = N * d + (N*B) # 近似 O(N) 级\n    return {'std': std_mem, 'flash': flash_mem}",
  "codeNotes": [
    "数值仅为规模示意，非精确字节。"
  ],
  "complexity": "FLOPs 均 O(N²d)；标准显存 O(N²)、HBM 访问 O(N²)；Flash 显存 O(N)、HBM 访问 O(N²/B+N·d)。",
  "followUps": [
    {
      "question": "为什么 FLOPs 一样速度却快？",
      "answer": "注意力本受内存带宽限制，Flash 减少 HBM 读写次数，使算力被更充分利用。"
    },
    {
      "question": "Flash 对推理和训练都有效吗？",
      "answer": "都有效；训练还需重计算反向，但前向省显存直接放大可支持上下文长度。"
    }
  ],
  "followUpAnswers": [
    "注意力本受内存带宽限制，Flash 减少 HBM 读写次数，使算力被更充分利用。",
    "都有效；训练还需重计算反向，但前向省显存直接放大可支持上下文长度。"
  ],
  "pitfalls": [
    "把『更快』误解为『更少计算』——实际是更少数据搬运。",
    "以为 O(N²d) 被消除——Flash 不改渐近 FLOPs。"
  ],
  "beginnerSummary": "两者算的量一样多，但标准做法频繁把大表搬进搬出慢速显存，Flash 只在高速缓存里算完就丢，搬得少所以快、占得少。",
  "prerequisites": [
    "FlashAttention 原理",
    "大 O 复杂度",
    "GPU 带宽瓶颈"
  ],
  "workedExample": [
    "标准：4 次 N² 级 HBM 读写（写 S、读 S、写 P、读 P）。",
    "Flash：仅 O(N²/B) 块级访问 + 读一次 QKV、写一次 O。"
  ],
  "lineByLine": [
    "std_mem 体现 O(N²) 分数矩阵。",
    "flash_mem 体现 O(N) 块状态。",
    "B 为块大小，越大 HBM 访问越少但有 SRAM 上限。"
  ],
  "diagram": "标准: QK^T(N²)->HBM->softmax(N²)->HBM->PV\nFlash: tile loop in SRAM, 仅 O 回写 HBM"
};
