import { makeResumeCard } from '../_resume-card.js';

export default makeResumeCard({
  id: 'asr-resume-backbone-audit', category: 'ASR 专项', title: 'Whisper、Qwen3-ASR 与 FireRedASR2 统一横评',
  prompt: '如何公平比较 Whisper、Qwen3-ASR、FireRedASR2、Zipformer 和 Paraformer，而不把模型规模、提示能力和测试口径混在一起？',
  quickAnswer: '先统一音频前处理、文本归一化、语言与标点口径，再区分 encoder-decoder、Transducer、非自回归等范式；把参数量、可流式性、提示依赖、延迟、显存和各语种错误切片放进同一 scorecard。',
  why: '多模型横评最容易因 tokenizer、标点、reference 清洗和外部提示不同而得出伪结论。',
  implementation: '建立 frozen reference set；统一采样率、VAD、normalizer 和 CER/WER 脚本；明确 zero-shot、prompted、decoder-only 等运行模式，分别记录能力与成本。',
  tradeoffs: '完全统一配置可能抹掉某模型的最佳用法；按最优配置比较又会引入额外系统差异，因此应同时给能力上限与受控对照。',
  evaluation: '主表报告 CER/WER、RTF、显存、首包和失败率；附表按语种、口音、噪声、长音频、数字实体和 hallucination 切片。',
  prerequisites: ['ASR 架构范式', '文本归一化与评分口径', '模型选型 scorecard'],
  workedExample: ['先把所有输出去标点、统一数字与大小写，得到受控 CER。', '再允许各模型使用官方推荐 prompt，作为能力上限单独成表，不能与受控结果混列。'],
  edgeCases: ['某模型自动翻译而非转写', '模型输出时间戳或解释文本', '长音频被内部截断但程序未报错'],
  pitfalls: ['把不同 normalizer 的 CER 直接比较', '只展示平均值，隐藏小语种和长音频崩坏'],
  followUps: [{ question: '为什么要同时给受控对照和能力上限？', answer: '受控对照回答架构本身差异，能力上限回答真实可用效果；只给一个会混淆公平性或低估模型。' }, { question: '模型输出格式不同怎么办？', answer: '保存原始输出，使用版本化 parser 转成统一 schema；parser 失败率本身也应作为工程指标。' }],
  complexity: 'N 个模型、M 个切片、K 条样本的评测约 O(NK) 次推理与 O(NMK) 的聚合统计。',
});
