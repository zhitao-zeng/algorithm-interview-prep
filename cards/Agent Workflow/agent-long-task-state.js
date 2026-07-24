export default {
  "id": "agent-long-task-state",
  "kind": "concept",
  "category": "Agent Workflow",
  "difficulty": "Hard",
  "title": "长程任务的状态管理",
  "prompt": "Agent 执行需要数小时甚至跨天的长程任务时，状态该怎么管理才能保证可恢复、可审计、可隔离？",
  "quickAnswer": "把长程任务拆成可持久化的\"步骤+状态\"单元：每次状态变更后 checkpoint 落库（数据库/KV），使进程重启能从断点 resume；在不可逆/高风险步骤前插入 human approval gate 暂停等待；多会话用 session_id 做并发隔离与租约；崩溃后靠事件日志/补偿事务恢复。目标是让\"长跑任务\"像可暂停的下载，而非一断就重来的脆弱脚本。",
  "approach": "步骤化建模→checkpoint 持久化→人工 gate→会话隔离(租约)→崩溃恢复(日志/补偿)。",
  "explanationFocus": "是什么：长程任务的状态管理是把跨小时/跨天的 Agent 运行拆成可持久化、可恢复、可隔离的状态单元，通过 checkpoint、人工 gate、会话租约与崩溃恢复机制，让任务在中断后能从断点继续而非整体重跑。",
  "bruteForce": "把整个长任务塞进一个内存变量循环跑：进程一崩或机器一重启，几小时进度全丢，且无法让人中途介入确认。",
  "invariant": "任何\"已产生外部副作用的步骤\"之前必须已有持久化 checkpoint，且恢复后该步骤要么未被提交、要么幂等可重放，绝不允许双重执行。",
  "walkthrough": "以\"自动对账+批量退款\"任务为例，需处理 1,000,000 笔流水、跨约 6 小时。系统把任务切成 1000 个 batch（每批 1000 笔），每完成一个 batch 写 checkpoint 到 Postgres（状态=batch_index=327, 已退款额=...）；进程在第 500 批时宕机，重启读 checkpoint 从 501 批续跑，省下 500 批重算。在\"实际发起退款\"前插入 human approval gate，运营在控制台确认金额无误才放行。100 个并发 session 各自带 session_id 与 30 分钟租约，互不踩踏；恢复时校验租约避免双活。最终 p99 恢复时间<2s。",
  "derivation": [
    "为什么需要：长任务内存态脆弱、易因重启/超时丢失；不可逆动作需人工把关；并发会话需隔离防串数据。",
    "怎么实现：任务步骤化并每步 checkpoint 落库(KV/DB)；不可逆步骤前 pause 等 human approval；session 用唯一 id+租约隔离；崩溃靠事件日志回放或补偿事务重建。",
    "有什么代价：持久化增加写放大与延迟；gate 拉长任务墙钟时间；租约/幂等设计复杂；存储需可靠。",
    "怎么评测：注入崩溃看恢复点准确性与重复执行数；压测并发 session 隔离；统计人工 gate 的误拦/漏拦。"
  ],
  "edgeCases": [
    "进程在\"写 checkpoint\"与\"执行副作用\"之间崩溃，需二者顺序与幂等。",
    "人工 gate 超时未确认，需超时自动取消或升级。",
    "同一个 session 双实例抢跑，靠租约/分布式锁防重。"
  ],
  "code": "def run_long_task(task, session):\n    lease = acquire_lease(session.id, ttl=1800)        # 并发隔离\n    state = load_checkpoint(task.id) or State(step=0)   # 断点恢复\n    for i in range(state.step, task.total_steps):\n        if task.steps[i].irreversible:\n            wait_human_approval(task.steps[i])          # 人工 gate\n        result = execute(task.steps[i])\n        save_checkpoint(task.id, State(step=i+1, last=result))  # 先落库\n        if not lease.valid(): raise LostLease()         # 防双活",
  "codeNotes": [
    "checkpoint 与副作用执行要严格排序，必要时走事务保证原子。",
    "gate 与租约是长任务的\"安全气囊\"，宁可慢不可乱。"
  ],
  "complexity": "checkpoint 写为 O(步骤数) 的 DB 写入；恢复为 O(1) 读最新点。主要开销在持久化与锁，不随任务总时长线性增长，仅随步骤数增长。",
  "followUps": [
    {
      "question": "checkpoint 频率怎么定，太频繁会有什么问题？",
      "answer": "频率过低崩溃丢进度多，过高则写放大拖慢吞吐。经验是按\"副作用粒度\"落点：每个不可逆/耗时步骤后必落，纯计算中间态可合并，平衡恢复粒度与写开销。"
    },
    {
      "question": "人工 gate 会不会把长任务拖垮，怎么优化？",
      "answer": "会拉长墙钟时间。优化法：批量 gate（聚多步一次确认）、低风险自动过+异常才升级、给 gate 设超时自动取消/转人工队列，并用预校验减少无效等待。"
    }
  ],
  "followUpAnswers": [
    "按副作用粒度落点，平衡恢复粒度与写放大。",
    "批量 gate+低风险自动过+超时策略，减少等待。"
  ],
  "pitfalls": [
    "checkpoint 频率过低，崩溃丢失大量进度；过高则写放大拖慢。",
    "恢复时未校验幂等，导致退款/发消息被重复执行。"
  ],
  "beginnerSummary": "长任务状态管理像下载大文件：每下完一段就记个进度点（checkpoint），断网重连从断点继续，不用从头下。遇到\"付钱\"这种不能反悔的步骤，先弹窗问你确认（human gate）；多个下载同时跑各有自己的编号和时限（session 隔离），不会互相覆盖。",
  "prerequisites": [
    "理解幂等与补偿事务。",
    "有可靠的 KV/数据库与租约机制。",
    "能区分可逆与不可逆步骤。"
  ],
  "workedExample": [
    "百万级对账任务按 1000 批落 checkpoint，宕机后从断点续跑省一半算力。",
    "退款前 human gate 拦截了一笔金额异常（多一个 0）的批次。"
  ],
  "lineByLine": [
    "把长任务切成可编号的步骤单元，每步明确输入/输出与副作用。",
    "每步完成后写 checkpoint（含步骤序号与已提交副作用摘要）再继续。",
    "遇不可逆步骤先 pause 并把上下文交人工 gate，确认后再 commit。",
    "用 session_id+租约保证并发隔离，恢复时校验避免双活重放。"
  ],
  "diagram": "长任务 ─▶ [步骤1 ▣checkpoint] ─▶ [步骤2 ▣] ─▶ [不可逆? ▶ human gate] ─▶ ...\n                         │                                  │\n                    崩溃重启 ◀── 读 checkpoint 续跑 ────────┘\n并发：session_A(租约) | session_B(租约) | session_C(租约)  互不踩踏"
};
