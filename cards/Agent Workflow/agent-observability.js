export default {
  "kind": "concept",
  "id": "agent-observability",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "Agent 的可观测性（tracing / logging）",
  "prompt": "Agent 的可观测性（tracing / logging）怎么做？",
  "quickAnswer": "可观测性给每次运行打全链路埋点：记录每轮 prompt/输出、工具调用与参数、延迟、token、错误与决策理由，串成可回放的 trace。配合结构化日志与指标(成功率/步数/成本)与告警，使\"为什么 Agent 这么做\"可解释、可调试、可优化。它是把黑盒变成白盒的关键。",
  "approach": "埋点每步→结构化 trace→指标聚合→回放调试。",
  "explanationFocus": "是什么：Agent 可观测性是通过对每轮决策、工具调用、成本与错误做结构化追踪与日志，使运行过程可监控、可回放、可解释的体系。",
  "bruteForce": "只打最终答案日志：出错时完全无法定位是哪步、哪个工具、哪句提示的问题。",
  "derivation": [
    "为什么需要：Agent 多步非确定，无 trace 则调试如盲人摸象。",
    "怎么实现：在决策/工具/反思处插 span；记录输入/输出/元数据；trace_id 串联；上报指标与日志系统；支持按 id 回放。",
    "有什么代价：埋点有少量开销；日志含可能敏感内容需脱敏；数据量大需采样。",
    "怎么评测：看问题定位时长、trace 覆盖率、回放成功率。"
  ],
  "invariant": "同一个 trace_id 必须能重建完整决策链路，缺一环即不可观测。",
  "walkthrough": "排查误答：按 trace_id 回放→发现第 3 步检索返回空却仍作答→修复\"空检索转未知\"。定位耗时从 2 小时降到 5 分钟。",
  "edgeCases": [
    "日志含 PII 需脱敏。",
    "高流量需采样保成本。",
    "trace 跨服务需传播 id。"
  ],
  "code": "def traced_step(name, fn, span_ctx):\n    with span(span_ctx, name) as s:          # 开一个 span\n        s.set_input(serialize(fn.args))\n        out = fn()\n        s.set_output(serialize(out))         # 记录输入输出\n        s.set_metric(\"tokens\", out.tokens)\n    return out",
  "codeNotes": [
    "每个动作都是独立 span。",
    "敏感字段需在记录前脱敏。"
  ],
  "complexity": "埋点开销很小；主要是日志存储与传输成本，可用采样控制。",
  "followUps": [
    {
      "question": "tracing 和 logging 区别？",
      "answer": "logging 是离散事件记录，tracing 是把多步按 trace_id 串成因果链，更适合多步 Agent。"
    },
    {
      "question": "日志里有隐私怎么办？",
      "answer": "在落盘前做字段级脱敏与合规过滤，并对敏感 trace 加密或仅存元信息。"
    }
  ],
  "followUpAnswers": [
    "tracing 串联因果链。",
    "落盘前脱敏+合规。"
  ],
  "pitfalls": [
    "只记结果不记过程，无法调试。",
    "日志未脱敏致隐私泄露。"
  ],
  "beginnerSummary": "可观测性像给快递装 GPS 和每一步拍照：包裹(任务)走到哪、谁经手、花了多久、出了啥岔子，全有记录。出问题一查轨迹就知卡在哪一环。",
  "prerequisites": [
    "有 trace_id 传播机制。",
    "能结构化记录 span。",
    "有日志/指标后端。"
  ],
  "workedExample": [
    "按 trace_id 回放定位空检索。",
    "指标聚合看平均步数。"
  ],
  "lineByLine": [
    "为每个动作开 span。",
    "记录输入/输出/元数据。",
    "用 trace_id 串联全链。",
    "上报指标支持回放。"
  ],
  "diagram": "trace_id -> [step1]->[step2]->[tool]->[step3]"
};
