export default {
  "id": "cs-disk-io",
  "kind": "concept",
  "category": "计算机系统基础",
  "title": "磁盘与 IO 栈",
  "difficulty": "Hard",
  "prompt": "如何在大模型训练中减少数据加载的 IO 瓶颈？请讲清 DMA、零拷贝、mmap 与同步/异步 IO？",
  "quickAnswer": "DMA 让磁盘数据直接在设备与内存间传输，不占用 CPU。零拷贝（sendfile/splice）避免内核态与用户态间多次拷贝。mmap 把文件映射进地址空间，按需缺页加载，省去显式 read。同步 IO 阻塞等待完成，异步 IO（io_uring/libaio）提交后立刻返回、完成时回调，能更好重叠计算与 IO。",
  "code": "import mmap\ndef load(path):\n    with open(path, \"rb\") as f:\n        data = mmap.mmap(f.fileno(), 0, prot=mmap.PROT_READ)  # 映射而非拷贝\n    return data            # 按需缺页加载，零拷贝访问",
  "complexity": "mmap 建立 O(1)；实际加载按访问页触发缺页",
  "beginnerSummary": "传统读文件像先把货搬进自己房间再处理；零拷贝和 mmap 像直接给仓库开个窗口，要用哪页才去取，CPU 不必来回搬。",
  "explanationFocus": "是什么：磁盘 IO 栈涵盖设备、DMA、内核页缓存与文件系统；零拷贝与 mmap 等手段用于减少数据在内存各层级间不必要的复制，异步 IO 则把等待与计算重叠。",
  "approach": "核心思路：用 DMA 卸载传输；用 mmap/零拷贝消除冗余拷贝；用异步 IO 让数据预取与模型计算并行，从而缓解训练数据管道瓶颈。",
  "derivation": [
    "为什么需要：大模型数据量大，CPU 拷贝与阻塞等待会拖垮 GPU 利用率。",
    "怎么实现：DMA 直传；sendfile/splice 在内核内转发；mmap 映射页缓存；io_uring 提交/完成队列异步化。",
    "有什么代价：mmap 缺页与写时复制有开销；异步 IO 编程复杂，需小心顺序与错误。",
    "怎么评测：看 IO 带宽利用率、CPU 占用、GPU 等待时间与端到端吞吐。"
  ],
  "edgeCases": [
    "mmap 大文件后随机访问触发大量缺页，反而慢于预读 read。",
    "异步 IO 未正确处理完成事件，导致数据未就绪即使用。",
    "零拷贝要求源/目的支持，管道与 socket 间需 splice 衔接。"
  ],
  "pitfalls": [
    "在 mmap 区域做频繁写引发大量 COW 与页面脏回写。",
    "把异步 IO 当同步用（提交后立刻等待），丧失重叠收益。"
  ],
  "prerequisites": [
    "页缓存与虚拟内存",
    "中断与 DMA 工作原理"
  ],
  "workedExample": [
    "训练读数据集：mmap 后由 dataloader 按需缺页，省去整文件 read 拷贝。",
    "Web 传静态文件用 sendfile，磁盘→socket 不经过用户态。"
  ],
  "lineByLine": [
    "open(path)：打开文件得到 fd，不立即读内容。",
    "mmap.mmap(fileno,0)：把文件映射到进程虚拟地址空间。",
    "prot=PROT_READ：声明只读，缺页时内核从磁盘填页。",
    "return data：返回可像内存一样访问的对象，零额外拷贝。"
  ],
  "followUps": [
    {
      "question": "io_uring 相比 libaio 强在哪？",
      "answer": "io_uring 用共享的提交/完成环形队列、支持绝大多数操作且真正异步，避免 libaio 对 buffered IO 退化为同步、接口受限的问题。"
    },
    {
      "question": "mmap 和 read+write 谁更快？",
      "answer": "顺序大文件 read 配合预读通常更快；随机小访问或需共享/零拷贝时 mmap 更优，取决于访问模式与页缓存命中。"
    }
  ],
  "followUpAnswers": [
    "io_uring 用共享的提交/完成环形队列、支持绝大多数操作且真正异步，避免 libaio 对 buffered IO 退化为同步、接口受限的问题。",
    "顺序大文件 read 配合预读通常更快；随机小访问或需共享/零拷贝时 mmap 更优，取决于访问模式与页缓存命中。"
  ]
};
