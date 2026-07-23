export default {
  "kind": "concept",
  "id": "train-lora-principle",
  "category": "训练与微调",
  "difficulty": "Medium",
  "title": "LoRA 原理（低秩分解 ΔW=BA）",
  "prompt": "LoRA 如何用低秩分解实现高效微调？",
  "quickAnswer": "冻结原权重 W，注入可训练低秩矩阵 A、B 使 ΔW=BA，仅训练 A/B，推理时可合并回 W 无额外延迟。",
  "approach": "对目标层 W(d×k) 旁路加 B(d×r)·A(r×k)，r≪d；前向 y=Wx+BAx，仅 A/B 接收梯度，参数量从 dk 降到 r(d+k)。",
  "explanationFocus": "是什么：LoRA（Low-Rank Adaptation）假设适配时的权重变化 ΔW 是低秩的，故用两个小矩阵 A、B 的乘积近似 ΔW=BA，冻结原权重只训 A/B，大幅减参并可在部署时合并。",
  "bruteForce": "全量微调更新全部参数，显存需存优化器状态（Adam 的 2 倍动量）与梯度，70B 级模型单卡放不下、多任务需存整份副本。",
  "derivation": [
    "为什么需要：大模型全微调参数量与显存过大，且每任务存一份完整权重不经济。",
    "怎么实现：W0 冻结 requires_grad=False；注入 A~N(0,σ)、B=0（初始 ΔW=0 模型不变）；前向叠加 BA 分支，仅 A/B 优化。",
    "有什么代价：低秩假设不总成立，容量受 r 限制；部分任务需较大 r 或全量才达标；需选对注入层（q/v 等）。",
    "怎么评测：在下游基准对比全微调，看可训练参数占比与精度差距，验证合并后输出一致。"
  ],
  "invariant": "B 初始化为 0 使训练起点=原模型；仅训练 A/B；r≪min(d,k)（建议二次核对 r 取值与注入层）。",
  "walkthrough": "d=k=4096, r=16：全量更新 16.7M 参数，LoRA 仅训练 4096×16+16×4096=131K（约 1/128），初始输出与基座完全一致。",
  "edgeCases": [
    "r 过小容量不足，过大失去参数效率",
    "B 初始化非 0 会使起点偏离基座、训练不稳",
    "仅注入部分层可能欠适配"
  ],
  "code": "class LoRALinear:\n    def __init__(self, weight, r=16):\n        self.W = weight.requires_grad_(False)   # 冻结\n        self.A = torch.randn(r, weight.shape[1])\n        self.B = torch.zeros(weight.shape[0], r) # 初始 ΔW=0\n    def forward(self, x):\n        return x @ self.W.T + (x @ self.A.T) @ self.B.T",
  "codeNotes": [
    "B 置零保证训练第一步输出等同于原模型",
    "实际实现常用 scaling=α/r 控制增量幅度"
  ],
  "complexity": "训练参数量 O(r(d+k))，前向多一次 r 维瓶颈矩阵乘，开销极小。",
  "followUps": [
    {
      "question": "为什么 B 要初始化为 0？",
      "answer": "使初始 ΔW=BA=0，模型从原基座出发稳定训练，避免随机扰动破坏已学能力。"
    },
    {
      "question": "LoRA 一般注入哪些层？",
      "answer": "常注入注意力 q_proj/v_proj，强适配可加 k_proj/o_proj 与 MLP 各投影。"
    }
  ],
  "followUpAnswers": [
    "使初始 ΔW=BA=0，模型从原基座出发稳定训练，避免随机扰动破坏已学能力。",
    "常注入注意力 q_proj/v_proj，强适配可加 k_proj/o_proj 与 MLP 各投影。"
  ],
  "pitfalls": [
    "误把 W 也设为可训，失去 LoRA 省参意义",
    "A/B 缩放缺失导致增量幅度失控"
  ],
  "beginnerSummary": "LoRA 像给大模型装『小外挂』：原脑子冻住不动，只训两块小矩阵拼出『微调增量』，训完还能并回原权重，不掉速度。",
  "prerequisites": [
    "矩阵分解",
    "梯度与优化器状态",
    "Transformer 注意力层"
  ],
  "workedExample": [
    "取 W0(4096×4096)，注入 A(16×4096)、B(4096×16)",
    "前向 y=W0x+BAx，仅 A/B 约 131K 参数可训"
  ],
  "lineByLine": [
    "self.W.requires_grad_(False)：冻结底座",
    "self.B=zeros：保证初始无扰动",
    "forward 把 BA 分支加到原输出上"
  ],
  "diagram": "x ─▶[W 冻结]─┐\n    └▶[A]▶[B]─┴─▶ + ─▶ y"
};
