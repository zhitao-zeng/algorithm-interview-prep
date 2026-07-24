export default {
  "kind": "code",
  "id": "convolution",
  "category": "模型手写",
  "difficulty": "Medium",
  "title": "二维卷积输出尺寸",
  "prompt": "解释卷积输出尺寸和 im2col 思路。",
  "quickAnswer": "单边输出 floor((W+2P-K)/S)+1；对每个滑窗与卷积核逐元素乘加。",
  "approach": "单边输出 floor((W+2P-K)/S)+1；对每个滑窗与卷积核逐元素乘加。",
  "explanationFocus": "二维卷积输出尺寸：单边输出 floor((W+2P-K)/S)+1；对每个滑窗与卷积核逐元素乘加。",
  "bruteForce": "《二维卷积输出尺寸》的朴素实现直接按定义展开张量运算，正确但常忽略数值稳定性与向量化。",
  "derivation": [
    "卷积用局部连接 + 权值共享，比全连接参数量骤减且具平移不变性。",
    "输出尺寸公式由「能放下多少个不重叠/间隔的核窗口」直接推出。",
    "padding 用于保持空间分辨率或让边缘被充分卷积。"
  ],
  "invariant": "实现始终保持 二维卷积输出尺寸：单边输出 floor((W+2P-K)/S)+1；对每个滑窗与卷积核逐元素乘加。 的形状约束、概率归一化或尺度约束。",
  "walkthrough": "用一个极小张量演练《二维卷积输出尺寸》，逐步核对形状和中间数值。",
  "edgeCases": [
    "核大于带 padding 的输入：校验报错。",
    "stride 不能整除 (in-k+2p)：公式向下取整（实际实现可能含 ceil 模式）。",
    "padding=0 且 in<k：输出尺寸为 0/负，需校验。"
  ],
  "code": "# Python\nimport numpy as np\n\ndef conv2d(image, kernel, stride=1, padding=0):\n    image, kernel = np.asarray(image, float), np.asarray(kernel, float)\n    if image.ndim != 2 or kernel.ndim != 2: raise ValueError(\"image and kernel must be 2-D\")\n    if stride <= 0 or padding < 0: raise ValueError(\"invalid stride or padding\")\n    h, w = image.shape; kh, kw = kernel.shape\n    if kh > h+2*padding or kw > w+2*padding: raise ValueError(\"kernel larger than padded image\")\n    padded = np.pad(image, ((padding,padding),(padding,padding)))\n    oh = (h+2*padding-kh)//stride + 1; ow = (w+2*padding-kw)//stride + 1\n    out = np.empty((oh, ow), float)\n    for oy in range(oh):\n        for ox in range(ow): out[oy,ox] = (padded[oy*stride:oy*stride+kh, ox*stride:ox*stride+kw]*kernel).sum()\n    return out",
  "codeNotes": [
    "优先使用稳定的库算子和 keepdims/keepdim。",
    "注释每个张量的 batch、序列、通道维度。"
  ],
  "complexity": "时间 O(C_in·C_out·k²·out_h·out_w)，空间 O(C_out·out_h·out_w)。",
  "followUps": [
    {
      "question": "为什么叫卷积却不翻转 kernel？",
      "answer": "深度学习框架通常实现互相关，训练会学习到等价方向；数学卷积若严格定义需翻转核。"
    },
    {
      "question": "多通道如何扩展？",
      "answer": "输入增加 C 维，窗口对每个通道求和；每个输出通道拥有一组 (C,kh,kw) 核并加 bias。"
    }
  ],
  "followUpAnswers": [
    "使用 log-sum-exp、减最大值、eps 与高精度累积。",
    "用分块、缓存、稀疏化或 fused kernel。"
  ],
  "pitfalls": [
    "未校验核尺寸超过输入，导致负输出尺寸或越界。",
    "输出尺寸公式忘记 +1，少算一个有效窗口。"
  ],
  "beginnerSummary": "二维卷积是 CNN 的基础算子：用 k×k 的核在输入特征图上滑动，每到一个位置做「局部点积 + 偏置」得到输出图的一个像素。输出尺寸由输入大小、核大小、步幅 stride 和填充 padding 决定：out = (in - k + 2·padding)/stride + 1。",
  "prerequisites": [
    "核在输入上逐窗口滑动；stride 控制每次滑动步长，padding 控制在边缘补几圈 0。",
    "每个输出像素 = 核与对应输入局部窗口的逐元素乘加 + 偏置。",
    "多通道时，核也含输入通道维，先做通道内点积再求和。"
  ],
  "workedExample": [
    "输入 5×5，核 3×3，stride=1，pad=0 → out=(5-3)/1+1=3 → 3×3。",
    "stride=2 → (5-3)/2+1=2 → 2×2；pad=1,stride=1 → (5-3+2)/1+1=5 → 保持 5×5。"
  ],
  "lineByLine": [
    "校验核不大于输入（kernel larger / kh > h+2*padding 报错）。",
    "按公式算 out_h、out_w。",
    "双层循环遍历输出位置 (i,j)，在内层循环用核做窗口点积 + 偏置。",
    "返回输出特征图。"
  ],
  "diagram": "输入 5×5, 核3×3, stride=1, pad=0\n输出 = (5-3)/1 + 1 = 3 → 3×3\nstride=2: (5-3)/2+1 = 2 → 2×2\n每个输出像素 = 核与局部窗口点积 + 偏置"
};
