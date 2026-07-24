// 知识脉络数据（与 知识脉络.md 对齐）
// 分类名必须与 questions.js 的 categories 完全一致（注意用斜杠，如 "数组/窗口"）。

export const domains = [
  {
    id: 'A', name: '算法与数据结构基础', heavy: false,
    why: 'coding 入场券，先保手撕不死',
    categories: [
      { name: '链表', oneliner: '线性结构增删查、快慢指针、反转、环检测、合并/分割类手撕。',
        steps: ['单链表操作（反转 / 合并）', '双指针技巧（快慢指针环检测）', '结合哈希 / 虚拟头的中等题（LRU Cache）', '困难变形（K 组翻转 / 区间反转）'] },
      { name: '二叉树', oneliner: '遍历（前中后层）、递归/迭代互转、BST、序列化、最近公共祖先。',
        steps: ['DFS/BFS 遍历打底（层序 / 锯齿层序）', '递归构造（前中序构造）', '路径 / 最值类（最大路径和，带 DP 思维）', '序列化（树 ↔ 字符串）'] },
      { name: '数组/窗口', oneliner: '双指针、滑动窗口、前缀和、单调栈/队列，高频 Medium 主战场。',
        steps: ['哈希 O(1) 查找（两数之和）', '滑动窗口（定长与变长）', '单调结构与前后缀（单调栈 / 接雨水）'] },
      { name: '二分/TopK', oneliner: '二分查找边界、堆/快选求第 K 大、TopK 与频率统计。',
        steps: ['在有序上二分找边界（旋转数组搜索）', '堆 / 快选求 TopK（第 K 大 / 前 K 高频）'] },
      { name: '搜索/图', oneliner: 'DFS/BFS、拓扑排序、最短路、并查集、回溯，图论与状态搜索。',
        steps: ['回溯穷举（子集 / 全排列 / 组合总和）', '网格图遍历（DFS 连通域 / BFS 最短路）'] },
      { name: '动态规划', oneliner: '状态定义与转移、背包、序列/区间 DP、买卖股票类，重在"定义对"。',
        steps: ['状态定义（线性 DP：最大子数组 / 打家劫舍 / 股票）', '序列 / 字符串 DP（LCS / 编辑距离）', '背包与贪心边界（分割等和子集 / 单词拆分）'] },
      { name: '模型手写', oneliner: 'attention / 数值稳定 softmax / beam search / RoPE 等 ML 经典算子的代码实现，原理+代码双考。',
        steps: ['训练组件（RMSNorm / BatchNorm / CrossEntropy / Dropout）', '几何（1D/2D 卷积输出尺寸）', '检测后处理（IoU / NMS / KMeans）', '生成采样（Top-K / Beam Search）', '注意力（缩放点积 Attention，通向 Transformer）'] },
    ],
  },
  {
    id: 'B', name: 'Transformer 与序列建模核心', heavy: false,
    why: '理解大模型底座',
    categories: [
      { name: 'Transformer 架构', oneliner: 'MHA/MQA/GQA、RoPE、RMSNorm/LayerNorm、Pre/Post-Norm、SwiGLU、因果掩码、注意力复杂度——大模型所有题的词汇表。',
        steps: ['注意力计算（K/Q/V 投影、head 维度、O(N²d)）', '三种变体 MHA/MQA/GQA 的取舍', '位置编码演进（Sinusoidal→RoPE→ALiBi）', '归一化（RMSNorm vs LayerNorm、Pre/Post-LN）', '前馈（FFN 与 SwiGLU 门控激活）', '因果掩码与归纳偏置', 'FlashAttention（计算/显存层面收尾）'] },
      { name: '长上下文与位置编码', oneliner: 'RoPE 外推（NTK/线性缩放）、多维 RoPE、相对位置，长序列训练/推理的根。',
        steps: ['问题定义：外推 vs 插值的本质区别', '经典解法演进（线性缩放 PI → NTK-aware → YaRN → ALiBi）', '训练落地（序列并行 / 上下文并行、跨块位置编号）', '评测（Passkey / Needle-in-a-Haystack）'] },
    ],
  },
  {
    id: 'C', name: '大模型训练体系', heavy: false,
    why: '模型怎么训出来',
    categories: [
      { name: '训练与微调', oneliner: 'SFT 数据构造与 loss mask、LoRA 秩/alpha 选择、QLoRA、蒸馏、灾难性遗忘、数据配比、scaling laws、课程学习。',
        steps: ['范式定位（预训练 vs 微调 vs 对齐）', '指令微调（SFT 数据构造 / loss mask / 多轮 mask）', '知识压缩（LoRA / rank α / merge / QLoRA / 蒸馏）', '稳定性（正则 / 过拟合 / 灾难性遗忘 / 持续学习）', '数据工程（配比 / 质量 / 去重 / Chinchilla / token 估算）'] },
      { name: 'RL 后训练', oneliner: 'RLHF/PPO/DPO/GRPO 分别解决什么、奖励模型、奖励 hacking、采样温度。',
        steps: ['RL 基础概念（MDP / 贝尔曼 / Q-Learning）', '策略算法演进（策略梯度 / REINFORCE → Actor-Critic）', '对齐到 LLM（PPO → GRPO → RLHF → SFT/DPO/RLHF 对比）'] },
      { name: '分布式训练', oneliner: '多卡通信（NCCL）、TP/PP/DP/EP/SP 维度切分、ZeRO 三阶段、1F1B、流水线气泡。',
        steps: ['显存（混合精度 / Gradient Checkpointing / ZeRO-FSDP 分片）', '多维并行（TP 切分 / PP 1F1B / EP / SP 与 Ring Attention）', '3D 组合（Megatron 并行组合）', '通信计算重叠与 bubble 优化 / MoE 训练'] },
    ],
  },
  {
    id: 'D', name: '大模型推理与部署', heavy: true,
    why: '岗位最硬核：怎么跑得快、跑得省',
    categories: [
      { name: '大模型推理原理', oneliner: 'prefill（compute-bound）vs decode（memory-bound）、arithmetic intensity、roofline、TTFT/TPOT/TPS、为什么慢。',
        steps: ['瓶颈认知（模型推理为什么慢）', '两阶段本质（Prefill vs Decode：compute vs memory bound）', '量化指标（Arithmetic Intensity / Roofline → TTFT/TPOT）', '工程优化（Chunked Prefill / PD 分离 / Speculative Decoding）', '架构呼应（MLA vs MHA/MQA/GQA、MoE Router）'] },
      { name: 'KV Cache', oneliner: '为何缓存、随 batch/上下文增长规律、MHA/MQA/GQA 对 KV 的影响、量化、prefix cache、共享前缀。',
        steps: ['动机（避免重复算）', '原理与增长（大小参数 / 随 batch 与上下文增长 / 不使用的后果）', '变体影响（MHA/MQA/GQA，GQA 降显存）', '压缩（量化 / Prefix Cache 复用）'] },
      { name: 'Continuous Batching', oneliner: '连续批处理 vs 离散批、调度与 preemption、padding 浪费、吞吐对比。',
        steps: ['问题（静态 batching 的 padding 浪费）', '原理（iteration-level 调度 / in-flight KV 动态分配）', '资源管理（可变长 / 长短负载均衡 / 优先级与抢占）', '工程权衡与框架落地（vLLM / TRT-LLM）'] },
      { name: 'PagedAttention', oneliner: 'KV 分页（像虚拟内存）、block 分配/表、COW 前缀共享、碎片化降低、vLLM 实现。',
        steps: ['碎片问题（KV 显存碎片）', '分页机制（block 分配 / 逻辑物理映射 / block table）', '工程参数（block size 权衡 / COW 共享前缀）', '协同与评测（与 Continuous Batching / 碎片减少 / vLLM 实现）'] },
      { name: '流式推理工程', oneliner: 'chunked prefill、PD 分离、speculative decoding、MTP vs SD、首 token 慢的根因与解法。',
        steps: ['延迟优化（TTFT 工程优化）', '流式正确性（tokenizer/detokenizer 增量对齐 / 停止判定与截断）', '流式控制（背压与取消）', '多 token 加速（Medusa / EAGLE / Lookahead 配投机解码）'] },
      { name: '多GPU并行', oneliner: '推理侧 TP/PP/DP/EP/SP、通信操作（all-reduce/all-gather）、部署策略选择。',
        steps: ['动机（为什么需要多 GPU）', '数据并行（DP 及其局限 / ZeRO）', '张量并行（切分原理 / all-reduce 通信 / 推理侧 TP）', '流水线（PP / 1F1B / bubble）', '专家/序列并行（EP / SP / Ring Attention）', '通信与选型（NCCL / NVLink / IB / 通信量对比）'] },
      { name: '量化推理', oneliner: 'PTQ vs QAT、INT8/INT4/FP8、AWQ/GPTQ、granularity、outlier 与 smoothquant、部署陷阱与精度评估。',
        steps: ['概念（模型量化是什么）', '两类范式（PTQ vs QAT / 动态 vs 静态）', '具体格式（INT8 对称/非对称 → INT4 AWQ/GPTQ → FP8）', '粒度与 outlier（per-tensor/channel/group / SmoothQuant）', '三处量化对象（权重 / 激活 / KV 对比 / W4A16 等价）', '评测与部署（校准 / 精度评测 / 部署坑 / 加速比）'] },
      { name: 'ONNX/TensorRT', oneliner: '导出与 opset、图优化/算子融合、动态 shape、INT8 校准、plugin、部署最佳实践。',
        steps: ['中间表示（ONNX 是什么 / 导出问题 / 多框架统一）', '图优化（算子集与融合 / 常量折叠）', '引擎构建（ONNX→TRT / TRT 构建引擎 / plugin）', '动态与量化（动态 shape / FP16/INT8 校准）', '部署落地（评测加速 / 最佳实践）'] },
      { name: '服务性能评测', oneliner: 'QPS/并发、延迟分位（P50/P99）、吞吐 vs 延迟权衡、饱和容量、GPU 利用率、SLA、e2e 拆解、常见陷阱。',
        steps: ['动机（为什么需要评测）', '核心指标（吞吐 vs 延迟 / QPS / p50-p99 / TTFT/TPOT/TPS）', '资源维度（批大小曲线 / GPU 利用率 / 显存 / 端到端分解）', '工程细节与方法（饱和度 / 冷启动 / 流式评测 / 线上 vs 离线）', '陷阱（缓存干扰 / 数据污染）/ 工具 / SLA / 成本'] },
    ],
  },
  {
    id: 'E', name: '多模态与语音', heavy: true,
    why: '岗位特性：PGC/OGC 多模态 + 语音',
    categories: [
      { name: '多模态模型', oneliner: 'CLIP/Q-Former/ViT、特征对齐与融合、幻觉、视频 token 压缩、hi-res、benchmark、部署。',
        steps: ['编码器（ViT）', 'token 化（patch→token）', '对齐（CLIP）', '连接器（Q-Former）', '融合（主流架构 / M-RoPE / 音频接入）', '进阶（高分辨率 / 多图多轮 / 视频时序 Token Explosion）', '训练与评测（预训练 / 指令微调 / 幻觉 / benchmark）', '部署与系统设计（视觉编码器与 LLM 协同 / 短视频理解系统）'] },
      { name: 'ASR 专项', oneliner: 'CTC/RNNT 原理、VAD、流式分段、partial/final、解码与语言模型融合。',
        steps: ['CTC（Greedy / Prefix Beam，路径对齐）', 'RNN-T（前向递推 / Greedy，流式建模）', '流式工程（VAD / 分段 / partial-final / 流式 ASR 缓存）'] },
      { name: '语音大模型', oneliner: 'speech/semantic/acoustic token、thinker-talker、语音 LLM pipeline、训练阶段。',
        steps: ['表示形式（连续 vs 离散）', 'token 类型（语义 Token vs 声学 Token / RVQ）', '编码器/适配器（Audio Encoder 与 Adapter）', '架构（整体架构 / Thinker-Talker 双塔）', '训练与全双工（训练阶段 / 全双工交互）'] },
    ],
  },
  {
    id: 'F', name: '应用层与系统设计', heavy: false,
    why: '软硬结合，三轮面重点',
    categories: [
      { name: '搜索推荐', oneliner: '多路召回/融合、粗排+精排、双塔、MMOE/ESMM、偏差（位置/选择）、冷启动、LLM 召回、实时、指标。',
        steps: ['全栈架构（工业推荐整体架构）', '多层级漏斗（召回 → 粗排 → 精排 → 重排）', '多目标与偏差（CTR/CVR/时长 / 位置与选择偏差）', '特征与实时（特征工程 / 特征存储 / 实时流）', '专项（视频配乐：生成 vs 检索 / 系统设计）'] },
      { name: 'RAG', oneliner: '检索/重排/索引、chunk 策略、混合检索、评估、与微调的取舍。',
        steps: ['基础范式（三段范式 / 文档切块）', '检索增强（向量库 / ANN / 混合检索 BM25+向量 / 查询改写 HyDE）', '重排与压缩（重排 / 元数据过滤 / 上下文压缩）', '自省纠错（Self-RAG / CRAG）', '选型与评测（embedding 选型 / 失败模式 / 评测 / RAG vs 微调）'] },
      { name: 'Agent Workflow', oneliner: 'agent 定义、ReAct、planning、tool calling 与失败恢复、memory、MCP vs FC、orchestration、可观测、安全、生产部署。',
        steps: ['定义与边界（Agent / Workflow 区别 / 什么不该用自主 Agent）', '核心范式（ReAct / planning / 反思 / CoT）', '手写实现（ReAct 循环 / tool 路由 / function caller / 记忆 buffer）', '记忆/多步/多Agent（上下文管理 / 任务调度 / 协作编排）', '工具与安全（MCP vs FC / Guardrails / human-in-loop）', '评测（轨迹级 / 失败模式）', '生产化（最小骨架 / 可观测 / 成本控制）'] },
      { name: '系统设计', oneliner: '推荐系统架构、多模态理解服务、推理服务架构、AB 实验平台、特征 pipeline（防 leakage）、向量检索、容量规划。',
        steps: ['理解（内容理解 Pipeline）', '推理（在线推理服务 / 多模态模型服务架构）', '推荐（高并发推荐架构）', '检索（向量检索系统 / 实时流 ETL）', '特征（特征工程 Pipeline / 一致性）', '实验（A/B 实验平台）', '容量（容量规划 / 限流降级）', '合规（内容安全与版权合规）'] },
    ],
  },
  {
    id: 'G', name: '系统与底层', heavy: false,
    why: '查漏补缺，压底层原理',
    categories: [
      { name: '计算机系统基础', oneliner: '进程/线程/协程、锁与原子操作、pinned memory、内存模型——被追问到实现细节时的底层兜底。',
        steps: ['执行单元（进程 / 线程 / 协程，Python GIL 影响）', '同步原语（Mutex / Spinlock / Atomic / CAS 场景）', '内存层级（Pageable / Pinned Memory / GPU 显存区别）'] },
    ],
  },
];

