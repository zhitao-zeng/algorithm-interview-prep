const levelInfo = {
  direct: {
    label: '简历明确经历',
    boundary: '可以说简历原文和自己确认做过的步骤；未写进简历、自己也记不清的高级方法，不要补成个人实践。',
  },
  supporting: {
    label: '相关技术补课',
    boundary: '只说“我使用或横评过相关模型，所以补充理解它的原理”；不要说自己实现过内部算法，除非能拿出代码或实验记录。',
  },
  general: {
    label: '通用方法，不代表做过',
    boundary: '这是一种更规范的面试方法或工程做法，可以回答“如果让我做，我会这样设计”，不能使用“我当时就是这样做的”。',
  },
};

const cards = {
  'asr-resume-backbone-audit': ['direct', '简历写明：横评 Whisper、Zipformer-Transducer、Paraformer 与 Qwen3-ASR，并按文字单元和端侧约束选型。', '我做的是统一评测口径下的模型横评：先统一数据和 CER/WER 计算，再同时看精度、速度、流式能力和端侧成本，最后按场景选模型。'],
  'asr-resume-confidence-calibration': ['direct', '简历写明：西语 10k 抽样发现 8.2% 真实标签噪声；用 Qwen3-ASR 重标注，并以置信度、与原标注一致性和回灌训练控制伪标签质量。', '我没有直接相信 Qwen3-ASR 的新标签，而是把模型置信度、与原标注是否一致和抽样复听结合起来；最终是否采用，要看回灌训练后独立验证集有没有真实改善。'],
  'asr-resume-domain-mixture': ['direct', '简历写明：业务域训练回放约 10% 通用数据，使业务 CER 19.27%→12.24%，同时通用域 9.31%→9.03%。', '我在新业务域微调时混入约 10% 通用数据，并同时看业务域和通用域；只有新域提升且旧域不退化才放行。'],
  'asr-resume-error-attribution': ['direct', '简历写明：ChinaVoices 横评中定位外部语料正字法不一致、过采样遗忘及 LID 梯度干扰等负收益来源。', '我先统一评分口径，再逐项做消融，区分问题来自文字规范、数据采样还是 LID 多任务；不把所有下降都笼统归因给模型。'],
  'asr-resume-icefall-lhotse': ['supporting', '简历“专业技能”列出 k2/icefall/lhotse，但项目 bullet 没有写你从零搭建过完整 recipe。', '我需要能讲清自己用到的训练数据清单、动态 batch、断点恢复和解码入口；如果没独立搭过整套流水线，就明确说是在已有 recipe 上修改和实验。'],
  'asr-resume-k2-fsa': ['supporting', '简历“专业技能”列出 k2/icefall/lhotse，但没有写你亲自实现 FSA/FST 算法。', '我需要理解 k2 用图保存候选路径并施加词典或语言约束；除非确实改过解码图，否则只说使用和调试过，不说从零实现过。'],
  'asr-resume-label-noise-audit': ['direct', '简历写明：在西语 10k 抽样中识别出 8.2% 真实标签噪声，并用重标注和回灌训练验证。', '先解释 8.2% 怎么来的：抽样后听音频、对照原标签、确认到底是模型错还是标签错；然后说明重标注只有经过回灌验证才算有效。'],
  'asr-resume-paired-bootstrap': ['general', '简历报告了 CER/WER 数字，但没有写使用 paired bootstrap 或显著性检验。', '这是严谨比较小幅 CER 差异的方法。面试中可以说“若差异很小，我会补配对重采样判断是否稳定”，不要说项目里已经做过。'],
  'asr-resume-paraformer-cif': ['supporting', '简历写明横评 Paraformer，但没有写你实现或修改过 CIF。', '我需要知道 Paraformer 用 CIF 把帧级表示聚合成 token 级表示，从而并行解码；项目经历只说横评和选型，不说实现了 CIF。'],
  'asr-resume-rir-signal-chain': ['direct', '简历写明：按播放链路构造 RIR、频响、AGC、Codec 与 Clipping，信道退化集 WER 28.66%→20.32%，并把 RIR 卷积改为 FFT 加速约 30 倍。', '我按真实信号链顺序模拟混响、设备频响、增益、编解码和削顶，并混合 clean/augmented/in-domain 数据；收益用真实信道集而不只用合成集验证。'],
  'asr-resume-rnnt-context-graph': ['supporting', '简历写明横评 Zipformer-Transducer，专业技能列出热词，但没有写你实现过 RNN-T Context Graph。', '我需要理解热词是在解码时给匹配路径有限加分，并监控误触发；若没改过 Context Graph，就只把它作为解码原理补课。'],
  'asr-resume-zipformer-internals': ['supporting', '简历写明横评 Zipformer-Transducer，但没有写你修改过 Zipformer 内部结构。', '我需要能解释它为何适合流式和端侧，并把横评中的精度、延迟和内存说清；不声称自己设计了 Zipformer。'],

  'tts-resume-codeswitch-phoneme': ['direct', '简历写明：完成中文、英文及中英混读三路模型交付，并使用 split_by_lang、G2PW、pypinyin 三级回退保证混读稳定。', '我先切分中英文片段，再走各自的 G2P 和音素处理，同时保留跨语言边界上下文，重点回归技术词、缩写和边界停顿。'],
  'tts-resume-g2pw-calibration': ['direct', '简历写明：用双层词典处理低置信词组，并以 split_by_lang、G2PW、pypinyin 三级回退保证混读稳定。', '我的重点是词典优先、G2PW 处理中间情况、pypinyin 做最后兜底，并用错误样本持续补词典；不要把它说成做过复杂概率校准，除非确有记录。'],
  'tts-resume-listening-test': ['general', '简历写了模型和稳定性回归，但没有写 MOS、CMOS、ABX 的正式听测设计。', '这是模型定版时可以补充的标准听测方法。可以回答“如果做正式听测，我会盲测、随机顺序并控制响度”，不要说已经做过。'],
  'tts-resume-matcha-cfm': ['supporting', '简历写明按任务拆分 Matcha / VITS-Melo 模型，但没有写你实现过 Flow Matching 或 ODE solver。', '我需要理解 Matcha 从噪声经过少量数值步骤生成 Mel 频谱的基本思路；项目上只说使用、微调和交付 Matcha，除非确实改过算法。'],
  'tts-resume-small-speaker-finetune': ['direct', '简历写明：完成北京话、河南话、天津话专属音色微调，归因噪声、混响污染、采样率与响度混杂及 code-switch 偏移。', '我先统一采样率、响度和数据质量，再做声线微调；选择模型时同时看音色、可懂度和长句稳定性，不能只看像不像。'],
  'tts-resume-text-normalization': ['direct', '简历写明：以“概率模型 + 确定性规则”覆盖中文多音字长尾。', '确定性的日期、金额、编号先走可审计规则；概率模型只处理上下文歧义，姓名和数字等事实字段不能让模型自由改写。'],
  'tts-resume-tone-prosody': ['direct', '简历写明：训练轻量 G2P 服务拟合 G2PW，并将读音标签由 8 类扩至 18 类。', '我需要说清新增标签解决了哪些具体读音现象，以及如何用逐类错误和试听回归证明有收益；不需要主动扩展成完整语言学体系。'],
  'tts-resume-vits-melo-loss': ['supporting', '简历写明使用 VITS-Melo 完成模型交付，但没有写你修改过其全部损失与内部模块。', '我需要能画出 VITS-Melo 训练和推理的主路径，知道文本、对齐、潜变量和声码器各自作用；只把实际改过的模块说成个人工作。'],

  'edge-resume-buffer-concurrency': ['direct', '简历写明：PP-OCRv6 small 迁移 TensorRT，buffer 复用降低约 220 MiB HWM。', '我复用推理过程中的中间 buffer，减少重复申请和短时间双份内存；回答时说明测量场景和高水位变化，不必扩展成复杂对象池设计。'],
  'edge-resume-cpu-profiling': ['direct', '简历写明：PP-OCRv6 small 迁移 TensorRT 后较 CPU MNN 加速约 3.1 倍。', '我先固定输入和硬件，再拆预处理、推理和后处理测量，确认 3.1 倍来自哪里；若没有做线程亲和性实验，就不要主动说做过。'],
  'edge-resume-dynamic-shape': ['supporting', '简历写了 ONNX Runtime、TensorRT 和端侧交付，但没有写你专门设计过 dynamic shape profile。', '我需要知道动态输入除 ONNX 声明外，TensorRT 还要设置 min/opt/max；它是部署补课，不默认是项目贡献。'],
  'edge-resume-export-parity': ['supporting', '简历写了 ONNX/TensorRT 交付，但没有写逐层数值一致性定位的具体案例。', '这是导出精度下降时的排查方法：固定同一输入，先比最终输出，再找第一个偏离的算子。可以说会这样排查，不说已经做过某个 Resize 案例。'],
  'edge-resume-int8-calibration': ['direct', '简历写明：完成 sherpa-onnx 量化、打包与端侧运行。', '我需要说明量化前后比较了模型大小、端侧速度和任务质量；若没做逐层敏感性回退，就只说做过的校准与端到端回归。'],
  'edge-resume-release-rollback': ['general', '简历写了端侧交付，但没有写模型包灰度、自动回滚或线上事故案例。', '这是成熟端侧发布应具备的方法。面试可以回答“如果负责上线，我会版本化、校验、灰度并保留旧包”，不能伪造成既有项目。'],
  'edge-resume-runtime-selection': ['direct', '简历写明使用 MNN、ONNX Runtime、TensorRT、sherpa-onnx，并完成端侧量化、打包和运行。', '我按目标硬件、算子支持、精度、延迟和包体选择运行时；用真实设备端到端结果做决定，而不是只看框架宣传。'],
  'edge-resume-sherpa-streaming': ['direct', '简历写明：完成 sherpa-onnx 量化、打包与端侧运行；并修正 drain/flush、pre-roll/尾静音及常驻 session，使结果恶化验证后回退。', '我重点处理流式会话的开始、增量输入、flush、取消和资源释放；改动若让结果变差就回退，不为“做了优化”硬找收益。'],

  'lead-resume-model-selection': ['direct', '简历写明：作为语音方向 Tech Lead，负责语音与多模态算法的技术选型、实验放行和跨端交付。', '我把质量、延迟、内存、交付风险和业务约束放在同一张表里选型；结论要能落到真实场景和放行门槛。'],
  'lead-resume-experiment-priority': ['general', '简历写了实验放行，但没有写 RICE、时间盒或正式停止条件流程。', '这是管理实验队列的方法。可以说“如果多个实验竞争资源，我会按影响、证据和成本排序并设停止条件”，不说已经采用某套框架。'],
  'lead-resume-small-team': ['direct', '简历写明：带领 2 人小组负责算法路线、实验评测与端侧交付。', '我按数据、模型、评测和交付拆出明确 owner 与验收物，同时通过 review 和文档避免只有一个人懂关键链路。'],
  'lead-resume-cross-team': ['direct', '简历写明：负责跨端交付，并完成 ASR、TTS、OCR、深度与多模态生成的端侧或产品化工作。', '我会从项目开始就和端侧、产品统一输入输出、质量和性能门槛，交付可运行资产与验收结果，而不只是 checkpoint。'],
  'lead-resume-incident': ['general', '简历没有写某次线上事故的止损、回滚和复盘经历。', '这是事故题的通用答法：先止损和保留证据，再定位、修复、全量回归并补防线。若没有真实事故，不要虚构具体时间线。'],
  'lead-resume-disagreement': ['general', '简历没有写一场具体的技术冲突或成员反馈案例。', '这是管理题模板。最好以后换成一个真实分歧；现在只能回答决策原则，不能编造某位成员或某次冲突。'],
  'lead-resume-star-defense': ['general', '这是简历表达方法，本身不是一段项目经历。', '用背景、任务、个人行动、结果和复盘讲真实 bullet，并明确“我做了什么、团队做了什么”；所有例子必须来自真实经历。'],

  'perf-resume-ablation-design': ['direct', '简历多处写明横评、消融和负收益定位，例如 ChinaVoices 的外部语料、过采样、LID 梯度干扰归因。', '我尽量一次只改一个关键因素并保持数据与评测口径不变；组合改动有收益时，再补单项对照判断贡献来自哪里。'],
  'perf-resume-metric-contract': ['supporting', '简历报告 CER/WER、F1、Judge mean、FPS 与 min/segment，但没有写正式的 Metric Contract。', '我至少要能说清每个数字的数据集、分母、硬件和是否包含预后处理；“Metric Contract”只是把这些口径规范化的补课概念。'],
  'perf-resume-power-multiple-tests': ['general', '简历没有写 power analysis、FDR 或 Bonferroni 多重比较。', '这是大量模型和切片比较时的统计补课。小幅差异时可以说需要扩大样本或补统计检验，不要声称项目里做过。'],
  'perf-resume-run-manifest': ['general', '简历没有写不可变 run manifest、artifact registry 或由第二人完整复现。', '这是理想的实验复现规范。可以说自己会保存配置、代码版本、数据版本和原始结果；没有证据时不要宣称完整系统已经落地。'],
  'perf-resume-slice-gate': ['direct', '简历写明按语种、真实信道、业务域、独立业务集和旧域回归判断模型是否放行。', '我不只看平均指标，而是同时看关键语种、信道和旧域；主指标提升但关键切片退化时不放行。'],
};

