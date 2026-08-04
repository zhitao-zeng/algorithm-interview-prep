export default {
  "id": "wm-genie",
  "category": "世界模型",
  "difficulty": "Hard",
  "title": "Genie 可玩世界模型",
  "prompt": "Genie 如何在仅有无标注视频的情况下，学习一个可供用户实时控制的可玩世界模型？",
  "quickAnswer": "Genie 先用无监督方式从视频反推出每一帧的“潜在动作”，再训练一个以（潜在动作 + 上一帧 latent）为条件的视频生成模型；推理时用户提供的动作作为潜在动作的代理，从而实时交互。",
  "approach": "分三阶段：潜在动作模型从相邻帧推断离散动作；视频 tokenizer 把帧编码为离散潜码；动力学模型以潜在动作和过去潜码为条件自回归生成下一潜码，再解码为像素。",
  "explanationFocus": "是什么：Genie 是一个“生成式可交互环境”模型，它从无标注视频中自发推断出潜在动作空间，并训练一个以动作为条件的视频生成动力学，使人类能用键盘/控制器实时“玩”这个学到的世界。",
  "bruteForce": "朴素做法：收集带标注动作的游戏数据，直接训练条件视频生成。缺点：需要昂贵动作标注，且难以覆盖长尾交互。",
  "invariant": "不变式：对相同潜在动作序列与相同初始帧，生成的未来轨迹在语义上应保持一致；潜在动作模型对同一次交互给出的动作标签应稳定。",
  "walkthrough": "1) 用潜在动作模型为视频标出离散动作；2) 用 VQ tokenizer 把每帧压成离散码本索引；3) 训练自回归动力学预测下一帧索引；4) 推理时把用户按键映射为潜在动作输入动力学；5) 解码器输出可观看的下一帧。",
  "complexity": "说明：训练包含动作推断、tokenize、动力学三段，计算量主要来自视频序列长度与码本规模；推理时只需自回归生成与解码，可做到近实时。",
  "beginnerSummary": "入门概览：Genie 像“看视频自学成才的游戏引擎”——它自己猜出视频里发生了什么操作，再让你用按键接着操控它学到的那个虚拟世界。",
  "diagram": "video frames ----> [latent action model] ----> a_t (discrete)\n     |                                            |\n     v                                            v\n[ VQ tokenizer ] --> z_t      [ dynamics model ] -+--> z_{t+1}\n                              (cond on a_t, z_t)\n                                                   |\n                                                   v\n                                            [ decoder ] --> frame",
  "code": "def infer_latent_action(frame_t, frame_t1, action_model):\n    # 从无标注相邻帧反推离散潜在动作\n    logits = action_model(frame_t, frame_t1)\n    return logits.argmax(dim=-1)",
  "derivation": [
    "为什么需要：带动作标注的交互视频稀缺且昂贵，而互联网海量无标注视频易得，需要一种无需标注也能学到“可控”动力学的方法。",
    "怎么实现：用潜在动作模型把相邻帧差异压缩成离散动作令牌，用 VQ-VAE 把帧编码成离散潜码，再用 Transformer 自回归建模“动作+历史潜码→下一张潜码”。",
    "有什么代价：潜在动作是可解释性有限的隐变量，用户动作到潜在动作的映射是启发式对齐；视频生成质量与帧率受自回归解码限制。",
    "怎么评测：让用户在线操控并主观评估“可玩性”，同时在下游任务（如用学得的表征做视频分类）上对比有/无动作条件的基线。"
  ],
  "edgeCases": [
    "视频中存在多智能体时，单一潜在动作难以刻画多方交互，推断动作会模糊。",
    "镜头切换或大幅抖动会让相邻帧差异不再对应“动作”，潜动作模型失效。",
    "用户真实按键与学到的潜在动作维度不对齐，需要映射层才能可控。"
  ],
  "pitfalls": [
    "把潜在动作误当成真实物理动作，它只是视频可预测性所需的压缩控制信号。",
    "过度依赖自回归解码导致长序列误差累积、画面逐渐漂移。"
  ],
  "prerequisites": [
    "VQ-VAE / 离散表征与码本机制",
    "自回归序列建模（Transformer / 因果卷积）"
  ],
  "workedExample": [
    "示例：用 2D 平台游戏录屏训练 Genie，用户之后可用方向键让学到的角色跳跃、移动。",
    "示例：将 Genie 学得的帧表征迁移到视频动作分类，作为预训练特征优于随机初始化。"
  ],
  "lineByLine": [
    "def infer_latent_action(frame_t, frame_t1, action_model): 定义从相邻帧反推潜在动作的函数。",
    "logits = action_model(frame_t, frame_t1) 动作模型输出每个离散动作的未归一化分数。",
    "return logits.argmax(dim=-1) 取分数最大的动作作为该帧的潜在动作标签。"
  ],
  "codeNotes": [
    "这里 argmax 得到的是离散潜在动作，后续动力学模型以它为条件，因此无需任何人工动作标注。"
  ],
  "followUps": [
    {
      "question": "潜在动作和用户真实按键如何对应？",
      "answer": "训练时用户按键作为潜在动作的代理（proxy），通过映射层或共享离散空间对齐，并非严格一一对应。"
    },
    {
      "question": "Genie 与 Dreamer 类模型的区别？",
      "answer": "Genie 从无标注视频无监督推断动作并做生成式视频，Dreamer 通常依赖环境真实奖励与动作训练 RSSM 做规划。"
    }
  ],
  "followUpAnswers": [
    "训练时用户按键作为潜在动作的代理（proxy），通过映射层或共享离散空间对齐，并非严格一一对应。",
    "Genie 从无标注视频无监督推断动作并做生成式视频，Dreamer 通常依赖环境真实奖励与动作训练 RSSM 做规划。"
  ],
  "kind": "concept"
};
