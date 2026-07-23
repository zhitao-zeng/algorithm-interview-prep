export default {
  "kind": "code",
  "id": "conv1d",
  "category": "模型手写",
  "difficulty": "Medium",
  "title": "一维卷积",
  "prompt": "手写单通道一维卷积并计算输出长度。",
  "quickAnswer": "每个输出位置取长度 K 的窗口与卷积核点积；长度为 floor((L+2P-K)/S)+1。",
  "approach": "每个输出位置取长度 K 的窗口与卷积核点积；长度为 floor((L+2P-K)/S)+1。",
  "explanationFocus": "一维卷积：每个输出位置取长度 K 的窗口与卷积核点积；长度为 floor((L+2P-K)/S)+1。",
  "bruteForce": "《一维卷积》的朴素实现直接按定义展开张量运算，正确但常忽略数值稳定性与向量化。",
  "derivation": [
    "1D 卷积用局部感受野捕捉 n-gram / 局部时序模式，权值共享降低参数量。",
    "输出长度公式与 2D 同源，只是退化到一维滑动窗口。",
    "padding 用于保持序列长度或让两端被充分卷积。"
  ],
  "invariant": "第 i 个输出只读取补零后从 i·stride 开始的连续 K 个采样点。",
  "walkthrough": "输入 [1,2,3]、核 [1,1]、stride=1 时依次得到 3、5。",
  "edgeCases": [
    "核宽大于输入：校验报错（无有效窗口）。",
    "stride 不能整除：公式向下取整。",
    "padding=0 且 L<K：输出尺寸为负/0，需校验。"
  ],
  "code": "# Python\nimport numpy as np\n\ndef conv1d(x, kernel, stride=1, padding=0):\n    x, kernel = np.asarray(x, float), np.asarray(kernel, float)\n    if stride <= 0 or padding < 0: raise ValueError(\"invalid stride or padding\")\n    padded = np.pad(x, (padding, padding))\n    out_len = (len(x)+2*padding-len(kernel))//stride + 1\n    if out_len <= 0: return np.empty(0, dtype=float)\n    return np.array([(padded[i*stride:i*stride+len(kernel)]*kernel).sum() for i in range(out_len)])",
  "codeNotes": [
    "深度学习库通常实现的是互相关，不会翻转 kernel。",
    "实际张量布局还要处理 batch、channel 维。"
  ],
  "complexity": "时间 O(C_in·C_out·K·out_len)，空间 O(C_out·out_len)。",
  "followUps": [
    {
      "question": "dilation 如何改变感受野？",
      "answer": "窗口内采样间隔变为 dilation，等效核宽为 dilation*(K-1)+1，参数量不变但看到更长上下文。"
    },
    {
      "question": "Conv1d 如何用于语音？",
      "answer": "沿时间轴提取局部声学模式，stride 可做下采样；真实模型还要处理 batch、channel 和 bias。"
    }
  ],
  "followUpAnswers": [
    "采样窗口内部间隔 dilation，感受野增大而参数量不变。",
    "可沿时间轴提取局部声学模式，stride 同时实现下采样。"
  ],
  "pitfalls": [
    "未校验核宽超过输入，导致负输出长度或越界访问。",
    "输出长度公式忘记 +1，少算一个有效窗口。"
  ],
  "beginnerSummary": "一维卷积在序列（如文本、音频、时序信号）上滑动核，提取局部时序特征。与 2D 卷积类似，输出长度 out = (L - K + 2·padding)/stride + 1，其中 L 是序列长度、K 是核宽。每个输出位置 = 核与对应窗口逐元素乘加 + 偏置。",
  "prerequisites": [
    "核沿时间轴（序列长度方向）滑动，stride 控制步长，padding 控制边缘补零。",
    "每个输出 = 核在窗口 [i, i+K-1] 上与输入的点积 + 偏置。",
    "多通道时核含输入通道维，先通道内点积再求和（同 2D 卷积）。"
  ],
  "workedExample": [
    "输入序列长 L=7，核宽 K=3，stride=1，pad=0 → out=(7-3)/1+1=5。",
    "stride=2 → (7-3)/2+1=3；即每 2 步取一个窗口，输出更短。"
  ],
  "lineByLine": [
    "按公式算 out_len = (L - K + 2·padding)/stride + 1。",
    "校验核宽不超过带 padding 的输入长度（否则报错）。",
    "对输出每个位置 i，取输入窗口 [i·stride : i·stride+K] 与核做点积 + 偏置。",
    "返回输出序列（可能多通道 → 多输出通道）。"
  ],
  "diagram": "输入序列长 L=7, 核宽 K=3, stride=1\n输出 = (7-3)/1 + 1 = 5\n每个输出 = 核在窗口 [i, i+2] 上点积\n沿时间轴滑动窗口"
};
