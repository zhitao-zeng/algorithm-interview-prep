export default {
  "id": "ir-continuous-batch",
  "category": "推理框架",
  "difficulty": "Medium",
  "title": "连续批处理",
  "prompt": "连续批处理（continuous batching）相比静态批处理如何提升 LLM 推理吞吐？",
  "quickAnswer": "静态批处理要等整批最长序列生成完才释放；连续批处理在每个解码步动态加入新请求、移走已完成的请求，使 GPU 始终满负荷。",
  "approach": "以迭代级（iteration-level）调度取代请求级调度：每步只对当前活跃序列做一步 decode，完成的立即出队，新到的立即入队，迭代间填充。",
  "explanationFocus": "是什么：连续批处理是把调度粒度从\"一整批请求\"降到\"一次 decode 迭代\"，在每个 step 动态组装当前活跃序列的集合，从而消除短请求被长请求拖住的木桶效应。",
  "bruteForce": "朴素做法：静态批处理把 N 条请求凑一批，所有序列必须都生成到各自 EOS 才统一返回，短请求空等造成算力浪费。",
  "invariant": "不变式：每一步参与计算的序列集合恰为当前未完成且已调度请求的集合，且每个序列当步只前进一个 token。",
  "walkthrough": "执行追踪：调度器每步收集活跃序列做一次小批量 matmul；某序列输出 EOS 即出队并回收其 KV；新到达请求在任意步插入活跃集合。",
  "complexity": "说明：单步 batch 大小动态变化，kernel 启动次数等于总步数；吞吐提升来自更高 GPU 占用率，代价是更频繁的调度与变长 kernel 开销。",
  "beginnerSummary": "静态批处理要等最慢的那个。连续批处理每步都重新组队：走完的立刻离场、新来的立刻加入，GPU 一直不空转。",
  "diagram": "step1: [A B C]\nstep2: [A B C D]   <- D 到达加入\nstep3: [A   C D]   <- B 完成离场\nstep4: [A   C D E] <- E 加入",
  "code": "def step(batch):\n    running = [s for s in batch if not s.finished]\n    for s in running:\n        s.kv = append(s.kv, model(s.last_token))\n    return [s for s in batch if s.finished]",
  "derivation": [
    "为什么需要：静态批处理受最长序列制约，短请求大量空等，GPU 利用率低且尾延迟高。",
    "怎么实现：调度器在每次 decode 迭代重新挑选活跃序列组成小批量；完成序列即时出队回收 KV，新请求即时入队，实现 iteration-level 调度。",
    "有什么代价：调度频率升高、变长 batch 带来 kernel 形状变化与部分填充；需配合分页 KV 才能高效增删序列。",
    "怎么评测：在相同 QPS 下对比吞吐（token/s）、平均 TTFT 与 TPOT，观察长尾延迟与 GPU 利用率曲线。"
  ],
  "edgeCases": [
    "突发大量短请求时调度器需限流，避免活跃集合爆炸。",
    "某序列异常长时仍会拖慢同批 TPOT，可用抢占或 chunked prefill 缓解。",
    "新请求在序列中途加入时其 KV 初始状态需正确初始化。",
    "全部序列同时完成时 batch 瞬时为空，需避免空闲 kernel 启动浪费。"
  ],
  "pitfalls": [
    "仍按静态整批等待所有 EOS，没实现迭代级出队，等于没用连续批处理。",
    "变长 batch 不做 padding 掩码，导致注意力跨序列泄漏。"
  ],
  "prerequisites": [
    "Transformer 自回归逐 token 解码流程",
    "批处理 matmul 与 GPU 占用率概念"
  ],
  "workedExample": [
    "批量 [16, 64, 1024] token 三请求：静态批需 1024 步才释放，短请求空等；连续批在 16、64 步分别释放，空出槽位给新请求。",
    "持续到达流量下，连续批使平均 batch 占用维持在接近上限，吞吐较静态批提升数倍。"
  ],
  "lineByLine": [
    "running 过滤出未完成序列，保证每步只推进活跃请求。",
    "append(s.kv, model(s.last_token)) 对单 token 做一步 decode 并追加 KV。",
    "返回 finished 列表供调度器出队、回收显存并触发回调。"
  ],
  "codeNotes": [
    "真实框架中 model 调用一个融合 decode kernel，并对变长序列做 packed batch 以避免无效 padding 计算。"
  ],
  "followUps": [
    {
      "question": "连续批处理为何通常需要配合 PagedAttention？",
      "answer": "因为序列动态增删要求 KV 显存可非连续、按需分配回收，PagedAttention 的分页管理正好支撑这种弹性调度。"
    },
    {
      "question": "连续批处理能降低首 token 延迟吗？",
      "answer": "能降低排队等待：新请求无需等当前整批结束即可在下一步加入，从而改善 TTFT，但单步算力仍受同批最长序列影响。"
    }
  ],
  "followUpAnswers": [
    "因为序列动态增删要求 KV 显存可非连续、按需分配回收，PagedAttention 的分页管理正好支撑这种弹性调度。",
    "能降低排队等待：新请求无需等当前整批结束即可在下一步加入，从而改善 TTFT，但单步算力仍受同批最长序列影响。"
  ],
  "kind": "concept"
};
