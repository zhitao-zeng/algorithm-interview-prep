export default {
  "kind": "concept",
  "id": "train-sft-data",
  "category": "训练与微调",
  "difficulty": "Medium",
  "title": "SFT 数据构造（指令/对话模板、多轮）",
  "prompt": "构造监督微调（SFT）数据时，如何组织指令模板与多轮对话？",
  "quickAnswer": "用模型自带 chat template 拼接 system/user/assistant 角色，多轮需保留完整对话历史，格式与 base 模型 tokenizer 一致。",
  "approach": "按『系统提示+多轮 user/assistant 交替』组织样本，调用 tokenizer.apply_chat_template 生成带特殊 token 的文本，避免手写模板错配。",
  "explanationFocus": "是什么：SFT 数据构造是把任务示例组织成对话格式（system/user/assistant），并用与目标模型一致的 chat template 序列化，使模型学会按指令作答。",
  "bruteForce": "直接把『问题+答案』拼接成纯文本训练，没有角色与特殊 token，模型学不会对话边界，常忽略指令或乱接上下文。",
  "derivation": [
    "为什么需要：预训练是续写，SFT 要学『按角色对话』，需明确 system/用户/助手边界与多轮结构。",
    "怎么实现：每条样本为 messages 列表，用 apply_chat_template 渲染；多轮把历史全放入，最后 assistant 段为监督目标。",
    "有什么代价：模板错配（如 LLaMA 用 Mistral 模板）会严重掉点；多轮长上下文增加显存与 token 成本。",
    "怎么评测：在 held-out 指令集测遵循度与格式正确率，人工核查多轮一致性。"
  ],
  "invariant": "模板必须与基座模型一致，多轮保留完整历史；优先用官方 chat template（建议二次核对各模型模板差异）。",
  "walkthrough": "单轮：messages=[{role:user, '写首诗'},{role:assistant, '...'}]；多轮再加一条 user/assistant。用 tokenizer.apply_chat_template 得到含 <s>[INST] 的文本。",
  "edgeCases": [
    "模板与模型不匹配导致指令遵循崩溃",
    "多轮中历史被截断，模型遗忘前文约束",
    "system 内容与训练时不一致引发分布偏移"
  ],
  "code": "def build_sft_text(messages, tokenizer):\n    # 用模型自带模板渲染对话\n    return tokenizer.apply_chat_template(\n        messages, tokenize=False, add_generation_prompt=False)\n\nmsgs = [{'role':'system','content':'你是有帮助的助手'},\n        {'role':'user','content':'1+1=?'},\n        {'role':'assistant','content':'2'}]",
  "codeNotes": [
    "add_generation_prompt=False 表示包含 assistant 答案用于训练",
    "多轮直接往 messages 追加，模板自动处理轮次"
  ],
  "complexity": "渲染为 O(对话长度)，与训练同量级。",
  "followUps": [
    {
      "question": "SFT 样本多少合适？",
      "answer": "常见 1K-100K 高质量条；质量远胜数量，几万条精心构造常胜过百万噪声条。"
    },
    {
      "question": "多轮对话如何防止答案段错位？",
      "answer": "渲染后按 assistant 段做 loss mask，仅对答案 token 算损失，见 SFT loss mask 卡。"
    }
  ],
  "followUpAnswers": [
    "常见 1K-100K 高质量条；质量远胜数量，几万条精心构造常胜过百万噪声条。",
    "渲染后按 assistant 段做 loss mask，仅对答案 token 算损失，见 SFT loss mask 卡。"
  ],
  "pitfalls": [
    "手写模板而非用官方模板，导致分布错配",
    "多轮只放最近一轮，丢失前文约束"
  ],
  "beginnerSummary": "SFT 数据要把『系统设定、用户问、助手答』按模型认识的格式排好，多轮就把整段聊天都给模型看，别自己乱拼。",
  "prerequisites": [
    "Tokenizer 与特殊 token",
    "Chat template 概念",
    "SFT loss mask"
  ],
  "workedExample": [
    "构造 messages：system+user('翻译')+assistant('译文')",
    "用 apply_chat_template 得到带 <s> 等标记的序列化文本"
  ],
  "lineByLine": [
    "def build_sft_text(messages, tokenizer): 定义渲染函数",
    "apply_chat_template(..., tokenize=False): 转成可读文本而非 id",
    "msgs 示例展示 system/user/assistant 三段结构"
  ],
  "diagram": "system ─┐\nuser   ─┼─▶ apply_chat_template ─▶ <s>...训练文本\nassistant─┘"
};
