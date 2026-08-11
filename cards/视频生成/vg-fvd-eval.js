export default {
  "id": "vg-fvd-eval",
  "category": "视频生成",
  "difficulty": "Easy",
  "title": "FVD 与视频生成评测",
  "prompt": "FVD（Fréchet Video Distance）是怎么计算的，它衡量什么，使用与解读时有哪些坑？",
  "quickAnswer": "FVD 把真实与生成视频各用一个视频分类/I3D 网络提取特征，再假设两类特征服从高斯分布，计算它们均值与协方差的 Fréchet 距离（类似 FID）。它衡量两批视频在时序特征分布上的距离，越低越像真实视频。坑在于：依赖特定骨干（I3D）、对帧率/分辨率敏感、样本少时方差大、且与人类主观评分并非完全线性相关。",
  "approach": "先讲特征提取+高斯假设+Frechet 距离公式，再讲它与 FID 的关系，最后列使用陷阱（骨干、样本量、分辨率一致）。",
  "explanationFocus": "是什么：FVD 是视频版的 FID，通过预训练视频网络（常是 I3D）把视频映射到特征空间，比较生成集与真实集特征的高斯分布差异，用于自动衡量生成视频的\"真实感与多样性\"。",
  "bruteForce": "最朴素评测是让人逐帧看并打分，虽然准但贵且慢；或只用逐帧 IS/FID 完全忽略时间维度，会高估闪烁严重的视频。",
  "invariant": "若生成分布等于真实分布，则 FVD→0；同一批视频用相同骨干与相同预处理，FVD 应当可复现。",
  "walkthrough": "取 2048 段生成视频与 2048 段真实视频，各用 I3D（kinetics 预训练）在 10 帧 299×299 上提 400 维 logits 特征，计算 μ_g、Σ_g 与 μ_r、Σ_r，FVD = ||μ_g-μ_r||² + Tr(Σ_g+Σ_r-2(Σ_gΣ_r)^{1/2})，典型好结果 < 100。",
  "code": "import numpy as np\nfrom scipy.linalg import sqrtm\n\ndef frechet_distance(mu1, sigma1, mu2, sigma2):\n    diff = np.sum((mu1 - mu2) ** 2)\n    covmean = sqrtm(sigma1 @ sigma2)\n    return diff + np.real(np.trace(sigma1 + sigma2 - 2 * covmean))",
  "complexity": "特征提取 O(N·T·C·H·W)，N 为样本数；距离计算仅 O(d³)，d=400，可忽略；主要成本在跑 I3D 前向，约 N×10 帧×几 GFLOPs。",
  "beginnerSummary": "FVD 就像让一个\"懂视频的评委\"分别看真实片和 AI 片，把两批片的整体感觉记成两个\"特征画像\"，画像越接近说明 AI 片越逼真。",
  "diagram": "真实视频 ─► I3D ─► 特征 ─► 高斯(μr,Σr) ┐\n                                         ├─► Frechet 距离 = FVD\n生成视频 ─► I3D ─► 特征 ─► 高斯(μg,Σg) ┘",
  "derivation": [
    "为什么需要：人评贵且不可规模化，逐帧指标忽略时间一致性。",
    "怎么实现：视频骨干提特征→假设高斯→算 Fréchet 距离。",
    "有什么代价：依赖骨干与样本量，分辨率/帧率不一致即不可比。",
    "怎么评测：FVD 自身用人工对齐验证其与 MOS 的相关性。"
  ],
  "edgeCases": [
    "真实集与生成集分辨率/帧率不同直接算 FVD 无意义。",
    "样本 < 几百时协方差估计不稳，FVD 波动巨大。",
    "生成视频模式崩溃（全相似）会人为拉低 FVD 却观感差。"
  ],
  "pitfalls": [
    "用不同 I3D 权重（kinetics vs 自训）得到的 FVD 不能互比。",
    "只看 FVD 忽略 IS/人类评分，可能追求低 FVD 却丢多样性。"
  ],
  "prerequisites": [
    "FID 与高斯距离",
    "I3D/视频分类骨干",
    "协方差与矩阵平方根"
  ],
  "workedExample": [
    "模型 A FVD=120、模型 B FVD=90，在同样 I3D 与 2048 样本下可判 B 更真实。",
    "同一模型样本从 512 增到 4096，FVD 标准差从 ±15 降到 ±4，结果更稳。"
  ],
  "lineByLine": [
    "def frechet_distance(mu1, sigma1, mu2, sigma2)：计算两高斯分布的 Fréchet 距离。",
    "diff = np.sum((mu1 - mu2) ** 2)：均值差的平方和（中心偏移项）。",
    "covmean = np.linalg.sqrt(sigma1 @ sigma2)：协方差矩阵乘积的平方根。",
    "return diff + np.trace(sigma1 + sigma2 - 2 * covmean)：均值项加协方差差迹，得到 FVD。"
  ],
  "codeNotes": [
    "实际常用 scipy 的 sqrtm 而非直接 @ 后开方，因协方差需正定；为数值稳定可加小扰动 εI。"
  ],
  "followUps": [
    {
      "question": "FVD 和 FID 能直接比吗？",
      "answer": "不能，FVD 用视频骨干含时序特征、FID 用图像骨干，分布定义不同，只能各自横向比较。"
    },
    {
      "question": "除了 FVD 还看什么？",
      "answer": "IS/CLIPScore 看文本对齐、帧一致性与光流误差看时序、以及人工 MOS 做最终校验。"
    }
  ],
  "followUpAnswers": [
    "不能，FVD 用视频骨干含时序特征、FID 用图像骨干，分布定义不同，只能各自横向比较。",
    "IS/CLIPScore 看文本对齐、帧一致性与光流误差看时序、以及人工 MOS 做最终校验。"
  ],
  "kind": "concept"
};
