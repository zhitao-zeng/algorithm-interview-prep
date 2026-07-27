export default {
  "id": "vis-optical-flow",
  "kind": "concept",
  "category": "视觉与视频理解",
  "title": "光流与动作识别：TSM/时序建模",
  "difficulty": "Medium",
  "prompt": "光流估计是什么？TSM 等时序建模方法如何在 2D 网络上高效加入时间信息？",
  "quickAnswer": "光流估计逐像素预测相邻帧的位移场，刻画运动；传统用亮度恒定假设（Horn-Schunck/RAFT 现多用相关卷积聚合）。TSM（Time Shift Module）不增加计算，通过在通道维把特征沿时间前后移位，让 2D 卷积\"看到\"邻帧，从而高效建模时序。",
  "code": "import torch\n\ndef tsm_shift(x, shift=1):\n    # x: [B,T,C,H,W]\n    b, t, c, h, w = x.shape\n    out = torch.zeros_like(x)\n    out[:, 1:, :c//3] = x[:, :-1, :c//3]\n    out[:, :-1, c//3:2*c//3] = x[:, 1:, c//3:2*c//3]\n    out[:, :, 2*c//3:] = x[:, :, 2*c//3:]\n    return out",
  "complexity": "O(T·H·W) 移位, 无额外卷积",
  "beginnerSummary": "光流就是\"每个像素往哪动了\"的矢量场；而 TSM 是个小技巧：把特征在时间上挪一挪，普通图像网络就能感知前后帧。",
  "explanationFocus": "是什么：光流是描述像素级运动的速度场；TSM 是一种零额外参数的时序偏移模块，使 2D 网络具备时序感受野。",
  "approach": "光流用相关性匹配前后帧块估计位移；TSM 把通道分三段分别前移、后移、不变，在 2D 卷积前混入邻帧信息，推理仍可用标准 2D 权重。",
  "derivation": [
    "为什么需要：动作识别需运动线索，纯 2D 网络缺时间维度。",
    "怎么实现：光流求解位移场；TSM 通道移位实现廉价时序传播。",
    "有什么代价：光流计算贵且对遮挡/大位移敏感；TSM 移位范围有限，长程依赖弱。",
    "怎么评测：动作分类精度、光流端点误差 EPE。"
  ],
  "edgeCases": [
    "遮挡区域无对应像素，光流不可观测。",
    "大位移超出匹配窗导致光流失效。",
    "TSM 通道切分不当会损失静态语义。"
  ],
  "pitfalls": [
    "把 TSM 当成完整时序建模，忽略其仅局部移位。",
    "直接用亮度恒定假设处理剧烈运动而不修正。"
  ],
  "prerequisites": [
    "2D 卷积与通道维度",
    "视频帧采样基础"
  ],
  "workedExample": [
    "RAFT 通过多尺度相关性迭代细化像素位移，得到稠密光流。",
    "TSM 网络在 ResNet 每个残差块前插入移位， Kinetics 上逼近 3D 网络却省算力。"
  ],
  "lineByLine": [
    "import torch：张量库。",
    "def tsm_shift(x, shift)：对 [B,T,C,H,W] 时空特征移位。",
    "out[:,1:,:c//3] = x[:,:-1,...]：前 1/3 通道从上一帧搬来（看过去）。",
    "out[:,:-1,c//3:2c//3] = x[:,1:,...]：中段从下一帧搬来（看未来）。",
    "out[:,:,2c//3:] = x：剩余通道保持当前帧不变。"
  ],
  "followUps": [
    {
      "question": "RAFT 相比传统光流好在哪？",
      "answer": "它用相关卷积聚合并通过递归细化迭代更新流场，对大位移与遮挡更鲁棒，且可端到端训练。"
    },
    {
      "question": "TSM 与 3D 卷积如何取舍？",
      "answer": "TSM 零额外参数、可复用 2D 预训练、推理快；3D 卷积建模更强但参数与算力高，需按延迟预算选择。"
    }
  ],
  "followUpAnswers": [
    "它用相关卷积聚合并通过递归细化迭代更新流场，对大位移与遮挡更鲁棒，且可端到端训练。",
    "TSM 零额外参数、可复用 2D 预训练、推理快；3D 卷积建模更强但参数与算力高，需按延迟预算选择。"
  ],
  "order": 6
};
