export default {
  "id": "sy-distill-reason",
  "category": "合成数据",
  "difficulty": "Hard",
  "title": "蒸馏推理数据(长思维链)",
  "prompt": "如何把强推理模型的长链思维(long-CoT)蒸馏成小模型可用的训练数据？",
  "quickAnswer": "用强教师模型对一批问题生成带中间推理步骤的长思维链回答，经过正确性验证、步骤清洗与格式归一后，作为监督数据微调学生模型，使其学会显式推理而非仅记答案。",
  "approach": "三阶段：1) 采样问题与教师长链回答；2) 用答案可验证性(数学/代码执行)或独立裁判筛掉错误链；3) 归一化步骤格式并去重，用于 SFT 学生；可进一步加拒绝采样或偏好数据。",
  "explanationFocus": "是什么：蒸馏推理数据指用强推理教师生成包含显式中间步骤的长思维链样本，再监督训练学生模型以获得类人的逐步推理能力。",
  "bruteForce": "朴素做法：直接让学生模仿教师最终答案，跳过过程，结果遇到新题易错且不可解释。",
  "invariant": "凡入池的长链样本，其最终答案必须经验证正确，且每一步推理可由前一步逻辑推出。",
  "walkthrough": "对一道几何题，教师产出\"设未知数->列方程->代入化简->得解\"的长链，代码/数值校验最终答案正确后，把整条链作为一条 SFT 样本给学生。",
  "complexity": "主要成本在教师生成长链(令牌多)与验证(需执行/裁判)，约 O(N*L)；学生训练成本与普通 SFT 相当。",
  "beginnerSummary": "让会思考的大模型把\"解题过程\"写详细，验证过程对、答案对之后，拿这些过程教小模型学着一步步想。",
  "diagram": "questions --teacher(long-CoT)--> raw chains\nraw chains --verify answer+steps--> valid chains\nvalid chains --normalize/dedup--> SFT data\nSFT data --train--> student w/ CoT",
  "code": "def distill_reason(questions, teacher, verifier):\n    data = []\n    for q in questions:\n        chain = teacher.long_cot(q)\n        if verifier.check(q, chain):\n            data.append({\"prompt\": q, \"completion\": chain})\n    return data",
  "derivation": [
    "为什么需要：小模型缺乏隐式推理容量，直接学答案泛化差；显式长链能把推理过程外化，可监督且可验证。",
    "怎么实现：教师生成长链，用可执行验证(答案核对/单测)或裁判筛除错误链，再统一步骤格式与去重形成 SFT 语料。",
    "有什么代价：长链生成令牌多、验证需额外算力；错误链若漏筛会污染学生；分布可能与真实短答不一致。",
    "怎么评测：在 GSM8K/MATH 等推理基准对比学生蒸馏前后准确率，并人工看链步是否连贯可复现。"
  ],
  "edgeCases": [
    "教师长链最终答案错但步骤看似合理，必须用答案验证拦截。",
    "多解问题只有部分路径正确，需按可验证性而非表面流畅度筛选。",
    "链中含非法外部调用(如真实联网)，需约束教师工具权限。",
    "极长链超出上下文，需分段或截断并校验完整性。"
  ],
  "pitfalls": [
    "只验证最终答案会放过\"歪打正着\"的错链，应同时校验关键中间步。",
    "学生过拟合教师风格而丧失自身泛化，建议混合真实数据并控制温度。"
  ],
  "prerequisites": [
    "理解思维链(CoT)提示与监督微调(SFT)。",
    "掌握可验证任务(数学/代码)的答案校验方法。"
  ],
  "workedExample": [
    "数学题\"鸡兔同笼\"：教师写出设变量、列方程、消元求解的完整链，数值校验后作为样本。",
    "代码题\"两数之和\"：教师写出遍历与哈希两种思路并给出可运行解，单测通过后入库。"
  ],
  "lineByLine": [
    "chain = teacher.long_cot(q) 让教师对问题产出包含中间推理的长思维链。",
    "if verifier.check(q, chain): 仅保留答案与关键步骤均通过验证的链，保证不变量。",
    "data.append({\"prompt\": q, \"completion\": chain}) 以(问题, 长链)对形式存入 SFT 数据。",
    "return data 返回清洗后的蒸馏数据集供学生微调。"
  ],
  "codeNotes": [
    "verifier.check 对数学可用符号求解、对代码可跑单测，比单纯 LLM 裁判更可靠。"
  ],
  "followUps": [
    {
      "question": "蒸馏与 RLHF/GRPO 有何关系？",
      "answer": "蒸馏提供高质量正向样本做 SFT，RLHF/GRPO 进一步用偏好或奖励优化策略，常先蒸馏再强化。"
    },
    {
      "question": "长链过拟合怎么办？",
      "answer": "混入真实短答数据、对链做多样性采样与去重，并在验证集监控学生泛化而非仅训练损失。"
    }
  ],
  "followUpAnswers": [
    "蒸馏提供高质量正向样本做 SFT，RLHF/GRPO 进一步用偏好或奖励优化策略，常先蒸馏再强化。",
    "混入真实短答数据、对链做多样性采样与去重，并在验证集监控学生泛化而非仅训练损失。"
  ],
  "kind": "concept"
};
