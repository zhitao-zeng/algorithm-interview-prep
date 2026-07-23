export default {
  "kind": "concept",
  "id": "agent-prod-deploy",
  "category": "Agent Workflow",
  "difficulty": "Hard",
  "title": "Agent 在生产部署的挑战",
  "prompt": "Agent 在生产环境部署面临哪些主要挑战？",
  "quickAnswer": "生产部署要把\"演示可用\"变成\"稳定、安全、可控、可观测\":包括低延迟与并发、工具/依赖的可用性与限流、成本与预算治理、安全边界与注入防护、可观测与回放、版本与回滚、以及降级与人工程序。核心是从\"能跑\"到\"可 SLA 化运营\"的体系化工程。",
  "approach": "稳定→安全→可观测→成本→降级→运维。",
  "explanationFocus": "是什么：Agent 生产部署挑战是把研究原型转化为具备稳定性、安全性、可观测性与成本可控的运营系统所面临的一整套工程问题。",
  "bruteForce": "把 demo 直接暴露公网：并发一高就崩、成本失控、出事无迹可查。",
  "derivation": [
    "为什么需要：生产有真实用户、SLA、合规与攻击面，demo 假设全不成立。",
    "怎么实现：加队列/限流/超时、工具熔断与降级、沙箱与授权、trace 与指标、预算护栏、灰度与回滚、human fallback。",
    "有什么代价：架构复杂度与运维成本高；过度防护损体验。",
    "怎么评测：看可用性、P99 延迟、成本/请求、事故恢复时间。"
  ],
  "invariant": "任何外部依赖不可用都应有降级路径，不能让单点故障拖垮整个 Agent。",
  "walkthrough": "上线客服 Agent：限流 100 QPS、检索超时 800ms 降级到缓存、支付走人工确认、全链路 trace。首月可用性 99.5%。",
  "edgeCases": [
    "上游模型限流：需排队与退避。",
    "工具大面积故障：需熔断降级。",
    "突发流量：需弹性扩容。"
  ],
  "code": "def serve(agent, req, limiter, breaker):\n    limiter.acquire()                         # 限流\n    if breaker.open(\"retriever\"):\n        return agent.run(req, use_cache=True) # 降级\n    return agent.run(req)",
  "codeNotes": [
    "依赖故障要有降级分支。",
    "限流保护后端与成本。"
  ],
  "complexity": "部署成本来自副本、队列与可观测设施；与流量成正比。",
  "followUps": [
    {
      "question": "和部署普通 API 有何不同？",
      "answer": "Agent 依赖多外部系统且行为非确定，需更强的降级、预算护栏与可观测，而非单纯扩副本。"
    },
    {
      "question": "如何做灰度发布？",
      "answer": "按流量/用户分桶，对比成功率与成本指标，异常即回滚到稳定版。"
    }
  ],
  "followUpAnswers": [
    "多依赖+非确定+需护栏。",
    "分桶对比+异常回滚。"
  ],
  "pitfalls": [
    "无降级致单点故障全崩。",
    "无预算护栏成本爆表。"
  ],
  "beginnerSummary": "上线 Agent 像开餐厅：不只菜能做(能跑)，还要排队限流(并发)、备胎食材(降级)、监控摄像头(可观测)、防偷防砸(安全)、生意差就缩桌(回滚)。缺一样就开不久。",
  "prerequisites": [
    "有稳定工具与依赖。",
    "有可观测与告警。",
    "有预算与降级策略。"
  ],
  "workedExample": [
    "限流+检索超时降级。",
    "支付动作走人工确认。"
  ],
  "lineByLine": [
    "入口加限流保护。",
    "依赖故障走熔断降级。",
    "全链路 trace 记录。",
    "异常指标触发回滚。"
  ],
  "diagram": "User -> Limiter -> Agent -> (Breaker/Degrade) -> Tools"
};
