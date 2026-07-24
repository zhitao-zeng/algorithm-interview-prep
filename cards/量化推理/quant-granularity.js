export default {
  "kind": "concept",
  "id": "quant-granularity",
  "category": "量化推理",
  "difficulty": "Easy",
  "title": "量化粒度 per-tensor/channel/group",
  "prompt": "量化的粒度 per-tensor、per-channel、per-group 分别是什么？",
  "quickAnswer": "per-tensor 整张量共用一个 scale（最简单但易被 outlier 带偏）；per-channel 每个输出通道独立 scale（权重常用，抗通道间差异）；per-group 把每通道再切成小组各自 scale（INT4 常用，兼顾精度与开销）。粒度越细越耐 outlier、精度越高，但存储 scale 与 kernel 查表复杂度越高。实践中权重 INT8 常用 per-channel，INT4 常用 per-group（group=64/128）。",
  "approach": "选型经验：权重 INT8 用 per-channel 即可较好对抗通道间动态范围差异；权重 INT4 因码点极少（仅 16 个值），单通道共享 scale 误差大，必须用 per-group（如每 128 元素一组）来局部收紧范围。激活则常配合 per-token（每行一个 scale）以对抗 token 间差异。粒度选择是「精度 vs scale 存储/查表开销」的权衡。",
  "explanationFocus": "是什么：量化粒度（quantization granularity）指「多少个元素共享同一个缩放因子（scale）」，它决定了量化的粗细程度。从粗到细主要有三种：per-tensor（整张量一个 scale）、per-channel（每个输出通道独立 scale，权重常用）、per-group（把每个通道再切成小组、每组独立 scale，INT4 常用）。粒度越细，越能适应张量内部差异、越耐 outlier，但存储 scale 与 kernel 查表开销越高。",
  "bruteForce": "整模型一个全局 scale：任何一处 outlier（如某个激活通道出现极大值）都会把全局范围拉大，导致其余正常小值被量化到极粗的台阶，精度断崖下跌。尤其 INT4 下码点本就稀少，全局 scale 几乎必然崩。",
  "derivation": [
    "为什么需要：张量内不同通道/区段的动态范围差异很大（某些通道天然存大值 outlier），单一全局 scale 会把小范围部分量化得极粗、误差剧增，尤其低比特（INT4）下几乎不可用。",
    "怎么实现：per-tensor 用一个 s 管全部；per-channel 按输出维度各一个 s（权重 W 的形状 [Out, In] 则每个 Out 一个）；per-group 如每 g 个元素（常 64/128）一组各一个 s，组合了 per-channel 的「按通道」与更细的「组内」。",
    "有什么代价：细粒度需为每个 scale 存元数据并查表，kernel 取 s 有额外访存与分支开销；scale 数量随粒度变细而增加（per-group 为 元素/g）；硬件（如 GPU Tensor Core）对 group 大小有对齐/整除要求，过小或错位会变慢。",
    "怎么评测：在同比特（如都 INT4）下比较 per-tensor/per-channel/per-group 的精度（困惑度、下游任务）与推理时延，找性价比拐点——通常 group=64/128 在精度损失与速度间最佳。"
  ],
  "invariant": "核心不变式：粒度越细 → 量化精度↑、但 scale 存储与查表开销↑。存在一个性价比拐点（常是 group=64/128），再细则 scale 开销反噬速度/显存，需结合硬件对齐（如 GPU 要求 group 整除、与向量长度对齐）选取。",
  "walkthrough": "以 7B 模型 INT4 量化为例：per-tensor 下整个权重矩阵共用一个 scale，outlier 通道会把范围拉爆，困惑度明显上升；改用 group=128 的 per-group 后，每组内动态范围小、量化台阶细，7B 困惑度显著优于 per-tensor，而 scale 仅增约 1% 存储（每组一个 scale，相对权重量可忽略）。实测 group=128 常是精度与速度的甜点。",
  "edgeCases": [
    "group 太小（如 8/16）：scale 数量暴增，查表与存储开销反噬 kernel 速度，得不偿失。",
    "per-channel 对激活需配合 per-token：激活按 token 维度差异大，单通道 scale 仍会被 token 间 outlier 带偏，需 per-token 或 per-group 激活量化。",
    "硬件对齐要求：如 GPU 要求 group 整除向量长度（如 128），否则退化到更慢的实现。",
    "权重分布极端不均（少数通道 outlier 极大）：即便 per-channel 也压不住，需配合缩放/平滑（如 SmoothQuant）预处理。"
  ],
  "code": "# Python\ndef quant_groups(w, bits=4, g=128):\n    out, scales = [], []\n    for i in range(0, w.numel(), g):\n        blk = w.flatten()[i:i+g]\n        s = blk.abs().max() / (2**(bits-1)-1)\n        out.append((blk / s).round().clamp(-(2**(bits-1)), 2**(bits-1)-1))\n        scales.append(s)\n    return out, scales                            # 每组独立 scale",
  "codeNotes": [
    "group 大小常取 64/128 以对齐硬件（GPU 向量长度），过小或过不对齐会变慢。",
    "per-channel 是 g=整个通道的特例：把 group 推广到任意 g 即可统一三种粒度。",
    "INT4 必须配细粒度：码点仅 16 个，单通道/整张量 scale 误差过大，per-group 是事实标准。"
  ],
  "complexity": "量化本身 O(元素)（逐元素除 scale、四舍五入、clamp）。scale 数量为 元素/group（per-group）或 通道数（per-channel），随粒度变细而指数增加；反量化时每次取对应 scale 查表为 O(1) 但带来额外访存。group 太小会导致 scale 存储与查表开销反噬 kernel 速度，且硬件要求 group 大小对齐向量长度。",
  "followUps": [
    {
      "question": "per-group 为什么常用于 INT4？",
      "answer": "INT4 只有 16 个码点（−8~7），动态范围分辨率极低。若整通道甚至整张量共享一个 scale，outlier 或通道差异会让大量正常权重被量化到同一个码点，误差巨大。per-group 把每通道再切成小组（如 128 个元素），每组内动态范围小、量化台阶细，精度显著提升，而 scale 只增约 1% 存储，开销可控，因此成为 INT4 的事实标准。"
    },
    {
      "question": "group 大小怎么选？",
      "answer": "在精度与 scale 存储/查表开销间权衡，64/128 是常见甜点：足够细以压制组内 outlier，又不至于让 scale 数量爆炸拖慢 kernel。还必须结合硬件——GPU 通常要求 group 整除向量长度（如 128），否则退化到更慢的实现。最优值需在同一模型上做 group 消融（32/64/128/256）看困惑度与延迟拐点。"
    },
    {
      "question": "激活量化该用哪种粒度？",
      "answer": "激活比权重更「动态」，不同 token、不同样本差异大，常用 per-token（每行一个 scale）或 per-group 激活量化来对抗 token 间 outlier。纯 per-tensor 激活极易被单样本极大值带偏。工业界常用 SmoothQuant 等先把权重/outlier 部分迁移到激活再量化，配合 per-token/per-group 取得更好效果。"
    }
  ],
  "followUpAnswers": [
    "INT4 只有 16 个码点（−8~7），动态范围分辨率极低。若整通道甚至整张量共享一个 scale，outlier 或通道差异会让大量正常权重被量化到同一个码点，误差巨大。per-group 把每通道再切成小组（如 128 个元素），每组内动态范围小、量化台阶细，精度显著提升，而 scale 只增约 1% 存储，开销可控，因此成为 INT4 的事实标准。",
    "在精度与 scale 存储/查表开销间权衡，64/128 是常见甜点：足够细以压制组内 outlier，又不至于让 scale 数量爆炸拖慢 kernel。还必须结合硬件——GPU 通常要求 group 整除向量长度（如 128），否则退化到更慢的实现。最优值需在同一模型上做 group 消融（32/64/128/256）看困惑度与延迟拐点。",
    "激活比权重更「动态」，不同 token、不同样本差异大，常用 per-token（每行一个 scale）或 per-group 激活量化来对抗 token 间 outlier。纯 per-tensor 激活极易被单样本极大值带偏。工业界常用 SmoothQuant 等先把权重/outlier 部分迁移到激活再量化，配合 per-token/per-group 取得更好效果。"
  ],
  "pitfalls": [
    "全用 per-tensor 导致 outlier 崩：一个异常大值把全局 scale 拉爆，其余正常权重量化到极粗台阶，精度断崖。",
    "group 过小拖慢 kernel：盲目追求细粒度，scale 查表开销超过精度收益，实测反而更慢。",
    "忽略硬件对齐：选了不被 Tensor Core 友好支持的 group 大小，量化虽准但推理变慢。"
  ],
  "beginnerSummary": "全班用同一把尺（per-tensor）量高矮会有人量不准；给每个小组发一把尺（per-group）就更贴合。尺越细越准，但发太多尺本身也麻烦——而且老师（GPU）要求尺子按固定盒数发，发得太碎他还嫌乱。所以要在「准」和「麻烦」间找平衡，group=128 通常正好。",
  "prerequisites": [
    "scale 决定量化精度：理解量化公式 x_quant=round(x/s)+z 中 scale 如何映射动态范围。",
    "张量内动态范围不均：理解通道/区段间 outlier 普遍存在，需要细分 scale。",
    "INT4 码点极少（仅 16 个值）：理解低比特下单一 scale 误差会被放大。",
    "硬件量化约束：理解 GPU 对 group 对齐与 kernel 实现的要求。"
  ],
  "workedExample": [
    "per-tensor：整个 [Out,In] 矩阵共用 1 个 scale，最简单但 outlier 一出现全崩。",
    "per-channel：每个输出通道 1 个 scale，共 Out 个，能对抗通道间差异，INT8 权重常用。",
    "per-group g=128：每 128 个连续元素 1 个 scale，INT4 权重量化常用，7B 困惑度显著优于 per-tensor，scale 存储仅增约 1%。"
  ],
  "lineByLine": [
    "决定共享 scale 的元素范围（tensor/channel/group）：这是粒度选择的第一步，直接决定抗 outlier 能力。",
    "在该范围求 max 得 scale：s = max(|blk|)/(2^(bits−1)−1)，把范围映射到量化码点。",
    "元素除 scale 后四舍五入并 clamp 到 [−2^(bits−1), 2^(bits−1)−1]：完成量化。",
    "存量化值 + 各 scale（per-group 每组一个）：反量化时 x≈s·q，scale 数量随粒度增加。"
  ],
  "diagram": "per-tensor: [===== 1 scale =====]\nper-channel:[s][s][s]... (每通道)\nper-group:  [s][s] 每128元素"
};
