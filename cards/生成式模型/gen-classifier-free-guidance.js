export default {
  "id": "gen-classifier-free-guidance",
  "kind": "concept",
  "category": "生成式模型",
  "title": "Classifier-Free Guidance",
  "difficulty": "Medium",
  "prompt": "Classifier-Free Guidance 是怎么工作的？条件 / 无条件联合训练、guidance scale 是什么，为何能提升保真度？",
  "quickAnswer": "CFG 在训练时按一定概率把条件（如文本）置空，使同一网络既能条件生成也能无条件生成。采样时把两者预测按 ε_cfg = ε_uncond + w·(ε_cond - ε_uncond) 线性组合，w 即 guidance scale。增大 w 让样本更贴合条件、保真度更高，但过度会牺牲多样性与产生伪影。",
  "code": "def cfg_predict(model, xt, t, cond, w=7.5):\n    eps_uncond = model(xt, t, cond=None)\n    eps_cond   = model(xt, t, cond=cond)\n    return eps_uncond + w * (eps_cond - eps_uncond)",
  "complexity": "O(2·H·W·C) 每步（双前向）",
  "beginnerSummary": "好比画家先凭空想象（无条件），再对照文字要求（条件）修改；CFG 把“自由发挥”和“按要求画”两种结果做加权混合，让成品更听话。",
  "explanationFocus": "是什么：Classifier-Free Guidance 是一种无需额外分类器、仅靠在条件/无条件之间插值来增强条件控制信号遵循度（fidelity）的采样技巧。",
  "approach": "训练时以概率 p_drop 随机丢弃条件，模型学会两套打分；采样时用公式把条件与无条件噪声预测做外推，w 控制“听话程度”。",
  "derivation": [
    "为什么需要：纯条件扩散对提示遵循弱，早期靠额外分类器梯度又贵又难训。",
    "怎么实现：随机置空条件联合训练；采样时 ε_cfg = ε_uncond + w(ε_cond-ε_uncond)。",
    "有什么代价：每步需两次前向（或批处理合并），w 过大降低多样性并产生过饱和/伪影。",
    "怎么评测：用 CLIP-score / 人工对齐度看遵循度，用 FID 与覆盖率衡量多样性折损。"
  ],
  "edgeCases": [
    "w=1 退化为纯条件生成，无引导增强。",
    "w 过高（如 >15）常见高对比度伪影与文字崩坏。",
    "条件为空时仍需走 uncond 分支，否则公式退化。"
  ],
  "pitfalls": [
    "以为必须训两个模型——其实同一网络靠 dropout 条件实现。",
    "把 w 设得越高越好——需在保真度与多样性间权衡。"
  ],
  "prerequisites": [
    "条件扩散训练",
    "噪声预测网络",
    "采样时外推技巧"
  ],
  "workedExample": [
    "训练时对 10% 文本条件置空，让模型具备 uncond 能力。",
    "采样第 t 步分别算 ε_cond（带“猫”）与 ε_uncond。",
    "取 w=7.5 合成 ε_cfg 并去噪，得到更清晰的猫。"
  ],
  "lineByLine": [
    "model(xt,t,cond=None) 得到无条件噪声预测。",
    "model(xt,t,cond=cond) 得到条件噪声预测。",
    "两者差乘 w 再叠加到 uncond 上，实现向条件方向的外推。"
  ],
  "followUps": [
    {
      "question": "CFG 与 classifier guidance 区别？",
      "answer": "classifier guidance 用额外分类器梯度，需训判别器且易崩；CFG 直接利用无条件预测，免分类器、更稳定。"
    },
    {
      "question": "w 怎么选？",
      "answer": "文生图常用 5–10，视频稍低；可随步数退火，前期大后期小以平衡结构与时序。"
    },
    {
      "question": "能否省掉两次前向？",
      "answer": "可把 cond/uncond 拼 batch 一次前向；或用主动学习挑选需引导的步数。"
    }
  ],
  "followUpAnswers": [
    "classifier guidance 用额外分类器梯度，需训判别器且易崩；CFG 直接利用无条件预测，免分类器、更稳定。",
    "文生图常用 5–10，视频稍低；可随步数退火，前期大后期小以平衡结构与时序。",
    "可把 cond/uncond 拼 batch 一次前向；或用主动学习挑选需引导的步数。"
  ]
};
