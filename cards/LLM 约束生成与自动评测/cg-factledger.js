export default {
  "id": "cg-factledger",
  "category": "LLM 约束生成与自动评测",
  "difficulty": "Medium",
  "title": "FactLedger 事实约束双层级校验",
  "prompt": "FactLedger 如何通过 L1 精确校验与 L2 语义忠实度两层约束，保证多模态大模型生成内容的事实一致性？",
  "quickAnswer": "L1 用规则或字典精确校验姓名、日期、数字等可枚举事实，L2 用语义相似度或检索对齐判断整体忠实度；两层任一不过即触发修复或拦截。",
  "code": "import re\nfrom difflib import SequenceMatcher\n\nclass FactLedger:\n    def __init__(self, facts: dict):\n        self.facts = facts  # 期望事实 {field: value}\n\n    def check_l1(self, text: str) -> list:\n        # L1: 精确校验姓名/日期/数字\n        errors = []\n        for field, truth in self.facts.items():\n            if field in ('name', 'date', 'number') and str(truth) not in text:\n                errors.append(f'L1 missing {field}={truth}')\n        return errors\n\n    def check_l2(self, text: str, ref: str) -> float:\n        # L2: 语义忠实度（用相似度作代理）\n        return SequenceMatcher(None, text, ref).ratio()\n",
  "complexity": "时间 O(n+m)，空间 O(k)（n 生成长度，m 参考长度，k 事实数）",
  "beginnerSummary": "像记者交稿前先核红（名字、日期、数字不能错），再交给主编看意思对不对；两关都过才发布。",
  "derivation": [
    "为什么需要：大模型生成常在姓名、日期、数字上出现‘看似合理但错误’的幻觉，纯靠 Prompt 软约束不可靠，需要可执行的硬校验。",
    "怎么实现：L1 用正则或字段字典做精确包含校验，L2 用句向量或检索召回的参考句做语义对齐打分。",
    "有什么代价：L2 需额外向量检索与打分，增加延迟与存储；阈值设定不当会误杀或漏放。",
    "怎么评测：用带标注的事实错误样本计算 L1/L2 的精确率与召回率，并以修复后终稿准确率衡量闭环效果。"
  ],
  "edgeCases": [
    "姓名同音字或别名（如‘建国’vs‘建國’）导致 L1 漏检，需先归一化。",
    "日期格式多样（2024-01-01 / 2024年1月1日）需统一后再比对。",
    "数字单位不一致（‘1万’vs‘10000’）直接字符串比对会误报。",
    "长文本事实分散在多段，需先做 claim 切分再逐条校验。"
  ],
  "pitfalls": [
    "只做 L1 会漏掉语义改写后的事实错误，只做 L2 会产生大量误报与高延迟。",
    "L2 相似度阈值拍脑袋设定，未用验证集校准导致上线后分布漂移。"
  ],
  "prerequisites": [
    "文本正则与结构化抽取",
    "句向量嵌入与余弦相似度",
    "检索增强生成（RAG）基础"
  ],
  "workedExample": [
    "输入‘张三于2024年1月1日转账10000元’，事实表 name=张三 date=2024-01-01 number=10000，L1 全命中。",
    "若生成写成‘张叁于2024/1/1转了一万元’，L1 报缺失且归一化后仍别字，触发 L2 低分并送修复。"
  ],
  "lineByLine": [
    "import re / from difflib：引入正则与字符串相似度工具。",
    "check_l1：遍历事实表，对 name/date/number 字段做精确包含校验，缺失即记录错误。",
    "check_l2：用 SequenceMatcher 计算生成文本与参考文本的相似度，作为忠实度代理分。",
    "__init__：保存期望事实字典，供两层校验复用。"
  ],
  "followUps": [
    {
      "question": "L1 与 L2 的报错应如何合并驱动修复？",
      "answer": "把 L1 的精确缺失项与 L2 的低分片段拼成结构化错误清单，作为定点修复提示回注模型，避免全文重写。"
    },
    {
      "question": "如何处理 L2 语义忠实但表述不同的正例？",
      "answer": "对同义改写建立白名单或用语义相似度而非精确匹配，并把验证集上 F1 最高的阈值作为上线阈值。"
    }
  ],
  "followUpAnswers": [
    "把 L1 的精确缺失项与 L2 的低分片段拼成结构化错误清单，作为定点修复提示回注模型，避免全文重写。",
    "对同义改写建立白名单或用语义相似度而非精确匹配，并把验证集上 F1 最高的阈值作为上线阈值。"
  ],
  "explanationFocus": "是什么：FactLedger 是把事实一致性拆成两层校验的机制——L1 用确定性规则精确比对姓名、日期、金额等可枚举事实，L2 用语义相似度或检索对齐判断整体忠实度。",
  "approach": "先跑 L1 精确校验（正则/字典命中），再跑 L2 语义忠实度（embedding 余弦或 NLI），两层任一不过即进入修复或拦截。",
  "kind": "concept"
};