const directTitles = {
  'asr-resume-backbone-audit': '我怎样横评多种 ASR 模型并完成选型',
  'asr-resume-confidence-calibration': 'Qwen3-ASR 重标注结果怎么筛选和验证',
  'asr-resume-domain-mixture': '我怎样提升业务域 ASR，又避免通用能力退化',
  'asr-resume-error-attribution': 'ChinaVoices 负收益是怎样定位出来的',
  'asr-resume-label-noise-audit': '西语数据中 8.2% 标签噪声是怎样确认的',
  'asr-resume-rir-signal-chain': '我怎样模拟真实信道并降低 WER',
  'tts-resume-codeswitch-phoneme': '我怎样交付中文、英文和中英混读 TTS',
  'tts-resume-g2pw-calibration': '我怎样处理多音字和低置信词组',
  'tts-resume-small-speaker-finetune': '我怎样完成三种方言声线微调',
  'tts-resume-text-normalization': '我怎样用规则和模型处理中文长尾读音',
  'tts-resume-tone-prosody': '读音标签从 8 类扩到 18 类，我怎样验证收益',
  'edge-resume-buffer-concurrency': '我怎样通过 Buffer 复用降低 220 MiB 峰值内存',
  'edge-resume-cpu-profiling': 'OCR 端侧推理 3.1 倍加速是怎样得到的',
  'edge-resume-int8-calibration': '我怎样完成 TTS 模型量化和端侧交付',
  'edge-resume-runtime-selection': '我怎样为边缘端选择推理框架',
  'edge-resume-sherpa-streaming': '我怎样处理流式会话，并在结果变差时回退',
  'lead-resume-model-selection': '作为 Tech Lead，我怎样做模型选型',
  'lead-resume-small-team': '我怎样带两人小组推进算法与交付',
  'lead-resume-cross-team': '我怎样推动算法、端侧和产品一起完成交付',
  'perf-resume-ablation-design': '我怎样用消融实验定位收益和负收益',
  'perf-resume-slice-gate': '我为什么不只看平均指标，怎样决定模型放行',
};

export function resumeGrounding(id) {
  const entry = cards[id];
  if (!entry) throw new Error(`简历专项 ${id} 缺少经历边界说明`);
  const [level, source, safeAnswer] = entry;
  return {
    level,
    label: levelInfo[level].label,
    source,
    safeAnswer,
    plainTitle: directTitles[id] || null,
    boundary: levelInfo[level].boundary,
  };
}

export const resumeGroundingCounts = Object.values(cards).reduce((counts, [level]) => {
  counts[level] += 1;
  return counts;
}, { direct: 0, supporting: 0, general: 0 });
