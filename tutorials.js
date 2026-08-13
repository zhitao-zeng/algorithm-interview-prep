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
  }
];

export function tutorialById(id) {
  return tutorials.find((tutorial) => tutorial.id === id);
}
