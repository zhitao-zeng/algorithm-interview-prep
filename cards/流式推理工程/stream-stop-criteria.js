export default {
  "id": "stream-stop-criteria",
  "kind": "concept",
  "category": "流式推理工程",
  "difficulty": "Easy",
  "title": "流式停止判定与截断",
  "prompt": "流式生成时,服务端应该在什么条件下停止吐 token,有哪些停止判定策略及其在流式场景下的坑？",
  "quickAnswer": "流式停止判定主要有四类:EOS 结束符命中(需吞掉不推送)、用户 stop sequences 匹配(在累积文本上检测,注意可能跨 token 边界被拆开)、max_tokens 硬上限(防失控但可能截断)、以及流式 early stop(结构闭合即停)。坑在于 stop sequence 跨边界漏判、EOS 被当成文本推给用户、以及 early stop 判定过严/松。实现要在累积文本而非单 token 上做匹配。",
  "approach": "核心思路是“每 token 后在累积文本上统一判定,而不是孤立看当前 token”:维护已发文本缓冲,新 token 追加后用滑动窗口检测 EOS 与所有 stop sequences,命中即截断停止;同时用计数器守 max_tokens;把停止原因结构化返回,且绝不把停止标记本身发给用户。",
  "explanationFocus": "是什么：流式停止判定指在服务端逐 token 流式输出过程中,决定“何时停止生成并结束流”的规则集合,通常包括命中 EOS(结束符)、匹配 stop sequences(用户指定的停止串,如 “###”、“</tool>”)、达到 max_tokens 上限、以及基于流式特性的 early stop(如检测到完整 JSON/代码结构、或客户端取消)。它既要正确终止,又要避免把停止标记本身泄漏给用户或提前截断。",
  "bruteForce": "最朴素:只靠模型自己输出 EOS 来停,不设 max_tokens 也不处理 stop sequences。结果:遇到模型不输出 EOS 会一直生成到上下文满;用户指定的 “###” 之类的停止串会被原样吐给用户且不停;长对话偶发失控生成,浪费算力。",
  "invariant": "不变量:一旦判定停止,该请求此后不再产生任何新 token,且已推送给用户的文本中不包含 EOS 与任何完整 stop sequence(它们只作为“停止信号”消费掉,不出现在用户可见内容里)。即“停止标记对用户不可见”。",
  "walkthrough": "设 stop sequence 为 “</tool>”(6 字符),模型分两 token 输出 “</” 与 “tool>”。朴素单 token 判定:收到 “</” 时不匹配、收到 “tool>” 时若只看当前 token 也不匹配(它是前缀无关的子串),导致漏停、把 “</tool>” 推给用户。正确做法:累积文本 = 之前 + “</” + “tool>” = “…</tool>”,在累积文本上检测后缀匹配 “</tool>” 命中 → 截断到其前并停止,用户看不到该串。另例 max_tokens=100,第 100 个 token 后强制停,即使未遇 EOS,需标记 truncated=True 让前端知晓。",
  "code": "def should_stop(new_token, text, stop_seqs, max_tokens, count):\n    if new_token == EOS_ID:\n        return True, \"eos\", text          # 吞掉 EOS,不推送\n    text = text + decode(new_token)\n    for s in stop_seqs:\n        if text.endswith(s):               # 在累积文本上后缀匹配\n            return True, \"stop\", text[:-len(s)]\n    if count + 1 >= max_tokens:\n        return True, \"max\", text\n    return False, None, text\n\ndef generate_loop(prompt, stop_seqs, max_tokens):\n    text, count = \"\", 0\n    while True:\n        tok = model.step()\n        stop, reason, text = should_stop(tok, text, stop_seqs, max_tokens, count)\n        if stop:\n            yield text, reason             # 已不含停止标记\n            break\n        yield text, None                   # 推送(增量)\n        count += 1",
  "complexity": "时间：每 token 一次后缀匹配,共 |stop_seqs| 个串、各 O(最长串长),整体 O(|stop_seqs|·L_stop) 每步,可忽略;计数 O(1)。空间：维护累积文本(或仅末 max(L_stop) 字符的滑动窗口),O(L_stop) 即可,不必存全量。max_tokens 为硬上限 O(1) 判定。",
  "beginnerSummary": "就像写文章时你定了“写到这里停”:遇到句号(EOS)停、看到“全文完”三个字(stop sequence)停、字数到上限(max_tokens)停。麻烦在于“全文完”可能被拆成“全文”和“完”两次说出,你得多等一下拼起来才知道该停,不能只看当前半句就判断。还有,这个“停”的信号本身不能写进文章里给用户看到。",
  "diagram": "新token ─► 追加累积文本\n              │\n   ├─ == EOS? ──是──► 停止,不推送EOS\n   ├─ 后缀匹配 stop seq? ──是──► 截断到其前,停止\n   ├─ 计数≥max_tokens? ──是──► 停止(truncated)\n   └─ early stop(结构闭合)? ──是──► 停止\n   否则 ─► 推送 token,继续",
  "derivation": [
    "为什么需要: 不停止会无限生成烧算力;停止错了(漏停/早停/把停止符推给用户)会影响正确性与体验。流式下还有特殊坑:stop sequence 可能跨 token 边界被拆开(如 “</” 与 “tool>” 分两次到达),若只看单 token 就漏判;EOS 出现后要吞掉不发给用户;max_tokens 是硬上限防失控。需要一套稳健判定。",
    "怎么实现: 在生成循环每个新 token 后做判定：① 若 token==EOS 则停止且不输出该 token;② 把新 token 追加到已发文本,检测是否以任一 stop sequence 结尾,命中则截断到该序列之前并停止;③ 计数 token 数,达到 max_tokens 强制停止(可能截断);④ 流式 early stop:如结构化输出校验器判定已闭合(括号/JSON 完整)可提前停。判定要在“累积文本”上做而非单 token,以处理跨边界 stop sequence。",
    "有什么代价: stop sequence 匹配需维护累积文本或滑动窗口,有少量 O(匹配串长度) 开销;max_tokens 截断可能产生不完整输出需标记;early stop 的判定器(如 JSON 校验)若过严会早停丢内容、过松则不停。跨边界匹配若实现成“只看最后 N 个 token”需保证窗口 ≥ 最长 stop sequence。",
    "怎么评测: 评测停止正确率(应停尽停、不该停不停)、EOS 是否被泄漏给用户(应为 0)、stop sequence 跨边界命中率(构造被拆分的用例验证)、截断率与 max_tokens 触发占比、以及平均多生成的“废 token”数(早停/漏停的浪费)。端到端用一批含特殊停止串的 prompt 回归。"
  ],
  "edgeCases": [
    "stop sequence 跨多个 token 被拆开:必须用累积文本/滑动窗口匹配,单 token 判定必漏。",
    "EOS 与 stop sequence 同时出现:优先按业务规则(通常 EOS 优先或 stop 优先需明确),避免重复停止逻辑冲突。",
    "max_tokens 截断导致 JSON/代码不完整:需向上层返回 truncated 标志,前端决定续写。",
    "stop sequence 是另一 stop sequence 的子串:匹配顺序与最长优先要避免误截(如 “##” vs “###” 应匹配更长的)。"
  ],
  "pitfalls": [
    "只在当前 token 上判断 stop sequence,导致跨边界停止串漏判、被原样输出给用户。",
    "把 EOS 当成普通 token 推给用户,前端多出 “” 或乱码。",
    "max_tokens 设过小造成频繁截断,或设过大失去防失控意义,需按场景调。",
    "多个 stop sequence 含子串关系时匹配顺序错误,短串先命中导致过早截断。"
  ],
  "prerequisites": [
    "EOS/特殊 token 在生成中的语义",
    "字符串后缀匹配与滑动窗口",
    "流式输出循环与增量发送的基本结构"
  ],
  "workedExample": [
    "场景:函数调用要求模型输出到 “</tool>” 停止。模型把该串拆成 “</” + “tool>” 两个 token。仅在单 token 上匹配的朴素实现漏判,把 “</tool>” 原样推给用户且继续生成;累积文本后缀匹配实现则在拼成 “</tool>” 那一刻命中并截断,用户只看到前面的有效内容。",
    "场景:max_tokens=512 限制下,模型对开放问题本可写 800 token,到第 512 个被强制停止,返回 truncated=True。前端据此提示“内容已截断,可继续”,避免无限生成同时明确告知用户,而非默默丢内容。"
  ],
  "lineByLine": [
    "def should_stop: if new_token == EOS_ID: return True,\"eos\",text EOS 命中直接停且吞掉该 token,不推送。",
    "text = text + decode(new_token) 把新 token 解码后追加到累积文本,为跨边界匹配做准备。",
    "for s in stop_seqs: if text.endswith(s): 在累积文本上做后缀匹配,能识别被拆成多 token 的停止串。",
    "return True,\"stop\",text[:-len(s)] 命中则截断到停止串之前再停止,用户看不到停止标记。",
    "if count+1 >= max_tokens: 硬上限判定,防失控生成,返回 truncated 信号。",
    "generate_loop 中 yield text,reason 已剔除停止标记,正常 token 才推送。"
  ],
  "codeNotes": [
    "匹配必须在“累积文本”而非“当前 token”上做,否则跨边界 stop sequence 漏判;",
    "EOS 与 stop sequence 命中后都绝不能把标记本身推给用户;",
    "维护滑动窗口(末 max(L_stop) 字符)即可,不必缓存全量文本以省内存。"
  ],
  "followUps": [
    {
      "question": "stop sequences 和 EOS 在流式处理上有什么不同优先级考虑？",
      "answer": "EOS 是模型内生的“我真写完了”信号,语义上最权威;stop sequences 是用户/业务外挂的“写到这就行”。通常两者任一命中都停,但若同时出现需明确优先级(多数实现 EOS 优先并吞掉,stop 也吞掉)。关键共性:二者命中后都绝不能把标记本身推给用户,且都应在累积文本上判定。"
    },
    {
      "question": "如何在流式 JSON 输出里做 early stop 而不破坏结构？",
      "answer": "用一个增量 JSON 解析器/结构校验器,每追加一个 token 就尝试判断当前结构是否已闭合(括号/引号配对完成、根对象结束)。一旦判定闭合即可 early stop,省掉模型继续“补废话”。风险是过严(未真正闭合就停→截断)或过松(漏判→不停),需用容错解析并在不确定时继续生成而非强行停。"
    },
    {
      "question": "max_tokens 触发截断后,如何支持“继续生成”？",
      "answer": "把截断点之前的前缀(含已生成 token 与 KV)作为新请求的上下文续跑,并复用 prefix cache 跳过重复 prefill;返回里带 truncated=True 与续跑游标,前端可发“continue”请求。注意续跑时要重新套用同样的 stop sequences 与 max_tokens 预算,避免重复输出已发内容(去重)。"
    }
  ],
  "followUpAnswers": [
    "EOS 是模型内生的“我真写完了”信号,语义上最权威;stop sequences 是用户/业务外挂的“写到这就行”。通常两者任一命中都停,但若同时出现需明确优先级(多数实现 EOS 优先并吞掉,stop 也吞掉)。关键共性:二者命中后都绝不能把标记本身推给用户,且都应在累积文本上判定。",
    "用一个增量 JSON 解析器/结构校验器,每追加一个 token 就尝试判断当前结构是否已闭合(括号/引号配对完成、根对象结束)。一旦判定闭合即可 early stop,省掉模型继续“补废话”。风险是过严(未真正闭合就停→截断)或过松(漏判→不停),需用容错解析并在不确定时继续生成而非强行停。",
    "把截断点之前的前缀(含已生成 token 与 KV)作为新请求的上下文续跑,并复用 prefix cache 跳过重复 prefill;返回里带 truncated=True 与续跑游标,前端可发“continue”请求。注意续跑时要重新套用同样的 stop sequences 与 max_tokens 预算,避免重复输出已发内容(去重)。"
  ]
};
