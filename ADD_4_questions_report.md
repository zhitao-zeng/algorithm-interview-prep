# 追加 4 道系统基础题（13–16）落地报告

> 时间：2026-07-13 ｜ 范围：用户 deferred 的 13–16 道
> 结果：`questions.js` 由 **277 → 281 题**，`node --test` **29/29 全绿**，新增 1 个类目 `计算机系统基础`。

## 一、新增清单

| # | id | 类目 | 难度 | 主题 | 关键纠偏点 |
|---|-----|------|------|------|-----------|
| 13 | `agent-eval-beyond-answer` | Agent Workflow | Hard | Agent 评估：为什么只看最终答案不够 | 强调轨迹级指标（工具/参数/顺序准确率）+ 确定性 checker 优于 LLM-as-Judge + 阶段归因；不写“一定/必然” |
| 14 | `sys-proc-thread-coroutine` | 计算机系统基础 | Medium | 进程/线程/协程 + Python GIL | GIL 只锁 Python 字节码不锁 I/O 与释放 GIL 的 C 扩展；多线程 CPU 密集不并行、I/O 密集仍有效 |
| 15 | `sys-lock-atomic` | 计算机系统基础 | Hard | Mutex / Spinlock / Atomic / CAS | 临界区长度决定睡眠锁 vs 自旋锁；CAS 讲清 ABA（版本号缓解）；False Sharing（对齐/填充缓解） |
| 16 | `sys-pinned-memory` | 计算机系统基础 | Hard | Pageable / Pinned / GPU 显存 | `non_blocking=True` 仅当源已 Pinned 才真异步；Pinned 过多会挤占主机内存 |

## 二、关于 #13 的重要决策（避免重复膨胀）

原仓库 265 题中**已存在** `agent-eval`（标题“Agent 的评测”），覆盖了评测的多维框架。你 spec 里的 #13 主题与之高度重叠。

按你一贯的“控制数量、不要重复铺题”原则，我**没有**造一张近似重复卡，而是把 #13 改成**互补角度**：
- id 改为 `agent-eval-beyond-answer`
- 聚焦你 spec 里最锋利的切入点：**“为什么只看最终答案不够”** + 显式指标表（工具选择准确率 / 参数正确率 / 调用顺序正确率 / 无效调用 / 失败恢复率 / 副作用）+ 确定性 checker 与 LLM-as-Judge 的取舍 + 失败阶段归因（规划/选择/参数/执行）

这样既补齐了原卡没细讲的“过程指标 + 可自动验证”实操，又不和已有 `agent-eval` 撞车。如果你更想**合并**进原卡或改名，告诉我即可。

## 三、类目处理

现有 22 个类目全是算法/ML 方向，**没有 OS/体系结构类目**。这 3 道系统题（14/15/16）无合适归属，故**新建 1 个类目 `计算机系统基础`**（仅 1 个，不是“十个栏目”），并追加进 `categories` 数组，使前端筛选下拉能正常显示。
- `agent-eval-beyond-answer` 归属现有 `Agent Workflow`（不新开类目）。

## 四、schema 与校验（与既有 265/277 卡完全一致）

- 24 字段顺序/类型严格对齐既有卡。
- `followUps` 用 `[{question, answer}]`，`followUpAnswers` 为并行简短答案，二者**等长**（脚本断言）。
- 每张卡通过 `validateQuestionCard` 的 **default + beginner** 双契约后才写入。
- 插入用边界锚定：`export const questions` 是文件最后一个 export，其收尾 `];` 即全文件最后一个 `];`（避开卡片字符串内的嵌套括号误判）。

## 五、验证结果

- `questions.length = 281`（277 + 4）
- `categories.length = 23`（22 + 1）
- 4 个新 id 全部存在；3 张系统卡类目均为 `计算机系统基础`
- `followUps.length === followUpAnswers.length` 在 4 张卡上均成立
- 代码/图示字段渲染正常（含 `\n` 真换行）
- `node --test`：**29 passed / 0 failed**

## 六、过程中的坑（已解决）

1. **id 冲突**：`agent-eval` 已存在 → 改为互补角度 `agent-eval-beyond-answer`。
2. **类别防护误判**：脚本里 `out.includes('计算机系统基础')` 因新卡 `category` 字段本身含该串而假阳性中止 → 删掉这条过宽的防护，改用唯一锚点 `, "Agent Workflow"];` 做一次替换（该锚点在文件中唯一）。

## 七、备份

- `questions.js.b277.bak`：本次插入前 277 基线（可留作 diff / 回滚）
- `questions.js.pre-add.bak`：修复后 265 基线（之前批次）
- `questions.js.bak`：最早 265 基线
- 确认无误后可清理这些 `.bak`。

## 八、累计进度

- P0+P1 修复：10 处明确错误 + 7 处绝对化措辞（已在 `P0_P1_fixes_applied.md`）
- 第一批新题：12 道（推理/架构/Agent/推荐，见 `ADD_12_questions_report.md`）
- 第二批新题：本批 4 道（系统基础）
- 题库总量：**281 题**，类目 23 个。
