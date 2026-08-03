export default {
  "id": "me-vs-dense",
  "category": "MoE 架构",
  "difficulty": "Medium",
  "title": "稀疏 MoE 与稠密（Dense）模型的权衡",
  "prompt": "什么场景下该用稀疏 MoE 而不是稠密模型？两者在参数量、算力和效果上怎么权衡？",
  "quickAnswer": "MoE 用“总参数量大、激活参数量小”换取同等算力下更大的模型容量：推理/训练每个 token 只激活少数专家，FLOPs 远小于同参数量的 dense 模型。代价是训练不稳定性、负载均衡与分布式通信复杂。当算力受限又想上规模、且数据/任务多样时选 MoE；追求简单稳定、设备受限时用 dense。",
  "approach": "从“参数-算力-效果”三角权衡：列出相同 FLOPs 预算下谁的容量更大、谁更易训练、谁通信更省，再按场景取舍。",
  "explanationFocus": "是什么：稀疏 MoE 与稠密模型的核心区别在于“是否每个 token 都用到全部参数”——dense 全用，MoE 只激活一小部分专家，因此在相同算力下可承载更多总参数。",
  "bruteForce": "直接堆 dense 大模型到目标参数量。参数量和算力同步暴涨，单卡/单步根本训练不动，成本不可接受。",
  "invariant": "核心不变量：在相同总参数量 N 下，MoE 每 token 激活参数 ~N·(k/E)，而 dense 激活全部 N；二者效果接近时 MoE 的单 token 计算量显著更小。",
  "walkthrough": "总参数 64B：dense 每 token 算 64B FLOPs；MoE 8 专家 top-2 则激活 ~16B，算力仅为 dense 的 1/4，却保留 64B 的容量。代价是需 8 卡放专家并承担 all-to-all。",
  "code": "def activated_params(total_params, num_experts, top_k):\n    # 返回每 token 实际激活的参数量（忽略门控/共享小量）\n    return total_params * top_k / num_experts\n\nprint(activated_params(64e9, 8, 2))   # 16e9，仅 dense 的 1/4",
  "complexity": "MoE 每 token 计算 O(k·d²/E·...) 远低于 dense 的 O(N)；但带来均衡损失、通信与调参成本，整体工程复杂度更高。",
  "beginnerSummary": "dense 像让全校老师同时给一个学生上课（贵但简单）；MoE 像只叫最相关的 2 位老师，省钱但需要一套排课系统把学生分到对的人。",
  "diagram": "           总参数 64B\ndense  ─▶ 激活 64B (全用)   算力 4×\nMoE 8专家top2 ─▶ 激活 16B  算力 1×  + 排课(通信)",
  "derivation": [
    "为什么需要：在算力/显存受限时，dense 无法把参数堆到很大；MoE 用稀疏激活把“容量”与“每次计算量”解耦，用相近算力换取更大模型。",
    "怎么实现：把前馈层换成 N 个专家 + 门控，每 token 只走 top-k 个专家；总参数 = 所有专家之和，激活参数 = k/E 比例，从而容量大、算力小。",
    "有什么代价：训练更易不稳定、需要负载均衡与容量机制，分布式下引入 all-to-all 通信与复杂工程，调参面更宽。",
    "怎么评测：固定训练 FLOPs 预算对比二者验证曲线与最终效果，并统计显存峰值、吞吐与推理延迟，综合判断性价比。"
  ],
  "edgeCases": [
    "小数据量场景：MoE 参数多易过拟合，dense 反而更稳更优。",
    "单卡/边缘设备：放不下多专家与通信栈，dense 更现实。",
    "任务高度同质（如单一领域）：专家专业化收益低，MoE 优势不明显。",
    "微调阶段：MoE 更易遗忘或路由漂移，常需冻结部分专家或特殊策略。"
  ],
  "pitfalls": [
    "只比总参数量就宣称 MoE 更强，忽视其激活 FLOPs 与 dense 不同、不可直接比参数量。",
    "低估训练不稳定性与通信成本，上线后才发现吞吐不如预期。"
  ],
  "prerequisites": [
    "Top-k 路由与专家并行",
    "FLOPs 与参数量的估算",
    "负载均衡与容量机制"
  ],
  "workedExample": [
    "总参数 64B：dense 每 token 计算 64B FLOPs；MoE(8专家,top2) 每 token 激活 64B×2/8=16B，算力仅 1/4。",
    "同样 100T FLOPs 训练预算：MoE 可承载约 4 倍于 dense 的总参数，验证集常更好，但需多卡与 all-to-all 支撑。"
  ],
  "lineByLine": [
    "def activated_params(total_params, num_experts, top_k)：定义按稀疏度算激活参数的函数。",
    "return total_params * top_k / num_experts：激活参数 = 总参数 × (每 token 选的专家数 / 专家总数)。",
    "print(activated_params(64e9, 8, 2))：算得 16e9，直观展示 MoE 仅用 dense 1/4 的算力。"
  ],
  "codeNotes": [
    "该估算忽略了门控与共享专家的少量参数，用于对比“容量 vs 激活算力”的阶量级关系，精确建模需加上路由与通信项。"
  ],
  "followUps": [
    {
      "question": "既然 MoE 算力更省，为什么不全用 MoE？",
      "answer": "因为 MoE 带来训练不稳定、需负载均衡、分布式通信复杂与调参成本；在数据少、设备受限或追求简单稳定的场景，dense 更稳更省心。"
    },
    {
      "question": "MoE 的参数量是“虚”的吗？",
      "answer": "不是虚的：总参数都真实存在并存储，只是每 token 仅激活一小部分，所以“容量大、单次算力小”是其本质优势，而非参数注水。"
    }
  ],
  "followUpAnswers": [
    "因为 MoE 带来训练不稳定、需负载均衡、分布式通信复杂与调参成本；在数据少、设备受限或追求简单稳定的场景，dense 更稳更省心。",
    "不是虚的：总参数都真实存在并存储，只是每 token 仅激活一小部分，所以“容量大、单次算力小”是其本质优势，而非参数注水。"
  ],
  "kind": "concept"
};
