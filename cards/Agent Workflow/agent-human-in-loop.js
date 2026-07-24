export default {
  "kind": "concept",
  "id": "agent-human-in-loop",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "人类在环（human-in-the-loop）",
  "prompt": "Agent 里的人类在环（human-in-the-loop）是怎么做的？",
  "quickAnswer": "HITL 在 Agent 运行到\"需判断/授权/纠偏\"的点时暂停，把上下文与建议推给人类，待其确认、修改或补充后继续。常用 checkpoint(关键动作前确认)、approve/reject(审核)、on-error-escalation(出错升级)、active-feedback(标注纠偏)。它用人工判断力补模型不确定性，兼顾自动化与安全。",
  "approach": "设检查点→推送上下文→等人工决策→续跑。",
  "explanationFocus": "是什么：Human-in-the-loop 是在 Agent 的关键或不确定节点插入人工确认、授权与纠偏，让人与 Agent 协同决策的机制。",
  "bruteForce": "全自动无人工：高风险动作一旦出错不可逆，且无纠偏通道。",
  "derivation": [
    "为什么需要：模型有不确定与越权风险，关键决策需人类责任主体把关。",
    "怎么实现：定义断点(如支付前)；序列化当前状态推送 UI；人确认/改参/拒；结果回流续跑；出错自动升级人工。",
    "有什么代价：引入人机往返延迟；依赖人可用性；设计不当致确认疲劳。",
    "怎么评测：看人工介入率、确认通过率、事故拦截率。"
  ],
  "invariant": "人工决策必须可序列化回灌并改变后续轨迹，不能\"问了白问\"。",
  "walkthrough": "合同生成：Agent 起草→在\"发送客户\"前 checkpoint 推给法务→法务改 1 处条款并确认→续发。拦截 1 处风险表述。",
  "edgeCases": [
    "人长时间不响应：需超时与默认策略。",
    "确认疲劳致盲签：需风险分级提示。",
    "人工改后被模型忽略：需强制采用。"
  ],
  "code": "def hitl_checkpoint(state, human):\n    payload = serialize(state)                # 推送上下文\n    decision = human.review(payload)          # 等待人工\n    if decision.action == \"edit\":\n        state = apply_edit(state, decision.patch)\n    elif decision.action == \"reject\":\n        raise AbortedByHuman()\n    return state                              # 回灌续跑",
  "codeNotes": [
    "断点只设在真正关键处。",
    "人工编辑必须被采用。"
  ],
  "complexity": "成本主要是人机往返延迟；模型侧仅一次暂停/恢复。",
  "followUps": [
    {
      "question": "HITL 会不会拖慢系统？",
      "answer": "会加延迟，但只应在高风险/不确定点设断点，并用异步与批量降低摩擦。"
    },
    {
      "question": "哪些点必须人工？",
      "answer": "不可逆、对外、合规相关动作(付款、发送、删除)以及模型低置信决策。"
    }
  ],
  "followUpAnswers": [
    "仅关键断点+异步降摩擦。",
    "不可逆/对外/低置信必人工。"
  ],
  "pitfalls": [
    "断点过多致确认疲劳。",
    "人工决策未被真正采用。"
  ],
  "beginnerSummary": "HITL 像重要文件要领导签字：AI 草拟好，在\"发出去\"前弹出给负责人看，他改一改或点头，流程才继续。既自动化又有人兜底。",
  "prerequisites": [
    "能定义关键断点。",
    "有推送与回收人工决策的通道。",
    "状态可序列化暂停/恢复。"
  ],
  "workedExample": [
    "发送前 checkpoint 推法务。",
    "法务改条款后确认续发。"
  ],
  "lineByLine": [
    "在断点序列化状态。",
    "推送给人工审核。",
    "等待确认/编辑/拒绝。",
    "决策回灌续跑或终止。"
  ],
  "diagram": "Agent --pause--> Human --decision--> Agent"
};
