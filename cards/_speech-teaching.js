const speechCategories = new Set(['ASR 专项', '语音合成', '语音大模型']);

const termRules = [
  [/ASR \/ TTS 基础管线/, 'ASR 把音频变成文字；TTS 把文字前端、声学模型和声码器串起来生成波形，先知道每个模块的输入输出。'],
  [/TTS 声学模型与声码器基础/, '声学模型把音素等文本表示变成 Mel 频谱，声码器再把频谱还原成可播放波形；两段的错误会以不同形式传到最终音频。'],
  [/正字法归一化/, '把数字、日期、符号、大小写和口语写法统一成可比较文本，否则同一句话也可能被错误地计入识别错误。'],
  [/语音质量客观指标/, '客观指标从频谱距离、可懂度或感知模型分数近似评价音质，但与真实听感并不完全一致，必须和主观听评配合。'],
  [/CER|WER|编辑距离/, 'CER/WER 用替换、删除、插入次数除以参考字符或词数；比较前必须统一文本归一化口径。'],
  [/Beam Search|beam_size|top-k/, 'Beam Search 每一步只保留若干高分候选，用更多计算换取比逐步贪心更好的全局序列。'],
  [/CTC/, 'CTC 在帧级预测 token 或 blank，再合并连续重复并删除 blank，从而处理音频帧数远多于文字数的问题。'],
  [/RNN-T|Transducer/, 'RNN-T 用 encoder 表示音频、predictor 表示文本历史、joiner 决定输出 label 还是 blank，天然支持流式对齐。'],
  [/log-Mel|mel 频谱|梅尔谱|梅尔频谱|STFT|倒谱/, '短时傅里叶变换把波形分帧变成频谱，Mel 尺度再按人耳频率分辨率压缩，是常见声学输入。'],
  [/CNN|卷积|depthwise|pooling/, '卷积擅长捕获相邻帧的局部声学模式；depthwise 卷积降低计算，pooling 或 stride 会缩短时间轴。'],
  [/Transformer|自注意力|Encoder-Decoder|编码器-解码器|attention/, '注意力让每个位置按相关性读取上下文；自回归 decoder 还会把已经生成的 token 作为下一步条件。'],
  [/GAN|判别器/, '生成器产生波形或声学特征，判别器区分真伪；二者对抗能提升真实感，但训练容易不稳定。'],
  [/VAE|变分|KL 散度|ELBO/, 'VAE 用重建项保证内容，用 KL 项约束潜变量接近可采样先验；两项失衡会造成模糊或后验坍塌。'],
  [/Normalizing Flow|Flow\/Glow|非自回归生成/, 'Flow 用可逆变换或连续速度场把简单分布映射到目标分布，可并行生成，但依赖正确对齐和数值积分。'],
  [/MOS|主观听评/, 'MOS 让人对自然度等维度评分；必须盲测、随机化并报告置信区间，不能只报一个平均分。'],
  [/ONNX|端侧推理|INT8|量化与蒸馏/, '部署要同时检查算子支持、数值一致性、动态长度、延迟和内存；压缩只有在目标硬件有对应 kernel 时才可能真加速。'],
  [/WFST|BPE|分词/, 'BPE 把文字切成可学习子词；WFST 用图组合声学 token、词典和语言模型约束解码路径。'],
  [/G2P|拼音|音素|IPA|发音/, 'G2P 把文本转成音素；中文多音字和跨语言音素必须结合词级上下文与语言信息处理。'],
  [/专利权利要求/, '权利要求要写清必要技术特征和保护边界，不能只描述效果，也不能把实施例细节全部写死。'],
  [/VAD|端点检测|DDS|会话状态|流式|chunk|缓存|KV-cache|队列|背压|session/, '流式系统把音频分块处理，并用 VAD、缓存和状态机管理开始、增量输出、打断、结束与资源回收。'],
  [/伪标签|pseudo-label|带噪学习|置信度|阈值|校准/, '伪标签必须用人工金标校准置信度，并按语种与场景检查错误率；高分不等于真实正确概率高。'],
  [/多任务|共享编码器|梯度冲突|PCGrad|LID/, '多个任务共享参数可互相帮助，也可能梯度方向相反；需要监控梯度、调权或做投影隔离。'],
  [/RIR|混响|音频预处理|重采样|响度|Codec|增益/, '真实信道会叠加混响、频响、增益控制、编解码和削顶；增强顺序必须尽量贴近真实播放链路。'],
  [/VQ|矢量量化|码本|codec|离散 token|离散化|RVQ/, '向量量化把连续音频表示映射为有限编号；RVQ 用多层码本逐步编码残差，以更多 token 换取更高保真。'],
  [/LLM|大模型|token 序列/, 'LLM 擅长语义和序列推理，但不能直接高效处理高帧率声学向量，需要 encoder、adapter 或离散 token 降采样对齐。'],
  [/说话人|d-vector|x-vector|声纹|音色/, '说话人 embedding 压缩音色信息，但也可能混入信道、情绪和文本，需要跨设备与跨内容验证。'],
  [/情感|效价|唤醒|风格|GST|AdaIN|韵律|F0|能量/, '情感和韵律主要体现在时长、音高、能量与停顿；控制向量还要与说话人身份解耦。'],
  [/时长|forced alignment|对齐/, 'TTS 要知道每个音素对应多少声学帧；时长或对齐错误会直接产生漏读、重复和节奏异常。'],
  [/自回归 TTS|自回归生成/, '自回归模型一步依赖前一步，表达力强但难并行，误差还可能在长句中累积。'],
  [/非自回归|NAR/, '非自回归模型可并行生成多个位置，速度快，但需要额外解决长度、对齐和位置间依赖。'],
  [/自监督语音表征|HuBERT|wav2vec2|表征学习|降维/, '自监督模型从大量无标注音频学习声学表示；下游还需决定冻结、微调和如何压缩帧率。'],
  [/多语种|多语言|语言识别|文字单元/, '不同语言的音素、文字和分词粒度不同；共享参数能迁移，但要防止高资源语言压制低资源语言。'],
  [/灾难性遗忘|经验回放|replay|迁移学习|说话人自适应|微调/, '适配新说话人或新域时模型可能丢失旧能力，常用 replay、冻结层和较小学习率控制回归。'],
  [/监督学习|RL|阶段训练/, '先用监督数据学会稳定输入输出，再用偏好或奖励优化交互；从零直接做 RL 通常不稳定。'],
  [/投影层|adapter|表征对齐/, 'adapter 把音频编码器输出映射到语言模型可接收的维度和分布，同时承担时间轴压缩。'],
  [/异常检测/, '先定义正常分布或可接受范围，再用重建误差、距离或分类分数发现偏离样本。'],
  [/消融实验|评测指标|加权融合/, '消融要一次只改变一个因素并固定预算；多指标融合前要明确各指标的业务含义与权重。'],
  [/语义相似度|机器翻译/, '字面错误率之外还要检查意思是否保持，以及错误是否会传递到翻译等下游任务。'],
  [/条件独立|对数域|前向-后向|动态规划/, '把指数条路径按共享子问题聚合，并在 log 域用 log-sum-exp 避免概率连乘下溢。'],
  [/因果卷积|Masked/, '只允许当前位置读取过去信息，避免训练时偷看未来，从而保证流式或自回归推理一致。'],
  [/模型解耦|模块接口/, '把理解、规划、发声等职责拆开并定义稳定接口，可独立优化延迟、质量与失败回退。'],
  [/音频特征|声学表征|声音特征|声音可表示/, '原始波形通常先变成按时间排列的向量序列，每一帧描述短时间内的频谱或学习特征。'],
  [/序列预测/, '模型根据已有上下文预测后续 token 或标签，需要处理长度变化、停止条件和误差累积。'],
  [/韵律学基本层级|中文分词|句法分析/, '词、韵律短语和语调短语共同决定停顿与重音，标点只是线索而不是完整答案。'],
];

