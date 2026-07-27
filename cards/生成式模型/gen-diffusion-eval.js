export default {
  "id": "gen-diffusion-eval",
  "kind": "concept",
  "category": "生成式模型",
  "title": "生成评测：FID / IS / CLIP-score / FVD",
  "difficulty": "Medium",
  "prompt": "生成评测里 FID / IS / CLIP-score / FVD 的原理与局限是什么？为什么还需要主观评测？",
  "quickAnswer": "IS 用分类器概率的熵衡量清晰度与多样性；FID 比较生成图与真实图在 Inception 特征空间的 Fréchet 距离，越近越好；CLIP-score 量文本-图像对齐；FVD 是视频版 FID（I3D 特征）。局限：都依赖特定编码器、对域偏移敏感、不反映细粒度语义；故需人工主观评测补足。",
  "code": "from scipy.stats import multivariate_normal as mvn\ndef fid(mu1, s1, mu2, s2):\n    diff = mu1 - mu2\n    cov = s1 + s2 - 2 * (s1 @ s2).sqrt()   # 简化 Fréchet\n    return diff @ diff + cov.trace()",
  "complexity": "O(d²) 特征协方差",
  "beginnerSummary": "自动指标像“机器阅卷”：FID 看整体像不像真图，CLIP 看图文对不对题，但它们都有盲区，最终还得人眼“复审”才靠谱。",
  "explanationFocus": "是什么：生成评测是用特征分布距离（FID/FVD）、条件对齐（CLIP-score）与分类熵（IS）等自动指标量化生成质量、多样性与一致性的方法集合。",
  "approach": "把图像/视频送预训练编码器取特征，计算生成与真实分布的距离（FID/FVD）或图文相似度（CLIP-score）；IS 单独用类别分布熵。结合人工打分覆盖语义与美学。",
  "derivation": [
    "为什么需要：人评贵且不稳，需可复现自动指标做迭代。",
    "怎么实现：取 Inception/I3D/CLIP 特征，算 Fréchet 距离或余弦相似。",
    "有什么代价：编码器偏差、对分辨率/域敏感；IS 不评真实感。",
    "怎么评测：指标间相关性检验 + 人机一致性（human agreement）。"
  ],
  "edgeCases": [
    "FID 对 batch 大小与样本数敏感，需足够样本。",
    "CLIP-score 高分不一定语义正确（语言偏置）。",
    "FVD 依赖 I3D 对运动刻画有限。"
  ],
  "pitfalls": [
    "仅看 FID 刷分可能导致过饱和/模式坍缩。",
    "跨域直接用 ImageNet 特征评测不靠谱。"
  ],
  "prerequisites": [
    "特征嵌入 / 表征",
    "协方差与 Fréchet 距离",
    "主观评测方法"
  ],
  "workedExample": [
    "取 10k 生成图与 10k 真实图送 Inception 取池化特征。",
    "算两集合均值与协方差，得 FID。",
    "文本对用 CLIP 编码算图文余弦相似得 CLIP-score。"
  ],
  "lineByLine": [
    "mu1/mu2 为两特征集合的均值向量。",
    "cov 项近似 Fréchet 协方差距离（简化）。",
    "返回均值差平方 + 协方差迹，值越小越像。"
  ],
  "followUps": [
    {
      "question": "FID 越低一定越好吗？",
      "answer": "不一定，可能靠记忆训练集或模式坍缩刷低，需要配合多样性与人工评测。"
    },
    {
      "question": "IS 的缺陷？",
      "answer": "IS 不比较真实分布，只衡量自身清晰+多样，无法检测偏离真实。"
    },
    {
      "question": "为何仍要主观评测？",
      "answer": "自动指标不捕捉美感、细粒度语义与连贯，需人评覆盖。"
    }
  ],
  "followUpAnswers": [
    "不一定，可能靠记忆训练集或模式坍缩刷低，需要配合多样性与人工评测。",
    "IS 不比较真实分布，只衡量自身清晰+多样，无法检测偏离真实。",
    "自动指标不捕捉美感、细粒度语义与连贯，需人评覆盖。"
  ]
};
