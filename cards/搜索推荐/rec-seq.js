export default {
  "kind": "concept",
  "id": "rec-seq",
  "category": "搜索推荐",
  "difficulty": "Hard",
  "title": "用户行为序列建模",
  "prompt": "用户行为序列建模在推荐里是什么？",
  "quickAnswer": "用户行为序列建模把用户的历史交互（点击/购买/停留）按时间排成序列，用 Attention、GRU、Transformer 等抽取\"兴趣表示\"。它捕捉兴趣的时序演化与多样性，是 DIN/DIEN/SIM 等模型的基础，比把行为简单平均更能反映当下意图。",
  "approach": "行为序列(含物品/时间/反馈) → 编码 → attention/时序聚合 → 兴趣向量。",
  "explanationFocus": "是什么：行为序列建模把用户按时间发生的行为当成有序信号，学出能随当前场景变化的兴趣表示。",
  "bruteForce": "把行为 embedding 直接平均成一个向量：丢失时序与当下意图，兴趣被稀释。",
  "derivation": [
    "为什么需要：用户兴趣随时变、且对当前候选关注点不同，定长平均表达力弱。",
    "怎么实现：行为序列先做 item embedding，加位置/时间；用 self-attention 或 GRU/Transformer 抽取，必要时以候选为 query 做 target attention。",
    "有什么代价：长序列算力大；需截断/分层( SIM 先检索相关行为)；噪声行为干扰。",
    "怎么评测：离线 GAUC、序列长度消融、线上 CTR。"
  ],
  "invariant": "兴趣向量随\"当前候选/上下文\"变化，而非固定不变。",
  "walkthrough": "用户近 100 行为 → Transformer 编码 → 以候选为 Q 做 target attention → 得 64 维兴趣向量入精排。",
  "edgeCases": [
    "序列过长：截断/分簇检索(SIM)。",
    "兴趣漂移：旧行为权重应衰减。",
    "行为缺失：用画像兜底。"
  ],
  "code": "# Python\ndef seq_interest(behaviors, item_enc, transformer, cand):\n    h = transformer([item_enc(b) for b in behaviors])   # 时序编码\n    w = [attention(cand, hi) for hi in h]               # target attention\n    return sum(wi*hi for wi,hi in zip(w,h))",
  "codeNotes": [
    "长序列用 SIM 先检索相关行为。",
    "时间位置帮助建模演化。"
  ],
  "complexity": "self-attention O(L²·d)，L 为序列长；target attention O(L·d)。",
  "followUps": [
    {
      "question": "DIN 和 SIM 在序列建模上的区别？",
      "answer": "DIN 对所有行为做候选注意力，序列一长就慢；SIM 先用候选从海量行为里检索出最相关的一小段(如同类目)，再对这段做精细建模，省算力。"
    },
    {
      "question": "为什么不直接平均行为？",
      "answer": "平均把\"昨天随便点的\"和\"刚搜的\"同等对待，稀释当下强意图；attention/时序能突出相关、弱化无关。"
    }
  ],
  "followUpAnswers": [
    "SIM 先检索再建模省算力。",
    "平均丢失当下意图。"
  ],
  "pitfalls": [
    "长序列不截断致延迟爆炸。",
    "忽略兴趣时序衰减。"
  ],
  "beginnerSummary": "你最近看的东西排成时间线：光把\"全部看过的\"混在一起打分(平均)会糊掉你此刻真正想要的。序列建模像回放你的浏览史——越近、越相关的行为越被重视，还能看出你兴趣从\"运动鞋\"慢慢转到\"跑步机\"的演变，从而更懂你当下想买啥。",
  "prerequisites": [
    "行为有序且蕴含意图。",
    "兴趣随时序演化。",
    "长序列需检索/截断。"
  ],
  "workedExample": [
    "100 条行为经 Transformer 编码。",
    "以候选做 target attention 得兴趣向量。"
  ],
  "lineByLine": [
    "行为物品转 embedding。",
    "加时间位置时序编码。",
    "以候选为 Q 算注意力。",
    "聚合得兴趣向量。"
  ],
  "diagram": "t1 t2 ... tL 行为\n   │ embedding+位置\n   ▼ Transformer\n   h1..hL ─▶ target attention(候选Q) ─▶ 兴趣向量"
};
