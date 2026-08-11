export default {
  "id": "me-shared-expert",
  "category": "MoE 架构",
  "difficulty": "Easy",
  "title": "共享专家",
  "prompt": "共享专家（shared expert）在 MoE 中起什么作用，为什么能减少路由负担？",
  "quickAnswer": "共享专家是一组对所有 token 都激活的专家，负责承载通用、可复用的知识；其余为按需路由的专家。这样每个 token 只需路由到少量“专用”专家，通用计算由共享专家统一完成，既减少路由压力又提升稳定性。",
  "approach": "核心思路是“通用 vs 专用”分离：把 FFN 拆成共享部分（每 token 必过）与路由部分（每 token 选少数专家），最终输出为两者之和，让路由只负责捕捉差异性知识。",
  "explanationFocus": "是什么：共享专家（shared expert）是 MoE 中的一种特殊专家，它不参与路由、对每一个 token 都执行，用来沉淀跨样本通用的特征变换，与稀疏路由专家互补。",
  "bruteForce": "朴素做法：所有专家都走路由，token 必须靠路由去“拼凑”通用与专用知识，路由负担重且通用模式在多个专家间重复学习、浪费容量。",
  "invariant": "结构不变式：对任意 token，共享专家的输出恒被加入最终表示；路由专家仅贡献被选中的一个子集，二者输出维度一致可直接相加。",
  "walkthrough": "前向流程：1) token 过共享专家得 h_shared；2) 路由选出 top-k 专用专家，各算 h_i；3) 加权/求和专用专家输出 h_route；4) 输出 = h_shared + h_route（可再接门控）。",
  "complexity": "说明：共享专家带来固定额外 O(d_ff·d_model) 计算（每 token 一次），但允许减少路由专家数或 k，整体往往在同等效果下更稳、通信更可控。",
  "beginnerSummary": "入门概览：把“大家都懂的常识”交给一个共享专家统一处理，路由专家只管“个性化”的部分。这样路由不用每次都从头拼通用知识，负担轻、还更稳。",
  "diagram": "        token x\n        /      \\\n shared expert   router -> top-k experts\n   (always on)        (sparse)\n        \\      /\n         add (h_shared + h_route)\n          |\n        output",
  "code": "import torch\nimport torch.nn as nn\n\nclass MoEWithShared(nn.Module):\n    def __init__(self, d_model, d_ff, num_experts, k=1):\n        super().__init__()\n        self.shared = nn.Linear(d_model, d_ff)        # 对所有 token 激活\n        self.experts = nn.ModuleList(\n            [nn.Linear(d_model, d_ff) for _ in range(num_experts)]\n        )\n        self.gate = nn.Linear(d_model, num_experts)\n\n    def forward(self, x):\n        h_shared = self.shared(x)                     # 共享专家, 每 token 必过\n        gate = torch.softmax(self.gate(x), dim=-1)    # 路由权重 [B, E]\n        idx = torch.topk(gate, k, dim=-1).indices     # 每 token 选中的 k 个专家 [B, k]\n        # 把所有专家输出堆成 [E, B, d_ff], 再用整数下标张量选取, 避免 ModuleList 张量索引\n        all_out = torch.stack([expert(x) for expert in self.experts])  # [E, B, d_ff]\n        h_route = torch.zeros_like(h_shared)\n        for r in range(k):\n            w = gate.gather(-1, idx[..., r:r+1])      # 第 r 槽路由权重 [B, 1]\n            h_route = h_route + w * all_out[idx[..., r]]   # 选中专家输出(带权重)累加\n        return h_shared + h_route",
  "derivation": [
    "为什么需要：纯路由 MoE 让通用知识在多个专家间重复学习、路由负担重且易不稳，需要把通用与专用解耦。",
    "怎么实现：固定一组共享专家对所有 token 执行，路由专家只负责差异性；最终输出为共享输出加路由输出之和。",
    "有什么代价：共享专家增加了每 token 的固定计算量（不再完全稀疏），且共享容量过大会挤压路由专家的差异化空间。",
    "怎么评测：在同参数/同算力下对比有无共享专家的精度、路由熵与训练稳定性，以及共享专家是否学到通用特征。"
  ],
  "edgeCases": [
    "共享专家容量过大，路由专家学不到差异化知识，退化为“共享为主”。",
    "共享专家与某路由专家功能重叠，造成冗余与参数浪费。",
    "k=0（完全不路由）时退化为纯共享，失去 MoE 稀疏性。",
    "共享专家未做归一化，训练时数值范围与路由输出不匹配。"
  ],
  "pitfalls": [
    "把共享专家也接入路由逻辑，违背“共享、必激活”的初衷。",
    "忽略共享专家带来的固定计算量，误以为仍是完全稀疏。"
  ],
  "prerequisites": [
    "MoE 路由与专家 FFN 结构",
    "残差/逐元素相加的表征融合"
  ],
  "workedExample": [
    "某层有 1 个共享专家 + 8 个路由专家、k=1：每 token 固定过共享专家，再额外过 1 个路由专家，输出相加。",
    "共享专家学到“基础语法变换”等通用特征，路由专家分别捕捉领域专用模式，路由熵下降、训练更稳。"
  ],
  "lineByLine": [
    "self.shared = nn.Linear(...)：定义对所有 token 都执行的共享专家。",
    "self.experts = nn.ModuleList(...)：定义按需路由的专用专家集合。",
    "torch.topk(self.gate(x), k, dim=-1).indices：为每 token 选出 k 个路由专家。",
    "gate.gather(-1, idx[..., r:r+1])：取对应槽位的路由权重，加权累加路由专家输出。",
    "h_shared + h_route：共享与路由输出逐元素相加，融合通用与专用知识。"
  ],
  "codeNotes": [
    "共享专家让 top-k 中的 k 可以更小而不损失通用能力，是“DeepSeekMoE”等现代架构的常见设计。"
  ],
  "followUps": [
    {
      "question": "共享专家会不会让模型变“稠密”、失去稀疏优势？",
      "answer": "会引入固定计算，但相比全部路由专家，它只占用一小部分容量，整体仍稀疏；换来更稳的路由与更好的通用表征，通常利大于弊。"
    },
    {
      "question": "共享专家和路由专家怎么分工？",
      "answer": "共享专家沉淀跨样本通用变换，路由专家捕捉 token/领域专用模式；实践中二者容量比例需调参平衡。"
    }
  ],
  "followUpAnswers": [
    "会引入固定计算，但相比全部路由专家，它只占用一小部分容量，整体仍稀疏；换来更稳的路由与更好的通用表征，通常利大于弊。",
    "共享专家沉淀跨样本通用变换，路由专家捕捉 token/领域专用模式；实践中二者容量比例需调参平衡。"
  ],
  "kind": "concept"
};
