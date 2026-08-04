export default {
  "id": "se-multimodal-attack",
  "category": "安全红队",
  "difficulty": "Hard",
  "title": "多模态对抗攻击",
  "prompt": "针对视觉语言模型的对抗样本是如何误导多模态理解的？",
  "quickAnswer": "攻击者在图像上叠加人眼难辨的扰动或在文本中插入对抗 token，使视觉语言模型给出错误标签或错误推理。",
  "approach": "先定义目标错误输出，用梯度或黑盒查询生成最小扰动，使图像编码或跨模态对齐偏移；文本侧则用同义替换与特殊字符制造对抗提示，联合优化跨模态误导。",
  "explanationFocus": "是什么：多模态对抗攻击指对图像、文本等输入施加微小且常不可感知的扰动，使视觉语言模型产生与真实语义不符的错误预测或推理。",
  "bruteForce": "最朴素攻击是随机在图像上加噪点并观察输出变化，直到模型犯错，但效率低且扰动易被人察觉。",
  "invariant": "不变式：在干净输入上正确的模型，面对满足 L_p 约束的微小扰动时，其错误率应被控制在可接受上界内。",
  "walkthrough": "先取目标样本与期望错误输出，计算损失对输入的梯度生成对抗扰动，迭代缩小扰动幅度，最后在白/黑盒下验证模型被正确误导且人眼难辨。",
  "complexity": "白盒攻击为 O(k·g)（k 为迭代、g 为梯度成本），黑盒为 O(q·f)（q 为查询、f 为前向），随分辨率线性增长。",
  "beginnerSummary": "对抗扰动像给照片贴了层隐形贴纸：人眼看不出，但模型\"看走眼\"。攻击就是找这层贴纸让模型误判。",
  "diagram": "image(perturb) --> VLM --> wrong_label\ntext(adv)      --> VLM --> mislead",
  "code": "def pgd_attack(model, image, label, eps=0.03, steps=10):\n    adv = image.clone()\n    for _ in range(steps):\n        g = grad(model(adv), adv)\n        adv = adv + eps * sign(g)\n    return adv",
  "derivation": [
    "为什么需要：自动驾驶、医疗影像等依赖多模态判断，证明可被微妙扰动误导才能推动鲁棒训练与认证。",
    "怎么实现：用梯度或查询生成满足范数约束的扰动，使视觉编码或跨模态对齐偏移至错误语义。",
    "有什么代价：白盒需模型梯度，黑盒查询成本高，且强扰动会降低隐蔽性，现实部署受限。",
    "怎么评测：报告攻击成功率与平均扰动幅度，并测防御后的鲁棒精度提升。"
  ],
  "edgeCases": [
    "打印-拍摄物理变换削弱数字扰动效果。",
    "文本对抗 token 被分词器归一化抵消。",
    "跨模态联合扰动在单一模态防御下失效。"
  ],
  "pitfalls": [
    "只在白盒假设下评估，忽视黑盒现实。",
    "扰动幅度过大，失去隐蔽性与说服力。"
  ],
  "prerequisites": [
    "梯度下降与反向传播原理。",
    "视觉语言模型跨模态对齐机制。"
  ],
  "workedExample": [
    "在停车标志图叠加 L_inf=0.03 扰动，VLM 误识为限速标志，人眼无感。",
    "在询问文本插入特殊 unicode，模型忽略关键约束给出错误推理链。"
  ],
  "lineByLine": [
    "def pgd_attack(model, image, label, eps, steps)：定义 PGD 攻击函数。",
    "adv = image.clone()：以原图初始化对抗样本。",
    "for _ in range(steps)：迭代更新对抗样本。",
    "g = grad(model(adv), adv)：求损失对输入的梯度。",
    "adv = adv + eps * sign(g)：沿符号梯度方向以小步长推进。"
  ],
  "codeNotes": [
    "实际应对 adv 做 clip 回合法范围，且可加入跨模态联合损失提升迁移性。"
  ],
  "followUps": [
    {
      "question": "有哪些鲁棒防御？",
      "answer": "对抗训练、输入去噪与随机化预处理能提升鲁棒性，但会增加训练成本并可能损失干净精度。"
    },
    {
      "question": "对抗样本能跨模型迁移吗？",
      "answer": "由于梯度相似，白盒生成的扰动常能迁移到黑盒模型，尤其在同架构家族中迁移率更高。"
    }
  ],
  "followUpAnswers": [
    "对抗训练、输入去噪与随机化预处理能提升鲁棒性，但会增加训练成本并可能损失干净精度。",
    "由于梯度相似，白盒生成的扰动常能迁移到黑盒模型，尤其在同架构家族中迁移率更高。"
  ],
  "kind": "concept"
};
