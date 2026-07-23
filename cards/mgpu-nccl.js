export default {
  "kind": "concept",
  "id": "mgpu-nccl",
  "category": "多GPU并行",
  "difficulty": "Medium",
  "title": "通信后端 NCCL 与拓扑 NVLink/IB",
  "prompt": "NCCL 是什么，NVLink 和 InfiniBand 在并行中分别扮演什么角色？",
  "quickAnswer": "NCCL(NVIDIA Collective Communications Library)是 GPU 间集合通信(all-reduce/all-gather/all-to-all)的高性能后端，自动选最优算法并感知拓扑。NVLink 是单机卡间的高速互连(几百 GB/s)，适合 TP/EP 这种高频通信；InfiniBand(IB)是跨节点网络(几十 GB/s)，适合 PP/DP 这种低频大块通信。拓扑决定了哪些并行维度该放单机、哪些可跨机。",
  "approach": "用 NCCL 做集合通信，按带宽把高通信维(TP/EP)放 NVLink、低通信维(PP/DP)放 IB。",
  "explanationFocus": "是什么：NCCL 是 GPU 集合通信库，NVLink 是单机内卡间高速总线，IB 是跨机高速网络；三者共同决定多卡并行的通信性能与策略布局。",
  "bruteForce": "把 TP 跨机跑在以太网 → 通信灾难，比单卡还慢。",
  "derivation": [
    "为什么需要：多卡通信性能天差地别，必须用语义统一且拓扑感知的库(NCCL)并据此布局并行。",
    "怎么实现：NCCL 在 NVLink 上用 tree/ring、跨节点经 GPUDirect RDMA 走 IB；通信组(ncclComm)按拓扑建环，TP/EP 限制在 NVLink 域，PP/DP 跨 IB。",
    "有什么代价：跨节点需 IB 网卡与 RDMA 支持，配置复杂；拓扑不友好时算法降级、带宽骤降。",
    "怎么评测：实测 busbw(通信带宽)、不同消息大小的延迟、拓扑感知是否正确。"
  ],
  "invariant": "无论走 NVLink 还是 IB，集合通信语义(all-reduce 等)结果一致。",
  "walkthrough": "8 卡单机 NVLink 600GB/s 跑 TP；4 机各 8 卡经 IB 200Gb/s 跑 PP/DP，训练 175B。",
  "edgeCases": [
    "NVLink 域限制单机卡数(如 8)。",
    "IB 需 GPUDirect RDMA 才高效。",
    "异构拓扑下 NCCL 算法选择影响很大。"
  ],
  "code": "# Python (概念, PyTorch)\ndef build_groups(local_ranks, cross_nodes):\n    tp_group = nccl.new_group(local_ranks)        # NVLink 域内\n    pp_group = nccl.new_group(cross_nodes)        # 跨节点 IB\n    return tp_group, pp_group",
  "codeNotes": [
    "NCCL 自动感知 NVLink/IB 拓扑。",
    "通信组决定哪维走哪条链路。"
  ],
  "complexity": "带宽: NVLink 数百 GB/s > IB 数十 GB/s > 以太网；决定并行布局。",
  "followUps": [
    {
      "question": "为什么 TP 要限制在 NVLink 域？",
      "answer": "TP 每层 all-reduce 频率高、对带宽极敏感，只有 NVLink 域内几百 GB/s 能隐藏；跨 IB 带宽低会累积成瓶颈。"
    },
    {
      "question": "NCCL 和 MPI 通信区别？",
      "answer": "NCCL 专为 GPU 显存间通信优化、感知 NVLink/IB 与 GPUDirect，比通用 MPI 在 GPU 集合通信上快得多。"
    }
  ],
  "followUpAnswers": [
    "TP 高频通信需 NVLink 带宽。",
    "NCCL 专优化 GPU 集合通信。"
  ],
  "pitfalls": [
    "TP/EP 跨机部署忽视带宽落差。",
    "以为通信库无关紧要——NCCL 拓扑感知关键。"
  ],
  "beginnerSummary": "NCCL 是专门帮显卡之间传话的\"快递公司\"，它知道哪条路最快。NVLink 是同一台机器里显卡之间的\"内部高速通道\"(传得飞快)，InfiniBand 是连接不同机器之间的\"城际高速路\"(也快但比内部通道慢)。所以传话勤快的活(TP)放内部通道，偶尔传大件的活(PP)才走城际路。",
  "prerequisites": [
    "了解集合通信语义。",
    "知道带宽对并行的影响。",
    "理解 TP/PP 通信频率差异。"
  ],
  "workedExample": [
    "单机 8 卡 NVLink 600GB/s 跑 TP。",
    "跨 4 机 IB 跑 PP/DP。"
  ],
  "lineByLine": [
    "NCCL 提供 GPU 集合通信。",
    "NVLink 承载单机高频通信。",
    "IB 承载跨机大块通信。",
    "按带宽布局并行维度。"
  ],
  "diagram": "单机内: GPU0═NVLink═GPU1═... (数百 GB/s)\n跨机:  节点A ──IB/RDMA── 节点B (数十 GB/s)\nNCCL 自动选路"
};
