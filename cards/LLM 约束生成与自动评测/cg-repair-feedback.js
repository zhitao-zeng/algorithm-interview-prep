export default {
  "id": "cg-repair-feedback",
  "category": "LLM 约束生成与自动评测",
  "difficulty": "Medium",
  "title": "repair-with-feedback 程序化修复",
  "prompt": "repair-with-feedback 相比直接靠 Prompt 软约束，为什么更能稳定保证生成合规？",
  "quickAnswer": "它把‘约束’从自然语言软要求变成可执行的校验+定点修复闭环：校验器报结构化错误，模型只针对错误修复，最多迭代若干轮直到通过。",
  "code": "def repair_with_feedback(text: str, validator, max_iter: int = 3) -> str:\n    # 以程序化校验与修复替代 Prompt 软约束\n    for _ in range(max_iter):\n        errors = validator(text)\n        if not errors:\n            return text\n        # 把错误结构化回注，定点修复而非重写\n        text = llm_fix(text, errors)  # 伪调用：仅修复报错项\n    return text\n",
  "complexity": "时间 O(k*t)，空间 O(e)（k 迭代轮数，t 单次生成耗时，e 错误数）",
  "beginnerSummary": "像改作文：老师用红笔标出具体错处，学生只改红笔处，改到没有红笔为止，而不是整篇重写。",
  "derivation": [
    "为什么需要：Prompt 软约束对复杂格式/业务规则召回不稳定，模型常‘忘记’某条约束。",
    "怎么实现：用确定性 Validator 产出错误清单，把清单拼进修复提示，让模型针对错误改写。",
    "有什么代价：多轮修复增加延迟与 token 成本，需设最大迭代与早停。",
    "怎么评测：对比软约束基线，看最终通过率与修复轮次分布，确认达标且不爆延迟。"
  ],
  "edgeCases": [
    "修复引入新错误，需每轮全量重新校验而非只查原错。",
    "错误清单过长超出上下文，需截断或分批回注。",
    "达到 max_iter 仍未通过，要有降级（标记/人工）策略。",
    "同一条错误反复出现，需检测震荡并改用更强约束或放弃。"
  ],
  "pitfalls": [
    "把整个错误原文直接拼进提示，导致模型‘照抄’错误而非修复。",
    "不设最大迭代，极端样本陷入无限修复循环推高成本。"
  ],
  "prerequisites": [
    "程序化校验与错误表示",
    "Prompt 工程与定点修复",
    "迭代控制与早停策略"
  ],
  "workedExample": [
    "首轮生成 JSON 缺字段 'date'，Validator 报 missing date，回注‘仅补 date’后二轮通过。",
    "某样本连续三轮都错在同一枚举，触发震荡检测后标记 bad case 转人工。"
  ],
  "lineByLine": [
    "def repair_with_feedback：入口，接收文本、校验器与最大迭代。",
    "for _ in range(max_iter)：最多迭代 max_iter 轮做修复。",
    "errors = validator(text)：每次全量校验，拿到结构化错误。",
    "text = llm_fix(text, errors)：若仍有错，仅针对错误清单做定点修复。"
  ],
  "followUps": [
    {
      "question": "如何避免修复轮次爆炸？",
      "answer": "设最大迭代与每轮错误数上限，超过即降级标记 bad case，并用早停在首次全通过后退出。"
    },
    {
      "question": "修复后如何保证不破坏已正确的部分？",
      "answer": "提示中保留原正确片段并要求‘仅改动报错项’，修复后再全量校验确认无回归。"
    }
  ],
  "followUpAnswers": [
    "设最大迭代与每轮错误数上限，超过即降级标记 bad case，并用早停在首次全通过后退出。",
    "提示中保留原正确片段并要求‘仅改动报错项’，修复后再全量校验确认无回归。"
  ],
  "explanationFocus": "是什么：repair-with-feedback 是一种用程序化校验器产出结构化错误、再把错误回注模型做定点修复的闭环方法，用硬校验替代 Prompt 软约束。",
  "approach": "先校验得到错误清单，再把清单作为定点修复提示回注模型，循环至通过或达最大迭代，保证最终输出合规。",
  "kind": "concept"
};
