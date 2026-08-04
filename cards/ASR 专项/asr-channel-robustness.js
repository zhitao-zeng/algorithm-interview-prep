export default {
  "id": "asr-channel-robustness",
  "category": "ASR 专项",
  "difficulty": "Hard",
  "title": "真实信道鲁棒性失真模拟与训练",
  "prompt": "如何用播放链路建模（RIR、频响、AGC、Codec、Clipping）提升真实信道鲁棒性，并避免只拟合模拟失真？",
  "quickAnswer": "按真实播放链路分阶段构造 RIR 卷积、频响均衡、AGC 增益、Codec 量化与 Clipping 截断来模拟失真，并以 clean/augmented/in-domain 混合训练让模型学到真实退化；信道退化集 WER 28.66%→20.32%，独立业务集降至 3.62%，RIR 卷积改 FFT 提速约 30x。",
  "code": "import numpy as np\n\ndef apply_rir_fft(speech: np.ndarray, rir: np.ndarray) -> np.ndarray:\n    \"\"\"用 FFT 卷积把房间脉冲响应施加到语音，比时域卷积快约 30x。\"\"\"\n    n = len(speech) + len(rir) - 1\n    nfft = 1 << (n - 1).bit_length()\n    S = np.fft.rfft(speech, nfft)\n    R = np.fft.rfft(rir, nfft)\n    return np.fft.irfft(S * R)[:len(speech)]",
  "complexity": "时间 O(N log N)（FFT 卷积）/ 时域 O(N·M)，空间 O(N)",
  "beginnerSummary": "就像在浴室和旷野录音声音不同，我们用数学先“装修”出各种房间和设备的声音，再让模型在“坏声音”里也听得清。",
  "derivation": [
    "为什么需要：真实播放链路（扬声器→房间→麦克风→Codec）引入混响、频响凹陷、增益与削波，训练集若只有 clean 语音会在真实信道上 WER 飙升。",
    "怎么实现：按链路分阶段建模 RIR 卷积、频响曲线、AGC、Codec 量化与 Clipping，离线批量增强音频，并保留 clean/in-domain 原始数据混合训练。",
    "有什么代价：过度增强会让模型只拟合模拟失真的“指纹”而对真实退化泛化差；RIR 时域卷积在大语音上慢，需要 FFT 加速。",
    "怎么评测：用独立信道退化集（构造失真）与独立业务集（真实采集）双轨验证，退化集 28.66%→20.32%，业务集进一步降到 3.62%。"
  ],
  "edgeCases": [
    "RIR 长度远大于语音时 FFT padding 不足造成循环卷积混叠，需用 nfft≥N+M-1。",
    "真实 Codec（如 Opus）引入非线性量化，线性模拟无法完全还原，需真实 Codec 重编码。",
    "过度增强使训练分布远离真实，业务集反而退化（过拟合模拟失真）。",
    "Clipping 阈值设错导致削波过重产生谐波，引入新伪影。"
  ],
  "pitfalls": [
    "只用 augmented 数据训练，模型学到模拟失真特征而非真实退化，业务集泛化差。",
    "把业务集 3.62% 当成上限而忽略退化集，掩盖了增强未覆盖的信道。"
  ],
  "prerequisites": [
    "卷积与 FFT",
    "房间脉冲响应（RIR）与混响",
    "音频 Codec 与增益控制基础"
  ],
  "workedExample": [
    "步骤1：采集 5 条真实 RIR，用 apply_rir_fft 对 1 万条 clean 语音做混响增强。",
    "步骤2：混合 60% clean、30% augmented、10% in-domain 真实退化数据训练。",
    "步骤3：在独立业务集上测到 WER 3.62%，验证未过拟合模拟失真。"
  ],
  "lineByLine": [
    "import numpy as np 引入数值库用于 FFT 运算。",
    "n = len(speech) + len(rir) - 1 计算线性卷积所需输出长度。",
    "nfft = 1 << (n - 1).bit_length() 取不小于 n 的最小 2 的幂，满足 FFT 效率。",
    "S = np.fft.rfft(speech, nfft); R = np.fft.rfft(rir, nfft) 频域变换后逐点相乘等价于时域卷积。",
    "return np.fft.irfft(S * R)[:len(speech)] 逆变换并裁回原语音长度。"
  ],
  "followUps": [
    {
      "question": "FFT 卷积相比时域快多少？",
      "answer": "时域为 O(N·M)，FFT 为 O(N log N)；在数秒语音上约 30 倍加速，且语音越长优势越明显。"
    },
    {
      "question": "如何防止只拟合模拟失真？",
      "answer": "保持 clean 与真实 in-domain 数据占比，并把独立业务集作为早停与放行依据，增强集仅用于提升退化集而非业务集。"
    }
  ],
  "followUpAnswers": [
    "时域为 O(N·M)，FFT 为 O(N log N)；在数秒语音上约 30 倍加速，且语音越长优势越明显。",
    "保持 clean 与真实 in-domain 数据占比，并把独立业务集作为早停与放行依据，增强集仅用于提升退化集而非业务集。"
  ],
  "invariant": "对于任意 speech 与 rir，FFT 卷积输出在 [:len(speech)] 上与时域卷积结果数值一致，且不引入循环混叠。",
  "walkthrough": "speech 长 16000、rir 长 4000 → n=20000，nfft=32768；rfft 后 S·R 逆变换取前 16000 点，即得与时域卷积等价的混响语音。",
  "kind": "code"
};
