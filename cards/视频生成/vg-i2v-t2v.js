export default {
  "id": "vg-i2v-t2v",
  "category": "视频生成",
  "difficulty": "Medium",
  "title": "I2V/T2V 条件生成",
  "prompt": "图像到视频（I2V）与文本到视频（T2V）在条件注入方式上有哪些差异，如何把单张图/文本变成一段连贯视频？",
  "quickAnswer": "T2V 用文本编码器（如 CLIP/T5）产出嵌入，作为交叉注意力的条件驱动整段视频内容与运动；I2V 额外用首帧（或参考图）作为结构约束，常通过 concat 到潜变量或 ControlNet 式适配器注入。两者都需在去噪网络中把条件传播到每一帧与时间步。关键难点是 I2V 既要忠实首图外观又要生成合理后续运动。",
  "approach": "先讲条件表示的来源（文本编码/图像编码），再讲注入位置（交叉注意力、通道 concat、adapter），最后对比 T2V 的自由度更高、I2V 约束更强。",
  "explanationFocus": "是什么：T2V 以文本为唯一条件生成视频，I2V 以一张图像为首帧条件、在保持该图内容的前提下生成后续运动；二者都是把\"条件信号\"编织进视频扩散去噪过程的 conditioning 技术。",
  "bruteForce": "最朴素 I2V 是把首图反复拼到每个噪声帧的通道里，让网络\"看着图去噪\"，但运动多样性差、容易每帧都长一样。",
  "invariant": "生成视频第 0 帧的潜变量解码后必须与条件图像在结构/外观上一致（I2V），且整段视频语义与文本嵌入对齐（T2V），条件信号在每一步去噪都可用。",
  "walkthrough": "以 I2V 为例：首图 768×432 经 VAE 编码为 [B,4,1,96,54]，沿时间维复制成 14 帧并与噪声 concat 成 8 通道；文本\"一只猫跳上桌子\"经 T5 编码为 77×1024 作为交叉注意力条件；25 步去噪后解码，首帧对原图 PSNR > 35dB。",
  "code": "import torch\n\ndef i2v_condition(x_noise, first_frame_latent, repeats=14):\n    # x_noise: [B,4,T,H,W] 噪声；first_frame_latent: [B,4,1,H,W]\n    ref = first_frame_latent.repeat(1, 1, repeats, 1, 1)   # 复制到每帧\n    return torch.cat([x_noise, ref], dim=1)                # 通道 concat → 8 通道",
  "complexity": "条件 concat 仅增加通道数（约翻倍参数量的一小部分），交叉注意力为 O(T·H·W·C·D)；T5 编码一次性 O(N·D²)，N=77，可忽略。",
  "beginnerSummary": "T2V 像你念一句\"小猫跳桌\"，AI 自己编画面；I2V 像你给 AI 一张照片说\"接着动\"，它必须让第一帧和你的照片一模一样再往后演。",
  "diagram": "T2V: 文本 ─►CLIP/T5► 嵌入 ─►交叉注意力─┐\n                                       ├─► U-Net 去噪 ─► 视频\nI2V: 首图 ─►VAE► 潜变量 ─►concat/适配 ─┘",
  "derivation": [
    "为什么需要：用户希望用文字或图片指定视频内容，纯随机生成不可控。",
    "怎么实现：文本用交叉注意力注入，图像用通道 concat 或 adapter 注入到去噪网络。",
    "有什么代价：强条件（I2V）限制运动多样性，弱条件（T2V）易出现语义漂移。",
    "怎么评测：文本对齐用 CLIPScore/人工，I2V 用首帧保真度与视频质量 FVD。"
  ],
  "edgeCases": [
    "首图含未见物体类别时 I2V 可能扭曲该物体以保持一致。",
    "文本与首图语义冲突（如\"着火的冰山\"配雪景图）时模型需在二者间权衡。",
    "极短提示词导致运动不明确、视频几乎静止。"
  ],
  "pitfalls": [
    "把首图条件只加到第 0 帧而后续帧失联，造成首帧后突然跳变。",
    "条件丢弃率（drop）设置不当导致训练-推理不一致。"
  ],
  "prerequisites": [
    "交叉注意力机制",
    "CLIP/T5 文本编码",
    "VAE 潜空间"
  ],
  "workedExample": [
    "T2V：提示\"海浪拍打礁石\"，T5 嵌入驱动 16 帧 576×320 视频，海浪周期约 2 秒。",
    "I2V：给定一张风景照，复制为首帧，生成 14 帧中云缓慢飘动，首帧与输入 PSNR 36dB。"
  ],
  "lineByLine": [
    "def i2v_condition(x_noise, first_frame_latent, repeats=14)：定义 I2V 的条件拼接。",
    "ref = first_frame_latent.repeat(1,1,repeats,1,1)：把首帧潜变量沿时间维复制成 T 帧。",
    "return torch.cat([x_noise, ref], dim=1)：在通道维拼接噪声与参考，形成 8 通道输入给 U-Net。"
  ],
  "codeNotes": [
    "在通道维 concat 是最轻量的条件注入，缺点是每帧都\"看\"同一张首图，可能抑制运动，故常配合时序注意力稀释。"
  ],
  "followUps": [
    {
      "question": "I2V 首帧一致性如何量化？",
      "answer": "用首帧解码后与输入图的 PSNR/SSIM，以及身份/外观相似度（如 ArcFace 对人脸）衡量保真度。"
    },
    {
      "question": "T2V 运动可控性差怎么办？",
      "answer": "引入运动先验（如光流条件、轨迹控制、MotionCtrl）或在文本外再加相机/姿态条件分支。"
    }
  ],
  "followUpAnswers": [
    "用首帧解码后与输入图的 PSNR/SSIM，以及身份/外观相似度（如 ArcFace 对人脸）衡量保真度。",
    "引入运动先验（如光流条件、轨迹控制、MotionCtrl）或在文本外再加相机/姿态条件分支。"
  ],
  "kind": "concept"
};
