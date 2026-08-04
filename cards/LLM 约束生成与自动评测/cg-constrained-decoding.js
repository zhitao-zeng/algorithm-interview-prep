export default {
  "id": "cg-constrained-decoding",
  "category": "LLM 约束生成与自动评测",
  "difficulty": "Hard",
  "title": "约束解码：grammar / JSON 约束生成",
  "prompt": "约束解码（constrained decoding）如何借助 grammar 或 JSON schema 在 token 级别限制生成，从而做到‘结构上不可能出错’？",
  "quickAnswer": "在解码每一步用 grammar/JSON schema 计算合法 token 集合并屏蔽非法 token，使输出在结构上必然满足约束，无需后置修复。",
  "code": "from outlines import models, generate\n\ndef constrained_json(schema: dict, llm):\n    # 约束解码：用 JSON schema 限制生成空间\n    model = models.transformers(llm)\n    generator = generate.json(model, schema)\n    return generator('请按要求输出')  # 输出必为合法 JSON\n",
  "complexity": "时间 O(L*V')，空间 O(L)（L 长度，V' 受限词表）",
  "beginnerSummary": "像填表格：每个空格只能填规定类型的内容，系统在你打字时就只让合法的字出来，根本填不出错格式。",
  "derivation": [
    "为什么需要：后置修复有成本且可能失败，若能在解码时屏蔽非法 token，结构正确性可由构造保证。",
    "怎么实现：把 JSON schema/grammar 编译成状态机，每步求合法后继 token 分布并 mask 掉非法项。",
    "有什么代价：需解码器支持 token masking，受限分布可能略降流畅度，复杂 grammar 编译有开销。",
    "怎么评测：统计输出 100% 合法率，并对比自由生成+修复的延迟与质量。"
  ],
  "edgeCases": [
    "中文等需子词拼接，mask 要作用在 token 而非字符级。",
    "schema 含正则 pattern，状态机需能表达。",
    "枚举值前缀相同，需读到完整 token 才定合法。",
    "流式场景下约束状态需随增量输出维护。"
  ],
  "pitfalls": [
    "解码器不支持 logit mask，只能退化成后置校验。",
    "grammar 过严限制表达，导致模型绕写为近似合规实则偏题。"
  ],
  "prerequisites": [
    "自回归解码与 logits",
    "文法/状态机编译",
    "tokenizer 与子词边界"
  ],
  "workedExample": [
    "schema 要求 {'name':str,'age':int}，解码时 ‘age’ 后只允许数字 token，不可能吐出字符串。",
    "自由生成偶发缺逗号，约束解码因 grammar 必补逗号，输出可直接 json.loads。"
  ],
  "lineByLine": [
    "from outlines：引入支持约束解码的库。",
    "models.transformers(llm)：包装底层模型供约束生成调用。",
    "generate.json(model, schema)：按 JSON schema 编译合法 token 状态机。",
    "generator(...)：在约束下解码，输出必为合法 JSON。"
  ],
  "followUps": [
    {
      "question": "约束解码与后置修复如何选？",
      "answer": "强结构（JSON/SQL）优先约束解码保 100% 合法；软语义约束仍需后置 Validator，二者常叠加。"
    },
    {
      "question": "约束解码会伤害生成质量吗？",
      "answer": "仅在受限分布内采样，若 grammar 合理影响很小；可用约束+采样温度平衡多样性与合规。"
    }
  ],
  "followUpAnswers": [
    "强结构（JSON/SQL）优先约束解码保 100% 合法；软语义约束仍需后置 Validator，二者常叠加。",
    "仅在受限分布内采样，若 grammar 合理影响很小；可用约束+采样温度平衡多样性与合规。"
  ],
  "explanationFocus": "是什么：约束解码是在自回归生成每一步用 grammar 或 JSON schema 计算合法 token 集合并屏蔽非法的技术，使输出在结构上必然满足约束。",
  "approach": "将 schema/grammar 编译成状态机，每步对 logits 做 mask 仅保留合法 token，从而构造出不可能格式错误的输出。",
  "kind": "concept"
};
