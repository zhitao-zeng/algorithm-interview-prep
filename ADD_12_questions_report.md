# 新增 12 道核心题 — 落地报告

> 基于你的建议：只补"薄但容易被连续追问"的题，不新开栏目，总量控制在 12 道。
> 在当前 `questions.js`（265 → 277 题）中插入 12 张新卡，**全部复用现有分类**，通过 `validateQuestionCard` 的 default + beginner 双契约，并已通过 `node --test`（29/29）。

## 新增清单（12 道）

| # | id | 标题 | 分类 | 关键纠偏点 |
|---|----|------|------|-----------|
| 1 | `inf-speculative-decoding` | Speculative Decoding 为什么无损加速 | 大模型推理原理 | 强调"草稿提议+目标并行验证+重要性采样保证分布无损"，非"小模型替代大模型"；接受率/γ/大 Batch 不加速 |
| 2 | `inf-chunked-prefill` | Chunked Prefill 缓解 Prefill/Decode 干扰 | 大模型推理原理 | 总 FLOPs 不变、只改发生时机；Chunk 大小权衡 TTFT vs ITL；与 CB 互补、与 PD 分离正交 |
| 3 | `inf-pd-disagg` | Prefill-Decode 分离为何不一定提吞吐 | 大模型推理原理 | 主要解耦 TTFT/ITL，吞吐非必然提升；KV 传输开销 + 两阶段负载匹配 |
| 4 | `inf-mtp-vs-sd` | MTP 与 Speculative Decoding 区别 | 大模型推理原理 | MTP 是训练目标、不自带加速，需接候选生成+并行验证(Runtime)；Medusa/EAGLE 是候选生成非 MTP |
| 5 | `moe-router` | MoE 参数量大但单 token 算力不同比增 | 大模型推理原理 | Total vs Active Parameters；Router 训练+负载均衡损失；Expert Collapse；Shared vs Routed Expert；Capacity Factor |
| 6 | `moe-ep-alltoall` | Expert Parallel 与 All-to-All 通信瓶颈 | 多GPU并行 | EP 用 All-to-All(Dispatch+Combine)，与 TP 的 All-Reduce 不同；负载不均产生气泡；小 Batch 不一定快 |
| 7 | `mm-mla-vs-attn` | MLA vs MHA/MQA/GQA | 大模型推理原理 | MLA 压"维度"(低维 Latent) 非 GQA 的"头数"(共享头)；减 KV 代价是上投影算力；不可视为更激进 GQA |
| 8 | `mm-video-token-compress` | 长视频 Token Explosion 与压缩方法 | 多模态模型 | 时间×空间膨胀；输入侧/模型侧/跨模态三类；Pruning(删) vs Merging(合并)；不能只均匀抽帧 |
| 9 | `mm-shortvideo-understanding` | 短视频内容理解系统设计 | 多模态模型 | 采帧+ASR/OCR→多编码器→跨注意力融合→多任务头；长尾重加权；离线重质量/在线轻量+缓存 |
| 10 | `rec-music-recommend` | 视频配乐推荐系统设计 | 搜索推荐 | 统一 Embedding(对比学习)+ANN 召回+精排(内容×偏好)+版权过滤；采用≠满意；热门偏置 IPW；线上线下鸿沟 |
| 11 | `agent-workflow-vs-agent` | Workflow vs 自主 Agent，何时不该用 Agent | Agent Workflow | 能用确定性 Workflow 就别上 Agent；限 max_steps/防循环/写操作幂等；校验支付等节点用确定代码 |
| 12 | `agent-mcp-vs-fc` | MCP 与普通 Function Calling 区别 | Agent Workflow | FC 是调用机制、MCP 是连接协议(不同层可共存)；MCP 不管规划；Host/Client/Server；Tool/Resource/Prompt；STDIO vs HTTP 权限 |

## 分类分布（全部落在已有 22 个分类内，无新栏目）

- 大模型推理原理 ×6（1,2,3,4,5,7）
- 多模态模型 ×2（8,9）
- Agent Workflow ×2（11,12）
- 多GPU并行 ×1（6）
- 搜索推荐 ×1（10）

## 质量保障

- 每张卡含 24 字段，与既有 265 卡 schema 完全一致；`followUps` 与 `followUpAnswers` 等长。
- 全部通过 `validateQuestionCard(question)`（default）与 `validateQuestionCard(question, {beginner:true})`。
- `node --test`：**29 passed / 0 failed**。
- 内容避免上一轮修过的"绝对化/定理化"陷阱（如 PD 分离不写"提吞吐"、MLA 不写"更激进 GQA"、MTP 不写"本身加速"）。

## 文件改动

- `questions.js`：265 → 277 题（原地插入，结构合法）。
- `tests/quiz-core.test.js`：`assert.equal(questions.length, 265)` → `277`（测试名"现有 60 道题"按既定 P2 范围保留未动）。
- 备份：`questions.js.pre-add.bak`（修复后 265 基线，可留作 diff 参考）；`questions.js.bak` 与上者相同，可删。

## 下一批（你 deferred，未做）

13. Agent 评估指标题（成功率/Tool 选择准确率/轨迹评估/LLM-as-Judge 问题）
14. 进程/线程/协程 + Python GIL 题
15. Mutex/Spinlock/Atomic/CAS 题
16. Pageable/Pinned/GPU 显存题
