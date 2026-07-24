export default {
  "kind": "concept",
  "id": "train-quality-vs-quantity",
  "category": "训练与微调",
  "difficulty": "Medium",
  "title": "数据质量 vs 数据数量（Chinchilla 启示与 data-constrained regime）",
  "prompt": "训练数据质量和数量应如何权衡，尤其在数据受限时？",
  "quickAnswer": "Chinchilla 假设无限高质量数据，给定算力按 20 token/FLOP 配比最优；现实进入 data-constrained regime 时，质量（去重/过滤/合成增强）比单纯堆量更重要，可在质量边界内谨慎多 epoch。Phi 系列用「教科书级合成数据」以远少于 LLaMA 的 token 达到强性能，说明高质量可显著弥补数量不足。",
  "approach": "在高质量数据耗尽前按 Chinchilla 比例用足；进入受限后优先提升质量（强过滤、去重、合成重写），并谨慎多 epoch（降 LR、早停、重采样）而非无脑加量；用困惑度与基准双指标监控是否过拟合。",
  "explanationFocus": "是什么：数据质量 vs 数量讨论在固定算力/数据预算下「更干净但更少的精标数据」与「更多但含噪的粗糙数据」哪种更优。Chinchilla 定律假设高质量数据无限、质量恒定，给出「算力与 token 1:1 缩放」的最优比；但前沿训练已进入 data-constrained regime——高质量公开语料见底，此时质量工程（过滤/去重/合成）成为主矛盾，纯堆量收益递减甚至负向。",
  "bruteForce": "不顾质量猛加原始网页语料并多 epoch：模型记住噪声与重复样本，基准污染，收益递减甚至退化（loss 不降反升）。",
  "derivation": [
    "为什么需要：高质量公开文本约 1-3T token，而按 Chinchilla 最优需要更多，数据成为算力之外的新瓶颈，必须在质量与数量间重新权衡。",
    "怎么实现：强过滤（用分类器/困惑度筛低质）+ 去重（minhash/SimHash 去近重复）提质量；用 LLM 合成/重写扩量；data-constrained 下可控多 epoch 并降 LR、配合课程与重采样。",
    "有什么代价：合成数据可能带入模型自身偏见，多代自训练导致「模型坍缩」（分布收窄、多样性丧失）；多 epoch 易过拟合，需早停与重采样，且有效 epoch 过高收益转负。",
    "怎么评测：对比「高质量少 epoch」vs「低质量多 epoch」在基准与困惑度上的差异；观察验证集是否过拟合（train 降、val 平/升即为信号）。"
  ],
  "invariant": "质量优先，数量在质量边界内扩展；多 epoch 是数据受限时的无奈之选，有效 epoch 数需受控（建议二次核对前沿模型实际 epoch 数，常 1~4 而非几十）。",
  "walkthrough": "Chinchilla 公式：算力 C 下最优 token ≈ 20·C（FLOPs）。例如 1e23 FLOPs 对应约 2e24 token；但公开高质量文本仅约 1-3T token，远不够，被迫偏离。Phi-1（1.3B）用约 7B 高质量合成+筛选代码/教科书数据，在 HumanEval 上超过用数 T 网页训练的更大模型，直观说明「质量换数量」可行。有效 epoch = 总训练 token / 去重后独特 token，若 unique=1T、训练用 3T，则有效 3 epoch。",
  "edgeCases": [
    "纯合成数据导致模型坍缩/偏见循环：多代自蒸馏后分布越来越窄，下游多样性下降。",
    "多 epoch 超过某阈值（如 >4）收益转负，验证集开始过拟合。",
    "过滤过严反而数据不足：高质量池太小，被迫回到低质量或多 epoch，适得其反。",
    "基准污染：训练数据泄露了测试题，指标虚高，需严格去污染。"
  ],
  "code": "def effective_epochs(total_tokens, unique_tokens):\n    return total_tokens / unique_tokens",
  "codeNotes": [
    "unique_tokens 为去重后的真实规模，effective_epochs = total/unique。",
    "effective_epochs>1 即发生了数据复用（多 epoch）；该值结合验证集过拟合曲线一起看才有意义。"
  ],
  "complexity": "质量过滤是额外 O(数据量) 的推理/分类成本（用小模型打分），但只做一次；合成数据生成成本更高但可批量；多 epoch 几乎不增算力、却带来过拟合风险，需用验证集早停。",
  "followUps": [
    {
      "question": "数据受限时该多 epoch 还是上合成数据？",
      "answer": "优先用高质量合成/重写扩量（提升 unique token），并谨慎配合多 epoch；纯多 epoch 易记忆噪声、过拟合，纯合成易模型坍缩与偏见闭环。经验做法是用「真实精标 + 合成增强」混合，把有效 epoch 控制在 1~4，并在验证集上监控过拟合并早停。"
    },
    {
      "question": "Chinchilla 在 data-constrained 下还成立吗？",
      "answer": "其 20 token/FLOP 的配比仍是重要参考上限，但受高质量数据上限被迫偏离：实际只能在「用尽高质量数据后，靠质量工程逼近」而非严格达到。前沿模型普遍进入多 epoch + 合成补量的 regime，所以要用质量工程（过滤/去重/合成）去尽量逼近 Chinchilla 最优，而不是机械堆量。"
    }
  ],
  "followUpAnswers": [
    "优先用高质量合成/重写扩量（提升 unique token），并谨慎配合多 epoch；纯多 epoch 易记忆噪声、过拟合，纯合成易模型坍缩与偏见闭环。经验做法是用「真实精标 + 合成增强」混合，把有效 epoch 控制在 1~4，并在验证集上监控过拟合并早停。",
    "其 20 token/FLOP 的配比仍是重要参考上限，但受高质量数据上限被迫偏离：实际只能在「用尽高质量数据后，靠质量工程逼近」而非严格达到。前沿模型普遍进入多 epoch + 合成补量的 regime，所以要用质量工程（过滤/去重/合成）去尽量逼近 Chinchilla 最优，而不是机械堆量。"
  ],
  "pitfalls": [
    "迷信数量忽视过滤：以为 token 越多越好，结果堆进噪声与重复，单位 token 收益骤降。",
    "过度依赖合成数据引发模型坍缩：自生成数据反复训练，模型逐渐丢失长尾能力。"
  ],
  "beginnerSummary": "数据像教材：100 本烂书不如 10 本精读。Chinchilla 假设好教材无限，告诉你「书和老师（算力）要同步加」；但现实好教材不够，这时要先「编好教材」（质量：去重、过滤、合成好题）再考虑「多读几遍」（多 epoch）。只读烂书会学歪，只反复读同一本好教材也会背死、不会变通。",
  "prerequisites": [
    "Chinchilla 规律：在无限数据假设下，模型参数量与训练 token 应按 1:1 大致同比例缩放，给定算力有最优配比。",
    "数据去重与过滤：minhash/SimHash 去近重复、用小模型或困惑度过滤低质，是质量工程基础。",
    "合成数据风险：自蒸馏/合成可能带来模型坍缩与偏见闭环，需与真实数据混合。"
  ],
  "workedExample": [
    "unique=1T，训练用 3T token → 有效 3 epoch；若验证集在 3 epoch 后开始过拟合，则退回 2 epoch。",
    "Phi 用合成教科书以约 0.3T 高质量数据抵 1T 网页效果：在代码/推理基准上以小模型超越大模型的粗糙训练。"
  ],
  "lineByLine": [
    "def effective_epochs(total_tokens, unique_tokens): 算有效训练轮数，揭示数据被复用程度。",
    "total/unique 即重复遍数：>1 表示同样数据被看了多遍。",
    ">1 表示数据被复用：需结合过拟合曲线判断是否过多 epoch。"
  ],
  "diagram": "质量 ↑ ──优先\n数量 ↑ ──质量边界内"
};
