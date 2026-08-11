# Bucket 7 技术正确性审查报告

审查范围：服务性能评测、安全红队、多GPU并行、MoE 架构、生成式模型、PagedAttention（共 94 张卡片，全部逐篇阅读）。
审查维度：公式/数学、代码正确性、数值事实、内部一致性、领域事实。仅报告有把握的错误（保守原则）；不报告 `followUpAnswers` 与 `followUps[].answer` 的差异（legacy 字段不参与渲染），也不报告措辞/格式类问题。

---

## [HIGH] cards/MoE 架构/me-shared-expert.js — code

**问题**：`MoEWithShared.forward` 中用 `idx[..., r]`（形状 `[B]`）对 `all_out`（形状 `[E, B, d_ff]`）做整数索引，得到形状 `[B, B, d_ff]`；随后 `w * all_out[idx[..., r]]`（w 为 `[B,1]`）按广播得到 `[B, B, d_ff]`，与 `h_route`（`[B, d_ff]`）相加后整体形状污染为 `[B, B, d_ff]`。最终 `h_shared + h_route` 形状为 `[B, B, d_ff]`，而非卡片 `invariant` 与 `walkthrough` 声称的 `[B, d_ff]`（`输出 = h_shared + h_route`）。代码既会在形状上出错，也会把不同样本的专家输出错误混叠（batch 维被展开），不产出注释与文字说明所声称的结果。

**修复**：用二维索引按 (专家下标, 样本下标) 正确 gather 出 `[B, d_ff]`：

```python
def forward(self, x):
    h_shared = self.shared(x)                     # [B, d_ff]
    gate = torch.softmax(self.gate(x), dim=-1)    # [B, E]
    idx = torch.topk(gate, k, dim=-1).indices     # [B, k]
    all_out = torch.stack([expert(x) for expert in self.experts])  # [E, B, d_ff]
    h_route = torch.zeros_like(h_shared)
    batch_idx = torch.arange(x.shape[0]).unsqueeze(-1)   # [B, 1]
    for r in range(k):
        w = gate.gather(-1, idx[..., r:r+1])      # [B, 1]
        expert_out = all_out[idx[..., r], batch_idx]      # [B, d_ff]  ← 修正点
        h_route = h_route + w * expert_out
    return h_shared + h_route                      # [B, d_ff]
```

---

## [HIGH] cards/安全红队/se-multimodal-attack.js — code / lineByLine

**问题**：`pgd_attack` 实现既不是合法的 PGD，也和文字说明矛盾：
1. **缺少 L∞ 投影（clamp）**：每步 `adv = adv + eps * sign(g)`，连续 10 步后扰动总量 = `10 * eps = 0.3`，远超声明的预算 `eps=0.03`，完全脱离了 ε-球。`codeNotes` 自己都写"实际应对 adv 做 clip 回合法范围"，但代码并未做。
2. **梯度对象错误**：`g = grad(model(adv), adv)` 求的是"模型原始输出（logits）对输入"的梯度，而非"损失对输入"的梯度。合法 PGD 应在损失（如对目标/真实标签的 cross-entropy）上反向传播。`lineByLine` 却把 `g` 描述为"求损失对输入的梯度"，与代码不符。
3. 缺少 `requires_grad` / `detach` 处理，逐次迭代会在计算图里堆叠。

**修复**：以损失为目标、带投影的 PGD：

```python
import torch.nn.functional as F

def pgd_attack(model, image, label, eps=0.03, steps=10, alpha=None):
    alpha = eps / steps if alpha is None else alpha
    adv = image.clone().detach().requires_grad_(True)
    for _ in range(steps):
        loss = F.cross_entropy(model(adv), label)   # 在损失上反向
        model.zero_grad()
        loss.backward()
        with torch.no_grad():
            g = adv.grad.sign()
            adv = adv + alpha * g                    # 小步长
            adv = torch.clamp(adv, image - eps, image + eps)   # ← 投影回 ε 球
            adv = torch.clamp(adv, 0, 1)             # 合法像素范围
        adv.requires_grad_(True)
    return adv.detach()
```

---

