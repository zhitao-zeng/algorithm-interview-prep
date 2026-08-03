export default {
  "id": "ts-straggler",
  "category": "训练稳定性",
  "difficulty": "Hard",
  "title": "分布式straggler与负载不均",
  "prompt": "数据并行训练中某些卡明显更慢（straggler），如何识别并缓解负载不均？",
  "quickAnswer": "DDP每步需all-reduce同步梯度，最慢的卡决定整步耗时，故单卡变慢会拖累全体。成因：各卡样本数不均、慢硬件/降频、通信拥塞、该卡数据预处理慢。缓解：均衡DistributedSampler分片、按算力分组、用梯度通信与计算重叠（bucketing）、超时卡重调度、或用异步/弹性训练。定位用每卡step耗时与通信trace对比。",
  "approach": "先记录每卡per-step耗时与all-reduce等待时间定位straggler；核对分片是否等长、硬件是否降频；均衡分片+通信计算重叠；极端情况隔离慢节点或降其负载；用NCCL超时与重调度兜底。",
  "explanationFocus": "是什么：straggler是分布式训练中进度明显慢于其他节点的卡；由于同步式数据并行每步要等最慢卡完成梯度同步，straggler会把全体step拖到它的速度，整体吞吐由最慢卡决定。",
  "bruteForce": "无视差异统一同步：慢卡持续拖累全体，256卡中1张慢20%，整体加速比从256掉到约213，浪费可观算力。",
  "invariant": "理想同步下：各卡per-step耗时方差极小，all-reduce等待时间≈0；任一卡耗时超过均值+阈值即判定straggler。",
  "walkthrough": "256卡A100训练，理论单step 1.0s，实测1.21s。逐卡trace发现rank=137每步1.21s（其他~1.0s），其all-reduce等待0.21s。查因：该卡被分配的样本多3%（sampler未整除），且同机邻居占满NVLink带宽。改等长分片+将该卡移到空闲节点后，单step回到1.02s，吞吐提升约19%。",
  "code": "import torch, torch.distributed as dist\n\ndef per_rank_step_time(t):\n    # t: 本卡单step耗时(秒)\n    tns = [torch.tensor(t, device=\"cuda\")]\n    # all-gather 各卡耗时，找最慢\n    gather = [torch.zeros_like(tns[0]) for _ in range(dist.get_world_size())]\n    dist.all_gather(gather, tns[0])\n    times = [x.item() for x in gather]\n    return max(times), times.index(max(times))   # straggler耗时与rank\n\ndef balanced_split(dataset_len, world):\n    base, extra = divmod(dataset_len, world)\n    return [base + (1 if i < extra else 0) for i in range(world)]  # 等长尽量均衡\n",
  "complexity": "时间：all_gather诊断 O(1) 每步可忽略；straggler使整体step≈最慢卡耗时，吞吐损失正比于差距。空间：诊断仅存标量。",
  "beginnerSummary": "同步训练像拔河，全队速度被最慢那个人拖住；straggler就是那个掉队的人，得让他少扛点或换到状态好的位置。",
  "diagram": "\n step耗时: rank0 1.00 | rank1 1.00 | ... | rank137 1.21 *\n           all-reduce等最慢 -> 全体卡在rank137处汇合\n 修复: 等长分片 + 挪节点 -> rank137 1.02\n",
  "derivation": [
    "为什么需要：同步DDP木桶效应，单卡慢全队慢，大规模下浪费巨大需识别缓解。",
    "怎么实现：all_gather各卡step耗时定位straggler，均衡分片+通信重叠+节点重调度。",
    "有什么代价：通信计算重叠改动训练循环；弹性/异步训练引入一致性复杂度。",
    "怎么评测：各卡耗时方差降到阈值内、整体step接近最快卡、吞吐提升。"
  ],
  "edgeCases": [
    "数据集不整除卡数：某卡多1样本，长训练累积成straggler。",
    "慢卡是瞬时降频（温度）非永久：需滑动窗口判定而非单步。",
    "通信拓扑拥塞：非计算慢而是all-reduce排队。",
    "弹性训练中慢节点被踢出，需重分片保证不丢数据。"
  ],
  "pitfalls": [
    "只看平均step忽视最慢卡，误以为健康。",
    "用未均衡的sampler，分片天然不均。"
  ],
  "prerequisites": [
    "分布式数据并行(DDP)",
    "all-reduce同步语义",
    "NCCL通信"
  ],
  "workedExample": [
    "256卡实测单step 1.21s，理论1.0s，定位rank137为straggler。",
    "其分片多3%且NVLink拥塞，all-reduce等待0.21s。",
    "改等长分片+挪节点后step回1.02s，吞吐+19%。"
  ],
  "lineByLine": [
    "all_gather收集各卡step耗时张量。",
    "max(times)得到最慢卡耗时，即整步下界。",
    "times.index(max)定位straggler的rank。",
    "balanced_split用divmod做尽量等长分片，消除样本不均。"
  ],
  "codeNotes": [
    "straggler判定应用滑动均值，避免把瞬时降频误判为永久慢节点。"
  ],
  "followUps": [
    {
      "question": "通信与计算重叠能缓解straggler吗？",
      "answer": "只能掩盖通信等待，若straggler源于计算慢（分片多/降频）则无效，仍需均衡分片或重调度。"
    },
    {
      "question": "异步训练能根除straggler吗？",
      "answer": "异步/弹性可避免等最慢卡，但引入梯度 staleness 与一致性难题，需权衡收敛稳定性。"
    }
  ],
  "followUpAnswers": [
    "只能掩盖通信等待，若straggler源于计算慢（分片多/降频）则无效，仍需均衡分片或重调度。",
    "异步/弹性可避免等最慢卡，但引入梯度 staleness 与一致性难题，需权衡收敛稳定性。"
  ],
  "kind": "concept"
};
