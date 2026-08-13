export let tutorials = [
  {
    id: 'project-defense-tech-lead',
    trackId: 'personal', order: 1, primaryCategories: ['Tech Lead 与项目答辩'], prerequisiteIds: [],
    title: '项目答辩与 Tech Lead',
    eyebrow: 'COURSE 01 · EXPERIENCE TO EVIDENCE',
    summary: '把简历项目组织成能承受追问的证据链，再把技术决策、实验、协作与交付讲成完整的 Tech Lead 闭环。',
    outcome: '完成后，你应能做一次 3 分钟项目陈述，并继续承受模型选型、指标口径、负收益、端侧交付和团队协作追问。',
    audience: '适合社招技术面、项目深挖面、系统设计面和 Tech Lead/行为面。',
    capstone: {
      title: '结课答辩：从模型选型到跨端交付',
      prompt: '选择一个真实项目，在 8 分钟内完成：背景与约束 → 个人决策 → 证据与反证 → 交付结果 → 失败边界 → 复盘。如果某个环节没有简历或记忆依据，明确说“这是我的补充方案，不是当时事实”。',
      checklist: ['一句话说清业务问题和硬约束', '区分个人动作、团队动作与外部依赖', '至少给出一组对照或失败证据', '说清指标分母、切片、设备和版本', '补充上线门禁、降级或回滚', '给出一个真正改变后续做法的复盘']
    },
    chapters: [
      {
        id: 'claim-boundary', number: 1, title: '先建立可信边界：什么能说，什么不能说', duration: '25 分钟',
        goal: '建立项目答辩的可信边界：把简历事实、合理解释和通用方法分层，避免为了显得复杂而补写没有做过的流程。',
        bridge: '后面所有选型、实验和管理章节，都建立在“主张可被证据支持”这条地基上。',
        sections: [
          { title: '从面试官视角看项目答辩', paragraphs: ['项目答辩不是复述简历。面试官真正检查的是：问题是否真实、你做了哪一步、为什么这样做、结果如何测量，以及换一个条件后结论是否还成立。', '回答越具体，越需要证据。反过来，没有做过的高级方法说得越细，越容易在数据、时间线和实现追问中自相矛盾。'] },
          { title: '三层主张模型', steps: ['事实层：简历或自己记忆能确认的动作与结果，可以使用“我做了”。', '解释层：为了说明事实而补充的原理，可以说“这里的机制是”，但不自动代表当时完整实现。', '方案层：事故流程、正式 RICE、复杂统计等没有经历依据时，只能说“如果让我做，我会”。'] },
          { title: '贯穿案例', callout: '“我把 PP-OCRv6 small 迁移到 TensorRT，并通过 buffer 复用降低约 220 MiB HWM”是事实主张；复杂对象池、四槽并发等若不能确认，只能作为可选设计解释，不能倒填成项目历史。' }
        ],
        exercise: { title: '练习：给简历 Bullet 上色', prompt: '选三个 Bullet，分别写出事实层、解释层和方案层。删掉所有无法回答“证据在哪里”的第一人称动作。', checks: ['是否写清个人贡献', '是否保留团队边界', '数字是否带场景和口径'] },
        questionIds: ['lead-resume-star-defense', 'edge-resume-buffer-concurrency', 'asr-resume-label-noise-audit']
      },
      {
        id: 'story-backbone', number: 2, title: '把 Bullet 写成能展开的 STAR-L 主线', duration: '35 分钟',
        goal: '形成 30 秒、3 分钟和 15 分钟三个可伸缩版本，而不是一次倾倒全部技术细节。',
        bridge: '有了可信边界，下一步是让证据按因果顺序出现：为什么做、你改变了什么、怎样知道有效。',
        sections: [
          { title: 'STAR-L 不是五个标签', paragraphs: ['Situation 只交代决策所需背景；Task 写清目标和约束；Action 必须以个人动作和取舍为中心；Result 带口径；Learning 要说明后续行为发生了什么变化。', '最常见的弱回答是背景过长、行动写成“我们优化了”、结果只有一个百分比，最后没有失败或复盘。'] },
          { title: '三层表达', steps: ['30 秒：问题、我的关键动作、可核验结果。', '3 分钟：补候选方案、取舍、证据和失败边界。', '15 分钟：按追问展开数据、模型、消融、系统、协作和复盘，不主动堆满所有细节。'] },
          { title: '示例骨架', callout: '信道退化导致识别下降 → 我还原真实信号链并建立增强/回归验证 → 业务域与通用域分别评测 → 说明哪些数字来自固定测试集，哪些结论只适用于该链路。' }
        ],
        exercise: { title: '练习：同一项目讲三遍', prompt: '用同一项目分别录制 30 秒和 3 分钟版本；3 分钟版只能比 30 秒版增加“为什么、证据、边界”，不能更换主结论。', checks: ['开头 20 秒内是否出现问题', '行动是否使用明确动词', '结果后是否立即交代口径'] },
        questionIds: ['lead-resume-star-defense', 'asr-resume-rir-signal-chain', 'tts-resume-codeswitch-phoneme', 'tts-resume-text-normalization']
      },
      {
        id: 'model-selection', number: 3, title: '模型选型：从业务约束到可审计结论', duration: '45 分钟',
        goal: '不以榜单冠军代替决策，能用硬门槛、Pareto 和 ADR 解释为什么选、为什么不选。',
        bridge: '故事有了主线，技术追问通常首先进入“为什么选择这个方案”。',
        sections: [
          { title: '先把业务语言翻译成技术约束', steps: ['质量：平均指标之外，哪些错误代价最高。', '性能：真实设备上的 p50/p99、内存、功耗、首包和稳态。', '能力：是否流式、语言覆盖、动态 shape、前后处理。', '交付：算子支持、许可、维护、替换成本和团队熟悉度。'] },
          { title: '两阶段选型', paragraphs: ['先用硬门槛和 smoke test 淘汰必然不适配的候选；再对少数候选做同口径完整比较。这样既保留探索，也避免每个模型都跑昂贵全量实验。', '结论应落在 Pareto 前沿：不存在所有维度都最好时，选择最符合当前约束的点，并记录触发重评的条件。'] },
          { title: '贯穿案例', callout: '某模型 CER 更低但无法端侧流式，应因违反硬门槛退出；Zipformer 若精度略低但满足 RTF、内存和维护要求，可以成为交付候选。这里的强项不是“选了 Zipformer”，而是决策过程可以复核。' }
        ],
        exercise: { title: '练习：制作一页选型 ADR', prompt: '选 ASR、TTS 或 OCR 项目，列 3 个候选、3 个硬门槛、4 个比较指标、淘汰原因和重评条件。', checks: ['候选是否使用相同数据和设备', '硬门槛是否先于加权总分', '是否保存失败候选的原因'] },
        questionIds: ['lead-resume-model-selection', 'asr-resume-backbone-audit', 'edge-resume-runtime-selection', 'tts-resume-small-speaker-finetune']
      },
      {
        id: 'evidence-experiments', number: 4, title: '实验与负收益：怎样证明收益来自哪里', duration: '50 分钟',
        goal: '用控制变量、消融、切片和失败样本建立证据，而不是只展示最佳 checkpoint。',
        bridge: '选型只是一个假设；这一章解决怎样用实验把假设变成可信结论。',
        sections: [
          { title: '一条完整证据链', steps: ['冻结 baseline、数据版本、评测脚本与预算。', '一次只改变一个关键因素；组合有效时补单项对照。', '主指标之外报告关键切片、最差切片和样本量。', '保存原始输出和 run manifest，能够从预处理重新复算。'] },
          { title: '负收益比正收益更能体现能力', paragraphs: ['模型下降时先分层归因：文字规范、数据采样、模型、辅助任务、解码、后处理、评分口径。不要把所有下降笼统归给“模型不行”。', 'ChinaVoices 案例可以用来说明：统一正字法后差距如何变化、关闭 LID loss 后是否恢复，以及怎样区分相关变化与真正的梯度冲突证据。'] },
          { title: '门禁不是指标越多越好', callout: '总体 CER 下降但电话数字实体明显退化时，高风险切片可以阻断；只有 30 句的小语种出现波动时，应先报告区间和扩样，而不是机械套同一阈值。' }
        ],
        exercise: { title: '练习：设计最小消融矩阵', prompt: '针对一个收益主张写 baseline、两个单因素和一个组合实验；说明训练预算、随机性、切片、停止条件和可能的交互项。', checks: ['有没有偷偷同时改变数据与模型', '是否能解释负收益', '是否给出阻断上线的条件'] },
        questionIds: ['perf-resume-ablation-design', 'perf-resume-slice-gate', 'asr-resume-error-attribution', 'asr-resume-domain-mixture', 'asr-resume-confidence-calibration', 'tts-resume-g2pw-calibration', 'tts-resume-tone-prosody']
      },
      {
        id: 'execution-leadership', number: 5, title: '两人小组也需要真正的 Tech Lead 机制', duration: '35 分钟',
        goal: '讲清怎样拆 owner、接口和验收物，并避免自己包办或关键链路只有一个人懂。',
        bridge: '实验结论要变成交付结果，需要把研究工作拆成团队能够并行和复现的执行系统。',
        sections: [
          { title: '小团队的核心不是流程多', paragraphs: ['两人团队最怕两种极端：所有人都“共同负责”导致没人负责，或者每人独占一条链路导致一人请假项目停摆。', 'Tech Lead 应拆清数据、模型、评测、部署的输入输出和 Definition of Done；关键变更由非 owner review，关键脚本和 runbook 能被另一人执行。'] },
          { title: 'Lead 自己做什么', steps: ['明确目标、接口、风险和决策时点。', '把任务交给 owner，而不是代替 owner 写完。', '通过 review、复现和文档降低 bus factor。', '冲突时用约束和证据决策，并让成员主导实验与复盘。'] },
          { title: '边界', callout: '简历明确支持“带领 2 人小组”和跨端交付；正式的周复现、PR 机制或培养案例若记不清，应作为推荐做法讲，不要写成当时流程。' }
        ],
        exercise: { title: '练习：拆一个两周里程碑', prompt: '把一个模型交付拆成两位成员和 Tech Lead 的 owner map；每项写输入、输出、DoD、reviewer 和失败升级条件。', checks: ['是否存在唯一 owner', '是否存在非 owner 验证', 'Tech Lead 是否成为所有任务瓶颈'] },
        questionIds: ['lead-resume-small-team', 'lead-resume-experiment-priority', 'lead-resume-disagreement']
      },
      {
        id: 'cross-team-delivery', number: 6, title: '跨端交付：模型完成不等于项目完成', duration: '45 分钟',
        goal: '把 checkpoint 扩展成接口、资产、性能、验收、灰度和回滚组成的完整交付包。',
        bridge: '团队内部跑通之后，项目最容易在算法、端侧和产品的接口处失败。',
        sections: [
          { title: '先冻结稳定协议，不冻结所有实现', steps: ['输入输出、前后处理、状态与取消语义。', '模型、词表、配置和 schema 的兼容版本。', '质量、延迟、内存和异常恢复的验收集。', '可替换的模型配置与稳定的产品/端侧协议分层。'] },
          { title: '交付包应该有什么', paragraphs: ['以 TTS 为例，交付不仅是 ONNX，还包括 tokens、前端配置、示例音频、延迟内存报告、流式状态和 cancel API。端侧发现 p99 超标时，需要按 timeline 判断是模型、拷贝、队列还是播放 buffer。', '运行时选型也必须在真实设备比较精度、延迟、HWM、包体、冷启动和异常恢复，不能引用厂商峰值代替本机证据。'] },
          { title: '贯穿案例', callout: 'OCR 的 buffer 复用、TTS 的 sherpa-onnx 交付和 ASR 流式会话都可以用同一交付框架讲：契约 → 性能分解 → 异常路径 → 灰度门禁 → 回退资产。' }
        ],
        exercise: { title: '练习：写交付清单', prompt: '为一个端侧项目写出模型资产、接口、设备矩阵、golden samples、性能预算、降级和回滚验证。', checks: ['是否包含前后处理', '是否测 p99/HWM 而非只有平均值', '回滚包是否真的演练过'] },
        questionIds: ['lead-resume-cross-team', 'edge-resume-runtime-selection', 'edge-resume-sherpa-streaming', 'edge-resume-int8-calibration', 'edge-resume-cpu-profiling']
      },
      {
        id: 'risk-incident', number: 7, title: '风险、事故与复盘：没有经历也不能编', duration: '30 分钟',
        goal: '掌握止损—证据—定位—修复—防复发顺序，同时诚实区分真实经历与通用事故方案。',
        bridge: '交付闭环必须回答“如果上线后出问题怎么办”；但当前简历没有明确事故案例。',
        sections: [
          { title: '三个时间尺度', steps: ['前 30 分钟：停止扩量、回退稳定版本、保存版本与请求证据、明确指挥与沟通窗口。', '当天：建立影响范围和时间线，验证根因，修复后跑定向与全量回归。', '一周内：做无责复盘，把 action item 变成自动门禁、监控或演练，并指定 owner/deadline。'] },
          { title: '事故题的可信回答', paragraphs: ['当前简历没有写具体线上事故，因此不能说“我当时在前 30 分钟做了什么”。可以先明确没有可确认案例，再用“如果让我负责，我会”回答流程。', '也可以使用真实的负收益定位或回退经历作为邻近证据，但必须说明它和完整生产事故的区别。'] },
          { title: '复盘的结果', callout: '“工程师不够仔细”不是根因。有效复盘要把同类错误变得更难发生、更快发现、更容易回滚，并跟踪 action item 是否完成。' }
        ],
        exercise: { title: '练习：桌面事故演练', prompt: '假设新模型只在某设备加载失败，写出 0~30 分钟、当天、一周内的动作；再标注哪些是通用方案、哪些有你真实项目证据。', checks: ['是否先止损再试修', '是否保留证据与影响范围', '是否产生系统性防线'] },
        questionIds: ['lead-resume-incident', 'edge-resume-sherpa-streaming', 'perf-resume-slice-gate']
      },
      {
        id: 'defense-rehearsal', number: 8, title: '现场答辩：把课程压缩成一场可追问演练', duration: '50 分钟',
        goal: '完成项目主线、自选深挖和行为面追问，并能在不知道时保持可信。',
        bridge: '最后一章不再增加知识，而是把前七章转成现场表达与应变能力。',
        sections: [
          { title: '8 分钟答辩结构', steps: ['1 分钟：业务问题、约束和你的职责。', '2 分钟：候选方案与关键取舍。', '2 分钟：实验、反证、切片和结果口径。', '2 分钟：团队协作、端侧/产品交付与风险。', '1 分钟：失败边界、复盘和如果重做。'] },
          { title: '追问树', paragraphs: ['面试官可能从任一数字进入：分母是什么、哪个版本、几次运行、为什么不是数据问题、端侧如何测、团队谁完成、失败候选是什么。练习时应沿一条分支深入，而不是每题都背一段孤立答案。', '不知道细节时先界定记忆边界，再说你能确认的证据和验证方法。可信度比临时编一个漂亮实现更重要。'] },
          { title: '结课标准', callout: '听者能复述五件事才算通过：项目为什么做、你具体改变了什么、什么证据支持结论、最重要的边界是什么、这件事如何体现 Tech Lead 而非只体现个人编码。' }
        ],
        exercise: { title: '结课模拟', prompt: '任选一个真实项目，录制 8 分钟答辩；随后随机抽取本课程关联题卡追问 12 分钟。复盘所有含糊主语、无口径数字和越界主张。', checks: ['是否在时间内完成闭环', '能否展开一次失败或反证', '是否回答个人与团队边界', '是否给出交付和复盘'] },
        questionIds: ['lead-resume-star-defense', 'lead-resume-model-selection', 'perf-resume-ablation-design', 'lead-resume-small-team', 'lead-resume-cross-team', 'lead-resume-incident']
      }
    ]
  },
  {
    id: 'asr-from-audio-to-delivery',
    trackId: 'speech', order: 2, primaryCategories: ['ASR 专项'], prerequisiteIds: [],
    title: 'ASR：从音频到可交付识别系统',
    eyebrow: 'COURSE 02 · AUDIO TO RELIABLE ASR',
    summary: '沿一条真实识别链路学习 ASR：音频与标签 → CTC/RNN-T → 模型选型 → 解码与热词 → 流式会话 → 数据治理 → 多域鲁棒 → 评测交付。',
    outcome: '完成后，你应能从一段音频推导训练与解码过程，解释 CTC、RNN-T、Paraformer、Whisper 与 Zipformer 的取舍，并设计可复核的流式、多语种 ASR 方案。',
    audience: '适合语音算法面、模型原理面、端侧流式系统面，以及围绕个人 ASR 项目的深挖答辩。',
    capstone: {
      title: '结课设计：给多语种端侧产品交付一套 ASR',
      prompt: '假设产品需要中英西三语、支持热词、首字延迟低、断网可用，并且新业务域不能破坏通用能力。请完成一份 10 分钟方案：定义输入输出和评测集，选择模型与解码器，画出流式状态，说明数据治理与回归门禁，最后回答一次句尾丢字故障。涉及个人经历时，只引用课程中标为“简历明确经历”的证据。',
      checklist: ['能画出音频到文字的完整数据流', '能手算一个 CTC 或 RNN-T 小例子', '模型选择同时考虑质量、流式性和端侧成本', '热词增强有召回、误插入和回退指标', '流式结束包含 drain、flush、finalize 和状态释放', '新域、旧域、多语种与高风险切片分别报告', '区分真实项目事实与本课程补充方案']
    },
    chapters: [
      {
        id: 'asr-contract', number: 1, title: '先定义识别问题：声音怎样变成可评分文字', duration: '40 分钟',
        goal: '建立音频、特征、文字单元和 CER/WER 的共同坐标系，先知道模型到底接收什么、预测什么、怎样算错。',
        bridge: '如果输入、标签和评分口径没有冻结，后面的模型差异很可能只是采样率、文本归一化或 tokenizer 差异。',
        sections: [
          { title: '一条最小 ASR 链路', steps: ['16 kHz 波形按短窗切帧，提取 log-Mel 频谱；每一帧描述一小段时间里的频率能量。', '编码器把长帧序列压成上下文表示；CTC、RNN-T 或注意力解码器再把它映射成字符、子词或 token。', '后处理恢复数字、标点和业务格式；评分前按固定 normalizer 处理 hypothesis 与 reference。'] },
          { title: '波形、log-Mel 与 codec token 不解决同一个问题', paragraphs: ['传统 ASR 最常用 log-Mel，因为它保留语音辨识需要的频谱结构，并显著缩短原始波形。codec token 更适合语音生成或统一语音大模型，但离散化会带来码本和时间分辨率取舍，不能因为“更像大模型”就默认更适合识别。', '输出单元也会改变错误形态：中文常看 CER，英文常看 WER；数字“2026”写成“二零二六”究竟算不算错，取决于产品文字规范。'] },
          { title: '手算例子：一句话为什么会得到不同错误率', callout: 'Reference 是“打开空调”，模型输出“打开空条”。按字符比较只有“调→条”一次替换，CER = 1/4；如果分词后两者都被切成“打开 / 空调（空条）”，WER 可能是 1/2。不是哪个指标更真，而是必须先说明分词与归一化口径。' },
          { title: '先审标签，再怪模型', paragraphs: ['模型输出与 reference 不同，只能说明评分不一致，不能直接说明 reference 有错。要回听音频、检查标注规范和多人一致性，才能把“模型错误”升级为“标签噪声”。', '个人项目里西语数据的标签审计可以作为真实案例；复杂噪声估计方法若没有实际证据，只作为补充方案。'] }
        ],
        exercise: { title: '练习：写一页 ASR 指标契约', prompt: '为一个中英混合语音产品写输入采样率、切分方式、输出文字规范、CER/WER normalizer 和三个高风险切片；再手算一条包含替换、插入和删除的样本。', checks: ['分母和文字归一化是否明确', '是否保存原始输出而非只留总分', '是否区分评分差异与标签错误'] },
        questionIds: ['as-asr-codec', 'asr-eval-metrics', 'asr-resume-label-noise-audit']
      },
      {
        id: 'ctc', number: 2, title: 'CTC：没有逐帧标签，模型怎样学会对齐', duration: '55 分钟',
        goal: '理解 blank、重复折叠、路径求和和前缀搜索，能够手算短序列并解释 CTC 的独立性假设。',
        bridge: '第一章只有音频和整句文字，却没有告诉模型每个字在哪一帧。CTC 先解决“未知对齐怎样训练”这个核心矛盾。',
        sections: [
          { title: 'CTC 的关键不是加一个 blank', paragraphs: ['给定 T 帧和 U 个标签，CTC 枚举长度为 T 的对齐路径：先删除 blank，再合并相邻重复，能得到目标文字的路径概率全部相加。训练因此不需要人工逐帧标注。', 'blank 还负责分开重复字符。例如输出“好好”时，路径必须在两个“好”之间经过 blank 或其他符号，否则折叠后只剩一个“好”。'] },
          { title: '手算例子：T=3，目标是“AB”', callout: '能折叠成 AB 的路径包括 A-A-B、A-B-B、A-blank-B 等；A-B-A 会得到 ABA，blank-A-B 也有效。CTC 前向递推不会真的列出所有路径，而是在扩展标签序列 blank-A-blank-B-blank 上累加到达概率。' },
          { title: 'Greedy 为什么会输给 Prefix Beam Search', steps: ['Greedy 每帧只拿概率最高 token，再折叠；它找的是最可能路径，不一定是所有路径求和后最可能的文字。', 'Prefix Beam 分别维护前缀以 blank 结尾和非 blank 结尾的概率，正确处理重复字符。', '加入语言模型时在扩展前缀处融合分数，但语言模型权重过大可能把声学证据改成“更常见但没说过”的句子。'] },
          { title: '强制对齐能做什么', paragraphs: ['已知音频和正确文字时，可以在 CTC trellis 中寻找高概率路径，得到 token 的近似时间边界，用于字幕、切段和标签检查。它依赖模型与文本都基本可信，不等同于人工精确音素边界。'] }
        ],
        exercise: { title: '练习：手推一次 CTC', prompt: '为 3 帧、词表 {blank, A, B} 自设概率，先做 greedy，再列出所有能折叠为 AB 的路径并比较总概率；最后解释为什么 AA 至少需要 3 帧。', checks: ['是否正确处理相邻重复', '是否区分最优路径与最优标签序列', '是否能说出 CTC 条件独立假设的限制'] },
        questionIds: ['ctc-greedy', 'ctc-prefix-beam', 'as-ctc-align']
      },
      {
        id: 'rnnt', number: 3, title: 'RNN-T：时间轴和输出轴怎样共同前进', duration: '60 分钟',
        goal: '看懂 encoder、predictor、joiner 和二维前向递推，能解释 blank 转移、标签转移、greedy 与剪枝。',
        bridge: 'CTC 假设给定声学表示后各帧输出近似独立，语言上下文主要靠外部解码补。RNN-T 把已输出 token 历史直接放进模型。',
        sections: [
          { title: '二维格点是理解 RNN-T 的钥匙', steps: ['Encoder 在时间维 t 提供声学表示；Predictor 在输出维 u 编码已生成 token。', 'Joiner 在格点 (t,u) 给出 blank 或下一个 token 的分布。', '输出 blank：时间前进到 (t+1,u)；输出 token：文字前进到 (t,u+1)，同一音频帧仍可继续出字。'] },
          { title: '手算例子：2 帧输出 AB', callout: '从 (0,0) 出发，一条路径可以是 A → blank → B → blank；也可以 blank → A → B → blank。前向算法把所有合法路径概率相加。若某一帧一直预测非 blank，greedy 需要 max-symbols-per-frame 防止卡在同一 t 无限出字。' },
          { title: 'Greedy、Beam 与剪枝分别牺牲什么', paragraphs: ['RNN-T greedy 每次取最高分，速度快但会丢掉早期概率略低、后续更合理的前缀。Beam 保留多个 hypothesis，却会让 joiner 计算和状态复制迅速增长。', 'Pruning 的本质是只计算或保留高概率的 (t,u) 区域；省下的是 joiner/损失格点与 beam 扩展成本，代价是剪掉正确路径的风险。'] },
          { title: 'Zipformer 不等于 RNN-T', paragraphs: ['Zipformer 是 encoder 结构，RNN-T 是训练与解码目标；两者经常组合，但不能混成一个名词。Zipformer 通过多尺度时间分辨率和不同层宽度分配计算，流式时仍需保存卷积、注意力和 predictor 状态。'] }
        ],
        exercise: { title: '练习：画 3×3 RNN-T 格点', prompt: '画出 T=2、目标长度 U=2 的格点，标出 blank 与 label 两种边；写出到达终点的两条路径，再解释 greedy 的终止条件和 beam 的状态组成。', checks: ['blank 是否只推进时间', 'token 是否只推进输出位置', '是否说清 encoder cache 与 predictor state 的区别'] },
        questionIds: ['rnnt', 'rnnt-greedy', 'as-rnnt-pruning', 'asr-resume-zipformer-internals']
      },
      {
        id: 'architecture-selection', number: 4, title: '架构选型：Conformer、Zipformer、Paraformer 与 Whisper', duration: '65 分钟',
        goal: '不靠模型名背答案，能从对齐方式、上下文、流式性、延迟、数据规模和端侧约束选择架构。',
        bridge: '理解 CTC 和 RNN-T 后，才能把 encoder、训练目标和解码方式拆开比较，而不是把整套模型当作不可解释的品牌。',
        sections: [
          { title: '先拆成三层再比较', steps: ['输入与 encoder：Conformer 用注意力建模长程关系、卷积捕捉局部模式；Zipformer 用多尺度结构重新分配计算。', '对齐与训练目标：CTC、RNN-T、CIF 或 attention decoder 决定训练约束和输出依赖。', '解码与产品能力：是否原生流式、能否 prompt、热词怎样接入、长音频和端侧成本怎样。'] },
          { title: '四类候选的直觉', paragraphs: ['Conformer 是通用强 encoder，不自动意味着离线；配 chunk mask 和 cache 可以流式。Paraformer 用 CIF 聚合声学帧并并行预测 token，延迟友好，但 token 数预测错误会影响对齐。Whisper 是大规模弱监督 encoder-decoder，鲁棒和多任务能力强，但自回归解码、控制 token 与端侧成本需要单独评估。', '大型 ASR 基座可能带来更强 zero-shot 与上下文能力；经典 Transducer 往往在稳定流式、可控延迟和小设备上更容易形成工程闭环。'] },
          { title: '选型例子：同一个 CER，不同产品结论', callout: '候选 A 的离线 CER 为 6.8%，首字 1.4 秒且占用 3 GiB；候选 B 的 CER 为 7.1%，首字 180 ms、HWM 420 MiB、支持稳定流式。会议转写可能选 A，端侧对话更可能选 B。0.3 个点不是脱离约束的绝对胜负。' },
          { title: '怎样公平横评', paragraphs: ['先做受控主表：相同音频、normalizer、VAD、硬件和运行模式；再做能力上限附表，允许每个模型使用官方推荐 prompt 或解码配置。把两张表混在一起，会把系统配置差异误当成模型差异。'] }
        ],
        exercise: { title: '练习：做一张 ASR 选型 Scorecard', prompt: '针对“离线字幕”和“端侧语音助手”各选一次模型。至少比较精度、首字、RTF、HWM、流式、热词、长音频、语言覆盖和维护成本，并写淘汰理由。', checks: ['是否先设硬门槛再看总分', '是否分开 encoder 与训练目标', '是否同时保留受控对照和能力上限'] },
        questionIds: ['as-conformer', 'as-whisper', 'asr-architecture-compare', 'asr-new-backbones', 'asr-resume-backbone-audit', 'asr-resume-paraformer-cif']
      },
      {
        id: 'decoding-hotwords', number: 5, title: '解码与热词：怎样提召回又不让系统乱插词', duration: '55 分钟',
        goal: '理解 beam hypothesis、FSA/FST、context graph 和热词分数注入，能够设计增益与副作用并重的评测。',
        bridge: '架构给出 token 概率，但产品要的是最终文字。专有名词、重复 token 和语言约束都在解码层变成真实取舍。',
        sections: [
          { title: '解码器到底维护什么', paragraphs: ['CTC Prefix Beam 维护文字前缀及 blank/non-blank 概率；RNN-T Beam 还要维护 predictor state、时间位置和可能的 context state。合并相同前缀时必须正确累加概率，否则 beam 变大也不一定更准。', 'k2 用 FSA/FST 表示允许路径和权重，可把 token、词典、语言模型或上下文约束做图运算；它是工具与表示，不代表所有项目都必须构建传统大解码图。'] },
          { title: '热词 Context Graph 的状态机直觉', steps: ['把“张江人工智能岛”拆成 token 路径；解码前缀命中越多，累积奖励越高。', '完整命中后给完成奖励；中途偏离时撤销或衰减未完成奖励，避免只说“张”就长期偏置。', '不同热词共享前缀时复用图状态；session 结束必须释放动态热词状态。'] },
          { title: '数值例子：奖励太大会发生什么', callout: '声学候选“上海天气”得分 -4.0，“商海天气”得分 -4.6。若热词“商海”奖励 +1.2，后者变为 -3.4 并胜出；热词召回提高了，但普通句可能被错误改写。应扫描奖励并同时看热词 recall、非热词 CER 和误插入率。' },
          { title: '热词不是后处理字符串替换', paragraphs: ['后处理替换看不到声学竞争，容易把同音普通词全部改坏。更稳的做法是在 beam 扩展时加入受控上下文分数，并保留无热词基线、动态开关和回退配置。'] }
        ],
        exercise: { title: '练习：手画一个热词图', prompt: '选择两个有共享前缀的热词，画 token trie/context graph；设置进入、完成和失败回退分数，再设计一组热词句与非热词对照句。', checks: ['是否处理共享前缀和中途失败', '是否报告误插入而非只有召回', '是否能够关闭热词回到基线'] },
        questionIds: ['as-hotword', 'asr-resume-k2-fsa', 'asr-resume-rnnt-context-graph', 'ctc-prefix-beam']
      },
      {
        id: 'streaming-session', number: 6, title: '流式 ASR：Chunk、缓存、句尾和会话生命周期', duration: '65 分钟',
        goal: '画出麦克风到 partial/final 的实时数据流，区分算法延迟与系统延迟，并彻底解释句尾为什么会丢字。',
        bridge: '离线解码默认整段音频已知；实时产品却必须在未来音频尚未到达时输出结果，并正确处理断句、取消和最后半个 chunk。',
        sections: [
          { title: '完整实时链路', steps: ['音频回调写入有界 ring buffer；重采样与特征线程累积帧并形成 chunk。', 'Streaming encoder 读取当前 chunk 与左侧 cache；decoder 复用 predictor、beam 和热词状态，产生 partial。', 'VAD endpoint 或显式 finish 触发 drain、补齐尾帧、flush decoder、输出 final，最后释放 session state。'] },
          { title: '缓存不是把历史全部拼回输入', paragraphs: ['注意力保存有限左上下文的 key/value，卷积保存感受野需要的尾部状态，特征端还可能保留不足一窗的波形。若每次把全部历史重新编码，虽然结果可能正确，却失去了流式复杂度优势。', 'Cache 的 batch、层数、时间轴和维度必须和模型导出契约一致；跨 session 复用未清零状态会把上一个用户的声音带进下一句。'] },
          { title: '句尾丢字的具体机制', callout: '假设 chunk 是 16 帧，用户停止时只积累了最后 6 帧。如果 finish 直接结束，这 6 帧从未送进 encoder；即使送入 encoder，若没有 drain lookahead 和 flush beam，末尾 token 仍可能停留在候选状态。正确结束不是“关闭麦克风”，而是一串有顺序的状态迁移。' },
          { title: '延迟要沿时间线拆', paragraphs: ['端到端延迟包含采集等待、chunk 累积、特征、排队、encoder、decoder、endpoint 和 UI。只报 RTF 无法解释首字慢；只缩小 chunk 也可能因调用次数和上下文不足让吞吐与精度变差。'] }
        ],
        exercise: { title: '练习：画 session 状态机', prompt: '画 Idle → Streaming → Draining → Finalized/Cancelled；为 finish、cancel、超时和设备断开分别写动作，并给每段链路分配延迟预算。', checks: ['最后不足一个 chunk 是否处理', 'drain 与 flush 是否分开说明', '不同 session 的缓存是否隔离并最终释放'] },
        questionIds: ['streaming-cache', 'as-streaming-asr', 'asr-streaming']
      },
      {
        id: 'data-governance', number: 7, title: '数据与训练流水线：伪标签不是自动真值', duration: '55 分钟',
        goal: '把 manifest、采样、标签审计、候选重标注和回灌验证连成可复现的数据闭环。',
        bridge: '模型和流式系统都理解后，最大的剩余变量往往不是结构，而是音频、标签、采样比例和训练版本是否可信。',
        sections: [
          { title: 'icefall 与 Lhotse 分别解决什么', paragraphs: ['Lhotse 用 Recording、Supervision、Cut 和 CutSet 描述音频、标注与切片，负责可追踪的数据准备、过滤、增强和动态 batching；icefall 在其上组织 k2/Transducer 等训练 recipe。', '能跑一个 recipe 不等于数据可复现。训练 manifest、过滤规则、特征配置、tokenizer、采样器和 checkpoint 必须一起版本化。'] },
          { title: '三个容易混淆的概念', steps: ['标签修复：人工或规则确认原标签错误后纠正。', '伪标签：教师模型产生候选转写，尚不是人工真值，需要筛选。', '自训练：把筛选后的伪标签加入训练并验证是否提升；它描述训练闭环，不只是生成一次文字。'] },
          { title: '个人案例怎样讲得既具体又不过界', paragraphs: ['简历支持的事实是：从西语 10k 抽样中确认 8.2% 真实标签噪声，并用 Qwen3-ASR 候选、置信度/一致性、抽样复听和回灌训练控制质量。', '这不等于做过专门的概率校准模型，也不能说 Qwen3-ASR 输出就是正确答案。最强证据不是“模型置信度很高”，而是独立验证集和高风险切片在回灌后稳定改善。'] },
          { title: '筛选例子', callout: '原标签与教师模型不同的 1000 条样本中，先按置信度与差异类型分桶，每桶随机复听；只对误差率可接受的桶进入候选训练。若新标签训练后总体 CER 降低、罕见口音却退化，仍不能宣布全量替换成功。' }
        ],
        exercise: { title: '练习：设计一次安全重标注', prompt: '写出旧标签、教师输出、人工复听和回灌训练四张表的主键与版本；定义哪些样本自动保留、哪些复听、哪些拒绝，并给出停止条件。', checks: ['是否能追溯每条标签来源', '是否用独立验证集判断价值', '是否明确教师和原标签可能同时错误'] },
        questionIds: ['asr-pseudo-label', 'asr-resume-label-noise-audit', 'asr-resume-confidence-calibration', 'asr-resume-icefall-lhotse']
      },
      {
        id: 'robust-adaptation', number: 8, title: '鲁棒与多域适配：新场景提升，旧能力不能悄悄丢', duration: '65 分钟',
        goal: '把真实信道、多域采样、多语种共享和 LID 辅助任务放入同一实验框架，能够定位正收益与负收益。',
        bridge: '数据可追溯之后，才能判断提升究竟来自更接近真实链路的数据、域配比、辅助任务，还是评分口径变化。',
        sections: [
          { title: '先还原信号链，再堆增强', paragraphs: ['真实语音可能依次经过房间混响、设备频响、编解码、AGC、重采样和丢包。随机加噪若没有覆盖主要失真，训练更久也无法迁移。', 'RIR 卷积模拟声源到麦克风的多径响应；但 RIR 库、SNR、codec 和增益分布必须接近目标设备，并用 clean、synthetic、real 三套测试判断是否只学会了合成伪影。'] },
          { title: '新域适配是一道双目标题', steps: ['保存新域、通用旧域和高风险难例三套验证集。', '扫描新域与 replay 配比、学习率或冻结策略，寻找新域收益和旧域回归之间的 Pareto 点。', '发布条件同时约束新域达标、旧域不退和最差切片稳定。个人经历中的约 10% 通用 replay 与两域 CER 是可引用证据。'] },
          { title: '多语种共享与 LID 的利弊', paragraphs: ['共享 encoder 能让低资源语种借力，但高资源语种会主导梯度；汇总指标必须按语种分别报告，再说明 macro、micro 或业务加权方式。', 'LID 辅助 loss 可能帮助模型形成语言边界，也可能把混说样本强行分开或与 ASR 梯度冲突。看到关闭 LID 后恢复，只能先说“它与退化相关”；要证明梯度冲突，还需梯度相似度或更直接实验。'] },
          { title: '负收益定位例子', callout: 'ChinaVoices 实验下降时，依次冻结文字 normalizer、数据采样、主模型、LID loss、解码和评分脚本。若统一正字法后差距缩小、关闭 LID 后进一步恢复，就能把“模型不行”拆成口径问题与辅助任务问题，而不是一次改五项后只看最终数字。' }
        ],
        exercise: { title: '练习：做一个 2×3 鲁棒实验矩阵', prompt: '选择“真实信道增强”或“新域+通用 replay”，设计两个训练因素和三个评测域；写出单因素、组合、最差切片和阻断发布条件。', checks: ['是否保留 clean/旧域回归集', '是否区分相关性与因果证据', '多语种结果是否避免只报加权平均'] },
        questionIds: ['asr-channel-robustness', 'asr-domain-adaptation', 'asr-lid', 'asr-multilingual', 'asr-resume-rir-signal-chain', 'asr-resume-domain-mixture', 'asr-resume-error-attribution', 'asr-chinavoices']
      },
      {
        id: 'evaluation-delivery', number: 9, title: '评测与交付：从一个 CER 到可放行的系统结论', duration: '60 分钟',
        goal: '建立逐样本、切片、显著性、性能和失败率组成的放行报告，并把九章知识压成可追问的 ASR 方案。',
        bridge: '最后不能用“平均 CER 更低”替代上线结论；需要证明差异稳定、关键人群不退、实时链路满足预算且失败可回退。',
        sections: [
          { title: '一张完整评测表至少有四层', steps: ['总体：CER/WER、插入/删除/替换，以及 reference 字数或词数。', '切片：语种、口音、信道、噪声、时长、数字实体、热词、混说和设备。', '统计：保存逐样本错误，做 paired bootstrap 或置信区间，判断差异是否稳定。', '系统：首字/末字、p50/p99、RTF、HWM、失败率、句尾丢字和回退成功率。'] },
          { title: '配对 Bootstrap 为什么按样本一起抽', paragraphs: ['比较 A/B 时，同一条音频的难度必须共同保留。每次从样本索引有放回抽取一组，分别汇总 A 与 B 的错误率并记录差值；重复多次得到差值分布。若独立抽 A 和 B，会把样本难度差异引入比较。', '统计显著不等于业务重要。0.02 个 CER 点可能稳定但没有产品价值；数字实体错误减少 20% 即使总体变化小，也可能很关键。'] },
          { title: '放行例子', callout: '候选模型总体 CER 8.10%→7.92%，95% 配对区间完全低于 0；但句尾删除率从 0.7% 升到 1.8%，端侧 p99 超预算。结论应是“离线质量有稳定收益，但暂不流式放行”，并回到第 6 章定位 finalize 与延迟链路。' },
          { title: '怎样回答最终选型', paragraphs: ['最终答辩应从产品约束出发，再依次解释文字契约、架构、解码、流式状态、数据、切片与回退。个人横评项目可以作为真实证据；课程中新增的系统设计细节若没有当时记录，应明确说是现在的完整方案。'] }
        ],
        exercise: { title: '结课前演练：写一页 Release Decision', prompt: '为两个 ASR 候选写“放行 / 条件放行 / 不放行”结论，附总体、五个切片、paired bootstrap、首字/p99/HWM、已知风险和回退版本。', checks: ['统计差异是否按逐样本配对', '是否存在可阻断平均收益的关键切片', '结论是否能回溯到模型、数据和运行版本', '是否明确哪些来自真实项目'] },
        questionIds: ['asr-eval-metrics', 'asr-resume-paired-bootstrap', 'asr-resume-backbone-audit', 'asr-architecture-compare']
      }
    ]
  },
  {
    id: 'tts-from-text-to-streaming-speech',
    trackId: 'speech', order: 3, primaryCategories: ['语音合成'], prerequisiteIds: [],
    title: 'TTS：从文字到可交付语音',
    eyebrow: 'COURSE 03 · TEXT TO EXPRESSIVE SPEECH',
    summary: '沿一条完整合成链路学习 TTS：文本规范化 → G2P 与韵律 → 对齐和时长 → 声学模型 → 声码器 → 多语种与音色 → 流式部署 → 听测放行。',
    outcome: '完成后，你应能解释一句文字如何变成波形，比较 Tacotron、FastSpeech、VITS、MeloTTS 与 Matcha-TTS，并设计支持中英混读、方言音色和端侧流式的可评测系统。',
    audience: '适合语音合成算法面、生成模型原理面、端侧部署面，以及围绕个人中文、英文、中英混读与方言 TTS 项目的深挖答辩。',
    capstone: {
      title: '结课设计：交付一套中英混读、三种方言音色的流式 TTS',
      prompt: '为端侧语音助手设计一套 TTS：输入包含数字、日期、多音字和中英混读，要求三种方言音色、可取消、低首包延迟。请用 10 分钟讲清前端仲裁、音素与韵律表示、声学模型和声码器选型、流式状态、设备验收、主客观评测和回退方案。涉及个人经历时，只把标为“简历明确经历”的内容说成做过。',
      checklist: ['能追踪一句文本从原文到波形的全部中间表示', '能区分读音错误、时长对齐错误与声码器伪影', '架构选型同时考虑自然度、稳定性、首包与端侧成本', '中英混读说明语言跨度、音素冲突和数据分布', '小数据音色微调防止学到信道与文本偏差', '流式接口包含 backpressure、cancel 和资源释放', 'MOS/CMOS/ABX 与自动门禁各司其职', '真实项目事实和课程补充方案边界清楚']
    },
    chapters: [
      {
        id: 'tts-contract', number: 1, title: '先看全链路：一句文字怎样变成波形', duration: '45 分钟',
        goal: '建立文本、音素、韵律、时长、Mel 频谱和波形的共同坐标系，知道每个模块负责什么、错误会听成什么。',
        bridge: '如果不知道错误产生在哪一层，后面无论换模型还是调损失，都容易把前端读错、声学对齐和声码器伪影混在一起。',
        sections: [
          { title: '经典两阶段链路', steps: ['文本前端把原文规范成可读文本，再生成音素、声调、语言和韵律边界。', '声学模型把离散符号与控制条件展开成带时间轴的 Mel 频谱或其他声学表示。', '声码器把 Mel 等条件转换为波形；播放层再处理分块、缓冲、取消和设备采样率。'] },
          { title: '中间表示是一份调试接口', paragraphs: ['“声音不好”太笼统。先听或检查规范化文本，再看音素与多音字，再看时长/对齐和 Mel，最后单独检查声码器。每一层都保存版本化中间产物，才能做最小归因。', '端到端模型可能把多个模块联合训练，但概念上的职责仍然存在：它依然要决定读什么、读多久、以什么音高能量说，并生成可播放波形。'] },
          { title: '贯穿例子：2026 年 8 月 13 日读什么', callout: '原文“会议定在 2026/8/13 10:30，地点 Bank A”先被 TN 展开为日期和时间；G2P 决定中文数字读法及 Bank 的英语音素；韵律模块决定停顿；时长模块把音素展开到帧；声码器才负责把 Mel 变成声音。若把日期读成逐位数字，换 HiFi-GAN 不会修好。' },
          { title: '先写产品契约', paragraphs: ['输入是否允许 SSML、emoji、缩写和混合语言，输出采样率、响度、首包、实时率、最大文本长度和取消语义，都应在选模型前确定。否则模型“效果好”没有共同标准。'] }
        ],
        exercise: { title: '练习：画一条可观测 TTS 链路', prompt: '选一句含日期、多音字和英文的文本，写出原文、TN 结果、音素、韵律边界、预测时长、Mel 和波形七层产物，并为每层列一个典型故障。', checks: ['每个错误是否能归到明确模块', '是否保留原始文本和中间产物', '质量、延迟与接口契约是否同时定义'] },
        questionIds: ['tts-matcha-melo', 'tts-frontend-prosody', 'tts-vocoder']
      },
      {
        id: 'frontend-g2p', number: 2, title: '文本前端：TN、G2P、多音字与韵律怎样仲裁', duration: '65 分钟',
        goal: '从规则、词典、上下文模型和置信回退构建可解释前端，并能处理中文长尾读音与中英混合边界。',
        bridge: '全链路中最早发生的离散错误会一路放大；声学模型通常无法把错误音素自动纠正成正确读音。',
        sections: [
          { title: 'TN 不是简单替换', paragraphs: ['数字可能是日期、金额、电话、编号或小数，同一串字符读法不同。稳健 TN 通常用高精度规则覆盖确定场景，用分类或序列模型处理歧义，再为未知格式保留安全回退。', '规则负责可解释与强约束，模型负责上下文泛化。冲突时应记录命中的规则、模型版本和最终仲裁结果，便于回放。'] },
          { title: 'G2P 的三层仲裁', steps: ['词典优先处理已确认专名和固定词组。', '上下文模型判断多音字与未登录词，并输出读音及置信信息。', '低置信、规则冲突或高风险词组进入回退、白名单或人工修订；不能把模型 top-1 永远当真。'] },
          { title: '具体例子：“银行行长走了一行字”', callout: '四个“行”分别依赖词组和句法上下文：银行 háng、行长 háng、走 xíng、一行 háng。逐字词典无法解决；只看单个邻字也可能失败。调试时先看分词与上下文窗口，再看 G2P 输出，最后才听合成音频。' },
          { title: '韵律标签解决“哪里停、哪里重”', paragraphs: ['音素正确不代表自然。词边界、短语边界、句调、重音和语速会改变时长与 F0。个人项目中把读音/韵律标签从 8 类扩到 18 类属于真实经历；新增标签的价值必须通过切片和听测证明，而不是类别更多就一定更好。'] }
        ],
        exercise: { title: '练习：建立 20 句前端挑战集', prompt: '覆盖日期、金额、电话、单位、多音字、英文缩写和中英边界；逐句写期望 TN、音素和韵律，并给低置信样本规定回退行为。', checks: ['规则与模型的优先级是否明确', '挑战集是否包含真实长尾而非随机句', '新增标签是否有独立收益证据'] },
        questionIds: ['tts-g2p', 'tts-frontend-prosody', 'tts-patent', 'tts-resume-text-normalization', 'tts-resume-g2pw-calibration', 'tts-resume-tone-prosody']
      },
      {
        id: 'alignment-duration', number: 3, title: '对齐与时长：模型怎样知道每个音素说多久', duration: '60 分钟',
        goal: '理解注意力对齐、显式 duration、length regulator 与 variance adaptor，能从对齐图定位漏字、重复和节奏异常。',
        bridge: '前端确定了“读什么”，声学模型还必须把 U 个音素展开成 T 帧声学序列；这是 TTS 最核心的长度不匹配问题。',
        sections: [
          { title: 'Tacotron 的隐式注意力', paragraphs: ['自回归 decoder 逐帧生成 Mel，并用 attention 决定当前读到哪个输入 token。它能学习灵活对齐，却可能在长句、重复文本或域外输入上跳步、回退，表现为漏字、重复或停不下来。', '对齐矩阵理想上接近单调对角线；出现竖直停滞、水平跳跃或多头混乱时，应先查 attention，而不是只调声码器。'] },
          { title: 'FastSpeech 的显式展开', steps: ['Duration predictor 为每个音素预测帧数。', 'Length regulator 按时长重复音素表示，把 U 个 token 展开为约 T 帧。', 'Variance adaptor 注入 F0、energy、duration 等变化，使非自回归并行生成仍有韵律控制。'] },
          { title: '手算例子：三个音素怎样变成六帧', callout: '音素 /n i h/ 的预测时长为 [2, 1, 3]，length regulator 输出 [n,n,i,h,h,h] 共 6 帧。若四舍五入后得到 [1,0,3]，/i/ 会消失；因此训练目标、最小时长约束和总长度修正都会直接影响可懂度。' },
          { title: '时长、音高和能量要分别看', paragraphs: ['语速过快可能是 duration 偏短；机器人腔可能是 F0/energy 方差不足；局部拖音也可能来自错误韵律边界。把它们压成一个“自然度 loss”会失去定位能力。'] }
        ],
        exercise: { title: '练习：手推 Length Regulator', prompt: '给 5 个音素设置浮点时长，完成取整、最小时长保护和总帧数校正；再画一个含漏字和重复的注意力对齐图并说明诊断。', checks: ['展开后的总帧数是否可核对', '是否能从对齐图区分跳步与停滞', '是否分别检查 duration、F0 和 energy'] },
        questionIds: ['tts-tacotron', 'tts-fastspeech', 'tts-phoneme-prosody']
      },
      {
        id: 'acoustic-models', number: 4, title: '声学模型：VITS、MeloTTS 与 Matcha-TTS 怎么选', duration: '70 分钟',
        goal: '拆开训练路径和推理路径，理解 VAE/GAN/flow、条件 Flow Matching 与不同模型族的工程取舍。',
        bridge: '理解显式和隐式对齐后，才能看懂现代模型把时长、潜变量、生成路径和声码器怎样重新组合。',
        sections: [
          { title: 'VITS 训练和推理不是同一条路', paragraphs: ['训练时 posterior encoder 从真实音频获得潜变量，normalizing flow 对齐先验与后验，并用 duration、重建、KL、对抗和 feature matching 等目标联合优化；推理时没有真实音频，只能从文本先验采样，再经 flow 逆变换和 decoder 生成波形。', '如果面试只背一串 loss，却解释不了真实音频为何只在训练出现，就没有理解 VITS 的生成闭环。MeloTTS 可以使用 VITS 系路线，但它还包含多语种前端、说话人和工程配置，不能和 Matcha 画成同一个模型。'] },
          { title: 'Matcha-TTS 的条件 Flow Matching', paragraphs: ['Matcha 学习一个随时间变化的速度场，把简单基分布沿 ODE 轨迹运到目标 Mel 分布；训练可在随机时间点回归目标向量场，推理用若干 ODE 步积分。', '步数更少通常更快，但离散误差可能增大。它输出的是 Mel，仍需独立声码器；这与 VITS 联合生成波形的系统边界不同。'] },
          { title: '直觉例子：生成路径像怎样导航', callout: '把噪声看作城市 A、真实 Mel 看作城市 B。扩散常学习每一步怎样去噪；Flow Matching 直接学习任意时刻该往哪个方向走。推理用 4 步还是 16 步，就像用更粗或更细的路标积分：速度和质量需要实测，不能只说“flow 更快”。' },
          { title: '稳定性要按层归因', paragraphs: ['训练 loss NaN 先查数值、数据和优化器；对齐崩坏查时长/attention/MAS；推理爆音查声学条件范围和声码器；只在长句失败则查位置、长度分布和内存。一次同时改学习率、数据和解码无法形成结论。'] }
        ],
        exercise: { title: '练习：画两张训练/推理图', prompt: '分别画 VITS 与 Matcha 的训练和推理数据流，标出真实音频只在哪条路径出现；再为端侧低延迟和离线高自然度各做一次选型。', checks: ['是否区分 posterior 与 prior', '是否说明 Matcha 后面仍需声码器', '稳定性问题是否按训练、对齐和推理分层'] },
        questionIds: ['tts-vits', 'tts-matcha-melo', 'tts-resume-vits-melo-loss', 'tts-resume-matcha-cfm', 'tts-stability']
      },
      {
        id: 'vocoder', number: 5, title: '声码器：Mel 正确，为什么波形仍会有伪影', duration: '55 分钟',
        goal: '理解 HiFi-GAN 生成器、MPD/MSD 与 feature matching，并建立条件一致性、频谱和听感相结合的声码器验收。',
        bridge: '声学模型生成的是声学条件，不是最终声音；最后一步可以让清楚的 Mel 变得自然，也可以引入金属感、嗡声和断裂。',
        sections: [
          { title: 'HiFi-GAN 三类角色', steps: ['Generator 用转置卷积和多感受野残差块把低时间分辨率 Mel 上采样为波形。', 'MPD 按多个周期重排波形，敏感于基频、谐波与周期结构。', 'MSD 在多个时间尺度看原始和下采样波形，约束整体频谱与局部细节；feature matching 稳定生成器训练。'] },
          { title: '声码器最怕条件分布错位', paragraphs: ['用真实 Mel 训练、用预测 Mel 推理时，声学模型的平滑、范围和归一化偏差会造成 train-test mismatch。单独在 ground-truth Mel 上听起来很好，不能证明整链路可用。', '采样率、hop length、n_fft、Mel 上下限和 log/归一化必须逐项匹配；任何一个不一致都可能造成严重伪影。'] },
          { title: '倍率例子：上采样必须对齐 hop length', callout: '若 Mel 每帧对应 256 个波形采样点，生成器各层上采样倍率 [8,8,2,2] 的乘积正好是 256。若错误导出成 [8,8,2]，每帧只生成 128 点，时长和音高都会异常；这不是“模型泛化差”。' },
          { title: '怎样定位伪影', paragraphs: ['先用同一声码器比较真实 Mel 与预测 Mel：前者也坏，优先查声码器与配置；只有后者坏，优先查声学条件分布。再结合频谱、F0、响度、削波率和听测，不用单个 loss 替代耳朵。'] }
        ],
        exercise: { title: '练习：做一次 Vocoder Swap Test', prompt: '准备真实 Mel、基线预测 Mel、候选预测 Mel，并分别送入同一声码器；再把同一 Mel 送入两个声码器，形成最小 2×3 对照。', checks: ['特征配置是否逐项一致', '是否能分离声学模型和声码器责任', '自动指标是否有对应听感样本'] },
        questionIds: ['tts-hifigan', 'tts-vocoder']
      },
      {
        id: 'speaker-language-style', number: 6, title: '音色、语言与情感：多个控制条件怎样不串扰', duration: '65 分钟',
        goal: '理解 speaker/language/style 条件注入、小数据方言微调和中英音素冲突，并能设计覆盖交叉组合的训练与评测。',
        bridge: '单一普通话说话人跑通后，真实产品会同时要求“谁在说、说哪种语言、以什么情绪说”，这些因素很容易被数据偏差纠缠。',
        sections: [
          { title: '中英混读不是拼两个词典', paragraphs: ['语言跨度决定哪个音素表和前端规则生效；共享 IPA 能复用发音结构，但同一符号在不同语言中的实现仍可能不同；语言专属音素更可控，却增加稀疏和切换成本。', '训练数据若只有中文说话人讲中文、英文说话人讲英文，模型会把语言与音色绑定。需要 code-switch、跨语言同说话人或显式 language/speaker 条件打破相关性。'] },
          { title: '小数据音色微调的三个风险', steps: ['信道泄漏：模型学到录音棚、麦克风或底噪，而不是音色。', '文本覆盖偏差：数据只含有限音素和韵律，域外文本发音不稳。', '灾难性遗忘：只优化新说话人后，基础语言能力或其他音色退化。'] },
          { title: '具体例子：数据相关性怎样造成串扰', callout: '若快乐数据全是英语、悲伤数据全是中文，模型收到 emotion=happy 时可能同时提高英语概率。应构造 language × speaker × emotion 的交叉评测格，至少保留反事实组合，不能只在训练中出现过的组合上听。' },
          { title: '个人经历的可信边界', paragraphs: ['简历明确支持中文、英文和中英混读 TTS 交付，以及三种方言声线微调；具体 embedding 位置、复杂 disentanglement loss 或正式情感控制流程若没有记录，只能作为现在的设计方案。'] }
        ],
        exercise: { title: '练习：画一个 3×2×3 条件矩阵', prompt: '用三种音色、两种语言和三种情感设计训练覆盖与评测覆盖；标出缺失组合、补数策略和不能声称做过的部分。', checks: ['语言与说话人是否被数据绑定', '小数据集是否控制信道和文本覆盖', '评测是否包含未见组合与基础能力回归'] },
        questionIds: ['tts-codeswitch', 'tts-dialect-finetune', 'tts-emotion', 'tts-multilingual-emotion', 'tts-resume-codeswitch-phoneme', 'tts-resume-small-speaker-finetune']
      },
      {
        id: 'streaming-deployment', number: 7, title: '流式与端侧交付：首包快不等于播得稳', duration: '65 分钟',
        goal: '把模型分块、声码器边界、播放缓冲、backpressure、cancel 和 sherpa-onnx 资产组织成完整交付协议。',
        bridge: '离线生成一段 wav 只证明模型能跑；实时交互还要处理生产速度、消费速度、块边界和中途取消。',
        sections: [
          { title: '流式链路的三个时钟', steps: ['文本/声学模型何时产生第一批稳定帧。', '声码器何时把 Mel chunk 转成可播放波形，以及相邻 chunk 是否有足够上下文。', '播放器何时积累到安全水位并开始消费，生产慢于消费时怎样避免 underrun。'] },
          { title: '边界连续性不能靠简单拼接', paragraphs: ['卷积声码器在 chunk 边界需要上下文或 overlap；独立生成后硬拼可能出现爆点、相位不连续和韵律断裂。可以保留状态、重叠裁剪/cross-fade，或使用模型原生流式结构，但都要测额外延迟。', '取消请求后，应停止后续声学/声码器任务、清空待播 buffer、释放 session，并防止旧 chunk 在新请求开始后继续播放。'] },
          { title: '时间线例子：为什么首包 120 ms 仍会卡', callout: '模型 120 ms 产出首个 200 ms 音频块，看似首包很好；但之后每个 200 ms 块要 240 ms 才生成，播放每块都会欠 40 ms，最终周期性断音。除了 TTFA，还要看稳态 RTF、buffer 水位和长文本 p99。' },
          { title: 'sherpa-onnx 交付先匹配模型族', paragraphs: ['交付包至少包含模型、tokens、前端/G2P 配置、说话人或语言参数、采样率和版本清单。先确认导出图与 runtime 支持的模型族、动态 shape 和算子，再谈 INT8；量化若只让包变小却破坏韵律或无法执行，没有交付价值。'] }
        ],
        exercise: { title: '练习：设计一个可取消的流式 API', prompt: '写 start(text, controls)、pull/push chunk、finish、cancel 和 error 的状态机；给文本前端、声学、声码器、队列、播放分配 p50/p99 预算。', checks: ['首包和稳态生产速度是否分别测量', 'chunk 边界是否有连续性方案', 'cancel 后是否停止计算、清空播放并释放状态'] },
        questionIds: ['tts-streaming', 'tts-onnx-deploy']
      },
      {
        id: 'evaluation-release', number: 8, title: '评测与放行：自动指标、听测和生成式新路线', duration: '65 分钟',
        goal: '用前端正确率、可懂度、自然度、相似度、韵律、性能和稳定性组成放行证据，并理解 Codec LM TTS 的新变量。',
        bridge: '最终用户听到的是整条链路；单个 loss 或几条好样例不能证明读音正确、自然、像目标说话人且能稳定实时运行。',
        sections: [
          { title: '不同听测回答不同问题', steps: ['MOS 让听者对单条样本的自然度等绝对维度打分，适合描述水平但受量表与听者偏差影响。', 'CMOS 直接比较候选与基线的相对偏好，适合小版本差异；顺序必须随机。', 'ABX 给出 A/B 参考和 X，常用于判断音色或属性更接近谁；它不是自然度评分。'] },
          { title: '自动门禁负责广度，听测负责感知', paragraphs: ['前端挑战集检查 TN/G2P；ASR 回识别近似检查可懂度；speaker embedding 相似度辅助看音色；F0、duration、energy 与停顿看韵律；削波、静音、NaN、时长比和延迟检测工程失败。', '这些代理指标都可能被钻空子，必须保留盲听、随机化、足够样本和置信区间。简历没有明确正式 MOS 实施证据时，应把标准听测流程说成通用方法。'] },
          { title: '数值例子：平均 MOS 为什么会骗人', callout: 'A 的 MOS 4.1、B 为 4.0，但 95% 区间大量重叠；同时 B 的多音字错误从 3% 降到 1%。正确结论不是简单宣布 A 胜出，而是自然度差异尚不确定、B 在关键读音切片有明确价值，再结合业务权重决策。' },
          { title: 'Codec LM TTS 改变了什么', paragraphs: ['语音 tokenizer 把波形压成离散 codec token，语言模型学习文本/语义条件下的 token 序列，decoder 再还原波形。Tokenizer 决定信息瓶颈，不等于生成器；码率、层级码本、长序列成本和说话人/内容泄漏都是新取舍。', '无论路线多新，仍要回到同一放行框架：读对、自然、像、可控、快、稳，并能定位失败。'] }
        ],
        exercise: { title: '结课前演练：设计一轮盲测与 Release Gate', prompt: '比较基线和候选 TTS：写 100 句分层样本、MOS/CMOS 或 ABX 任务、随机化方式、自动指标、性能预算、显著性判断和阻断条件。', checks: ['每个指标是否回答明确问题', '听测是否盲化、随机并报告不确定性', '是否包含长尾前端、音色、韵律和端侧稳定性', '结论是否区分真实项目与通用方法'] },
        questionIds: ['tts-eval', 'tts-eval-prosody', 'tts-resume-listening-test', 'tts-llm-tts']
      }
    ]
  },
  {
    id: 'speech-llm-from-representation-to-duplex',
    trackId: 'speech', order: 4, primaryCategories: ['语音大模型'], prerequisiteIds: ['asr-from-audio-to-delivery', 'tts-from-text-to-streaming-speech', 'transformer-long-context'],
    title: '语音大模型：从表示到实时双工',
    eyebrow: 'COURSE 04 · SPEECH TOKENS TO REAL-TIME DIALOGUE',
    summary: '在 ASR 与 TTS 基础上学习语音大模型：系统契约 → 连续/离散表示 → 语义与声学 Token → Thinker–Talker → 分阶段训练 → 流式双工 → 分层评测。',
    outcome: '完成后，你应能画出级联与端到端语音助手，计算 Adapter/Token 压缩带来的序列成本，解释 RVQ 与 Thinker–Talker，并设计支持打断、回声控制和安全降级的实时系统。',
    audience: '适合多模态大模型面试、语音交互系统设计和前沿技术补课；当前课程内容不默认代表已经在个人项目中完整落地过 Speech LLM。',
    capstone: {
      title: '结课设计：可打断、可降级的实时语音助手',
      prompt: '设计一套支持中英语音输入、边想边说、用户随时打断的语音助手。请在 12 分钟内说明：级联与端到端边界、输入/输出表示、压缩率、语义/声学 Token、Thinker–Talker 同步、训练阶段、全双工状态机、分层 Judge、超时和安全降级。明确说明这是课程系统设计，不把未有履历证据的部分说成个人落地经历。',
      checklist: ['输入、内部事件和输出接口可版本化', '压缩率同时考虑信息保真和上下文成本', '语义 Token 与声学 Token 有可证伪的解耦实验', 'Thinker 与 Talker 不会在语义未确认时提前承诺', '训练阶段有冻结、混合回放与能力回归', '打断状态机处理 VAD、回声、取消和残留音频', '质量、延迟、轮次和安全分别评测', '端到端失败时能够退回 ASR→LLM→TTS']
    },
    chapters: [
      {
        id: 'speech-system-contract', number: 1, title: '先画系统：级联语音助手与端到端模型差在哪里', duration: '50 分钟',
        goal: '建立音频输入、内部表示、语言推理、语音输出与延迟预算的完整接口，理解端到端并不等于没有模块边界。',
        bridge: 'ASR 和 TTS 已分别解决听与说；语音大模型真正新增的是跨模态表示、联合推理和实时交互怎样形成闭环。',
        sections: [
          { title: '两条基本路线', steps: ['级联：Audio → ASR 文本 → LLM → TTS。模块成熟、可观测、易替换，但丢失部分副语言信息，并叠加多个模块延迟。', '端到端/原生语音：Audio Encoder 或 speech token 进入语言模型，再直接产生文本、语义 token 或声学 token。表达力更强，但训练、对齐和故障定位更难。', '混合路线：内部保留文本计划和结构化事件，输出侧使用语音 token；必要时可降级到成熟的 ASR/TTS。'] },
          { title: '接口契约比模型名字更重要', paragraphs: ['输入需要采样率、声道、chunk、时间戳和 session；内部事件至少区分 partial transcript、turn state、tool call、text plan 与 speech chunk；输出要定义顺序、取消、重试和版本。', '如果模型能同时输出文本与语音，它们必须共享 request/turn ID，并说明哪个是事实来源。否则文本显示“北京”，语音说“上海”时无法判责。'] },
          { title: '延迟例子：四个 200 ms 不是 800 ms', callout: 'ASR 首字 200 ms、LLM 首 token 200 ms、TTS 首包 200 ms、播放器缓冲 200 ms，串行执行至少约 800 ms；若流式重叠，LLM 可在稳定 partial 后启动、TTS 可在短语确认后启动，总首声可能降低，但错误 partial 会造成说错后撤不回来。延迟优化必须同时写出承诺时点。' },
          { title: '先保留可降级边界', paragraphs: ['端到端模型超时、输出不可解析或安全策略不确定时，可以退回 ASR→LLM→TTS；但降级会改变音色、上下文和延迟，必须作为真实路径测试，而不是架构图上的虚线。'] }
        ],
        exercise: { title: '练习：画两条可观测链路', prompt: '分别画级联与端到端语音助手，标出每个中间产物、首包时间点、可取消点和降级入口；为两条路线各写三个失败模式。', checks: ['文本与语音是否使用同一轮次身份', '是否区分计算完成和对外承诺', '降级链路是否真的具有完整资产'] },
        questionIds: ['speech-llm-pipeline', 'slm-pipeline']
      },
      {
        id: 'speech-representation', number: 2, title: '连续还是离散：语音怎样进入语言模型', duration: '65 分钟',
        goal: '理解 Audio Encoder、Adapter、连续表示和离散 Token 的信息与序列成本，能够用任务实验选择表示而不是凭潮流。',
        bridge: '系统接口确定后，第一个模型问题是：几十秒高频音频怎样压缩成语言模型能承受、又不丢关键信息的序列。',
        sections: [
          { title: '连续表示保留什么', paragraphs: ['Audio Encoder 将波形/log-Mel 编码成连续帧，Adapter 再投影到 LLM 维度并做下采样。它保留细腻声学信息、适合理解任务，但长序列昂贵，也缺少可直接生成和传输的离散词表。', 'Adapter 不只是线性层：卷积下采样、pooling、Q-Former 或 CTC/attention 压缩都会改变时间分辨率和信息瓶颈。'] },
          { title: '离散表示带来什么', paragraphs: ['Codec 或语义 tokenizer 把语音量化成有限 ID，可直接交给 Transformer 建模、生成和缓存；代价是量化误差、长 token 序列和码本可能混入说话人、信道等非目标因素。', '选择连续或离散应看任务：纯理解可偏连续；需要语音续写、生成和统一自回归接口时，离散更自然；混合方案也常见。'] },
          { title: '压缩率手算', callout: '10 秒音频若 encoder 每 20 ms 输出一帧，共 500 帧。Adapter 4× 下采样后是 125 个向量；若 codec 是 50 Hz、8 个码本交错成 token，则可能是 4000 个 token。前者上下文更省，后者能承载可重建声学细节。不能只说“离散更像文字”。' },
          { title: '用消融选择压缩率', steps: ['固定 encoder 与 LLM，只改变 Adapter 压缩率。', '分别评测转写、语义理解、情绪/说话人等副语言任务和端到端延迟。', '检查短词、数字、低信噪比和快速语速，因为平均任务分数可能掩盖局部信息被压没。'] }
        ],
        exercise: { title: '练习：计算上下文账单', prompt: '对 30 秒音频分别计算 50 Hz 连续帧、4×/8× Adapter，以及 25/50/75 Hz codec token 的序列长度；再为 ASR、情绪识别和语音回复选择表示。', checks: ['是否同时计算序列长度和信息损失', '比较时 encoder/LLM 是否保持不变', '是否包含局部高风险切片'] },
        questionIds: ['audio-encoder-adapter', 'continuous-vs-discrete-speech', 'slm-audio-encoder-adapter', 'slm-continuous-discrete']
      },
      {
        id: 'speech-tokenization', number: 3, title: '语音 Token：RVQ、语义层与声学层怎样分工', duration: '65 分钟',
        goal: '理解残差向量量化、多码本码率和语义/声学分层，并能设计真正检验解耦的实验。',
        bridge: '选了离散路线还不够：一个 token 序列很难同时以低码率表达内容，又无损保留音色、韵律和细节。',
        sections: [
          { title: 'RVQ 是逐层量化残差', steps: ['第一层码本选择最接近输入向量的 code，捕捉主要结构。', '计算输入减去已选 code 的残差，第二层再量化残差；重复 K 层。', '解码时把各层 code embedding 相加重建。层数越多通常失真越小，但码率、序列或并行 head 成本增加。'] },
          { title: '码率手算', callout: '若帧率 50 Hz，每帧使用 8 个码本，每个码本 1024 个 code，需要 10 bit；理论码率约 50×8×10 = 4000 bit/s。只用前 2 层约 1000 bit/s，可能保留内容和粗韵律，却损失高频细节。实际封装还有额外开销。' },
          { title: '语义 Token 与声学 Token 的直觉', paragraphs: ['语义 token 应主要表达“说了什么”，在说话人、信道或音高变化下尽量稳定；声学 token 补充“谁、怎样说”和重建细节。层级生成可以先规划低码率语义，再条件生成高码率声学层。', '这只是目标，不是天然成立。若语义 token 能轻易识别说话人，或更换声学 token 后文字内容改变，就说明解耦不充分。'] },
          { title: '怎样证伪解耦', steps: ['Probe：分别从语义/声学 token 预测文本、说话人、F0 和信道。', 'Swap：固定语义 token，替换声学 token，检查内容是否保持、音色是否改变。', 'Ablation：丢弃后几层码本，比较可懂度、相似度和重建质量曲线。'] }
        ],
        exercise: { title: '练习：设计一次 Token Swap', prompt: '准备两句内容和两位说话人，列出语义/声学 token 的四种交换组合；写出期望文字、音色、韵律，以及什么结果会推翻“已经解耦”。', checks: ['是否有可证伪而非只看可视化', '码率与重建质量是否同时报告', '是否防止 probe 从数据泄漏中取巧'] },
        questionIds: ['rvq', 'semantic-vs-acoustic-token', 'slm-semantic-acoustic-token']
      },
      {
        id: 'thinker-talker', number: 4, title: 'Thinker–Talker：怎样边思考边说又不互相打架', duration: '65 分钟',
        goal: '理解语义规划与声学生成的职责、同步协议和承诺窗口，避免文本计划与实际语音不一致。',
        bridge: '语义与声学表示分层后，系统可以让一个模块负责内容推理、另一个模块负责实时说话，但两条时间线必须严格同步。',
        sections: [
          { title: '两个角色不是简单 LLM 加 TTS', paragraphs: ['Thinker 维护对话、工具结果和语义计划；Talker 消费已确认的语义状态，生成带音色与韵律的声学 token。二者可能共享 backbone、交叉注意力或条件缓存，具体实现不同。', '关键契约是哪些语义已经 committed、哪些仍可修订。Talker 一旦播放出去就无法撤回，因此不能无界领先 Thinker。'] },
          { title: '同步需要三类位置', steps: ['semantic position：Thinker 已产生到哪个内容 token。', 'acoustic position：Talker 已生成/播放到哪个声学帧或 token。', 'commit frontier：已经允许外放、不能修改的语义边界。队列中未播放内容仍可因打断被取消。'] },
          { title: '承诺窗口例子', callout: 'Thinker 当前计划“明天北京温度是…”，工具尚未返回数值。Talker 可以先说“明天北京”，但不能猜“二十度”。如果为了 100 ms 延迟让 Talker 越过未确认槽位，得到的是更快的事实错误。可以在不确定点停顿、填充非承诺短语或切回文本确认。' },
          { title: '一致性检查与降级', paragraphs: ['可以让文本计划、tool result 和 speech token 共享结构化 span ID，离线用 ASR 回识别检查语音内容与计划一致；在线若 Talker 超时或漂移，退回传统 TTS 合成已确认文本。'] }
        ],
        exercise: { title: '练习：画 Thinker/Talker 双时间线', prompt: '设计一个需要查天气工具的回复，标出计划、工具等待、commit、声学生成和播放；插入一次 Thinker 改写与一次用户打断。', checks: ['Talker 是否只消费已确认语义', '工具结果是否在说出口前绑定版本', '取消是否覆盖未播放和正在生成的 token'] },
        questionIds: ['thinker-talker', 'slm-thinker-talker']
      },
      {
        id: 'speech-training', number: 5, title: '分阶段训练：听、想、说怎样学而不互相覆盖', duration: '60 分钟',
        goal: '把表征预训练、对齐、指令微调、语音生成和偏好/安全训练拆成可回归阶段，理解冻结与混合回放的作用。',
        bridge: '模型架构能表达多种能力，但一次把所有数据和损失混在一起，常让新能力覆盖原有语言、理解或音质能力。',
        sections: [
          { title: '一种可解释的阶段划分', steps: ['训练或加载 Audio Encoder/tokenizer，先验证重建与表征任务。', '冻结大部分底座，训练 Adapter 或投影，让语音表示对齐语言模型空间。', '用语音指令与多任务数据做理解/推理 SFT，混入文本回放保持语言能力。', '训练 Talker/声学生成，并做联合微调；最后加入安全、偏好和实时行为数据。'] },
          { title: '冻结不是越多越安全', paragraphs: ['完全冻结 LLM 可防遗忘，却可能限制语音信息进入深层推理；全量更新上限高，却更容易破坏文本能力。应比较 Adapter-only、逐层解冻和全量微调，并在每阶段跑旧能力回归。', '多任务 loss 权重决定梯度话语权。样本数最多的 ASR 任务可能压过情绪理解或对话，不能只看总 loss。'] },
          { title: '混合比例例子', callout: '一批训练含 70% ASR、20% 语音问答、10% 文本指令。若只看 token 数，长 ASR 样本可能实际贡献超过 90% loss。需要按任务采样、token 或 loss scale 明确口径，并观察文本基准、语音理解和生成质量三组曲线。' },
          { title: '每阶段都要有退出条件', paragraphs: ['Adapter 对齐阶段不能只看 loss，要检查语音任务提升且文本能力未受影响；Talker 阶段除了音质，还要检查语义一致性；联合训练若让某能力退化，应能回到上一个 checkpoint 和数据 manifest。'] }
        ],
        exercise: { title: '练习：写四阶段训练表', prompt: '为每阶段写可训练模块、冻结模块、数据混合、loss、三项验收和回滚 checkpoint；说明何时从 Adapter-only 升级为部分解冻。', checks: ['每阶段是否只新增有限变量', '是否持续回归文本与旧语音能力', '数据比例是否按真实 loss 贡献审计'] },
        questionIds: ['speech-training-stages', 'slm-training-stages']
      },
      {
        id: 'streaming-duplex', number: 6, title: '实时双工：用户一开口，系统怎样正确停下来', duration: '70 分钟',
        goal: '构建 listen、think、speak、barge-in 和 cancel 状态机，分离用户语音、设备回声与环境噪声，并拆解端到端延迟。',
        bridge: '单轮流式只要求尽快回答；全双工还要求系统说话时继续听，并在用户真正打断时毫不拖泥带水地停止。',
        sections: [
          { title: '打断不是 VAD 检测到声音就停', paragraphs: ['扬声器播放的系统声音会被麦克风重新收进来，环境碰撞声也会触发 VAD。可靠 barge-in 需要 AEC、播放参考信号、speaker/semantic 证据和短暂确认窗口共同判断。', '确认过慢会让系统抢话，确认过快会被自身回声频繁打断。应分别统计 false interrupt、missed interrupt 和 stop latency。'] },
          { title: '状态机中的原子动作', steps: ['检测候选打断并暂停或降低播放增益。', '确认用户语音后，递增 turn generation ID，取消旧 Talker/工具任务并清空未播放 buffer。', '保留必要对话上下文，但把未说完的旧回复标为 interrupted，避免下一轮误以为已经完整告知用户。', '若判定为回声或噪声，恢复播放并记录 false trigger。'] },
          { title: '竞态例子：旧音频为什么会“复活”', callout: '用户打断 turn 12 后立即开始 turn 13；turn 12 的异步声码器晚到一个 chunk。若队列只做 clear 而不检查 generation ID，这个旧 chunk 会在新回复中突然播放。每个产物必须携带 session/turn/generation，消费者丢弃过期结果。' },
          { title: '延迟分解', paragraphs: ['打断延迟从用户起声开始，包含采集、VAD/AEC、确认、取消传播、播放器清空与设备缓冲。模型生成很快也不代表 stop 快；硬件播放 buffer 可能是最后的主因。'] }
        ],
        exercise: { title: '练习：模拟四种打断', prompt: '为正常用户打断、系统回声、咳嗽和双人同时说话画事件时间线；写状态转移、超时、generation ID 与恢复策略。', checks: ['是否区分候选打断与确认打断', '取消是否传播到工具、模型和播放器', '是否测 false/missed interrupt 与 stop latency'] },
        questionIds: ['full-duplex', 'slm-streaming-duplex']
      },
      {
        id: 'speech-evaluation', number: 7, title: '分层评测：一句回答正确，不代表一轮交互成功', duration: '65 分钟',
        goal: '建立音频感知、语义任务、对话行为、实时交互和安全五层评测，并用短指令 Judge 避免把合理表达判错。',
        bridge: '语音大模型同时听、想、说和管理轮次，单一 WER、MOS 或文本 Judge 都只能看到局部。',
        sections: [
          { title: '五层评测', steps: ['感知层：ASR/关键词、说话人、情绪、噪声与副语言信息。', '任务层：答案正确、工具调用参数、事实一致和拒答边界。', '表达层：可懂度、自然度、音色、韵律及文本计划—语音一致性。', '交互层：首响应、轮次完成、打断成功、抢话、长会话状态。', '安全层：语音越狱、敏感信息、错误工具执行和降级可靠性。'] },
          { title: '短指令不能只做字符串相等', paragraphs: ['用户说“把灯关了”，模型回答“好的，已经关灯”与 reference“灯已关闭”语义等价。Judge 应先检查动作/槽位，再看语言质量；工具日志比表面措辞更接近事实。', '分层 Judge 可先做确定性规则和结构化执行验证，再让模型判断开放表达；高风险动作必须有人工或强约束兜底。'] },
          { title: '聚合例子：四个 90 分不等于系统 90 分', callout: '感知、答案、音质、延迟各 90%，若一次任务必须四层都成功，粗略独立估算整轮成功率只有 0.9⁴≈65.6%。真实错误并不独立，但例子说明不能把局部平均分当端到端成功率；应直接统计完整任务完成。' },
          { title: '测试集要包含时间行为', paragraphs: ['离线音频对无法覆盖说到一半打断、工具迟到、网络抖动和旧 chunk 竞态。需要事件脚本或仿真器控制用户起声、回声、延迟和取消，并保存全链路 timeline。'] }
        ],
        exercise: { title: '结课前演练：设计 50 轮语音任务集', prompt: '覆盖信息查询、工具操作、澄清、拒答、打断和降级；为每轮写音频条件、结构化期望、允许表达、延迟与安全门禁。', checks: ['是否直接统计端到端任务成功', 'Judge 是否先验证工具事实再评语言', '是否包含打断、回声、超时和降级', '是否明确这是课程设计而非既有项目经历'] },
        questionIds: ['slm-embodied-judge']
      }
    ]
  }
];

