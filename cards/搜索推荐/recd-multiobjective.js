export default {
  "id": "recd-multiobjective",
  "kind": "concept",
  "category": "搜索推荐",
  "title": "多目标排序深化：多目标联合建模与帕累托前沿",
  "difficulty": "Hard",
  "prompt": "在短视频推荐中，如何联合建模完播、点赞、转发、关注等多个目标，并处理目标之间的冲突？",
  "quickAnswer": "多目标排序通常先为每个目标单独预估（共享底层表示），再通过融合层聚合；目标冲突时可用帕累托前沿寻找非支配解，或采用 ESMM/MMOE 等多任务结构显式解耦专家。线上一般用可学习权重或约束优化平衡长期与短期收益。",
  "code": "import torch\n\nclass MMOE(torch.nn.Module):\n    def __init__(self, n_experts=8, n_tasks=4):\n        super().__init__()\n        self.experts = torch.nn.ModuleList([torch.nn.Linear(64, 64) for _ in range(n_experts)])\n        self.gates = torch.nn.ModuleList([torch.nn.Linear(64, n_experts) for _ in range(n_tasks)])\n\n    def forward(self, x):\n        expert_out = [e(x) for e in self.experts]\n        stacked = torch.stack(expert_out, dim=1)        # [B, E, D]\n        outs = []\n        for gate in self.gates:\n            w = torch.softmax(gate(x), dim=-1)          # [B, E]\n            outs.append((w.unsqueeze(-1) * stacked).sum(dim=1))\n        return outs  # 每个目标的塔输入",
  "complexity": "O(B·E·D) per forward",
  "beginnerSummary": "推荐系统不只关心用户会不会点，还关心完播、点赞、转发等。一个模型同时学多个目标，既要准又要不互相拖累，这就是多目标排序。",
  "explanationFocus": "是什么：多目标排序是在同一套特征与表示上联合预估多个业务指标（完播/点赞/转发/关注等），并通过融合或解耦机制平衡目标间冲突的排序范式。",
  "approach": "先用共享底层（embedding + 特征交叉）产出统一表示，再为每个目标建独立塔；用 MMOE 的门控专家解耦目标间干扰，用 ESMM 借助全链路标签缓解样本选择偏差，最后用帕累托优化或可调权重融合。",
  "derivation": [
    "为什么需要：单一 CTR 目标会推高\"标题党\"，损害完播与关注，需要多目标刻画真实满意度。",
    "怎么实现：共享底层 + 多专家门控(MMOE) + 各目标塔；ESMM 用曝光→点击→转化链路联合训练；线上融合分数 = Σ w_i·p_i 或帕累托加权。",
    "有什么代价：目标互相冲突时权重难调、训练不稳定，多塔增加算力与上线复杂度。",
    "怎么评测：离线用各目标 AUC/GAUC 分别评估，线上用多指标 A/B（完播率、互动率、关注率）与长期留存。"
  ],
  "edgeCases": [
    "不同目标量级差异极大（关注远少于点击），需校准与负采样。",
    "新目标冷启无标签，需迁移或影子模型灰度。",
    "目标间负相关强时帕累托解不唯一，需策略选择。"
  ],
  "pitfalls": [
    "直接用固定权重求和，权重靠拍脑袋且随场景漂移。",
    "忽视目标间因果，把转发当独立目标导致刷量。"
  ],
  "prerequisites": [
    "多任务学习基础（shared-bottom / 多塔）",
    "排序模型 CTR 预估（DeepFM/DCN）"
  ],
  "workedExample": [
    "场景：某视频曝光后用户完播且点赞但没关注——多目标模型分别给出 p(完播)=0.9, p(点赞)=0.7, p(关注)=0.1。",
    "融合：score = 0.4·p完播 + 0.3·p点赞 + 0.3·p关注 = 0.60，与纯 CTR 模型排序不同，避免低质高点击内容。"
  ],
  "lineByLine": [
    "class MMOE：定义多门控混合专家模型，含专家子网络与每个任务一个门控。",
    "experts = ModuleList(...)：多个前馈专家共享输入，捕捉不同子空间模式。",
    "gates = ModuleList(...)：每个任务一个门控，输出对专家的 softmax 权重。",
    "forward：专家产出 stacked，按门控权重加权求和得到各任务塔输入。"
  ],
  "followUps": [
    {
      "question": "ESMM 如何解决样本选择偏差？",
      "answer": "ESMM 不直接用\"转化\"正样本，而是建模 p(点击)·p(转化|点击)=p(转化)，用全量曝光样本训练，避免只在点击样本上训转化模型带来的偏差。"
    },
    {
      "question": "帕累托前沿在推荐里怎么落地？",
      "answer": "训练多个权重组合得到一组非支配解，线上用约束优化（如保证完播不低于基线）或超网络按用户/上下文动态选权重。"
    }
  ],
  "followUpAnswers": [
    "ESMM 不直接用\"转化\"正样本，而是建模 p(点击)·p(转化|点击)=p(转化)，用全量曝光样本训练，避免只在点击样本上训转化模型带来的偏差。",
    "训练多个权重组合得到一组非支配解，线上用约束优化（如保证完播不低于基线）或超网络按用户/上下文动态选权重。"
  ],
  "order": 12
};
