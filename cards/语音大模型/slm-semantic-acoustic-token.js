export default {
  "id": "slm-semantic-acoustic-token",
  "category": "语音大模型",
  "difficulty": "Hard",
  "title": "语义 token 与声学 token",
  "prompt": "语义 token 和声学 token 有什么区别？RVQ 残差矢量量化的层级结构如何同时表达两者？",
  "quickAnswer": "语义 token（如 HuBERT 第 2 层聚类）承载内容与说话人无关的高层语义；声学 token（如 EnCodec/SoundStream 的 RVQ 多层残差）逐层补全音高、音色、韵律等细节。RVQ 第 1 层近似语义，后续层为声学残差。",
  "code": "import torch\n\ndef rvq_levels(z, codebooks):\n    tokens, residual = [], z\n    for book in codebooks:                # 逐层码本\n        idx = (book - residual).pow(2).sum(-1).argmin(0)\n        tokens.append(idx)                # 每层一个 token\n        residual = residual - book[idx]   # 残差送下一层\n    return tokens                         # [lv0语义, lv1..声学残差]",
  "complexity": "时间 O(L*K*d)，空间 O(L*K*d)（L 层数，K 码本大小，d 维度）",
  "beginnerSummary": "语义 token 像'这句话说了什么'，声学 token 像'这句话怎么说的'；RVQ 第一层记大意，后面几层不断补细节，叠起来就能完整还原声音。",
  "derivation": [
    "为什么需要：单一种 token 要么丢了音色细节、要么训练不易对齐语义，分离语义与声学可兼顾内容可控性与音质。",
    "怎么实现：用 RVQ 把音频表征依次量化，第 1 层粗量化捕捉语义，残差继续被后续层量化得到声学细节。",
    "有什么代价：RVQ 层数越多码本越大、训练越难；语义层与声学层若用不同模型需额外对齐，推理要拼接多层 token。",
    "怎么评测：用重建音频的 STOI/PESQ 衡量声学保真，用语义相似度（如句嵌入余弦）衡量内容一致性。"
  ],
  "edgeCases": [
    "第 1 层量化过粗会丢失重音与情绪，需要更高层补偿。",
    "极低码率下残差层不足会导致明显音质下降与金属感。",
    "多语言混合语音在语义层可能错聚到错误簇，需多语言码本。",
    "静音段 RVQ 仍会占用 token，需要 VAD 过滤或静音特殊码。"
  ],
  "pitfalls": [
    "把 EnCodec 全部层都当成语学 token 喂给 LLM，导致词表过大、训练发散。",
    "用同一码本同时做语义与声学，忽略残差结构会使得高层语义被低层噪声污染。"
  ],
  "prerequisites": [
    "矢量量化（VQ）与码本训练",
    "自监督语音表征（HuBERT / wav2vec2）"
  ],
  "workedExample": [
    "同一句话不同人说：语义层 token 几乎一致，声学残差层 token 差异显著。",
    "只保留 RVQ 第 1 层重建语音可懂但音色中性，叠加 8 层后接近原音。"
  ],
  "lineByLine": [
    "tokens, residual = [], z：初始化输出列表与待量化残差。",
    "for book in codebooks：遍历每一层码本做一级量化。",
    "idx = ...argmin(0)：在码本中找与当前残差最近的向量下标。",
    "residual = residual - book[idx]：减去已量化部分，残差留给下一层。"
  ],
  "followUps": [
    {
      "question": "语义 token 一般取自哪种模型？",
      "answer": "常用 HuBERT 第 6~9 层或 wav2vec2 聚类得到，也可用语义 codec（如 SpeechTokenizer 的语义层），目标是内容相关而说话人无关。"
    },
    {
      "question": "RVQ 层数如何取舍？",
      "answer": "层数越多保真度越高但词表与序列长度增大、推理变慢；语音 LLM 常取前 1~2 层做语义、保留 7~8 层做声学，按音质与延迟需求折中。"
    }
  ],
  "followUpAnswers": [
    "常用 HuBERT 第 6~9 层或 wav2vec2 聚类得到，也可用语义 codec（如 SpeechTokenizer 的语义层），目标是内容相关而说话人无关。",
    "层数越多保真度越高但词表与序列长度增大、推理变慢；语音 LLM 常取前 1~2 层做语义、保留 7~8 层做声学，按音质与延迟需求折中。"
  ],
  "explanationFocus": "是什么：语义 token 编码'说了什么'的高层内容与语言信息，声学 token 编码'怎么说的'的音色、音高与韵律细节；RVQ 通过分层残差量化在同一码本体系中同时表达两者。",
  "approach": "用残差矢量量化的第 1 层逼近语义，后续层量化逐层残差逼近声学细节，从而在统一 token 空间里分离并重建内容与音色。",
  "kind": "concept"
};
