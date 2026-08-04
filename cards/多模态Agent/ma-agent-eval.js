export default {
  "id": "ma-agent-eval",
  "category": "多模态Agent",
  "difficulty": "Medium",
  "title": "Agent 评测基准",
  "prompt": "评测一个多模态操作 Agent 的能力，应该覆盖哪些维度，常用基准有哪些？",
  "quickAnswer": "应覆盖任务成功率、步骤效率、鲁棒性、安全合规与可解释性；常用基准包括网页类的 WebArena/Mind2Web、桌面/OS 类的 OSWorld、手机类的 AndroidEnv，以及 agent 框架类的 AgentBench，配合轨迹级与结果级双重指标。",
  "approach": "把评测拆成\"做没做成（结果）\"与\"怎么做成（过程）\"两层：结果看任务完成率，过程看步数、回滚次数与危险动作率，再用多环境保证泛化。",
  "explanationFocus": "是什么：Agent 评测基准是一套标准化环境、任务与指标，用来公平衡量多模态 Agent 在真实界面（网页、桌面、手机）上完成指令的能力；它不仅看最终是否成功，还考察步骤效率、出错恢复与安全性，避免\"凑巧成功\"被误判为能力强。",
  "bruteForce": "只用几个手造样例或只盯最终答案，会被 Agent 的侥幸路径骗过，且不同论文环境不同无法横向比较。",
  "invariant": "同一任务在评测中的成功判定准则固定且可复现，环境初始化状态一致，保证分数可横向对比。",
  "walkthrough": "①固定环境初始化；②下发标准任务指令；③记录 Agent 轨迹与最终状态；④按 rubric 判成功与否；⑤聚合成功率、步数、危险率等指标。",
  "complexity": "评测成本与任务数×平均步数成正比，真实环境交互慢，大规模评测往往需并行容器或模拟器加速。",
  "beginnerSummary": "就像给学生统考：题目统一、评分标准统一、还要看解题步骤规不规范，而不是看谁碰巧蒙对。",
  "diagram": "env init -> task -> agent trace\n                          |\n                     rubric score\n                          |\n               success / steps / risk",
  "code": "def evaluate(agent, tasks, env):\n    scores = []\n    for t in tasks:\n        env.reset(t.seed)\n        traj = agent.run(t.instruction, env)\n        scores.append({\n            'success': rubric(t, traj),\n            'steps': len(traj),\n            'risky': count_risky(traj),\n        })\n    return aggregate(scores)",
  "derivation": [
    "为什么需要：各家用不同环境自说自话，无法判断 Agent 真实进步，需要统一、可复现的考场。",
    "怎么实现：提供可重置的标准环境、明确任务集与成功判定，记录轨迹并计算成功率/效率/风险等多维指标。",
    "有什么代价：搭建与维护真实环境昂贵，模拟器与真实有差距；rubric 设计主观会影响可比性。",
    "怎么评测：用多个公开基准横向对比，报告结果与过程双重指标，并做少样本/扰动下的鲁棒性测试。"
  ],
  "edgeCases": [
    "环境随机初始化导致同任务难度波动，需固定 seed 多跑取均值。",
    "任务有多种成功路径，rubric 只认一种会低估 Agent。",
    "模拟器不支持某原生弹窗，使部分任务无法评。"
  ],
  "pitfalls": [
    "只看成功率忽略步数与危险率，掩盖低效或高风险的\"成功\"。",
    "在训练集同源基准上刷分，导致泛化能力被高估。"
  ],
  "prerequisites": [
    "可重置、可观测的交互环境",
    "任务成功判定的 rubric 设计"
  ],
  "workedExample": [
    "WebArena：在自建网站完成购物/论坛类指令，判最终页面状态。",
    "OSWorld：跨桌面应用做文件与设置操作，测端到端成功率。"
  ],
  "lineByLine": [
    "env.reset 固定初始状态，是结果可复现的前提。",
    "rubric 把轨迹与任务期望比对，输出是否成功而非仅看最终截图。",
    "aggregate 综合多维指标，避免单点指标误导结论。"
  ],
  "codeNotes": [
    "count_risky 与 success 并列上报，让\"危险的成功\"暴露出来。"
  ],
  "followUps": [
    {
      "question": "结果级和过程级指标怎么取舍？",
      "answer": "以结果级为主结论，过程级（步数、回滚、危险率）作质量补充，二者结合才全面。"
    },
    {
      "question": "为什么需要多个基准？",
      "answer": "单一环境易过拟合，多环境（网页/桌面/手机）覆盖不同界面模态，更能反映真实泛化。"
    }
  ],
  "followUpAnswers": [
    "以结果级为主结论，过程级（步数、回滚、危险率）作质量补充，二者结合才全面。",
    "单一环境易过拟合，多环境（网页/桌面/手机）覆盖不同界面模态，更能反映真实泛化。"
  ],
  "kind": "concept"
};
