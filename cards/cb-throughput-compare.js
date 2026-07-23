export default {
  "kind": "concept",
  "id": "cb-throughput-compare",
  "category": "Continuous Batching",
  "difficulty": "Medium",
  "title": "与 static batching 的吞吐对比",
  "prompt": "怎么量化对比 Continuous Batching 和静态 Batching 的吞吐收益？",
  "quickAnswer": "用相同模型、相同硬件、相同到达率与长度分布做压测，核心指标是有效 token 吞吐(TPS，含输入输出)、平均与 P99 延迟、GPU 利用率。连续批通过消除气泡与 padding 提升有效 batch 利用率与吞吐；实际收益取决于请求长度方差、并发、KV 显存、调度策略与对比基线，需以吞吐-延迟曲线实测，P99 通常随利用率改善而下降、但并非普遍‘必升 2–4 倍’。",
  "approach": "控制变量做 A/B，画吞吐-延迟曲线与利用率。",
  "explanationFocus": "是什么：吞吐对比是在固定负载下测\"单位时间内完成的有效 token 数\"，连续批通过提高 slot 利用率把曲线整体抬升。",
  "bruteForce": "静态批下简单统计总 token / 总耗时作为吞吐。",
  "derivation": [
    "为什么需要：要证明收益必须可量化，否则只是定性口号；吞吐与延迟是最直接的业务语言。",
    "怎么实现：以 Poisson 或真实 trace 注入请求，记录每请求入队、首 token、完成时间；汇总 TPS = 总生成 token / 总耗时，延迟分位数。",
    "有什么代价：压测需覆盖不同到达率与长度分布，单点数据易误导；需排除冷启动与预热。",
    "怎么评测：绘吞吐随 QPS 变化曲线，观察连续批在饱和区的优势与拐点。"
  ],
  "invariant": "相同模型/硬件下，连续批的 TPS(QPS→饱和) 应稳定高于静态批。",
  "walkthrough": "A100 上 LLaMA-7B，QPS=32，长度分布幂律：静态 TPS≈1800，连续 TPS≈5400，提升 3x；P99 由 4.2s 降到 1.1s。",
  "edgeCases": [
    "低 QPS：两者都填不满，差异小。",
    "超饱和 QPS：排队主导，吞吐趋于上限但延迟飙升。",
    "极短输出：静态批 padding 少，差距收窄。"
  ],
  "code": "# Python\ndef effective_tps(total_tokens, wall_time):\n    return total_tokens / wall_time  # 有效 token 吞吐\n\ndef speedup(tps_cont, tps_static):\n    return tps_cont / tps_static  # 吞吐提升倍数",
  "codeNotes": [
    "算有效 token（真实输出），不含 pad。",
    "speedup = 连续/静态，通常 2-4x。"
  ],
  "complexity": "收益随并发与长度方差放大；低载时趋近 1x。",
  "followUps": [
    {
      "question": "吞吐提升 4 倍是怎么来的？",
      "answer": "主要来自消除气泡（短请求不再陪跑）与去除 padding，二者在长尾高并发下叠加放大。"
    },
    {
      "question": "只看吞吐够吗？",
      "answer": "不够，还要看 P99 延迟与利用率，吞吐高但尾延迟爆炸对用户无意义。"
    }
  ],
  "followUpAnswers": [
    "气泡+padding 双重消除叠加。",
    "需同时看 P99 与利用率。"
  ],
  "pitfalls": [
    "在低 QPS 下测出\"无差异\"就否定连续批。",
    "把 pad token 也算进吞吐虚高。"
  ],
  "beginnerSummary": "同样一辆货车（GPU），静态批像半车货就发车还不让中途装卸，连续批像随到随装、卸完即补。跑同样时间，连续批运的货（token）明显更多——这就是吞吐提升。",
  "prerequisites": [
    "吞吐 = 有效 token / 时间。",
    "延迟分位数衡量长尾。",
    "压测需控制变量。"
  ],
  "workedExample": [
    "QPS=32，静态 TPS≈1800，连续≈5400。",
    "提升 3x，P99 由 4.2s 降到 1.1s。"
  ],
  "lineByLine": [
    "记录总生成 token 与墙钟时间。",
    "求有效 TPS。",
    "对静态/连续分别测。",
    "取比值得 speedup。"
  ],
  "diagram": "QPS↑: 静态 TPS  plateau@1800\n       连续 TPS  plateau@5400 (3x)"
};
