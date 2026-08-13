export const tutorials = [
  {
    id: 'project-defense-tech-lead',
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
  }
];

export function tutorialById(id) {
  return tutorials.find((tutorial) => tutorial.id === id);
}
