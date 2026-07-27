export default {
  "id": "tts-eval-prosody",
  "kind": "concept",
  "category": "语音合成",
  "title": "TTS 评测与韵律自然度",
  "difficulty": "Medium",
  "prompt": "请说明 TTS 系统的评测方法，主观 MOS 与客观指标如何权衡，以及如何评价韵律自然度与可懂度？",
  "quickAnswer": "TTS 评测分主观与客观：主观以 MOS（平均意见分，5 分制）评自然度，常辅以 ABX 偏好测试；客观用 MCD（梅尔倒谱距离）、F0 包络误差、WER（把合成音频 ASR 转写看可懂度）、RTF（实时率）等。韵律自然度靠基频/能量/时长分布的统计相似度与听感打分，可懂度由 ASR-WER 与人工辨听共同衡量，二者需同时达标。",
  "explanationFocus": "是什么：TTS 评测是衡量合成语音‘像不像人、听不听得清、对不对味’的体系。主观评测以人类打分（MOS、AB 测试）为金标准，反映真实听感；客观评测用可计算的声学/语义指标（MCD、F0 RMSE、WER、RTF）做低成本自动化监控。韵律自然度关注音高、能量、节奏的拟真，可懂度关注内容是否被正确传达。",
  "approach": "核心思路是‘主观定标、客观监控、分维拆解’：用 MOS/ABX 确立上限与发布结论；用 MCD/F0 距离量化谱与韵律偏差；用 ASR 回环（WER）客观估计可懂度；把韵律拆成基频轮廓、能量包络、停顿与语速分布，分别与真人统计对比，定位‘机械感/平淡/错位’等具体缺陷。",
  "code": "import numpy as np\n\ndef mcd(mel_true, mel_pred, n_coeff=13):\n    # 梅尔倒谱距离：谱相似度客观指标\n    d = mel_true[:, :n_coeff] - mel_pred[:, :n_coeff]\n    return np.mean(np.sqrt(np.sum(d**2, axis=1))) * (10.0 / np.log(10.0)) * np.sqrt(2)\n\ndef intelligibility(wav, asr_model):\n    text = asr_model.transcribe(wav)                # 回环 ASR\n    return text                                      # 与原文比对得 WER -> 可懂度",
  "complexity": "O(T·D) 逐帧比对；主观评测为人工 O(样本数)，不可自动化",
  "beginnerSummary": "判断机器发音好不好，有两个办法：让人听打分（MOS，最权威但慢且贵），或用程序自动算差别（比如频谱距离、把合成语音再让识别器听一遍看有没有听错）。自然度看语调像不像真人，可懂度看有没有念错字，两者都要兼顾。",
  "derivation": [
    "为什么需要：模型损失（如 L1 mel）不等于听感，缺乏可靠评测就无法迭代与对比系统。",
    "怎么实现：主观用 ITU-T P.800 的 MOS 与 ABX 偏好测试；客观用 MCD、F0 RMSE、时长误差与 ASR-WER；韵律用基频/能量分布 KL 散度等统计指标。",
    "有什么代价：MOS 昂贵、易受人因偏差与样本量影响；客观指标与听感相关性有限（MCD 低未必自然）；ASR-WER 只测可懂度不测自然度。",
    "怎么评测：在测试集上同时报告 MOS、偏好率、MCD、F0 误差、WER、RTF，并做显著性检验避免偶然。"
  ],
  "edgeCases": [
    "评测样本过短：MOS 方差大、不稳定。",
    "评测员口音偏差：对某方言/语种打分系统性偏低。",
    "ASR 自身错误：WER 虚高掩盖 TTS 实际可懂度。",
    "对抗样本：模型在测试集过拟合导致指标虚高。"
  ],
  "pitfalls": [
    "只用 MCD 等客观指标做发布结论，忽略 MOS，可能选了‘指标好但难听’的模型。",
    "把可懂度（WER）等同于自然度，忽视韵律平淡问题。"
  ],
  "prerequisites": [
    "梅尔频谱与倒谱系数基础",
    "MOS 与主观听评实验设计",
    "ASR 回环评测与词错率（WER）"
  ],
  "workedExample": [
    "MOS 测试：招募 20 名听评员对 A/B 两系统各 50 句打分（1-5），系统 A 平均 4.1、B 3.8，做 t 检验确认差异显著。",
    "可懂度回环：把合成音频送 ASR，原文‘北京市’被识别成‘北经市’则记一次替换错误，统计 WER 反映可懂度。"
  ],
  "lineByLine": [
    "mcd：取前后 mel 的前 n_coeff 个倒谱系数逐帧求欧氏距离再平均，乘常数换算为分贝量级的距离。",
    "intelligibility：把合成波形送 ASR 转写，转写文本与原文本比对即得 WER，间接衡量可懂度。",
    "两函数分别覆盖‘谱/韵律相似度’与‘语义可懂度’两个客观维度。"
  ],
  "followUps": [
    {
      "question": "为什么 MCD 低但听感仍然机械？",
      "answer": "MCD 只比较静态谱包络均值，对动态韵律（基频轮廓、停顿、重音）不敏感；语音机械感多来自韵律缺乏变化，而这些未被 MCD 捕获，需结合 F0 动态误差与 MOS 才能反映。"
    },
    {
      "question": "如何低成本做持续监控而不每次请人打分？",
      "answer": "建立客观指标看板（MCD/F0 RMSE/WER/RTF）+ 周期性小样本 MOS 抽检；并用神经 MOS 预测模型（如基于 wav2vec 的 UT-MOS）做近似自动打分，仅在版本上线前做正式人工评测。"
    }
  ],
  "followUpAnswers": [
    "MCD 只比较静态谱包络均值，对动态韵律（基频轮廓、停顿、重音）不敏感；语音机械感多来自韵律缺乏变化，而这些未被 MCD 捕获，需结合 F0 动态误差与 MOS 才能反映。",
    "建立客观指标看板（MCD/F0 RMSE/WER/RTF）+ 周期性小样本 MOS 抽检；并用神经 MOS 预测模型（如基于 wav2vec 的 UT-MOS）做近似自动打分，仅在版本上线前做正式人工评测。"
  ],
  "order": 7
};
