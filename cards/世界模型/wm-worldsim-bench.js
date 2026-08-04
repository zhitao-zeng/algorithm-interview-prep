export default {
  "id": "wm-worldsim-bench",
  "category": "世界模型",
  "difficulty": "Medium",
  "title": "世界模型评测基准",
  "prompt": "评估一个世界模型的好坏，为什么不能只看“生成画面像不像”，而需要专门的基准（如 WorldSim-Bench）？",
  "quickAnswer": "世界模型的价值在于“支撑决策与规划”，而非仅生成逼真像素；专用基准从视频生成质量与“在模型中规划后真实表现”两个维度评测，关注可预测性、可控性与下游任务增益，避免被视觉保真度误导。",
  "approach": "设计双层评测：基础层测视频生成（FVD、运动一致性等），应用层测在模型里规划/想象后，迁移到真实或规则环境的表现；用统一场景与指标横向对比不同世界模型。",
  "explanationFocus": "是什么：世界模型评测基准（如 WorldSim-Bench）是一套标准化测试，用来衡量世界模型“生成未来是否可信”以及“用它做规划是否真的让智能体在真实任务中表现更好”，把研究从单纯画面质量拉回到决策效用。",
  "bruteForce": "朴素做法：只用 FID/FVD 比生成清晰度，或只在单一游戏里看得分，缺乏可控变量与跨模型可比性。",
  "invariant": "不变式：在同一组场景上，世界模型的“想象规划得分”应与真实环境得分保持单调相关，否则基准失去指导意义。",
  "walkthrough": "1) 固定一组任务场景与真实/规则环境；2) 让各世界模型生成预测或规划动作；3) 基础层量化视频质量，应用层把规划动作送真实环境得回报；4) 汇总排名与消融。",
  "complexity": "说明：基准成本来自多模型、多场景与真实环境评估；需要统一接口与可复现脚本，工程开销中等。",
  "beginnerSummary": "入门概览：评测世界模型不能只问“画得像不像”，更要问“用它做决定管不管用”。基准就是一套标准考卷，同时考“画得真”和“想得对”。",
  "diagram": "candidate world models\n      |\n      +--> [ Layer1: video quality ] FVD / consistency\n      |\n      +--> [ Layer2: planning utility ]\n      |         imagine action seq --> real/env score\n      v\n   unified ranking & ablations",
  "code": "def evaluate_world_model(model, scenarios, real_env):\n    quality = model.video_score(scenarios)\n    plan_score = 0.0\n    for sc in scenarios:\n        actions = model.plan(sc.obs)\n        plan_score += real_env.score(actions)\n    return quality, plan_score / len(scenarios)",
  "derivation": [
    "为什么需要：单看生成质量会奖励“漂亮但无用”的模型，社区需要统一、可比较且紧贴决策效用的评测。",
    "怎么实现：把评测拆成“视频生成层”与“规划应用层”，用固定场景与真实/规则环境给各模型打分与排名。",
    "有什么代价：真实环境评估成本高，场景覆盖有限可能引入偏见；指标设计不当仍会误导。",
    "怎么评测：基准自身通过对已知强弱模型的排序合理性、以及和人类判断的相关性来做“元评测”。"
  ],
  "edgeCases": [
    "模型在固定场景刷分但分布外完全失效，基准需含多样与对抗场景。",
    "视频层与应用层得分冲突时（画得好但规划差），需明确权重。",
    "真实环境不可重复（随机种子）导致分数抖动，需要多次取平均。"
  ],
  "pitfalls": [
    "只报 FVD 而忽略规划得分，掩盖“中看不中用”的缺陷。",
    "用单一任务排名代表整体能力，忽略世界模型的泛化维度。"
  ],
  "prerequisites": [
    "视频质量指标（FVD / FID / LPIPS）",
    "强化学习评测与规划协议"
  ],
  "workedExample": [
    "示例：WorldSim-Bench 用“开放世界任务”测规划效用，发现某些高 FVD 模型反而规划得分更高。",
    "示例：同一模型在视频层排名第二、应用层排名第一，说明其预测更利于决策而非更逼真。"
  ],
  "lineByLine": [
    "def evaluate_world_model(model, scenarios, real_env): 综合评估一个世界模型。",
    "quality = model.video_score(scenarios) 第一层：在给定场景上评视频生成质量。",
    "actions = model.plan(sc.obs) 第二层：让模型基于初始观测规划出动作序列。",
    "plan_score += real_env.score(actions) 把规划动作送真实/规则环境得实用分数并平均。"
  ],
  "codeNotes": [
    "把“视频质量”与“规划效用”分开统计，能暴露仅优化保真度而忽略决策价值的模型。"
  ],
  "followUps": [
    {
      "question": "FVD 高一定代表世界模型差吗？",
      "answer": "不一定。FVD 只衡量视觉分布相似，若模型预测清晰但规划得分高，仍可能是好世界模型。"
    },
    {
      "question": "基准能否完全替代真实任务评测？",
      "answer": "不能。基准提供可比横评，但落地仍要在目标真实环境做最终验证。"
    }
  ],
  "followUpAnswers": [
    "不一定。FVD 只衡量视觉分布相似，若模型预测清晰但规划得分高，仍可能是好世界模型。",
    "不能。基准提供可比横评，但落地仍要在目标真实环境做最终验证。"
  ],
  "kind": "concept"
};
