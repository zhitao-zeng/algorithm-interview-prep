export default {
  "id": "me-moe-infer-batch",
  "category": "MoE 架构",
  "difficulty": "Medium",
  "title": "MoE 推理批处理",
  "prompt": "MoE 推理时如何通过批处理与 expert parallelism 控制显存与延迟？",
  "quickAnswer": "MoE 推理把同一层所有 token 对每专家的请求聚合成批：先算路由得到 (token,expert) 映射，再按专家分组做 grouped/batch 矩阵乘，并把不同专家切到多卡（expert parallelism）；用 capacity factor 裁剪过长批次，配合 fused kernel 降低延迟与显存。",
  "approach": "核心思路是“按专家聚批 + 专家并行”：不为每个 token 单独调用专家，而是把指向同一专家的 token 拼成连续批次统一计算；专家权重分片到多设备，路由后的 token 经 all-to-all 派发、计算、再收集，从而均衡显存与计算。",
  "explanationFocus": "是什么：MoE 推理批处理指在服务/部署阶段，把大量 token 对同一层多个专家的调用合并成按专家分组的批量矩阵乘，并结合专家并行与容量裁剪来控制显存占用与端到端延迟。",
  "bruteForce": "朴素做法：逐 token 或逐专家串行调用 FFN，无法利用 GPU 批矩阵乘，激活显存峰值高、kernel 启动开销大、延迟随专家数线性上升。",
  "invariant": "派发不变式：经 all-to-all 后，每个专家设备收到的 token 数 <= capacity×本地批大小，且所有 token 最终被收集回原位置、无丢失（除非触发容量丢弃）。",
  "walkthrough": "推理流程：1) 算路由得 expert_idx；2) 按 expert 分组 token 表示；3) all-to-all 把 token 发到持有对应专家的设备；4) 各设备对本地专家做批矩阵乘；5) 反向 all-to-all 收集结果并加权求和；6) 受 capacity 限制截断溢出。",
  "complexity": "说明：单专家批矩阵乘为 O(B_local·d_ff·d_model)；all-to-all 通信量与 token 数成正比；容量裁剪把每专家批大小上限固定，使显存与延迟可预测。",
  "beginnerSummary": "入门概览：与其让每个词分别去找专家，不如先把“都要找同一专家的词”归成一堆一起算，再把这些专家分到不同显卡上并行。这样既省显存又跑得快。",
  "diagram": "   tokens -> router -> expert_idx\n        |\n   group by expert (batch)\n        |\n   all-to-all  ---->\n   per-device expert GEMM (parallel)\n   <---- all-to-all\n        |\n   gather + weight + capacity cap\n        |\n      output",
  "code": "import torch\n\ndef batch_expert_forward(x, expert_idx, experts, capacity):\n    # x: (T, d)  expert_idx: (T,)  experts: ModuleList\n    out = torch.zeros_like(x)\n    for e in range(len(experts)):\n        mask = expert_idx == e\n        tok = x[mask]                       # 聚到同一专家的 token\n        if tok.shape[0] > capacity:         # 容量裁剪\n            tok = tok[:capacity]\n        out[mask][:capacity] = experts[e](tok)\n    return out",
  "derivation": [
    "为什么需要：推理期大量并发 token 若逐专家串行处理，GPU 利用率低、显存峰值高、延迟随专家数上升，需要批级聚合与并行。",
    "怎么实现：把路由结果按专家分组，做 grouped/batch GEMM；专家权重分片到多设备，用 all-to-all 派发与收集，并用 capacity 裁剪每专家批大小。",
    "有什么代价：all-to-all 引入通信开销，容量裁剪会丢弃溢出 token（推理常以残差兜底），分组实现复杂度高于稠密层。",
    "怎么评测：测端到端延迟、吞吐（tokens/s）、峰值显存与专家设备负载均衡度，对比不同 capacity 与并行度的取舍。"
  ],
  "edgeCases": [
    "某专家涌入 token 数远超 capacity，需截断或以残差兜底被丢 token。",
    "专家并行下 all-to-all 通信成为瓶颈，尤其小 batch 时通信占比高。",
    "不同设备专家负载不均，出现“快设备等慢设备”的木桶效应。",
    "变长序列导致每步批大小波动，capacity 预留需覆盖峰值。"
  ],
  "pitfalls": [
    "忽略容量裁剪，峰值显存随最大专家批大小失控。",
    "把推理与训练的路由/drop 逻辑混用，推理误丢 token 未兜底。"
  ],
  "prerequisites": [
    "MoE 路由与专家 FFN",
    "GPU 批矩阵乘与 all-to-all 集合通信"
  ],
  "workedExample": [
    "T=1024 token、E=16、capacity=128：每专家最多处理 128 个 token，单设备批矩阵乘规模可控，显存可预测。",
    "专家并行把 16 个专家分到 4 卡（每卡 4 专家），token 经 all-to-all 派发后本地聚批计算，再收集回原设备。"
  ],
  "lineByLine": [
    "expert_idx == e：构造掩码，筛出所有路由到专家 e 的 token。",
    "x[mask]：把同专家 token 聚成连续批次，供一次矩阵乘完成。",
    "tok[:capacity]：按容量上限裁剪，控制显存与延迟。",
    "out[mask][:capacity] = experts[e](tok)：把专家输出写回对应位置，未覆盖处保持零（再由残差补）。"
  ],
  "codeNotes": [
    "真实系统用 grouped GEMM / fused MoE kernel 替代 Python 循环，并把 all-to-all 与计算重叠以隐藏通信。"
  ],
  "followUps": [
    {
      "question": "推理时容量裁剪丢掉的 token 怎么办？",
      "answer": "通常用残差直通（skip）或置零兜底，因其比例很低对精度影响小；也可适当调大 capacity 换取更少丢弃。"
    },
    {
      "question": "expert parallelism 和 tensor parallelism 怎么选？",
      "answer": "专家并行按专家切分、适合专家数多的 MoE；张量并行切单层权重、适合单专家已很大的情况，常二者组合（如专家内再张量并行）。"
    }
  ],
  "followUpAnswers": [
    "通常用残差直通（skip）或置零兜底，因其比例很低对精度影响小；也可适当调大 capacity 换取更少丢弃。",
    "专家并行按专家切分、适合专家数多的 MoE；张量并行切单层权重、适合单专家已很大的情况，常二者组合（如专家内再张量并行）。"
  ],
  "kind": "concept"
};
