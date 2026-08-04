export default {
  "id": "de-pipeline-orchestration",
  "category": "多模态数据工程",
  "difficulty": "Medium",
  "title": "数据 pipeline 编排",
  "prompt": "如何设计与编排大规模多模态数据清洗 pipeline（去重、过滤、标注、格式转换）以保证可复现与可观测？",
  "quickAnswer": "把每个处理步骤做成幂等的原子算子（算子化），用编排框架（如 Airflow/Argo/Beam）串成 DAG，统一元数据与血缘追踪，并用可重放的 checkpoint 与指标埋点保证可复现与可观测。",
  "approach": "核心思路是“一切皆可重放的 DAG”。将抓取、清洗、去重、过滤、标注、转格式拆成无状态/幂等算子，通过配置定义 DAG 与并行度；每个算子产出带统计的元数据，写入数据血缘系统，失败可从 checkpoint 续跑。",
  "explanationFocus": "是什么：数据 pipeline 编排是把多模态数据从原始态到训练就绪态的各环节，组织成可调度、可监控、可重放的有向无环图（DAG）的工程实践。",
  "bruteForce": "朴素做法：写一堆顺序 shell/Python 脚本手动依次跑，出错从头再来。缺点是无法并行、无血缘、难复现、出问题难定位。",
  "invariant": "不变式：对任意算子，相同输入 + 相同配置必然产生相同输出（幂等）；DAG 中任意节点的重跑不影响其他已完成节点的结果正确性。",
  "walkthrough": "1) 拆算子并定义 I/O 契约；2) 用编排框架声明 DAG 与资源；3) 接对象存储与元数据目录；4) 配置 checkpoint 与重试；5) 埋指标（吞吐、丢弃率、质量分布）并告警；6) 版本化配置以支持复现。",
  "complexity": "说明：编排本身 O(operators)，并行收益随算子树深度线性扩展；瓶颈通常是去重与标注算子的计算与 IO，需要分片与背压控制。",
  "beginnerSummary": "入门概览：清洗海量多模态数据不能靠一条脚本硬跑。我们把每一步做成可独立重跑的小模块，用流程图画好先后顺序，并全程记录每一步产出了什么、丢了多少。",
  "diagram": "[raw] -> [dedup] -> [filter] -> [annotate]\n                                     |\n                                [convert] -> [train-ready]\n   ^__________ metadata / lineage _________^",
  "code": "class Operator:\n    def __init__(self, name): self.name = name\n    def run(self, batch):\n        raise NotImplementedError\n\ndef orchestrate(dag, batch):\n    for op in dag:\n        batch = op.run(batch)\n    return batch",
  "derivation": [
    "为什么需要：多模态数据环节多、规模大、易出错，手动脚本无法并行与复现，必须系统化编排以控制成本与质量。",
    "怎么实现：将环节算子化并定义 I/O 与幂等契约，用 DAG 编排框架声明依赖与并行度，接入存储、元数据与血缘，配 checkpoint/重试与指标告警。",
    "有什么代价：编排框架与元数据系统本身有运维成本；过度细拆算子会带来调度开销，需要在粒度上权衡。",
    "怎么评测：用端到端吞吐、各算子丢弃率与重跑成功率度量；可复现性通过“同配置重跑产出字节一致/哈希一致”验证。"
  ],
  "edgeCases": [
    "部分分片失败需支持断点续跑而非全量重来，否则成本爆炸。",
    "算子配置变更后旧产出未标记版本，导致血缘混乱。",
    "上游数据格式偷偷变化，下游算子契约未覆盖，需 schema 校验前置。",
    "超大元数据写入成为瓶颈，需批量异步落库。"
  ],
  "pitfalls": [
    "算子非幂等（如写入带时间戳）导致重跑产生脏数据。",
    "只监控整体成功与否，不埋单算子丢弃率，质量问题被掩盖。"
  ],
  "prerequisites": [
    "DAG 与流水线编排概念",
    "对象存储与数据版本/血缘基础"
  ],
  "workedExample": [
    "DAG：抓取→MinHash 去重→质量过滤→奖励标注→WebDataset 转换；去重算子失败重跑仅覆盖该分片。",
    "指标：过滤算子丢弃率从 40% 涨到 75%，触发告警发现上游爬虫引入了垃圾页。"
  ],
  "lineByLine": [
    "class Operator：定义算子基类，统一接口。",
    "def run(self, batch)：每个算子处理一批数据并返回新批次。",
    "def orchestrate(dag, batch)：按 DAG 顺序串联执行算子。",
    "for op in dag：遍历有向图中的算子。",
    "batch = op.run(batch)：把上一步输出作为下一步输入，形成流水线。"
  ],
  "codeNotes": [
    "生产环境应在 run 内实现 checkpoint 与幂等写入，而非仅做顺序执行。"
  ],
  "followUps": [
    {
      "question": "如何保证 pipeline 产出的可复现性？",
      "answer": "对配置、代码、数据版本全部哈希化并记录到元数据，算子幂等且写入带内容寻址；同哈希输入必产生同哈希输出，可被独立重放验证。"
    },
    {
      "question": "批式与流式为多模态数据该选哪种？",
      "answer": "离线大规模清洗用批式（成本低、易去重）；近实时数据补充可用微批流式，但需在去重与一致性上额外处理，多数预训练以批式为主。"
    }
  ],
  "followUpAnswers": [
    "对配置、代码、数据版本全部哈希化并记录到元数据，算子幂等且写入带内容寻址；同哈希输入必产生同哈希输出，可被独立重放验证。",
    "离线大规模清洗用批式（成本低、易去重）；近实时数据补充可用微批流式，但需在去重与一致性上额外处理，多数预训练以批式为主。"
  ],
  "kind": "concept"
};
