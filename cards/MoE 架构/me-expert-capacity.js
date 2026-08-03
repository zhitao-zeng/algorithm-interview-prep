export default {
  "id": "me-expert-capacity",
  "category": "MoE 架构",
  "difficulty": "Medium",
  "title": "专家容量（Expert Capacity）与 Token 丢弃",
  "prompt": "MoE 里 expert capacity 是什么？为什么需要它，token 超限时怎么处理？",
  "quickAnswer": "为防止某专家被海量 token 压垮、保证并行效率，MoE 给每个专家预设一个最大处理 token 数 capacity=(tokens_per_batch/experts)×capacity_factor。超出该容量的 token 会被丢弃（dropped）或交给共享专家/残差。capacity 太小丢信息、太大浪费算力，是吞吐与质量的折中。",
  "approach": "把它当成“排队限流”问题：先按 token 数定一个公平配额，再乘以缓冲系数留余量，最后对溢出 token 决定丢弃或兜底，并用丢弃率指标监控。",
  "explanationFocus": "是什么：expert capacity 是每个专家在一层中最多处理的 token 数量上限；当路由到某专家的 token 超过该上限时，多余 token 会被丢弃或绕过，从而把计算量固定在可预期范围。",
  "bruteForce": "不设容量上限，按实际路由结果动态分配显存。结果是长尾专家负载暴涨，显存峰值不可控、batch 内掉队，训练直接 OOM 或卡死。",
  "invariant": "核心不变量：每个专家本层处理的 token 数不超过 capacity；全局被处理的 token 总数 == 总 token 数 − 被丢弃数，且丢弃决策对所有专家一致。",
  "walkthrough": "设 batch 有 4096 个 token、8 个专家、capacity_factor=1.25。基础配额 4096/8=512，capacity=512×1.25=640。若专家 3 被路由到 700 个 token，前 640 个保留，后 60 个被丢弃（丢弃率约 8.6%）。",
  "code": "def compute_capacity(tokens, num_experts, capacity_factor=1.25):\n    base = tokens / num_experts\n    return int(base * capacity_factor)\n\ndef route_with_capacity(assignments, capacity):\n    kept, dropped = [], 0\n    counts = [0] * len(capacity)\n    for tok, e in assignments:\n        if counts[e] < capacity[e]:\n            kept.append((tok, e)); counts[e] += 1\n        else:\n            dropped += 1\n    return kept, dropped",
  "complexity": "容量检查与截断为 O(T)，额外显存 O(E×capacity) 固定；代价是可能丢弃信息、需监控丢弃率。",
  "beginnerSummary": "专家像限时窗口的客服，每人一次最多接 640 个咨询。第 641 个只能挂断（丢弃）或转给总机（残差/共享专家），这样系统不会因一个人忙崩而瘫痪。",
  "diagram": "Expert0 [#####......] cap=640  已用 50\nExpert1 [############] cap=640  已用 640 (满)\nExpert2 [##..........] cap=640  已用 12\n  └ 溢出的 token ─▶ 丢弃 / 共享专家",
  "derivation": [
    "为什么需要：动态路由下少数专家可能集中过多 token，使显存峰值与计算时间不可控，必须给每个专家一个硬上限来保证固定开销与并行效率。",
    "怎么实现：capacity = (总 token 数 / 专家数) × capacity_factor，按路由顺序把 token 填入对应专家缓冲，超过 capacity 的 token 丢弃或走残差/共享专家。",
    "有什么代价：capacity 过小会丢 token 损精度、过大则浪费显存与算力；容量因子是需要调的折中超参。",
    "怎么评测：监控 per-expert 丢弃率与整体 dropped ratio，结合验证集指标权衡 capacity_factor 是否合适。"
  ],
  "edgeCases": [
    "capacity_factor 设得太小（如 1.0）且路由极不均时，丢弃率可能高达 20% 以上，明显掉点。",
    "所有专家同时接近满容量时，丢弃的 token 无法通过“换专家”补救，需共享专家兜底。",
    "可变长序列（如不同样本 token 数差异大）使每步 capacity 变化，需按当前 batch 动态重算。",
    "容量检查用整数截断，T 不能被 E 整除时会引入微小偏差需对齐。"
  ],
  "pitfalls": [
    "把 capacity_factor 当作越大越好，结果显存被撑爆、batch 无法放下。",
    "只在训练时统计丢弃率却不在验证集观察，导致线上推理同样丢 token 才发现精度掉。"
  ],
  "prerequisites": [
    "Top-k 路由与门控网络",
    "专家并行与 batch 内负载不均现象",
    "显存/算力预算与吞吐控制概念"
  ],
  "workedExample": [
    "tokens=4096、E=8、因子1.25 → capacity=640；专家3 收到 700 token，保留前 640、丢弃后 60，丢弃率 60/700≈8.6%。",
    "若把因子降到 1.0，capacity=512，则专家3 丢弃 700−512=188，丢弃率升到 26.9%，验证集明显下滑。"
  ],
  "lineByLine": [
    "base = tokens / num_experts：算出每个专家“平均分到”的 token 配额。",
    "return int(base * capacity_factor)：乘以缓冲系数并取整，得到最终 capacity。",
    "counts = [0]*len(capacity)：为每个专家维护一个已接收计数。",
    "if counts[e] < capacity[e]：未超额才接收该 token，否则进入丢弃分支。",
    "else: dropped += 1：溢出 token 计数，后续可用于监控或兜底。"
  ],
  "codeNotes": [
    "capacity 必须按“当前 batch 的 token 总数”实时计算，跨 batch 缓存旧值会导致形状不匹配。"
  ],
  "followUps": [
    {
      "question": "token 被丢弃后有没有办法不损失信息？",
      "answer": "常见做法是引入共享专家（shared expert）承接溢出 token，或把丢弃 token 直接走残差连接（bypass），也可降低路由噪声、增大 capacity_factor，三者常组合使用。"
    },
    {
      "question": "capacity 和负载均衡损失为什么要一起用？",
      "answer": "均衡损失从“动机”上让路由更均匀，减少溢出；capacity 从“兜底”上限上保证即使不均也不会 OOM，二者分别解决概率分布与显存上限，互补才稳。"
    }
  ],
  "followUpAnswers": [
    "常见做法是引入共享专家（shared expert）承接溢出 token，或把丢弃 token 直接走残差连接（bypass），也可降低路由噪声、增大 capacity_factor，三者常组合使用。",
    "均衡损失从“动机”上让路由更均匀，减少溢出；capacity 从“兜底”上限上保证即使不均也不会 OOM，二者分别解决概率分布与显存上限，互补才稳。"
  ],
  "kind": "concept"
};
