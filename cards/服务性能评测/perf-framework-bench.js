export default {
  "kind": "concept",
  "id": "perf-framework-bench",
  "category": "服务性能评测",
  "difficulty": "Hard",
  "title": "不同推理框架基准对比（vLLM / TRT-LLM / SGLang）",
  "prompt": "如何在 vLLM、TRT-LLM、SGLang 之间做公平的推理性能基准对比？",
  "quickAnswer": "公平对比需固定同一模型/精度/硬件/负载(输入输出长度、并发、batch上限)，在各自默认优化配置下测 TTFT/TPS/显存/单位成本，并开启连续批处理与相应注意力后端。结论随负载形态(长短、是否复用前缀)变化，没有绝对赢家，要贴合自身流量选。",
  "approach": "统一硬件与负载，分框架跑相同 benchmark，控制变量只留框架差异，报告多维指标与成本。",
  "explanationFocus": "是什么：框架基准对比是在严格控制变量下，对 vLLM/TRT-LLM/SGLang 等测延迟、吞吐、显存与成本，给出适合自身流量的选型建议。",
  "bruteForce": "只比官方宣传数字：不同配置与负载下不可比，易误选。",
  "derivation": [
    "为什么需要：各框架优化点不同(分页注意力/编译/前缀复用)，需针对自身负载实测。",
    "怎么实现：同模型同卡，固定并发与长度分布，依次部署三框架跑统一脚本采集指标。",
    "有什么代价：每框架调优成本高；TRT-LLM 需编译耗时，SGLang 在前缀复用场景占优。",
    "怎么评测：报告 p99 TTFT、TPS、最大并发、单位成本，并标注负载特征。"
  ],
  "invariant": "控制变量下指标差异来自框架实现；同一框架在不同负载下排名可能变化。",
  "walkthrough": "同 7B fp16 A100，短请求高并发：vLLM TPS=520，SGLang=560，TRT-LLM=600；带大量前缀复用时 SGLang 领先。",
  "edgeCases": [
    "TRT-LLM 编译时间长影响迭代。",
    "前缀复用场景 SGLang 占优。",
    "量化支持度各框架不同。"
  ],
  "code": "# Python\ndef bench_matrix(frameworks, load, run):\n    return {f: run(f, load) for f in frameworks}   # {框架: 指标}\ndef rank_by(metric_dict, key):\n    return sorted(metric_dict, key=lambda f: -metric_dict[f][key])",
  "codeNotes": [
    "务必固定硬件/模型/负载。",
    "结论依赖负载特征。"
  ],
  "complexity": "O(框架数×压测) 重复跑。",
  "followUps": [
    {
      "question": "SGLang 为什么有时更快？",
      "answer": "其 RadixAttention 高效复用对话前缀 KV，多轮/共享前缀场景显著降 prefill 与显存。"
    },
    {
      "question": "TRT-LLM 适合什么场景？",
      "answer": "固定模型、追求极致延迟/吞吐且能接受编译成本的生产环境，尤其大 batch 稳定负载。"
    }
  ],
  "followUpAnswers": [
    "SGLang 前缀复用占优。",
    "TRT-LLM 适合稳态极致优化。"
  ],
  "pitfalls": [
    "变量未控制导致不可比。",
    "脱离自身负载下结论。"
  ],
  "beginnerSummary": "租车对比：vLLM/SGLang/TRT-LLM 像三款车，公平比法是同一条路(同负载)、同一位司机(同硬件)、同样载重(同模型)，再比油耗与速度。某车在山路快不代表平原快——得看你常跑哪条路。",
  "prerequisites": [
    "连续批处理。",
    "分页/前缀注意力。",
    "控制变量实验法。"
  ],
  "workedExample": [
    "三框架同负载：TPS 520/560/600。",
    "前缀复用场景 SGLang 领先。"
  ],
  "lineByLine": [
    "固定模型/硬件/负载。",
    "逐框架部署优化配置。",
    "跑统一脚本采集。",
    "多维对比给选型。"
  ],
  "diagram": "同负载 ──▶ [vLLM][TRT-LLM][SGLang]\n               延迟 吞吐 显存 成本\n               └─▶ 按自身流量选型"
};