## [MED] cards/多GPU并行/mgpu-comm-compare.js — code（与 derivation/walkthrough/codeNotes 内部不一致）

**问题**：TP 通信量在代码与文字中不一致。
- 代码：`if mode == 'tp': return 2 * s * h / t`（多了 `/t`）。
- `derivation`、walkthrough、`codeNotes` 均写 TP 每层 all-reduce 量 "≈ 2·s·h"（无 `/t`）。

按 ring all-reduce，单张激活张量（尺寸 `s·h`）的通信量约为 `2·(t-1)/t · s·h ≈ 2·s·h`（与并行度 t 无关，`(t-1)/t→1`）。因此文字的 `2·s·h` 是正确的，代码的 `2·s·h/t` 会把通信量低估约 t 倍，且二者自相矛盾。

**修复**：代码应与文字一致（保留 `(t-1)/t` 更精确）：

```python
if mode == 'tp':   return 2 * s * h * (t - 1) / t   # 每层 all-reduce（≈2·s·h）
```

---

## [MED] cards/多GPU并行/mgpu-tp-matmul.js — codeNotes（领域事实错误）

**问题**：`codeNotes` 写"行切输出沿 batch 维求和"，这是错误的维度描述。行切（按行 / 按输出特征维拆分 W：`W=[W1;W2]`）时，各卡持有完整 batch（batch 维在每张卡上都完整保留），各自算出部分输出后做 all-reduce **求和的是输出特征（hidden）维**，而非 batch 维。卡片正文 `derivation` 的 "Y=XW1+XW2 需 all-reduce 求和" 描述正确，唯独 `codeNotes` 把被求和的维写成了 batch 维。

**修复**：

```
"列切输出沿特征维拼接。"
"行切输出沿特征（输出 hidden）维做 all-reduce 求和；batch 维在每张卡上完整保留。"
```

---

## [MED] cards/多GPU并行/mgpu-pp-1f1b.js — walkthrough / workedExample（算术不一致）

**问题**：`walkthrough` 与 `workedExample` 写 GPipe 气泡"约 43%（=(P-1)/(m+P-1)=3/23）"。但 `(P-1)/(m+P-1)` 在 `P=4, m=20` 时为 `3/23 ≈ 0.130`，即约 **13%**，不是 43%。数值 43% 实际对应另一组配置 `P=4, m=4`（`3/7≈43%`），该值已在 `mgpu-pp-bubble.js` 中正确出现。此处把公式（3/23）与结论（43%）写成了互相矛盾的一组数，属于明显的算术笔误。

**修复**：将 GPipe 气泡值改为与公式一致的约 13%：

```
warmup 4 个前向后进入 1F1B，气泡从 GPipe 的约 13%（=(P-1)/(m+P-1)=3/23）降到约 15%（≈(P-1)/m=3/20）。
```

（注：本卡聚焦"1F1B 把大气泡切碎"的定性结论成立；上述仅纠正 GPipe 数值与所列公式不自洽这一处。若需严格对比两调度气泡，建议同时核对 1F1B 气泡公式 `(P-1)/m` 与 GPipe `(P-1)/(m+P-1)` 在 m≫P 时渐近相等这一事实，避免"43%→15%"式的误导表述。）

---

## 审查小结

| 指标 | 数值 |
|---|---|
| 审查卡片总数 | 94 |
| [HIGH] | 2 |
| [MED] | 3 |
| [LOW] | 0 |

**分类分布**：
- MoE 架构（14 张）：1 处 HIGH（me-shared-expert.js 代码形状 bug）
- 安全红队（18 张）：1 处 HIGH（se-multimodal-attack.js PGD 缺投影/梯度对象错）
- 多GPU并行（16 张）：3 处 MED（mgpu-comm-compare.js 通信量 `/t` 不一致；mgpu-tp-matmul.js 行切维度描述错；mgpu-pp-1f1b.js 气泡算术 13% 误为 43%）
- 服务性能评测（20 张）：0 处
- 生成式模型（14 张）：0 处
- PagedAttention（12 张）：0 处

其余 89 张卡片在所审查的技术维度（公式、代码、数值、内部一致性、领域事实）上未发现需报告的错误。
