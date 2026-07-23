export default {
  "kind": "concept",
  "id": "moe-router",
  "category": "大模型推理原理",
  "difficulty": "Hard",
  "title": "MoE 为什么参数量很大，但单 token 计算量没有同比增加？Router 与负载均衡",
  "prompt": "MoE（混合专家）为什么参数量很大，但单 token 计算量没有同比增加？Router 如何训练、如何避免 Expert Collapse？",
  "quickAnswer": "MoE 把前馈层换成多个并行 Expert，每个 token 只由 Router 选 Top-K 个 Expert 计算（其余不激活），因此“总参数量”很大但“每 token 激活参数量”很小，单 token 算力近似随激活专家数而非总专家数增长。Router 通常与主模型联合训练（负载均衡损失鼓励均匀路由），并用 Capacity Factor/Token Dropping 防止单个专家过载与 Expert Collapse（多数 token 挤向少数专家）。",
  "approach": "稀疏激活：Router 选 Top-K Expert → 只执行被选专家 → 加权聚合；总参数大、激活参数小。",
  "explanationFocus": "是什么：MoE 用“多专家+路由”实现参数规模与单 token 算力的解耦；关键概念是 Total vs Active Parameters。",
  "bruteForce": "不用 MoE，所有 token 走同一个稠密 FFN（参数与算力同比例增长）。",
  "derivation": [
    "为什么需要：想扩模型容量（参数）又不让每 token 算力同比例上涨。",
    "怎么实现：每层用 N 个 Expert + 一个 Router；Router 输出 N 路分数，取 Top-K 激活对应专家，结果按权重聚合。",
    "怎么训练：Router 与主网络端到端训练，额外加负载均衡损失（鼓励各专家被选中频率接近），缓解 Expert Collapse。",
    "怎么评测：看总参数、激活参数、每 token FLOPs、专家负载分布与下游精度。"
  ],
  "invariant": "单 token 算力 ≈ 随 K（激活专家数）线性增长，与专家总数 N 基本无关；参数量随 N 增长。",
  "walkthrough": "DeepSeek-V2/V3 用稀疏 MoE：每层数十个专家，每 token 只激活 2 个（Top-2），总参数达数百亿~千亿级，但每 token 激活参数仅约 1/10~1/16。",
  "edgeCases": [
    "Expert Collapse：路由总把 token 送同一少数专家，其余浪费且过拟合。",
    "负载不均：热门专家成瓶颈，并行时拖慢其他专家所在设备。",
    "Token Dropping：超过容量上限的 token 被丢弃或走共享专家，可能损信息。"
  ],
  "code": "# Python\nimport torch\ndef topk_routing(router_logits, experts, x, k=2):\n    # router_logits: Router 对该 token 在 N 个专家上的分数\n    probs = torch.softmax(router_logits, dim=-1)\n    topk_val, topk_idx = torch.topk(probs, k)\n    out = sum(experts[i](x) * w for i, w in zip(topk_idx, topk_val))\n    return out  # 只激活 k 个专家",
  "codeNotes": [
    "真实含负载均衡损失与 capacity 限制; 这里省略。",
    "Shared Expert 常额外常驻, 吸收通用特征。"
  ],
  "complexity": "单 token 算力 O(K·d²)（K 个专家各一次 FFN），与专家总数 N 无关；总参数 O(N·d²)。通信/调度开销随并行策略变化。",
  "followUps": [
    {
      "question": "Total Parameters 与 Active Parameters 区别？",
      "answer": "Total 是所有专家参数之和（含未激活的），Active 是单个 token 实际经过的专家参数；MoE 靠 K≪N 让 Active≪Total。"
    },
    {
      "question": "Router 如何训练？",
      "answer": "与主网络端到端反向传播；Router 权重随梯度更新，同时受负载均衡损失约束。"
    },
    {
      "question": "Expert Collapse 是什么？",
      "answer": "路由退化为总把 token 送少数专家，其余专家几乎不被用，容量浪费且易过拟合。"
    },
    {
      "question": "为什么需要 Load Balance？",
      "answer": "不均衡会让热门专家成计算/通信瓶颈，且多数专家学不好；负载均衡损失鼓励均匀路由。"
    },
    {
      "question": "Shared Expert 与 Routed Expert 区别？",
      "answer": "Shared Expert 对每个 token 都激活（捕获通用特征），Routed Expert 仅被 Router 选中的 token 激活。"
    },
    {
      "question": "Capacity Factor 与 Token Dropping？",
      "answer": "Capacity Factor 限制每个专家单批最多处理的 token 数；超出的 token 被丢弃或溢出处理，防止单专家过载。"
    }
  ],
  "followUpAnswers": [
    "Total 含未激活专家, Active 是实际经过的。",
    "端到端训练+负载均衡损失。",
    "路由塌缩到少数专家。",
    "不均衡拖慢热门专家。",
    "Shared 常驻, Routed 按需。",
    "容量上限超限则丢 token。"
  ],
  "pitfalls": [
    "以为 MoE 单 token 算力随总专家数增长（错：只随激活数 K）。",
    "忽视负载均衡，导致 Expert Collapse。",
    "混淆 Shared 与 Routed Expert 的作用。",
    "（事实核查·2025）常见过时设定：Mixtral 8x7B 是 8 专家 Top-2；而 DeepSeek-V3 已是 256 个路由专家 + 1 个共享专家、每 token Top-8，并采用 aux-loss-free（无辅助损失，用 bias 偏置做负载均衡）。面试按最新配置答，别把两者混为一谈。"
  ],
  "beginnerSummary": "普通大模型每一层只有一个“全连接”大脑，所有文字都过它。MoE 把这一层换成好几个“专家”和一个“调度员”（Router）：每个字只交给最相关的两三个专家处理，其他专家歇着。所以模型总参数可以堆得很大（专家多），但处理任意一个字只动用其中一小撮（激活参数小），算起来并不比小模型慢多少。难点在于调度员不能“偷懒”总找同一两个专家（叫 Expert Collapse），所以训练时要加“均衡损失”逼它雨露均沾。",
  "prerequisites": [
    "FFN/前馈层是主要参数与算力来源。",
    "Top-K 选择只激活部分专家。",
    "训练可加负载均衡约束。"
  ],
  "workedExample": [
    "每层 64 专家, Top-2 → 每 token 只算 2 个专家, 总参数随 64 增。",
    "DeepSeek-V3: 总参数千亿级, 每 token 激活约 1/16。"
  ],
  "lineByLine": [
    "Router 给 N 个专家打分。",
    "取 Top-K 激活对应专家。",
    "只执行 K 个专家前向。",
    "按路由权重聚合。",
    "总参数随 N 增, 算力随 K 增。"
  ],
  "diagram": "MoE 单层:\ntoken -> Router(softmax) -> Top-K 专家\n         |- Expert_3 (激活)\n         |- Expert_7 (激活)\n其他专家 休眠\n输出 = 加权聚合\nTotal>>Active (K<<N)"
};
