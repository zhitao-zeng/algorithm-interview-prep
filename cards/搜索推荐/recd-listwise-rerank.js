export default {
  "id": "recd-listwise-rerank",
  "kind": "concept",
  "category": "搜索推荐",
  "title": "Listwise 重排与多样性：MMR/DPP 与生成式重排",
  "difficulty": "Hard",
  "prompt": "召回排序产出的候选列表如何做 listwise 重排以兼顾相关性与多样性？请说明 MMR、DPP 与生成式重排的取舍？",
  "quickAnswer": "Listwise 重排把整个列表当优化对象：MMR 贪心插入\"既相关又互补\"的项；DPP 用行列式刻画\"质量×多样性\"做全局择优；生成式重排用序列模型直接生成排列。MMR 简单可控，DPP 全局优但开销大，生成式更灵活但难约束。",
  "code": "import numpy as np\n\ndef mmr(selected, candidates, rel, sim, lambda_=0.7):\n    # rel: 相关性; sim: 候选与已选的最大相似度\n    while candidates:\n        scores = {i: lambda_ * rel[i] - (1 - lambda_) * max(sim[i][j] for j in selected)\n                  for i in candidates}\n        nxt = max(scores, key=scores.get)\n        selected.append(nxt); candidates.remove(nxt)\n    return selected  # 贪心构造兼顾相关与多样的列表",
  "complexity": "O(L²·k) (L 列表长, k 候选)",
  "beginnerSummary": "排好的列表如果全是同类视频会很无聊。重排就是把最终要展示的一屏内容调一调顺序，既保证好看又保证不重复。",
  "explanationFocus": "是什么：Listwise 重排是在给定候选集合上以\"整列\"为决策单元、联合优化相关性与多样性/业务约束的排序阶段，区别于逐点(pointwise)与配对(pairwise)建模。",
  "approach": "用 MMR 贪心平衡相关性与最大相似度；用 DPP 以核矩阵行列式同时建模质量与互斥性做全局采样；或用生成式/序列模型(如 PRM、Generator)直接输出排列，并叠加业务硬约束（品类打散、去重）。",
  "derivation": [
    "为什么需要：pointwise 排序忽视列表内重复与上下文，导致同质化、用户体验下降。",
    "怎么实现：MMR=λ·rel-(1-λ)·maxSim 贪心；DPP 最小化 -log det(L) 求高质量低冗余子集；生成式用 encoder-decoder 输出序。",
    "有什么代价：DPP 行列式计算 O(n³)，生成式重排不可微约束难加、推理慢。",
    "怎么评测：列表级指标(Illeagecy/ILD/覆盖率)、线上时长与互动多样性。"
  ],
  "edgeCases": [
    "候选全同类时多样性约束可能牺牲过多相关性。",
    "硬业务约束（同作者≤2）与最优排列冲突需松弛。",
    "列表短(≤3)时 MMR/DPP 收益有限。"
  ],
  "pitfalls": [
    "λ 固定忽略用户对不同场景的多样需求。",
    "DPP 核矩阵近似不当导致数值不稳定。"
  ],
  "prerequisites": [
    "行列式点过程(DPP)基础",
    "序列生成与 beam search"
  ],
  "workedExample": [
    "候选：3 个搞笑、2 个美食、2 个科普；用户爱搞笑。",
    "MMR(λ=0.6)先选最相关搞笑，再因相似度惩罚选一个美食，交错插入，最终列表搞笑-美食-搞笑-科普，避免连续搞笑疲劳。"
  ],
  "lineByLine": [
    "def mmr：输入已选/候选/相关性/相似度，贪心构造列表。",
    "while candidates：循环直到候选清空。",
    "scores = λ·rel - (1-λ)·maxSim：兼顾自身相关与和已选最大相似度。",
    "nxt = max：每步选综合分最高者加入已选。"
  ],
  "followUps": [
    {
      "question": "DPP 相比 MMR 好在哪？",
      "answer": "MMR 是贪心局部决策，DPP 用行列式一次性建模集合的\"质量×多样性\"联合概率，能选出全局更优子集，但计算更重且需合适的核。"
    },
    {
      "question": "生成式重排怎么加业务约束？",
      "answer": "可在解码阶段用约束 beam search（禁止连续同类、限制同作者数），或在训练时把约束违反作为 reward 用 RL 微调。"
    }
  ],
  "followUpAnswers": [
    "MMR 是贪心局部决策，DPP 用行列式一次性建模集合的\"质量×多样性\"联合概率，能选出全局更优子集，但计算更重且需合适的核。",
    "可在解码阶段用约束 beam search（禁止连续同类、限制同作者数），或在训练时把约束违反作为 reward 用 RL 微调。"
  ],
  "order": 29
};
