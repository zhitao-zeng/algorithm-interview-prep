export default {
  "id": "mmd-mllm-agent",
  "kind": "concept",
  "category": "多模态模型",
  "title": "多模态 Agent 落地",
  "difficulty": "Hard",
  "prompt": "多模态 Agent 在 GUI/手机/桌面操控中如何落地？视觉规划与工具调用面临哪些核心挑战？",
  "quickAnswer": "多模态 Agent 以屏幕截图/录屏为观测，用 VLM 做视觉规划（定位元素、生成操作步骤），并通过工具调用（点击、输入、API）执行。核心挑战是长程规划误差累积、元素精确定位、动作反馈闭环，以及安全与权限边界。",
  "code": "def agent_step(vlm, screenshot, goal, history=[]):\n    prompt = f\"目标:{goal}\\n历史:{history}\\n请输出下一步动作(JSON)\"\n    action = vlm.generate(screenshot, prompt)        # 视觉规划\n    obs = execute(action)                            # 工具调用:点击/输入\n    history.append((action, obs))                    # 反馈闭环\n    return action, obs, history",
  "complexity": "O(S·T)",
  "beginnerSummary": "多模态 Agent 像一个会看屏幕的“机器人助理”：它看着手机或电脑界面，理解要做什么，然后自动点按钮、打字、调用工具一步步完成任务，比如订机票、填表格。",
  "explanationFocus": "是什么：多模态 Agent 指以视觉（截图/视频）为主要观测、用多模态模型做规划决策并通过工具/动作接口与软件环境交互，自主完成多步任务的智能体，典型场景为 GUI/手机/桌面操控。",
  "approach": "观测用截图或 UI 树，VLM 输出“定位+动作”计划（如点 (x,y) 或调 API）；工具层把动作映射为系统事件；用 ReAct 式历史记忆做长程规划，并以执行后新截图作为反馈闭环。常配合 Set-of-Mark 标注提升元素可定位性。",
  "derivation": [
    "为什么需要：软件任务多步且依赖视觉状态，纯文本 Agent 难以理解图形界面。",
    "怎么实现：截图+VLM 规划→动作执行→新观测反馈；Set-of-Mark 标注元素，工具调用接口标准化。",
    "有什么代价：每步都跑 VLM 时延高、成本高；长程任务错误累积；截图隐私与安全敏感。",
    "怎么评测：在 AndroidWorld、WebArena 等环境测任务成功率与步骤效率。"
  ],
  "edgeCases": [
    "弹窗/广告打断原计划流程。",
    "动态加载导致元素坐标漂移。",
    "需要登录/验证码等人工介入步骤。",
    "模糊或相似的按钮导致定位错误。"
  ],
  "pitfalls": [
    "无反馈闭环，模型凭记忆盲操作导致连续误点。",
    "把 VLM 当一次性规划器，忽略长程错误累积与回滚。"
  ],
  "prerequisites": [
    "ReAct/工具调用智能体范式",
    "视觉定位与 UI 理解"
  ],
  "workedExample": [
    "Set-of-Mark：在截图上给可交互元素编号，VLM 只需输出编号而非坐标，定位更稳。",
    "AndroidWorld：在真实安卓环境跑多步任务，以成功率评测 Agent 能力。"
  ],
  "lineByLine": [
    "vlm.generate 接收截图与目标，输出下一步结构化动作，体现视觉规划。",
    "execute 把动作转为真实系统事件，并把结果回写 history 形成观测-动作闭环。"
  ],
  "followUps": [
    {
      "question": "如何降低多模态 Agent 每步调用 VLM 的成本与时延？",
      "answer": "用轻量视觉定位模型替代全量 VLM 做简单点击，仅在需要推理时调用大模型；或缓存布局、用差分截图只处理变化区域，并采用动作批处理。"
    },
    {
      "question": "长程任务错误累积怎么缓解？",
      "answer": "引入子目标分解与校验点（每步后自问“是否偏离目标”）、可回滚状态快照、以及失败后重规划；并用地图/记忆避免重复探索。"
    }
  ],
  "followUpAnswers": [
    "用轻量视觉定位模型替代全量 VLM 做简单点击，仅在需要推理时调用大模型；或缓存布局、用差分截图只处理变化区域，并采用动作批处理。",
    "引入子目标分解与校验点（每步后自问“是否偏离目标”）、可回滚状态快照、以及失败后重规划；并用地图/记忆避免重复探索。"
  ],
  "order": 28
};
