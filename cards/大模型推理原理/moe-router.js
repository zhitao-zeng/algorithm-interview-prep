export default {
  "kind": "concept",
  "id": "moe-router",
  "category": "大模型推理原理",
  "difficulty": "Hard",
  "title": "MoE 为什么参数量很大，但单 token 计算量没有同比增加？Router 与负载均衡",
  "prompt": "MoE（混合专家）为什么参数量很大，但单 token 计算量没有同比增加？Router 如何训练、如何避免 Expert Collapse？",
  "quickAnswer": "MoE 把前馈层换成多个并行 Expert，每个 token 只由 Router 选 Top-K 个 Expert 计算（其余不激活），因此\"总参数量\"很大但\"每 token 激活参数量\"很小，单 token 算力近似随激活专家数 K 而非总专家数 N 增长。Router 通常与主模型联合训练（额外加负载均衡损失鼓励均匀路由），并用 Capacity Factor/Token Dropping 防止单个专家过载与 Expert Collapse（多数 token 挤向少数专家）。以 DeepSeek-V3 为例：总参数约 671B，但每 token 仅激活约 37B（Top-8/256 路由专家 + 1 共享专家），靠 aux-loss-free 的偏置机制做负载均衡。",
  "approach": "稀疏激活：Router 对每 token 打 N 路分数 → 取 Top-K 激活对应 Expert → 只执行被选专家前向 → 按路由权重聚合；总参数随 N 增长、激活参数随 K 增长，二者解耦。",
  "explanationFocus": "是什么：MoE（Mixture of Experts，混合专家）用\"多专家 + 路由\"实现参数规模与单 token 算力的解耦——它把原本单一的前馈层（FFN）换成 N 个并行的 Expert，每个 token 只由 Router（路由网络）选 Top-K 个 Expert 计算、其余不激活。因此\"总参数量\"可以很大（所有专家之和），但\"每 token 激活参数量\"很小（仅 K 个专家），单 token 算力近似随激活专家数 K 增长而非随专家总数 N 增长。Router 与模型联合训练（加负载均衡损失避免 Expert Collapse），并用 Capacity Factor/Token Dropping 防止单专家过载。",
  "bruteForce": "不用 MoE，所有 token 走同一个稠密 FFN：参数与算力同比例增长，想扩容量就得同比例加算力，训练和推理成本都随参数线性上升，无法\"用参数换容量而不加算力\"，规模化的边际成本很高。",
  "derivation": [
    "为什么需要：想扩模型容量（参数越多通常表达能力越强）又不让每 token 算力同比例上涨——稠密模型扩容量必扩算力，训练/推理都贵；MoE 用稀疏激活把二者解耦。",
    "怎么实现：每层放 N 个 Expert + 一个 Router；Router 对 token 输出 N 路分数（softmax），取 Top-K 激活对应专家，各专家做 FFN 后按路由权重聚合输出。推理时只跑 K 个专家前向，其余不碰，显存占用仍是全量但算力只算 K 份。",
    "怎么训练：Router 与主网络端到端反向传播；为防 Expert Collapse，早期做法加负载均衡辅助损失（鼓励各专家被选中频率接近），新一代（如 DeepSeek-V3）改用 aux-loss-free 的偏置机制——给每个专家加可调 bias，按负载动态纠偏，避免辅助损失干扰主任务。",
    "怎么评测：看总参数、激活参数、每 token FLOPs、专家负载分布（是否均衡）、token 丢弃率与下游精度；失衡或丢弃过多都会损效果，需同时监控\"容量利用率\"与\"精度\"。"
  ],
  "invariant": "单 token 算力 ≈ 随 K（激活专家数）线性增长，与专家总数 N 基本无关；参数量随 N 增长。即 Total Parameters 可远大于 Active Parameters，前提是 K≪N，这是 MoE 的核心恒等式。",
  "walkthrough": "以 DeepSeek-V3 为例：每层有 256 个路由专家 + 1 个常驻共享专家，每 token 经 Router 选 Top-8 路由专家，加上共享专家共激活 9 个专家。总参数约 671B，每 token 激活参数约 37B（约 1/18），单 token FLOPs 近似只随 9 个专家的前馈计算增长，与 256 无关。对比同算力的稠密模型（参数≈激活参数），MoE 用\"大总参、小激活\"在相近推理成本下拿到更大容量。训练时给每个路由专家加一个可学习的偏置（bias），按近期负载动态调整路由分数，使各专家被选中的频率趋于均衡，避免 Expert Collapse，且不需传统 aux loss 干扰主任务梯度。",
  "edgeCases": [
    "Expert Collapse：路由总把 token 送同一少数专家，其余专家几乎不被用，容量浪费且热门专家过拟合、冷门专家学不好。",
    "负载不均：热门专家成计算/通信瓶颈（专家常并行分布到不同设备），拖慢同批其他专家所在设备，造成木桶短板。",
    "Token Dropping：超过 Capacity Factor 上限的 token 被丢弃或溢出到共享专家，可能损失信息、影响长尾样本质量。",
    "Router 抖动：相邻 token 路由分数接近导致激活专家频繁切换，增加设备间通信与 cache 抖动，影响推理效率。"
  ],
  "code": "# Python\nimport torch\ndef topk_routing(router_logits, experts, x, k=2):\n    # router_logits: Router 对该 token 在 N 个专家上的分数\n    probs = torch.softmax(router_logits, dim=-1)\n    topk_val, topk_idx = torch.topk(probs, k)\n    out = sum(experts[i](x) * w for i, w in zip(topk_idx, topk_val))\n    return out  # 只激活 k 个专家",
  "codeNotes": [
    "真实实现含负载均衡（aux loss 或 aux-loss-free 偏置）与 capacity 限制（每个专家单批最多处理多少 token，超出则 drop/溢出）；示例省略了这些以保证可读性。",
    "Shared Expert 常额外常驻（每个 token 都走），用于吸收通用特征，减少路由专家的负担、提升稳定性。",
    "topk 仅取分数，真实还要乘以 router 门控权重（gating）并做归一，示例用 softmax 概率作权重已隐含此意。"
  ],
  "complexity": "单 token 算力 O(K·d²)（K 个专家各做一次 FFN，d 为隐藏维），与专家总数 N 无关；总参数 O(N·d²)。通信/调度开销随专家并行策略变化：若专家分布到多卡，Top-K 路由会带来 all-to-all 通信（把 token 送到持有对应专家的卡），这是 MoE 训练/推理的主要系统开销。激活比 K/N 越小，参数/算力解耦越彻底，但也越依赖均衡与通信效率。",
  "followUps": [
    {
      "question": "Total Parameters 与 Active Parameters 区别？",
      "answer": "Total 是所有专家参数之和（含未激活的），Active 是单个 token 实际经过的专家参数；MoE 靠 K≪N 让 Active≪Total。例如 DeepSeek-V3 Total≈671B、Active≈37B，激活比约 1/18；Mixtral 8x7B 每 token 激活 2/8 专家参数。"
    },
    {
      "question": "Router 如何训练？",
      "answer": "Router 是与主网络端到端反向传播的线性层，权重随梯度更新；同时受负载均衡约束（早期加 aux loss，新一代用 aux-loss-free 偏置）防止塌缩。Router 的损失信号来自主任务梯度 + 均衡项，均衡项只改路由分布、不污染主任务。"
    },
    {
      "question": "Expert Collapse 是什么？",
      "answer": "路由退化为总把 token 送少数专家，其余专家几乎不被用——容量浪费、热门专家过拟合、冷门专家学不好，模型实际容量远低于参数规模，是 MoE 训练最常见的失败模式。"
    },
    {
      "question": "为什么需要 Load Balance？",
      "answer": "不均衡会让热门专家成计算/通信瓶颈（尤其专家跨设备并行时），且多数专家学不好；负载均衡损失/偏置鼓励均匀路由，使全部专家都被有效利用，提升实际容量与训练稳定性。"
    },
    {
      "question": "Shared Expert 与 Routed Expert 区别？",
      "answer": "Shared Expert 对每个 token 都激活（捕获通用、跨领域特征），Routed Expert 仅被 Router 选中的 token 激活（捕获专门特征）。两者互补，共享专家能稳定基础能力、减轻路由负担，是新一代 MoE 的标配。"
    },
    {
      "question": "Capacity Factor 与 Token Dropping？",
      "answer": "Capacity Factor 限制每个专家单批最多处理的 token 数（=因子×批大小/K）；超出的 token 被丢弃或溢出到共享专家/下一专家，防止单专家过载导致设备间负载倾斜与 OOM。设太小会丢信息，设太大则失去隔离意义，需按负载实测。"
    }
  ],
  "followUpAnswers": [
    "Total 是所有专家参数之和（含未激活的），Active 是单个 token 实际经过的专家参数；MoE 靠 K≪N 让 Active≪Total。例如 DeepSeek-V3 Total≈671B、Active≈37B，激活比约 1/18；Mixtral 8x7B 每 token 激活 2/8 专家参数。",
    "Router 是与主网络端到端反向传播的线性层，权重随梯度更新；同时受负载均衡约束（早期加 aux loss，新一代用 aux-loss-free 偏置）防止塌缩。Router 的损失信号来自主任务梯度 + 均衡项，均衡项只改路由分布、不污染主任务。",
    "路由退化为总把 token 送少数专家，其余专家几乎不被用——容量浪费、热门专家过拟合、冷门专家学不好，模型实际容量远低于参数规模，是 MoE 训练最常见的失败模式。",
    "不均衡会让热门专家成计算/通信瓶颈（尤其专家跨设备并行时），且多数专家学不好；负载均衡损失/偏置鼓励均匀路由，使全部专家都被有效利用，提升实际容量与训练稳定性。",
    "Shared Expert 对每个 token 都激活（捕获通用、跨领域特征），Routed Expert 仅被 Router 选中的 token 激活（捕获专门特征）。两者互补，共享专家能稳定基础能力、减轻路由负担，是新一代 MoE 的标配。",
    "Capacity Factor 限制每个专家单批最多处理的 token 数（=因子×批大小/K）；超出的 token 被丢弃或溢出到共享专家/下一专家，防止单专家过载导致设备间负载倾斜与 OOM。设太小会丢信息，设太大则失去隔离意义，需按负载实测。"
  ],
  "pitfalls": [
    "以为 MoE 单 token 算力随总专家数 N 增长（错：只随激活数 K；扩大 N 主要增的是参数/显存，不是每 token 算力）。",
    "忽视负载均衡，导致 Expert Collapse 或部分专家过载；或混淆 Shared Expert（每 token 都激活、吸收通用特征）与 Routed Expert（仅被选中 token 激活）。",
    "（事实核查·2025）过时设定：Mixtral 8x7B 是 8 专家 Top-2；而 DeepSeek-V3 已是 256 路由专家 + 1 共享专家、每 token Top-8，并采用 aux-loss-free（偏置做均衡）。面试按最新配置答，别把两者混为一谈。"
  ],
  "beginnerSummary": "普通大模型每一层只有一个\"全连接\"大脑，所有文字都过它，参数与算力同比例涨。MoE 把这一层换成好几个\"专家\"和一个\"调度员\"（Router）：每个字只交给最相关的两三个专家处理，其他专家歇着。所以模型总参数可以堆得很大（专家多），但处理任意一个字只动用其中一小撮（激活参数小），算起来并不比小模型慢多少。难点在于调度员不能\"偷懒\"总找同一两个专家（叫 Expert Collapse），所以训练时要加\"均衡损失\"或用偏置机制逼它雨露均沾，同时给每个专家设\"接待上限\"（Capacity Factor）防止爆单。",
  "prerequisites": [
    "FFN/前馈层是 Transformer 的主要参数与算力来源，MoE 用\"多专家\"替换它实现稀疏化。",
    "Top-K 选择使得每 token 只激活部分专家，从而解耦总参数与激活参数。",
    "训练可加负载均衡约束（aux loss 或 aux-loss-free 偏置），防止路由塌缩到少数专家。"
  ],
  "workedExample": [
    "每层 64 专家、Top-2：每 token 只算 2 个专家前向，总参数随 64 增（容量大），但单 token FLOPs 只随 2 增（算力小），典型 K/N=1/32。",
    "DeepSeek-V3：总参数约 671B、每 token 激活约 37B（256 路由专家选 Top-8 + 1 共享专家），激活比约 1/18；用偏置机制把 256 个专家的负载方差压到很低，token 丢弃率近 0。",
    "对比 Mixtral 8x7B：8 专家 Top-2，每 token 激活 2/8=1/4 的专家参数，是更早期的经典配置，激活比远高于 V3。"
  ],
  "lineByLine": [
    "Router 给当前 token 在 N 个专家上打分数（经线性层 + softmax 得到 N 路概率）。",
    "取 Top-K（如 K=2 或 K=8）激活对应专家，其余专家本轮不计算、不占算力。",
    "只执行被选中 K 个专家的前向（各做一次 FFN），未选中专家完全跳过。",
    "把 K 个专家输出按路由权重（softmax 概率）加权聚合，得到该层输出。",
    "总参数随 N 增长（专家多），单 token 算力随 K 增长（激活少）——Total≫Active 是 MoE 的核心恒等式。"
  ],
  "diagram": "MoE 单层:\ntoken -> Router(softmax) -> Top-K 专家\n         |- Expert_3 (激活)\n         |- Expert_7 (激活)\n其他专家 休眠\n输出 = 加权聚合\nTotal>>Active (K<<N)"
};
