export default {
  "id": "me-switch",
  "category": "MoE 架构",
  "difficulty": "Medium",
  "title": "Switch Transformer 单专家路由",
  "prompt": "Switch Transformer 如何通过每个 token 只选一个专家来把参数量与计算量解耦？",
  "quickAnswer": "Switch Transformer 把 MoE 每层的路由从“选 top-2 专家”改为“每个 token 只选概率最高的 1 个专家”，从而把每个 token 的前向计算量固定为 1 个专家，但总参数量仍是所有专家之和，实现参数量与训练/推理计算量解耦。",
  "approach": "核心思路是用一个线性 gate 对每个 token 算专家 logits，softmax 后取 argmax 得到唯一专家索引，token 只送入该专家 FFN；配合 capacity factor 与辅助负载均衡损失保证专家不被饿死。",
  "explanationFocus": "是什么：Switch Transformer 是 Google 2021 年提出的稀疏专家混合 Transformer，最关键改动是每层路由“每个 token 只激活一个专家”（switch routing），相比 GShard 的 top-2 路由把路由计算再减半。",
  "bruteForce": "朴素做法：不加路由，直接把所有 token 送进同一个大 FFN，或者用 top-2/top-k 路由让每个 token 走多个专家再加权求和；计算量随专家数或 k 线性增长。",
  "invariant": "路由不变式：对于任意 batch，所有 token 的专家索引集合大小 <= num_experts，且当 capacity 足够时每个 token 必被分配到恰好一个专家并被处理。",
  "walkthrough": "前向执行追踪：1) 输入 x 经 gate 得 (T,E) logits；2) softmax 得 probs；3) argmax 得 expert_idx (T,)；4) 按 idx 把 token 分组送入对应专家 FFN；5) 用 probs 中对应权重（此处权重=1）汇总输出。",
  "complexity": "说明：参数量 O(E·d_ff·d_model) 随专家数 E 线性增长；单 token 计算量固定为 O(d_ff·d_model)（只过 1 个专家），与 E 无关；通信与批内专家分配均衡性相关，受 capacity factor 限制。",
  "beginnerSummary": "入门概览：普通 Transformer 每个 token 过同一个前馈网络。Switch Transformer 把前馈网络复制成很多“专家”，每次只让每个 token 挑一个最合适的专家处理，于是模型很大但每次只算一小部分，又快又省。",
  "diagram": "        token x (d_model)\n              |\n          gate (Linear)\n              |  logits (E,)\n          softmax + argmax\n              |\n        expert_idx (T,)\n         /      |      \\\n     E0        E1     E2 ...   each token -> 1 expert\n         \\      |      /\n         FFN_i (d_ff)\n              |\n          output (T, d_model)",
  "code": "import torch\nimport torch.nn as nn\n\nclass SwitchRouter(nn.Module):\n    def __init__(self, d_model, num_experts):\n        super().__init__()\n        self.gate = nn.Linear(d_model, num_experts)\n\n    def forward(self, x):\n        logits = self.gate(x)\n        probs = torch.softmax(logits, dim=-1)\n        expert_idx = torch.argmax(probs, dim=-1)   # 每 token 选 1 个专家\n        return expert_idx, probs",
  "derivation": [
    "为什么需要：稠密模型增大容量必须同比例增大计算量；MoE 想用很多参数但不想每次都算全部，Switch 进一步把每个 token 的专家数压到最小（1 个）以省算力。",
    "怎么实现：用一个线性 gate 把 token 映射到专家 logits，softmax 后 argmax 得到唯一专家索引；token 仅送入该专家 FFN，输出直接作为该 token 的贡献（权重视为 1）。",
    "有什么代价：单专家路由让负载均衡更敏感，容易出现专家塌缩/饥饿；需要辅助负载均衡损失与 capacity factor 约束，且 top-1 表达力弱于 top-2。",
    "怎么评测：在下游语言模型困惑度、预训练 loss、以及 token 级专家分配均衡度（各专家处理 token 数的方差）上评测，同时对比同算力下的稠密基线。"
  ],
  "edgeCases": [
    "某专家被选中的 token 数超过 capacity factor 上限，多余 token 被丢弃（dropped tokens）。",
    "所有 token 都涌向同一专家，造成专家塌缩，其余专家永不更新。",
    "batch 很小或序列很短时，专家分配统计噪声大，负载均衡损失不稳定。",
    "推理时专家分布和训练时不一致，导致路由质量下降。"
  ],
  "pitfalls": [
    "忘记加辅助负载均衡损失，训练后多数专家被闲置。",
    "capacity factor 设得过小导致大量 token 被丢弃，精度掉点。"
  ],
  "prerequisites": [
    "Transformer 自注意力与前馈网络（FFN）结构",
    "Softmax 与 argmax 路由、Mixture-of-Experts 基本概念"
  ],
  "workedExample": [
    "设 E=4 个专家，token 向量经 gate 得 logits=[2.1,0.3,-1.0,0.8]，softmax 后 argmax=0，该 token 进入专家 E0。",
    "一个 batch 有 8 个 token，路由结果索引为 [0,1,0,2,1,0,3,1]，则 E0 处理 3 个、E1 处理 3 个、E2 处理 1 个、E3 处理 1 个。"
  ],
  "lineByLine": [
    "nn.Linear(d_model, num_experts)：gate 把每个 token 映射到 E 个专家的未归一化分数。",
    "torch.softmax(logits, dim=-1)：沿专家维做 softmax，得到每个 token 对专家的分配概率。",
    "torch.argmax(probs, dim=-1)：取概率最大的专家作为该 token 的唯一去向（switch routing 的核心）。",
    "return expert_idx, probs：返回离散索引供后续分组，probs 用于（可选）加权或诊断。"
  ],
  "codeNotes": [
    "Switch 的关键是把 top-k（k>=2）换成 argmax（k=1），路由计算量与专家内计算量都减半。"
  ],
  "followUps": [
    {
      "question": "Switch 用 top-1 会不会比 top-2 损失表达力？",
      "answer": "会，单专家覆盖的信息更少，但论文表明在足够专家数下 top-1 用更大模型/更多数据仍能匹配甚至超过 top-2，且更省算力。"
    },
    {
      "question": "被丢弃的 token 怎么处理？",
      "answer": "直接让该 token 残差直通（skip connection）或置零，训练时通过 capacity factor 控制丢弃率，推理时通常关闭丢弃。"
    }
  ],
  "followUpAnswers": [
    "会，单专家覆盖的信息更少，但论文表明在足够专家数下 top-1 用更大模型/更多数据仍能匹配甚至超过 top-2，且更省算力。",
    "直接让该 token 残差直通（skip connection）或置零，训练时通过 capacity factor 控制丢弃率，推理时通常关闭丢弃。"
  ],
  "kind": "concept"
};
