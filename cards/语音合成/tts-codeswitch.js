export default {
  "id": "tts-codeswitch",
  "category": "语音合成",
  "difficulty": "Hard",
  "title": "中英 code-switching 混读控制",
  "prompt": "中英混读 TTS 中常见的\"混读偏移\"是什么，如何在前端与模型两侧控制其分布？",
  "quickAnswer": "混读偏移指模型在夹杂英文时音素/韵律向某一方言或语言倾斜(如中文词带英文腔或反之)；需在前端按语言精确切分 G2P，并在训练/微调时控制 code-switch 比例与语言边界平滑。",
  "code": "def detect_lang_spans(text):\n    # 检测中英混读边界，分别走不同 G2P\n    spans = []\n    for tok in text:\n        spans.append(\"en\" if is_english(tok) else \"zh\")\n    return merge_consecutive(spans)",
  "complexity": "时间 O(n)，空间 O(n)（n 为字符数）",
  "beginnerSummary": "像双语者切换语言时偶尔\"串味\"；我们要让中英文各归各的味，切换点自然不突兀。",
  "derivation": [
    "为什么需要：混读是自然场景常态，偏移会让某语言发音失真、听感怪异。",
    "怎么实现：前端 detect_lang_spans 分语言段→各自 G2P→边界处做韵律平滑；训练控制混读比例。",
    "有什么代价：语言切分错误会放大偏移；过度控制会削弱自然语码转换。",
    "怎么评测：逐词语言正确率、混读自然度 MOS、偏移的声学距离度量。"
  ],
  "edgeCases": [
    "中英夹杂无空格(如\"这个API\")的切分。",
    "英文缩写大小写/数字混合(如\"GPT4\")。",
    "中文词内夹英文术语(如\"transformer模型\")。",
    "方言口音下的英文读法差异需适配。"
  ],
  "pitfalls": [
    "切分按字符而非语义，把\"API\"拆散读错。",
    "微调时混读比例失衡导致单向偏移。"
  ],
  "prerequisites": [
    "语言识别与分词",
    "多语言音素体系"
  ],
  "workedExample": [
    "\"我用了 GPT 模型\"→切分[中:我用了][英:GPT][中:模型]。",
    "各段走对应 G2P，边界加短停与音高过渡。"
  ],
  "lineByLine": [
    "def detect_lang_spans(text)：混读边界检测入口。",
    "spans.append(\"en\" if is_english(tok) else \"zh\")：逐字符打语言标签。",
    "return merge_consecutive(spans)：合并连续同语言段便于分段 G2P。"
  ],
  "followUps": [
    {
      "question": "边界韵律平滑具体怎么做？",
      "answer": "在语言切换处插入短停、并做基频与能量插值，避免突兀跳变，使混读更自然。"
    },
    {
      "question": "训练数据缺乏混读怎么办？",
      "answer": "用平行语料构造混读样本、控制比例，并用强前端切分保证标注一致。"
    }
  ],
  "followUpAnswers": [
    "在语言切换处插入短停、并做基频与能量插值，避免突兀跳变，使混读更自然。",
    "用平行语料构造混读样本、控制比例，并用强前端切分保证标注一致。"
  ],
  "explanationFocus": "是什么：code-switching(语码转换)指一句话中中英文交替；混读偏移是模型在切换时把某语言的发音/韵律错误地带入另一方。本课关注其控制方法。",
  "approach": "前端用语言切分把文本按段分语言并各自 G2P，在边界做韵律平滑；训练/微调侧控制混读比例与边界一致性，抑制向单一语言偏移。",
  "kind": "concept"
};
