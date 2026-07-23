export default {
  "kind": "concept",
  "id": "cb-iteration-scheduling",
  "category": "Continuous Batching",
  "difficulty": "Medium",
  "title": "iteration-level 调度原理",
  "prompt": "iteration-level / token-level 调度的核心原理是什么？",
  "quickAnswer": "iteration-level 调度把调度决策频率从\"一个请求的一生\"提高到\"每个 decode 迭代\"。在每个 token 生成步，调度器独立决定：哪些请求继续生成、哪些已完成释放、哪些新请求加入。这样 GPU 在每一步都看到最新的请求集合，实现了真正的细粒度复用。",
  "approach": "把时间轴切成 decode step，每步重算 running/waiting 分配。",
  "explanationFocus": "是什么：iteration-level 调度指以单个 decode step 为决策周期，每步动态重组 batch 成员，而非以请求为周期的静态分组。",
  "bruteForce": "request-level 调度：请求进批后直到生成结束才离开，期间 batch 成员不变。",
  "derivation": [
    "为什么需要：request-level 调度在请求生成期间锁死 batch 成员，导致气泡；只有把决策周期压到每步才能随时换人。",
    "怎么实现：每个 step 先执行一步前向（对所有当前 running），再据输出是否 EOS 更新 running，并补充 waiting，形成闭环。",
    "有什么代价：每步都要做调度判断与可能的显存操作，调度开销虽小但需正确维护跨步状态。",
    "怎么评测：对比 request-level 与 iteration-level 在相同到达率下的吞吐与排队延迟。"
  ],
  "invariant": "每一步执行的 batch = 上一步 live 集合 ∪ 本步新补入集合，且规模 ≤ capacity。",
  "walkthrough": "step t: running={A,B,C}；A 出 EOS → 释放；waiting 取 D 补入 → step t+1 running={B,C,D}。",
  "edgeCases": [
    "某步无请求完成也无新到达：batch 规模不变。",
    "多请求同一步完成：批量释放再批量补位。",
    "capacity 已满且无完成：新请求只能继续排队。"
  ],
  "code": "# Python\ndef iteration_step(running, waiting, capacity):\n    outputs = model_forward(running)  # 各请求推进一步\n    finished = [r for r in running if outputs[r].eos]\n    live = [r for r in running if r not in finished]\n    while len(live) < capacity and waiting:\n        live.append(waiting.pop(0))\n    return live, finished",
  "codeNotes": [
    "先统一推进一步前向，再决定去留。",
    "决策频率 = 每 token 步一次。"
  ],
  "complexity": "每步 O(capacity) 调度 + 一次前向；吞吐随有效并发上升。",
  "followUps": [
    {
      "question": "iteration-level 和 request-level 本质区别？",
      "answer": "决策周期不同：前者每 token 步重组 batch，后者整个请求生命周期内 batch 固定。"
    },
    {
      "question": "调度频率提高会不会拖慢前向？",
      "answer": "调度是轻量逻辑，相对一次前向开销极小，收益远大于成本。"
    }
  ],
  "followUpAnswers": [
    "决策周期: 每步 vs 每请求。",
    "调度开销远小于前向。"
  ],
  "pitfalls": [
    "以为频率只是数值差异，其实是消除气泡的关键。",
    "在每步前向前忘记先更新完成状态。"
  ],
  "beginnerSummary": "request-level 像组团旅游，一伙人绑定到行程结束；iteration-level 像地铁每站上下客，每到一站都有人下车、新人上车，车（GPU）始终接近满载。",
  "prerequisites": [
    "decode 每步只产一个 token。",
    "EOS 标志请求结束。",
    "前向按当前 batch 执行。"
  ],
  "workedExample": [
    "step t running={A,B,C}，A 出 EOS。",
    "释放 A，补 D，step t+1={B,C,D}。"
  ],
  "lineByLine": [
    "对当前 running 执行一步前向。",
    "根据 EOS 标记完成请求。",
    "保留未完成的 live。",
    "按空闲补入 waiting 请求。"
  ],
  "diagram": "step t: [A,B,C] → forward → A EOS\nstep t+1: [B,C] + D → [B,C,D]"
};
