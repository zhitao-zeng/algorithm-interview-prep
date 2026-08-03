export default {
  "id": "de-compliance",
  "category": "多模态数据工程",
  "difficulty": "Medium",
  "title": "数据合规与版权",
  "prompt": "在多模态训练数据构建中，如何处理版权、隐私与合规风险，做到可审计的数据溯源？",
  "quickAnswer": "合规数据工程要求：明确数据来源授权（爬虫协议、许可证）、剔除个人隐私与敏感内容、记录每条数据的 provenance（来源 URL、抓取时间、许可证）以便审计与下架。常见做法是合规过滤层 + 数据卡(data card) + 可撤回机制。",
  "approach": "建立来源白/黑名单与许可证元数据，做 PII 与敏感内容检测过滤，给每条样本附 provenance，并提供按来源批量下架的接口。",
  "explanationFocus": "是什么：数据合规指确保训练数据在版权、隐私、内容安全上合法可用；核心是来源授权可追溯、敏感信息可剔除、问题数据可撤回，形成可审计的数据供应链。",
  "bruteForce": "朴素做法：无论授权与隐私，把所有能抓到的图/文都用于训练，出事再补救。",
  "invariant": "核心不变式：进入训练集的每条样本都必须有合法来源标签且通过敏感内容检测，provenance 元数据不可缺失。",
  "walkthrough": "5 亿样本入仓前：按 robots.txt 与许可证过滤掉未授权源 3 亿；PII 检测剔除非公开人脸/身份证 0.5 亿；最终 1.5 亿带 provenance 入库。某来源被投诉后，按 source_id 在 10 分钟内批量下架其全部 800 万样本。",
  "code": "def is_compliant(sample, blocklist, piidetect):\n    if sample.source in blocklist:\n        return False, 'license'\n    if piidetect.has_pii(sample):\n        return False, 'pii'\n    return True, None",
  "complexity": "来源查表 O(1)，PII 检测为 O(样本大小×模型)，整体随数据量线性，但需额外的合规元数据存储。",
  "beginnerSummary": "像进货要发票和质检：只收有合法来源、不含隐私的照片，每张都贴来源标签，万一某供货商出问题能整批退回。",
  "diagram": "raw ─► license? ─X block ─► PII? ─X ─► tag provenance ─► train\n        │                     │\n     blocklist             piidetect",
  "derivation": [
    "为什么需要：未授权数据与隐私泄露会带来法律与声誉风险，且难以事后追溯。",
    "怎么实现：许可证/黑名单过滤 + PII 检测 + provenance 标注 + 批量下架接口。",
    "有什么代价：合规过滤减少可用数据量，且检测模型有漏报/误报成本。",
    "怎么评测：抽样审计 provenance 完整率与敏感内容漏检率，做合规红队测试。"
  ],
  "edgeCases": [
    "CC 许可证带署名要求需在数据卡标注。",
    "公开人物脸与普通人脸的隐私边界不同。",
    "用户生成内容授权随平台条款变化。",
    "水印/版权标识本身需被识别避免侵权复用。"
  ],
  "pitfalls": [
    "只看 robots.txt 忽略许可证，仍可能侵权。",
    "provenance 缺失导致无法定向下架。"
  ],
  "prerequisites": [
    "数据许可证与爬虫协议",
    "PII 与敏感内容检测",
    "数据溯源与数据卡"
  ],
  "workedExample": [
    "sample.source=\"siteX\" 在 blocklist → 拒，原因 license。",
    "sample 含身份证号 → PII 检测拒，原因 pii。",
    "合规 sample 写入 source_id 与抓取时间后入库。"
  ],
  "lineByLine": [
    "def is_compliant(sample, blocklist, piidetect): 判定样本是否合规。",
    "if sample.source in blocklist: return False,\"license\" 未授权源直接拒。",
    "if piidetect.has_pii(sample): return False,\"pii\" 含隐私则拒。",
    "return True, None 通过则带 None 原因返回合规。"
  ],
  "codeNotes": [
    "返回原因便于统计各合规拦截占比，优化白名单。"
  ],
  "followUps": [
    {
      "question": "robots.txt 禁止就等于不能抓吗？",
      "answer": "robots.txt 是行业约定非法律，但商业训练应综合许可证与条款，谨慎起见遵守并留记录。"
    },
    {
      "question": "provenance 要记哪些字段？",
      "answer": "至少来源 URL、域名、抓取时间、许可证类型、处理方式，便于审计与下架。"
    }
  ],
  "followUpAnswers": [
    "robots.txt 是行业约定非法律，但商业训练应综合许可证与条款，谨慎起见遵守并留记录。",
    "至少来源 URL、域名、抓取时间、许可证类型、处理方式，便于审计与下架。"
  ],
  "kind": "concept"
};
