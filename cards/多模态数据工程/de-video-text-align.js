export default {
  "id": "de-video-text-align",
  "category": "多模态数据工程",
  "difficulty": "Hard",
  "title": "视频-文本对齐数据",
  "prompt": "如何构建视频片段与文本描述的细粒度对齐数据（而非整段视频级匹配）？",
  "quickAnswer": "细粒度视频-文本对齐需把视频切成片段（shot/固定窗口），再用 ASR/字幕时间轴、音画事件检测或跨模态检索模型把每段映射到对应描述；常用“时间轴对齐 + 片段重采样 + 一致性校验”三步。",
  "approach": "核心思路是“先切片段，再找每段在文本里的对应句”。利用字幕/ASR 自带时间戳做粗对齐，再用 CLIP 类视频-文本相似度对片段-句子对精排，剔除错位对；也可训练时序对齐模型直接输出片段级匹配。",
  "explanationFocus": "是什么：视频-文本细粒度对齐数据是指“视频子片段（带起止时间）与一句/段文本描述”的配对，区别于仅标整段视频类别的粗粒度数据。",
  "bruteForce": "朴素做法：把整段视频配一个全局标题就当作监督，或人工逐秒标注描述。前者丢失时序定位能力，后者标注成本不可承受。",
  "invariant": "不变式：任意片段的文本描述所提及的视觉事件，必须在该片段时间区间内可见；跨片段拼接后与原始字幕时间轴在 IoU 意义上一致。",
  "walkthrough": "1) 用镜头边界检测或固定窗口切片段；2) 用 ASR/字幕获得带时间戳文本；3) 片段-句子做余弦相似度对齐；4) 低分对剔除或人工修；5) 合并相邻同义片段并写出 (start,end,text) 列表。",
  "complexity": "说明：切片段 O(N_frame)，对齐打分 O(N_clip * N_sentence * model)，主要开销在跨模态编码；时间轴解析与去重是工程重点。",
  "beginnerSummary": "入门概览：教模型“哪几秒画面讲哪句话”，我们先把视频切成小段，再借助字幕时间轴和图文相似度，把每段画面和对应的那句描述配对起来。",
  "diagram": "[video] --shot detect--> [clips]\n   |                      |\n[ASR/subtitle]        [clip encoder]\n   |                      |\n   +---> [align by time + sim]\n                |\n         [(start,end,text)]",
  "code": "import numpy as np\nfrom itertools import starmap\n\ndef align_clips(clip_emb, sent_emb, clip_ts, sent_ts, thr=0.5):\n    pairs = []\n    for (s, e), c in zip(clip_ts, clip_emb):\n        sim = (c @ sent_emb.T).max()\n        if sim >= thr:\n            pairs.append((s, e, int(sim.argmax())))\n    return pairs",
  "derivation": [
    "为什么需要：视频理解、视频问答、时刻定位等任务要求模型知道“描述对应哪段时间”，整段级标签无法训练这种细粒度能力。",
    "怎么实现：切片段后用带时间戳字幕做粗对齐，再用视频-文本相似度精排；也可训练时序对齐（如 TVC/内部模型）直接输出片段-句子匹配。",
    "有什么代价：ASR 时间戳不准、静音/转场会造成错位；跨模态相似度在低质视频上不可靠，需大量一致性校验与回标。",
    "怎么评测：在时刻定位基准（如 ActivityNet Captions）上测 IoU@t 与召回；人工抽检片段-文本一致性比例。"
  ],
  "edgeCases": [
    "画面与字幕语义错位（旁白讲过去、画面是现在）导致对齐标签错误。",
    "长静默或黑场片段无对应文本，应标记为无描述而非强行配对。",
    "多语言视频 ASR 与描述语种不一致，需统一或丢弃。",
    "高速剪辑使固定窗口切出的片段含多个事件，需镜头边界优先。"
  ],
  "pitfalls": [
    "直接信赖 ASR 时间戳不做相似度校验，把大量错位对当成真值。",
    "用整段视频均值池化做片段对齐，丢失时序细节导致短片段全被错配。"
  ],
  "prerequisites": [
    "视频镜头边界检测与采样基础",
    "跨模态检索与 embedding 相似度概念"
  ],
  "workedExample": [
    "片段 (0:02-0:05) 画面是“猫跳上桌子”，对应字幕句“小猫跳上了桌子”，相似度 0.82 通过对齐。",
    "片段 (0:30-0:33) 为转场黑场，无匹配句子，标记为无描述并从训练对剔除。"
  ],
  "lineByLine": [
    "def align_clips(...)：定义片段与句子对齐函数。",
    "for (s, e), c in zip(clip_ts, clip_emb)：遍历每个片段的时间戳与嵌入。",
    "sim = (c @ sent_emb.T).max()：计算该片段与所有句子的最大余弦相似度。",
    "if sim >= thr：超过阈值才保留配对。",
    "pairs.append((s, e, idx))：记录片段起止与最匹配句子下标。"
  ],
  "codeNotes": [
    "生产环境应同时保存相似度分数以便后续按置信度过滤。"
  ],
  "followUps": [
    {
      "question": "没有字幕/ASR 的视频如何做细粒度对齐？",
      "answer": "可训练无文本监督的时序事件分割，或借助音频事件检测、视觉概念检测生成伪描述，再与检索到的外部文本做弱对齐，但质量显著低于有字幕数据。"
    },
    {
      "question": "片段级对齐如何用于视频时刻定位训练？",
      "answer": "把 (start,end,text) 作为时序 grounding 的监督，训练模型在给定文本时回归对应时间区间，或直接做片段-文本对比学习。"
    }
  ],
  "followUpAnswers": [
    "可训练无文本监督的时序事件分割，或借助音频事件检测、视觉概念检测生成伪描述，再与检索到的外部文本做弱对齐，但质量显著低于有字幕数据。",
    "把 (start,end,text) 作为时序 grounding 的监督，训练模型在给定文本时回归对应时间区间，或直接做片段-文本对比学习。"
  ],
  "kind": "concept"
};
