export default {
  "id": "de-caption-reward",
  "category": "多模态数据工程",
  "difficulty": "Medium",
  "title": "用奖励模型筛选 caption",
  "prompt": "如何用奖励模型（reward model）对大规模图文对的 caption 做质量筛选与重排序？",
  "quickAnswer": "训练一个 caption 质量奖励模型（常用人类偏好对或自动指标作为监督），对每条候选 caption 打分，按阈值过滤低质样本并用分数重采样，从而提升训练集 caption 的信息量与准确性。",
  "approach": "核心思路是“先定义什么是好 caption，再让模型学会打分”。可用人类偏好对（好 caption vs 差 caption）训练一个轻量文本/多模态编码器，输出标量奖励；离线对候选集打分后按阈值过滤或按分数做加权采样，替代规则式筛选。",
  "explanationFocus": "是什么：caption 奖励模型是一个为给定图像-文本对生成“caption 质量分数”的模型，用于替代人工规则来自动筛选与排序图文描述。",
  "bruteForce": "朴素做法：用 CLIP 相似度或 BLEU/CIDEr 等自动指标对每条 caption 打分排序；或雇佣标注员逐条人工筛选。前者指标与“人类真正认为的好 caption”相关性有限，后者成本极高且不可规模化。",
  "invariant": "不变式：在任何过滤/重采样后，保留集合的“平均奖励分数”严格不低于原始阈值 tau，且单条样本被保留的概率随其奖励分数单调不减。",
  "walkthrough": "1) 收集偏好数据（人标或 LLM-as-judge 生成好/差对）；2) 训练 reward model 输出标量；3) 对候选 caption 批量打分；4) 设定阈值过滤低分并据分数做加权采样；5) 回流高分样本到训练集并评估下游指标。",
  "complexity": "说明：训练 reward model 复杂度为 O(N_pair * epoch)，推理打分为 O(N_caption * model_cost)；阈值 tau 与采样温度是关键超参，需通过下游任务验证。",
  "beginnerSummary": "入门概览：我们让一个小模型学会“哪条 caption 写得好”，再用它给成千上万条描述打分，自动留下好的、丢掉差的，省去人工逐条挑选。",
  "diagram": "[image + caption]\n       |\n  [reward model]\n       |\n   score >= tau ?\n   /        \\\n yes         no\nkeep        drop",
  "code": "import torch\nfrom torch import nn\n\ndef score_captions(model, images, captions, tau=0.6):\n    scores = model(images, captions).squeeze(-1)\n    keep = scores >= tau\n    return scores, keep",
  "derivation": [
    "为什么需要：规则式 caption 筛选（关键词、长度、CLIP 阈值）难以捕捉“信息量、准确性、流畅度”等语义质量，人工筛选不可规模化，需要可学习的打分器。",
    "怎么实现：用偏好对 (caption_good, caption_bad) 训练 reward model，损失为 pairwise ranking loss；推理时对候选集输出标量分数，按阈值过滤并按分数重采样。",
    "有什么代价：需构建偏好数据（标注或 LLM 蒸馏）且 reward model 可能过拟合到标注者偏好；错误的高分样本会污染训练集，需定期复核。",
    "怎么评测：离线看过滤后集合的平均奖励与多样性；在线看下游多模态模型在 caption 相关任务上的指标提升，并做人类抽检一致性。"
  ],
  "edgeCases": [
    "图像信息量极低（纯色图）时 reward model 难以区分 caption 好坏，需前置过滤。",
    "偏好数据存在标注噪声或偏见，模型可能给“花哨但错误”的 caption 高分。",
    "候选 caption 全部偏高分时阈值 tau 失效，应改用相对排序与分位数截断。",
    "多语言 caption 分布不一致，单语言 reward model 会系统性压低其他语言。"
  ],
  "pitfalls": [
    "直接把 reward 分数当绝对阈值而忽略数据整体分布，导致保留率剧烈波动。",
    "用 LLM 自动生成偏好数据时未去重验证， reward model 学到的是 LLM 的措辞偏好。"
  ],
  "prerequisites": [
    "偏好学习与 pairwise ranking loss 基础",
    "多模态编码器（如 CLIP）与对比学习概念"
  ],
  "workedExample": [
    "样本：一张雪山照片，候选 caption A=“山”，B=“雪山脚下的湖泊倒映着云层”。reward model 给 B 更高分，A 因信息量低被过滤。",
    "重采样：对 10 万条 caption 打分后取 top 80% 分位数截断，保留 4 万条高分样本进入训练集。"
  ],
  "lineByLine": [
    "import torch / from torch import nn：引入 PyTorch 与神经网络模块。",
    "def score_captions(...)：定义对图文对批量打分的入口函数。",
    "scores = model(images, captions)：reward model 输出每条候选的标量质量分。",
    "keep = scores >= tau：按阈值得到布尔保留掩码。"
  ],
  "codeNotes": [
    "实际生产中应批量推理并对分数做归一化，避免跨 batch 分布漂移。"
  ],
  "followUps": [
    {
      "question": "reward model 与 CLIP 相似度打分有什么区别？",
      "answer": "CLIP 相似度只衡量图文匹配度，不衡量 caption 自身的信息质量；reward model 可在偏好数据上学习“更详细/更准确”的语义偏好，更能反映人类判断。"
    },
    {
      "question": "如何防止 reward model 被奖励黑客（reward hacking）？",
      "answer": "用在线人类抽检、KL 约束到参考分布、定期对偏好数据做再标注，并将 reward 只用于过滤而非强化学习优化目标时风险更低。"
    }
  ],
  "followUpAnswers": [
    "CLIP 相似度只衡量图文匹配度，不衡量 caption 自身的信息质量；reward model 可在偏好数据上学习“更详细/更准确”的语义偏好，更能反映人类判断。",
    "用在线人类抽检、KL 约束到参考分布、定期对偏好数据做再标注，并将 reward 只用于过滤而非强化学习优化目标时风险更低。"
  ],
  "kind": "concept"
};
