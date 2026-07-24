export default {
  "kind": "concept",
  "id": "agent-autonomous-vs-constrained",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "自主（autonomous）vs 受控（constrained）Agent",
  "prompt": "自主（autonomous）Agent 和受控（constrained）Agent 有什么区别，怎么选？",
  "quickAnswer": "区别在于\"决策自由度与人工介入程度\"：自主 Agent 自己定计划、选工具、连跑多步少打断，适合探索/后台任务；受控 Agent 每步或关键动作需确认、工具白名单窄、可随时暂停，适合高风险/面向用户场景。选择取决于风险、可逆性与合规要求。",
  "approach": "按风险/可逆性定自由度→设确认点→可随时接管。",
  "explanationFocus": "是什么：自主与受控是 Agent 的两种运行范式——前者高自由度少干预，后者强约束多确认，按风险与场景取舍。",
  "bruteForce": "要么全自动要么全手动：忽略了\"分级控制\"的中间态。",
  "derivation": [
    "为什么需要：不同任务对\"出错代价\"敏感度不同，统一模式不经济。",
    "怎么实现：用权限/工具集/确认点三个旋钮调节；自主=宽工具+无确认+高步数，受控=窄工具+关键确认+可暂停。",
    "有什么代价：自主易失控烧钱/越权，受控则体验 friction 高、吞吐低。",
    "怎么评测：看任务自主完成率、人工介入率、事故率。"
  ],
  "invariant": "无论自由度高低，不可逆的高危动作始终需显式授权。",
  "walkthrough": "数据清洗=自主跑全量；发对外邮件=受控，每封需确认。前者省人力，后者防事故。",
  "edgeCases": [
    "自主跑飞需自动熔断。",
    "受控确认疲劳致用户盲点确认。",
    "同一任务不同阶段需切换模式。"
  ],
  "code": "def make_agent(mode):\n    if mode == \"auto\":\n        return Agent(tools=ALL, confirm=False, max_steps=50)\n    return Agent(tools=SAFE, confirm=True, max_steps=8)  # 受控",
  "codeNotes": [
    "用工具集与确认点两个旋钮。",
    "高危动作不受模式影响需授权。"
  ],
  "complexity": "受控因确认引入人机往返延迟；自主成本更平滑但风险敞口大。",
  "followUps": [
    {
      "question": "什么时候该用自主？",
      "answer": "任务可逆、低风险、需规模化或探索性强时，如数据整理、实验脚本生成。"
    },
    {
      "question": "受控会不会降低效果？",
      "answer": "会加摩擦但提安全；可用\"默认可逆自动、不可逆必确认\"折中。"
    }
  ],
  "followUpAnswers": [
    "可逆低风险才自主。",
    "可逆自动+不可逆确认。"
  ],
  "pitfalls": [
    "对高风险任务过度自主。",
    "受控确认疲劳致形式化。"
  ],
  "beginnerSummary": "自主像让实习生自己跑腿办事(高效但可能出错)，受控像财务每笔支出要老板签字(慢但稳)。重要的事签字，杂事放手。",
  "prerequisites": [
    "能评估任务风险/可逆性。",
    "有确认与暂停机制。",
    "可调节工具白名单。"
  ],
  "workedExample": [
    "数据清洗用自主模式。",
    "对外发信走受控确认。"
  ],
  "lineByLine": [
    "评估任务风险与可逆性。",
    "自主=宽工具少确认。",
    "受控=窄工具多确认。",
    "高危动作始终需授权。"
  ],
  "diagram": "Auto: goal -> run freely\nConstrained: goal -> step -> confirm -> step"
};
