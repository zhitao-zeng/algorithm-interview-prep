export default {
  "id": "mmd-unified-gen-understand",
  "kind": "concept",
  "category": "多模态模型",
  "title": "统一生成-理解多模态架构",
  "difficulty": "Hard",
  "prompt": "多模态大模型如何用一个模型同时完成“理解”（VQA/描述）与“生成”（文生图/文生视频）？以 Emu、Janus、Show-o 为例，自回归与扩散两条统一路径各有什么权衡？",
  "quickAnswer": "统一架构的核心是把图像也表示为可与文本共享同一序列空间的 token。自回归路径（Emu、Show-o）让 LLM 逐 token 预测图像/文本，理解与生成天然统一但图像保真度受限；扩散路径（Janus 双路）用独立 diffusion 解码器生成，质量高但与理解分支解耦。主流折中是共享语义编码器、分离轻量生成头。",
  "code": "import torch\n\nclass UnifiedMLLM(torch.nn.Module):\n    def __init__(self, encoder, llm, diffusion_head):\n        super().__init__()\n        self.encoder = encoder          # 图像/文本共享语义编码器\n        self.llm = llm                  # 自回归理解主干\n        self.diff_head = diffusion_head # 扩散生成头\n\n    def forward(self, tokens, task=\"understand\"):\n        h = self.encoder(tokens)\n        if task == \"understand\":\n            return self.llm(h)          # 理解：预测文本 token\n        return self.diff_head(h)        # 生成：去噪还原图像",
  "complexity": "O(N·D + M·T)",
  "beginnerSummary": "早期多模态模型只能“看”和“答”，不能“画”。统一架构想让一个模型既会看图回答问题，又会按文字画图或视频。做法是把图片也切成一串 token，和文字混在一起交给同一个大模型处理。",
  "explanationFocus": "是什么：统一生成-理解架构指用同一套模型参数与共享表征空间，同时完成多模态“理解”（如 VQA、图像描述、推理）与“生成”（如文生图、文生视频、图像编辑）任务，避免为两类任务维护两套独立模型。",
  "approach": "关键是把图像编码为可与文本对齐的 token：自回归路线把图像离散化为 visual token 交 LLM 预测（Emu/Show-o）；扩散路线保留独立扩散解码器但共享前置语义编码器（Janus）。训练上多采用多任务混合：理解用 next-token 损失，生成用扩散/回归损失，并用课程式数据调度。",
  "derivation": [
    "为什么需要：理解与生成分治导致部署成本高、跨任务迁移差，统一模型可共享表征、互相增强（生成提升语义对齐，理解提升细粒度可控性）。",
    "怎么实现：将图像映射为共享 token 空间；自回归统一用离散视觉 codebook + LLM 联合预测，扩散统一用 shared encoder + 解耦 diffusion head；多任务损失联合训练。",
    "有什么代价：自回归生成分辨率/保真度弱，扩散统一需额外解码器且两分支梯度可能冲突，训练数据与稳定性更难；推理时长随生成步数上升。",
    "怎么评测：在理解榜（MMBench、SEED）与生成榜（GenEval、T2I-CompBench）上同时报告，并测统一模型的指令一致性（生成是否遵循理解上下文）。"
  ],
  "edgeCases": [
    "图像与文本 token 长度悬殊，长图序列导致自回归生成显存爆炸。",
    "训练早期理解与生成损失量级不一致，一方主导梯度。",
    "生成分支需要高分辨率，但共享编码器为理解优化，语义与像素对齐错配。",
    "多任务数据配比失衡时模型退化为只擅长其中一项（mode collapse）。"
  ],
  "pitfalls": [
    "误把“共享 encoder”当作“完全统一”，实际仍是两个 head，评测时互不知晓。",
    "用理解数据主导训练，生成质量塌缩却只在生成榜暴露，易被忽略。"
  ],
  "prerequisites": [
    "多模态对齐与对比学习（CLIP 式表征）",
    "自回归语言模型与扩散模型基本原理"
  ],
  "workedExample": [
    "Emu：图像经 VIT 编码后离散化为 visual token，与文本拼接由 LLM 自回归预测，既答问又生成图。",
    "Janus：理解走 LLM 文本头，生成走独立扩散解码器，二者共享同一语义编码器实现“一脑两用”。"
  ],
  "lineByLine": [
    "encoder 把混合的图像/文本输入投影到同一语义空间，是理解-生成共享的基础。",
    "forward 中按 task 分支：understand 交给 LLM 做 next-token 预测，generate 交给 diffusion_head 做去噪，体现双路统一。"
  ],
  "followUps": [
    {
      "question": "为什么 Janus 不直接让 LLM 生成图像，而要单独 diffusion head？",
      "answer": "LLM 的离散 next-token 预测难以刻画高频像素细节，扩散在连续空间去噪保真度更高；共享 encoder 已提供语义条件，解耦 head 可在不破坏理解能力下获得高质量生成。"
    },
    {
      "question": "统一训练时如何平衡理解与生成损失？",
      "answer": "常用损失加权 + 课程调度：早期偏理解稳定表征，后期加生成；或按 token 类型分别归一化，防止长生成序列的回归损失淹没分类损失。"
    }
  ],
  "followUpAnswers": [
    "LLM 的离散 next-token 预测难以刻画高频像素细节，扩散在连续空间去噪保真度更高；共享 encoder 已提供语义条件，解耦 head 可在不破坏理解能力下获得高质量生成。",
    "常用损失加权 + 课程调度：早期偏理解稳定表征，后期加生成；或按 token 类型分别归一化，防止长生成序列的回归损失淹没分类损失。"
  ]
};
