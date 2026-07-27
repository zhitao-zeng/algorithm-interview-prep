export default {
  "id": "cs-memory-layout",
  "kind": "concept",
  "category": "计算机系统基础",
  "title": "虚拟内存与地址空间",
  "difficulty": "Medium",
  "prompt": "进程看到的连续地址空间是如何映射到物理内存的？请讲清分页/分段、页表、TLB 与缺页处理？",
  "quickAnswer": "虚拟内存为每个进程提供独立且连续的虚拟地址空间，由 MMU 通过页表把虚拟页号映射到物理页帧。TLB 缓存近期页表项以加速地址转换，未命中则遍历多级页表；当目标页不在内存时触发缺页异常，内核将该页从磁盘换入并更新页表。",
  "code": "def translate_vaddr(vaddr, page_table, tlb):\n    vpn = vaddr // PAGE_SIZE\n    if vpn in tlb:                 # TLB 命中\n        return tlb[vpn] * PAGE_SIZE + vaddr % PAGE_SIZE\n    if vpn in page_table:          # 页表命中\n        pfn = page_table[vpn]\n        tlb[vpn] = pfn             # 回填 TLB\n        return pfn * PAGE_SIZE + vaddr % PAGE_SIZE\n    raise PageFault(vpn)           # 缺页，内核换入",
  "complexity": "O(1)（TLB 命中）/ O(页表级数)（未命中遍历）",
  "beginnerSummary": "每个程序都以为自己独占一整块连续内存，其实操作系统在背后用一张\"映射表\"把程序看到的虚拟地址悄悄翻译成真正的物理地址。",
  "explanationFocus": "是什么：虚拟内存是一种内存抽象，让每个进程拥有独立、连续且相互隔离的虚拟地址空间，由硬件 MMU 与页表把它映射到分散的物理页帧上，并在缺失时由内核换入。",
  "approach": "核心思路：用分页（固定大小页）或分段（逻辑段）建立映射；页表保存映射关系，TLB 缓存热点项加速，缺页异常驱动内核按需调页，从而实现隔离、超额分配与共享。",
  "derivation": [
    "为什么需要：进程期望连续、独占的大地址空间，但物理内存碎裂且有限，需要一层抽象来隔离进程、支持超额分配与共享库。",
    "怎么实现：把虚拟地址按页划分，MMU 用页表将虚拟页号映射到物理页帧；多级数页表节省空间，TLB 缓存最近映射。",
    "有什么代价：每次访存多一次地址翻译，TLB 未命中与缺页会带来显著延迟；页表本身占用内存，缺页涉及磁盘 IO。",
    "怎么评测：用 TLB 命中率、缺页率（page fault rate）、有效访存时间（EAT）和内存带带宽来衡量虚拟内存子系统的开销。"
  ],
  "edgeCases": [
    "大页（huge page）绕过多级页表，减少 TLB 缺失但带来内部碎片。",
    "频繁缺页引发 thrashing（颠簸），系统吞吐急剧下降。",
    "写时复制（COW）下 fork 后父子共享页，写触发缺页并复制。"
  ],
  "pitfalls": [
    "误以为虚拟地址连续等于物理地址连续，导致对 DMA/显存映射出错。",
    "忘记处理缺页异常，或把 TLB 一致性（如修改页表后未 flush）忽略。"
  ],
  "prerequisites": [
    "物理内存与地址总线的基本概念",
    "进程与特权级（内核态/用户态）"
  ],
  "workedExample": [
    "32 位地址、4KB 页：低 12 位为页内偏移，高 20 位为虚拟页号。",
    "访问 0x804C120，VPN=0x804C，查页表得 PFN=0x3A，物理地址=0x3A000+0x120。"
  ],
  "lineByLine": [
    "vpn = vaddr // PAGE_SIZE：取虚拟页号，去掉页内偏移。",
    "if vpn in tlb：先查快表，命中直接算出物理地址，O(1)。",
    "if vpn in page_table：回退到页表，命中后回填 TLB 以备复用。",
    "raise PageFault(vpn)：都不命中则抛缺页，交由内核从磁盘调入。"
  ],
  "followUps": [
    {
      "question": "多级页表相比单级页表节省什么、又付出什么？",
      "answer": "节省稀疏地址空间下的内存占用（只建用到的中间节点），代价是未命中时要多次访存遍历各级。"
    },
    {
      "question": "TLB 失效（flush）在什么场景必须做？",
      "answer": "切换进程（ASID 不够时）、修改页表项（如取消映射/改权限）后必须 flush 相关 TLB 条目，否则会用旧映射。"
    }
  ],
  "followUpAnswers": [
    "节省稀疏地址空间下的内存占用（只建用到的中间节点），代价是未命中时要多次访存遍历各级。",
    "切换进程（ASID 不够时）、修改页表项（如取消映射/改权限）后必须 flush 相关 TLB 条目，否则会用旧映射。"
  ]
};
