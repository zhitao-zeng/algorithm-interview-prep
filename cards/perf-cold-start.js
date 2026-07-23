export default {
  "kind": "concept",
  "id": "perf-cold-start",
  "category": "服务性能评测",
  "difficulty": "Easy",
  "title": "压测中的冷启动 / 预热问题",
  "prompt": "压测 LLM 服务时，冷启动和预热会对指标造成什么干扰，怎么处理？",
  "quickAnswer": "冷启动指进程/模型刚加载时 CUDA 上下文、kernel 编译、显存分配、JIT/图捕获未就绪，首批请求异常慢。预热(warmup)是先跑一批丢弃请求让系统进入稳态，再正式采集，避免把冷启动延迟算进评测结果。",
  "approach": "正式压测前先 warmup 数十到数百请求，待指标平稳后再计时，并剔除前若干样本。",
  "explanationFocus": "是什么：冷启动是服务刚起时未就绪导致的首批慢；预热是正式测量前先跑废请求使系统稳态，二者处理不好会让评测严重偏高。",
  "bruteForce": "一启动就压：首批几百请求全是冷启动慢值，拉高均值与 p99，结论失真。",
  "derivation": [
    "为什么需要：CUDA 初始化、kernel 编译、KV 分配、图捕获在首请求时发生，不代表稳态性能。",
    "怎么实现：加载后发 N 个 warmup 请求丢弃，再开始正式压测与计时。",
    "有什么代价：warmup 要覆盖真实 batch 形状，否则仍可能在正式阶段触发首次编译。",
    "怎么评测：对比 warmup 前后 p50，确认稳态后再采数。"
  ],
  "invariant": "稳态指标应显著低于冷启动首批；warmup 后连续样本方差应平稳。",
  "walkthrough": "冷启动首批 TTFT=3s，warmup 50 请求后稳定到 0.2s，正式评测 p99=0.35s。",
  "edgeCases": [
    "自动扩缩容产生新实例冷启动。",
    "特定输入形状首次触发 kernel 编译。",
    "CUDA graph 捕获在首 batch 发生。"
  ],
  "code": "# Python\ndef trim_cold(samples, warmup=50):\n    return samples[warmup:]                    # 丢弃冷启动样本\ndef is_warm(prev, cur, tol=0.1):\n    return abs(cur - prev) / prev < tol        # 是否已稳态",
  "codeNotes": [
    "warmup 要覆盖真实 batch/形状。",
    "弹性扩容会引入新冷启动。"
  ],
  "complexity": "O(warmup+采样) 丢弃前段。",
  "followUps": [
    {
      "question": "如何避免线上冷启动？",
      "answer": "常驻预热、滚动更新保留热实例、或就绪探针在真正接流前先 warmup。"
    },
    {
      "question": "CUDA graph 为何要预热？",
      "answer": "图捕获在首 batch 进行且绑定形状，未捕获时走慢路径，需先以目标形状捕获。"
    }
  ],
  "followUpAnswers": [
    "常驻预热/滚动更新避冷启。",
    "CUDA graph 首 batch 捕获慢。"
  ],
  "pitfalls": [
    "把冷启动值计入评测。",
    "warmup 形状与正式不一致。"
  ],
  "beginnerSummary": "汽车：冬天刚发动时引擎冷、转速不稳(冷启动慢)，开出去溜几圈热车后(预热)才进入正常状态。评测不能把\"刚发动那几脚\"算进百公里油耗，得热完车再测。",
  "prerequisites": [
    "CUDA 初始化与 kernel 编译。",
    "CUDA graph / JIT。",
    "稳态 vs 瞬态。"
  ],
  "workedExample": [
    "冷启动首批 TTFT=3s，warmup 后 0.2s。",
    "弹性扩容新实例需重新预热。"
  ],
  "lineByLine": [
    "服务加载完成。",
    "发 warmup 请求丢弃。",
    "确认指标平稳。",
    "正式计时采集。"
  ],
  "diagram": "时间→  [冷启动慢][warmup][稳态平稳]\n                 丢弃      采集"
};
