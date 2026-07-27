export default {
  "id": "mmd-video-gen-understand",
  "kind": "concept",
  "category": "多模态模型",
  "title": "视频生成式理解",
  "difficulty": "Hard",
  "prompt": "“用生成来辅助理解”的视频多模态模型是怎么回事？时序 token 与时空建模如何支撑视频的生成与理解统一？",
  "quickAnswer": "视频生成式理解把视频帧编码为带时间顺序的 token 序列，模型既能预测下一帧（生成）也能回答关于视频内容的问题（理解）。核心是时空 token 化与时序注意力：时间维建模运动与因果，空间维建模每帧内容。生成任务提供的运动先验反过来提升动作/事件理解。",
  "code": "import torch\n\ndef temporal_tokenize(frames, encoder, tube_size=4):\n    # frames: [B, T, 3, H, W]\n    b, t, c, h, w = frames.shape\n    tokens = []\n    for start in range(0, t, tube_size):\n        tube = frames[:, start:start + tube_size]      # 时空立方体\n        tokens.append(encoder(tube))                   # 编码为时空 token\n    return torch.cat(tokens, dim=1)                    # [B, T', D] 序列",
  "complexity": "O(T·N·D)",
  "beginnerSummary": "视频就是一堆按时间排列的图片。让模型既懂得“发生了什么”，又能“接着往下演”，关键是把一小段时间里的画面切成带顺序的 token，让模型学会时间上的规律。",
  "explanationFocus": "是什么：视频生成式理解指将视频同时用于“生成”（预测/补全未来帧、视频扩散）与“理解”（动作识别、时序问答、事件定位）的统一范式，借助生成任务学到的运动与因果先验增强理解能力。",
  "approach": "把视频切成时空 token（tube/temporal patch），用 3D 或分解的时空注意力建模；理解用时序池化+问答头，生成用帧预测/扩散解码。二者共享时空编码器，常用“遮挡帧重建”等生成式自监督作为预训练，使模型隐式学到运动与因果。",
  "derivation": [
    "为什么需要：纯理解模型缺乏运动与因果建模，难以回答“接下来会怎样”“谁先做的”等时序问题；生成任务天然提供时序监督。",
    "怎么实现：时空 token 化（tubelet/patch）+ 分解时空注意力或 3D 卷积；掩码帧重建、未来帧预测作为生成式预训练。",
    "有什么代价：视频 token 数量随帧数线性增长，长视频显存与时延压力大；时空注意力复杂度高。",
    "怎么评测：时序 VQA（NExT-QA、TVQA）、动作定位与视频生成质量（FVD）联合评估。"
  ],
  "edgeCases": [
    "长视频远超上下文窗口，需分段或压缩时序 token。",
    "相机运动与物体运动混淆，生成式重建可能只学到外观不变。",
    "高帧率与低帧率语义不一致，时序下采样丢失关键动作。",
    "静态镜头无运动信号，生成式时序监督失效。"
  ],
  "pitfalls": [
    "把空间 VIT 逐帧套用而忽略时间维，等于“看图说话”而非视频理解。",
    "用单帧问答数据评估视频模型，掩盖时序推理缺陷。"
  ],
  "prerequisites": [
    "视频时空建模（3D 卷积、时空注意力）",
    "多模态生成与自监督预训练"
  ],
  "workedExample": [
    "tubelet 编码：每 4 帧作为一个时空立方体编码为一个 token，既压缩序列又保留局部运动。",
    "掩码帧重建预训练：随机遮挡中间帧，让模型据前后帧生成被遮挡内容，隐式学到因果时序。"
  ],
  "lineByLine": [
    "temporal_tokenize 将视频按 tube_size 切成时空立方体，降低帧数带来的 token 爆炸。",
    "encoder(tube) 把每个时空立方体映射为单个 token，拼接成可输入 LLM 的时序序列。"
  ],
  "followUps": [
    {
      "question": "视频生成式理解与直接做视频问答有什么本质区别？",
      "answer": "前者在预训练/训练中显式优化生成（重建、预测未来帧），迫使模型建模运动与因果，因而对“接下来发生什么”类问题更强；后者只优化问答损失，易退化为关键帧分类。"
    },
    {
      "question": "如何处理超长视频的时序 token 爆炸？",
      "answer": "采用分段编码+时序记忆、token 合并（如时间维 pool/attention merge），或分层表示：底层高帧率低分辨率、高层低帧率高语义。"
    }
  ],
  "followUpAnswers": [
    "前者在预训练/训练中显式优化生成（重建、预测未来帧），迫使模型建模运动与因果，因而对“接下来发生什么”类问题更强；后者只优化问答损失，易退化为关键帧分类。",
    "采用分段编码+时序记忆、token 合并（如时间维 pool/attention merge），或分层表示：底层高帧率低分辨率、高层低帧率高语义。"
  ],
  "order": 24
};
