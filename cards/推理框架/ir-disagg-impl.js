export default {
  "id": "ir-disagg-impl",
  "category": "推理框架",
  "difficulty": "Hard",
  "title": "prefill/decode 分离实现",
  "prompt": "prefill/decode 分离（disaggregation）如何通过把两个阶段放到不同实例来提升集群效率？",
  "quickAnswer": "将算力密集的 prefill 与访存密集的 decode 分到不同 GPU 池，各自按负载独立扩缩容，并通过高速传输把 prefill 产出的 KV 发给 decode 实例。",
  "approach": "prefill 池处理整段提示生成首 token 与 KV；KV 经 CPU/NVLink/网络传到 decode 池；decode 池只做单步增量解码，两池按各自瓶颈独立调度。",
  "explanationFocus": "是什么：prefill/decode 分离是把 LLM 推理的两个阶段部署到不同实例或 GPU 组的架构：prefill 算力密集、decode 访存密集，分离后可分别优化与扩缩，避免互相干扰。",
  "bruteForce": "朴素做法：同实例混跑 prefill 与 decode（如连续批），长 prefill 会抢占算力造成 decode TPOT 抖动。",
  "invariant": "不变式：decode 实例收到的 KV 与本地 prefill 生成的 KV 数值一致，且 token 位置编号连续，保证注意力结果等价。",
  "walkthrough": "执行追踪：请求先入 prefill 池算出 KV 与首 token；KV 经传输层搬到 decode 池对应槽位；decode 池接管后续逐 token 生成直至 EOS。",
  "complexity": "说明：两阶段各自资源利用率更高、可独立扩缩；代价是 KV 传输开销与跨实例调度、需保证 KV 一致性与故障恢复。",
  "beginnerSummary": "prefill 吃算力、decode 吃带宽，挤一起互相拖累。分离后各用各的显卡池，prefill 算完把 KV 传给 decode 接着生成。",
  "diagram": "[prefill pool] --KV transfer--> [decode pool]\n  算力密集                  访存密集\n  算首 token + KV            逐 token 生成",
  "code": "def route(req, prefill_pool, decode_pool, transport):\n    kv, first = prefill_pool.compute(req)   # 算力密集\n    slot = decode_pool.acquire()\n    transport.send(kv, slot)                # 高速传 KV\n    return decode_pool.stream(req, slot, first)",
  "derivation": [
    "为什么需要：prefill 与 decode 资源画像相反，混跑时 prefill 的长计算会制造 decode 延迟尖刺，降低 SLO 达标率。",
    "怎么实现：部署独立 prefill/decode 实例池；prefill 完成首 token 与 KV 后，经 NVLink/RDMA/CPU 传输把 KV 搬到 decode 实例；decode 仅做增量步。",
    "有什么代价：引入 KV 跨实例传输延迟与带宽消耗，需传输层与一致性保障；调度更复杂，要考虑 KV 命中和失败重算。",
    "怎么评测：对比分离前后 decode TPOT P99、prefill TTFT 与集群整体吞吐/成本，验证 SLO 改善与传输开销可接受。"
  ],
  "edgeCases": [
    "KV 传输途中 decode 实例故障需重传或回退到本地 prefill。",
    "极短请求 prefill 几乎无收益，分离反而增传输开销，需阈值判断。",
    "跨节点传输 KV 受网络带宽限制，需压缩或就近放置。",
    "位置编码（如 RoPE 基数）在两池必须一致，否则 KV 不兼容。"
  ],
  "pitfalls": [
    "两池 RoPE/位置设置不一致，decode 用错 KV 导致生成乱码。",
    "忽略 KV 传输延迟，使 decode 空等反而比同实例更慢。"
  ],
  "prerequisites": [
    "prefill 与 decode 两阶段的资源特征",
    "KV Cache 结构与跨设备传输"
  ],
  "workedExample": [
    "prefill 池用高算力卡算 2048 token 提示，KV 经 NVLink 传到 decode 池的 A10，decode 以稳定 TPOT 续写。",
    "流量以长提示为主时 prefill 池扩容、decode 池缩容；以短对话为主时反向调整，资源更匹配。"
  ],
  "lineByLine": [
    "prefill_pool.compute 完成整段提示的前向并产出 KV 与首 token。",
    "transport.send 把 KV 搬到 decode 实例指定槽位，是分离架构的关键路径。",
    "decode_pool.stream 接管后续逐 token 生成，复用已传 KV 不做重复 prefill。"
  ],
  "codeNotes": [
    "生产系统常把 KV 传输与 decode 调度解耦，用 KV 缓存路由层（如 DilM/KV 中转）降低跨池耦合与重传成本。"
  ],
  "followUps": [
    {
      "question": "KV 传输用什么方式最快？",
      "answer": "同机多卡用 NVLink/Link 直接拷贝最快；跨节点用 RDMA（如 GPUDirect）减少 CPU 中转；极端场景可对 KV 做量化压缩后再传。"
    },
    {
      "question": "分离架构何时不划算？",
      "answer": "当请求普遍很短、KV 传输开销超过 prefill/decode 隔离收益，或集群规模小、传输带宽受限时，混跑（连续批）更经济。"
    }
  ],
  "followUpAnswers": [
    "同机多卡用 NVLink/Link 直接拷贝最快；跨节点用 RDMA（如 GPUDirect）减少 CPU 中转；极端场景可对 KV 做量化压缩后再传。",
    "当请求普遍很短、KV 传输开销超过 prefill/decode 隔离收益，或集群规模小、传输带宽受限时，混跑（连续批）更经济。"
  ],
  "kind": "concept"
};
