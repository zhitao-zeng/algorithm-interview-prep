export default {
  "kind": "concept",
  "id": "train-sft-data",
  "category": "训练与微调",
  "difficulty": "Medium",
  "title": "SFT 数据构造（指令/对话模板、多轮）",
  "prompt": "构造监督微调（SFT）数据时，如何组织指令模板与多轮对话？",
  "quickAnswer": "用模型自带 chat template 拼接 system/user/assistant 角色，多轮需保留完整对话历史，格式与 base 模型 tokenizer 一致；最后 assistant 段作为监督目标（配合 loss mask 只对答案 token 算损失）。常见做法是把每条样本表示为 messages 列表，调用 tokenizer.apply_chat_template 渲染出含特殊 token 的文本，避免手写模板导致分布错配。样本量常为 1K~100K 高质量条，质量远胜数量。",
  "approach": "按『系统提示 + 多轮 user/assistant 交替』组织样本，调用 tokenizer.apply_chat_template 生成带特殊 token 的文本；训练时对 assistant 段做 loss mask，仅答案 token 参与梯度。多轮对话把完整历史放入 messages，最后一轮 assistant 为监督目标。优先复用官方模板，二次核对不同模型的模板差异（如 LLaMA、Mistral、Qwen 各自不同）。",
  "explanationFocus": "是什么：SFT（Supervised Fine-Tuning）数据构造是把任务示例组织成对话格式（system/user/assistant 多角色），并用与目标模型一致的 chat template 序列化，使模型学会“按指令、按角色作答”而非单纯续写。它介于“预训练续写”和“最终对话产品”之间：用高质量（指令, 回答）配对监督模型的行为风格、格式与边界。构造质量直接决定微调后模型的指令遵循度与多轮一致性。",
  "bruteForce": "直接把『问题+答案』拼接成纯文本训练，没有角色与特殊 token，模型学不会对话边界，常忽略指令或乱接上下文；或手写 <user>/<bot> 标签而非用官方模板，导致分词与 base 模型分布错配，微调后指令遵循崩溃。多轮只保留最近一轮，模型遗忘前文约束。",
  "derivation": [
    "为什么需要：预训练是续写，SFT 要学『按角色对话』，需明确 system/用户/助手边界与多轮结构，否则模型不知道何时该听指令、何时该回答。",
    "怎么实现：每条样本为 messages 列表，用 apply_chat_template 渲染；多轮把历史全放入，最后 assistant 段为监督目标，并用 loss mask 仅对答案 token 算损失。",
    "有什么代价：模板错配（如 LLaMA 用 Mistral 模板）会严重掉点；多轮长上下文增加显存与 token 成本；loss mask 写错会让模型学错目标。",
    "怎么评测：在 held-out 指令集测遵循度与格式正确率，人工核查多轮一致性，并用 MT-Bench 等对话基准看轮次间是否遗忘。"
  ],
  "invariant": "模板必须与基座模型一致，多轮保留完整历史；优先用官方 chat template（不同家族如 LLaMA/Mistral/Qwen 模板不同，必须二次核对）。训练时仅对 assistant 答案段算 loss（loss mask），system/user 段不贡献梯度，否则会“让模型学怎么提问”。",
  "walkthrough": "单轮：messages=[{role:user, content:\"写首诗\"},{role:assistant, content:\"...\"}]；多轮再加一组 user/assistant。以 LLaMA-2 为例，apply_chat_template 得到 <s>[INST] 写首诗 [/INST] 诗... </s>，其中 [INST] 是官方模板的特殊边界 token。若训练时不对 assistant 段做 mask，模型会把 user 文本也当生成目标，破坏对话结构。一个实际微调任务（如客服）通常用 5k~20k 条多轮样本即可显著提升遵循度。",
  "edgeCases": [
    "模板与模型不匹配（如用 Mistral 模板训练 LLaMA）导致指令遵循崩溃，需严格对齐。",
    "多轮中历史被截断，模型遗忘前文约束，长上下文需保证上下文窗口与截断策略一致。",
    "system 内容与训练时不一致引发分布偏移，上线 system 变了要重新对齐或微调。",
    "答案含代码/表格等结构化内容，模板与 tokenizer 需正确处理空白与特殊字符，否则错位。"
  ],
  "code": "def build_sft_text(messages, tokenizer):\n    # 用模型自带模板渲染对话\n    return tokenizer.apply_chat_template(\n        messages, tokenize=False, add_generation_prompt=False)\n\nmsgs = [{'role':'system','content':'你是有帮助的助手'},\n        {'role':'user','content':'1+1=?'},\n        {'role':'assistant','content':'2'}]",
  "codeNotes": [
    "add_generation_prompt=False 表示包含 assistant 答案用于训练；推理时设为 True 只生成到“助手续写点”。",
    "多轮直接往 messages 追加，模板自动处理轮次边界与特殊 token，不要手动拼 <s>/</s>。",
    "渲染出的文本可能含模型专属 BOS/EOS，分词后需与训练配置一致，否则位置编码错位。"
  ],
  "complexity": "渲染为 O(对话长度·词表映射)，与训练同量级；真正的成本在人工构造/清洗样本与多轮一致性校验。若对每条样本做 loss mask，还需 O(答案长度) 额外标记，整体仍是线性，瓶颈在数据与算力而非构造算法本身。",
  "followUps": [
    {
      "question": "SFT 样本多少合适？",
      "answer": "常见 1K~100K 高质量条；质量远胜数量，几万条精心构造常胜过百万噪声条。经验上 3k~20k 条覆盖度好的指令就能显著改变行为，再往上边际递减，关键是多样性与答案正确性而非单纯堆量。"
    },
    {
      "question": "多轮对话如何防止答案段错位？",
      "answer": "渲染后按 assistant 段做 loss mask，仅对答案 token 算损失：把 user/system 位置的 label 置为 -100（PyTorch 忽略），梯度只来自 assistant 文本。这样模型既看到完整上下文，又只被训练去生成答案，不会去模仿“怎么提问”。"
    }
  ],
  "followUpAnswers": [
    "常见 1K~100K 高质量条；质量远胜数量，几万条精心构造常胜过百万噪声条。经验上 3k~20k 条覆盖度好的指令就能显著改变行为，再往上边际递减，关键是多样性与答案正确性而非单纯堆量。",
    "渲染后按 assistant 段做 loss mask，仅对答案 token 算损失：把 user/system 位置的 label 置为 -100（PyTorch 忽略），梯度只来自 assistant 文本。这样模型既看到完整上下文，又只被训练去生成答案，不会去模仿“怎么提问”。"
  ],
  "pitfalls": [
    "手写模板而非用官方模板，导致分布错配与指令遵循崩溃。",
    "多轮只放最近一轮，丢失前文约束，模型在长对话中跑偏。",
    "忘做 loss mask，让模型把 user/system 文本也当生成目标来拟合。"
  ],
  "beginnerSummary": "SFT 数据要把『系统设定、用户问、助手答』按模型认识的格式排好——就像给演员剧本：系统提示是“人设”，用户句是台词，助手句是标准表演。多轮就把整段聊天都给模型看，让它学会接住上下文。千万别自己乱拼文字，要用模型自带的“官方剧本格式”（chat template），否则演员看不懂、演砸。最后只拿“助手那几句”当评分标准（loss mask），别拿用户的问句当答案来背。",
  "prerequisites": [
    "Tokenizer 与特殊 token（BOS/EOS/角色边界）概念。",
    "Chat template 概念及各模型家族模板差异。",
    "SFT loss mask：只对 assistant 答案段算损失，避免学错目标。"
  ],
  "workedExample": [
    "构造 messages：system(\"你是有帮助的助手\") + user(\"翻译:猫\") + assistant(\"cat\")，多轮再追加 user/assistant。",
    "用 apply_chat_template(msgs, tokenize=False) 得到带 <s>/[INST] 等标记的序列化文本，训练时仅对 assistant 段 mask 算 loss。",
    "5k 条高质量客服多轮样本微调 7B 模型，MT-Bench 遵循度从 40% 提升到 75%。"
  ],
  "lineByLine": [
    "def build_sft_text(messages, tokenizer): 定义渲染函数，把对话结构变成模型认识的文本。",
    "apply_chat_template(..., tokenize=False): 转成可读文本而非 id，便于检查模板是否正确。",
    "msgs 示例展示 system/user/assistant 三段结构，模板据此注入对应特殊 token。",
    "训练前需对 assistant 段做 loss mask，使梯度只来自答案 token。"
  ],
  "diagram": "system ─┐\nuser   ─┼─▶ apply_chat_template ─▶ <s>...训练文本\nassistant─┘"
};
