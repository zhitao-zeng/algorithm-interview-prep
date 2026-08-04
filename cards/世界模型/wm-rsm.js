export default {
  "id": "wm-rsm",
  "category": "世界模型",
  "difficulty": "Medium",
  "title": "Recurrent State Space Model",
  "prompt": "Recurrent State Space Model（RSSM）如何用“先验+后验”两套潜状态来兼顾预测与观测校正？",
  "quickAnswer": "RSSM 用循环网络从（上一状态, 动作）生成“先验”潜状态，再用当前观测编码对先验做“后验”校正；训练时以后验为监督、推理时只用先验滚动，从而既可利用观测又能在无观测时想象未来。",
  "approach": "每一步：先验由 recur(state, action) 给出；用观测嵌入通过上采样/卷积得到后验；损失结合重构、KL(后验||先验) 与奖励/折扣预测；推理阶段丢弃后验只靠先验自回归。",
  "explanationFocus": "是什么：RSSM 是 Dreamer 系列使用的潜空间序列模型，它维护一个随机潜状态，显式区分“只靠动作推出来的先验状态”和“用当前观测校正后的后验状态”，在可预测性与观测利用之间取得平衡。",
  "bruteForce": "朴素做法：直接用确定性 RNN 隐状态建模，无法表达状态不确定性，遇到部分可观测与噪声观测容易过拟合。",
  "invariant": "不变式：后验应在观测信息充足时贴近观测，观测缺失时退化为先验；KL 项不应失衡导致后验完全忽略先验或反之。",
  "walkthrough": "1) 取上一潜状态与动作过循环网络得先验均值；2) 编码当前观测得嵌入；3) 用先验与嵌入求后验分布；4) 采样后验状态做重构与奖励预测；5) 推理时仅用先验向前滚动想象。",
  "complexity": "说明：每步需前向循环与观测编码，参数量来自循环网络与编码器；序列长度决定展开代价，适合中等长度轨迹。",
  "beginnerSummary": "入门概览：RSSM 给“脑内预测”和“亲眼所见”分别留了一个状态——预测给个大致猜测（先验），看到真实画面后再修正（后验），这样既能想象也能纠错。",
  "diagram": "  a_t      h_{t-1}\n    |        |\n    v        v\n[ recurrent ] --> prior p(s_t | s_{t-1}, a_{t-1})\n                        |\n              obs_t --> [ encoder ] --> post q(s_t | prior, o_t)\n                        |\n                  sample s_t --> decode / reward",
  "code": "def rssm_step(state, action, obs_embed, recur, encoder):\n    prior = recur(state, action)\n    post = encoder(prior, obs_embed)\n    return prior, post",
  "derivation": [
    "为什么需要：部分可观测环境中单靠观测或单靠动作都不足以推断真实状态，需要把“不确定性”显式建模进潜状态。",
    "怎么实现：循环网络输出先验分布参数，观测编码器结合先验输出后验分布，训练用重构与 KL 正则，回报与折扣也由潜状态预测。",
    "有什么代价：KL 平衡需要仔细调权重（free bits 等），否则后验坍缩或先验失效；循环结构带来长序列训练难度。",
    "怎么评测：在 control suite 等基准上对比仅先验（想象）与含后验（带观测）下的回报，并看重构与 KL 是否平衡。"
  ],
  "edgeCases": [
    "观测完全缺失的若干步中只能靠先验，误差会持续累积，需要重观测或终止。",
    "KL 权重过大时后验被先验压制，模型退化为纯前向预测。",
    "观测含大量噪声时后验过度信任观测，丢掉时序平滑性。"
  ],
  "pitfalls": [
    "忘记推理阶段要丢弃后验，误把观测送入部署中的世界模型，导致无法想象。",
    "KL 项不做 free bits 处理，造成后验坍缩、潜状态无信息。"
  ],
  "prerequisites": [
    "变分推断与 KL 散度",
    "循环神经网络与潜变量模型"
  ],
  "workedExample": [
    "示例：在 DeepMind Control Suite 的“ walker walk ”任务中，RSSM 以像素为输入学习潜动力学并规划行走。",
    "示例：把 RSSM 后验状态当特征喂给控制器，比端到端 CNN 策略更稳，且在遮挡帧下仍能维持行走。"
  ],
  "lineByLine": [
    "def rssm_step(state, action, obs_embed, recur, encoder): 单步 RSSM 推理，给出先验与后验。",
    "prior = recur(state, action) 循环网络仅凭历史状态与动作推出下一步的先验分布。",
    "post = encoder(prior, obs_embed) 观测编码器结合先验与当前观测嵌入输出后验分布。"
  ],
  "codeNotes": [
    "返回 prior 与 post 两份分布是 RSSM 的关键：训练用 post，推理/想象只用 prior。"
  ],
  "followUps": [
    {
      "question": "RSSM 与标准 VAE 的关系？",
      "answer": "可看作带时间先验的序列 VAE：先验由循环网络给出而非标准正态，后验依赖当前观测，本质仍是 ELBO 训练。"
    },
    {
      "question": "free bits 起什么作用？",
      "answer": "给 KL 设下界，防止后验过早坍缩到先验，保证潜状态保留足够信息。"
    }
  ],
  "followUpAnswers": [
    "可看作带时间先验的序列 VAE：先验由循环网络给出而非标准正态，后验依赖当前观测，本质仍是 ELBO 训练。",
    "给 KL 设下界，防止后验过早坍缩到先验，保证潜状态保留足够信息。"
  ],
  "kind": "concept"
};
