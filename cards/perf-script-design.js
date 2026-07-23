export default {
  "kind": "concept",
  "id": "perf-script-design",
  "category": "服务性能评测",
  "difficulty": "Hard",
  "title": "如何设计一份评测脚本",
  "prompt": "设计一份严谨的 LLM 服务性能评测脚本，应该包含哪些模块？",
  "quickAnswer": "一份严谨脚本应包含：①可配置负载(模型/并发/输入输出长度分布/时长)②带 warmup 的阶段控制③流式客户端逐 token 埋点(TTFT/TPOT)④错误与超时处理⑤分位统计与达标率⑥清缓存对照与随机样本⑦结构化报告(JSON/CSV)。核心是可控、可复现、可对照。",
  "approach": "按\"配置→warmup→加压采集→统计→对照→报告\"流水线组织，所有参数外置、结果可重跑。",
  "explanationFocus": "是什么：评测脚本设计是把负载生成、埋点采集、统计与报告组织成可复现流水线的工程方法，确保结论可信。",
  "bruteForce": "临时拼脚本跑一次：参数写死、不可复现、无对照，结论无法复用。",
  "derivation": [
    "为什么需要：手工跑不可控且易踩陷阱，脚本化才能标准化、可对比、可回归。",
    "怎么实现：用配置驱动并发与长度分布；async 客户端流式计时；集中收集样本后算分位与达标率。",
    "有什么代价：要处理异常/超时/重试与资源清理；多框架/多配置组合使脚本复杂。",
    "怎么评测：用同一脚本对不同目标跑出可比报告，支持 CI 回归。"
  ],
  "invariant": "相同配置(模型/负载/seed)多次运行应得一致指标；对照实验只差一个变量。",
  "walkthrough": "脚本读 config.yaml：并发[1,16,64]×输出[256,1024]，warmup=50，跑后输出 perfl报告含 p99 TTFT 与 TPS。",
  "edgeCases": [
    "异常请求需计入错误率不崩。",
    "配置项缺失要有默认与校验。",
    "多轮对话上下文需维持。"
  ],
  "code": "# Python\ndef run_eval(config):\n    warmup(config); samples = []\n    for _ in range(config.rounds):\n        r = async_press(config)                 # 并发加压+流式埋点\n        samples += r\n    return report(samples, config.sla)          # 分位+达标率",
  "codeNotes": [
    "参数全部外置可复现。",
    "异常不中断整体统计。"
  ],
  "complexity": "O(并发×轮次×token) 主循环。",
  "followUps": [
    {
      "question": "为什么要结构化报告？",
      "answer": "JSON/CSV 便于聚合、跨配置对比与 CI 回归，避免人读日志出错。"
    },
    {
      "question": "如何保证可复现？",
      "answer": "固定随机种子、固定负载分布、固定硬件与模型版本，并记录环境元数据。"
    }
  ],
  "followUpAnswers": [
    "结构化便于对比与回归。",
    "固定seed/负载/版本保复现。"
  ],
  "pitfalls": [
    "参数写死不可复现。",
    "异常未处理导致统计崩。"
  ],
  "beginnerSummary": "体检表：评测脚本像一套标准体检流程——先填基本信息(配置)，热身( warmup)，逐项检查并打点(埋点)，最后出结构化报告。流程固定了，不同人、不同时间去测才有可比性。",
  "prerequisites": [
    "异步压测客户端。",
    "分位统计。",
    "配置驱动思想。"
  ],
  "workedExample": [
    "config 驱动并发×长度扫描。",
    "输出 JSON 报告含 p99 与达标率。"
  ],
  "lineByLine": [
    "读取配置(负载/SLA)。",
    "warmup 后正式加压。",
    "流式埋点收集样本。",
    "统计分位并出报告。"
  ],
  "diagram": "配置→warmup→加压采集→统计→对照→报告\n   (可控)(稳态)(埋点)(分位)(清缓存)(JSON)"
};
