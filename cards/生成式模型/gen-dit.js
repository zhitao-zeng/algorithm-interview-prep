export default {
  "id": "gen-dit",
  "kind": "concept",
  "category": "生成式模型",
  "title": "DiT：Diffusion Transformer",
  "difficulty": "Hard",
  "prompt": "DiT（Diffusion Transformer）如何用 Transformer 替代 U-Net？patchify 与扩散、注意力如何结合？",
  "quickAnswer": "DiT 把潜变量切分成若干 patch 并线性投影成 token 序列，输入到标准 Transformer 块（含 self-attn 与 FFN），时间步与条件通过 adaLN-zero 调制各层尺度。相比 U-Net 的局部卷积，Transformer 的全局注意力更擅长建模长程依赖，且算力随 token 数可扩展（Gflops 规律），成为 Sora 等视频模型主干。",
  "code": "from torch import nn\nclass DiTBlock(nn.Module):\n    def __init__(self, d):\n        super().__init__()\n        self.ln = nn.LayerNorm(d); self.attn = nn.MultiheadAttention(d, 8)\n        self.adaln = nn.Linear(d, 6*d)   # 由(t,cond)预测调制\n    def forward(self, x, scale, shift, gate):\n        h = self.ln(x) * (1+scale) + shift\n        a = self.attn(h, h, h)[0]\n        return x + gate * a",
  "complexity": "O(N²·d)，N=token 数",
  "beginnerSummary": "U-Net 像用放大镜一块块看局部，DiT 则把图切成小方块排成一条“句子”，用 Transformer 一次看清所有方块之间的关系，更擅长整体结构。",
  "explanationFocus": "是什么：DiT 是把扩散模型的去噪骨干从 U-Net 换成 Vision Transformer 的架构，通过在潜空间 patch 序列上做自注意力来完成去噪。",
  "approach": "对潜变量做 patchify 得到 token，加位置编码后送入堆叠 Transformer 块；时间步与文本条件经 adaLN 调制每层归一化的仿射参数，使网络按噪声水平与语义调整行为。",
  "derivation": [
    "为什么需要：U-Net 受感受野与归纳偏置限制，难以扩展到高分辨率/视频的全局建模。",
    "怎么实现：patchify→token→Transformer 块，adaLN-zero 注入 (t,cond)，最后 unpatchify 回潜空间。",
    "有什么代价：自注意力 O(N²) 随分辨率平方增长，token 过多时显存压力大。",
    "怎么评测：在 ImageNet 上比 FID，并做 Gflops-性能缩放实验验证可扩展性。"
  ],
  "edgeCases": [
    "patch 尺寸小→token 多→质量高但算力爆炸，需权衡。",
    "adaLN-zero 初始化让残差初始为 0，稳定训练。",
    "与 VAE 配合时 token 数 = (H/8/p)²，需对齐下采样。"
  ],
  "pitfalls": [
    "以为 DiT 不用卷积——常仍保留轻量卷积做 patch embed/unembed。",
    "忽略条件调制位置，直接 concat 条件会弱于 adaLN。"
  ],
  "prerequisites": [
    "Vision Transformer",
    "Latent Diffusion",
    "adaLN / 条件调制"
  ],
  "workedExample": [
    "把 32²×4 潜变量按 2×2 patch 切成 16²=256 个 token。",
    "每个 token 投影到 d 维，加 2D 位置编码。",
    "经 28 层 DiTBlock（adaLN 注入 t 与文本）输出去噪 token。",
    "unpatchify 还原潜变量并由 VAE 解码。"
  ],
  "lineByLine": [
    "adaLN 的线性层由 (t,cond) 预测 6 组仿射参数。",
    "forward 用 scale/shift 调制 LayerNorm 输出。",
    "self.attn 在 token 间做全局自注意力捕捉长程依赖。",
    "gate 控制残差强度，零初始化保证初期恒等。"
  ],
  "followUps": [
    {
      "question": "DiT 为何比 U-Net 更适合视频？",
      "answer": "注意力天然支持时空 token 联合建模，且 Gflops 可预测缩放，便于从图扩到视频。"
    },
    {
      "question": "adaLN-zero 有什么用？",
      "answer": "把每层输出缩放初始化为 0，使网络初期近似恒等映射，极大稳定深层训练。"
    },
    {
      "question": "patch 大小怎么影响？",
      "answer": "小 patch 增 token 提质量但算力平方涨；大模型常用较大 patch 控成本。"
    }
  ],
  "followUpAnswers": [
    "注意力天然支持时空 token 联合建模，且 Gflops 可预测缩放，便于从图扩到视频。",
    "把每层输出缩放初始化为 0，使网络初期近似恒等映射，极大稳定深层训练。",
    "小 patch 增 token 提质量但算力平方涨；大模型常用较大 patch 控成本。"
  ],
  "order": 5
};