export const tutorialTracks = [
  { id: 'personal', order: 1, title: '个人项目与答辩', summary: '先把真实经历讲成可核验的技术决策。' },
  { id: 'speech', order: 2, title: '语音与实时交互', summary: '从听、说到端到端实时语音智能。' },
  { id: 'deployment', order: 3, title: '端侧、推理与交付', summary: '把模型跑得快、跑得稳、跑得省。' },
  { id: 'foundation', order: 4, title: '模型原理、训练与安全', summary: '补齐 Transformer、训练、对齐和安全底座。' },
  { id: 'multimodal', order: 5, title: '多模态理解与生成', summary: '贯通视觉、视频、生成、数据和具身智能。' },
  { id: 'applications', order: 6, title: '推荐、增长与智能应用', summary: '把算法连接到业务、知识系统和 Agent。' },
  { id: 'fundamentals', order: 7, title: '算法手撕与系统基础', summary: '保持编码、建模与底层实现能力。' },
];

const generatedTutorialBlueprints = [
  { id: 'edge-inference-chip-delivery', trackId: 'deployment', order: 5, title: '端侧推理与芯片适配', categories: ['ONNX/TensorRT', '推理芯片适配', '量化推理'], prerequisites: [], chapters: ['交付契约', 'ONNX 导出', '数值一致性', 'Dynamic Shape', 'TensorRT Engine', 'Plugin 与 NPU 编译', 'FP16、INT8 与 INT4', '跨芯片精度对齐', '性能、内存与异步流水', '灰度、降级与回滚'] },
  { id: 'ocr-depth-obstacle-delivery', trackId: 'deployment', order: 6, title: 'OCR、深度与障碍物感知', categories: ['OCR 文字检测与识别', '单目深度与障碍物感知'], prerequisites: ['edge-inference-chip-delivery'], chapters: ['OCR 全链路', '文本检测', '文本识别', 'Oracle 定位与局部 Refinement', '单目深度建模', '尺度校准与评测', '障碍物融合及端侧交付'] },
  { id: 'llm-inference-scheduling', trackId: 'deployment', order: 7, title: '大模型推理与调度', categories: ['大模型推理原理', 'KV Cache', 'Continuous Batching', 'PagedAttention', '流式推理工程'], prerequisites: ['transformer-long-context'], chapters: ['Prefill 与 Decode', 'Roofline 与性能瓶颈', 'KV Cache 计算', 'GQA 与 KV 优化', 'Continuous Batching', 'PagedAttention', 'Chunked Prefill 与 PD 分离', '投机解码与多 Token 预测', '流式正确性、背压与取消', '完整推理系统设计'] },
  { id: 'inference-framework-performance', trackId: 'deployment', order: 8, title: '推理框架与性能评测', categories: ['推理框架', '服务性能评测'], prerequisites: ['llm-inference-scheduling'], chapters: ['推理框架边界', '负载与指标契约', '吞吐和延迟', '压测工具与脚本', '饱和度与容量规划', '资源利用率、显存与冷启动', '流式、SLA 与成本', '框架选型与发布决策'] },
  { id: 'distributed-multigpu-moe', trackId: 'foundation', order: 9, title: '分布式训练、多 GPU 与 MoE', categories: ['分布式训练', '多GPU并行', 'MoE 架构'], prerequisites: ['transformer-long-context', 'training-finetuning-data'], chapters: ['通信基础与成本模型', '数据并行与 ZeRO', '张量并行', '流水线并行', '序列与上下文并行', 'MoE Router 与负载均衡', '专家并行', '3D 并行选型与故障定位'] },
  { id: 'transformer-long-context', trackId: 'foundation', order: 10, title: 'Transformer 与长上下文', categories: ['Transformer 架构', '长上下文与位置编码'], prerequisites: [], chapters: ['Token 与 Embedding', '缩放点积注意力', 'MHA、MQA 与 GQA', '位置编码与 RoPE', 'Norm、残差与训练稳定', 'FFN 与 SwiGLU', 'FlashAttention', '长上下文外推与评测'] },
  { id: 'training-finetuning-data', trackId: 'foundation', order: 11, title: '训练、微调与数据构建', categories: ['训练与微调', '训练稳定性', '合成数据'], prerequisites: ['transformer-long-context'], chapters: ['训练目标与数据契约', 'SFT 与 Loss Mask', 'LoRA', 'QLoRA', '蒸馏', '数据配比与 Scaling', '训练稳定性', '合成数据闭环', '持续学习与灾难性遗忘'] },
  { id: 'rl-alignment-evaluation', trackId: 'foundation', order: 12, title: 'RL 后训练与对齐评测', categories: ['RL 后训练', '评测与对齐安全'], prerequisites: ['training-finetuning-data'], chapters: ['MDP 与价值函数', '策略梯度与 Actor-Critic', '奖励模型', 'PPO', 'DPO', 'GRPO', '对齐、安全与能力回归'] },
  { id: 'constrained-generation-redteam', trackId: 'foundation', order: 13, title: '约束生成与安全红队', categories: ['LLM 约束生成与自动评测', '安全红队'], prerequisites: ['transformer-long-context'], chapters: ['结构化输出', '约束解码', '自动 Judge', 'Prompt Injection', 'Jailbreak', '工具调用与数据泄漏', '红队放行闭环'] },
  { id: 'multimodal-understanding', trackId: 'multimodal', order: 14, title: '多模态理解', categories: ['多模态模型', '视觉与视频理解'], prerequisites: ['transformer-long-context'], chapters: ['ViT 与视觉编码', 'CLIP 对齐', 'Connector 与 Q-Former', '多模态融合架构', '高分辨率与多图', '视频时序与 Token 压缩', '音频接入', '多模态幻觉', '评测与部署'] },
  { id: 'generative-image-video', trackId: 'multimodal', order: 15, title: '生成式图像与视频系统', categories: ['生成式模型', '视频生成', '多模态生成应用'], prerequisites: ['multimodal-understanding', 'training-finetuning-data'], chapters: ['VAE、GAN 与 Diffusion', '扩散过程与训练目标', 'Latent Diffusion 与条件控制', 'Flow Matching', '视频时序建模', '人物一致性与 LoRA', '音频驱动生成', '多模态生成应用系统', '质量、安全与效率评测'] },
  { id: 'multimodal-data-engineering', trackId: 'multimodal', order: 16, title: '多模态数据工程', categories: ['多模态数据工程'], prerequisites: ['multimodal-understanding'], chapters: ['数据来源、许可与版权', '统一 Schema', '去重与泄漏控制', '质量过滤', '图文交错与负样本', '标注和合成数据', '版本、血缘与回归'] },
  { id: 'world-model-multimodal-agent', trackId: 'multimodal', order: 17, title: '世界模型与多模态 Agent', categories: ['世界模型', '多模态Agent'], prerequisites: ['multimodal-understanding', 'agent-workflow-engineering'], chapters: ['世界模型定义', '潜空间动力学', '规划与想象', '具身交互', '多模态 Agent Loop', '记忆与工具', '评测、安全与现实落差'] },
  { id: 'industrial-search-recommendation', trackId: 'applications', order: 18, title: '工业搜索与推荐系统', categories: ['搜索推荐', '推荐系统'], prerequisites: [], chapters: ['业务目标与推荐漏斗', '多路召回', '双塔与向量检索', '粗排、精排与 LTR', '多目标学习', '偏差与校正', '实时特征', '冷启动、多样性与探索', 'LLM 与生成式推荐', '系统架构与评测'] },
  { id: 'causal-live-growth', trackId: 'applications', order: 19, title: '因果推断与直播增长', categories: ['因果推断与树模型', '因果推断', '直播变现与增长'], prerequisites: ['industrial-search-recommendation', 'rl-alignment-evaluation'], chapters: ['直播业务漏斗', '统计、因子与树模型', 'DAG 与识别假设', 'A/B 实验', 'Uplift 与 CATE', 'LTV 与概率校准', 'Bandit 与在线 RL', '生成式个性化', '流批服务、全球化与风险'] },
  { id: 'rag-knowledge-systems', trackId: 'applications', order: 20, title: 'RAG 与知识系统', categories: ['RAG'], prerequisites: ['transformer-long-context'], chapters: ['文档解析、索引与切块', '稀疏、向量与混合检索', '查询改写与 HyDE', '重排和上下文压缩', 'Self-RAG 与 CRAG', '评测及与微调的取舍'] },
  { id: 'agent-workflow-engineering', trackId: 'applications', order: 21, title: 'Agent Workflow 工程', categories: ['Agent Workflow'], prerequisites: ['rag-knowledge-systems'], chapters: ['Agent 边界', 'ReAct', 'Planning 与 Reflection', '工具协议与参数校验', '记忆与上下文', '编排与多 Agent', 'MCP 与 Function Calling', '安全与 Human-in-the-loop', '可观测性和成本', '生产评测与恢复'] },
  { id: 'algorithm-system-design', trackId: 'applications', order: 22, title: '算法系统设计', categories: ['系统设计'], prerequisites: ['inference-framework-performance'], chapters: ['需求澄清与容量估算', '在线推理服务', '推荐系统设计', '多模态理解服务', '向量检索与知识服务', '特征 Pipeline 与实时流', 'A/B 实验平台', '可靠性、限流、降级与合规'] },
  { id: 'algorithms-linear-retrieval', trackId: 'fundamentals', order: 23, title: '算法手撕Ⅰ：线性结构与检索', categories: ['链表', '数组/窗口', '二分/TopK'], prerequisites: [], chapters: ['复杂度、输入契约与测试', '链表基础', '链表综合', '数组与哈希', '滑动窗口', '前缀和与单调结构', '二分边界', '堆与 TopK', 'QuickSelect 与综合题'] },
  { id: 'algorithms-tree-graph-dp', trackId: 'fundamentals', order: 24, title: '算法手撕Ⅱ：树、图与动态规划', categories: ['二叉树', '搜索/图', '动态规划'], prerequisites: ['algorithms-linear-retrieval'], chapters: ['树遍历', '树的构造', 'BST 与 LCA', '序列化与路径问题', '图的 DFS 与 BFS', '拓扑、并查集与最短路', '回溯', '线性与序列 DP', '背包与区间 DP'] },
  { id: 'model-implementation', trackId: 'fundamentals', order: 25, title: '模型手写', categories: ['模型手写'], prerequisites: ['algorithms-linear-retrieval'], chapters: ['Tensor 形状与数值契约', 'Softmax 与 Loss', 'Norm 与 Dropout', '卷积尺寸与实现', 'IoU、NMS 与 KMeans', '采样与 Beam Search', 'Attention 与 RoPE'] },
  { id: 'computer-systems-foundation', trackId: 'fundamentals', order: 26, title: '计算机系统基础', categories: ['计算机系统基础'], prerequisites: [], chapters: ['进程、线程、协程与 GIL', 'Mutex、Spinlock 与 Atomic', '内存模型、缓存与伪共享', '虚拟内存、Pinned Memory 与 GPU 显存', '异步 I/O、零拷贝与数据搬运', '并发故障与性能定位'] },
];

