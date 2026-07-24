export default {
  "kind": "concept",
  "id": "mm-qformer",
  "category": "多模态模型",
  "difficulty": "Hard",
  "title": "Q-Former 跨模态连接器",
  "prompt": "Q-Former 这类跨模态连接器在多模态模型里解决什么问题？",
  "quickAnswer": "Q-Former（BLIP-2）用一组可学习的查询 token 通过交叉注意力从视觉编码器输出中「提炼」出固定数、与文本对齐的视觉表示，把冗长且不对齐的视觉 token 压缩成少量高质量 token 再喂 LLM。它解决了视觉 token 过长、与文本空间不对齐两大痛点，是经典的连接器设计。相比简单 MLP 投影，Q-Former 还能压缩 token 数量，是在「对齐」之外额外做了「降采样」。",
  "approach": "架构流程：固定 N 个可学习查询 token → 每层对视觉特征做交叉注意力（从视觉「提炼」）→ 查询 token 之间做自注意力（彼此交互、聚合信息）→ 可选地与文本 token 做交叉注意力（与文本对齐）→ 输出 N 个已对齐的视觉 token → 经投影层进 LLM。通常分两阶段预训练：先纯视觉-语言对比/生成，再接 LLM 微调。",
  "explanationFocus": "是什么：Q-Former（Querying Transformer，出自 BLIP-2）是一种跨模态连接器（connector / bridge），用一组可学习的「查询 token（query tokens）」通过交叉注意力机制，从视觉编码器（如 ViT）的输出中「提炼」出固定数量、且已与文本空间对齐的视觉表示，再喂给 LLM。它专门解决两大痛点：一是视觉 token 数量太多（ViT 动辄数百），直接塞 LLM 既贵又占 KV；二是视觉特征与 LLM 词空间不同构，直接拼接难以训练收敛。Q-Former 用「少而精」的对齐 token 把二者桥接起来。",
  "bruteForce": "把全部 ViT token 直接塞进 LLM：ViT 输出常有 256~数千个 token，既大幅拉长 LLM 序列（O(n²) 算力与 KV 缓存暴涨），又与 LLM 词空间不同构导致难以训练收敛，还浪费大量显存。小模型接大模型视觉特征时尤其灾难。",
  "derivation": [
    "为什么需要：ViT 输出 token 数量多（数百到数千）且与 LLM 词空间不同构，直接拼接既贵（序列变长、KV 暴涨）又难训（分布不一致）。需要一个轻量模块在「视觉特征」与「LLM 词空间」之间做对齐与压缩。",
    "怎么实现：初始化 N 个 learnable query token，堆叠若干层；每层先对 query 做自注意力（彼此交互），再对视觉特征做交叉注意力（从视觉提炼信息），还可接入文本 token 做第二次交叉注意力以与文本对齐。输出 N 个对齐 token，经投影进 LLM。",
    "有什么代价：查询数 N 是核心超参——过小丢细粒度信息、过大失去压缩意义且增加 LLM 负担；多阶段预训练（先视觉-语言、后接 LLM）工程复杂、调参繁琐；训练数据需图文对支撑对比/生成目标。",
    "怎么评测：在下游 VQA、图文生成、图像描述上比效果；做「视觉 token 数 N vs 指标」的消融看压缩拐点；观察接 LLM 后微调的难度与收敛速度，以及高分辨率输入下的信息保留率。"
  ],
  "invariant": "核心不变式：无论原图产生多少视觉 token（257 或上千），Q-Former 始终输出固定 N 个与文本对齐的查询 token。N 是核心超参，决定「压缩率」与「信息保真度」的权衡，且不随输入分辨率变化。",
  "walkthrough": "以 BLIP-2 接 ViT-g/14 为例：ViT 输出 257 个 patch token（包括 [CLS]）；Q-Former 用 32 个可学习 query token，经若干层（每层含自注意力 + 对 ViT 特征的交叉注意力）压缩提炼，得到 32 个已与文本对齐的 token；再经一个线性投影层映射到 LLM（如 7B）的嵌入维度后进 LLM 做 captioning/问答。从 257→32，序列长度降约 8 倍。",
  "edgeCases": [
    "查询数 N 过少（如 8）：会丢失细粒度/空间信息，复杂场景描述空洞，需要按任务上调。",
    "高分辨率原图信息密度高：256 token 都未必够，可能需要更大的 N 或分层 Q-Former（对不同分辨率提不同层）。",
    "纯视觉预训练阶段与后续 LLM 对齐需两段训练：两段目标不一致易导致衔接断层，需仔细设计训练课程。",
    "极低资源场景：N 也不可无限小，否则视觉语义塌缩成几个 token 无法支撑复杂问答。"
  ],
  "code": "def qformer(queries, visual_feat, text_feat=None):\n    x = queries\n    for layer in q_layers:\n        x = self_attn(x)                          # 查询间交互\n        x = cross_attn(x, visual_feat)            # 从视觉提炼\n        if text_feat is not None:\n            x = cross_attn(x, text_feat)          # 与文本对齐\n    return x                                      # (B, N_query, d)",
  "codeNotes": [
    "query 数 N 是核心超参：直接决定压缩率与信息保真度的权衡，需消融选取。",
    "交叉注意力是「提炼」关键：它让少量 query 从大量视觉 token 中聚合信息，而非逐 token 透传。",
    "self_attn 不能省：query 之间需要互相通信才能避免各自重复提取同一视觉区域。"
  ],
  "complexity": "每层交叉注意力复杂度为 O(N·V·d)（N 查询数、V 视觉 token 数、d 维度）。由于 N 远小于 V（如 32 vs 257），相比直接把 V 个 token 送 LLM 的 O(V²·d)，Q-Former 大幅压缩了后续 LLM 的计算。预训练还需两段（视觉-语言 + LLM 微调），工程复杂度在于协调多阶段训练目标。",
  "followUps": [
    {
      "question": "Q-Former 和简单 MLP 连接器差在哪？",
      "answer": "MLP（如 LLaVA 早期的线性投影）只做维度映射，把每个视觉 token 投影到 LLM 嵌入维度，token 数量不变——ViT 出 256 个它还是 256 个。Q-Former 用交叉注意力把可变长、数量多的视觉特征「压缩提炼」成固定少量（如 32 个）已对齐 token，既降维度又降数量，大幅省 LLM 的序列长度与 KV 缓存。二者代价是 Q-Former 多一段预训练、更复杂。"
    },
    {
      "question": "查询 token 数怎么定？",
      "answer": "在「效果」与「长度/成本」间权衡，常取 32~64。任务越细粒度（如 OCR、密集描述）或原图分辨率越高，信息密度越大，需要更大的 N（如 64 甚至 128）；纯粗粒度 captioning 用 32 即可。实践经验是做 N 的消融曲线找拐点，而非拍脑袋。"
    },
    {
      "question": "为什么 Q-Former 需要两阶段预训练？",
      "answer": "因为它要同时学会两件事：一是从视觉特征中提炼有用信息（视觉-语言对齐/生成目标，用图文对训练），二是产出能被 LLM 理解的表示（需接 LLM 微调）。先单独在视觉-语言任务上预训练 Q-Former，使其具备提炼能力；再冻结/微调接 LLM 做端到端对齐，能更稳定地收敛，避免随机初始化的 query 直接对接 LLM 导致训练困难。"
    }
  ],
  "followUpAnswers": [
    "MLP（如 LLaVA 早期的线性投影）只做维度映射，把每个视觉 token 投影到 LLM 嵌入维度，token 数量不变——ViT 出 256 个它还是 256 个。Q-Former 用交叉注意力把可变长、数量多的视觉特征「压缩提炼」成固定少量（如 32 个）已对齐 token，既降维度又降数量，大幅省 LLM 的序列长度与 KV 缓存。二者代价是 Q-Former 多一段预训练、更复杂。",
    "在「效果」与「长度/成本」间权衡，常取 32~64。任务越细粒度（如 OCR、密集描述）或原图分辨率越高，信息密度越大，需要更大的 N（如 64 甚至 128）；纯粗粒度 captioning 用 32 即可。实践经验是做 N 的消融曲线找拐点，而非拍脑袋。",
    "因为它要同时学会两件事：一是从视觉特征中提炼有用信息（视觉-语言对齐/生成目标，用图文对训练），二是产出能被 LLM 理解的表示（需接 LLM 微调）。先单独在视觉-语言任务上预训练 Q-Former，使其具备提炼能力；再冻结/微调接 LLM 做端到端对齐，能更稳定地收敛，避免随机初始化的 query 直接对接 LLM 导致训练困难。"
  ],
  "pitfalls": [
    "把连接器当成纯投影（MLP），忽视其压缩作用：MLP 只能做维度映射、无法减少 token 数，面对长视觉序列仍贵；Q-Former 的真正价值在「提炼压缩」。",
    "查询 token 数过少导致细粒度信息丢失：贪心设很小 N 省 LLM 算力，却换来下游准确率明显下降。",
    "忽视两阶段训练的衔接：直接拿未充分视觉-语言预训练的 Q-Former 接 LLM，对齐差、收敛慢。"
  ],
  "beginnerSummary": "Q-Former 像让几个「记者」（查询 token）去采访一大堆「现场照片」（视觉 token），每人只问出最关键的一句总结，最后把这几句精炼报道交给写稿的 LLM。这样既简短又和文字口径一致，省时又清楚，避免把几百张原始照片全部塞给写稿人。",
  "prerequisites": [
    "视觉 token 长且与文本不同空间：理解 ViT 输出为何既冗余又难直接喂 LLM。",
    "注意力可跨模态提取信息：理解交叉注意力如何「从视觉读入 query」。",
    "需固定长度以稳定喂 LLM：理解 LLM 输入序列长度最好可控，从而需要压缩。",
    "对比/生成预训练目标：理解 Q-Former 的两阶段训练依赖图文对信号。"
  ],
  "workedExample": [
    "ViT-g/14 输出 257 个 patch token；Q-Former 用 32 个 query token，经交叉注意力压缩为 32 个对齐 token，序列降约 8 倍。",
    "高分辨率变体：原图 2K 视觉 token，N=64 query 压缩到 64，兼顾细粒度与长度。",
    "接 7B LLM：32 对齐 token 经线性投影到 LLM 嵌入维度，做零样本 captioning，效果优于直接拼接 ViT token。"
  ],
  "lineByLine": [
    "初始化可学习查询 token x = queries：N 个随机向量，是「提问者」，负责从视觉提炼信息。",
    "x = self_attn(x)：查询 token 之间做自注意力，彼此交换/聚合已提炼到的信息。",
    "x = cross_attn(x, visual_feat)：关键一步——query 作为 Q、视觉特征作为 K/V，从视觉中「读取」相关信息，实现压缩提炼。",
    "可选 if text_feat: x = cross_attn(x, text_feat)：再与文本做交叉注意力，使输出同时与文本空间对齐；最终返回 (B, N_query, d) 的对齐 token。"
  ],
  "diagram": "ViT tokens(多) ─▶ 交叉注意力 ← 查询(少,N)\n                        │\n                    自注意力(查询间)\n                        │\n                   N 个对齐 token ─▶ LLM"
};
