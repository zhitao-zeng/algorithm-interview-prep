export default {
  "kind": "concept",
  "id": "pa-fragment-reduction",
  "category": "PagedAttention",
  "difficulty": "Medium",
  "title": "显存碎片减少效果（对比连续分配）",
  "prompt": "PagedAttention 相比传统连续分配，在显存碎片上减少多少？",
  "quickAnswer": "连续分配为每个请求预留 max_len 的 KV，内部碎片约为 (max_len − 实际长度) 的整段浪费，且不可被他人利用；PagedAttention 只按需分配 block，内部碎片最多一个末块（浪费 < block_size），外部碎片几乎为零，空闲块全局复用。实测显存利用率从 20%~60% 显著提升（PagedAttention 显著降低预留浪费、外部碎片与重复 KV；但仍有末块内部碎片、block table 元数据、allocator 与 prefix cache 生命周期开销，并非永远 100%）。",
  "approach": "对比\"预留整段\"vs\"按需分块\"的未用字节占比。",
  "explanationFocus": "是什么：PagedAttention 把 KV 碎片从\"整段预留浪费\"降到\"仅末块不足一个 block 的浪费\"。",
  "bruteForce": "连续方案碎片 = B × (max_len − 实际长度) 字节。",
  "derivation": [
    "为什么需要：碎片直接决定能并发多少请求，是核心收益点。",
    "怎么实现：分块按需分配，末块之外完全贴合实际长度。",
    "有什么代价：末块仍有 < block_size 的内部碎片（ unavoidable 的小尾巴）。",
    "怎么评测：定义 利用率 = 实际KV字节 / 已分配KV字节，对比两种方案。"
  ],
  "invariant": "连续方案利用率 ≈ E[实际长度]/max_len；分页方案利用率 ≈ 1 − block_size/(2·E[实际长度])。",
  "walkthrough": "max_len=2048，实际长 300，block=16：连续利用率 300/2048≈15%；分页 300/((300+15)//16*16)=300/304≈98.7%。",
  "edgeCases": [
    "实际长度恰为 block_size 整数倍：碎片为 0。",
    "超短请求：碎片上限就是 block_size−1。",
    "请求数极多：空闲块池高效周转，外部碎片近 0。"
  ],
  "code": "# Python\ndef internal_frag(req_len, block_size):\n    last = req_len % block_size\n    return 0 if last == 0 else block_size - last   # 仅末块浪费\n\ndef utilization(req_len, block_size):\n    allocated = ((req_len + block_size - 1) // block_size) * block_size\n    return req_len / allocated",
  "codeNotes": [
    "碎片只来自末块未填满部分。",
    "利用率随实际长度增大而趋近 1。"
  ],
  "complexity": "碎片 O(B·block_size)；对比连续方案 O(B·max_len)。",
  "followUps": [
    {
      "question": "还有没有无法消除的碎片？",
      "answer": "有，每个序列最后一个 block 未填满的部分（最多 block_size−1 个 token 的 KV），以及极少量元数据开销，这是分页方案的固有限度。"
    },
    {
      "question": "利用率接近 100% 意味着能并发更多吗？",
      "answer": "是的，同样显存下可容纳更多请求的 KV，直接提升最大并发与吞吐，这也是 vLLM 高吞吐的来源之一。"
    }
  ],
  "followUpAnswers": [
    "末块尾巴是唯一残余碎片。",
    "利用率↑ ⇒ 并发↑ ⇒ 吞吐↑。"
  ],
  "pitfalls": [
    "把\"接近 100%\"理解成\"绝对 100%\"——末块仍有少量浪费。",
    "只看平均长度忽略方差对连续方案的影响。"
  ],
  "beginnerSummary": "连续方案像给每人发一整张大桌（按最大可能饭量），大多数人只坐一角，空位既不能坐人也不回收，桌子白白空着。分页方案只按实际人数摆椅子，最后一个人若只来半个，也只多占半把椅子的空——几乎没浪费。于是同样大的餐厅能招待更多客人。",
  "prerequisites": [
    "连续预留造成整段浪费。",
    "分页只分配实际所需块。",
    "利用率=实际/已分配。"
  ],
  "workedExample": [
    "连续: 实际300/预留2048≈15%。",
    "分页: 300/304≈98.7%。"
  ],
  "lineByLine": [
    "连续方案碎片=预留−实际。",
    "分页方案碎片≤末块。",
    "空闲块全局复用。",
    "利用率近 100%。"
  ],
  "diagram": "连续利用率 = 实际/预留 ≈ 15%\n分页利用率 = 实际/已分配块 ≈ 99%\n提升: 数倍并发空间"
};
