export default {
  "id": "ts-long-monitor",
  "category": "训练稳定性",
  "difficulty": "Medium",
  "title": "长训练监控与回滚",
  "prompt": "数周长训练如何做监控与异常回滚，才能既早发现退化又能在污染后回到健康点？",
  "quickAnswer": "监控维度包括：loss、grad_norm、LR、GPU利用率、显存、数据throughput、各层激活统计（均值/方差）、token准确率。设阈值告警（grad_norm突增、loss平台、利用率掉底）。一旦判定退化，自动/手动回滚到最近健康checkpoint并调整超参（降LR、重采样数据）再续。",
  "approach": "用wandb/tensorboard每步落指标；对关键指标设滑动窗口与告警规则；维护\"健康快照\"列表（loss平滑下降且grad_norm平稳）；异常时选最近健康点回滚。",
  "explanationFocus": "是什么：长训练监控是对训练全过程指标持续采集与告警；异常回滚是在检测到不可逆退化（如数据污染致loss永久抬高）时，退回最近一个被判定为健康的checkpoint并修正配置后继续。",
  "bruteForce": "仅靠肉眼每天看loss曲线，等发现问题时已训坏数天、数万GPU小时，且无法定位健康回滚点。",
  "invariant": "健康窗口应满足：loss滑动均值单调（或平滑）下降、grad_norm在[lo,hi]区间、GPU利用率>阈值、无NaN；任一持续违反应触发告警评估回滚。",
  "walkthrough": "训练第9天，监控发现token acc从第6天起持续下滑、grad_norm从2.5升到9且loss平台。回查\"健康快照\"列表，第6天point-144000为最后健康点；回滚到该ckpt，把LR从3e-4降到2e-4并重采样数据，第10天acc恢复并超越原轨迹。",
  "code": "import numpy as np\n\ndef is_healthy(loss_hist, grad_hist, win=200, lo=0.5, hi=8.0):\n    lr_ = np.mean(loss_hist[-win:])\n    prev = np.mean(loss_hist[-2*win:-win])\n    drop = prev - lr_                       # 应持续下降\n    g = np.mean(grad_hist[-win:])\n    return drop > 0 and lo <= g <= hi\n\ndef pick_rollback(snapshots):\n    # 返回最后一个被判健康的快照路径\n    healthy = [s for s in snapshots if s[\"healthy\"]]\n    return healthy[-1][\"path\"] if healthy else None\n",
  "complexity": "时间：采集为异步旁路，几乎零开销；分析用滑动窗口 O(win) 每步。空间：指标留存按采样率，长期仅存聚合值。",
  "beginnerSummary": "长训练监控像给病人戴监护仪，心率（grad_norm）和体温（loss）异常就报警；回滚像把病人退回到最后一次体检正常的时间点重新治疗。",
  "diagram": "\n day:  1   2   3   4   5   6   7   8   9\n acc:  ↑   ↑   ↑   ↑   ↑   ↓   ↓   ↓   ↓\n                ^健康快照         ^告警  -> 回滚到day6点\n",
  "derivation": [
    "为什么需要：长训练故障潜伏期长，早期发现可省海量算力；不可逆退化必须回到健康点。",
    "怎么实现：旁路采集多维度指标+滑动窗口告警，维护健康快照表，异常时选最近健康点回滚。",
    "有什么代价：指标存储与告警规则需维护；误回滚会浪费该段训练，故需保守阈值。",
    "怎么评测：注入数据污染，系统应在窗口内告警并回滚后恢复，且正常训练不误报。"
  ],
  "edgeCases": [
    "短暂grad_norm尖峰（单batch坏数据）不应触发回滚，需持续窗口判定。",
    "健康快照本身已被慢污染：需结合更早基线对比。",
    "多指标冲突（loss降但利用率掉）：以loss/acc为主决策。",
    "回滚后同配置再跑仍退化：说明需改超参而非仅回滚。"
  ],
  "pitfalls": [
    "只看loss忽略grad_norm，错过爆炸前兆。",
    "回滚过激（回太多）丢失大量有效训练。"
  ],
  "prerequisites": [
    "指标采集（wandb/tensorboard）",
    "滑动统计与告警",
    "checkpoint机制"
  ],
  "workedExample": [
    "第6天起token acc持续下滑、grad_norm升到9，触发告警。",
    "从健康快照表选point-144000（第6天初）为回滚点。",
    "LR降到2e-4并重采样，回滚后续训acc恢复并超越原轨迹。"
  ],
  "lineByLine": [
    "np.mean(loss_hist[-win:]) 取最近窗口loss均值。",
    "drop = prev - lr_ 判断近期是否仍下降，应>0。",
    "lo<=g<=hi 约束grad_norm在健康区间。",
    "pick_rollback筛选healthy快照，取最后一个作为回滚目标。"
  ],
  "codeNotes": [
    "告警阈值应基于训练前段统计自适应，而非硬编码绝对值。"
  ],
  "followUps": [
    {
      "question": "如何区分可恢复抖动与真退化？",
      "answer": "用滑动窗口持续判定：短时越界不计，连续N窗口违例才告警，避免单batch噪声误触发回滚。"
    },
    {
      "question": "回滚后必须改配置吗？",
      "answer": "若退化源于超参/数据，仅回滚会重蹈覆辙；应同时调LR、重采样或修数据再续。"
    }
  ],
  "followUpAnswers": [
    "用滑动窗口持续判定：短时越界不计，连续N窗口违例才告警，避免单batch噪声误触发回滚。",
    "若退化源于超参/数据，仅回滚会重蹈覆辙；应同时调LR、重采样或修数据再续。"
  ],
  "kind": "concept"
};
