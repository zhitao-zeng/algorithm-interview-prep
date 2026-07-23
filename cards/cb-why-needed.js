export default {
  "kind": "concept",
  "id": "cb-why-needed",
  "category": "Continuous Batching",
  "difficulty": "Easy",
  "title": "为什么需要 Continuous Batching",
  "prompt": "为什么推理服务非得上 Continuous Batching，静态 batching 哪里浪费了？",
  "quickAnswer": "因为真实流量里请求长短差异极大，静态 batching 必须等整批最慢请求结束才换下一批，导致\"气泡\"(bubble)：已完成请求空占算力、新请求被挡在门外。Continuous Batching 把调度降到 token 步，消除这种空闲，GPU 利用率和吞吐都能翻倍级提升。",
  "approach": "从\"整批同步\"改为\"逐步异步\"，让完成即释放、排队即补入。",
  "explanationFocus": "是什么：Continuous Batching 存在的根因是静态 batching 的整批同步造成算力气泡，需要更细粒度调度来填洞。",
  "bruteForce": "静态 batching：等整批最慢请求生成完才整体换批，短请求提前算完也只能干等。",
  "derivation": [
    "为什么需要：线上请求输出长度分布极不均（几字到上千字），静态 batching 按\"最慢者\"对齐，快请求产生的空闲时间称为气泡，GPU 实际利用率可能不到 50%。",
    "怎么实现：将调度单位从\"请求\"降为\"decode step\"，每步独立决定哪些 slot 释放、哪些新请求进入，气泡被新请求填掉。",
    "有什么代价：需要能按 slot 而非按请求分配显存（KV），并精确维护每个请求独立的 position/attention 状态，调度逻辑更复杂。",
    "怎么评测：在固定 QPS 与长度分布下对比吞吐与 P99 延迟，气泡率越低收益越大。"
  ],
  "invariant": "GPU 空闲 slot 数趋近于 0 是连续 batching 追求的不变量。",
  "walkthrough": "10 个请求，9 个 10 token、1 个 1000 token。静态批：9 个早完成却要陪跑到第 1000 步，浪费约 9*(1000-10)=8910 步算力；连续批：9 个完成立刻让位新请求，仅剩长请求独占。",
  "edgeCases": [
    "极端长尾：1 个超长请求 + 大量短请求，静态浪费爆炸。",
    "全部等长：连续与静态收益接近，但仍能平滑插入新请求。",
    "请求极少：可能始终填不满，连续 batching 退化为普通批。"
  ],
  "code": "# Python\ndef bubble_steps(static_batch):\n    longest = max(r.length for r in static_batch)\n    wasted = sum(longest - r.length for r in static_batch)\n    return wasted  # 静态批的空转步数",
  "codeNotes": [
    "气泡步数 = 各请求与最长请求的长度差之和。",
    "连续 batching 通过即走即补把 wasted 压到接近 0。"
  ],
  "complexity": "消除的气泡量与长度方差正相关；吞吐提升可达数倍。",
  "followUps": [
    {
      "question": "气泡(bubble)具体指什么？",
      "answer": "指某个 decode step 中，已完成但仍被占用的 slot 既不出有效算力也不接受新请求，造成的 GPU 空转。"
    },
    {
      "question": "是不是所有场景都需要它？",
      "answer": "等长、低并发、请求稀少的场景收益有限；高并发、长尾分布明显时才收益最大。"
    }
  ],
  "followUpAnswers": [
    "气泡=已完成请求空占 slot 的空转步。",
    "高并发长尾分布时收益最大。"
  ],
  "pitfalls": [
    "只盯着平均延迟，忽视长尾气泡才是主因。",
    "以为加 GPU 就能解决，本质是调度粒度问题。"
  ],
  "beginnerSummary": "十个人一起排队过闸机，偏要等最慢那个磨蹭完才放下一拨，前面九个早就过完却堵在通道里。连续批就像谁过完谁立刻让位、后面人马上补上，闸机几乎不停。这就是消除\"气泡\"。",
  "prerequisites": [
    "推理按 token 步自回归生成。",
    "请求输出长度差异大。",
    "GPU 按 batch 并行，空 slot 即浪费。"
  ],
  "workedExample": [
    "批内 9 个短(10) + 1 个长(1000)。",
    "静态：陪跑到 1000 步共浪费 8910 步；连续：短请求完成即释放。"
  ],
  "lineByLine": [
    "算出批内最长请求长度。",
    "每个较短请求都陪跑 (最长-自身) 步。",
    "累加得到气泡总步数。",
    "连续 batching 目标就是让该浪费趋零。"
  ],
  "diagram": "静态: 步1..步1000 全占 ── 9个早完却空转\n连续: 步1..10 短请求完成→释放→补新请求"
};
