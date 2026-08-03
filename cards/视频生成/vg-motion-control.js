export default {
  "id": "vg-motion-control",
  "category": "视频生成",
  "difficulty": "Hard",
  "title": "运动控制与姿态条件",
  "prompt": "如何对生成视频的运动做显式控制，比如给定人体姿态序列或相机轨迹来驱动内容？",
  "quickAnswer": "显式运动控制把运动信号（骨骼姿态、光流、深度、相机参数）作为额外条件注入扩散模型，常见做法是 ControlNet/适配器式分支或条件 concat。训练时用配对（视频, 运动条件）数据让网络学会\"按条件出画\"；推理时可换不同条件得到同一内容的不同运动。难点是条件保真度与内容自然度的平衡，以及配对数据稀缺。",
  "approach": "先讲运动条件的表示（骨骼/光流/相机），再讲注入方式（ControlNet、concat、交叉注意力），最后讲数据策展与保真-自然权衡。",
  "explanationFocus": "是什么：运动控制是在视频生成中引入显式运动条件（如人体骨架序列、光流场、相机轨迹），让模型按\"指定动作\"而非随机生成运动，属于可控生成（controllable generation）的一个方向。",
  "bruteForce": "最朴素控制是把目标姿态图直接叠加到每帧噪声输入，网络被迫看姿态，但外观与姿态解耦差、易把骨架\"画进\"画面。",
  "invariant": "生成视频解码后估计出的运动（姿态/光流）应与输入条件在关键点上一致（控制保真），同时内容外观保持自然不退化。",
  "walkthrough": "以姿态控制为例：输入 16 帧 18 关键点骨骼图（256×256），经轻量姿态编码器得 256 维条件；ControlNet 分支与 U-Net 中间层加和，训练用 5 万对（视频,骨骼）数据，推理姿态保真度（PCK@0.2）>0.9。",
  "code": "import torch\n\ndef motion_control_add(unet_feat, control_feat, scale=1.0):\n    # unet_feat, control_feat: [B,C,T,H,W] 同形状\n    return unet_feat + scale * control_feat   # 控制分支特征加回主网",
  "complexity": "ControlNet 类分支约为主干 1/3 参数，单次前向增加约 0.3× 成本；条件编码 O(T·H·W·D)；整体仍为去噪步数 × 主干，控制开销可控。",
  "beginnerSummary": "就像你拿着\"小人连线图\"让画家照着摆动作画动画：连线图规定手抬多高、脚迈哪，画家负责把肌肉衣服画得自然，动作完全听你的。",
  "diagram": "姿态/光流条件 ─► 条件编码器 ─► 控制分支\n                                      │ 加和\n视频扩散 U-Net ◄─────────────────────┘\n   │\n 去噪潜变量 ─► 解码 ─► 受控视频",
  "derivation": [
    "为什么需要：纯文本/随机生成的动作不可控，产品需要精确指定运动。",
    "怎么实现：把运动条件经编码器成特征，通过 ControlNet/concat 注入去噪网络。",
    "有什么代价：需配对训练数据、过强控制会牺牲自然度与多样性。",
    "怎么评测：控制保真度（PCK/光流误差）+ 视频质量 FVD + 人工。"
  ],
  "edgeCases": [
    "输入姿态含不合理关节角度（反关节）时模型可能崩出畸形。",
    "条件序列长度与生成帧数不一致需重采样对齐。",
    "多个人体相互遮挡时关键点歧义导致动作错乱。"
  ],
  "pitfalls": [
    "控制分支权重过大导致画面被骨架纹理污染。",
    "训练数据条件与视频未严格同步，推理时运动滞后。"
  ],
  "prerequisites": [
    "ControlNet / 适配器注入",
    "姿态估计（OpenPose/SMPL）",
    "条件扩散生成"
  ],
  "workedExample": [
    "跳舞视频：给同一段音乐配两套骨骼，生成两个不同舞步但同一人物外观。",
    "相机控制：输入前推+右移的轨迹，生成第一视角前进视频，轨迹误差 < 2 度。"
  ],
  "lineByLine": [
    "def motion_control_add(unet_feat, control_feat, scale=1.0)：定义控制特征融合函数。",
    "control_feat 来自条件编码器（姿态/光流）与主网同形状 [B,C,T,H,W]。",
    "return unet_feat + scale * control_feat：按 scale 把运动条件加回 U-Net 特征，实现可控去噪。"
  ],
  "codeNotes": [
    "scale 是控制强度超参，过大易把条件图痕迹留在画面，过小则控制失效，常取 1.0 并配合训练。"
  ],
  "followUps": [
    {
      "question": "ControlNet 与直接 concat 条件哪个好？",
      "answer": "ControlNet 不污染预训练主干、可控性强、易多条件组合；concat 更简单但需重训主干且容量有限。"
    },
    {
      "question": "没有配对数据怎么训运动控制？",
      "answer": "用现成视频跑姿态/光流估计自动造伪配对，或先用图像 ControlNet 再延伸到视频时序。"
    }
  ],
  "followUpAnswers": [
    "ControlNet 不污染预训练主干、可控性强、易多条件组合；concat 更简单但需重训主干且容量有限。",
    "用现成视频跑姿态/光流估计自动造伪配对，或先用图像 ControlNet 再延伸到视频时序。"
  ],
  "kind": "concept"
};
