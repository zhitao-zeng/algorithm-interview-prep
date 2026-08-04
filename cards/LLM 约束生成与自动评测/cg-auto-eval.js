export default {
  "id": "cg-auto-eval",
  "category": "LLM 约束生成与自动评测",
  "difficulty": "Medium",
  "title": "自动评测：准确率 / TTFT / bad case",
  "prompt": "自动评测管线应如何同时衡量准确率、TTFT 与 bad case，从而闭环驱动模型迭代？",
  "quickAnswer": "在评测集上跑模型，统计与 gold 的准确率、记录首 token 时间 TTFT，并把错误样本自动收集为 bad case 入库，供复盘与回归。",
  "code": "import time\n\ndef auto_eval(gen_fn, dataset: list) -> dict:\n    # 自动评测：准确率 + TTFT + bad case 收集\n    correct, ttfts, bad = 0, [], []\n    for item in dataset:\n        t0 = time.time()\n        out = gen_fn(item['input'])      # 生成\n        ttfts.append(time.time() - t0)   # 端到端耗时近似 TTFT\n        if out == item['gold']:\n            correct += 1\n        else:\n            bad.append({'input': item['input'], 'pred': out, 'gold': item['gold']})\n    return {'acc': correct / len(dataset),\n            'avg_latency': sum(ttfts) / len(ttfts),\n            'bad_cases': bad}\n",
  "complexity": "时间 O(D*t)，空间 O(B)（D 样本数，t 单次耗时，B bad 数）",
  "beginnerSummary": "像工厂质检：既数‘合格品比例’，也记‘出活速度’，再把‘废品’单独摆一排供师傅研究改进。",
  "derivation": [
    "为什么需要：人工评测慢且不可规模化，需要可重复、低成本的自动指标持续监控质量与延迟。",
    "怎么实现：在固定评测集上跑模型，比对 gold 得准确率，计时得 TTFT，错误样本结构化入库。",
    "有什么代价：准确率依赖 gold 质量，TTFT 受环境抖动影响，需多次取稳。",
    "怎么评测：用人工抽标定 auto-eval 与人工结论的一致性，确认指标可信。"
  ],
  "edgeCases": [
    "gold 本身有歧义或多解，严格相等会低估，需引入 LLM-judge 软匹配。",
    "TTFT 受冷启动/排队影响，需预热与多次取中位数。",
    "bad case 量过大需聚类避免重复分析。",
    "流式输出时 TTFT 与完整耗时需分别统计。"
  ],
  "pitfalls": [
    "只用准确率忽略延迟，上线后用户感知卡顿。",
    "bad case 不回流，迭代失去方向。"
  ],
  "prerequisites": [
    "评测集与 gold 标准",
    "延迟与性能指标采集",
    "bad case 管理与聚类"
  ],
  "workedExample": [
    "100 条评测，82 条与 gold 一致 → acc=0.82，平均耗时 1.2s。",
    "18 条错误进入 bad_cases，按错误类型聚类发现‘日期格式’占多数，定向修复。"
  ],
  "lineByLine": [
    "import time：用于计时 TTFT。",
    "for item in dataset：逐条跑评测集。",
    "ttfts.append(time.time() - t0)：记录单次端到端耗时近似 TTFT。",
    "bad.append(...)：错误样本结构化收集，返回 acc/latency/bad_cases。"
  ],
  "followUps": [
    {
      "question": "严格相等低估准确率怎么办？",
      "answer": "对开放式答案引入 LLM-as-judge 或 embedding 相似度做软匹配，并在报告里区分硬/软指标。"
    },
    {
      "question": "TTFT 抖动大如何取稳？",
      "answer": "预热后跑多轮，去掉首尾取中位数，并区分 p50/p95 反映长尾体验。"
    }
  ],
  "followUpAnswers": [
    "对开放式答案引入 LLM-as-judge 或 embedding 相似度做软匹配，并在报告里区分硬/软指标。",
    "预热后跑多轮，去掉首尾取中位数，并区分 p50/p95 反映长尾体验。"
  ],
  "explanationFocus": "是什么：自动评测是用程序在固定评测集上批量跑模型，自动统计准确率、TTFT 与 bad case 的可持续质量监控管线。",
  "approach": "对评测集逐条生成并比对 gold 得准确率，计时得 TTFT，把错误样本结构化收集为 bad case 供迭代闭环。",
  "kind": "concept"
};
