# 题卡技术正确性审查笔记

> **状态（已闭环）**：本笔记所列全部 `[LOW]`/`[MED]` 错误已在 commit `b791989` 修复并推送 `main`（共 41 张卡 + 生成产物 app.js/questions.js/index.html），GitHub Pages 自动重建上线。
> - 已修复：ir-vllm(NameError)、ir-paged-attn(@k→@v)、ir-tensor-parallel(列切/行切 all-reduce 澄清)、ir-trtllm(A100 FP8→H100)、onnx-dynamic-batch-shape(废代码)、onnx-trt-int8-calibration(对称量化无 zero-point)。
> - 无需改：ir-speculative 经复核"未发现有把握的技术错误"；de-mixture-curriculum 未被标记，均无硬伤。
> - 非可见噪声：`followUpAnswers` 与 `followUps` 的不一致经核实为 legacy 非显示字段（renderer 只用 `followUps[].answer`），未做批量改动。

## 推理框架 (cards/推理框架/) — 共 16 张
- [LOW] 推理框架/ir-vllm : code 的 BlockTable.append 里条件 `len(self.mapping[seq_id])*self.block_size == len(allocated)` 引用了未定义的变量 `allocated`；且循环从未按已分配 token 数计数，逻辑无法正确按需分配块（实际运行会 NameError）。建议改为用已 append 的 token 计数判断是否需要新块，例如 `if len(allocated_tokens) % block_size == 0: 分配新块`。概念讲解本身准确。
- [LOW] 推理框架/ir-paged-attn : code 中注意力输出写成 `softmax(q @ k.T / sqrt(d)) @ k`，把 K 当成了 V。正确应为 `@ v`（且需同时 gather V 块）。属演示代码片段错误，概念文字正确。建议改为 `@ v`。
- [MED] 推理框架/ir-tensor-parallel : 文字把 TP 描述为"列切分做并行 GEMM，各卡算一部分再用 all-reduce 求和"。这混淆了 Megatron 两种切分：列并行层（column-parallel）输出是各卡 chunk 直接拼接/concat，**没有** all-reduce；真正做一次 all-reduce(sum) 的是其后的行并行层（row-parallel，对各卡 partial 求和）。卡内 codeNotes 反而是对的（"列切+行切配对只需一次 all-reduce"）。quickAnswer/approach 的"列切+all-reduce"表述会导致读者误解切分对象。建议明确：列切→concat；行切→all-reduce(sum)；二者配对时层间仅一次通信。
- [MED] 推理框架/ir-trtllm : walkthrough/workedExample 写"4×A100 开启 FP8"把 70B 吞吐提到 3000+。但 A100 是 Ampere 架构，硬件不支持 FP8（FP8 计算需 Hopper/H100 及以上）。该卡自己的 followUps 也写"FP8 需 Hopper 以上支持"，前后自相矛盾且事实错误。建议把示例改成 H100，或在 A100 上只用 INT8/FP16 并去掉 FP8 说法。
- 其余（ir-continuous-batch, ir-prefix-cache, ir-cuda-graph, ir-radix-attn, ir-chunked-prefill, ir-mla-deepseek, ir-quant-kernel, ir-disagg, ir-disagg-impl, ir-microbatch, ir-sglang, ir-speculative）：未发现有把握的技术错误，讲解与复杂度声明基本准确。

## 推理芯片适配 (cards/推理芯片适配/) — 共 16 张
- 全部 16 张（hw-ascend, hw-memory-hierarchy, hw-hbm, hw-mixed-prec, hw-quant-on-chip, hw-quant-int4, hw-op-fusion, hw-operator-reuse, hw-graph-compile, hw-npu-kernel, hw-sparsity, hw-utilization-opt, hw-cross-chip, hw-async-pipeline, hw-software-stack, hw-benchmark）已逐张复核。内容涉及 CANN/GE/TBE/Da Vinci 分层、HBM 2.5D 封装、混合精度、INT8/INT4 芯片端量化、算子融合、2:4 结构化稀疏、MFU/HFU、跨芯片精度对齐、异步双缓冲等，**均未发现有把握的技术错误**。讲解事实与代码示意一致，无自相矛盾。注：hw-quant-on-chip/hw-quant-int4 提到的 scale/zero-point 是芯片端 affine/per-channel 量化的合法表述，并非 TRT 专用问题，无需修改。

## ONNX_TensorRT (cards/ONNX_TensorRT/) — 共 20 张
- [LOW] ONNX_TensorRT/onnx-dynamic-batch-shape : code 里 `buf = np.empty(engine.get_binding_shape(0) if False else shape, ...)` 用了无意义的 `if False else shape` 三元表达式，且 `buf` 后续从未使用，属于误导/废代码。建议改为按 profile 的 max 形状预分配 buffer 并真正把输入拷入。
- [LOW] ONNX_TensorRT/onnx-trt-int8-calibration (以及 onnx-trt-fp16-int8 的 followUp) : 反复写 INT8 校准"确定量化 scale/zero-point"。但 TensorRT 标准 INT8 路径是**对称量化**，zero-point 隐式为 0，并没有独立的 zero-point 参数。提"zero-point"易误导读者以为 TRT 做了非对称量化。建议改为"per-tensor/per-channel scale（对称）"。
- 其余（onnx-what, onnx-to-trt, onnx-trt-what, onnx-trt-build-engine, onnx-trt-dynamic-shape, onnx-qat-to-trt-int8, onnx-trt-optimizations, onnx-graph-optimization, onnx-opset-fusion, onnx-trt-plugin, onnx-trt-llm-intro, onnx-trt-latency-compare, onnx-trt-deploy-best-practice, onnx-deployment-pitfalls, onnx-multi-framework, onnx-export-issues, onnx-evaluate-trt-speedup）：共 18 张，未发现有把握的技术错误，构建流程/动态 shape/校准/QAT/plugin 等描述基本准确。

## 量化推理 (cards/量化推理/) — 共 18 张
- 全部 18 张（quant-what, quant-int8-sym-asym, quant-calibration, quant-granularity, quant-dequant-qmm, quant-dynamic-vs-static, quant-fp8, quant-int4-awq, quant-int4-gptq, quant-ptq-vs-qat, quant-outlier-smoothquant, quant-deploy-pitfalls, quant-eval-accuracy, quant-hardware, quant-weight-act-kv, quant-w4a16-equivalence, quant-speedup, quant-mixed-precision）已逐张复核。**均未发现有把握的技术错误**。对称/非对称、per-tensor/channel/group、PTQ/QAT、SmoothQuant、AWQ/GPTQ(INT4)、FP8(E4M3 ±448)、W4A16 等价性、KV 量化、Roofline 加速比估算等讲解与代码、数值均准确一致。

## 多GPU并行 (cards/多GPU并行/) — 共 16 张
- 全部 16 张（mgpu-why-multi, mgpu-tp, mgpu-pp, mgpu-dp, mgpu-sp, mgpu-ep, mgpu-zero, mgpu-nccl, mgpu-comm-compare, mgpu-tp-comm, moe-ep-alltoall, mgpu-pp-1f1b, mgpu-tp-infer, mgpu-pp-bubble, mgpu-tp-matmul, mgpu-strategy）已逐张复核。**均未发现有把握的技术错误**。Megatron 列切(concat)/行切(all-reduce)配对、PP bubble 公式 (P-1)/(m+P-1)、1F1B、ZeRO 分片、EP all-to-all、NVLink/IB 拓扑布局等讲解准确，代码示意与文字一致，无自相矛盾。
