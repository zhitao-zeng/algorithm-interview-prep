export default {
  "id": "ir-mla-deepseek",
  "category": "推理框架",
  "difficulty": "Hard",
  "title": "DeepSeek MLA 注意力",
  "prompt": "DeepSeek 的 MLA（Multi-head Latent Attention）如何通过低秩压缩降低 KV Cache 显存？",
  "quickAnswer": "MLA 把键和值压缩成低维潜向量（latent）存储，推理时再上投影恢复，KV Cache 只存潜向量而非完整 KV，显存与带宽大幅下降。",
  "approach": "用下投影矩阵把输入压成维度很小的 kv 潜变量 c_kv；缓存 c_kv，注意力时经上投影矩阵恢复 K/V，并与解耦的 RoPE 部分拼接。",
  "explanationFocus": "是什么：MLA 是 DeepSeek 提出的注意力变体，通过对键/值做低秩压缩，仅缓存低维潜向量而非每个头的完整 KV，从而在保持效果的同时大幅压缩 KV Cache 与访存带宽。",
  "bruteForce": "朴素做法：标准 MHA 为每个头缓存完整 K、V 矩阵，头数与维度乘积决定 KV 大小，长上下文下显存与带宽压力巨大。",
  "invariant": "不变式：由潜向量上投影恢复的 K/V 与训练目标一致，且注意力分数在解耦 RoPE 拼接后仍满足因果性与数值稳定。",
  "walkthrough": "执行追踪：前向时计算 c_kv=W_dkv·x 并缓存；注意力用 W_uk·c_kv 得到 K、W_uv·c_kv 得到 V；查询侧 q 也经压缩与解耦 RoPE，最终做标准注意力。",
  "complexity": "说明：KV 缓存由 (n_heads×head_dim) 降到 latent_dim（远小于前者），显存与带宽近线性下降；代价是额外上下投影矩阵与拼接计算。",
  "beginnerSummary": "普通注意力每个头都存一份 K/V，太多太占显存。MLA 只存一个\"压缩摘要\"潜向量，用时再展开，省下大量 KV 显存。",
  "diagram": "x --> W_dkv --> c_kv (小, 缓存)\n                 |\n                 +--> W_uk --> K\n                 +--> W_uv --> V\nq 经 W_dq + 解耦 RoPE 与 K,V 做注意力",
  "code": "def mla(x, W_dq, W_dkv, W_uk, W_uv, W_kr, W_qr):\n    c = W_dkv @ x                       # 低秩压缩\n    k = W_uk @ c                        # 上投影恢复 K\n    v = W_uv @ c                        # 上投影恢复 V\n    q = W_dq @ x\n    k = concat(k, rope(W_kr @ x))       # 解耦 RoPE\n    q = concat(q, rope(W_qr @ x))\n    return attention(q, k, v)",
  "derivation": [
    "为什么需要：MHA 在长上下文下 KV Cache 随头数与维度线性膨胀，成为显存与带宽瓶颈；需要保持表达力同时压缩KV。",
    "怎么实现：引入降维矩阵 W_dkv 将 K/V 压成低维潜向量 c_kv 并缓存；推理时用 W_uk/W_uv 上投影恢复 K/V；位置信息用解耦 RoPE 单独处理再拼接。",
    "有什么代价：增加上下投影参数与前向计算量，训练需联合优化压缩恢复；部署需 kernel 支持潜向量存取与拼接。",
    "怎么评测：在同等效果下对比 KV Cache 字节数、长上下文吞吐与显存峰值，验证压缩率与精度损失。"
  ],
  "edgeCases": [
    "latent_dim 过小会丢信息，需权衡压缩率与困惑度。",
    "解耦 RoPE 与潜向量拼接时维度对齐必须正确，否则注意力错位。",
    "推理内核需支持只缓存潜向量、按需上投影的访存模式。",
    "与分组查询（GQA）混用时需明确压缩层级与共享策略。"
  ],
  "pitfalls": [
    "误把完整 K/V 仍写入缓存，等于没压缩，白增投影开销。",
    "解耦 RoPE 拼接顺序或维度错配，导致位置信息失效。"
  ],
  "prerequisites": [
    "标准多头注意力 MHA 与 KV Cache",
    "低秩分解与矩阵投影概念"
  ],
  "workedExample": [
    "某层 head_dim=128、n_heads=128：标准 KV 每 token 需 128×128×2 参数；MLA latent_dim=512 时缓存仅 512×2，压缩数十倍。",
    "推理时 c_kv 上投影恢复 K/V 后注意力输出与训练分布一致，困惑度基本不变。"
  ],
  "lineByLine": [
    "c = W_dkv @ x 把高维输入压成低维潜向量，是缓存的唯一内容。",
    "k/v = W_uk/W_uv @ c 在注意力时恢复键值，省去存储完整 KV。",
    "rope 分支提供位置编码并与压缩 K/V 拼接，保持旋转位置信息。"
  ],
  "codeNotes": [
    "真实 DeepSeek 中 q 也做低秩压缩，并用解耦 RoPE 单独承载位置，从而让 KV 潜向量与位置无关、更易压缩。"
  ],
  "followUps": [
    {
      "question": "MLA 与 GQA/MQA 的区别？",
      "answer": "GQA/MQA 靠在头间共享 K/V 降维，MLA 则对 K/V 做低秩潜变量压缩并解耦 RoPE，压缩更彻底且更保精度。"
    },
    {
      "question": "MLA 对推理带宽有什么影响？",
      "answer": "KV Cache 变小直接减少每步从显存读取的字节数，decode 瓶颈在访存时收益明显，吞吐提升显著。"
    }
  ],
  "followUpAnswers": [
    "GQA/MQA 靠在头间共享 K/V 降维，MLA 则对 K/V 做低秩潜变量压缩并解耦 RoPE，压缩更彻底且更保精度。",
    "KV Cache 变小直接减少每步从显存读取的字节数，decode 瓶颈在访存时收益明显，吞吐提升显著。"
  ],
  "kind": "concept"
};
