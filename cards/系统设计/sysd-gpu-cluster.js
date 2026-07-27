export default {
  "id": "sysd-gpu-cluster",
  "kind": "concept",
  "category": "系统设计",
  "title": "GPU 集群调度：调度器、拓扑感知(NVLink)、MPS/MIG 与故障隔离",
  "difficulty": "Hard",
  "prompt": "在大规模多模态训练与推理场景下，如何设计 GPU 集群调度器，考虑拓扑感知(NVLink)、MPS/MIG 切分与故障隔离？",
  "quickAnswer": "GPU 调度器在集群层做资源分配，优先把通信密集的作业调度到同一 NVLink 域(拓扑感知)以降低互联延迟；用 MIG 把大卡切分成硬隔离小实例供推理复用，用 MPS 做多进程共享提升利用率。故障隔离上做健康探测、坏卡驱逐与任务重调度，避免单卡故障拖垮整作业。",
  "code": "from typing import List\n\ndef place(job_gpus: int, nodes: List[dict]) -> str:\n    # 拓扑感知：优先选同 NVLink 域内可满足的节点\n    for n in nodes:\n        if n['nvlink_domain_free'] >= job_gpus:\n            return n['id']\n    return 'NO_FIT'",
  "complexity": "放置 O(节点数)",
  "beginnerSummary": "GPU 集群调度像安排大型机房里的超级计算机：把需要频繁‘打电话’的任务放在同一个高速内网区(NVLink 域)里快聊；把一张大显卡切成几块小卡(MIG)给不同小任务用；某块卡坏了就把它隔离并让任务换卡重跑，不连累别人。",
  "explanationFocus": "是什么：GPU 集群调度是在多节点多显卡环境下，依据拓扑与隔离能力把训练/推理任务放置到合适 GPU 上，并在故障发生时做隔离与重调度的系统。",
  "approach": "核心思路是‘拓扑感知放置 + 切分复用 + 故障隔离’：通信密集作业优先同 NVLink 域；用 MIG 硬隔离切分、MPS 共享提升利用率；健康探测驱逐坏卡并快速重调度，配合检查点保证作业可恢复。",
  "derivation": [
    "为什么需要：多模态训练跨卡通信量大，放置不当带宽瓶颈严重；推理小任务独占大卡浪费。",
    "怎么实现：拓扑感知调度、NVLink 域优先、MIG/MPS 切分、健康探测与重调度。",
    "有什么代价：MIG 切分粒度固定、MPS 共享有干扰、拓扑约束降低调度灵活性。",
    "怎么评测：作业完成时间、互联带宽利用率、GPU 利用率、故障恢复时间。"
  ],
  "edgeCases": [
    "作业需要跨 NVLink 域的多卡，拓扑约束无法满足需跨节点走网络。",
    "MIG 实例被部分占用，剩余碎片化无法容纳新任务。",
    "单卡 ECC 错误需隔离并驱逐其上所有任务。",
    "推理与训练混跑时 MPS 共享导致互相抢占显存。"
  ],
  "pitfalls": [
    "忽略拓扑把通信密集作业分散到不同域，训练速度骤降。",
    "不做坏卡隔离，Xid 错误引发整节点任务失败重试风暴。"
  ],
  "prerequisites": [
    "GPU 互联(NVLink/PCIe)与集群调度基础",
    "MIG/MPS 切分机制与故障域概念"
  ],
  "workedExample": [
    "一个多模态大模型训练作业优先被放置到同一 NVLink 域的 8 卡节点，通信开销最低。",
    "推理小模型用单卡切出的 MIG 实例部署，利用率从 15% 提升到 70%。"
  ],
  "lineByLine": [
    "def place 遍历节点，优先返回同 NVLink 域内空闲 GPU 足够的节点以降低通信延迟。",
    "若无任何节点满足拓扑约束则返回 NO_FIT，交由上层放宽约束或排队。"
  ],
  "followUps": [
    {
      "question": "MIG 与 MPS 该怎么选？",
      "answer": "MIG 适合需要硬隔离、互不干扰的推理多租户场景；MPS 适合同一信任域内多进程共享提升利用率但隔离弱，按隔离需求与信任边界选择。"
    },
    {
      "question": "坏卡如何不影响整个训练作业？",
      "answer": "调度器做 ECC/Xid 健康探测，标记坏卡并驱逐其上任务；训练框架配合弹性成员与检查点，剔除坏卡后其余卡续跑。"
    }
  ],
  "followUpAnswers": [
    "MIG 适合需要硬隔离、互不干扰的推理多租户场景；MPS 适合同一信任域内多进程共享提升利用率但隔离弱，按隔离需求与信任边界选择。",
    "调度器做 ECC/Xid 健康探测，标记坏卡并驱逐其上任务；训练框架配合弹性成员与检查点，剔除坏卡后其余卡续跑。"
  ],
  "order": 17
};
