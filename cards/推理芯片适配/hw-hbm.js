export default {
  "id": "hw-hbm",
  "category": "推理芯片适配",
  "difficulty": "Medium",
  "title": "高带宽显存 HBM",
  "prompt": "HBM 为什么能比传统 GDDR 提供更高带宽，推理部署中又该如何扬长避短？",
  "quickAnswer": "HBM 通过硅中介层（2.5D 封装）把多颗 DRAM 裸片堆叠在芯片旁，提供极宽位宽（数千 bit）与极短走线，从而以较低频率换取超高带宽；部署时应尽量通过算子融合与片上复用减少 HBM 访问，并避免随机访问以利用突发带宽。",
  "approach": "先讲物理结构（堆叠+中介层+宽位宽）带来高带宽低功耗，再讲对部署的启示：减少访存量、提高复用、顺序访问、用双缓冲隐藏延迟。",
  "explanationFocus": "是什么：HBM（High Bandwidth Memory）是一种通过硅中介层把多片 DRAM 垂直堆叠并与芯片紧邻封装的高带宽内存技术。",
  "bruteForce": "朴素使用：算子逐层把权重与激活反复读写 HBM，不做复用，尽管 HBM 带宽高仍被频繁小访存拖慢。",
  "invariant": "在任意调度下，HBM 总带宽上限恒定，任何优化只能改变\"单位计算所需访存量\"，不能突破物理带宽。",
  "walkthrough": "以大模型推理为例：权重从 HBM 载入片上 SRAM → 融合多个算子连续计算 → 仅把最终结果写回 HBM；通过提高算术强度使计算时间贴近带宽下限。",
  "complexity": "Roofline 模型中，HBM 决定带宽屋顶；优化目标把操作点从\"带宽受限\"移向\"计算受限\"，即提升算术强度（FLOPs/Byte）。",
  "beginnerSummary": "HBM 像把仓库货架直接拼在工厂墙边（宽通道），搬货极快；但再快也怕频繁小件来回搬，所以最好一次搬够、在车间内多道工序做完。",
  "diagram": "AI Core (SRAM)\n   || high bandwidth\n   || (interposer)\nHBM Stacks (DRAM dies)",
  "code": "def arithmetic_intensity(flops, bytes_accessed):\n    if bytes_accessed <= 0:\n        return float(\"inf\")\n    return flops / bytes_accessed",
  "derivation": [
    "为什么需要：大模型与高分辨率输入使访存量爆炸，传统 GDDR 带宽成为瓶颈，需要更宽更近的内存。",
    "怎么实现：把多颗 DRAM 裸片 TSV 堆叠，经硅中介层与逻辑芯片 2.5D 集成，得到数千位宽、短走线的内存通道。",
    "有什么代价：HBM 成本高、容量相对有限且封装复杂；容量受限迫使权重需精细管理或量化。",
    "怎么评测：用带宽利用率（实测 GB/s / 峰值）、Roofline 算术强度位置与端到端时延评测访存是否仍是瓶颈。"
  ],
  "edgeCases": [
    "容量不足：模型权重超过 HBM 容量需分层卸载或量化，引入额外搬运。",
    "随机访问：非连续访问浪费突发带宽，性能远低于顺序访问。",
    "多芯片共享：跨 chip 访存走片间互联，带宽远低于本地的 HBM。",
    "热与功耗：高带宽伴随高功耗，需与计算功耗一起做整卡预算。"
  ],
  "pitfalls": [
    "只堆带宽不降访存：若算法算术强度低，HBM 带宽仍会被打满，瓶颈未解。",
    "忽视容量：按带宽选型却忽略 HBM 容量，部署时 OOM。"
  ],
  "prerequisites": [
    "内存层级与带宽/容量权衡",
    "Roofline 模型与算术强度概念"
  ],
  "workedExample": [
    "示例1：Conv+BN+ReLU 融合后中间激活不写回 HBM，访存量下降约 40%。",
    "示例2：用 INT8 量化权重，使可放入 HBM 的模型规模翻倍，减少卸载。"
  ],
  "lineByLine": [
    "def arithmetic_intensity(flops, bytes_accessed): 计算算术强度，入参为浮点运算数与访存字节数。",
    "if bytes_accessed <= 0: return inf 无访存时视为理想计算受限（避免除零）。",
    "return flops / bytes_accessed 比值越大越偏向计算受限，越能发挥 HBM 带宽价值。"
  ],
  "codeNotes": [
    "算术强度是 Roofline 的核心：提升它才能把工作点推离 HBM 带宽屋顶。"
  ],
  "followUps": [
    {
      "question": "HBM 容量有限时，大模型推理有哪些应对手段？",
      "answer": "常用分层卸载（把暂不用的层放主机内存）、权重量化（INT8/INT4）、KV Cache 分页管理与专家并行把权重分散到多卡 HBM。"
    },
    {
      "question": "为什么顺序访问对 HBM 更重要？",
      "answer": "HBM 突发传输效率高，连续大块访问能跑满峰值带宽；随机小访问利用率低，既浪费带宽也增加延迟。"
    }
  ],
  "followUpAnswers": [
    "分层卸载、权重量化、KV Cache 分页管理与专家并行分散到多卡 HBM。",
    "HBM 突发传输效率高，连续大块访问跑满峰值；随机小访问利用率低。"
  ],
  "kind": "concept"
};
