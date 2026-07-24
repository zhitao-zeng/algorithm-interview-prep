export default {
  "kind": "concept",
  "id": "ctx-009",
  "category": "长上下文与位置编码",
  "difficulty": "Medium",
  "title": "长度外推评测：Passkey 与 Needle-in-a-Haystack",
  "prompt": "如何用 Passkey Retrieval 和 Needle-in-a-Haystack 评测模型的长度外推能力？",
  "quickAnswer": "两者都在长『干草堆』文本中埋入一个关键信息（密码/事实），要求模型在任意长度与深度下召回。NIAH 扫『上下文长度×插入深度』成热力图，暴露『lost in the middle』；Passkey 测精确数字召回。二者都是长上下文可靠性的地板测试。",
  "approach": "埋针于草堆：在无关长文本中插入唯一答案，扫不同长度与深度看能否被找回。",
  "explanationFocus": "是什么：Needle-in-a-Haystack（NIAH）与 Passkey Retrieval 是评测长上下文『能否真正用到远处信息』的基准：在大量无关文本（haystack）中埋入一个唯一关键事实（needle/passkey），要求模型在指定上下文长度与插入深度下准确复述。",
  "bruteForce": "只报『支持 128K』或只看 PPL。问题：PPL 对长程检索不敏感，厂商标称长度常是『天花板』而非可用范围，需实测召回。",
  "derivation": [
    "为什么需要：标称上下文窗口 ≠ 实际可用；模型常在中段（lost in the middle）或极长处召回骤降，必须量化。",
    "怎么实现：构造 haystack（如重复无关句填到目标 token 数），在深度 d∈{10%,50%,90%…} 插入 needle；在多个总长度 L 上跑模型问 needle 内容；记录通过率绘成 长度×深度 热力图。Passkey 用随机数字串测精确召回。",
    "有什么代价：只测字面召回，不测多跳推理/聚合/对抗干扰；需大量重复 trial 得稳定通过率；长长度下推理成本高。",
    "怎么评测：报告各 (L, depth) 通过率与 U 型曲线；对比扩窗方法（YaRN 7B s=32 在 128K 达 99.4%，Code Llama NTK 约 94.3%）——数字建议二次核对。"
  ],
  "invariant": "评测不变式：needle 必须是『只有从它自身才能回答』的唯一事实，且深度/长度要系统扫描，否则结论有偏。",
  "walkthrough": "例：在 100K token 填充文本的第 50% 处插入『密码是 938271』，问『密码是多少？』；若答错即该 (100K, mid) 格失败，热力图中间暗即 lost-in-the-middle。",
  "edgeCases": [
    "只测首尾深度会漏掉中段失效（U 型曲线）。",
    "NIAH 通过≠真实推理强，需配合 LongBench/MRCR 等。",
    "深度与长度的格需多次 trial，单次有随机性。"
  ],
  "code": "def needle_eval(haystack_len, depth, needle, question, model):\n    insert_at = int(haystack_len * depth)\n    text = fill_haystack(haystack_len, insert_at, needle)\n    ans = model.generate(text + '\\n' + question)\n    return needle in ans   # 精确召回判通过\n\n# 扫描 长度 × 深度 得到热力图(建议多次 trial 取通过率)",
  "codeNotes": [
    "depth 应覆盖 10%~95%，尤其包含 50% 中段。",
    "判分宜用精确/关键词匹配，多次 trial 取通过率更稳。"
  ],
  "complexity": "评测成本随最大长度与 trial 数线性增长；瓶颈在长序列推理而非构造。",
  "followUps": [
    {
      "question": "NIAH 通过就代表长上下文靠谱吗？",
      "answer": "不够。NIAH 只测字面召回，不测多跳推理、跨段聚合与对抗干扰，需配合 LongBench/MRCR 等。"
    },
    {
      "question": "Passkey 和 NIAH 区别？",
      "answer": "本质同类；Passkey 多用随机数字串测精确召回，NIAH 多用一句事实句，二者都扫长度×深度。"
    }
  ],
  "followUpAnswers": [
    "不够。NIAH 只测字面召回，不测多跳推理、跨段聚合与对抗干扰，需配合 LongBench/MRCR 等。",
    "本质同类；Passkey 多用随机数字串测精确召回，NIAH 多用一句事实句，二者都扫长度×深度。"
  ],
  "pitfalls": [
    "只测首尾深度，误以为长上下文全好（漏掉中段失效）。",
    "把 NIAH 通过率当成综合长文本推理能力。"
  ],
  "beginnerSummary": "就像在稻草堆里藏一根针，看模型能不能在任意长度和任意位置都把它找出来。扫一遍『多长 × 藏在哪』画成热力图，中间发暗就是模型『读到中间就忘了』。",
  "prerequisites": [
    "长上下文与扩窗方法",
    "困惑度 PPL 的局限"
  ],
  "workedExample": [
    "100K 填充文本，50% 处插入『密码 938271』。",
    "问『密码是多少』，答错则该格失败；多长度多深度扫出 U 型热力图。"
  ],
  "lineByLine": [
    "insert_at = len*depth：按深度定位插入点。",
    "fill_haystack：用无关文本填到目标长度并埋 needle。",
    "needle in ans：精确召回判通过，扫网格得热力图。"
  ],
  "diagram": "长度\\深度  首  中  尾\n 8K       ✓   ✓   ✓\n 32K      ✓   △   ✓\n 128K     ✓   ✗   ✓   ← lost in middle"
};
