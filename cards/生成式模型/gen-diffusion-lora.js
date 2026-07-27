export default {
  "id": "gen-diffusion-lora",
  "kind": "concept",
  "category": "生成式模型",
  "title": "扩散模型微调：LoRA / DreamBooth",
  "difficulty": "Medium",
  "prompt": "扩散模型微调（LoRA / DreamBooth / 个性化）是怎么做的？低秩适配与过拟合陷阱分别是什么？",
  "quickAnswer": "DreamBooth 用少量图结合稀有 token 微调整个（或部份）U-Net 把特定主体绑定到标识符；LoRA 则冻结主干，只在注意力/线性层注入低秩矩阵 ΔW=AB 训练，参数量仅 1% 即可学风格/角色。过拟合陷阱：样本过少会过拟合背景、丧失多样性，需正则（如 prior preservation）与适中 rank。",
  "code": "class LoRALinear(nn.Module):\n    def __init__(self, w, r=4):\n        self.w = w; self.A = nn.Parameter(torch.zeros(w.in, r))\n        self.B = nn.Parameter(torch.zeros(r, w.out))\n    def forward(self, x):\n        return self.w(x) + (x @ self.A @ self.B) * 0.5",
  "complexity": "O(r·(in+out)) 额外参数",
  "beginnerSummary": "不想重训整个大模型，就只在关键层贴两张“小补丁”（低秩矩阵）教会它新风格或新角色，既快又不大改原能力。",
  "explanationFocus": "是什么：扩散模型个性化微调指用少量数据让预训练模型学会特定主体或风格，LoRA 以低秩适配高效实现，DreamBooth 以标识符绑定主体。",
  "approach": "冻结主干，LoRA 在 q/k/v/out 投影注入可训低秩对；DreamBooth 用稀有 token + 少量图微调并加 prior loss 防遗忘，两者可叠加（如 LoRA+DreamBooth）。",
  "derivation": [
    "为什么需要：全量微调贵且易忘，少样本个性化需高效方法。",
    "怎么实现：ΔW=BA 低秩分解，仅训 A,B；DreamBooth 加标识符与正则。",
    "有什么代价：rank 过大或过拟合会损泛化；太少样本绑定不牢。",
    "怎么评测：用主体相似度 + 提示遵循度 + 多样性综合衡量。"
  ],
  "edgeCases": [
    "rank 太小学不动，太大过拟合，常用 4–32。",
    "少样本无正则会“背”下背景而非学主体。",
    "多个 LoRA 可加权合并实现风格混合。"
  ],
  "pitfalls": [
    "以为 LoRA 零过拟合风险——样本少仍会过拟合。",
    "忽略 prior preservation 导致模型丧失原分布。"
  ],
  "prerequisites": [
    "低秩分解 / 矩阵分解",
    "扩散训练",
    "过拟合与正则"
  ],
  "workedExample": [
    "收集 5 张宠物照，赋予稀有词 “<pet>”。",
    "在 U-Net 注意力层挂 LoRA(r=8) 微调。",
    "用 “<pet> in studio” 生成多样新场景图。"
  ],
  "lineByLine": [
    "w 为冻结的原始权重，保持原能力。",
    "A、B 为可训低秩矩阵，初始化近零。",
    "forward 在原输出上叠加低秩增量，实现高效适配。"
  ],
  "followUps": [
    {
      "question": "LoRA 与全量微调怎么选？",
      "answer": "数据极少、求快、要可插拔选 LoRA；要深度改分布且资源足可全量。"
    },
    {
      "question": "DreamBooth 为何需 prior loss？",
      "answer": "防止模型把类名整体绑死，用生成先验样本正则保持原类多样性。"
    },
    {
      "question": "rank 设多少？",
      "answer": "风格类小 rank(4–8) 够，复杂主体/人脸用 16–32，过大易过拟合。"
    }
  ],
  "followUpAnswers": [
    "数据极少、求快、要可插拔选 LoRA；要深度改分布且资源足可全量。",
    "防止模型把类名整体绑死，用生成先验样本正则保持原类多样性。",
    "风格类小 rank(4–8) 够，复杂主体/人脸用 16–32，过大易过拟合。"
  ],
  "order": 12
};
