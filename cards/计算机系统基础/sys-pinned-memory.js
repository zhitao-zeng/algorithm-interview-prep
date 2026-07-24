export default {
  "kind": "concept",
  "id": "sys-pinned-memory",
  "category": "计算机系统基础",
  "difficulty": "Hard",
  "title": "Pageable Memory、Pinned Memory 和 GPU 显存有什么区别？",
  "prompt": "解释主机端可分页内存、锁页内存（Pinned/Page-locked）与 GPU 显存三者的区别，以及为什么 GPU 异步拷贝通常要求 Pinned Memory。",
  "quickAnswer": "Pageable（可分页）主机内存：可被 OS 换页，地址不固定，GPU 不能直接 DMA，需先拷到临时 Pinned 缓冲再传，慢且阻塞。Pinned（锁页）主机内存：被 OS 锁定、物理地址固定，GPU 可通过 DMA 直接访问，支持真正的异步拷贝（cudaMemcpyAsync / non_blocking=True）。GPU 显存（VRAM）：设备端高带宽内存，Kernel 直接读写，容量有限且贵。三者是“主机可换页 → 主机锁页 → 设备显存”的层级。",
  "approach": "按“位置 / 是否可换页 / 能否被 GPU DMA / 带宽 / 容量”对比三层；再讲拷贝路径：Pageable→(隐式临时 Pinned)→GPU；Pinned→GPU 可直接异步；强调 non_blocking=True 要配合 Pinned 才真异步，否则仍可能同步等待，且 Pinned 过多会挤压可分页内存、影响 OS 页回收。",
  "explanationFocus": "关键不是“Pinned 更快”这么简单，而是：GPU DMA 需要固定物理地址；Pageable 会被 OS 移动，所以驱动要幕后拷一份 Pinned 中转。Pinned 的价值在于“可异步 + 省一次中转”，代价是占用不可换页的物理内存。",
  "bruteForce": "认为 non_blocking=True 开了就一定是异步，忽略源头张量是否 Pinned；或给所有张量都 pin_memory 导致主机内存紧张。",
  "derivation": [
    "Pageable 内存可被 OS 换出/重映射，物理地址不恒定，GPU 的 DMA 引擎无法安全直接访问。",
    "驱动在传 Pageable 时，会先分配临时 Pinned 缓冲、CPU 拷贝进去、再 DMA——多一次 CPU 中转且通常同步。",
    "Pinned 内存物理地址锁定，GPU DMA 可直接读取，配合流（stream）实现真正异步传输，并与计算重叠。",
    "GPU 显存是设备端内存，Kernel 直接访问、带宽最高，但容量受限、不能在 CPU 直接寻址。",
    "non_blocking=True 仅当源在 Pinned 内存时才真正异步；否则仍需同步等待数据就绪。"
  ],
  "invariant": "异步 GPU 拷贝成立的前提是源内存在 Pinned（锁页）区；Pageable 内存会被驱动中转且往往同步。Pinned 过多会侵占可分页物理内存。",
  "walkthrough": "1) 明确数据在主机还是设备。2) 训练 DataLoader 设 pin_memory=True，让 batch 提前锁页。3) 拷贝用 .to(device, non_blocking=True) 且源已 Pinned → 异步。4) 用 CUDA stream 把拷贝与 Kernel 重叠。5) 监控 Pinned 占用，避免过多导致主机内存压力。6) Kernel 计算只认显存，必要时再拷回。",
  "edgeCases": [
    "non_blocking=True 但张量未 Pinned：仍可能同步，异步名不副实。",
    "pin_memory=True 对所有大 batch：锁页内存占用高，可能触发主机 OOM 或拖慢其他进程。",
    "把 GPU 显存当 CPU 内存用（容量误判）：OOM。",
    "在拷贝完成前就让 Kernel 读目标显存：读到未就绪数据（需用 stream/event 同步）。"
  ],
  "code": "import torch\n\n# 1) 锁页(Pinned)主机内存: 支持异步拷贝\nh = torch.randn(1024, 1024, device='cpu').pin_memory()   # 锁页\nd = torch.empty_like(h, device='cuda')\nd.copy_(h, non_blocking=True)        # 真正异步: 源已 Pinned + 配合 stream\n\n# 2) Pageable(默认): 驱动会中转, non_blocking 未必真异步\nh2 = torch.randn(1024, 1024)         # 可分页\nd2 = h2.to('cuda', non_blocking=True) # 可能仍需同步等待\n\n# 3) DataLoader 提前锁页, 减少训练时拷贝阻塞\n# DataLoader(..., pin_memory=True)",
  "codeNotes": [
    "pin_memory() 把主机张量锁页；此后 non_blocking 拷贝才真正异步。",
    "DataLoader(pin_memory=True) 在加载线程就把 batch 锁页，训练循环里 .to(cuda, non_blocking=True) 才能重叠传输与计算。"
  ],
  "complexity": "拷贝带宽：Pinned↔VRAM 接近 PCIe/NVLink 峰值且可异步；Pageable↔VRAM 多一次 CPU 中转且常同步。显存读写带宽最高。",
  "followUps": [
    {
      "question": "为什么 GPU 异步拷贝通常需要 Pinned Memory？",
      "answer": "GPU 的 DMA 引擎需要固定的物理地址；Pageable 内存可被 OS 换页/重映射，地址不固定，驱动只能先拷到临时 Pinned 缓冲再 DMA，所以要求源在 Pinned 区。"
    },
    {
      "question": "non_blocking=True 为什么不一定真的异步？",
      "answer": "它只在源内存已锁页（Pinned）时才真正异步；若源是 Pageable，驱动仍需同步把数据搬到锁页中转区，异步不生效。"
    },
    {
      "question": "DataLoader 的 pin_memory=True 有什么作用？",
      "answer": "它在加载线程把 batch 张量提前锁页，使训练循环里 .to(device, non_blocking=True) 能真正异步拷贝，把传输与 GPU 计算重叠，降低 step 延迟。"
    },
    {
      "question": "什么情况下 Pinned Memory 太多反而有问题？",
      "answer": "Pinned 内存是不可换页的物理内存，占用过多会挤压 OS 可分页内存、影响页回收，甚至引发主机 OOM 或拖慢其他进程；应按 batch 大小合理设置。"
    }
  ],
  "followUpAnswers": [
    "GPU DMA 需固定物理地址；Pageable 会被驱动中转且常同步。",
    "仅当源已 Pinned 才真异步；Pageable 仍可能同步中转。",
    "加载线程提前锁页，使 non_blocking 拷贝能与计算重叠。",
    "锁页内存不可换页，过多会挤占主机内存甚至 OOM。"
  ],
  "pitfalls": [
    "以为 non_blocking=True 一定异步，忽略源是否 Pinned。",
    "盲目 pin_memory / 全局锁页，主机物理内存被吃光。",
    "拷贝未完成就让 Kernel 读目标显存，读到脏数据。",
    "把显存容量当主机内存用，导致 OOM。"
  ],
  "beginnerSummary": "主机内存有两种：可分页（会被系统挪动，GPU 不能直接 DMA，传之前要中转一下，慢）和锁页 Pinned（地址固定，GPU 能直接异步搬）。GPU 显存是设备上的高速内存，Kernel 直接读、容量小且贵。想让拷贝真正异步，源头得是 Pinned，DataLoader 的 pin_memory=True 就是提前锁好页。",
  "prerequisites": [
    "主机内存与虚拟内存/分页概念",
    "GPU 与 PCIe/DMA 基础",
    "CUDA stream 与异步执行"
  ],
  "workedExample": [
    "训练时 DataLoader(pin_memory=True) 把 batch 锁页；循环里 images = images.to(\"cuda\", non_blocking=True)，传输与上游计算重叠，step 时间下降。",
    "若忘记 pin_memory，同样的 non_blocking=True 仍可能因驱动中转而同步等待，吞吐上不去。"
  ],
  "lineByLine": [
    "区分三层：Pageable / Pinned / VRAM。",
    "GPU DMA 需固定物理地址→要求 Pinned。",
    "Pageable 会被驱动中转且常同步。",
    "DataLoader pin_memory + non_blocking 才真异步。",
    "用 stream 把拷贝与计算重叠。",
    "监控 Pinned 占用，防主机内存压力。"
  ],
  "diagram": "主机 Pageable ──(驱动中转,常同步)──► GPU 显存\n主机 Pinned   ──(DMA,可异步,需stream)─► GPU 显存\nGPU 显存: Kernel 直读, 带宽最高, 容量有限"
};
