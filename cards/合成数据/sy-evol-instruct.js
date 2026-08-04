export default {
  "id": "sy-evol-instruct",
  "category": "合成数据",
  "difficulty": "Medium",
  "title": "Evol-Instruct 指令进化",
  "prompt": "Evol-Instruct 是如何通过\"指令进化\"把简单指令改写成更复杂指令来扩充训练数据的？",
  "quickAnswer": "用 LLM 自身作为改写器，在\"深度进化\"(增加推理/约束步骤)与\"广度进化\"(覆盖新技能)两类提示下迭代改写种子指令，再用裁判过滤低质样本，从而自动生成大量高复杂度指令-响应对。",
  "approach": "两阶段：先定义深度与广度进化提示模板；再用 LLM 对每条种子指令迭代改写多轮生成更复杂变体；最后用启发式加 LLM 打分过滤，保留语义一致且确实更复杂的样本，与种子合并去重。",
  "explanationFocus": "是什么：Evol-Instruct 是一种用 LLM 自我改写、让指令逐步\"进化\"得越来越难的自动化数据合成范式，由 WizardLM 提出。",
  "bruteForce": "朴素做法：人工手写几百条复杂指令，显然不可扩展且质量参差、风格单一。",
  "invariant": "每条进化后的指令必须与原指令语义一致(指向同一任务)，且复杂度严格单调不降。",
  "walkthrough": "取一条\"翻译这句话\"种子，深度进化提示要求加入术语约束与多步推理，LLM 产出\"先把技术文档列出术语表再译为英文\"，裁判确认更难且可执行后入库。",
  "complexity": "成本主要来自改写 LLM 与裁判 LLM 的调用；改写约 O(N*M)(N 指令乘 M 轮)，可并行化，瓶颈在裁判吞吐。",
  "beginnerSummary": "让模型自己把简单题目改难，改完只保留真正变难且没跑题的那批拿来训练——这就是 Evol-Instruct 的核心思路。",
  "diagram": "seed instr --(depth/breadth prompt)--> LLM rewrite --> candidate\ncandidate --judge: harder & on-topic?--> keep / drop\nkeep + seed --dedup--> augmented training set",
  "code": "def evolve_instruction(seed, llm, judge, rounds=4):\n    cur = seed\n    for _ in range(rounds):\n        tpl = DEPTH_TPL if random() < 0.5 else BREADTH_TPL\n        cand = llm(tpl.format(instr=cur))\n        if judge.harder(cand, cur) and judge.on_topic(cand, cur):\n            cur = cand\n    return cur",
  "derivation": [
    "为什么需要：人工标注复杂指令成本高、规模受限，而模型在简单数据上训练难以获得强推理与泛化能力，需要自动化制造高难度样本。",
    "怎么实现：用 LLM 配深度/广度两类进化提示，对种子指令迭代改写多轮，生成更复杂变体，再用裁判模型过滤掉退化或跑题样本。",
    "有什么代价：多轮改写与裁判带来显著算力与延迟开销；若裁判过严会丢样本、过松会引入噪声；存在分布偏移与自我强化风险。",
    "怎么评测：在学术基准(如 MMLU/MT-Bench)上比较用进化数据训练的模型与基线，并做人工抽检验证指令确实更难且可执行。"
  ],
  "edgeCases": [
    "改写后指令与原意偏离(跑题)，需用语义一致性裁判拦截。",
    "多轮进化后指令过难或自相矛盾，导致无有效回答，需设复杂度上限。",
    "种子本身质量差时进化会放大噪声，需先对种子做质量初筛。",
    "广度进化覆盖到训练集已有技能造成重复，需去重。"
  ],
  "pitfalls": [
    "只用深度进化会让指令越来越像推理题，丧失技能多样性，应混合广度进化。",
    "裁判与改写用同一模型易形成正反馈循环，建议解耦或引入人工抽检。"
  ],
  "prerequisites": [
    "了解指令微调(SFT)与训练数据对模型能力的影响。",
    "熟悉用 LLM 作为改写器与打分器的基本提示工程。"
  ],
  "workedExample": [
    "种子：\"把这句话翻译成英文\" -> 深度进化：\"先列出专业术语表，再将该段技术文档译为英文并保持术语一致\"。",
    "种子：\"写一段排序代码\" -> 广度进化：\"写一段可在分布式环境下对乱序日志按时间戳归并排序的代码并说明边界\"。"
  ],
  "lineByLine": [
    "def evolve_instruction(seed, llm, judge, rounds=4): 定义改写函数，接收种子、改写模型、裁判与轮数。",
    "tpl = DEPTH_TPL if random() < 0.5 else BREADTH_TPL 随机选深度或广度进化模板以兼顾难度与多样性。",
    "if judge.harder(cand, cur) and judge.on_topic(cand, cur): 仅当候选确实更难且未跑题才接受，保证不变量。",
    "return cur 返回最终进化出的指令，作为扩充样本。"
  ],
  "codeNotes": [
    "judge.harder 与 judge.on_topic 应解耦自 llm，避免自我强化；可接规则或独立小模型。"
  ],
  "followUps": [
    {
      "question": "深度进化与广度进化如何配比？",
      "answer": "WizardLM 采用约各半的随机混合，深度提升复杂度、广度拓展技能覆盖，比例可按目标能力做消融调优。"
    },
    {
      "question": "如何防止进化数据分布偏离真实用户？",
      "answer": "在种子侧保留真实指令占比，并定期用人工或独立裁判抽检，必要时对进化比例做退火。"
    }
  ],
  "followUpAnswers": [
    "WizardLM 采用约各半的随机混合，深度提升复杂度、广度拓展技能覆盖，比例可按目标能力做消融调优。",
    "在种子侧保留真实指令占比，并定期用人工或独立裁判抽检，必要时对进化比例做退火。"
  ],
  "kind": "concept"
};
