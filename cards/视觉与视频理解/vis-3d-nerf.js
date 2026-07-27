export default {
  "id": "vis-3d-nerf",
  "kind": "concept",
  "category": "视觉与视频理解",
  "title": "3D 表示：NeRF / 高斯泼溅与新视角合成",
  "difficulty": "Hard",
  "prompt": "NeRF 与 3D 高斯泼溅（3DGS）如何实现新视角合成？它们与多视图几何有何关系？",
  "quickAnswer": "NeRF 用神经网络把 5D 坐标（位置+视角）映射为颜色与密度，通过体渲染从多视角图像学习连续辐射场，新视角即重新积分射线。3DGS 改用可微光栅化的各向异性高斯点云，渲染更快更清晰。二者都基于多视图几何的一致性约束（极几何/光度一致），但把显式几何换成可优化表示。",
  "code": "import torch\n\ndef volume_render(rgb, sigma, t):\n    # rgb:[N,3], sigma:[N], t:[N] 采样点沿射线\n    delta = t[1:] - t[:-1]\n    alpha = 1 - torch.exp(-sigma[:-1] * delta)\n    weights = alpha * torch.cumprod(1 - alpha, 0)\n    return (weights[:, None] * rgb[:-1]).sum(0)",
  "complexity": "O(N_samples·Rays) 体渲染",
  "beginnerSummary": "想从几张照片生成任意角度的新照片？NeRF 像是把一个场景\"烤\"进神经网络，3DGS 则像撒一把会发光的小椭球来拼场景。",
  "explanationFocus": "是什么：NeRF 以神经网络表示连续体积辐射场，3DGS 以可微高斯点云表示场景，二者目标都是多视图一致的新视角合成。",
  "approach": "NeRF 沿射线采样点、MLP 预测密度与颜色、体渲染积分；3DGS 优化每个高斯的位姿/协方差/颜色并用可微光栅化投影；训练信号均为多视角重建误差。",
  "derivation": [
    "为什么需要：传统 MVS 重建网格/深度难处理无纹理与反射，神经场更连续。",
    "怎么实现：用视图合成误差（光度一致）监督可微渲染。",
    "有什么代价：NeRF 每视角需大量射线采样、训练慢；3DGS 需良好初始化、易过拟合少视图。",
    "怎么评测：新视角 PSNR/SSIM/LPIPS 与训练时长。"
  ],
  "edgeCases": [
    "少视图或视角分布稀疏时几何歧义大。",
    "镜面/透明材质违反漫反射假设。",
    "大场景 3DGS 高斯数爆炸、显存吃紧。"
  ],
  "pitfalls": [
    "把 NeRF 当成显式 3D 网格，其实它是隐式场、难直接编辑。",
    "忽略相机标定误差，导致多视图对齐失败。"
  ],
  "prerequisites": [
    "相机模型与极几何",
    "可微渲染与体渲染积分"
  ],
  "workedExample": [
    "给定 50 张环绕椅子照片，NeRF 优化 MLP 后渲染任意方位椅子图。",
    "3DGS 用 SfM 点云初始化高斯，几分钟内达到更高 PSNR。"
  ],
  "lineByLine": [
    "import torch：张量库。",
    "def volume_render(rgb, sigma, t)：体渲染合成射线颜色。",
    "delta = t[1:]-t[:-1]：相邻采样点间距。",
    "alpha = 1-exp(-sigma*delta)：各段不透明度。",
    "weights = alpha * cumprod(1-alpha)：透射累乘得到合成权重，加权 rgb 求和。"
  ],
  "followUps": [
    {
      "question": "3DGS 相比 NeRF 的速度优势来自哪？",
      "answer": "高斯是可微光栅化的显式图元，无需沿射线密集 MLP 求值，按瓦片投影并行光栅化，渲染与训练都快一个数量级。"
    },
    {
      "question": "二者如何依赖多视图几何？",
      "answer": "都以已知相机位姿为前提，用极几何/光度一致性约束不同视角观测同一场景点，只是几何表示从网格变为场或高斯。"
    }
  ],
  "followUpAnswers": [
    "高斯是可微光栅化的显式图元，无需沿射线密集 MLP 求值，按瓦片投影并行光栅化，渲染与训练都快一个数量级。",
    "都以已知相机位姿为前提，用极几何/光度一致性约束不同视角观测同一场景点，只是几何表示从网格变为场或高斯。"
  ],
  "order": 7
};
