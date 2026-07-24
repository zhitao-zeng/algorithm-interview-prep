export default {
  "kind": "concept",
  "id": "cb-vllm",
  "category": "Continuous Batching",
  "difficulty": "Medium",
  "title": "vLLM 中的 Continuous Batching",
  "prompt": "vLLM 是怎么实现 Continuous Batching 的？",
  "quickAnswer": "vLLM 以 PagedAttention 为显存底座，在调度器(Scheduler)里按 iteration 维护 waiting/running 队列：每步把运行中已 finished 的请求回收其 KV block，再从 waiting 按空闲 block 数补入新请求，并对prefill/decode 分桶(batch 化)。核心就是\"分页 KV + 逐步换入换出\"，这也是它高吞吐的来源。",
  "approach": "读 vLLM Scheduler：每步 reclaim finished → 按 block 余量 admit waiting。",
  "explanationFocus": "是什么：vLLM 通过 Scheduler 在每个 decode 步动态重组 running 集合，并用 PagedAttention 管理 KV 块，落地了 Continuous Batching。",
  "bruteForce": "早期实现用静态 batch 或简单动态批，缺乏分页 KV，并发与利用率受限。",
  "derivation": [
    "为什么需要：vLLM 设计目标就是高吞吐推理，必须消除气泡与 KV 预留浪费，连续批 + 分页是答案。",
    "怎么实现：Scheduler 持 waiting/running；step() 中先回收 finished 请求的 block 到 gpu 空闲池，再按 (capacity - running) 与空闲 block 双重约束从 waiting 取新请求初始化 block 表。",
    "有什么代价：需维护 block 表、swap 空间与抢占逻辑；kernel 需支持分页注意力。",
    "怎么评测：vLLM 官方 benchmark 在高并发下吞吐数倍于原生 HF，验证连续批收益。"
  ],
  "invariant": "running 数受 token 容量与空闲 block 数共同约束，二者取最小。",
  "walkthrough": "gpu 空闲 16 block，running 占 80/96；finished 2 请求释放 6 block → 空闲 22；从 waiting 取能放进 22 block 的请求补齐。",
  "edgeCases": [
    "block 不足但 token 容量有余：受 block 限制无法再扩。",
    "抢占时 swap 到 CPU 空间。",
    "prefill 与 decode 混合需分桶避免互拖。"
  ],
  "code": "# Python (vLLM 风格伪代码)\ndef schedule(self):\n    self._free_finished()            # 回收 finished 的 block\n    while self.waiting and self._has_free_block():\n        self.running.append(self.waiting.pop(0).provision())\n    return self.running",
  "codeNotes": [
    "_free_finished 释放 KV block 回池。",
    "准入受 token 容量与 block 数双重限制。"
  ],
  "complexity": "调度 O(并发)；分页使可达并发与利用率大幅提升。",
  "followUps": [
    {
      "question": "vLLM 的 running 受什么限制？",
      "answer": "受最大 token 容量与当前空闲 KV block 数双重约束，取二者允许的最小值。"
    },
    {
      "question": "vLLM 怎么处理 prefill 和 decode？",
      "answer": "通常分桶(batch)处理，prefill 阶段和 decode 阶段分开调度，或用 chunked prefill 混合以平滑。"
    }
  ],
  "followUpAnswers": [
    "token 容量与空闲 block 取最小。",
    "prefill/decode 分桶或 chunked。"
  ],
  "pitfalls": [
    "以为 vLLM 只靠分页显存就高吞吐，忽略连续批调度。",
    "混淆 token 容量限制与 block 限制。",
    "（事实核查·2025）vLLM V1 相比 V0 重构了调度与前后端，吞吐更高、支持投机解码与更细的批处理；实测常与 TRT-LLM / SGLang 同台比较。答“高吞吐推理框架”要能列 vLLM / TRT-LLM(+Dynamo) / SGLang 的差异。"
  ],
  "beginnerSummary": "vLLM 像一家效率极高的餐厅：每桌吃完（finished）立刻把餐具(block)收回消毒池，门口等位客按空桌+空餐具数量马上入座；餐具按需取用不浪费。这套\"收桌+补客+分页餐具\"就是它的连续批。",
  "prerequisites": [
    "PagedAttention 管理 KV。",
    "Scheduler 维护 waiting/running。",
    "block 池可回收复用。"
  ],
  "workedExample": [
    "finished 2 请求释放 6 block。",
    "空闲 22 block，从 waiting 补满。"
  ],
  "lineByLine": [
    "每步回收 finished 的 KV block。",
    "统计空闲 block 与 token 容量。",
    "按约束从 waiting 取新请求。",
    "初始化其 block 表加入 running。"
  ],
  "diagram": "Scheduler: free_finished → 空闲block↑\n→ admit waiting 按 block 余量 → running"
};
