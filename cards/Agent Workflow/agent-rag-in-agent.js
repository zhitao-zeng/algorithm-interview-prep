export default {
  "kind": "concept",
  "id": "agent-rag-in-agent",
  "category": "Agent Workflow",
  "difficulty": "Medium",
  "title": "RAG 在 Agent 中的应用",
  "prompt": "RAG 在 Agent 里是怎么被使用的？",
  "quickAnswer": "在 Agent 中，RAG 通常被封装成一个「检索工具」：模型在规划/行动阶段自主决定何时检索、检索什么，再把召回片段作为 Observation 用于推理或作答。相比把检索写死在链路前端，Agent 式 RAG 能按需在多步中多次、差异化检索，显著提升对长尾与最新知识的覆盖。工程上还需解决召回质量、去噪、引用溯源与成本控制，否则检索了却仍幻觉。",
  "approach": "整体思路是把检索能力工具化：① 将 vector/keyword retriever 注册为 Agent 的一个 tool；② 由 planner/LLM 在每轮自主判断是否需要外部知识、生成 query；③ 召回 top-k 切片（带引用元数据）回灌 prompt 作为 Observation；④ 多轮可重复调用，必要时换 query 或扩大 k。与把检索写死在前端的 Naive RAG 相比，它把「是否检索、检索什么」从工程决策变成模型决策。",
  "explanationFocus": "是什么：在 Agent 中，RAG 不再是链路前端的固定步骤，而是被注册成一个可调用的「检索工具」(retrieve tool)。模型在 ReAct/规划循环中自主决定何时检索、检索什么 query，并把召回的 top-k 片段作为 Observation 回灌到上下文，用于后续推理或最终作答。相比 Naive RAG 把检索写死在入口，Agentic RAG 支持在多步中按需要多次、差异化地检索，从而覆盖长尾与最新知识。",
  "bruteForce": "最朴素的做法是固定前置检索：用户一提问就一次性把所有相关文档查出来塞进 prompt，再让模型作答。问题在于若 query 没提炼好，会查非所需造成噪声与超长上下文；且后续推理中发现信息不足也无法补救，只能重新整轮调用，无法在多步中动态补查。",
  "derivation": [
    "为什么需要：LLM 的参数知识有截止日期且对私域/最新数据一无所知，直接作答易幻觉；同时用户问题常需要多源、多轮的外部证据，单次前置检索难以覆盖。把检索做成 Agent 可自主调用的工具，能让模型在「发现自己缺信息」时即时补查，是把「能答」升级为「答得有据」的关键。",
    "怎么实现：把 vector retriever（如 FAISS/Milvus 上的 ANN 检索）和 keyword retriever（BM25）封装为 tool；模型在 ReAct 循环里输出 retrieve(query) 这类动作，系统执行后把 top-k 切片连同 citation 元数据拼回 prompt。常见形态还有 self-query（模型先把自然语言转成带过滤条件的结构化查询）与 multi-query（一次生成多个改写 query 并行检索）。",
    "有什么代价：每次检索都带来延迟（嵌入 + 查找）与 token 回填成本；召回质量直接决定答案上限（garbage in garbage out）；还需对召回做去噪、重排与冲突比对，并维护索引的新鲜度。若不加治理，模型可能过度检索或检索了却不引用，反而增加成本与幻觉风险。",
    "怎么评测：离线看检索命中率/召回率与答案有据率（grounding/attribution）；在线看端到端准确率、引用准确率（citation correctness）与「检索后答案改善率」。也可做 ablation：对比「无检索 / Naive RAG / Agentic RAG」在相同问题集上的准确率与成本曲线。"
  ],
  "invariant": "Agent 的每一句最终作答都必须能追溯到具体的检索片段（grounding），即「有出处、可回查」。不能在「检索了某文档」的情况下却产出与召回内容相悖或无关的陈述，避免「检索了却仍幻觉」这一失效模式。",
  "walkthrough": "以客服 Agent 答「订单 A 的退货运费谁出」为例：模型第 1 步 retrieve('退货政策') 得 3 段（top-k=4，单次向量检索约 15ms@10万文档），第 2 步 retrieve('运费规则') 得 2 段，综合得「卖家承担」并标注来源。共 2 次检索、召回 5 段上下文约 1200 token、额外回填约 400 token。若文档库为 100 万条、并发 100，需 p99 检索延迟 < 50ms 才不拖慢整体 TTFT。",
  "edgeCases": [
    "无相关文档：检索返回空或置信度极低，应触发「未知/我不确定」分支而非编造，并把「未找到依据」如实反馈。",
    "召回片段过时：文档有版本但索引未更新，需在 chunk 上带时间元数据并在作答时优先新版本、声明时效。",
    "多源冲突：不同文档给出相反结论（如政策 A 说 7 天、B 说 15 天），需并列呈现并说明矛盾，或按权威度/时间加权。",
    "检索结果过长：top-k 片段超出上下文窗口，需重排截断或摘要，避免挤掉推理空间。"
  ],
  "code": "def retrieve_tool(corpus, query, k=4):\n    hits = corpus.search(embed(query), k)\n    return [format_chunk(h, with_citation=True) for h in hits]\n\n# 模型在 Agent 循环中自主调用 retrieve_tool",
  "codeNotes": [
    "召回片段务必带 citation（来源文档 id + 片段位置），便于下游溯源与评测 attribution。",
    "当 hits 为空时应显式返回「无相关文档」信号，触发 Agent 的「未知」分支而非空 Observation。",
    "可叠加轻量重排（rerank）与查询改写，提升 top-k 的可用率，减少低质 chunk 占满上下文。"
  ],
  "complexity": "单次检索为 O(log n) 的向量近邻查找（n 为文档/分片数）外加一次 embedding 前向；召回 top-k 后回填占用 O(k·chunk_len) 的上下文 token。Agent 多轮中每多一次 retrieve 就线性叠加一次查找与若干 token，因此检索次数与 k 直接决定额外延迟与成本，需要靠去重与缓存（如相同 query 命中 prefix cache）来抑制。",
  "followUps": [
    {
      "question": "Agentic RAG 和 Naive RAG 的核心区别是什么？",
      "answer": "Naive RAG 在链路入口固定做一次检索再把文档塞给模型，检索时机与 query 由工程写死；Agentic RAG 把检索注册成 tool，由模型在规划/行动循环中按需、多次、差异化地调用，并可根据中间结果换 query 或补查。前者简单稳定但覆盖有限，后者更灵活、对长尾与多步问题更强，但成本与复杂度更高。"
    },
    {
      "question": "怎么防止检索到了却仍幻觉？",
      "answer": "两招并用：一是强制 grounding，要求答案每条关键论断都标注引用片段（citation），并在后处理做 attribution 检查，比对作答与召回内容是否一致；二是做一致性/自洽校验，例如让模型回溯「这句话来自哪个 chunk」，对无法溯源的论断降级或要求重检索。同时用「检索后准确率提升」的指标监控检索是否真被用上。"
    },
    {
      "question": "多轮 Agentic RAG 的成本怎么控制？",
      "answer": "主要开销是检索次数×回填 token。可用查询去重与 prefix cache 复用相同 query 的 embedding/检索；对相似子问题共享已召回上下文；限制单轮最大检索次数与 k；并用轻量重排只保留高相关片段，避免把大量低质 chunk 塞满上下文。"
    }
  ],
  "followUpAnswers": [
    "Naive RAG 在链路入口固定做一次检索再把文档塞给模型，检索时机与 query 由工程写死；Agentic RAG 把检索注册成 tool，由模型在规划/行动循环中按需、多次、差异化地调用，并可根据中间结果换 query 或补查。前者简单稳定但覆盖有限，后者更灵活、对长尾与多步问题更强，但成本与复杂度更高。",
    "两招并用：一是强制 grounding，要求答案每条关键论断都标注引用片段（citation），并在后处理做 attribution 检查，比对作答与召回内容是否一致；二是做一致性/自洽校验，例如让模型回溯「这句话来自哪个 chunk」，对无法溯源的论断降级或要求重检索。同时用「检索后准确率提升」的指标监控检索是否真被用上。",
    "主要开销是检索次数×回填 token。可用查询去重与 prefix cache 复用相同 query 的 embedding/检索；对相似子问题共享已召回上下文；限制单轮最大检索次数与 k；并用轻量重排只保留高相关片段，避免把大量低质 chunk 塞满上下文。"
  ],
  "pitfalls": [
    "检索了却不在作答中引用（不标 grounding），模型仍可能基于参数记忆编造，使检索形同虚设。",
    "召回质量差（chunk 切分不当、索引陈旧）直接封顶效果，却容易被误判为「模型不行」。",
    "让模型每步都检索导致 token 与延迟爆炸，缺乏去重/缓存治理。"
  ],
  "beginnerSummary": "RAG 在 Agent 里像随用随查的资料员。模型做到哪一步需要哪份资料，就喊「去查一下 X」，资料员从档案库里找出带出处的几页小抄递过来，模型照着写答案并注明来源。比如回答「你们家退货要几天」，模型先查退货政策、可能再查运费，综合后作答并标注「依据退货政策第 3 条」。如果资料员翻遍档案都找不到，模型就老实说「我不确定」，而不是瞎编。",
  "prerequisites": [
    "有可检索的语料库且已切片建好向量/关键词索引（chunk size、overlap 需调优）。",
    "检索接口能稳定返回带出处的片段，并支持 top-k 与过滤条件。",
    "底层 LLM 具备 tool-calling / ReAct 能力，能在循环中决定是否调用 retrieve 以及生成何种 query。",
    "有 grounding/attribution 的评测手段，才能确认检索真正被用上。"
  ],
  "workedExample": [
    "客服场景：模型按需调用 retrieve('退货政策') 与 retrieve('运费规则') 两次，召回 5 段（约 1200 token），最终给出带引用的「卖家承担运费」结论；文档库 100 万条时在并发 100 下 p99 检索需 < 50ms。",
    "无相关文档场景：检索返回 0 hits，Agent 输出「依据现有资料无法确认，建议联系人工」，而非编造政策细节。",
    "多源冲突场景：政策文档 A 写 7 天、B 写 15 天，Agent 并列展示并提示「以最新官网为准」。"
  ],
  "lineByLine": [
    "`hits = corpus.search(embed(query), k)`：把自然语言 query 编码成向量并在索引中做近邻检索，取 top-k。",
    "`format_chunk(h, with_citation=True)`：把命中片段格式化为带来源引用的文本块。",
    "返回结果列表交给 Agent 循环，作为 Observation 拼入下一轮 prompt。",
    "模型基于这些带出处的小抄决定下一步动作（继续检索 / 作答 / 追问用户），形成闭环。"
  ],
  "diagram": "Agent <-> retrieve_tool <-> Corpus"
};
