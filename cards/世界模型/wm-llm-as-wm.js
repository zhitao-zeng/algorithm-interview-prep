export default {
  "id": "wm-llm-as-wm",
  "category": "世界模型",
  "difficulty": "Hard",
  "title": "LLM 作为世界模型",
  "prompt": "把大语言模型（LLM）当作“世界模型”来用，可行吗？它的能力与根本局限分别是什么？",
  "quickAnswer": "可行但有边界：LLM 在训练语料覆盖的“常识与符号化世界动态”上能推理状态转移（如文字游戏、程序状态），因为它隐式记忆了大量世界规律；但它缺乏精确数值/物理连续状态、空间几何与实时反馈，难以替代感知驱动的数值世界模型。",
  "approach": "把状态与动作写成文本/代码提示，让 LLM 预测下一状态或规划动作（如“当前位置 x，执行右移，下一状态？”）；可配合外部记忆、工具调用与代码执行来增强其数值与空间能力。",
  "explanationFocus": "是什么：把 LLM 当作世界模型，是指利用其在海量文本中习得的 worldly knowledge 与推理能力，以语言/代码形式描述状态与动作，让它预测环境演化或产出策略，而非训练专门的神经动力学网络。",
  "bruteForce": "朴素做法：把整个环境写成自然语言让 LLM 直接“脑补”连续物理，期望它输出精确坐标与轨迹。",
  "invariant": "不变式：对于可被语言精确描述且语料充足的离散状态转移，LLM 的预测应与规则/真实转移一致；超出其符号化经验的情形应被标记为不确定而非臆造。",
  "walkthrough": "1) 将观测与动作编码为文本/代码状态；2) 构造提示让 LLM 推演下一状态或规划；3) 解析输出并送入环境或校验器；4) 用外部工具补数值计算；5) 评估成功率与幻觉率。",
  "complexity": "说明：推理成本来自自回归生成长度与调用次数；无训练时零权重更新，但需提示工程与解析开销。",
  "beginnerSummary": "入门概览：LLM 像个“读遍百科全书的世界模拟器”——你用文字描述现状和动作，它凭常识猜接下来会发生什么。它对文字游戏很在行，但对精确物理和空间却常掉链子。",
  "diagram": "state + action (text/code)\n        |\n        v\n   [ LLM world model ]\n        |\n   +----+----+\n   v         v\nnext state   plan/action\n   |         |\nparser --> env/checker (with tools for math)",
  "code": "def llm_predict_next_state(prompt_template, state, action, llm):\n    # 用 LLM 文本推理预测环境状态变化\n    prompt = prompt_template.format(state=state, action=action)\n    return llm(prompt)",
  "derivation": [
    "为什么需要：许多任务的状态可用语言/代码表达，且无需训练专用网络即可复用 LLM 已有的世界常识做零样本规划。",
    "怎么实现：把状态-动作编码为提示，让 LLM 自回归生成下一状态或动作序列，并用解析器与外部工具保证可执行性。",
    "有什么代价：LLM 易产生幻觉、缺乏连续物理与精确数值、推理不可微且慢，难以处理高维感知输入。",
    "怎么评测：在文字/代码环境（如 ALFWorld、BABA 等）测任务成功率，并统计幻觉率与数值准确性。"
  ],
  "edgeCases": [
    "连续物理量（速度、坐标）超出语言离散描述精度，LLM 给出近似甚至错误值。",
    "长程状态需精确维护，LLM 在长上下文里遗忘或篡改早期事实。",
    "从未见过的物理机制（如新游戏）缺乏语料，预测退化为瞎猜。"
  ],
  "pitfalls": [
    "把 LLM 的流畅回答当成正确状态转移，不做环境校验导致错误累积。",
    "忽视数值与空间推理短板，直接用于需要精确控制的机器人闭环。"
  ],
  "prerequisites": [
    "提示工程与函数调用（tool use）",
    "世界模型的离散符号化表述"
  ],
  "workedExample": [
    "示例：在 BABA 语言游戏里，把物体属性写成文本，LLM 能正确推演“拿起钥匙后能否开门”。",
    "示例：用 LLM 生成代码描述环境转移并交由解释器执行，规避其数值计算弱点。"
  ],
  "lineByLine": [
    "def llm_predict_next_state(prompt_template, state, action, llm): 用 LLM 预测下一状态。",
    "prompt = prompt_template.format(state=state, action=action) 把当前状态与动作填进提示模板。",
    "return llm(prompt) 让 LLM 生成对下一状态的语言/代码描述。"
  ],
  "codeNotes": [
    "关键不在 LLM 本身精确，而在用提示把“世界动态”转为它擅长的符号推理，并用外部工具补数值短板。"
  ],
  "followUps": [
    {
      "question": "LLM 世界模型能用在机器人上吗？",
      "answer": "可作为高层规划器生成语义动作，但底层精确控制仍需传统感知-控制闭环，不能端到端替代。"
    },
    {
      "question": "如何减少 LLM 作为世界模型的幻觉？",
      "answer": "加入环境校验器/可执行代码、要求输出置信度、并用检索或工具核实关键数值。"
    },
    {
      "question": "它与神经世界模型是替代还是互补？",
      "answer": "互补：LLM 擅长符号与常识推理，神经模型擅长感知与连续动态，常组合为“语言规划+神经执行”。"
    }
  ],
  "followUpAnswers": [
    "可作为高层规划器生成语义动作，但底层精确控制仍需传统感知-控制闭环，不能端到端替代。",
    "加入环境校验器/可执行代码、要求输出置信度、并用检索或工具核实关键数值。",
    "互补：LLM 擅长符号与常识推理，神经模型擅长感知与连续动态，常组合为“语言规划+神经执行”。"
  ],
  "kind": "concept"
};
