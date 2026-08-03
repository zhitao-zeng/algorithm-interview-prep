export default {
  "id": "vg-temporal",
  "category": "视频生成",
  "difficulty": "Medium",
  "title": "时序一致性与运动建模",
  "prompt": "视频生成里如何保证帧间时序一致性，常用哪些运动建模方式（光流、时序注意力、运动向量）？",
  "quickAnswer": "时序一致性要求相邻帧在内容、身份、运动上连续，常见破坏是闪烁与跳变。建模方式分三类：显式运动（光流/运动向量）直接估计帧间位移并 warp；隐式运动用时序注意力或 3D 卷积让网络自己学帧间关联；混合方法如 SVD 用潜空间时序注意力。实践中常加时序一致性损失（如光流重建损失）做约束。",
  "approach": "先区分显式/隐式运动，再讲训练时如何加一致性约束（光流循环一致性、帧差正则），最后说推理阶段 clip 重叠与光流引导的后处理。",
  "explanationFocus": "是什么：时序一致性是指生成视频相邻帧在物体身份、纹理与运动上保持连续，不出现闪烁、突变或物体凭空消失，是视频生成区别于图像生成的核心指标。",
  "bruteForce": "逐帧独立生成后用经典光流做帧间 warp 对齐，但生成阶段完全没考虑时序，运动不可控且容易在遮挡处裂开。",
  "invariant": "对任意相邻帧对 (f_t, f_{t+1})，由 f_t 经估计运动场 M warp 得到的 f̂_{t+1} 应与真实 f_{t+1} 在可见区域像素一致（循环一致性）。",
  "walkthrough": "以 256×256、16 帧视频为例：用 RAFT 估计相邻帧光流，尺度约 ±30 像素；施加光流重建损失权重 λ=10，使生成帧与 warp 帧的 L1 误差 < 0.02；最终 FVD 从 420 降到 210。",
  "code": "import torch\n\ndef flow_consistency_loss(f_t, f_tp1, flow_net, warp):\n    # f_t, f_tp1: [B,3,H,W]；flow_net 估计 f_t->f_tp1 光流\n    flow = flow_net(f_t, f_tp1)              # [B,2,H,W]\n    f_t_warped = warp(f_t, flow)            # 用光流把 f_t 变形\n    return torch.abs(f_t_warped - f_tp1).mean()",
  "complexity": "光流网络（如 RAFT）单次推理约 0.5–1 GFLOPs/帧，一致性损失为 O(H·W)，训练时每对相邻帧多一次 warp 前向，开销相对去噪主干很小。",
  "beginnerSummary": "就像翻书动画，如果每一页的小人位置突然跳来跳去，看着就\"鬼畜\"；时序一致性就是保证小人每一页都平滑地挪一点点。",
  "diagram": "f_t ──flow_net──► flow ──warp──► f_t_warped\n │                                      │\n f_tp1 ────────────────────────────────┴── L1 一致性损失",
  "derivation": [
    "为什么需要：逐帧独立生成会产生闪烁和物体跳变，观感崩坏。",
    "怎么实现：用光流/运动场建模帧间位移并做 warp，或在潜空间用时序注意力隐式关联帧。",
    "有什么代价：显式光流在遮挡、大运动处失效；隐式方法显存与计算更高。",
    "怎么评测：FVD 加帧间光流误差、身份一致性与人工评分。"
  ],
  "edgeCases": [
    "遮挡区域 warp 后无对应像素，需用有效性掩码屏蔽损失。",
    "大位移超过光流估计范围会产生撕裂。",
    "静止镜头（零光流）易让模型偷懒输出全黑或重复帧。"
  ],
  "pitfalls": [
    "只用图像级 L1 一致性忽略外观变化会过度平滑。",
    "光流监督标签噪声大时反而误导生成。"
  ],
  "prerequisites": [
    "光流估计（RAFT/PWC-Net）",
    "图像扩散基础",
    "warping 与可微采样"
  ],
  "workedExample": [
    "对 16 帧说话人视频，估计每对相邻帧光流，嘴部位移约 5–15 像素，加一致性损失后嘴形不再闪烁。",
    "在 512×512、8 帧场景里，遮挡处用 forward-backward 一致性掩码把 12% 像素排除出损失。"
  ],
  "lineByLine": [
    "def flow_consistency_loss(f_t, f_tp1, flow_net, warp)：定义光流一致性损失函数。",
    "flow = flow_net(f_t, f_tp1)：用光流网络估计从 t 到 t+1 的位移场。",
    "f_t_warped = warp(f_t, flow)：按光流把第 t 帧变形到 t+1 视角。",
    "return torch.abs(f_t_warped - f_tp1).mean()：比较 warp 结果与真实帧的平均绝对误差作为损失。"
  ],
  "codeNotes": [
    "warp 通常用网格采样（grid_sample），需保证光流坐标在 [-1,1] 归一化范围。"
  ],
  "followUps": [
    {
      "question": "潜空间时序注意力与光流监督怎么选？",
      "answer": "注意力更灵活、能捕捉非刚性长程运动但显存高；光流监督直观、便宜但有遮挡/大运动局限，工程上常两者结合。"
    },
    {
      "question": "推理时如何提升长视频一致性？",
      "answer": "用重叠片段（overlap blending）或维护全局运动状态，相邻 clip 共享首/尾帧潜变量做衔接。"
    }
  ],
  "followUpAnswers": [
    "注意力更灵活、能捕捉非刚性长程运动但显存高；光流监督直观、便宜但有遮挡/大运动局限，工程上常两者结合。",
    "用重叠片段（overlap blending）或维护全局运动状态，相邻 clip 共享首/尾帧潜变量做衔接。"
  ],
  "kind": "concept"
};