const courseChapterCategoryHints = {
  'edge-inference-chip-delivery': [[], ['ONNX/TensorRT'], ['ONNX/TensorRT'], ['ONNX/TensorRT'], ['ONNX/TensorRT'], ['ONNX/TensorRT', '推理芯片适配'], ['量化推理'], ['推理芯片适配', '量化推理'], [], []],
  'ocr-depth-obstacle-delivery': [['OCR 文字检测与识别'], ['OCR 文字检测与识别'], ['OCR 文字检测与识别'], ['OCR 文字检测与识别'], ['单目深度与障碍物感知'], ['单目深度与障碍物感知'], []],
  'llm-inference-scheduling': [['大模型推理原理'], ['大模型推理原理'], ['KV Cache'], ['KV Cache'], ['Continuous Batching'], ['PagedAttention'], ['流式推理工程', '大模型推理原理'], ['流式推理工程'], ['流式推理工程'], []],
  'inference-framework-performance': [['推理框架'], ['服务性能评测'], ['服务性能评测'], ['服务性能评测'], ['服务性能评测'], ['推理框架', '服务性能评测'], ['推理框架', '服务性能评测'], []],
  'distributed-multigpu-moe': [[], ['分布式训练'], ['多GPU并行'], ['多GPU并行', '分布式训练'], ['多GPU并行', '分布式训练'], ['MoE 架构'], ['MoE 架构'], []],
  'transformer-long-context': [['Transformer 架构'], ['Transformer 架构'], ['Transformer 架构'], ['Transformer 架构'], ['Transformer 架构'], ['Transformer 架构'], ['Transformer 架构'], ['长上下文与位置编码']],
  'training-finetuning-data': [['训练与微调'], ['训练与微调'], ['训练与微调'], ['训练与微调'], ['训练与微调'], ['训练与微调'], ['训练稳定性'], ['合成数据'], ['训练与微调']],
  'rl-alignment-evaluation': [['RL 后训练'], ['RL 后训练'], ['RL 后训练'], ['RL 后训练'], ['RL 后训练'], ['RL 后训练'], ['评测与对齐安全']],
  'constrained-generation-redteam': [['LLM 约束生成与自动评测'], ['LLM 约束生成与自动评测'], ['LLM 约束生成与自动评测'], ['安全红队'], ['安全红队'], ['安全红队'], ['安全红队']],
  'multimodal-understanding': [['多模态模型'], ['多模态模型'], ['多模态模型'], ['多模态模型'], ['多模态模型'], ['视觉与视频理解'], ['多模态模型'], ['多模态模型'], ['视觉与视频理解', '多模态模型']],
  'generative-image-video': [['生成式模型'], ['生成式模型'], ['生成式模型'], ['生成式模型'], ['视频生成'], ['生成式模型', '视频生成'], ['视频生成', '多模态生成应用'], ['多模态生成应用'], []],
  'world-model-multimodal-agent': [['世界模型'], ['世界模型'], ['世界模型'], ['世界模型'], ['多模态Agent'], ['多模态Agent'], []],
  'causal-live-growth': [['直播变现与增长'], ['因果推断与树模型'], ['因果推断'], ['因果推断', '直播变现与增长'], ['因果推断'], ['因果推断'], ['直播变现与增长'], ['直播变现与增长'], ['直播变现与增长']],
  'algorithms-linear-retrieval': [[], ['链表'], ['链表'], ['数组/窗口'], ['数组/窗口'], ['数组/窗口'], ['二分/TopK'], ['二分/TopK'], ['二分/TopK']],
  'algorithms-tree-graph-dp': [['二叉树'], ['二叉树'], ['二叉树'], ['二叉树'], ['搜索/图'], ['搜索/图'], ['搜索/图'], ['动态规划'], ['动态规划']],
};

