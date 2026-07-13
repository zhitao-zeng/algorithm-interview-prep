# algorithm-interview-prep 题库 P0 + P1 修复记录

> 范围：用户选定 **(B) = P0 十处明确错误 + P1 绝对化措辞**。
> 方式：用 Node 把 `questions.js` 加载进内存，对每条错误做**带计数断言**的精确字符串替换（`count != expect` 即中止、绝不瞎改），全部命中后才写回；最后跑 `node --test`（29 项全过）并校验旧串消失/新串出现。
> 备份：`questions.js.bak`（原文件，确认无误后可删）。

## 一、P0 明确事实/公式错误（10 处，已修）

| # | 题 id | 字段 | 关键修改 |
|---|-------|------|---------|
| 1 | `cross-entropy` | edgeCases[1] | “单类(C=1)退化成二分类”→ softmax 恒为1、CE 恒为0，无有效分类意义；二分类用两类 softmax 或单 logit+BCE |
| 2 | `batchnorm` | workedExample[1] | Keras 式动量公式 → 与 code 对齐为 PyTorch 式 `(1-m)·old + m·μ`，并注明 Keras 语义相反 |
| 3 | `inf-transformer-compute` | **code** | `head = 2*n*vocab` → `2*n*d*vocab`（补 hidden dim d） |
| 4 | `kv-why` | **code** | `flops_with_cache` 返回 `n` → `n*(n+1)//2`（累计注意力工作量，原注释已写 ~n²/2 但代码只数步数） |
| 5 | `kv-mha-mqa-gqa` + `kv-gqa-saves` | codeNotes/invariant/diagram/workedExample | 统一为 32 Q 头 / 8 KV 头（每组4个Q头、共8组）；明确 KV 体积↓4×，但 Attention FLOPs 不简单÷4；修图里“4组/4份笔记”自相矛盾 |
| 6 | `kv-quantizable` | **code** + invariant | 加 `maxval==0` 除零保护；注释说明 `torch.int8` 永远1字节、bits=4 仍只达1/2，真 INT4 需两4-bit 打包；修 invariant“INT4 约1/4”过度声称 |
| 7 | `ppo` | invariant | “被限制在 ε-邻域、超出不贡献梯度”→ clip 是保守代理目标，不严格保证 ε-邻域，多轮后仍可能偏离 |
| 8 | `rvq` | derivation[2] + quickAnswer/approach | “首层天然语义”→ 普通 RVQ 仅最小化重建误差，需专门设计（SpeechTokenizer 等）才出现层级语义 |
| 9 | `mgpu-tp` | derivation[1] + invariant | 行切维度：等价于各卡持输入分片 Xi 与权重分片 Wi 再 all-reduce；Megatron 中“完整 X”是前层列切 all-reduce 结果，本质仍是输入分片 |
| 10 | `mm-architecture` | invariant + derivation[1] + diagram | Flamingo 从“统一 token 自回归”类挪出，重分为四类：拼接式/压缩式/Cross-Attention 注入式(Flamingo)/统一离散 token 式 |

## 二、P1 绝对化措辞（已软化）

| # | 题 id | 字段 | 修改要点 |
|---|-------|------|---------|
| a | `cb-throughput-compare` | quickAnswer | “吞吐必升 2–4 倍”→ 收益取决于长度方差/并发/KV显存/调度/基线，需实测，非普遍保证 |
| b | `cb-pagedattention` | derivation[0] | “没有 PagedAttention 就做不了 CB”→ CB 是调度机制、PagedAttention 是内存管理，逻辑不绑定，其他 allocator 也能做 iteration-level batching |
| c | `pa-fragment-reduction` | quickAnswer | “接近 100%”→ 仍有末块碎片、元数据、allocator 与 prefix cache 开销，非永远 100% |
| d | `sft-dpo-rlhf` | invariant | “DPO 与 RLHF 优化同一目标”→ 仅在“特定 RM + KL 正则 RLHF”设定下等效，非无条件 |
| e | `speech-training-stages` | complexity | “RL 阶段成本最高”→ 单位样本成本高，但完整链路预训练总算力通常更高 |
| f | `inf-gpu-util-low` | walkthrough + workedExample | Decode FLOPs 16M→**33.6M**（2·d²），耗时 0.01μs→**0.108μs**（312 TFLOPS 下），结论“受带宽限制”仍成立 |
| g | `kv-quant-loss` + `quant-what` | quickAnswer / pitfalls | “INT8/FP8 近乎无损”→ 合理粒度下通常接近无损，但非绝对，敏感任务仍可能掉点 |

## 三、验证结果

- `questions.js` 仍是合法 ESM，加载得到 **265** 题（无丢失）。
- 旧错误字符串全部消失、新内容全部出现（10 项 P0 抽样核对 + 全部写入核对通过）。
- `node --test`：**29 passed / 0 failed**（卡片结构/初学者契约未被破坏）。

## 四、未做（属范围 C，用户未选）

- P2：为每题增加 `answerStatus / codeType / sources` 字段；补充真正校验公式/代码运行/复杂度一致性的 correctness 单测。
- 测试名 `tests/quiz-core.test.js` 仍叫“现有 60 道题”却断言 265（P2 范畴，本次未动）。
