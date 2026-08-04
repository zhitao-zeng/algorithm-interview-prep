export default {
  "id": "cg-best-of-n",
  "category": "LLM 约束生成与自动评测",
  "difficulty": "Medium",
  "title": "best-of-N 候选生成",
  "prompt": "best-of-N 候选生成在‘每条 bullet 独立生成候选’时，应如何为每个 bullet 择优并保证整体一致性？",
  "quickAnswer": "对每条 bullet 独立采样 N 个候选，用校验分数（合规+质量）逐条择优；再对选出的 bullet 集合做一次全局一致性检查与去重。",
  "code": "import random\n\ndef best_of_n(gen_bullet, bullets: list, n: int = 4):\n    # 每条 bullet 独立生成 n 个候选，按校验分择优\n    chosen = []\n    for b in bullets:\n        cands = [gen_bullet(b) for _ in range(n)]\n        chosen.append(max(cands, key=score))  # score 含合规+质量\n    return dedupe(chosen)  # 全局去重/一致性后处理\n",
  "complexity": "时间 O(B*N*t)，空间 O(B*N)（B bullet 数，N 候选数，t 单次耗时）",
  "beginnerSummary": "像招聘：每个岗位先面 4 个候选人，按评分选最好的，最后再整体看看团队有没有重复或冲突。",
  "derivation": [
    "为什么需要：单次生成 bullet 易出格式错或事实错，独立多采样再用确定性评分择优可显著提升合规率。",
    "怎么实现：对每条 bullet 并行采样 N 份，用统一 score（先过 Validator 再打质量分）取最大者。",
    "有什么代价：推理成本放大 N 倍，需控制 N 与并发；质量分本身要有区分度。",
    "怎么评测：对比 N=1 基线，看终稿通过率与人工质量分提升，权衡成本收益。"
  ],
  "edgeCases": [
    "某 bullet 的 N 个候选全不合规，需回退到 repair 或标记。",
    "不同 bullet 选出内容语义重复，需全局去重。",
    "score 平局时要有稳定 tie-break（如首次/最短）。",
    "bullet 间存在依赖（如序号），独立择优可能破坏顺序。"
  ],
  "pitfalls": [
    "只按模型自评分择优，易被‘自信但错误’的候选骗过，必须先用硬校验过滤。",
    "N 过大却无并发，端到端延迟成倍上涨。"
  ],
  "prerequisites": [
    "采样与随机性控制",
    "确定性评分与校验",
    "并行推理与去重"
  ],
  "workedExample": [
    "bullet ‘活动时间’采样 4 次，3 个格式错、1 个合规，score 选中合规者。",
    "两条 bullet 都被选成相似卖点，dedupe 合并为一条避免重复。"
  ],
  "lineByLine": [
    "import random：可用于候选采样时的随机种子控制。",
    "for b in bullets：逐条 bullet 独立处理。",
    "cands = [gen_bullet(b) for _ in range(n)]：每条采样 n 个候选。",
    "max(cands, key=score)：按 score 择优；dedupe 做全局一致性后处理。"
  ],
  "followUps": [
    {
      "question": "score 函数应如何设计才不会被‘自信幻觉’骗？",
      "answer": "score 先过硬校验（格式/事实）作门槛，再叠质量分；校验不过直接 0 分，避免自评分主导。"
    },
    {
      "question": "N 应如何选取以平衡成本与质量？",
      "answer": "在验证集上扫 N=1..8 看通过率拐点，选边际收益最高的 N，并对长尾 bullet 动态加大 N。"
    }
  ],
  "followUpAnswers": [
    "score 先过硬校验（格式/事实）作门槛，再叠质量分；校验不过直接 0 分，避免自评分主导。",
    "在验证集上扫 N=1..8 看通过率拐点，选边际收益最高的 N，并对长尾 bullet 动态加大 N。"
  ],
  "explanationFocus": "是什么：best-of-N 候选生成是对每条 bullet 独立采样多个候选、再用确定性评分择优的约束生成策略，用‘多采样+硬筛选’提升合规率。",
  "approach": "每条 bullet 并行采样 N 个候选，先过 Validator 过滤再用质量分择优，最后对选中集合做全局去重与一致性检查。",
  "kind": "concept"
};
