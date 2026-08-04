export default {
  "id": "asr-eval-metrics",
  "category": "ASR 专项",
  "difficulty": "Easy",
  "title": "CER/WER 三层评测口径",
  "prompt": "为什么 ASR 评测需要文字单元、语义质量、Translation-Aware 下游影响三层口径，各自如何计算？",
  "quickAnswer": "ASR 需三层口径：文字单元层用编辑距离算 CER/WER，语义质量层用 LLM 判等/相似度，Translation-Aware 层看下游翻译 BLEU 差；中文用 CER、西英用词 WER。",
  "code": "def cer(reference: str, hypothesis: str) -> float:\n    \"\"\"字符错误率：基于编辑距离统计替换/插入/删除的字符数占比。\"\"\"\n    import editdistance  # 或自实现 DP\n    dist = editdistance.eval(reference, hypothesis)\n    return dist / max(len(reference), 1)",
  "complexity": "时间 O(|r|·|h|)（编辑距离），空间 O(min(|r|,|h|))",
  "beginnerSummary": "改卷有三把尺：数错几个字（CER/WER）、意思对不对（语义）、翻成外语后准不准（Translation-Aware）。",
  "derivation": [
    "为什么需要：单看 CER/WER 会漏掉“字错但意对”或“字对但下游翻译崩”的情况，需多层口径反映真实可用性。",
    "怎么实现：第一层用编辑距离算 CER（字符）或 WER（词）；第二层用 LLM 判等/语义相似度量意；第三层把输出喂翻译模型看 BLEU 影响。",
    "有什么代价：语义与 Translation-Aware 需调用大模型/翻译服务，增加评测成本与抖动，需多次取平均。",
    "怎么评测：三层同时汇报，如盲测 7 语种整体 CER 9.15%，并附语义一致率与翻译 BLEU 差。"
  ],
  "edgeCases": [
    "中文用 CER、西语用词 WER，分母单位不同不能直接跨语种比。",
    "标点/大小写未归一化，CER/WER 虚高。",
    "语义层对 paraphrasing 宽容但可能放过事实错误。",
    "Translation-Aware 受翻译模型自身误差干扰。"
  ],
  "pitfalls": [
    "只用 WER 评中文，汉字错误被低估（应 CER）。",
    "把 CER 数字当绝对质量，忽视语义与下游。"
  ],
  "prerequisites": [
    "编辑距离",
    "CER 与 WER 定义",
    "语义相似度与机器翻译评测"
  ],
  "workedExample": [
    "步骤1：ref='北京明天有雨'，hyp='北京明天又雨' → 编辑距离 1，CER=1/7≈14.3%。",
    "步骤2：语义层判“又雨”≈“有雨”，语义一致通过。",
    "步骤3：把 hyp 喂翻译得 BLEU，与 ref 翻译 BLEU 求差，量化下游影响。"
  ],
  "lineByLine": [
    "import editdistance 引入编辑距离库（或自实现 DP）。",
    "dist = editdistance.eval(reference, hypothesis) 计算最小编辑操作数。",
    "return dist / max(len(reference), 1) 以参考长度归一得到错误率，防除零。",
    "函数即第一层文字单元口径的核心。"
  ],
  "followUps": [
    {
      "question": "CER 和 WER 怎么选？",
      "answer": "中文/日文等无空格语言用 CER（字符），西/英等有词边界用 WER（词），混合语种按各自文字单元分别报。"
    },
    {
      "question": "Translation-Aware 怎么落地？",
      "answer": "固定一个翻译模型，分别翻译 ref 与 hyp 得 BLEU，差值即 ASR 错误对下游翻译的影响，差值越小越可控。"
    }
  ],
  "followUpAnswers": [
    "中文/日文等无空格语言用 CER（字符），西/英等有词边界用 WER（词），混合语种按各自文字单元分别报。",
    "固定一个翻译模型，分别翻译 ref 与 hyp 得 BLEU，差值即 ASR 错误对下游翻译的影响，差值越小越可控。"
  ],
  "invariant": "cer 返回值恒在 [0, ∞)（正常 [0,1]），参考为空时返回 0 而非报错（max 防除零）。",
  "walkthrough": "ref='abc', hyp='ab' → 编辑距离 1，len(ref)=3，返回 1/3≈0.333；ref='' → max(0,1)=1，dist=0，返回 0。",
  "kind": "code"
};
