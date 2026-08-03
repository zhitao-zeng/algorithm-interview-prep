export default {
  "id": "hw-memory-hierarchy",
  "category": "推理芯片适配",
  "difficulty": "Medium",
  "title": "片上内存层次利用",
  "prompt": "国产 NPU 有多级片上存储，写算子时如何利用内存层次提升性能？",
  "quickAnswer": "把频繁复用且体量小的数据放进最快的 L0/L1 缓存，通过分块让一次搬入的数据被多次计算，降低对全局 HBM 的访问。合理排布数据格式(NCHW vs 芯片友好布局)减少 bank 冲突。核心是把算术强度做高，让计算掩盖访存。",
  "approach": "按\"全局内存→片上 SRAM→寄存器\"的层级做数据分块与预取，尽量让热点数据驻留片上；用 double buffer 让搬运与计算重叠。算子实现时按硬件最优数据布局排布权重。",
  "explanationFocus": "是什么：片上内存层次利用是指根据 NPU 的存储层级(全局 HBM、片上 SRAM、寄存器)，把数据放在合适层级并最大化复用，以减少慢速访存。",
  "bruteForce": "每次计算都从全局 HBM 取数，不利用任何缓存，访存延迟直接拖垮算力，利用率极低。",
  "invariant": "无论数据放在哪一层，最终计算结果必须等于按全局内存顺序计算的结果，分层只是性能优化不改变数值。",
  "walkthrough": "某卡全局带宽 1TB/s、SRAM 带宽 10TB/s、容量 16MB。矩阵乘 M=N=K=2048 若每次从 HBM 取需 2048^3*2B/1e12≈17ms；分块 128 使每个 128x128 块在 SRAM 复用 16 次，HBM 流量降为 1/16，耗时约 2.3ms（受算力 128 TFLOPS 限制）。",
  "code": "def tiled_to_sram(a, b, sram, block=128):\n    for i in range(0, M, block):\n        for j in range(0, N, block):\n            tile = sram.alloc(block, block)   # 申请片上块\n            tile.load(b[i:i+block, j:j+block])\n            for k in range(0, K, block):\n                ka = sram.load(a[i:i+block, k:k+block])\n                compute_block(tile, ka)  # SRAM 内复用",
  "complexity": "计算量不变 O(MNK)；HBM 访问从 O(MNK) 降为 O(MN+MK+NK) 的分块边界量，片上复用使有效带宽需求大幅下降。",
  "beginnerSummary": "像做饭把常用调料放灶台手边(快)，不常用的放远柜(慢)，手边的反复用就少跑腿。",
  "diagram": "HBM(慢,大) --载入--> SRAM(快,中) --载入--> REG(最快,小)\n                  ^ 数据驻留被多次复用\n        double buffer: 搬运||计算",
  "derivation": [
    "为什么需要：全局内存慢且带宽是瓶颈，把数据放近计算单元才能喂饱算力。",
    "怎么实现：分块让数据驻留片上并被复用，double buffer 重叠搬运与计算，选最优布局减冲突。",
    "有什么代价：分块受 SRAM 容量限制，过大溢出回退全局，过小复用不足。",
    "怎么评测：测不同块大小的带宽占用与利用率，找最优分块。"
  ],
  "edgeCases": [
    "块大于 SRAM 容量会被强制分段，复用率骤降。",
    "权重布局与硬件要求不符引发 bank 冲突，带宽打折。",
    "多算子共享 SRAM 时容量争抢需静态分配。"
  ],
  "pitfalls": [
    "只调计算不分块，数据反复穿全局内存，利用率上不去。",
    "忽略 double buffer，搬运与计算串行导致单元空等。"
  ],
  "prerequisites": [
    "存储层级与带宽差异",
    "数据分块(tiling)原理",
    "double buffer 与流水概念"
  ],
  "workedExample": [
    "GEMM 分块 256 时 SRAM 不够，改 128 后复用充分，利用率从 25% 到 55%。",
    "权重转芯片友好布局后 bank 冲突降，带宽效率升 20%。"
  ],
  "lineByLine": [
    "sram.alloc 在快存上申请一块空间，避免反复访问 HBM。",
    "tile.load 把需要的权重块搬入 SRAM，之后计算都从 SRAM 取。",
    "compute_block 在片上复用该块完成多个 k 步，搬运被计算掩盖。"
  ],
  "codeNotes": [
    "block 上限由 SRAM 容量与多操作数占用共同决定，需实测调参。"
  ],
  "followUps": [
    {
      "question": "为什么分块大小很重要？",
      "answer": "块太小复用不足，块太大装不下 SRAM 溢出到全局内存，需折中到刚好喂满计算单元且驻留片上。"
    },
    {
      "question": "double buffer 一定能提速吗？",
      "answer": "当搬运时间小于计算时间时，重叠能隐藏搬运；若计算极快而搬运更慢，仍受带宽限制，double buffer 只减少空闲不突破带宽上限。"
    }
  ],
  "followUpAnswers": [
    "块太小复用不足，块太大装不下 SRAM 溢出到全局内存，需折中到刚好喂满计算单元且驻留片上。",
    "当搬运时间小于计算时间时，重叠能隐藏搬运；若计算极快而搬运更慢，仍受带宽限制，double buffer 只减少空闲不突破带宽上限。"
  ],
  "kind": "concept"
};
