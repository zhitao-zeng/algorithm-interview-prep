export default {
  "id": "agent-code-memory-buffer",
  "kind": "concept",
  "category": "Agent Workflow",
  "difficulty": "Easy",
  "title": "手写带压缩的对话记忆 buffer",
  "prompt": "如何手写一个对话记忆 buffer，在超出 token 窗口时对旧轮次做摘要压缩，同时保留最近若干轮完整上下文？",
  "quickAnswer": "用一个列表存每轮对话并记录 token 数；每次 add 后若总 token 超阈值，就从最旧的一轮开始弹出，用 summary_model 生成摘要并插回头部，直到总量降到窗口内或仅剩最近 keep_recent 轮。这样老信息被压缩、新信息保真。",
  "explanationFocus": "是什么：带压缩的对话记忆 buffer 是一种\"滑动窗口 + 摘要\"的短期记忆。它完整保留最近几轮对话，把更早的轮次逐步压缩成摘要，既控制 token 成本又尽量不丢长期背景。",
  "approach": "核心思路：每轮 add 时记录 role/content/tokens；_compress_if_needed 循环检查总 token，超过 max_tokens 就 pop 最旧轮次、用模型摘要后作为 system 摘要插回头部，循环直到达标或只剩 keep_recent 轮。",
  "bruteForce": "朴素做法：ConversationBufferWindowMemory 只保留最近 k 轮、直接丢掉更早内容；或更暴力地每次都把全部历史重发给 LLM，超窗口就直接截断，导致早期承诺/偏好被遗忘。",
  "invariant": "循环不变量：压缩后总 token 不超过 max_tokens，或已无法再压（仅剩 keep_recent 轮）；最近 keep_recent 轮始终保持完整未被摘要。",
  "walkthrough": "设 max_tokens=2000、keep_recent=4，已存 10 轮各约 400 token（共 4000）。add 后触发压缩：pop 第1轮→摘要成约 100 token 插回，总量变 3700；继续 pop 直到剩 4 整轮 + 若干摘要，总量 < 2000 停止。",
  "code": "class ConversationBuffer:\n    def __init__(self, summary_model, max_tokens=2000, keep_recent=4):\n        self.summary_model = summary_model  # 用于生成摘要的模型\n        self.max_tokens = max_tokens  # 上下文 token 上限\n        self.keep_recent = keep_recent  # 最少保留的完整轮数\n        self.turns = []  # 每轮: {role, content, tokens}\n\n    def _count(self, text):\n        return max(1, len(text) // 4)  # 约 4 字符算 1 token 的粗略估计\n\n    def add(self, role, content):\n        self.turns.append({\"role\": role, \"content\": content,\n                           \"tokens\": self._count(content)})\n        self._compress_if_needed()  # 写入后立即检查是否超窗\n\n    def _compress_if_needed(self):\n        total = sum(t[\"tokens\"] for t in self.turns)\n        while total > self.max_tokens and len(self.turns) > self.keep_recent:\n            old = self.turns.pop(0)  # 弹出最旧的一轮\n            summary = self.summary_model(f\"Summarize: {old['content']}\")  # 模型摘要\n            self.turns.insert(0, {\"role\": \"system\",\n                                  \"content\": f\"[摘要]{summary}\",\n                                  \"tokens\": self._count(summary)})\n            total = sum(t[\"tokens\"] for t in self.turns)  # 重新统计\n\n    def context(self):\n        return \"\\n\".join(f\"{t['role']}: {t['content']}\" for t in self.turns)",
  "complexity": "时间复杂度：add 为 O(n)（n 为轮数，压缩时每轮一次模型调用最坏 O(n×模型延迟)）；context 为 O(n)。空间复杂度：O(total_tokens)，被 max_tokens 上限约束。",
  "beginnerSummary": "就像你记笔记：最新的几页完整保留，太早的页面太多时，你把前面几页\"总结成一句话\"贴在封面，这样本子不会太厚，又能记住大致来龙去脉。",
  "diagram": "turns: [t1][t2][t3]...[t10]   max_tokens 超限\n   |\n   v pop 最旧\n[摘要模型] -> [SYS:摘要t1] 插回头部\n   |\n   v 再检查 total > max_tokens ?\n  yes -> 继续压缩\n  no  -> 停止，保留 keep_recent 整轮",
  "derivation": [
    "为什么需要：LLM 有上下文窗口上限，长对话全量发送既贵又易淹没重点；但直接丢旧信息会丢失用户偏好与早期约定。",
    "怎么实现：以轮为单位维护 token 计数，超出阈值就从队首取最旧轮做模型摘要替换，循环压缩直到达标或仅剩 keep_recent 轮完整保留。",
    "有什么代价：摘要本身消耗一次 LLM 调用与延迟；摘要可能丢细节或引入幻觉，需标注\"[摘要]\"以便模型区分原始与压缩内容。",
    "怎么评测：对比\"全量窗口\"与\"压缩窗口\"在长对话任务上的回答质量，关注关键信息保留率与 token 成本下降比例。"
  ],
  "edgeCases": [
    "单轮对话就超过 max_tokens：while 条件 len(turns) > keep_recent 不满足（只有1轮），不会无限压缩，保留该长轮原样。",
    "summary_model 返回空串：_count 用 max(1,...) 保证至少 1 token，避免除零或无限循环；同时可对空摘要做重试。",
    "keep_recent 设得比总轮数还大：压缩循环不触发，退化为完整窗口记忆。"
  ],
  "pitfalls": [
    "用字符数粗略估算 token 与真实 tokenizer 偏差大，中文尤其明显，生产应接真实 tokenizer 或 tiktoken。",
    "摘要未标注来源，模型可能把\"摘要\"当成用户原话，应在 content 前加 \"[摘要]\" 等显式标记。",
    "每次 add 都触发多次模型摘要会显著增延迟，可对压缩做批处理或异步化。"
  ],
  "prerequisites": [
    "理解 LLM 上下文窗口与 token 计费概念。",
    "掌握 Python class、列表 pop/insert 与生成器表达式。"
  ],
  "workedExample": [
    "buf = ConversationBuffer(summary_model, max_tokens=2000, keep_recent=4)；连续 add(\"user\", \"我偏好Python\")、add(\"assistant\", \"好的\") 共 10 轮，每轮约 400 token。",
    "第10次 add 后 total=4000>2000，压缩弹出最旧轮生成\"[摘要]用户偏好Python...\"（约100 token）插回，反复直到保留 4 整轮 + 若干摘要，total<2000。context() 返回可发送的多行文本。"
  ],
  "lineByLine": [
    "class ConversationBuffer：定义记忆缓冲类，封装窗口上限、保留轮数与压缩逻辑。",
    "__init__ 保存 summary_model/max_tokens/keep_recent，并初始化 self.turns=[] 存储每轮对话。",
    "def _count(text)：用 len(text)//4 粗略估算 token，max(1,...) 防止空串计 0。",
    "def add(role, content)：把新轮（含 token 计数）追加进 turns，并立即调用压缩检查。",
    "def _compress_if_needed：计算 total，当超窗且轮数大于 keep_recent 时进入压缩循环。",
    "old = self.turns.pop(0)：弹出最旧一轮，准备用摘要替代它。",
    "summary = self.summary_model(f\"Summarize: ...\")：调用模型把旧轮压缩成短文本。",
    "self.turns.insert(0, {role:\"system\", content:f\"[摘要]{summary}\", ...})：把摘要作为系统消息插回头部，保留位置顺序。",
    "def context()：用换行把各轮拼成可发送的上下文串，供 LLM 调用使用。"
  ],
  "codeNotes": [
    "_count 的 //4 仅为草图估算，真实实现应替换为 tokenizer（如 tiktoken）以匹配模型实际计费。"
  ],
  "followUps": [
    {
      "question": "摘要丢失细节怎么办，有没有更好的压缩策略？",
      "answer": "可分层：对旧轮做分层摘要、保留关键实体与用户偏好清单；或用向量检索只召回相关历史（RAG 记忆）。也可让模型在摘要时显式保留\"待办/约束\"清单以降低信息损失。"
    },
    {
      "question": "为什么只压最旧轮而不是按重要性压？",
      "answer": "按最旧压是 O(1) 简单且符合时间局部性（近期更可能相关）；按重要性需额外打分（如用 LLM 评估各轮重要性），更准但更贵，适合长程任务。"
    }
  ],
  "followUpAnswers": [
    "可分层：对旧轮做分层摘要、保留关键实体与用户偏好清单；或用向量检索只召回相关历史（RAG 记忆）。也可让模型在摘要时显式保留\"待办/约束\"清单以降低信息损失。",
    "按最旧压是 O(1) 简单且符合时间局部性（近期更可能相关）；按重要性需额外打分（如用 LLM 评估各轮重要性），更准但更贵，适合长程任务。"
  ]
};
