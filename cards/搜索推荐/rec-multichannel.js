export default {
  "kind": "concept",
  "id": "rec-multichannel",
  "category": "搜索推荐",
  "difficulty": "Medium",
  "title": "多路召回融合",
  "prompt": "推荐系统的多路召回融合是什么？",
  "quickAnswer": "多路召回指并行使用多种策略（标签/兴趣倒排、协同过滤、向量双塔、热门/地域兜底等）各自产出候选，再合并去重、按配额或统一分数截断后送入粗排。融合解决单路偏科与长尾覆盖问题，需控制各路占比避免某路主导。",
  "approach": "多策略并行取候选 → 去重 → 配额/分数融合 → 截断 top-K。",
  "explanationFocus": "是什么：多路召回把若干独立召回通道的结果汇到一起，互补长短、保覆盖，再融合成统一候选集。",
  "bruteForce": "只跑一路召回：覆盖窄、易马太效应，长尾与新颖项难出现。",
  "derivation": [
    "为什么需要：单一召回源有偏（如协同只推相似），多路互补才能兼顾相关与多样、兜住冷启动。",
    "怎么实现：各路独立检索得候选+分数；按固定 quota 或归一化分数混合；去重后截断。",
    "有什么代价：各路分数量纲不同需校准；quota 分配影响分布；融合不当某路淹没他路。",
    "怎么评测：看整体 Recall@K、覆盖率、各路贡献占比、线上多样性指标。"
  ],
  "invariant": "融合后候选集需保留每路的\"特色\"项，不被单一主导路吞没。",
  "walkthrough": "标签 200 + 向量 150 + 协同 150 + 热门 50 → 去重合并 480 → 截断 500 进粗排。",
  "edgeCases": [
    "各路分数不可比：需分路归一化。",
    "某路过载淹没他路：用 quota 限流。",
    "热门路挤占长尾：降权保多样。"
  ],
  "code": "# Python\ndef merge_recall(routes, quotas):\n    merged = {}\n    for name, cands in routes.items():\n        q = quotas[name]\n        for it, s in cands[:q]:                # 每路按 quota 截断\n            merged.setdefault(it, []).append(s)\n    return sorted(merged, key=lambda it: -max(merged[it]))[:500]",
  "codeNotes": [
    "每路配额控制贡献。",
    "跨路分数需先归一化。"
  ],
  "complexity": "O(各路候选和 + 合并排序)，与全库规模解耦。",
  "followUps": [
    {
      "question": "各路分数量纲不同怎么融合？",
      "answer": "先分路 min-max 或按各自召回率归一化，再按 quota/权重混合，避免某路绝对值大就霸榜。"
    },
    {
      "question": "为什么不直接拼接所有候选再统一截断？",
      "answer": "那样强路会淹没弱路，长尾与多样项丢失；quota 能保证每路保底曝光。"
    }
  ],
  "followUpAnswers": [
    "分路归一化再混合。",
    "quota 防单路主导。"
  ],
  "pitfalls": [
    "忽略分数量纲直接混合。",
    "不设 quota 导致某路淹没他路。"
  ],
  "beginnerSummary": "多路召回像多家猎头同时给你推荐人选：A 按技能标签找、B 按相似成功案例找、C 按热门新人找。你把四家名单合并、去掉重复、再各留一定比例，既不全听一家(避免偏见)，也能兼顾不同来源的好苗子。",
  "prerequisites": [
    "存在多种互补召回策略。",
    "各路分数需可比/配额可控。",
    "需兼顾覆盖与多样。"
  ],
  "workedExample": [
    "四路各取候选并配额截断。",
    "合并去重得 500 进粗排。"
  ],
  "lineByLine": [
    "各路独立检索候选。",
    "按 quota 截断每路。",
    "跨路去重。",
    "统一分数截断融合。"
  ],
  "diagram": "标签路 ─┐\n向量路 ─┼─▶ 去重 ─▶ 配额融合 ─▶ top500\n协同路 ─┤\n热门路 ─┘"
};
