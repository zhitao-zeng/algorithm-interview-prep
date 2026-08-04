export default {
  "id": "slm-continuous-discrete",
  "category": "语音大模型",
  "difficulty": "Medium",
  "title": "连续与离散语音表征取舍",
  "prompt": "在语音大模型里，连续表征和离散 token 各有什么优劣？什么场景该选哪种？",
  "quickAnswer": "连续表征保真度高、训练信号平滑但难直接接入自回归 LLM 词表且序列长；离散 token 可复用文本 LLM 训练范式、序列紧凑但量化有损。实践中常以离散为主、连续作辅助对齐。",
  "code": "import torch\n\ndef pick_repr(z_cont, z_disc, task):\n    if task == 'synthesize':            # 合成要保真\n        return z_cont                   # 用连续表征\n    if task == 'reason':                # 推理要词表对齐\n        return z_disc                   # 用离散 token\n    return torch.cat([z_disc, z_cont])  # 混合",
  "complexity": "时间 O(d)，空间 O(seq*d)",
  "beginnerSummary": "连续表征像高清照片细节多但占地方，离散 token 像压缩表情包省空间却丢细节；要保真用连续，要接大模型推理用离散。",
  "derivation": [
    "为什么需要：语音既是连续信号又有可符号化的语义，单一表示无法兼顾保真与可学习性。",
    "怎么实现：连续用 encoder 隐向量直接接入适配器，离散用 VQ/codec 量化成 token 接入词表，也可两者拼接。",
    "有什么代价：连续表征序列长、难定义生成目标；离散量化不可逆有损、训练码本易坍缩。",
    "怎么评测：保真度看 STOI/PESQ，可学习性看下游 WER/准确率，综合看端到端 MOS。"
  ],
  "edgeCases": [
    "码本坍缩时离散表征多样性不足，需用码本重置或 kmeans 初始化。",
    "连续表征直接进 LLM 词表维度不匹配需 adapter 投影。",
    "混合表征拼接会增加序列长度与注意力开销。",
    "超低比特率下离散重建音质崩塌需提升码率或层数。"
  ],
  "pitfalls": [
    "把连续向量当作词表 token 直接做 cross-entropy，维度与语义都不对。",
    "只用语义离散 token 做 TTS，忽略声学细节导致音色丢失。"
  ],
  "prerequisites": [
    "表征学习与降维",
    "矢量量化与 codec"
  ],
  "workedExample": [
    "情感识别任务用连续 HuBERT 表征，比离散 token 高 3 个点。",
    "对话生成任务用离散 token，可直接套用 LLM 下一 token 预测损失。"
  ],
  "lineByLine": [
    "if task == 'synthesize'：合成任务优先保真。",
    "return z_cont：返回连续隐表征给声码器类解码器。",
    "if task == 'reason'：推理任务需要词表对齐。",
    "return torch.cat([z_disc, z_cont])：混合场景拼接两者取长补短。"
  ],
  "followUps": [
    {
      "question": "有没有既保真又离散的方案？",
      "answer": "可用更细的 RVQ 层数或更高码率 codec 逼近连续保真，或用结构化离散（如语音 token + 连续 prosody embedding）混合表示。"
    },
    {
      "question": "连续表征如何接入 LLM？",
      "answer": "通过线性 adapter 把连续向量投影到 LLM 隐空间并作为软 token 拼接，或用 Q-Former 压缩序列长度后再接入。"
    }
  ],
  "followUpAnswers": [
    "可用更细的 RVQ 层数或更高码率 codec 逼近连续保真，或用结构化离散（如语音 token + 连续 prosody embedding）混合表示。",
    "通过线性 adapter 把连续向量投影到 LLM 隐空间并作为软 token 拼接，或用 Q-Former 压缩序列长度后再接入。"
  ],
  "explanationFocus": "是什么：连续语音表征是 encoder 输出的稠密向量，保真度高；离散语音 token 是经矢量量化得到的符号序列，可对齐 LLM 词表。两者在保真度与可学习性上互补。",
  "approach": "以任务目标选择：需保真与细粒度控制用连续表征，需复用自回归 LLM 训练范式用离散 token，必要时混合拼接两者以取长补短。",
  "kind": "concept"
};