const chapterSemanticHints = {
  '交付契约': '端侧 边缘端 推理框架 部署流程 部署痛点 验收 指标 回退',
  'ONNX 导出': 'ONNX 导出 opset 算子集 多框架',
  '数值一致性': '数值一致 逐层 对齐 误差 精度',
  'Dynamic Shape': 'dynamic shape 动态 batch shape tensor',
  'TensorRT Engine': 'TensorRT engine 构建 引擎 转换 图优化',
  'Plugin 与 NPU 编译': 'plugin 自定义算子 NPU 图编译 算子移植',
  'FP16、INT8 与 INT4': 'FP16 INT8 INT4 PTQ QAT AWQ GPTQ 校准',
  '跨芯片精度对齐': '跨芯片 精度对齐 benchmark 国产卡 HBM',
  '性能、内存与异步流水': '性能 内存 Buffer 复用 异步 双缓冲 利用率',
  '灰度、降级与回滚': '灰度 降级 回滚 监控 可恢复 fallback',
  'OCR 全链路': 'OCR 全链路 数据 评测 pipeline',
  '文本检测': '检测 DBNet EAST CTPN spotting',
  '文本识别': '识别 CRNN CTC Attention',
  'Oracle 定位与局部 Refinement': 'Oracle GT-crop 定位 refinement 多行 FP',
  '单目深度建模': '单目深度 视觉 Transformer 家族 建模',
  '尺度校准与评测': '尺度 校准 相对深度 度量深度 RMSE 评测',
  '障碍物融合及端侧交付': '障碍物 融合 分割 检测 端侧 F1',
  'Prefill 与 Decode': 'prefill decode 首 token TTFT TPOT',
  'Roofline 与性能瓶颈': 'roofline arithmetic intensity compute bound memory bound 性能瓶颈',
  'KV Cache 计算': 'KV Cache 缓存 大小 增长 计算',
  'GQA 与 KV 优化': 'GQA MQA MHA KV 量化 prefix 复用',
  'Continuous Batching': 'continuous batching 连续批处理 调度 preemption padding',
  'PagedAttention': 'PagedAttention 分页 block table COW 碎片 vLLM',
  'Chunked Prefill 与 PD 分离': 'chunked prefill PD 分离 disaggregation',
  '投机解码与多 Token 预测': 'speculative decoding MTP Medusa EAGLE Lookahead 投机 多头预测',
  '流式正确性、背压与取消': '流式 tokenizer detokenizer 背压 取消 stop 截断',
  '完整推理系统设计': '调度 请求 生命周期 SLA 完整系统',
  '推理框架边界': '框架 vLLM SGLang TensorRT-LLM kernel 能力边界',
  '负载与指标契约': '负载 指标 TTFT TPOT 吞吐 并发 SLA 口径',
  '吞吐和延迟': '吞吐 延迟 QPS TPS percentile 并发',
  '压测工具与脚本': '压测 benchmark locust 脚本',
  '饱和度与容量规划': '饱和 容量 OOM 并发 拐点',
  '资源利用率、显存与冷启动': 'GPU 利用率 MFU 显存 冷启动 预热 CUDA Graph',
  '流式、SLA 与成本': '流式 SLA 达标率 成本 每千 token',
  '框架选型与发布决策': '框架选型 放行 发布 评测 回归',
  '通信基础与成本模型': '通信 NCCL all-reduce all-gather all-to-all NVLink IB 成本',
  '数据并行与 ZeRO': 'DP 数据并行 ZeRO FSDP 分片',
  '张量并行': 'TP 张量并行 矩阵切分 all-reduce',
  '流水线并行': 'PP 流水线 1F1B micro-batch bubble',
  '序列与上下文并行': 'SP CP 序列并行 上下文并行 Ring Attention',
  'MoE Router 与负载均衡': 'MoE Router 路由 负载均衡 z-loss capacity',
  '专家并行': 'EP Expert Parallel All-to-All 专家容量',
  '3D 并行选型与故障定位': '3D 并行 Megatron 选型 拓扑 故障',
  'Token 与 Embedding': 'token embedding 输入表示 因果 mask 序列',
  '缩放点积注意力': '缩放点积 attention Q K V 复杂度',
  'MHA、MQA 与 GQA': 'MHA MQA GQA head',
  '位置编码与 RoPE': '位置编码 RoPE sinusoidal ALiBi 多维',
  'Norm、残差与训练稳定': 'norm RMSNorm LayerNorm Pre-LN Post-LN 残差',
  'FFN 与 SwiGLU': 'FFN SwiGLU 门控 前馈',
  'FlashAttention': 'FlashAttention IO 复杂度 tile',
  '长上下文外推与评测': '外推 插值 PI NTK YaRN Passkey Needle 长上下文',
  '训练目标与数据契约': '预训练 微调 对齐 数据 目标 断点 容错',
  'SFT 与 Loss Mask': 'SFT loss mask 指令 多轮',
  'LoRA': 'LoRA 低秩 rank alpha merge',
  'QLoRA': 'QLoRA 4-bit NF4 paged optimizer',
  '蒸馏': '蒸馏 KD teacher student',
  '数据配比与 Scaling': '数据配比 scaling Chinchilla token 去重 质量',
  '训练稳定性': 'NaN loss 突刺 bf16 梯度 裁剪 初始化 监控',
  '合成数据闭环': '合成数据 自举 筛选 数据飞轮 recaption',
  '持续学习与灾难性遗忘': '持续学习 灾难性遗忘 replay EWC curriculum',
  'MDP 与价值函数': 'MDP Bellman V Q advantage 价值函数',
  '策略梯度与 Actor-Critic': '策略梯度 REINFORCE Actor-Critic',
  '奖励模型': '奖励模型 reward model RLHF 偏好',
  'PPO': 'PPO clip KL advantage',
  'DPO': 'DPO preference beta',
  'GRPO': 'GRPO 分组 相对优势',
  '对齐、安全与能力回归': '对齐 安全 能力回归 benchmark judge 红队',
  '结构化输出': '结构化 Schema JSON validator best-of-N',
  '约束解码': '约束解码 grammar JSON constrained decoding',
  '自动 Judge': '自动评测 judge 人工校准 事实约束',
  'Prompt Injection': 'Prompt Injection 指令注入 系统提示',
  'Jailbreak': 'Jailbreak 越狱 对抗 绕过',
  '工具调用与数据泄漏': '工具 权限 数据泄漏 隐私 prompt 泄露',
  '红队放行闭环': '红队 护栏 分类器 放行 回归',
  'ViT 与视觉编码': 'ViT patch 视觉编码器 token',
  'CLIP 对齐': 'CLIP 对比学习 图文 对齐',
  'Connector 与 Q-Former': 'connector Q-Former projector 连接器',
  '多模态融合架构': '融合 cross attention early late architecture',
  '高分辨率与多图': '高分辨率 多图 dynamic resolution 文档 图表',
  '视频时序与 Token 压缩': '视频 时序 光流 TSM token 压缩 sampling',
  '音频接入': '音频 audio speech encoder 多模态',
  '多模态幻觉': '幻觉 grounding 事实 对齐',
  '评测与部署': '评测 benchmark 延迟 部署 视觉 LLM',
  'VAE、GAN 与 Diffusion': 'VAE GAN Diffusion DDPM 生成模型',
  '扩散过程与训练目标': 'DDPM 噪声 epsilon score loss DDIM',
  'Latent Diffusion 与条件控制': 'Latent Diffusion LDM ControlNet DiT 条件',
  'Flow Matching': 'Flow Matching Rectified Flow ODE',
  '视频时序建模': '视频 时序 3D attention 因果 长视频',
  '人物一致性与 LoRA': '人物 一致性 identity LoRA DreamBooth',
  '音频驱动生成': '音频驱动 lip sync Audio Guidance',
  '多模态生成应用系统': '应用 系统 ComfyUI FastAPI 工作流 队列',
  '质量、安全与效率评测': 'FID IS FVD CLIP score 质量 安全 效率',
  '世界模型定义': '世界模型 定义 JEPA 视频预测',
  '潜空间动力学': '潜空间 dynamics RSSM PlaNet Dreamer',
  '规划与想象': '规划 imagination rollout sim2real',
  '具身交互': '具身 embodied 仿真 感知 决策',
  '多模态 Agent Loop': '多模态 Agent loop 感知 计划 行动',
  '记忆与工具': '记忆 工具 Toolformer AppAgent',
  '评测、安全与现实落差': '评测 benchmark 安全 sim2real 现实',
  '业务目标与推荐漏斗': '业务目标 漏斗 北极星 CTR CVR 时长',
  '多路召回': '召回 recall 多路 融合',
  '双塔与向量检索': '双塔 two-tower ANN Faiss embedding',
  '粗排、精排与 LTR': '粗排 精排 ranking LTR CTR DIN DeepFM',
  '多目标学习': '多目标 MMoE CTR CVR 时长 帕累托',
  '偏差与校正': '偏差 position selection calibration 校正 去偏',
  '实时特征': '实时 特征 流处理 线上线下一致',
  '冷启动、多样性与探索': '冷启动 多样性 探索 负采样 序列',
  'LLM 与生成式推荐': 'LLM 生成式推荐 TIGER recommender',
  '系统架构与评测': '系统 架构 AUC GAUC Recall 覆盖率 评测',
  '直播业务漏斗': '直播 变现 漏斗 北极星 互动 付费',
  '统计、因子与树模型': '因子 聚类 Boosting 树模型 XGBoost Random Forest',
  'DAG 与识别假设': 'DAG 因果图 后门 前门 混杂 可识别',
  'A/B 实验': 'A/B RCT 实验 增量 显著性',
  'Uplift 与 CATE': 'uplift CATE T-learner S-learner X-learner GRF',
  'LTV 与概率校准': 'LTV 校准 propensity 倾向得分 选择偏差',
  'Bandit 与在线 RL': 'Bandit 在线 RL 探索 安全',
  '生成式个性化': '生成式 个性化 千人千面 直播推荐',
  '流批服务、全球化与风险': 'Flink Spark Hive 流批 全球化 风险 降级',
  '复杂度、输入契约与测试': '复杂度 边界 测试 输入 空 重复',
  '链表基础': '反转链表 合并链表 快慢指针 环',
  '链表综合': 'LRU K组 区间反转 合并K个 相交',
  '数组与哈希': '数组 哈希 两数之和 前缀',
  '滑动窗口': '滑动窗口 无重复 子串 窗口最大值',
  '前缀和与单调结构': '前缀和 单调栈 单调队列 接雨水',
  '二分边界': '二分 旋转数组 边界 峰值 中位数',
  '堆与 TopK': '堆 topK 高频 第K大 数据流中位数',
  'QuickSelect 与综合题': 'QuickSelect 快选 第K大 综合',
  '树遍历': '树遍历 层序 前序 中序 后序 BFS DFS',
  '树的构造': '构造二叉树 前序 中序',
  'BST 与 LCA': 'BST 二叉搜索树 LCA 最近公共祖先 第K小',
  '序列化与路径问题': '序列化 反序列化 最大路径 路径和',
  '图的 DFS 与 BFS': '岛屿 DFS BFS 腐烂橘子 连通分量',
  '拓扑、并查集与最短路': '拓扑 并查集 Dijkstra 最短路',
  '回溯': '回溯 组合 全排列 子集 单词搜索',
  '线性与序列 DP': '动态规划 最大子数组 股票 打家劫舍 LCS 编辑距离',
  '背包与区间 DP': '背包 分割等和 单词拆分 区间DP',
  'Tensor 形状与数值契约': 'tensor shape 维度 数值 输入 输出',
  'Softmax 与 Loss': 'softmax BCE Cross Entropy loss 数值稳定',
  'Norm 与 Dropout': 'BatchNorm RMSNorm Dropout 训练 推理',
  '卷积尺寸与实现': '卷积 1D 2D padding stride dilation 输出尺寸',
  'IoU、NMS 与 KMeans': 'IoU NMS K-Means 聚类 检测',
  '采样与 Beam Search': 'Top-K Sampling Beam Search 采样 解码',
  'Attention 与 RoPE': 'Attention 正弦位置编码 RoPE QKV',
  '进程、线程、协程与 GIL': '进程 线程 协程 GIL 线程池 调度',
  'Mutex、Spinlock 与 Atomic': 'Mutex Spinlock Atomic CAS 锁 无锁',
  '内存模型、缓存与伪共享': '内存模型 cache 缓存一致性 伪共享 编译 链接',
  '虚拟内存、Pinned Memory 与 GPU 显存': '虚拟内存 地址空间 Pinned Pageable GPU 显存',
  '异步 I/O、零拷贝与数据搬运': 'IO 多路复用 零拷贝 磁盘 网络 RPC',
  '并发故障与性能定位': '并发 故障 死锁 CPU 亲和 性能 定位',
};

