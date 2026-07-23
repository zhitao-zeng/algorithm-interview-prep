export default {
  "kind": "concept",
  "id": "cb-release-slot",
  "category": "Continuous Batching",
  "difficulty": "Medium",
  "title": "请求完成即释放 slot",
  "prompt": "Continuous Batching 里\"请求完成即释放 slot、新请求即时插入\"是怎么做到的？",
  "quickAnswer": "每个 decode step 后，调度器检查哪些请求已生成 EOS 或达到最大长度，立即标记其 slot/显存为可复用；同时从等待队列按空闲 slot 数取出新请求填入。关键在于 slot 是按需分配、独立释放的，不是整批绑定，所以新请求能在任意步插入而非等整批结束。",
  "approach": "维护 running/waiting 两个集合与空闲 slot 计数，每步做\"释放→补位\"。",
  "explanationFocus": "是什么：把每个请求的占用从\"整批生命周期\"拆成\"独立 slot 生命周期\"，完成一个释放一个，空闲一个补一个。",
  "bruteForce": "整批一起进、一起出，所有 slot 绑定到同一批请求直到全部完成。",
  "derivation": [
    "为什么需要：如果不独立释放，短请求完成后其 slot 仍被本批占用，无法接新请求，回到气泡问题。",
    "怎么实现：每步遍历 running，done 的请求回收其 KV 页与位置；计算 free = capacity - 剩余数，按 free 从 waiting 取新请求初始化并加入下一步。",
    "有什么代价：需要请求级状态机与 KV 页表追踪，回收时要保证不破坏仍在跑请求的连续性。",
    "怎么评测：看稳态下 slot 利用率曲线是否贴近容量上限，以及新请求排队延迟(queuing delay)。"
  ],
  "invariant": "running 数 + waiting 已排部分 = 总待服务数；free = capacity - running 始终被尽量补满。",
  "walkthrough": "capacity=8，running=8。步5 有 3 个完成 → running=5, free=3；从 waiting 取 3 个新请求补入 → running 回到 8。",
  "edgeCases": [
    "waiting 为空：free 无法补满，GPU 欠载。",
    "瞬间大量完成：一次性腾出很多 slot，需快速批量补位。",
    "新请求初始化慢：补位本身引入少量延迟。"
  ],
  "code": "# Python\ndef reclaim_and_fill(running, waiting, capacity):\n    done = [r for r in running if r.finished]\n    for r in done:\n        r.free_kv()  # 释放 KV 页\n    live = [r for r in running if not r.finished]\n    while len(live) < capacity and waiting:\n        live.append(waiting.pop(0).init())\n    return live",
  "codeNotes": [
    "释放以请求为单位，与其 KV 页绑定。",
    "补位按 free 数量，不超 capacity。"
  ],
  "complexity": "每步 O(capacity)；补位使吞吐随到达率自适应。",
  "followUps": [
    {
      "question": "释放 slot 后 KV 显存怎么处理？",
      "answer": "交给分页显存管理器(如 PagedAttention)把该请求占用的页标记空闲，可被后续请求复用，无需整块重分配。"
    },
    {
      "question": "新请求插入会不会打乱 position？",
      "answer": "不会，每个请求维护自己的 position 计数与因果 mask，彼此独立，插入只新增一条独立序列状态。"
    }
  ],
  "followUpAnswers": [
    "KV 页标记空闲供复用。",
    "各请求独立 position/mask。"
  ],
  "pitfalls": [
    "把 slot 释放想成整批，实际是逐请求。",
    "忽略释放后要立即补位，否则腾出的 slot 空转。"
  ],
  "beginnerSummary": "停车场每个车位独立计费：谁开走谁立刻空出，门口排队车马上停进来，不需要等整排车一起走。Continuous Batching 的车位就是 GPU 的 slot，独立释放让车位几乎不空。",
  "prerequisites": [
    "slot 对应一段 KV 显存。",
    "请求有完成(EOS/长度)判定。",
    "waiting 队列保存排队请求。"
  ],
  "workedExample": [
    "capacity=8 全满，步5 完成 3 个。",
    "释放后补 3 个新请求，重新满载。"
  ],
  "lineByLine": [
    "扫描 running 找出已完成请求。",
    "逐个释放其 KV 页。",
    "统计剩余 live 请求。",
    "按空闲数从 waiting 补入新请求。"
  ],
  "diagram": "running[8] --完成3--> 释放3 --> free=3\nwaiting 取3 --> running 回到[8]"
};
