export default {
  "id": "cg-patch-optimize",
  "category": "LLM 约束生成与自动评测",
  "difficulty": "Easy",
  "title": "patch optimize 生成前约束",
  "prompt": "patch optimize 为什么要在生成前就把硬约束 patch 进 prompt 或解码前缀，而不是生成后再修？",
  "quickAnswer": "生成前注入约束能直接缩小解码空间、减少违规样本，从而降低后续修复与返工成本；越早约束，单位合规成本越低。",
  "code": "def patch_optimize(prompt: str, constraints: list) -> str:\n    # 生成前把硬约束 patch 进 system prompt / 解码前缀\n    patched = prompt\n    for c in constraints:\n        patched += f'\\n[CONSTRAINT] {c}'\n    return patched  # 模型在约束下生成，减少返工\n",
  "complexity": "时间 O(c)，空间 O(c)（c 为约束条数）",
  "beginnerSummary": "像考试前先把答题规则写卷首：考生一开始就照规则写，比写完了再挨个改省事得多。",
  "derivation": [
    "为什么需要：生成后再修复成本高且可能引入新错，前置约束能从源头降低违规率。",
    "怎么实现：把约束列表拼进 system prompt，或作为受控解码的强制前缀/grammar 注入解码器。",
    "有什么代价：约束过多会挤占上下文、限制表达；部分约束只能靠解码层而非提示实现。",
    "怎么评测：对比‘前置约束’与‘后置修复’的终稿通过率与平均延迟，验证前置更优。"
  ],
  "edgeCases": [
    "约束之间互相矛盾，需前置做冲突检测。",
    "约束过长超出上下文窗口，需优先级裁剪。",
    "grammar 约束无法表达软性语义规则，需配合 L2 校验。",
    "多语言场景约束文案需与生成语言一致。"
  ],
  "pitfalls": [
    "把约束堆在 user prompt 末尾被模型忽略，应放在 system 或解码前缀。",
    "约束与示例矛盾，反而降低遵循率。"
  ],
  "prerequisites": [
    "Prompt 模板与上下文管理",
    "受控解码与前缀约束",
    "约束冲突检测"
  ],
  "workedExample": [
    "约束‘输出严格 JSON、字段含 title/date’patch 进 system，模型首轮即产出合规 JSON。",
    "同时 patch‘用中文’与‘保留英文术语’，冲突检测发现无冲突后合并注入。"
  ],
  "lineByLine": [
    "def patch_optimize：接收原始 prompt 与约束列表。",
    "patched = prompt：以原 prompt 为基础。",
    "for c in constraints：逐条把约束格式化为 [CONSTRAINT] 行追加。",
    "return patched：返回已注入硬约束的最终 prompt。"
  ],
  "followUps": [
    {
      "question": "前置约束与受控解码如何配合？",
      "answer": "提示层放语义规则，解码层放 grammar/JSON 硬结构，两层互补：前者管‘写什么’，后者管‘长什么样’。"
    },
    {
      "question": "约束过多导致遵循率下降怎么办？",
      "answer": "按历史违规频率排序，只前置高频强约束，长尾约束交给后置 Validator 兜底。"
    }
  ],
  "followUpAnswers": [
    "提示层放语义规则，解码层放 grammar/JSON 硬结构，两层互补：前者管‘写什么’，后者管‘长什么样’。",
    "按历史违规频率排序，只前置高频强约束，长尾约束交给后置 Validator 兜底。"
  ],
  "explanationFocus": "是什么：patch optimize 是在生成前把硬约束注入 prompt 或解码前缀的优化手段，从源头缩小解码空间、降低返工。",
  "approach": "将约束列表格式化为受控指令 patch 进 system prompt 或受控解码前缀，让模型在约束下直接生成合规内容。",
  "kind": "concept"
};