function normalizeCourseSection(section) {
  if (section.blocks) return section;
  const blocks = [];
  (section.paragraphs || []).forEach((text) => blocks.push({ type: 'paragraph', text }));
  if (section.steps) blocks.push({ type: 'steps', items: section.steps });
  if (section.callout) blocks.push({ type: 'callout', text: section.callout });
  return { title: section.title, blocks };
}

function normalizeCourse(tutorial) {
  return {
    ...tutorial,
    primaryCategories: tutorial.primaryCategories || [],
    prerequisiteIds: tutorial.prerequisiteIds || [],
    chapters: tutorial.chapters.map((chapter) => {
      const sections = chapter.sections.map(normalizeCourseSection);
      if (sections.length < 4) sections.push({
        title: '失败边界与复习方法',
        blocks: [
          { type: 'paragraph', text: '学完本章后，不要只记最终结论；应能说明结论依赖的输入、版本、数据和约束，并主动给出一个失败条件。' },
          { type: 'callout', text: `复习提示：回到本章关联题卡，用“问题 → 机制 → 例子 → 边界”的顺序口述“${chapter.title}”，遇到没有经历依据的部分明确按通用方案回答。` },
        ],
      });
      return { ...chapter, sections };
    }),
  };
}

function chapterTerms(title) {
  const compact = title.replace(/[\s、，：；（）()\/·与和及]/g, '');
  const terms = title.split(/[\s、，：；（）()\/·与和及]+/).filter((item) => item.length > 1);
  for (let index = 0; index < compact.length - 1; index += 1) terms.push(compact.slice(index, index + 2));
  return [...new Set(terms)];
}

