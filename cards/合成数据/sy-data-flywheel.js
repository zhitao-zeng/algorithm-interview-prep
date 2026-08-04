export default {
  "id": "sy-data-flywheel",
  "category": "合成数据",
  "difficulty": "Hard",
  "title": "数据飞轮闭环",
  "prompt": "如何构建\"数据飞轮\"让模型上线后的真实反馈持续反哺合成数据生产？",
  "quickAnswer": "把线上用户交互、失败案例与人工/自动标注回流成\"弱点信号\"，据此定向合成针对性训练数据，重新训练并上线，再用新反馈评估增益，形成\"反馈-合成-训练-上线\"的闭环自增强。",
  "approach": "四步闭环：采集线上失败与低置信样本；聚类定位能力缺口；用缺口驱动 Evol/Self-Instruct 等定向合成；微调后上线并用同一指标验证缺口是否缩小，未缩小则调整合成策略。",
  "explanationFocus": "是什么：数据飞轮是一种闭环机制，用模型在真实场景中的表现与反馈不断发现短板，并自动生成补齐短板的数据，使数据量与质量随迭代滚动增长。",
  "bruteForce": "朴素做法：离线一次性造完数据就训练，忽略线上分布漂移与真实失败模式。",
  "invariant": "每一轮合成必须针对上轮实测缺口(可量化)，且上线后须用同一评测集证明该缺口指标有改善。",
  "walkthrough": "线上发现\"多轮表格问答\"错误率高，聚类确认是短板，定向合成 5k 条表格推理链微调，上线后该项错误率下降，飞轮进入下一轮。",
  "complexity": "每轮成本=采集+合成+训练+上线评估，约 O(rounds)；收益取决于缺口定位精度，定位错则空转。",
  "beginnerSummary": "模型上线后哪里常答错，就针对性造一批这类题去补，再上线看补没补好，循环下去数据越滚越准。",
  "diagram": "online logs/failures --> mine gaps (cluster)\ngaps --targeted synth (Evol/Self)--> new data\nnew data --finetune--> model v2\nmodel v2 --eval gaps--> close? loop / next round",
  "code": "def flywheel_round(logs, synth, train, eval_fn):\n    gaps = mine_gaps(logs)\n    data = synth.targeted(gaps)\n    model = train(data)\n    improved = eval_fn(model, gaps)\n    return model, improved, gaps",
  "derivation": [
    "为什么需要：静态数据集会过时，真实分布与失败模式只有上线后才暴露，需持续把反馈转成训练信号。",
    "怎么实现：回流失败与低置信样本，聚类出能力缺口，用缺口条件驱动定向合成，微调后上线验证缺口收敛。",
    "有什么代价：闭环链路长、工程复杂；若缺口定位不准或合成质量差会空转甚至退化，需防反馈噪声。",
    "怎么评测：对每轮缺口设专项指标，比较上线前后该指标；并用整体基准防止局部补、全局掉。"
  ],
  "edgeCases": [
    "线上反馈含噪声或恶意样本，需清洗与置信过滤再回流。",
    "缺口跨多能力耦合，单一合成策略难覆盖，需分层合成。",
    "补一个缺口引发另一个退化的跷跷板效应，需整体回归。",
    "数据版权与隐私，回流真实数据须脱敏合规。"
  ],
  "pitfalls": [
    "只看整体指标会掩盖局部未补缺口，应保留每轮专项看板。",
    "合成策略不变会导致飞轮早期就饱和，需随缺口演化调整生成器。"
  ],
  "prerequisites": [
    "掌握合成数据方法(如 Evol/Self-Instruct)与微调流程。",
    "具备线上监控、失败挖掘与回归评测的工程能力。"
  ],
  "workedExample": [
    "缺口\"长文档数值推理\"：回流相关失败，合成带计算的检索增强链，微调后该项错误率降 12%。",
    "缺口\"多语言指令\"：定向生成小语种指令对，上线后小语种遵循分提升且主线不掉。"
  ],
  "lineByLine": [
    "gaps = mine_gaps(logs) 从线上日志挖掘并聚类出当前最弱的能力缺口。",
    "data = synth.targeted(gaps) 用缺口作为条件驱动定向合成补齐数据。",
    "model = train(data) 在补齐数据上微调得到新版本。",
    "improved = eval_fn(model, gaps) 用同一缺口指标验证是否真正改善，决定是否继续飞轮。"
  ],
  "codeNotes": [
    "mine_gaps 应结合低置信度与人工负反馈，避免仅用模型自评造成盲区。"
  ],
  "followUps": [
    {
      "question": "飞轮如何防退化？",
      "answer": "每轮保留整体回归集与历史缺口看板，任何全局或旧缺口回退都触发告警并回滚或补数据。"
    },
    {
      "question": "合成与真实数据比例怎么控？",
      "answer": "以真实反馈为主锚、合成为补齐，比例按缺口覆盖度动态调整并监控过拟合合成风格。"
    }
  ],
  "followUpAnswers": [
    "每轮保留整体回归集与历史缺口看板，任何全局或旧缺口回退都触发告警并回滚或补数据。",
    "以真实反馈为主锚、合成为补齐，比例按缺口覆盖度动态调整并监控过拟合合成风格。"
  ],
  "kind": "concept"
};
