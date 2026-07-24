export default {
  "id": "stream-speculative-decoding",
  "kind": "concept",
  "category": "流式推理工程",
  "difficulty": "Hard",
  "title": "投机解码 Speculative Decoding",
  "prompt": "大模型自回归逐 token 生成很慢，投机解码(Speculative Decoding)是如何在保持输出分布完全不变(lossless)的前提下实现加速的？",
  "quickAnswer": "投机解码用一个小的草稿模型先预测 K 个候选 token，再用大模型并行一次性验证，把 K 次串行前向压缩成约 1 次验证，从而实现加速。被接受的数量由 acceptance rate 决定，未通过的位置从分歧点按大模型分布重采样，因此输出分布与原始自回归严格一致(lossless)。代价是额外维护草稿模型与 K 的选择，收益在接受率高时显著。",
  "approach": "核心思路是“用小模型猜、大模型验”：草稿模型自回归产出候选块，目标模型单次并行前向给出整块的分布，再从左到右贪心对齐；首个不一致处截断并以大模型分布重采样。关键在于保证统计一致性——验证步骤本质上是在做 “blockwise” 的接受-拒绝采样。",
  "explanationFocus": "是什么：投机解码是一种 lossless 的推理加速方法，用一个小的草稿模型(draft model)一次性预测未来若干个 token，再由大的目标模型(target model)并行地一次性校验(verify)这批 token 是否符合其自身分布，从而把多次串行自回归步压缩成一次并行验证。",
  "bruteForce": "朴素做法就是直接用目标大模型做标准自回归：每步只生成一个 token，生成下一个 token 前必须等上一步完成，L 个 token 就串行 L 次前向。没有任何并行或猜测，实现简单但严重受限于大模型单步延迟。",
  "invariant": "循环不变量：在每一轮投机-验证中，被接受前缀 + 分歧点处目标重采样出的 token 始终与目标模型对该前缀的边际分布采样结果同分布，因此任意多轮叠加后整体序列分布等于原始自回归分布(证明见 Leviathan et al. 2023 的接受-拒绝采样引理)。",
  "walkthrough": "假设目标模型 M 每步前向固定 50ms，草稿模型 m 每步 5ms。取 K=4：m 串行跑 4 步 = 20ms 产出 4 个候选；M 一次性验证 4 个 token 约 55ms(批大小 4 略增)。若该轮接受率 0.75，平均接受 3 个，则“3 个新 token”花费 ~75ms；而纯 M 自回归需 3×50=150ms，这一轮提速约 2×。若接受率掉到 0.25(只接受 1 个)，则 ~75ms 只换 1 个 token，不如纯自回归。这说明加速比 ≈ (K×单步M延迟) / (K×单步m延迟 + 单次M批延迟) × 接受率 的折中。",
  "code": "def speculative_decode(draft, target, prefix, K):\n    # 草稿模型串行猜 K 个\n    candidates = []\n    ctx = prefix\n    for _ in range(K):\n        tok = draft.sample(ctx)        # 小模型便宜\n        candidates.append(tok)\n        ctx = ctx + [tok]\n    # 大模型一次性并行验证整块\n    logits = target.forward(prefix + candidates)   # 单批次前向\n    # 从左到右接受-拒绝\n    n_accept = 0\n    for i, c in enumerate(candidates):\n        if target.sample_from(logits[i]) == c:\n            n_accept += 1\n        else:\n            break\n    new_prefix = prefix + candidates[:n_accept]\n    if n_accept < K:\n        new_prefix += [target.sample_from(logits[n_accept])]  # 分歧点重采样\n    return new_prefix, n_accept",
  "complexity": "时间上，每轮用 K 次小模型前向 + 1 次大模型批前向换得 (接受数+1) 个 token；理想加速 ≈ (K·t_M)/(K·t_m + t_M_batch)。空间上需为 K 个候选缓存 logits 与 KV，开销 O(K)。大模型单次批前向随 K 略增但远小于 K 次独立前向。",
  "beginnerSummary": "想象你写作业时，让一个写字快但常出错的小同学先替你写一整段，然后你(大同学)拿着红笔一次性核对：对的留着，第一个错的地方你亲自改并续写。因为错的地方一定按你的意思来，最后整段和你自己写的一字不差，但因为你一次核对了一整段，省下了反复等小同学、再等自己逐字写的时间。",
  "diagram": "草稿模型 m          目标模型 M\n  │                   │\n  ├─ t1,t2,t3,t4 ───► │  并行 verify\n  │   (候选 K 个)     │\n  │                   ▼\n  │            接受 t1,t2,t3 | 分歧于 t4\n  └────────── 从 t4' 按 M 重采样续写",
  "derivation": [
    "为什么需要: 自回归大模型每生成一个 token 都需要一次完整的模型前向(尤其大模型前向受限于内存带宽，单步算力利用率低)，生成长度 L 时总延迟与 L 成正比。小模型前向更便宜，若能借助小模型“猜”出接下来几个 token，再让大模型“一次性确认”，就能在多步串行里省下大模型的前向次数。",
    "怎么实现: 草稿模型基于当前上下文自回归地采样/贪心出 K 个候选 token；把这些 token 拼成序列喂给目标模型做一次并行前向，目标模型同时输出每个位置的真实分布；按从左到右逐个位置比较草稿 token 与目标采样结果，遇到第一个不一致的位置即停止接受(后续按目标分布重采样)。未被接受的部分从分歧点重采样续写。",
    "有什么代价: 需要额外加载并运行一个草稿模型，增加显存与一部分算力开销；加速收益取决于 acceptance rate(接受率)，若草稿模型与目标模型差异大、接受率低，则额外开销打水漂甚至变慢。草稿长度 K 也是超参，K 太大接受率下降、K 太小加速有限。",
    "怎么评测: 核心指标是 acceptance rate(每步平均被接受的 token 数)与端到端加速比(wall-clock 对比基线自回归)。还要验证输出分布与原始自回归严格一致(lossless)，常用困惑度/下游任务指标复现、以及每步验证 FLOPs 与串行基线的对比来量化收益。"
  ],
  "edgeCases": [
    "接受率为 0 时(草稿完全不准)：每轮只得到 1 个 target token，等价于纯自回归外加 K 次小模型浪费，应回退到不用草稿。",
    "草稿长度 K 大于剩余需生成长度：最后一圈候选越界，应截断 K 到剩余预算，避免无谓计算。",
    "温度/采样参数导致 draft 与 target 分布差异：贪心 draft + 采样 target 的接受率与纯采样目标分布一致性需按带温度的接受-拒绝公式修正。",
    "EOS 出现在候选中间：接受到 EOS 即应提前结束整段生成，后续候选作废。"
  ],
  "pitfalls": [
    "误以为投机解码会改变输出分布——只要验证用正确的接受-拒绝准则，它就是严格 lossless 的，但实现里若用 argmax 而非按分布采样验证就会引入偏差。",
    "盲目增大 K：接受率随 K 衰减，K 过大时额外小模型成本 + 批前向增长会抵消收益，需按经验选 K 并监控实时接受率。",
    "草稿模型与目标模型 tokenizer/词表必须对齐，否则候选 token 无法在 target 词空间里验证。"
  ],
  "prerequisites": [
    "自回归生成与 teacher forcing 的基本流程",
    "大模型推理的单步延迟瓶颈(内存带宽受限)",
    "接受-拒绝采样(rejection sampling)的基本思想"
  ],
  "workedExample": [
    "场景：7B 目标模型 + 120M 草稿模型，生成 128 token 的代码补全。草稿每步 3ms，目标每步 40ms。取 K=5，measured 平均接受率 0.8，则每轮平均产出 5×0.8+1≈5 个 token，耗时≈5×3+45=60ms，纯目标需 5×40=200ms，单轮约 3.3×。整段 128 token 约 25 轮，端到端从 ~5.1s 降到 ~1.5s。",
    "反例：换一个与目标任务分布差异很大的草稿模型，接受率掉到 0.2。每轮平均仅产出 5×0.2+1=2 个 token，耗时仍 60ms，相当于每 token 30ms，比纯目标 40ms 略好但远未达预期；且额外显存常驻 120M 模型，此时应减小 K 或换草稿。"
  ],
  "lineByLine": [
    "def speculative_decode(draft, target, prefix, K): 定义主函数，draft 为小草稿模型、target 为大目标模型、prefix 为已确认上下文、K 为每轮猜测长度。",
    "for _ in range(K): tok = draft.sample(ctx) 让便宜的小模型自回归地连续猜出 K 个候选 token，这 K 次是小模型串行前向。",
    "logits = target.forward(prefix + candidates) 把整段候选一次性喂给大模型做单批次并行前向，得到每个位置的真实分布——这是加速的核心(一次换 K)。",
    "for i, c in enumerate(candidates): if target.sample_from(logits[i]) == c: n_accept += 1 else: break 从左到右逐位比较：草稿 token 与大模型在该位采样一致则接受，第一个不一致即停止(保证分布一致性的关键)。",
    "new_prefix += [target.sample_from(logits[n_accept])] 分歧点用大模型自己的分布重采样一个 token 续写，被拒绝的后续草稿全部丢弃。"
  ],
  "codeNotes": [
    "for 循环里 draft.sample 是小模型串行猜测，K 次累加的是小模型成本；",
    "target.forward 一次批前向替代了 K 次独立大模型前向，是加速来源；",
    "从左到右的接受-拒绝顺序不可打乱，否则破坏 lossless 证明。"
  ],
  "followUps": [
    {
      "question": "投机解码和 Medusa/EAGLE 这类方法的核心区别是什么？",
      "answer": "经典投机解码用独立的小草稿模型串行猜 token，再交给目标模型验证；Medusa/EAGLE 不再额外训练一个完整小模型，而是在目标模型上加“多头/自回归头”直接从目标模型的隐藏态预测未来若干 token(草稿树)，验证阶段也更结构化。前者训练成本低、可插拔，后者草稿质量更高、接受率更好但需改造目标模型结构。"
    },
    {
      "question": "如何估算某场景下是否值得用投机解码？",
      "answer": "看两个量：草稿单步延迟 t_m 与目标单步延迟 t_M 的比值，以及平均接受率 α。每轮用 K·t_m + t_M_batch 换 (K·α + 1) 个 token；当 t_M 远大于 t_m 且 α 较高时收益明显。实操上先离线测 α(K)，若 α<0.3 基本不划算，应减小 K 或换更好的草稿。"
    },
    {
      "question": "投机解码在 beam search 或约束解码下还能用吗？",
      "answer": "可以但需要额外处理。beam 场景下要按每条 beam 分别做草稿与验证；约束解码(如 JSON schema)要保证草稿 token 也满足约束，否则接受率骤降。本质上接受-拒绝准则要在约束分布下重新推导，保证仍是约束后的真实分布采样。"
    }
  ],
  "followUpAnswers": [
    "经典投机解码用独立的小草稿模型串行猜 token，再交给目标模型验证；Medusa/EAGLE 不再额外训练一个完整小模型，而是在目标模型上加“多头/自回归头”直接从目标模型的隐藏态预测未来若干 token(草稿树)，验证阶段也更结构化。前者训练成本低、可插拔，后者草稿质量更高、接受率更好但需改造目标模型结构。",
    "看两个量：草稿单步延迟 t_m 与目标单步延迟 t_M 的比值，以及平均接受率 α。每轮用 K·t_m + t_M_batch 换 (K·α + 1) 个 token；当 t_M 远大于 t_m 且 α 较高时收益明显。实操上先离线测 α(K)，若 α<0.3 基本不划算，应减小 K 或换更好的草稿。",
    "可以但需要额外处理。beam 场景下要按每条 beam 分别做草稿与验证；约束解码(如 JSON schema)要保证草稿 token 也满足约束，否则接受率骤降。本质上接受-拒绝准则要在约束分布下重新推导，保证仍是约束后的真实分布采样。"
  ]
};
