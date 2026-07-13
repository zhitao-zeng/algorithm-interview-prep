# algorithm-interview-prep 题库 P0 错误源码核实报告

> 核实方式：用 Node 加载 `questions.js` 的 `questions` 数组，按审阅关键词逐题检索并比对 `code / invariant / derivation / followUpAnswers / workedExample` 等字段原文。审阅里 10 处 P0 指控 **全部属实**（字段级证据见下表）。审阅关于"测试只查字段、不查正确性"的判断也属实。

## 一、P0 逐条核对（全部 CONFIRMED）

| # | 题 id | 错误字段 | 源码现状（证据） | 修复方向 |
|---|-------|---------|----------------|---------|
| 1 | `cross-entropy` | `edgeCases[1]` | `单类（C=1）：退化成二分类形式。` | 改为：单类时 softmax 恒为 1、CE 恒为 0，无有效分类意义；二分类用两类 softmax 或单 logit + BCE |
| 2 | `batchnorm` | `workedExample[1]` | `running_mean ← momentum·running_mean + (1-momentum)·μ`（Keras 式） | 与 `code` 对齐：`(1-momentum)·running_mean + momentum·μ`，并注明 Keras 语义相反（当前 `code` 已是 PyTorch 式，二者自相矛盾） |
| 3 | `inf-transformer-compute` | `code` | `head = 2 * n * vocab   # LM Head` | 缺 hidden dim `d`，应为 `head = 2 * n * d * vocab`（差 d 倍，数千倍量级） |
| 4 | `kv-why` | `code` | `def flops_with_cache(n): return n` | 只数了生成步数；应返回累计注意力工作量 `n*(n+1)//2`（注释已写"总计 ~n²/2"但代码返回 n） |
| 5 | `kv-mha-mqa-gqa` / `kv-gqa-saves` | `invariant` / `beginnerSummary` / `codeNotes` | 两题自相矛盾：`kv-mha-mqa-gqa` 写 `n_kv_heads = groups (e.g. 8)`、`n_heads:groups=32:8=4×`；`kv-gqa-saves` 写"32 人…8 人合一份、共 4 份笔记"即 4 个 KV 头、却 invariant 又说 `32/8=4×`；`codeNotes` 称"注意力计算也变轻" | 统一为：32 Q heads / 8 KV heads（每组 4 个 Q head，共 8 组），KV 体积降 4×；说明 GQA 主要减 KV 投影/Cache/读取带宽，每个 Q head 仍算自身注意力，Attention FLOPs 不简单 ÷4 |
| 6 | `kv-quantizable` | `code` / `invariant` | `return torch.round(tensor/scale).to(torch.int8)` 永远存 int8；`bits=4` 时 `scale = maxval/7`；`maxval=0` 时 scale=0 → `tensor/scale` 除零得 NaN | 加 zero-scale 保护；明确当前函数产出 int8（1/2 显存），真 INT4 需两 4-bit 打包进 1 byte 或专用 packed 格式；修正 invariant "INT4 约 1/4" 的过度声称 |
| 7 | `ppo` | `invariant` | `更新被限制在 π_old 的 ε-邻域内；超出部分不贡献梯度。` | 改为：PPO 用 clipped surrogate，`[1-ε,1+ε]` 外被 clip 是保守代理目标，不严格保证 ε-邻域约束，也不保证超范围样本梯度为 0，多轮 minibatch 后仍可能偏离 |
| 8 | `rvq` / `semantic-vs-acoustic-token` | `derivation[2]` / `code` 注释 | `第1层抓住主结构（近似语义）`；`第1层: 语义/内容` | 说明普通 RVQ 仅最小化重建误差、不天然学语义；"首层语义"需 SSL target / HuBERT-WavLM 蒸馏 / 层级解耦损失等专门设计（如 SpeechTokenizer），非 RVQ 天然属性 |
| 9 | `mgpu-tp` | `derivation[1]` / `invariant` | `行切时各卡持 Wi 与完整 X，输出 all-reduce`；`各卡持有完整输入 X` | 行切（W 按行拆 [W1;W2]）维度上应各卡持输入分片 X_i 与权重分片 W_i 再 all-reduce；Megatron 中因前列切已 all-reduce 故 X 完整到达，但等价于 X 按输入维分片。原表述维度对不齐 |
| 10 | `mm-architecture` | `quickAnswer` / `derivation[1]` / `diagram` | 将 Flamingo 归为"统一 tokenizer / 单一 Transformer 自回归生成"类 | Flamingo 实为 Vision Encoder → Perceiver Resampler → Gated Cross-Attention 注入冻结 LLM（cross-attention 注入式），不是统一 token 自回归。建议四分类：拼接式(LLaVA/Qwen-VL)、Resampler 压缩式(BLIP-2/Flamingo)、Cross-Attention 注入式(Flamingo)、统一离散 token 式 |

## 二、审阅"测试只查字段"判断 — 属实

- `tests/quiz-core.test.js:28` 测试名为 `现有 60 道题均通过基础内容校验`，却断言 `assert.equal(questions.length, 265)`。
- `quiz-core.js:56` 的 `validateQuestionCard` 仅检查：标量字段非空、数组字段非空且长度达标（edgeCases≥3、pitfalls≥2、followUpAnswers≥2、followUps 与 followUpAnswers 等长）。**不验证任何公式、代码可执行性或事实正确性**。
- 结论：现有测试能证明"卡片长得完整"，不能证明"答案是对的"。

## 三、修复方案与待确认范围

**P0（10 处明确事实/公式错误）**：建议全部修，保留 `code` 字段原样，仅改正 `invariant / derivation / workedExample / followUpAnswers / codeNotes` 中的错误表述。每处修复均可在 `questions.js` 内精确 Edit。

**P1（过度承诺措辞）**：如"吞吐必升 2–4 倍""没有 X 就做不了 Y""INT8/FP8 基本无损"等，建议作为第二轮，把营销式绝对表述改为带限定条件。

**P2（重构生成字段 + 加 correctness 测试）**：给每题增加 `answerStatus(verified|reviewed|draft)`、`codeType(executable|educational|pseudocode)`、`sources`；并补真正校验公式/代码运行/复杂度一致性的单测。

> 下一步需你确认范围：
> - **(A)** 只修 P0 这 10 处（推荐先做的）
> - **(B)** 修 P0 + P1 的绝对化措辞
> - **(C)** 在 A/B 基础上再加 P2 的 correctness 测试骨架
>
> 说"开始"或指定范围，我就动手改 `questions.js`。
