export default {
  "id": "slm-embodied-judge",
  "category": "语音大模型",
  "difficulty": "Hard",
  "title": "具身短指令音频 Judge",
  "prompt": "如何设计一个评测语音大模型'具身短指令'执行质量的 Judge？四层（音频生命周期 / VAD / DDS / 解码）分别起什么作用？",
  "quickAnswer": "该 Judge 把评测拆成四层：音频生命周期层校验指令是否被完整播放、VAD 层校验用户指令起止是否被正确检测、DDS 层校验对话状态/打断处理、解码层校验语义与动作是否正确。四层加权使 mean 评分从 0.6703 提升到 0.7648。",
  "code": "def embodied_judge(audio, hyp, ref, layers):\n    score = 0.0\n    for layer in layers:                      # 生命周期/VAD/DDS/解码\n        s = layer.score(audio, hyp, ref)      # 每层独立打分\n        score += layers.w[layer] * s          # 加权求和\n    return score / sum(layers.w.values())     # mean ≈ 0.7648",
  "complexity": "时间 O(4*T)，空间 O(T)",
  "beginnerSummary": "就像考一场口语操作题，不只看'答没答对'，还看你'听没听清、说没说全、中途有没有正确处理打断'，四关都过才给高分。",
  "derivation": [
    "为什么需要：单一整体评分无法定位语音助手在具身短指令上的失败环节，需分层诊断。",
    "怎么实现：建四层 Judge——音频生命周期校验播放完整性、VAD 校验端点检测、DDS 校验对话/打断状态、解码层校验语义动作，分别打分后加权。",
    "有什么代价：需构造带层标注的评测集与每层打分模型，四层权重需调参，标注成本较高。",
    "怎么评测：用分层一致性与人工评分相关性校验 Judge 本身，目标 mean 从基线 0.6703 提升到 0.7648。"
  ],
  "edgeCases": [
    "指令被部分播放（生命周期层不完整）需判低分而非归零。",
    "用户指令与背景音乐重叠使 VAD 层误检，需鲁棒阈值。",
    "DDS 层在多次打断后状态错乱，需状态轨迹回放校验。",
    "解码层语义对但动作参数错（如开错灯）需细粒度槽位比对。"
  ],
  "pitfalls": [
    "只用整体 mean 评分，无法解释为何低分、无法针对性优化。",
    "四层权重随意设导致某一层主导，掩盖真实短板。"
  ],
  "prerequisites": [
    "评测指标设计与加权融合",
    "VAD 与对话状态管理（DDS）"
  ],
  "workedExample": [
    "指令'打开客厅灯'：生命周期层确认播报完整、解码层确认槽位正确，得 0.81。",
    "基线整体评分 mean=0.6703，引入四层 Judge 后对齐人工标注 mean 升至 0.7648。"
  ],
  "lineByLine": [
    "for layer in layers：遍历四层 Judge 模块。",
    "s = layer.score(audio, hyp, ref)：每层对假设输出与参考独立打分。",
    "score += layers.w[layer] * s：按层权重累加分数。",
    "return score / sum(layers.w.values())：归一化得到加权 mean 评分。"
  ],
  "followUps": [
    {
      "question": "DDS 层具体校验什么？",
      "answer": "DDS（Dialogue/Dialogue State）层校验对话状态机是否正确维护意图与槽位、是否能正确处理打断与多轮修正，是连接'听懂'与'做对'的关键层。"
    },
    {
      "question": "如何进一步提升 0.7648？",
      "answer": "可加入动作执行结果反馈（具身回报）、细化槽位级 F1、并对难例重标注，或引入 LLM-as-Judge 做语义一致性复核。"
    }
  ],
  "followUpAnswers": [
    "DDS（Dialogue/Dialogue State）层校验对话状态机是否正确维护意图与槽位、是否能正确处理打断与多轮修正，是连接'听懂'与'做对'的关键层。",
    "可加入动作执行结果反馈（具身回报）、细化槽位级 F1、并对难例重标注，或引入 LLM-as-Judge 做语义一致性复核。"
  ],
  "explanationFocus": "是什么：具身短指令 Judge 是一个分层评测器，用于给语音大模型执行'具身短指令'（如开灯、播放）的质量打分，由音频生命周期、VAD、DDS、解码四层组成，加权 mean 从 0.6703 提升到 0.7648。",
  "approach": "把整体评分拆解为可诊断的四层独立打分并加权融合，既给出可解释的总分，又能定位失败环节，从而把评测 mean 从 0.6703 提升到 0.7648。",
  "kind": "concept"
};
