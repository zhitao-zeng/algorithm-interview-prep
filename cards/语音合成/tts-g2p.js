export default {
  "id": "tts-g2p",
  "category": "语音合成",
  "difficulty": "Medium",
  "title": "G2P 前端与多音字三级回退",
  "prompt": "在中文 TTS 前端中，如何用双层词典、G2PW 与 pypinyin 三级回退处理多音字与低置信词组，保证中英混读稳定？",
  "quickAnswer": "采用 split_by_lang 先按语言切分，中文段优先查双层词典（多音字特殊词+常规词典），再调用 G2PW 模型；当 G2PW 置信度低于阈值时用 pypinyin 兜底，英文段走英文 G2P，从而保证混读稳定。",
  "code": "def g2p_with_fallback(text: str) -> list:\n    # 第一级：split_by_lang 按语言切分\n    segs = split_by_lang(text)\n    phonemes = []\n    for lang, seg in segs:\n        if lang == \"zh\":\n            # 第二级：G2PW 模型，低置信回退 pypinyin\n            res, conf = g2pw.predict(seg)\n            if conf < 0.6:\n                res = pypinyin.lazy_pinyin(seg)\n            phonemes.extend(res)\n        else:\n            phonemes.extend(english_g2p(seg))\n    return phonemes",
  "complexity": "时间 O(n)，空间 O(n)（n 为字符数）",
  "beginnerSummary": "就像遇到不认识的字先查小字典、再查大字典、最后用拼音规则猜，三级兜底保证每个字都能读对，不会卡壳。",
  "derivation": [
    "为什么需要：中文多音字（如\"重\"）与未登录词无法靠规则唯一确定读音，G2PW 虽好但对低频词置信度低，必须回退。",
    "怎么实现：split_by_lang 切分语言→双层词典命中→否则 G2PW 预测，置信度低于 0.6 时用 pypinyin 兜底。",
    "有什么代价：三级回退增加推理分支与词典维护成本，回退可能引入音错，需要评测低置信词组覆盖率。",
    "怎么评测：在带读音标注的多音字测试集上统计准确率与混读崩溃率，并离线拟合轻量 G2P 服务替代 G2PW。"
  ],
  "edgeCases": [
    "多音字在专有名词中读错（如\"重庆\"的\"重\"）。",
    "G2PW 对数字/字母混合串（如\"GPT4\"）置信度低。",
    "中英混读边界切分错误导致整句重读。",
    "轻声与儿化音（如\"花儿\"）规则缺失时丢失韵律。"
  ],
  "pitfalls": [
    "把 pypinyin 当主模型用会丢失上下文消歧能力，多音字全错。",
    "置信度阈值设得过高会频繁回退、过低会放过错误读音。"
  ],
  "prerequisites": [
    "中文分词与语言识别基础",
    "拼音与音素表示（pinyin/phoneme）",
    "模型置信度与阈值策略"
  ],
  "workedExample": [
    "输入\"他重(chóng)新读了 GPT 论文\"，split_by_lang 切成中文段\"他重新读了\"与英文段\"GPT 论文\"。",
    "\"重\"命中多音字词典得 chóng；\"GPT\"走英文 G2P；低置信词组回退 pypinyin 保证不崩。"
  ],
  "lineByLine": [
    "def g2p_with_fallback(text)：定义入口，接收原始混合语言文本。",
    "segs = split_by_lang(text)：按语言切成若干段，分离中英文。",
    "res, conf = g2pw.predict(seg)：G2PW 预测中文读音并返回置信度。",
    "if conf < 0.6: res = pypinyin.lazy_pinyin(seg)：低置信时回退到 pypinyin 兜底。"
  ],
  "followUps": [
    {
      "question": "为什么要把读音标签从 8 类扩展到 18 类？",
      "answer": "8 类无法覆盖轻声、儿化、变调等细分韵律需求，18 类能更精细地驱动韵律建模与多方言适配，提升自然度与方言区分度。"
    },
    {
      "question": "轻量 G2P 服务如何拟合 G2PW？",
      "answer": "用 G2PW 的批量输出作伪标签，蒸馏到一个小模型或规则服务，降低线上延迟与对 G2PW 重模型的依赖，同时保留三级回退兜底。"
    }
  ],
  "followUpAnswers": [
    "8 类无法覆盖轻声、儿化、变调等细分韵律需求，18 类能更精细地驱动韵律建模与多方言适配，提升自然度与方言区分度。",
    "用 G2PW 的批量输出作伪标签，蒸馏到一个小模型或规则服务，降低线上延迟与对 G2PW 重模型的依赖，同时保留三级回退兜底。"
  ],
  "explanationFocus": "是什么：G2P（Grapheme-to-Phoneme）把文字转为拼音或音素序列；本课关注中文多音字与中英混读场景下的三级回退策略。它是 TTS 前端最易出错、最影响自然度的环节。",
  "approach": "以 split_by_lang 做语言切分，中文走\"双层词典→G2PW→pypinyin\"三级回退，英文走英文 G2P，并用轻量服务拟合 G2PW、把读音标签从 8 类扩到 18 类以支撑多方言与韵律。",
  "kind": "concept"
};