function questionSearchText(question) {
  return [question.title, question.technicalTitle, question.prompt, question.technicalPrompt, question.quickAnswer, question.beginnerSummary]
    .filter(Boolean).join(' ').toLowerCase();
}

function chapterScore(card, blueprint, index) {
  const title = blueprint.chapters[index];
  const fullText = questionSearchText(card);
  const titleText = [card.title, card.technicalTitle].filter(Boolean).join(' ').toLowerCase();
  const hintedTerms = (chapterSemanticHints[title] || '').split(/\s+/).filter(Boolean);
  const terms = [...new Set([...chapterTerms(title), ...hintedTerms])];
  let score = terms.reduce((sum, term) => {
    const key = term.toLowerCase();
    if (titleText.includes(key)) return sum + 18 + Math.min(12, key.length * 2);
    if (fullText.includes(key)) return sum + 3 + Math.min(8, key.length);
    return sum;
  }, 0);
  const categoryHint = courseChapterCategoryHints[blueprint.id]?.[index];
  if (categoryHint?.length) score += categoryHint.includes(card.category) ? 100 : -120;
  return score;
}

function assignCourseQuestions(cards, blueprint) {
  const buckets = blueprint.chapters.map(() => []);
  const remaining = cards.map((card) => ({
    card,
    best: Math.max(...blueprint.chapters.map((_, index) => chapterScore(card, blueprint, index))),
  })).sort((a, b) => b.best - a.best || String(a.card.id).localeCompare(String(b.card.id)));

  remaining.forEach(({ card }) => {
    const scored = blueprint.chapters.map((_, index) => ({ index, score: chapterScore(card, blueprint, index) - buckets[index].length * 6 }))
      .sort((a, b) => b.score - a.score || buckets[a.index].length - buckets[b.index].length || a.index - b.index);
    buckets[scored[0]?.index ?? 0].push(card);
  });
  buckets.forEach((bucket, index) => {
    if (bucket.length) return;
    const fallback = cards.map((card) => ({ card, score: chapterScore(card, blueprint, index) }))
      .sort((a, b) => b.score - a.score || String(a.card.id).localeCompare(String(b.card.id)))[0]?.card;
    if (fallback) bucket.push(fallback);
  });
  return buckets;
}

