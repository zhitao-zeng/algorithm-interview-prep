export default {
  "id": "gen-aigc-pipeline",
  "category": "多模态生成应用",
  "difficulty": "Hard",
  "title": "AIGC 内容系统设计与评测闭环",
  "prompt": "设计一个 AIGC 内容系统时，如何打通生成—评测—回流闭环以保证持续提质？",
  "quickAnswer": "系统分生成、评测、回流三层：生成产出内容并入库，评测用质量/安全/多样性打分，回流把低分项与人工标注喂回训练或提示优化，形成可量化、可迭代的闭环。",
  "code": "from typing import List\n\nclass EvalLoop:\n    def __init__(self):\n        self.buffer: List[dict] = []\n\n    def produce(self, content: dict) -> dict:\n        self.buffer.append(content)\n        return content\n\n    def evaluate(self, scorer) -> float:\n        # 评测闭环: 用打分器回流质量信号\n        scores = [scorer(c) for c in self.buffer]\n        return sum(scores) / max(1, len(scores))\n",
  "complexity": "生成 O(steps)、评测 O(N·M)、回流 O(feedback)",
  "beginnerSummary": "AIGC 系统像带质检的工厂：生产→打分→把次品原因反馈回车间改工艺，越改越好。",
  "derivation": [
    "为什么需要：一次性生成难保长期质量与合规，需要数据驱动持续迭代而非手工调参。",
    "怎么实现：生成层产出并缓冲，评测层用多维度打分器量化，回流层把低分与标注写入改进队列（重训/提示/过滤）。",
    "有什么代价：评测与回流引入额外管线与存储，错误打分会误导回流方向，需要人机协同兜底。",
    "怎么评测：看闭环前后质量分均值、违规率与多样性趋势，以及低分回流后的修复率是否上升。"
  ],
  "edgeCases": [
    "评测器本身有偏，回流会放大偏差，需要定期人工校准。",
    "爆款与平庸内容同批，回流若只看低分会丢良性样本。",
    "合规红线内容必须拦截而非只打分，需硬过滤前置。",
    "多模态指标口径不一，跨模态汇总需加权归一。"
  ],
  "pitfalls": [
    "只做生成不做评测，质量问题上线才暴露。",
    "回流直接用模型自评低分重训，易陷入自证循环。"
  ],
  "prerequisites": [
    "生成管线与数据存储",
    "多维度评测（质量/安全/多样）",
    "反馈学习与数据闭环"
  ],
  "workedExample": [
    "上线首周收集 1 万条内容，评测器标出 800 条低分，回流提示优化后二轮低分降到 300 条。",
    "把 200 条人工标注的违规样本加入硬过滤，违规率从 1.2% 降到 0.3%。"
  ],
  "lineByLine": [
    "class EvalLoop：封装生成—评测闭环。",
    "self.buffer=[]：缓冲生成内容供评测。",
    "def produce：产出内容并入库缓冲。",
    "def evaluate：用打分器算平均质量分。",
    "scores=[scorer(c) for c in self.buffer]：逐条打分。",
    "return 均值：返回批次质量信号供回流决策。"
  ],
  "followUps": [
    {
      "question": "评测器不够准时怎么敢回流？",
      "answer": "先用人工标注小样本校准评测器，回流只采纳高置信低分，并保留人工抽检兜底。"
    },
    {
      "question": "闭环和单纯 A/B 测试区别？",
      "answer": "A/B 比的是当前两版，闭环把信号持续喂回改进，是纵向进化而非横向比较。"
    },
    {
      "question": "多模态指标怎么聚合？",
      "answer": "对各模态分数 min-max 归一后按业务权重求和，安全指标设为硬门槛一票否决。"
    }
  ],
  "followUpAnswers": [
    "先用人工标注小样本校准评测器，回流只采纳高置信低分，并保留人工抽检兜底。",
    "A/B 比的是当前两版，闭环把信号持续喂回改进，是纵向进化而非横向比较。",
    "对各模态分数 min-max 归一后按业务权重求和，安全指标设为硬门槛一票否决。"
  ],
  "explanationFocus": "是什么：AIGC 内容系统是把生成、自动评测与反馈回流打通的工程体系，用数据闭环替代手工调参，实现质量与合规的持续可迭代提升。",
  "approach": "分层设计生成—评测—回流，评测用质量/安全/多样多维打分，回流把低分与人工标注导向提示优化或重训，并以安全硬过滤前置守住红线。",
  "kind": "concept"
};