export const learningPath = [
  { stage: 1, domain: 'A. 算法与数据结构基础', why: '手撕是入场券，一二轮就考；先保 coding 不死，才有后面', invest: '持续每天 1 题边写边讲' },
  { stage: 2, domain: 'B. Transformer 与序列建模核心', why: '所有大模型题的底座，不先吃透架构和位置编码，训练/推理都说不清', invest: '重点，配"底层深度自检"' },
  { stage: 3, domain: 'C. 大模型训练体系', why: '理解模型怎么从数据变成权重，承接 B', invest: '重点' },
  { stage: 4, domain: 'D. 大模型推理与部署【岗重】', why: '岗位最硬核、权重最高；且和 B/C 直接咬合', invest: '最大头，反复刷' },
  { stage: 5, domain: 'E. 多模态与语音【岗重】', why: '岗位多模态+语音特性，建立在 B/D 之上', invest: '重点（按 JD 倾斜）' },
  { stage: 6, domain: 'F. 应用层与系统设计', why: '搜推/Agent/RAG/系统设计，把硬核用进业务闭环，三轮面重点', invest: '重点，配策略文档第 1–2 节' },
  { stage: 7, domain: 'G. 系统与底层', why: '查漏补缺、压底层原理，被追问到实现时的兜底', invest: '按需补漏' },
];

