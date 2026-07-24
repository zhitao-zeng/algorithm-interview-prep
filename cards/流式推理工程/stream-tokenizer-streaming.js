export default {
  "id": "stream-tokenizer-streaming",
  "kind": "concept",
  "category": "流式推理工程",
  "difficulty": "Medium",
  "title": "流式 tokenizer / detokenizer 增量对齐",
  "prompt": "在大模型流式输出(SSE/逐 token 返回)中，为什么经常看到“半个词”或乱码闪烁，tokenizer 与 detokenizer 的增量对齐要怎么处理？",
  "quickAnswer": "流式输出里“半个词”源于子词切分单位小于自然词：一个字/词被拆成多个 token，单拿中间 token 无法独立解码成完整字符。处理办法是维护 pending 缓冲，每个 token 到达后尝试增量 detokenize 并判断前缀一致性，能成完整片段才 flush、否则暂存等下一个 token，必要时 fallback。代价是少量状态内存与每 token 判定开销，但能消除前端乱码闪烁。",
  "approach": "核心思路是“延迟 flush + 前缀一致”：不盲目把每个 token 直转文本，而是用增量解码接口保证 decode(prefix+tok) 前缀等于 decode(prefix)，把无法独立成形的尾部留在缓冲里。对多字节字符、BPE 合并边界、特殊 token 分别处理，保证最终拼接与一次性 decode 完全一致。",
  "explanationFocus": "是什么：流式 tokenizer/detokenizer 是指在逐 token 生成时，把模型输出的子词 token id 增量地、实时地转回文本片段并推送给前端的过程。难点在于子词切分(BPE/WordPiece)的边界常常不在自然词边界上，一个汉字/单词可能被拆成多个 token，单次只拿到中间 token 时无法直接拼成完整字符，需要缓存未完成片段、做延迟 flush 与 fallback，避免把“半个字”推给用户。",
  "bruteForce": "最朴素做法是每来一个 token 就 tokens_to_text([tok]) 单独转并直接推前端。这样在 BPE/中文多 token 场景下会反复出现“半截字”、重复前缀或乱码，体验差且有时信息错误，仅适用于 token≈词且不含多字节的场景。",
  "invariant": "不变量：任意时刻已 flush 出去的文本，等于对“已确认前缀 token 序列”做一次完整 detokenize 得到的前缀；即增量 flush 的累积结果与整段一次性 decode 的前缀严格相等，绝不出现已推送文本与最终文本冲突。",
  "walkthrough": "以中文“机器学习”为例，假设被切成 token [“机器”,“学”,“习”] 三块(或某 tokenizer 把“习”拆成两半)。流式时：第1个 token “机器”可完整解码→flush “机器”；第2个 token “学”完整→flush “学”；第3个 token “习”完整→flush “习”。若某 tokenizer 把“习”拆成 [“习”,“_tail”]，则收到“习”时若“_tail”未到，增量解码只能得到“?”，此时不 flush、缓冲“习”相关字节，等“_tail”到达拼成完整“习”再 flush。最终拼接与一次性 decode(全序列)一致，且过程中无半字推给用户。",
  "code": "class IncrementalDetokenizer:\n    def __init__(self, tokenizer):\n        self.tok = tokenizer\n        self.pending = []          # 尚未 flush 的 token id\n\n    def push(self, token_id):\n        self.pending.append(token_id)\n        text = self.tok.decode(self.pending, skip_special_tokens=True)\n        # 前缀一致性：若当前累积能成完整片段则 flush\n        if self._is_complete(text):\n            self.pending = []\n            return text             # 推给前端\n        return \"\"                   # 暂存，等更多 token\n\n    def _is_complete(self, text):\n        # 判断是否构成合法完整 UTF-8 结尾(无截断多字节字符)\n        return not text.endswith(('�',)) and self._ends_clean(text)",
  "complexity": "时间：每 token 一次增量 decode + 前缀/UTF-8 完整性判定，O(len(pending)) 且 pending 通常很短，单次微秒级；整体与 token 数线性。空间：仅缓存未完成 token 与少量字节状态，O(平均片段长度)，可忽略。主要成本是 tokenizer.decode 本身，可用缓存上一次前缀加速。",
  "beginnerSummary": "就像快递员送拼图，模型一次只递给你一小块(子词)，有时候一块里只含“半个字”的笔画。你不能在拿到半块时就显示，得先把已经能拼成完整字的块贴墙上(flush)，拼不成的先放桌角(pending)等下一块来。保证最后贴出来的墙和一次性拿全拼图贴出来的一模一样，过程中用户就不会看到“半个字”乱跳。",
  "diagram": "token流: [机器] [学] [习½] [习½尾]\n                │      │      │\n   flush 机器    flush学   缓冲(半字)\n                         │\n                    收到尾 → flush 习",
  "derivation": [
    "为什么需要: 大模型输出的是 token id 序列，前端要的是可读文本，必须 detokenize。流式场景下不能等整句生成完再转(延迟太高)，所以要在每个 token 到达时尽量快地吐出可读片段；但子词单位常小于自然词(如“un”+“believable”、中文一个字两 token)，逐个 token 直转会出现半个词、重复前缀或乱码。",
    "怎么实现: 维护一个待定缓冲区(pending bytes / pending tokens)：每来一个 token，尝试把它接在前一个未完成片段后做“前缀可解码性”判断——若当前累积字节能构成完整合法 UTF-8 字符/词片则 flush 出去，否则暂存。提供 decode(token, skip_special=True) 的增量接口，并保证前缀一致性：decode(prefix+tok) 的前缀部分与之前 decode(prefix) 完全一致。对实在无法对齐的尾部用 fallback(如直接按字节映射或等下一个 token)。",
    "有什么代价: 增量 detokenize 要保存未完成片段状态，增加少量内存与每 token 的判定的 CPU 开销；为保前缀一致性，某些 tokenizer(如 SentencePiece 带空格标记)需要特殊前缀处理，处理不当会引入空格漂移或首 token 重复。fallback 等待下一个 token 会引入极小额外延迟。",
    "怎么评测: 评测对齐正确性：用固定文本 tokenize 后再流式 detokenize，比较拼接结果是否与原文本逐字符一致(round-trip 一致率)；评测延迟：每 token 的 detokenize 耗时与 flush 时机；评测前端体验：乱码/闪烁次数(半个字出现频次)应为 0。还要测多语言/emoji(多字节)与特殊 token(如 <｜end｜>)的跳过。"
  ],
  "edgeCases": [
    "多字节字符/emoji 被拆成多个 token：必须缓冲到完整字节再 flush，否则出现 “�”。",
    "SentencePiece 带 “▁”(空格)标记的首 token：单独解码会多/少一个空格，需统一前缀处理避免空格漂移。",
    "特殊 token(EOS/工具调用标记)混入流：必须 skip 且不 flush，避免把控制符暴露给用户。",
    "末尾残留 pending：生成结束时若缓冲里还有未 flush 片段，必须强制 flush，否则丢字。"
  ],
  "pitfalls": [
    "用 token 单独 decode 再拼接，而不是缓冲整体 decode，导致前缀重复/空格漂移/半个字——这是最常见的错。",
    "忽略 UTF-8 多字节截断，把 “�” 推给前端形成豆腐块乱码。",
    "忘记在流结束时 flush 残留 pending，造成最后几个字丢失。",
    "把特殊 token 当普通文本 flush，前端显示 <｜end｜> 之类控制符。"
  ],
  "prerequisites": [
    "BPE/WordPiece/SentencePiece 子词切分的基本原理",
    "UTF-8 多字节字符编码与“截断字符”概念",
    "大模型 token id → 文本 的 detokenize 接口"
  ],
  "workedExample": [
    "场景：英文 “unbelievable” 在 BPE 下被切成 [“un”,“believable”] 两个 token。流式时收到 “un” 单独 decode 会得到 “un” 这个看起来像独立词的片段，若直接 flush 用户会先看到 “un” 再看到 “unbelievable” 造成重复前缀闪烁。正确做法：把 “un” 留在 pending，等 “believable” 到达拼成 “unbelievable” 再一次性 flush，避免前缀重复。",
    "场景：emoji “😀”(4 字节 UTF-8)被 tokenizer 拆成两个 token。第一个 token 单独解码得到无效截断字节 “�”，绝不能 flush；缓冲等到第二个 token 补齐全 4 字节后再 flush 出 “😀”，否则前端显示豆腐块。"
  ],
  "lineByLine": [
    "class IncrementalDetokenizer: 维护一个 pending 缓冲，承载尚未能完整 flush 的 token id。",
    "def push(self, token_id): self.pending.append(token_id) 每来一个 token 先入缓冲，不直接推前端。",
    "text = self.tok.decode(self.pending, skip_special_tokens=True) 对当前缓冲整体解码，利用 tokenizer 的前缀一致性。",
    "if self._is_complete(text): 判断当前累积是否已是无截断的完整片段(末尾非 �、且自然结束)。",
    "return text 完整则清空 pending 并 flush 给前端；否则 return ‘’ 继续缓冲，等下一 token。"
  ],
  "codeNotes": [
    "decode 必须用“缓冲整体解码”而非逐 token 单独解码，才能保证前缀一致；",
    "skip_special_tokens=True 避免把 <｜end｜> 等控制 token 推给用户；",
    "_is_complete 要识别 UTF-8 截断与 BPE 半合并，是防止半字的关键。"
  ],
  "followUps": [
    {
      "question": "如何保证增量 detokenize 的结果和一次性 decode 完全一致？",
      "answer": "依靠 tokenizer 的“前缀一致性”：decode(ids[0:i]+[ids[i]]) 的输出前缀必须等于 decode(ids[0:i]) 的输出。实现上始终对 pending 整体 decode 而非逐 token 拼接，并只在能成完整片段时 flush；只要 flush 时刻的 pending 是最终前缀的子集，累积结果在流结束时必然与整段 decode 一致。SentencePiece 还需统一首 token 的前缀空格处理。"
    },
    {
      "question": "流式场景下 tokenizer 和 detokenizer 能否复用同一套？",
      "answer": "逻辑上复用同一 tokenizer 的 encode/decode 即可，但流式只用到 decode 的增量形式。关键在于 decode 要支持“部分序列→可读前缀”且前缀稳定；有些老旧 tokenizer 的 decode 在部分序列上会加额外空格或合并异常，需要包一层增量缓冲与完整性判定，不能直接裸用。"
    },
    {
      "question": "前端 SSE 收到的 chunk 和 token 是一一对应的吗？",
      "answer": "通常不是。一个 SSE chunk 可能含 0/1/多个 token 的文本片段：服务端为了等完整字会缓冲，所以 flush 时机由 detokenizer 决定，chunk 边界与 token 边界解耦。前端按 chunk 拼接即可，不应假设每 chunk 恰一个 token。"
    }
  ],
  "followUpAnswers": [
    "依靠 tokenizer 的“前缀一致性”：decode(ids[0:i]+[ids[i]]) 的输出前缀必须等于 decode(ids[0:i]) 的输出。实现上始终对 pending 整体 decode 而非逐 token 拼接，并只在能成完整片段时 flush；只要 flush 时刻的 pending 是最终前缀的子集，累积结果在流结束时必然与整段 decode 一致。SentencePiece 还需统一首 token 的前缀空格处理。",
    "逻辑上复用同一 tokenizer 的 encode/decode 即可，但流式只用到 decode 的增量形式。关键在于 decode 要支持“部分序列→可读前缀”且前缀稳定；有些老旧 tokenizer 的 decode 在部分序列上会加额外空格或合并异常，需要包一层增量缓冲与完整性判定，不能直接裸用。",
    "通常不是。一个 SSE chunk 可能含 0/1/多个 token 的文本片段：服务端为了等完整字会缓冲，所以 flush 时机由 detokenizer 决定，chunk 边界与 token 边界解耦。前端按 chunk 拼接即可，不应假设每 chunk 恰一个 token。"
  ]
};
