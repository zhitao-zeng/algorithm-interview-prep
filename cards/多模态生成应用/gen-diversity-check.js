export default {
  "id": "gen-diversity-check",
  "category": "多模态生成应用",
  "difficulty": "Medium",
  "title": "Schema 与多样性校验及 repair-with-feedback",
  "prompt": "批量生成内容后，如何用 Schema/字段一致性、bigram 与 Jaccard 做多样性校验，并以 repair-with-feedback 修复？",
  "quickAnswer": "先校验每条是否满足 Schema 字段与类型，再用 bigram 重叠与 Jaccard 集合相似度度量批次内重复，超阈值则把缺失字段/重复项作为反馈回写生成器重生成，形成校验—修复闭环。",
  "code": "from typing import List, Set\n\ndef jaccard(a: Set[str], b: Set[str]) -> float:\n    return len(a & b) / max(1, len(a | b))\n\ndef diversity_report(items: List[str], n: int = 2) -> float:\n    grams = [set(items[i:i+n]) for i in range(len(items)-n+1)]\n    sim = sum(jaccard(grams[i], grams[j]) for i in range(len(grams)) for j in range(i+1, len(grams)))\n    pairs = max(1, len(grams)*(len(grams)-1)//2)\n    return 1 - sim / pairs\n\ndef repair_with_feedback(item, schema_fields):\n    # 字段缺失则回写反馈让生成器补字段\n    missing = [f for f in schema_fields if f not in item]\n    return item, missing\n",
  "complexity": "字段校验 O(N·F)、Jaccard 对 O(N²·G)、修复 O(repairs)",
  "beginnerSummary": "校验像编辑审稿：先查每篇格式对不对，再看彼此是不是换汤不换药，重复或残缺的就打回重写。",
  "derivation": [
    "为什么需要：批量生成易出字段缺失、内容雷同，需自动拦住不合格项并保证批次多样。",
    "怎么实现：按 Schema 校验字段，用 bigram 重叠估相似、Jaccard 估集合多样，低于阈值触发 repair。",
    "有什么代价：N² 相似度在海量批次会变慢，需要分桶或采样；反馈重写增加额外生成成本。",
    "怎么评测：修复后批次字段完整率 100%、平均 Jaccard 多样性高于目标线，重复项归零。"
  ],
  "edgeCases": [
    "字段为 null 但类型对，Schema 校验通过却语义空，需加非空规则。",
    "短文本 bigram 过少，相似度估计噪声大，需要最小长度门槛。",
    "全部雷同时 Jaccard 趋于 0，修复应换 seed/换 prompt 而非仅补字段。",
    "嵌套 Schema 字段路径写错导致漏检。"
  ],
  "pitfalls": [
    "只看字段存在不看类型，字符串错填数字下游崩。",
    "repair 只补字段不解决雷同，批次仍像复制。"
  ],
  "prerequisites": [
    "JSON Schema 与数据校验",
    "集合相似度（Jaccard）与 n-gram",
    "反馈循环与重试策略"
  ],
  "workedExample": [
    "100 条文案校验出 7 条缺 tag 字段、12 对 bigram 重叠>0.8，触发 repair。",
    "把缺失字段与重复对作为 feedback 回写生成器换 seed 重生成，二轮 Jaccard 多样性从 0.31 升到 0.58。"
  ],
  "lineByLine": [
    "def jaccard：计算两集合交并比作为相似度。",
    "def diversity_report：对条目取 n-gram 集合算两两 Jaccard。",
    "sim=sum(jaccard(...))：累加所有对的相似度。",
    "return 1−sim/pairs：转成多样性分数，越高越多样。",
    "def repair_with_feedback：比对 Schema 找缺失字段。",
    "missing=[f for f in schema_fields if f not in item]：列出缺字段。",
    "return item, missing：把缺失作为反馈交回生成器。"
  ],
  "followUps": [
    {
      "question": "为什么用 bigram 而不用整句嵌入？",
      "answer": "bigram 轻量、可解释、能直接指出重复短语，嵌入虽准但贵且难定位，校验阶段更看重速度与可反馈。"
    },
    {
      "question": "repair 重试几次该停？",
      "answer": "设最大重试（如 3 次），仍超阈值则降级标记人工审核，避免无限循环烧算力。"
    },
    {
      "question": "Jaccard 阈值怎么定？",
      "answer": "在人工标好的够多样批次上统计分布，取分位（如 0.4）作上线阈值，并按内容长度分段校准。"
    }
  ],
  "followUpAnswers": [
    "bigram 轻量、可解释、能直接指出重复短语，嵌入虽准但贵且难定位，校验阶段更看重速度与可反馈。",
    "设最大重试（如 3 次），仍超阈值则降级标记人工审核，避免无限循环烧算力。",
    "在人工标好的够多样批次上统计分布，取分位（如 0.4）作上线阈值，并按内容长度分段校准。"
  ],
  "explanationFocus": "是什么：多样性校验是在批量生成后用 Schema 字段一致性、bigram 重叠与 Jaccard 集合相似度识别残缺与雷同，repair-with-feedback 把问题作为反馈回写生成器重生成。",
  "approach": "先结构化校验拦掉字段错误，再用 n-gram/Jaccard 量化批次多样，超阈值项携带缺失字段与重复信号回写生成器换种子重生成，形成闭环。",
  "kind": "concept"
};
