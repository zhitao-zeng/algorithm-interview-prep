export default {
  "id": "me-topk-routing",
  "category": "MoE 架构",
  "difficulty": "Easy",
  "title": "Top-k 路由策略",
  "prompt": "MoE 的门控网络为什么常用 top-k 路由？k 取 1 和取 2 各有什么特点？",
  "quickAnswer": "门控网络对每 token 输出 E 个专家分数，取最高的 k 个专家，并把它们的 softmax 概率归一化后作为加权系数。k=1（如 Switch Transformer）路由最简单、通信最少，但易不均衡；k=2 让每个 token 可由两位专家共同处理，表达更强也更稳，代价是计算与通信翻倍。",
  "approach": "视为“打分+选优+归一化”三步走：先过门控得全部分数，再取 top-k 下标，最后只对这 k 个分数做 softmax 得到权重。",
  "explanationFocus": "是什么：top-k 路由是 MoE 门控的经典策略——对每个 token，门控网络选出得分最高的 k 个专家参与计算，并按归一化后的概率为它们加权求和。",
  "bruteForce": "每次把整个 token 送给所有 E 个专家（dense）再加权求和。虽然最稳但完全没有稀疏性，计算量随专家数线性增长，失去 MoE 省算力的意义。",
  "invariant": "核心不变量：每个 token 最终只由恰好 k 个专家表示；其路由权重在所选 k 个专家上归一化和恒为 1。",
  "walkthrough": "设 E=8，某 token 门控得分为 [0.05,0.9,0.02,0.6,0.01,0.1,0.03,0.2]。k=2 时选中专家1(0.9)、专家3(0.6)，softmax 得权重 ≈[0.57,0.43]，该 token 由这两位专家按权重组合。",
  "code": "import torch\n\ndef topk_route(gate_logits, k=2):\n    # gate_logits: [T, E]\n    topk_val, topk_idx = torch.topk(gate_logits, k, dim=-1)\n    w = torch.softmax(topk_val, dim=-1)   # 仅对选中的 k 个归一化\n    return topk_idx, w",
  "complexity": "门控前向 O(T·E)，取 top-k 可用全排序 O(T·E) 或部分排序 O(T·k·log E)；每个 token 仅做 k 次专家前向，计算量约为 dense 的 k/E。",
  "beginnerSummary": "选专家像选课：每门课（token）你挑得分最高的 2 门（top-2）去上，按喜好分配时间；而不是把所有课都上一遍。",
  "diagram": "gate_logits [0.05,0.9,0.02,0.6,...]\n        │ topk(k=2)\n        ▼\n   选 idx=[1,3]  val=[0.9,0.6]\n        │ softmax\n        ▼\n   w=[0.57,0.43] ─▶ Expert1 + Expert3",
  "derivation": [
    "为什么需要：dense 全专家计算太贵，必须只激活少数专家；而 top-1 表达力受限且易不均衡，需要一种既稀疏又灵活的选法。",
    "怎么实现：门控输出 E 路分数 → torch.topk 取前 k 个下标 → 仅对这 k 个分数 softmax 得到权重 → 用权重加权各专家输出。",
    "有什么代价：k 越大激活计算与跨设备通信越多（k=2 约为 k=1 的两倍），且容量与负载均衡压力上升。",
    "怎么评测：对比同算力下 k=1/2 的验证指标与训练稳定性，观察路由熵、专家利用率与丢弃率。"
  ],
  "edgeCases": [
    "k=1 时若门控对某个专家持续高分，会造成严重负载倾斜，需要强均衡损失配合。",
    "top-k 分数接近时 softmax 权重趋于均匀，可能削弱“专家专业化”信号。",
    "E 很大（如 64）时 topk 在长维上取前 k 个仍是 O(T·E)，需优化门控实现。",
    "数值溢出：gate_logits 过大时直接 softmax 不稳，应先 topk 再对子集 softmax（代码已这样做）。"
  ],
  "pitfalls": [
    "对全部 E 个分数先整体 softmax 再取 top-k，会把未选中专家的概率也算进来，权重定义错误。",
    "误以为 top-2 的算力是 dense 的 2/E 却忽略门控与 dispatch 的固定开销。"
  ],
  "prerequisites": [
    "Softmax 与门控网络",
    "稀疏激活与专家并行基本概念",
    "Top-k 选择（argpartition/topk）操作"
  ],
  "workedExample": [
    "E=8，分数 [0.05,0.9,0.02,0.6,0.01,0.1,0.03,0.2]，k=2：选 idx=[1,3]，子集 [0.9,0.6]，softmax 后 [0.57,0.43]。",
    "同分数改 k=1：只选 idx=[1]，权重恒为 1，token 完全由专家1 处理，路由更脆。"
  ],
  "lineByLine": [
    "topk_val, topk_idx = torch.topk(gate_logits, k, dim=-1)：在最后一维取分数最高的 k 个值与下标。",
    "w = torch.softmax(topk_val, dim=-1)：只对这 k 个值做 softmax，保证权重和为 1。",
    "return topk_idx, w：返回被选中的专家下标与对应归一化权重，供后续加权求和。"
  ],
  "codeNotes": [
    "务必先 topk 再对子集 softmax，而不是先对全 E 维 softmax；否则权重口径与“仅激活 k 个专家”的定义不符。"
  ],
  "followUps": [
    {
      "question": "top-1 和 top-2 在通信上差多少？",
      "answer": "top-1 每个 token 只需被送到 1 个专家设备，all-to-all 的跨设备 token 数约为 top-2 的一半；top-2 因每个 token 要去两个专家，dispatch/combine 的通信量近似翻倍。"
    },
    {
      "question": "能不能让 k 随 token 自适应？",
      "answer": "可以，但会破坏固定 capacity 与静态计算图，工程上更复杂；常见折中是固定 k 配合 capacity 缓冲，或用专家选择/ token 选择混合路由。"
    }
  ],
  "followUpAnswers": [
    "top-1 每个 token 只需被送到 1 个专家设备，all-to-all 的跨设备 token 数约为 top-2 的一半；top-2 因每个 token 要去两个专家，dispatch/combine 的通信量近似翻倍。",
    "可以，但会破坏固定 capacity 与静态计算图，工程上更复杂；常见折中是固定 k 配合 capacity 缓冲，或用专家选择/ token 选择混合路由。"
  ],
  "kind": "concept"
};
