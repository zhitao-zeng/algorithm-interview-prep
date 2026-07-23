export default {
  "kind": "concept",
  "id": "cb-what",
  "category": "Continuous Batching",
  "difficulty": "Easy",
  "title": "Continuous Batching 是什么",
  "prompt": "推理服务里的 Continuous Batching 是什么？",
  "quickAnswer": "Continuous Batching 是推理调度方式：不再等整个 batch 的所有请求都生成完才换下一批，而是每个迭代（每个 decode step）动态把已完成的请求移出、把排队中的新请求填进来，使 GPU 始终被填满。它把调度粒度从\"整批\"细化到\"token 步\"。",
  "approach": "以 token 为粒度调度，完成即释放、空位即补新。",
  "explanationFocus": "是什么：Continuous Batching 以迭代/token 为粒度调度请求，完成即释放 slot、新请求即时补位，告别静态整批等待。",
  "bruteForce": "静态 Batching：凑满一个 batch 才开始，且要等最长请求结束，短请求被长请求拖住。",
  "derivation": [
    "为什么需要：静态 batching 中请求长短不一，必须等最慢的请求结束才能整体换下一批，短请求早早算完却空占 slot，GPU 利用率低、延迟高。",
    "怎么实现：调度器在每个 decode step 后检查完成的请求并释放其 KV slot；从等待队列取新请求填入空闲 slot，与仍在跑的请求一起进入下一步迭代。",
    "有什么代价：需要更精细的显存/KV 管理（配合 PagedAttention），并维护每个请求独立的状态与 mask；实现比静态 batching 复杂。",
    "怎么评测：对比相同负载下静态 vs 连续的吞吐(TPS)、平均/尾延迟、GPU 利用率，看长尾与并发改善。"
  ],
  "invariant": "任意时刻 GPU 上跑的 slot 数 = min(并发上限, 等待+运行中请求数)，尽力填满。",
  "walkthrough": "batch 上限 4：步1 跑 [A,B,C,D]；步2 A 完成释放，新请求 E 补入 → 仍跑满 4；若用静态 batching，A 完成也要等 D，期间 slot 浪费。",
  "edgeCases": [
    "请求长短极度不均：静态 batching 浪费最严重，连续 batching 收益最大。",
    "突发流量：新请求可在任意步插入，无需等整批。",
    "所有请求同时完成：退化为小 batch，此时需尽快补位避免空跑。"
  ],
  "code": "# Python\ndef schedule_step(waiting, running, max_batch):\n    # 释放已完成请求\n    still = [r for r in running if not r.done]\n    # 用等待请求填补空位\n    free = max_batch - len(still)\n    while free > 0 and waiting:\n        still.append(waiting.pop(0)); free -= 1\n    return still  # 下一步迭代要跑的请求",
  "codeNotes": [
    "真实系统按 token 步调度，不是整句完成才释放。",
    "KV slot 的分配/释放由 PagedAttention 配合管理。"
  ],
  "complexity": "调度本身 O(并发)；吞吐随有效并发提升，尾延迟显著下降。",
  "followUps": [
    {
      "question": "Continuous Batching 和静态 Batching 最大区别？",
      "answer": "静态要等整批最慢请求结束才换下一批，短请求被拖；连续在每个 token 步动态换入换出，slot 始终尽量填满。"
    },
    {
      "question": "它对 KV Cache 有什么要求？",
      "answer": "要求 KV 能按需分配/释放而非整批预留，所以通常配合 PagedAttention 这类分页显存管理。"
    }
  ],
  "followUpAnswers": [
    "PagedAttention 负责 KV 按需分配。",
    "以 token 步而非整批为调度单位。"
  ],
  "pitfalls": [
    "以为 batching 只是\"凑一批\"——连续 batching 关键是\"逐 token 步换入换出\"。",
    "忽略它依赖精细的 KV 显存管理。"
  ],
  "beginnerSummary": "想象餐厅每桌吃饭速度不同。静态排法要等最慢那桌吃完才翻台，快吃完的桌只能干等；连续排法是谁吃完谁立刻走、门口等位客马上补坐，每张桌子尽量不停业。GPU 就像餐桌，Continuous Batching 让算力不被慢请求空占。",
  "prerequisites": [
    "推理是逐 token 自回归生成。",
    "一个 batch 内请求长短不一。",
    "GPU 希望尽量被填满才高效。"
  ],
  "workedExample": [
    "batch 上限 4，步1 跑[A,B,C,D]；A 在第2步完成立即释放。",
    "新请求 E 第2步补入，仍跑满4，无空 slot 浪费。"
  ],
  "lineByLine": [
    "每个 decode step 后扫描完成的请求。",
    "释放其 KV slot。",
    "从等待队列按空闲数补入新请求。",
    "合并后仍跑满上限进入下一步。"
  ],
  "diagram": "静态: [A,B,C,D] 全完成才换批 → 空等\n连续: 步1[A,B,C,D] 步2 A完成→补E →[B,C,D,E] 始终满"
};
