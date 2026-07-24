export default {
  "kind": "concept",
  "id": "perf-long-context",
  "category": "服务性能评测",
  "difficulty": "Medium",
  "title": "长上下文对评测的影响",
  "prompt": "输入/输出变长会如何改变 LLM 服务的性能评测结论？",
  "quickAnswer": "长输入主要拉长 Prefill(∝输入长度)并膨胀 KV Cache 显存，限制可并发数；长输出拉长 Decode 总时长与尾延迟。评测必须覆盖短/中/长多档上下文，否则在真实长文场景会严重失真甚至 OOM。",
  "approach": "构造不同输入/输出长度的负载档位，分别测 TTFT、TPS、显存与最大并发。",
  "explanationFocus": "是什么：长上下文指长输入与长输出，分别拖累 prefill 与 decode，并放大显存占用，使评测结论强烈依赖长度分布。",
  "bruteForce": "只用 512 token 短样本评测：上线长文档问答即 OOM 或延迟爆炸，结论完全失效。",
  "derivation": [
    "为什么需要：真实流量常含长文档/RAG 上下文，短样本评测乐观得危险。",
    "怎么实现：设输入长度档(1k/8k/32k)与输出档，逐档测指标与峰值显存。",
    "有什么代价：长上下文显存与耗时都大，评测成本高；需支持相应 rope/窗口配置。",
    "怎么评测：报告各档 TTFT/TPOT/最大并发，画随长度变化曲线。"
  ],
  "invariant": "Prefill∝输入长度；KV 显存∝batch×seq；端到端∝输入+输出长度。长上下文主要压显存与 prefill。",
  "walkthrough": "输入从 2k→32k，TTFT 由 0.3s 升到 4.5s，最大并发由 64 降到 8(显存限制)。",
  "edgeCases": [
    "超过训练上下文需外推/截断。",
    "稀疏注意力下长输入未必线性变慢。",
    "长输出使单请求占连接极久。"
  ],
  "code": "# Python\ndef prefill_growth(in_len, base=0.00015):\n    return in_len * base                      # TTFT 近似随输入线性\ndef max_concurrent(vram, kv_per_seq):\n    return int(vram / kv_per_seq)             # 显存决定并发",
  "codeNotes": [
    "长输入先撞 KV 显存而非算力。",
    "长输出拉长 decode 总时长。"
  ],
  "complexity": "O(长度档数×压测)。",
  "followUps": [
    {
      "question": "长输入和长输出哪个更伤吞吐？",
      "answer": "长输入伤 prefill 与显存(限并发)，长输出伤 decode 总时长；综合看长输入更易触发容量瓶颈。"
    },
    {
      "question": "如何缓解长上下文成本？",
      "answer": "prefix cache 复用、KV 量化、稀疏/滑动窗口注意力、或截断+RAG 控长。"
    }
  ],
  "followUpAnswers": [
    "长输入更易撞显存限并发。",
    "prefix cache/KV量化/稀疏注意力缓解。"
  ],
  "pitfalls": [
    "用短样本评测乐观失真。",
    "忽略 KV 显存随长度膨胀。"
  ],
  "beginnerSummary": "读书：短文章一眨眼读完(prefill 快)、写两句话就完(decode 短)；长篇小说读得久(prefill 慢)且书占桌面(显存)，同时写长篇耗时长(decode 久)。只测\"读短信\"就以为很快，读到长篇小说就傻眼。",
  "prerequisites": [
    "prefill/decode 分解。",
    "KV cache 显存。",
    "prefix cache 概念。"
  ],
  "workedExample": [
    "32k 输入 TTFT=4.5s，并发降到 8。",
    "prefix cache 复用省 prefill。"
  ],
  "lineByLine": [
    "设长度档位。",
    "逐档测 TTFT/TPS/显存。",
    "记录最大并发。",
    "画随长度变化曲线。"
  ],
  "diagram": "长度↑ → 输入长: prefill↑, KV↑(限并发)\n           → 输出长: decode 总时长↑"
};
