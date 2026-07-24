export default {
  "kind": "concept",
  "id": "agent-observability",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "Agent 的可观测性（tracing / logging）",
  "prompt": "Agent 的可观测性（tracing / logging）怎么做？",
  "quickAnswer": "可观测性给每次运行打全链路埋点：记录每轮 prompt/输出、工具调用与参数、延迟、token、错误与决策理由，串成可回放的 trace。配合结构化日志与指标（成功率/步数/成本）与告警，使「为什么 Agent 这么做」可解释、可调试、可优化。它是把黑盒变成白盒的关键。",
  "approach": "埋点每步 → 用 trace_id 串联成结构化 trace → 聚合指标与日志 → 支持按 id 回放调试。具体是在决策/工具调用/反思等处各插一个 span，记录输入/输出/元数据，上报到日志与指标后端（如 OTel + 存储），并保留按 trace_id 检索与重放的能力。",
  "explanationFocus": "是什么：Agent 可观测性是通过对每一轮决策、工具调用、token 成本与错误做结构化的追踪（tracing）与日志（logging），使整个运行过程可监控、可回放、可解释的体系。它把多步、非确定的 Agent「黑盒」变成「白盒」，让「为什么 Agent 这么干」有迹可循。",
  "bruteForce": "只打最终答案日志：出错时完全无法定位是哪一步、哪个工具、哪句提示导致的，只能靠猜，调试如盲人摸象。",
  "derivation": [
    "为什么需要：Agent 是多步、带工具、非确定的系统，一次错误可能源于模型决策、工具返回或拼接逻辑，若无 trace 则调试如盲人摸象，线上问题无法定责与复现。",
    "怎么实现：在决策/工具/反思处插 span，记录输入/输出/元数据（延迟、token、错误、决策理由）；用 trace_id 跨步骤跨服务传播串联；上报到日志与指标系统；支持按 id 检索与回放。可基于 OpenTelemetry 等标准。",
    "有什么代价：埋点有少量运行时开销；日志可能含 PII 等敏感内容，落盘前需脱敏，增加合规成本；数据量大需采样与分级存储，否则成本失控。",
    "怎么评测：看问题定位平均时长（MTTD/MTTR）是否下降、trace 覆盖率（关键步骤是否都埋到）、回放成功率，以及脱敏是否合规、采样是否丢关键失败案例。"
  ],
  "invariant": "同一个 trace_id 必须能重建完整决策链路，缺一环即不可观测；每一环（span）都应含足够上下文（输入、输出、耗时、token）以独立解释该步。",
  "walkthrough": "排查一个误答：拿到用户投诉的 trace_id，在后端按 id 回放，发现第 3 步 retrieve 返回空列表，但模型没有走「未知」分支而是凭参数记忆编了一段。于是修复「空检索 → 转未知」逻辑。定位耗时从原来的 2 小时（翻散日志）降到 5 分钟。同时指标面板显示该 Agent 近 7 天平均 6.3 步/任务、p99 成本 $0.04、成功率 94%，异常时自动告警。",
  "edgeCases": [
    "日志含 PII（姓名/手机号/地址）：落盘前需字段级脱敏，否则合规风险。",
    "高流量需采样：全量存成本太高，可对成功 trace 抽样、失败/慢 trace 全量。",
    "trace 跨多个服务/模型：需透传 trace_id，否则链路断裂看不到完整路径。",
    "长循环 Agent：步数极多时单 trace 过大，需分段或只保留关键 span。"
  ],
  "code": "def traced_step(name, fn, span_ctx):\n    with span(span_ctx, name) as s:          # 开一个 span\n        s.set_input(serialize(fn.args))\n        out = fn()\n        s.set_output(serialize(out))         # 记录输入输出\n        s.set_metric(\"tokens\", out.tokens)\n    return out",
  "codeNotes": [
    "把每个动作（决策、工具、反思）建模为独立 span，便于按步骤回放与计时。",
    "敏感字段（用户身份、密钥）必须在 serialize 前脱敏或替换，避免隐私泄露。",
    "set_metric 记录 token/成本，便于后续按 trace 算账与设置成本告警。"
  ],
  "complexity": "埋点本身开销很小（几次字段赋值与序列化）；主要是日志存储与传输成本，长链路 + 高并发下日志量可观，需要用采样（如只全量留失败 trace、成功 trace 抽样 10%）控制。脱敏处理也在落盘前增加少量 CPU。",
  "followUps": [
    {
      "question": "tracing 和 logging 区别？",
      "answer": "logging 是离散的「事件记录」（某时刻发生了某事的一行文本），彼此无因果关联；tracing 是把一次请求/任务的多步按 trace_id 串成有向因果链（span 树），能看出先后、耗时与依赖，特别适合多步、带工具的 Agent。实践中二者互补：trace 给出链路骨架，日志填充每步细节，再叠加 metrics 看趋势。"
    },
    {
      "question": "日志里有隐私怎么办？",
      "answer": "在落盘前做字段级脱敏与合规过滤：识别 PII/密钥等敏感字段，替换为占位符或哈希；对高敏 trace 只存元信息或加密存储并限访问；同时按数据分级设定留存时长。关键是在 serialize 阶段就拦截，而不是事后删。"
    },
    {
      "question": "高并发下日志成本怎么控？",
      "answer": "采样 + 分级：失败/慢/异常 trace 全量保留（最该查的），成功 trace 抽样（如 10%）或只留聚合指标；长链路只保留关键 span；冷热分离存储（近期详存、远期降采样）。这样在可观测性与成本间取平衡。"
    }
  ],
  "followUpAnswers": [
    "logging 是离散的「事件记录」（某时刻发生了某事的一行文本），彼此无因果关联；tracing 是把一次请求/任务的多步按 trace_id 串成有向因果链（span 树），能看出先后、耗时与依赖，特别适合多步、带工具的 Agent。实践中二者互补：trace 给出链路骨架，日志填充每步细节，再叠加 metrics 看趋势。",
    "在落盘前做字段级脱敏与合规过滤：识别 PII/密钥等敏感字段，替换为占位符或哈希；对高敏 trace 只存元信息或加密存储并限访问；同时按数据分级设定留存时长。关键是在 serialize 阶段就拦截，而不是事后删。",
    "采样 + 分级：失败/慢/异常 trace 全量保留（最该查的），成功 trace 抽样（如 10%）或只留聚合指标；长链路只保留关键 span；冷热分离存储（近期详存、远期降采样）。这样在可观测性与成本间取平衡。"
  ],
  "pitfalls": [
    "只记最终结果不记过程，出错无法调试，等于没观测。",
    "日志未脱敏导致隐私泄露/合规事故。",
    "采样把失败案例丢了，恰好最需要排查的 case 没留痕。"
  ],
  "beginnerSummary": "可观测性像给快递装 GPS 和每一步拍照：包裹（任务）走到哪、谁经手、花了多久、出了啥岔子，全有记录。出了问题一查轨迹就知道卡在哪一环——是仓库发错货（工具返回错）、还是司机绕路（模型决策偏）、还是没更新状态（漏记日志）。没有它，Agent 出错就像快递丢了还没单号，完全无从查起。",
  "prerequisites": [
    "有 trace_id 传播机制（如 HTTP header、上下文对象），能跨步骤跨服务串联。",
    "能结构化记录 span（输入/输出/元数据），而非只打一行文本。",
    "有日志与指标后端（如 OTel Collector + 存储 + 面板）承接与查询。",
    "明确哪些字段敏感，需在落盘前脱敏。"
  ],
  "workedExample": [
    "回放定位：按 trace_id 回放，发现第 3 步 retrieve 返回空却仍作答，修复后该类误答下降；定位耗时从 2h 降到 5min。",
    "指标监控：面板显示平均 6.3 步/任务、p99 成本 $0.04、成功率 94%；当成功率跌破 90% 自动告警。",
    "脱敏：日志中手机号被替换为 [REDACTED]，既保留调试信息又合规。"
  ],
  "lineByLine": [
    "`with span(span_ctx, name) as s`：为当前动作开一个 span，纳入 trace 上下文。",
    "`s.set_input(serialize(fn.args))`：记录该步输入（含参数），便于回放。",
    "`out = fn()`：执行动作（模型推理或工具调用）。",
    "`s.set_output(serialize(out)); s.set_metric('tokens', out.tokens)`：记录输出与成本指标，关闭 span。"
  ],
  "diagram": "trace_id -> [step1]->[step2]->[tool]->[step3]"
};
