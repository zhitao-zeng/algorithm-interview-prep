export default {
  "id": "mmd-hallucination-bench",
  "kind": "concept",
  "category": "多模态模型",
  "title": "多模态幻觉评测基准",
  "difficulty": "Medium",
  "prompt": "如何系统评测多模态大模型的“幻觉”问题？MMBench、SEED、RealWorldQA 与 POPE、GPT4V-eval 各自的侧重点是什么？",
  "quickAnswer": "幻觉评测分两类：综合性选择题基准（MMBench、SEED、RealWorldQA）测整体能力同时暴露错误，专项幻觉检测（POPE 用正负样本测物体存在性幻觉，GPT4V-eval 用强模型打分）精准量化“无中生有”。组合使用可区分是能力缺失还是编造。",
  "code": "def pope_sample(caption_objects, all_objects, ratio=0.5):\n    pos = [o for o in all_objects if o in caption_objects]\n    neg = [o for o in all_objects if o not in caption_objects]\n    n = int(len(pos) * ratio)\n    import random\n    neg = random.sample(neg, n)            # 负样本：图中不存在的物体\n    questions = [f\"Is there a {o} in the image?\" for o in pos + neg]\n    labels = [1] * len(pos) + [0] * len(neg)\n    return questions, labels               # 用于测存在性幻觉",
  "complexity": "O(N)",
  "beginnerSummary": "多模态模型有时会“睁眼说瞎话”，比如图里没有猫却说有猫。幻觉评测就是设计考题，专门抓这种编造，分为考综合能力的选择题和专抓“无中生有”的针对性测试。",
  "explanationFocus": "是什么：多模态幻觉评测基准是一组用于量化模型“回答与图像事实不符（编造、遗漏、属性错误）”程度的数据集与方法，包括综合选择题基准与针对性幻觉探测器。",
  "approach": "综合基准（MMBench 多能力循环评测、SEED 人工校验、RealWorldQA 真实场景）以准确率间接反映幻觉；专项方法用 POPE 的正负物体存在性问答测“说有”，用 GPT4V-eval/FAITHScore 让强模型或结构化核对做细粒度事实一致性打分。",
  "derivation": [
    "为什么需要：模型流畅但错误比明显失败更危险，需可量化指标驱动改进。",
    "怎么实现：构造带标准答案的问答对；POPE 控制正负样本比例测存在性，GPT4V-eval 用裁判模型比对回答与图像/标注。",
    "有什么代价：基准易被过拟合；GPT4V-eval 引入裁判模型自身偏差，人工标注成本高。",
    "怎么评测：以准确率、F1、幻觉率、CHAIR 等指标横向对比，并做跨基准一致性检验。"
  ],
  "edgeCases": [
    "物体部分可见或被遮挡，POPE 负样本边界模糊。",
    "属性幻觉（颜色/数量错）POPE 的存在性测试抓不到。",
    "裁判模型（GPT4V）自身也会幻觉，污染评分。",
    "训练数据含基准导致指标虚高。"
  ],
  "pitfalls": [
    "只用综合基准准确率，把能力缺失与幻觉混为一谈。",
    "盲目信任 GPT4V-eval 分数，忽略裁判模型偏差与成本。"
  ],
  "prerequisites": [
    "多模态模型基本评测范式",
    "幻觉的类型（存在性/属性/关系幻觉）"
  ],
  "workedExample": [
    "POPE：针对图中猫，构造“有猫”正样本与“有狗（图中无）”负样本，让模型判断，统计假阳性率即存在性幻觉。",
    "GPT4V-eval：把模型回答与图像一并交给 GPT-4V，逐项核对事实一致性并打分。"
  ],
  "lineByLine": [
    "pos 取图中真实存在的物体作为正样本，neg 取图中不存在的物体作负样本。",
    "构造的是/否问答并打 1/0 标签，通过模型对负样本的误判率衡量“无中生有”的幻觉程度。"
  ],
  "followUps": [
    {
      "question": "POPE 只能测存在性幻觉，如何覆盖属性与关系幻觉？",
      "answer": "可扩展为 AMPOPE 或在 CCEval/MMHalBenchmark 中加入属性（颜色、数量）与关系（左/右、上/下）问答；也可用 AMBER 统一测存在、属性、关系三类幻觉并区分生成与判别。"
    },
    {
      "question": "为什么综合基准准确率不能直接当幻觉率？",
      "answer": "准确率低可能源于模型不会而非编造；只有专项负样本测试（如 POPE 假阳性）才能隔离“编造”成分，二者需结合解读。"
    }
  ],
  "followUpAnswers": [
    "可扩展为 AMPOPE 或在 CCEval/MMHalBenchmark 中加入属性（颜色、数量）与关系（左/右、上/下）问答；也可用 AMBER 统一测存在、属性、关系三类幻觉并区分生成与判别。",
    "准确率低可能源于模型不会而非编造；只有专项负样本测试（如 POPE 假阳性）才能隔离“编造”成分，二者需结合解读。"
  ]
};
