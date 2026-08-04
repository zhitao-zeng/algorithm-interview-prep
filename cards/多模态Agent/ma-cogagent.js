export default {
  "id": "ma-cogagent",
  "category": "多模态Agent",
  "difficulty": "Hard",
  "title": "CogAgent 视觉语言 Agent",
  "prompt": "CogAgent 相比纯语言 Agent，是如何利用高分辨率视觉理解来提升 GUI 操作能力的？",
  "quickAnswer": "CogAgent 在视觉语言模型上引入高分辨率编码器与交叉注意力，使模型能读懂细小文字与密集控件的 GUI，再配合 Agent 微调让其输出界面动作，从而在网页与桌面自动化上显著超过仅靠 HTML/坐标的语言 Agent。",
  "approach": "关键是补上\"看清细节\"的能力：用双分辨率视觉编码（低分辨率保全局、高分辨率保文字细节）并通过交叉注意力融合，再把动作决策建模为文本生成，让模型既能看又能操作。",
  "explanationFocus": "是什么：CogAgent 是一个面向图形用户界面（GUI）操作的视觉语言模型，它在通用视觉语言模型基础上增强了对高分辨率屏幕截图的理解，能够识别界面中密集排布的小按钮和文字，并通过指令微调学会输出\"点击/输入/滚动\"等界面动作，从而像 Agent 一样直接操控网页与桌面应用。",
  "bruteForce": "纯语言 Agent 只能依赖网页 DOM 或坐标文本，遇到 Canvas、游戏或没有结构化标签的界面就束手无策，且读不懂截图里的细小说明文字。",
  "invariant": "模型对任意分辨率的输入都输出与界面语义一致的动作分布，高分辨率支路提供的细节只补充而非改变低频全局理解。",
  "walkthrough": "①输入高分辨率截图与用户指令；②双编码器分别提取全局与细节特征；③交叉注意力融合；④Agent 头生成动作序列；⑤在环境中执行并观测新状态迭代。",
  "complexity": "推理开销主要来自高分辨率图像编码与交叉注意力，单次前向近似 O(HW) 视觉 token，但比纯语言 Agent 省去解析 DOM 的预处理，端到端更稳定。",
  "beginnerSummary": "普通语言 Agent 像\"蒙着眼睛靠文字描述操作电脑\"，CogAgent 多了双高清眼睛，能看清界面上小字和按钮，所以更能直接看图操作。",
  "diagram": "low-res  +--> cross-attn --> action head\n           ^\nhigh-res +--+\nscreenshot --> dual visual encoder",
  "code": "class CogAgent(nn.Module):\n    def forward(self, image_hi, image_lo, text):\n        g = self.low_encoder(image_lo)\n        d = self.high_encoder(image_hi)\n        fused = self.cross_attn(d, g, text)\n        return self.action_head(fused)",
  "derivation": [
    "为什么需要：GUI 充满细小文字与密集控件，纯语言 Agent 缺乏视觉细节，对无结构化标签的界面无能为力。",
    "怎么实现：在视觉语言模型上加高分辨率编码器，与低分辨率全局编码通过交叉注意力融合，并用 GUI 动作数据微调使模型生成界面操作。",
    "有什么代价：高分辨率带来更多视觉 token 与算力开销；需要大规模 GUI 动作标注数据做微调，训练成本较高。",
    "怎么评测：在网页（Mind2Web 等）与桌面自动化基准上比成功率与步骤准确率，对照纯语言/DOM 方法的差距。"
  ],
  "edgeCases": [
    "高分辨率下长截图导致 token 超出上下文，需要分块或缩放策略。",
    "界面文字过密时 OCR 与模型识别都可能漏字，需置信度兜底。",
    "动态渲染页面在截图瞬间未加载完，识别到残缺界面。"
  ],
  "pitfalls": [
    "只上高分辨率却不改注意力机制，细节特征被全局平均稀释。",
    "用 DOM 文本当监督会泄漏标签结构，使模型在真实无标签界面失效。"
  ],
  "prerequisites": [
    "视觉语言模型（VLM）的基础架构与训练",
    "高分辨率图像编码与交叉注意力机制"
  ],
  "workedExample": [
    "网页订票：模型看清小字航班时间后点击筛选，再在表单填入日期提交。",
    "桌面设置：直接识别系统偏好里的密集开关并拨动，无需读辅助树。"
  ],
  "lineByLine": [
    "low_encoder 提供整页语义与布局，避免高分辨率只看到局部。",
    "high_encoder 专门保留按钮文字等细节，供交叉注意力取用。",
    "action_head 把融合特征映射为离散界面动作，实现从看到做。"
  ],
  "codeNotes": [
    "双编码器共享文本条件交叉注意力，保证视觉细节与指令对齐。"
  ],
  "followUps": [
    {
      "question": "高分辨率 token 太多怎么办？",
      "answer": "常用策略是动态分辨率、视觉 token 压缩或仅对检测区做高分辨，平衡细节与算力。"
    },
    {
      "question": "和 AppAgent 记忆式路线区别？",
      "answer": "CogAgent 靠模型自身视觉能力直接操作，AppAgent 靠探索记忆复用；二者可结合：用 CogAgent 当感知器、AppAgent 当记忆层。"
    }
  ],
  "followUpAnswers": [
    "常用策略是动态分辨率、视觉 token 压缩或仅对检测区做高分辨，平衡细节与算力。",
    "CogAgent 靠模型自身视觉能力直接操作，AppAgent 靠探索记忆复用；二者可结合：用 CogAgent 当感知器、AppAgent 当记忆层。"
  ],
  "kind": "concept"
};
