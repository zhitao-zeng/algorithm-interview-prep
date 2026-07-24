export default {
  "kind": "concept",
  "id": "rvq",
  "category": "语音大模型",
  "difficulty": "Medium",
  "title": "残差向量量化 RVQ",
  "prompt": "什么是残差向量量化（RVQ）？为什么语音 codec 要用多层码本？",
  "quickAnswer": "RVQ 用多个码本逐级量化：第1个码本量化原始向量，后续每个码本量化“前一级的残差”，逐级逼近。多层码本能用较少比特表达高保真声音，并可按层近似看作‘从粗到细’；但‘首层语义、后续声学’并非 RVQ 天然属性，需专门训练（如 SpeechTokenizer 的层级解耦）才出现。",
  "approach": "RVQ 用多个码本逐级量化：第1个码本量化原始向量，后续每个码本量化“前一级的残差”，逐级逼近。多层码本能用较少比特表达高保真声音，并可按层近似看作‘从粗到细’；但‘首层语义、后续声学’并非 RVQ 天然属性，需专门训练（如 SpeechTokenizer 的层级解耦）才出现。",
  "explanationFocus": "RVQ = 串行残差量化；多层码本换高保真与分层语义。",
  "bruteForce": "单层 VQ 要么码本巨大（指数爆炸）要么保真度低。",
  "derivation": [
    "单层 VQ 要覆盖高维声学空间需要海量码本，不现实。",
    "RVQ 把“难表达的残差”交给下一层更小码本，逐级细化。",
    "普通 RVQ 逐层量化残差、仅最小化重建误差，并不天然学习‘语义/声学’分层；‘首层偏语义、后续补声学’需专门设计（如 SSL semantic target、HuBERT/WavLM 蒸馏、层级解耦损失，如 SpeechTokenizer），并非 RVQ 的天然属性。"
  ],
  "invariant": "各层码本容量固定，重建误差随层数单调下降。",
  "walkthrough": "x→码本1最近向量→残差 r1→码本2最近→r2… 重建 = Σ 各层中心。",
  "edgeCases": [
    "码本崩溃：某层某些 entry 从不被选，需 codebook reset。",
    "层间耦合：上层依赖下层残差，推理须按顺序。",
    "比特预算：层数×log2(码本) 决定总码率。"
  ],
  "code": "# Python\ndef rvq_encode(x, codebooks):\n    residuals = x.clone()\n    codes = []\n    for cb in codebooks:                 # 多层码本串行\n        idx = cb.nearest(residuals)      # 当前层量化\n        codes.append(idx)\n        residuals = residuals - cb.centroid(idx)   # 残差留给下一层\n    return codes                         # 每层一个离散码",
  "codeNotes": [
    "训练常用梳状量化+码本损失避免崩溃。",
    "层级数决定保真度/码率权衡。"
  ],
  "complexity": "编码 O(L·T·K)（L 层、T 帧、码本 K），解码同样量级，远小于单层巨码本 K^L。",
  "followUps": [
    {
      "question": "为什么 RVQ 第1层常被当作语义 token？",
      "answer": "第1层捕捉信号主成分/最大方差方向，对内容（音素/语义）最敏感，而高频声学细节留在残差层，因此第1层天然近似语义。"
    },
    {
      "question": "RVQ 与 VQ-VAE 什么关系？",
      "answer": "SoundStream/EnCodec 用残差 VQ 作为 VAE 的离散瓶颈：编码器出连续向量，RVQ 离散化，解码器由离散码重建波形。"
    }
  ],
  "followUpAnswers": [
    "用 kmeans 初始化码本中心。",
    "增加层数可在同码率下提升重建质量。"
  ],
  "pitfalls": [
    "单层 VQ 码本过大导致训练不稳定。",
    "忽略残差顺序，推理无法并行各层。"
  ],
  "beginnerSummary": "向量量化(VQ)就是把一个向量“取整”到离它最近的那个标准向量（码本里的一个点），用一个编号表示。残差向量量化(RVQ)做了件聪明的事：先用第 1 个码本取整，算出“还差多少”（残差），再用第 2 个码本去取整这个残差，如此层层递进。这样少量编号就能高精度地表示声音。而且第 1 层近似“说了什么”，后面层补“声音细节”。",
  "prerequisites": [
    "向量量化=用有限码本近似连续向量。",
    "残差=原始减去预测后的“剩余误差”。",
    "多层近似能逐步逼近高保真。"
  ],
  "workedExample": [
    "x 经码本1得中心 c1，残差 r1=x−c1；r1 经码本2得 c2…",
    "重建 x̂ = c1 + c2 + c3，层数越多越像原声。"
  ],
  "lineByLine": [
    "初始化残差为原始向量 x。",
    "对每一层码本，找最近中心并记录索引。",
    "用该中心近似，更新残差 = 残差 − 中心。",
    "收集所有层索引作为离散 token；重建时求和各层中心。"
  ],
  "diagram": "x ─▶ [码本1]─idx1─▶ 残差 r1 ─▶ [码本2]─idx2─▶ r2 ─▶ ...\n重建: x̂ = c1 + c2 + ... + cL"
};
