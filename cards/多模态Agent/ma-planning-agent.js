export default {
  "id": "ma-planning-agent",
  "category": "多模态Agent",
  "difficulty": "Hard",
  "title": "任务规划与分解",
  "prompt": "多模态 Agent 在面对长程开放任务时，应如何做任务规划与分解以保证可执行、可回滚？",
  "quickAnswer": "常用\"先总后分\"的分层规划：用 LLM 把目标拆成有序子目标，每个子目标再映射为具体界面动作；配合世界模型或环境反馈做重规划，并把每步结果写入计划状态以支持回滚与重试。",
  "approach": "把规划当成可执行的依赖图：子任务有先后与前置条件，执行前检查前置、执行后验证后置，失败则从最近检查点重规划而非从头。",
  "explanationFocus": "是什么：任务规划与分解是多模态 Agent 把一句高层指令（如\"帮我订周五去上海的便宜机票\"）转成可逐步执行、可验证、可回滚的行动方案的能力；它先生成带依赖关系的子目标序列，再把每个子目标细化为界面操作，并在执行中用环境反馈持续修正计划。",
  "bruteForce": "不规划直接上手，遇到长任务会在中途迷失、重复或卡死，且一旦某步失败只能全部重来，没有中间检查点。",
  "invariant": "已验证完成的子目标在计划状态中标记为达成且不被后续步骤破坏，任意时刻可从最近完成的检查点恢复。",
  "walkthrough": "①解析目标生成子目标图；②按依赖序执行首个子目标；③环境反馈验证后置条件；④达成则前进，失败则回滚到检查点重规划；⑤全部达成返回结果。",
  "complexity": "规划搜索在子目标数上约 O(分支^深度)，但用 LLM 直接生成近似最优序可降为 O(子目标数)，重规划仅在失败时触发。",
  "beginnerSummary": "像出行前先列清单：订票→选座→值机，每完成一项打个勾；某步出问题就回到上一项重来，而不是从头买。",
  "diagram": "goal -> [s1]->[s2]->[s3]\n              |        |\n          checkpoint  verify\n              |\n          rollback/replan",
  "code": "def plan_and_execute(goal, agent, env):\n    plan = agent.decompose(goal)          # ordered subtasks\n    done = []\n    for sub in plan:\n        if not preconditions(sub, env):\n            plan = agent.replan(goal, done)\n            sub = plan[len(done)]\n        agent.act(sub, env)\n        if postcondition(sub, env):\n            done.append(sub)\n        else:\n            env.rollback(done)\n            plan = agent.replan(goal, done)\n    return done",
  "derivation": [
    "为什么需要：长程开放任务步骤多、易失败，无规划会迷失且难恢复，需结构化方案与检查点。",
    "怎么实现：LLM 生成带依赖的子目标序列，执行前查前置、执行后验后置，失败则从检查点重规划或回滚。",
    "有什么代价：规划与重规划消耗推理，错误的分解会连锁失败；世界模型不准时重规划方向可能偏差。",
    "怎么评测：在长任务基准上比较有/无规划的成功率、步数与从失败中恢复的比例。"
  ],
  "edgeCases": [
    "子目标间存在隐藏依赖，线性序执行会互相破坏状态。",
    "环境非确定性使同一动作后置条件偶发不成立，需重试而非立刻回滚。",
    "重规划陷入换汤不换药的死循环，需限制重规划次数。"
  ],
  "pitfalls": [
    "把子目标拆得过细，计划冗长且上下文压力大。",
    "只生成不验证，错误计划一路执行到无法回滚才暴露。"
  ],
  "prerequisites": [
    "目标理解与子目标分解（LLM 规划）",
    "环境状态的可观测与可回滚"
  ],
  "workedExample": [
    "订票：拆为搜航班→比价→下单→选座，任一步失败回到对应检查点。",
    "整理相册：拆为筛选→分类→命名→导出，每类完成即落盘可恢复。"
  ],
  "lineByLine": [
    "decompose 产出有序子目标，是后续执行与回滚的骨架。",
    "preconditions 在执行前把关，避免在不满足状态下盲动。",
    "rollback 配合 done 实现检查点恢复，把失败代价限制在局部。"
  ],
  "codeNotes": [
    "replan 始终基于已完成列表 done，保证新计划不重复已做工作。"
  ],
  "followUps": [
    {
      "question": "LLM 规划和传统规划器怎么结合？",
      "answer": "用 LLM 出候选分解、用符号规划器校验依赖与可行性，兼顾灵活性与正确性。"
    },
    {
      "question": "如何减少无意义重规划？",
      "answer": "对偶发失败先有限重试，并结合世界模型预测后置，仅在确属计划错误时才重规划。"
    }
  ],
  "followUpAnswers": [
    "用 LLM 出候选分解、用符号规划器校验依赖与可行性，兼顾灵活性与正确性。",
    "对偶发失败先有限重试，并结合世界模型预测后置，仅在确属计划错误时才重规划。"
  ],
  "kind": "concept"
};