export const crossLines = [
  { name: '推理全链路', line: '大模型推理原理 → KV Cache → Continuous Batching → PagedAttention → 量化推理 → 服务性能评测' },
  { name: '训练全链路', line: 'Transformer 架构 → 训练与微调 → 分布式训练 → RL 后训练' },
  { name: '多模态落地', line: '多模态模型 → 大模型推理原理 → 流式推理工程 → 系统设计' },
  { name: 'Agent 生产化', line: 'Agent Workflow → 系统设计 → 服务性能评测' },
];

export const priorities = [
  { tier: 1, label: '第一梯队（必须滚瓜烂熟）', items: 'D 域全类（推理部署岗位直接匹配）、B 域（Transformer 与位置编码）、E 域（多模态与语音，岗位特性）' },
  { tier: 2, label: '第二梯队（要能讲闭环）', items: 'C 域（训练体系）、F 域（搜推/Agent/系统设计，三轮面重点）' },
  { tier: 3, label: '第三梯队（查漏补缺）', items: 'A 域（保手撕）、G 域（底层兜底）' },
];

// 按分类名快速查「本类主线」，供 list 视图横幅使用。
export const categoryThread = {};
for (const d of domains) {
  for (const c of d.categories) categoryThread[c.name] = { oneliner: c.oneliner, steps: c.steps, domain: d.name, heavy: d.heavy };
}
