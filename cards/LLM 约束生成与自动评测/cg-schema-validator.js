export default {
  "id": "cg-schema-validator",
  "category": "LLM 约束生成与自动评测",
  "difficulty": "Easy",
  "title": "Schema / 业务 Validator 校验",
  "prompt": "在约束生成链路中，如何用一个 Schema 加业务 Validator 来保证模型输出的字段类型、必填项与枚举值都合法？",
  "quickAnswer": "用 JSON Schema 强制字段类型、必填与枚举，再叠加业务 Validator 检查领域规则（如情感只能是 pos/neg/neu），返回结构化错误列表供修复。",
  "code": "import json\nfrom jsonschema import validate\n\ndef validate_schema(output: dict, schema: dict) -> list:\n    # 业务 Validator：JSON Schema + 领域规则\n    errors = []\n    try:\n        validate(instance=output, schema=schema)\n    except Exception as e:\n        errors.append(str(e))\n    if output.get('sentiment') not in ('pos', 'neg', 'neu'):\n        errors.append('business rule: invalid sentiment')\n    return errors\n",
  "complexity": "时间 O(f)，空间 O(1)（f 为字段数）",
  "beginnerSummary": "像表单校验：先保证必填项都填、类型对，再检查下拉框选的值在允许范围内，不合规就列出来。",
  "derivation": [
    "为什么需要：模型常输出多余字段、漏字段或类型错误，下游解析会崩，需要可程序化拦截。",
    "怎么实现：用 JSON Schema 描述类型/必填/枚举，validate 抛错即记录；再写业务规则函数补 Schema 表达不了的逻辑。",
    "有什么代价：Schema 维护成本随业务演进增长，需与产品约定同步更新。",
    "怎么评测：对一批真实输出跑 Validator，统计拦截率与误拦截率，确认不阻塞正常样本。"
  ],
  "edgeCases": [
    "字段存在但为 null，JSON Schema 的 type 与 nullable 需区分清楚。",
    "枚举值大小写或前后空格（‘Pos ’）导致精确匹配失败，需先 strip/lower。",
    "嵌套对象深层字段缺失，Schema 需 required 逐级声明。",
    "数组元素类型不一时，Schema items 要能表达联合类型。"
  ],
  "pitfalls": [
    "只依赖 Prompt 让模型‘输出合法 JSON’，实际仍会偶发格式错误，必须程序化兜底。",
    "业务规则写在 Schema 之外却忘了同步，导致校验与需求脱节。"
  ],
  "prerequisites": [
    "JSON 与 JSON Schema 基础",
    "Python 字典与异常处理",
    "领域建模与枚举设计"
  ],
  "workedExample": [
    "输出 {'sentiment':'good'} 但 Schema 枚举限 pos/neg/neu，validate 通过但业务规则报 invalid sentiment。",
    "输出缺失必填字段 'summary'，validate 直接抛错并返回路径信息，定位到哪缺字段。"
  ],
  "lineByLine": [
    "from jsonschema import validate：引入 Schema 校验库。",
    "validate(instance=output, schema=schema)：按 Schema 校验类型/必填/枚举，失败抛异常。",
    "except Exception：捕获校验错误并转成字符串存入 errors 列表。",
    "业务规则判断 sentiment 是否在合法枚举内，否则追加错误。"
  ],
  "followUps": [
    {
      "question": "Schema 校验失败时应如何最小代价修复？",
      "answer": "把失败路径与原因回注模型做定点补全，而不是重新生成整段，降低 token 与延迟。"
    },
    {
      "question": "如何表达 Schema 难以覆盖的跨字段约束？",
      "answer": "在业务 Validator 里写依赖校验（如 start<end），或改用更灵活的策略引擎描述规则。"
    }
  ],
  "followUpAnswers": [
    "把失败路径与原因回注模型做定点补全，而不是重新生成整段，降低 token 与延迟。",
    "在业务 Validator 里写依赖校验（如 start<end），或改用更灵活的策略引擎描述规则。"
  ],
  "explanationFocus": "是什么：Schema / 业务 Validator 是用 JSON Schema 强制输出结构与类型，再叠加领域规则函数，对模型输出做程序化合法性校验的机制。",
  "approach": "先用 validate 跑 Schema 拦类型/必填/枚举错误，再用业务规则补 Schema 表达不了的跨字段逻辑，统一返回错误列表供修复。",
  "kind": "concept"
};
