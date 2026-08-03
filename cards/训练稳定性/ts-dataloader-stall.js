export default {
  "id": "ts-dataloader-stall",
  "category": "训练稳定性",
  "difficulty": "Medium",
  "title": "训练数据pipeline卡顿",
  "prompt": "训练时GPU利用率周期性掉底、step时间忽长忽短，如何排查数据pipeline卡顿？",
  "quickAnswer": "典型原因是数据加载成瓶颈：磁盘IO慢、预处理在主进程、num_workers不足、bad样本阻塞、或分布式分片不均。排查：对比GPU利用率与dataloader耗时（用perf_counter包裹）；开persistent_workers、pin_memory；把重预处理移到离线或独立进程；用prefetch与分片均衡。",
  "approach": "先用profiler量化\"数据等待时间\"；确定瓶颈是IO/CPU预处理/分片；针对性：增大num_workers+persistent_workers、用pin_memory与prefetch、把tokenization离线化、分布式用DistributedSampler保证各卡样本数一致。",
  "explanationFocus": "是什么：数据pipeline卡顿指数据供给速度跟不上GPU计算，使GPU空等，表现为利用率周期性掉底、step时间抖动，整体吞吐远低于理论值。",
  "bruteForce": "把全部预处理放训练主进程每个step现做：GPU每次都等CPU，利用率长期<30%，训练极慢。",
  "invariant": "健康状态下：数据准备耗时 < 单step计算耗时，GPU利用率稳定在高位（如>90%），step时间标准差小。",
  "walkthrough": "8卡A100训练，GPU利用率周期性从95%掉到35%，step时间0.9s~4.1s抖动。用perf_counter包dataloader迭代发现取一批平均1.8s（计算仅0.6s）。把num_workers从4提到16、开persistent_workers+pin_memory、tokenization离线缓存后，取数降到0.2s，利用率回到93%，step稳定0.7s。",
  "code": "import time, torch\nfrom torch.utils.data import DataLoader\n\ndef profile_loader(loader, n=50):\n    t = time.perf_counter()\n    for i, batch in enumerate(loader):\n        if i == 0: start = time.perf_counter()\n        if i >= n: break\n    dt = (time.perf_counter() - start) / n\n    return dt   # 单批取数耗时，应 < 单step计算耗时\n\nloader = DataLoader(ds, batch_size=128, num_workers=16,\n                    persistent_workers=True, pin_memory=True,\n                    prefetch_factor=4)\n",
  "complexity": "时间：profiler为一次性 O(n批)；正确配置后数据等待趋近0，整体吞吐接近计算上限。空间：pin_memory与prefetch增加少量常驻内存。",
  "beginnerSummary": "数据pipeline像给流水线送料，料送慢了机器就空转；多雇几个搬运工（workers）、提前备料（prefetch）就能让机器一直转。",
  "diagram": "\n GPU: [calc][wait][calc][wait][calc]   <- 卡顿\n 优化:[calc][calc][calc][calc]         <- 数据提前备好\n workers: 4 -> 16, +persistent +prefetch\n",
  "derivation": [
    "为什么需要：GPU极快，数据若现做会长期空等，浪费昂贵算力。",
    "怎么实现：profiler量化等待，增workers/persistent/pin_memory/prefetch，离线化预处理。",
    "有什么代价：更多workers占CPU/内存；pin_memory增少量显存锁页；prefetch占缓冲。",
    "怎么评测：GPU利用率回到>90%、step时间标准差显著下降、吞吐接近计算上限。"
  ],
  "edgeCases": [
    "num_workers过大超过CPU核数：线程争抢反而变慢。",
    "分布式各卡样本数不等：最后一个卡先完成空等（straggler）。",
    "pin_memory与CUDA流冲突：偶尔死锁需降prefetch。",
    "离线缓存未命中：仍回退慢路径。"
  ],
  "pitfalls": [
    "只在主进程做预处理，GPU长期空等。",
    "num_workers=0默认，单进程取数成瓶颈。"
  ],
  "prerequisites": [
    "DataLoader机制",
    "CPU/GPU并行",
    "分布式sampler"
  ],
  "workedExample": [
    "GPU利用率周期掉到35%，step 0.9~4.1s抖动。",
    "profiler显示取数1.8s > 计算0.6s，确认数据瓶颈。",
    "改成16 workers+persistent+pin_memory+离线tokenize，取数0.2s，利用率93%。"
  ],
  "lineByLine": [
    "time.perf_counter 高精度计时取数耗时。",
    "for batch in loader 迭代n批测平均延迟。",
    "num_workers=16 并行取数，persistent_workers避免反复启停。",
    "pin_memory+prefetch_factor提前锁页并预取，缩短GPU等待。"
  ],
  "codeNotes": [
    "profiler应在真实训练前单独跑，避免与生产step混测干扰。"
  ],
  "followUps": [
    {
      "question": "num_workers设多少合适？",
      "answer": "约等于(CPU核数/训练卡数)，并留余量给系统；过大线程争抢反而降速，需实测取吞吐拐点。"
    },
    {
      "question": "分布式为何也会卡顿？",
      "answer": "若各卡样本数不均或某卡读慢盘，先完成的卡空等，形成straggler，需均衡分片。"
    }
  ],
  "followUpAnswers": [
    "约等于(CPU核数/训练卡数)，并留余量给系统；过大线程争抢反而降速，需实测取吞吐拐点。",
    "若各卡样本数不均或某卡读慢盘，先完成的卡空等，形成straggler，需均衡分片。"
  ],
  "kind": "concept"
};