function firstText(values, fallback) {
  return values.flat(Infinity).filter((value) => typeof value === 'string' && value.trim()).at(0) || fallback;
}

function collectText(cards, fields, limit = 6) {
  const output = [];
  cards.forEach((card) => fields.forEach((field) => {
    const value = card[field];
    if (Array.isArray(value)) value.forEach((item) => { if (typeof item === 'string') output.push(item); });
    else if (typeof value === 'string') output.push(value);
  }));
  return [...new Set(output.filter(Boolean))].slice(0, limit);
}

function buildGeneratedChapter(blueprint, title, number, cards) {
  const summaries = collectText(cards, ['beginnerSummary', 'quickAnswer'], 3);
  const mechanisms = collectText(cards, ['quickAnswer', 'approach', 'invariant'], 6);
  const derivation = collectText(cards, ['derivation', 'prerequisites', 'walkthrough', 'complexity'], 6);
  const examples = collectText(cards, ['workedExample', 'walkthrough'], 4);
  const failures = collectText(cards, ['edgeCases', 'pitfalls'], 6);
  const representative = cards[0];
  const evidenceLabels = [...new Set(cards.map((card) => card.experienceLabel).filter(Boolean))];
  const exampleText = examples.length
    ? `教学示例：${examples.join(' ')}`
    : `教学示例：以“${representative.title}”为主线，先固定输入、版本和评测口径，再改变一个关键变量并记录失败样本。`;
  const richBlocks = [{ type: 'callout', text: exampleText }];
  if (representative.code) richBlocks.push({ type: 'code', language: 'python', source: representative.code });
  if (representative.diagram) richBlocks.push({ type: 'diagram', source: representative.diagram });
  const formulaSource = collectText(cards, ['complexity', 'derivation'], 12).find((text) => /\$[^$]+\$|\\\(|O\(/.test(text));
  if (formulaSource) richBlocks.push({ type: 'formula', text: formulaSource });
  return {
    id: `${blueprint.id}-chapter-${String(number).padStart(2, '0')}`,
    number,
    title,
    duration: `${Math.max(35, Math.min(75, 30 + cards.length * 5))} 分钟`,
    goal: `掌握“${title}”的核心问题、实现路径、取舍和验证方法，并能把本章 ${cards.length} 张题卡串成一段连续回答。`,
    bridge: number === 1
      ? `本章先建立《${blueprint.title}》的共同输入、输出和评价标准，为后续章节提供同一套坐标系。`
      : `上一章解决了前置机制；本章继续进入“${title}”，把原理推进到实现、失败边界和可复核证据。`,
    sections: [
      { title: '问题与动机', blocks: [{ type: 'paragraph', text: summaries.join(' ') || `本章围绕 ${cards.map((card) => card.title).join('、')} 建立问题边界。` }] },
      { title: '核心机制', blocks: [{ type: 'steps', items: mechanisms.length ? mechanisms : cards.map((card) => card.title) }] },
      { title: '推导与具体例子', blocks: [{ type: 'steps', items: derivation.length ? derivation : ['先固定输入与基线。', '再改变一个关键变量。', '最后检查平均指标、关键切片和失败样本。'] }, ...richBlocks] },
      { title: '失败边界与取舍', blocks: [
        { type: 'steps', items: failures.length ? failures : ['不要只报告最好结果。', '不要混用不同数据、设备或版本。', '结论必须说明适用边界和回退方式。'] },
        { type: 'table', headers: ['本章题卡', '难度', '经历边界'], rows: cards.slice(0, 6).map((card) => [card.title, card.difficulty || '—', card.experienceLabel || '通用知识']) },
        ...(evidenceLabels.length ? [{ type: 'callout', text: `经历边界：${evidenceLabels.join('；')}。只有题卡明确标注的事实可以说成个人做过，其余内容按原理或方案回答。` }] : []),
      ] },
    ],
    exercise: {
      title: `练习：完成“${title}”一页讲解`,
      prompt: `不看答案，用问题 → 机制 → 例子 → 失败边界的顺序串讲 ${cards.map((card) => `“${card.title}”`).join('、')}，再打开关联题卡承受追问。`,
      checks: ['是否先定义输入、输出和口径', '是否给出具体数值、代码追踪或状态变化', '是否说明失败条件、代价和验证方法'],
    },
    questionIds: cards.map((card) => card.id),
  };
}

function buildGeneratedTutorial(blueprint, questionBank) {
  const cards = blueprint.categories.flatMap((category) => questionBank.filter((question) => question.category === category));
  const buckets = assignCourseQuestions(cards, blueprint);
  return normalizeCourse({
    id: blueprint.id,
    trackId: blueprint.trackId,
    order: blueprint.order,
    primaryCategories: blueprint.categories,
    prerequisiteIds: blueprint.prerequisites,
    title: blueprint.title,
    eyebrow: `COURSE ${String(blueprint.order).padStart(2, '0')} · COMPLETE LEARNING PATH`,
    summary: `把 ${blueprint.categories.join('、')} 的 ${cards.length} 张题卡组织成 ${blueprint.chapters.length} 个连续章节，从核心原理推进到实现、评测和失败恢复。`,
    outcome: `完成后，你应能独立串讲 ${blueprint.title}，并使用关联题卡回答原理、实现、复杂度、系统取舍和故障定位追问。`,
    audience: '适合第一次系统学习、面试前串讲和按章节查漏；教学示例不自动代表个人项目经历。',
    chapters: blueprint.chapters.map((title, index) => buildGeneratedChapter(blueprint, title, index + 1, buckets[index])),
    capstone: {
      title: `结课综合任务：${blueprint.title}`,
      prompt: `选择一个完整场景，在 12 分钟内讲清需求、输入输出、核心机制、关键实现、指标、失败边界与回退。随后从本课程关联题卡中随机抽取 8 题追问。`,
      checklist: ['问题与约束明确', '关键机制可以推导', '实现包含数据流或状态变化', '指标带口径与切片', '至少分析一个失败案例', '说明资源与效率代价', '给出降级或回退', '不把教学方案说成个人经历'],
    },
  });
}

export function extendTutorials(questionBank) {
  if (tutorials.length === 26) return tutorials;
  const authored = tutorials.map(normalizeCourse);
  const generated = generatedTutorialBlueprints.map((blueprint) => buildGeneratedTutorial(blueprint, questionBank));
  tutorials = [...authored, ...generated].sort((a, b) => a.order - b.order);
  return tutorials;
}

export function tutorialById(id) {
  return tutorials.find((tutorial) => tutorial.id === id);
}
