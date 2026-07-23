export default {
  "kind": "concept",
  "id": "cb-implementation-pitfalls",
  "category": "Continuous Batching",
  "difficulty": "Hard",
  "title": "实现陷阱：token 错位与 mask",
  "prompt": "实现 Continuous Batching 时常踩哪些坑，比如 token 错位、attention mask 处理？",
  "quickAnswer": "典型坑：(1) token 错位——不同请求在同一 batch 不同步长，拼接时 position 必须各自维护，否则把 A 的第 t 步和 B 的第 t' 步混淆；(2) attention mask——必须按每请求真实长度做因果 mask，不能套用整批统一 mask；(3) KV 页表越界；(4) 完成判定与释放时序竞态。正确做法是每请求独立 position/length 与分页 KV。",
  "approach": "为每请求保存独立 position 与长度，按页表做变长因果注意力。",
  "explanationFocus": "是什么：实现陷阱指在把多请求拼进同一 batch 时，因各自进度不同步而引发的位置错乱与 mask 错误，需要请求级状态隔离来规避。",
  "bruteForce": "把多请求当等长序列统一喂入、用同一 mask，省事但必然错位。",
  "derivation": [
    "为什么需要：连续批中请求不在同一步，若不隔离状态，前向会把错误历史拼给某个请求，输出直接崩坏。",
    "怎么实现：每个请求持有自己的 position 计数；attention 用变长/分页 kernel 仅对自身 KV 做因果掩码；释放时校验页表边界。",
    "有什么代价：请求级状态管理增加代码复杂度，变长 kernel 开发门槛高。",
    "怎么评测：构造长短混跑用例，对比输出与单请求串行结果是否一致(baseline diff)。"
  ],
  "invariant": "请求 r 在第 k 步的输入 position == 其已生成 token 数，且只 attend 自身前 k 个 token。",
  "walkthrough": "batch 含 A(已 5 token)与 B(已 2 token)；A 第6步 position=5，B 第3步 position=2，绝不能都用全局步号 6 当 position。",
  "edgeCases": [
    "新插入请求 position 从 0 起，不能沿用 batch 步号。",
    "变长 mask 写错导致 attend 到未来/pad。",
    "释放与读取竞态：释放后才被某 kernel 引用。"
  ],
  "code": "# Python\ndef step_position(req):\n    return req.generated  # 各自已生成数, 非全局步号\n\ndef causal_mask(length):\n    return [[1 if i <= j else 0 for j in range(length)] for i in range(length)]",
  "codeNotes": [
    "position 用每请求自计数，非全局步。",
    "mask 按各自长度, 非整批统一。"
  ],
  "complexity": "正确性优先；状态隔离带来常数级额外管理开销。",
  "followUps": [
    {
      "question": "token 错位最典型后果？",
      "answer": "输出乱码或重复，因为模型把别的请求的上下文当成了自己的历史。"
    },
    {
      "question": "为什么不能统一 mask？",
      "answer": "各请求真实长度不同，统一 mask 会把 pad 或他人 token 纳入注意力，破坏因果性与正确性。"
    }
  ],
  "followUpAnswers": [
    "错位→把他人上下文当自己历史。",
    "统一 mask 破坏因果性。"
  ],
  "pitfalls": [
    "用全局 decode 步号当 position。",
    "复用静态批的整批 mask 逻辑。"
  ],
  "beginnerSummary": "把不同进度的人排进同一条流水线，却给所有人贴同一个\"第几步\"的标签，结果把甲的半成品当成乙的。正确做法是每人自己记进度条、只看自己的历史——这就是请求级 position 与 mask 隔离。",
  "prerequisites": [
    "position 编码依赖生成顺序。",
    "因果 mask 屏蔽未来 token。",
    "多请求进度不同步。"
  ],
  "workedExample": [
    "A 已5 token, B 已2 token 同批。",
    "A position=5, B position=2, 各自 mask。"
  ],
  "lineByLine": [
    "每请求保存自身 generated 计数。",
    "前向用各自 position 而非全局步。",
    "按各自长度构造因果 mask。",
    "释放前确认无 kernel 仍引用其 KV。"
  ],
  "diagram": "错误: 全局步号→A/B position 混\n正确: A.pos=5, B.pos=2 各自独立"
};
