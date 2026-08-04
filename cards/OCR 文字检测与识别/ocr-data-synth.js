export default {
  "id": "ocr-data-synth",
  "category": "OCR 文字检测与识别",
  "difficulty": "Medium",
  "title": "OCR 数据合成与增广",
  "prompt": "在没有足量真实标注时，如何用合成数据与增广提升 OCR 模型泛化，需注意哪些分布偏差？",
  "quickAnswer": "用渲染引擎合成多字体/多语言文本图像并叠加背景、噪声、几何扰动做增广；关键是让合成分布贴近真实(字体、颜色、模糊、透视)，避免域gap导致过拟合合成样式。",
  "code": "import numpy as np\nimport cv2\n\ndef synth_text_image(text, font, bg, p=0.5):\n    \"\"\"合成一张含文本的图像并做随机增广\"\"\"\n    canvas = render_text(text, font, color=(0, 0, 0))\n    canvas = blend_background(canvas, bg)\n    if np.random.rand() < p:\n        canvas = cv2.GaussianBlur(canvas, (3, 3), 0)     # 运动/失焦模糊\n    if np.random.rand() < p:\n        canvas = perspective_warp(canvas, max_deg=15)     # 透视扰动\n    return canvas\n\ndef augment_batch(imgs, labels):\n    out = []\n    for im, lb in zip(imgs, labels):\n        out.append((random_color_jitter(erase_small(im)), lb))\n    return out\n",
  "complexity": "时间 O(合成+增广样本数)，空间 O(批图像)",
  "beginnerSummary": "没有真字帖就先“打印仿制字帖”练手：用电脑字体印在真实背景上，再故意弄模糊、歪一点，让模型见多识广，但别仿得太假否则考真卷就懵。",
  "derivation": [
    "为什么需要：真实标注昂贵且长尾字符稀缺，合成数据能低成本扩充规模与覆盖。",
    "怎么实现：渲染文本到随机背景，叠加模糊、透视、颜色抖动、擦除等增广，构造接近真实分布的训练样本。",
    "有什么代价：合成与真实存在域差距(纹理/光照/字形)，过度依赖合成会域偏移；增广过强可能破坏可读字符。",
    "怎么评测：在真实验证集上看精度，并用合成/真实混合比例的消融实验找最佳配比。"
  ],
  "edgeCases": [
    "罕见字符/符号无对应字体",
    "增广后字符不可读",
    "背景过于复杂淹没文本",
    "多语言混排字体缺失"
  ],
  "pitfalls": [
    "合成样式单一导致域gap",
    "增广概率过高破坏标签一致性",
    "直接用训练集分布外的字体"
  ],
  "prerequisites": [
    "数据增广",
    "域适应基础",
    "字体渲染"
  ],
  "workedExample": [
    "用 1000 种 Google 字体渲染英文+常见背景，模型在真实 ICDAR 上提升 4 个点。",
    "加透视扰动后模型对斜拍照片鲁棒，但扰动>30° 时字符失真反而掉点。"
  ],
  "lineByLine": [
    "def synth_text_image(text, font, bg, p): 合成入口。",
    "render_text: 用字体渲染黑字。",
    "blend_background: 贴到随机背景。",
    "随机模糊/透视增广提升真实性。"
  ],
  "followUps": [
    {
      "question": "如何缩小合成与真实的域差距？",
      "answer": "用真实图像做风格迁移/域随机化(随机光照、材质、畸变)，或在合成数据上做 GAN 精炼，再用少量真实标注微调。"
    },
    {
      "question": "增广强度怎么定？",
      "answer": "通过验证集消融，从弱到强扫描增广概率与幅度，选使真实集精度最高的配置，避免破坏字符可读性。"
    }
  ],
  "followUpAnswers": [
    "用真实图像做风格迁移/域随机化(随机光照、材质、畸变)，或在合成数据上做 GAN 精炼，再用少量真实标注微调。",
    "通过验证集消融，从弱到强扫描增广概率与幅度，选使真实集精度最高的配置，避免破坏字符可读性。"
  ],
  "invariant": "每个合成样本在返回前已完成背景混合，标签 text 与渲染内容一致；增广仅在可读性阈值内随机施加。",
  "walkthrough": "text='TikTok'，渲染黑字→贴街景背景→50% 概率高斯模糊→50% 透视旋转8°→返回图；标签仍为 'TikTok'，未因增改内容。",
  "kind": "code"
};