const executableSpeechCode = new Set([
  'ctc-greedy', 'ctc-prefix-beam', 'rnnt-greedy', 'rnnt', 'streaming-cache',
  'as-asr-codec', 'as-ctc-align', 'as-hotword', 'as-rnnt-pruning', 'as-streaming-asr',
  'asr-channel-robustness', 'asr-lid',
]);

function alreadyExplained(term) {
  return term.length >= 10 && /[。；：=→]/.test(term);
}

export function speechPrerequisiteExplanation(term) {
  if (alreadyExplained(term)) return `直观关系：${term} 这条关系会在后面的机制和案例中具体展开。`;
  const match = termRules.find(([pattern]) => pattern.test(term));
  return match ? `${term}：${match[1]}` : null;
}

function first(items, fallback) {
  return Array.isArray(items) && items.length ? items[0] : fallback;
}

export function enrichSpeechTeachingCard(card) {
  if (!speechCategories.has(card?.category) || card?.resumeCard) return card;
  const explanation = card.explanationFocus || first(card.derivation, card.quickAnswer);
  const mechanism = card.approach || card.quickAnswer;
  const example = first(card.workedExample, '用一个最小输入手算或逐步跟踪模型的中间状态。');
  const boundary = first(card.edgeCases, '检查空输入、超长输入和分布外输入。');
  const pitfall = first(card.pitfalls, '不要只背最终结论，要说明条件和失败边界。');
  const prerequisites = (card.prerequisites || []).map((term) => {
    const expanded = speechPrerequisiteExplanation(term);
    if (!expanded) throw new Error(`语音教学卡 ${card.id} 缺少术语解释：${term}`);
    return expanded;
  });
  const originalExamples = Array.isArray(card.workedExample) ? card.workedExample : [];
  const guidedExample = [
    ...originalExamples.map((step, index) => `第 ${index + 1} 步：${step}`),
    `边界检查：${boundary}`,
    `反向自检：${pitfall}`,
  ];
  return {
    ...card,
    speechTeachingV2: true,
    codeMode: card.code ? (executableSpeechCode.has(card.id) ? 'executable' : 'illustrative') : 'none',
    prerequisites,
    interviewAnswer: [
      `30 秒结论：${card.quickAnswer}`,
      `2 分钟展开·原理：${explanation}`,
      `2 分钟展开·实现：${mechanism}`,
      `2 分钟展开·边界：${boundary} 同时避免：${pitfall}`,
    ],
    conceptPath: [
      `先识别问题：${card.prompt}`,
      `再抓核心机制：${mechanism}`,
      `然后跑一个具体例子：${example}`,
      `最后检查失败边界：${boundary}`,
    ],
    guidedExample,
  };
}

export const speechTeachingCategoryCount = speechCategories.size;
