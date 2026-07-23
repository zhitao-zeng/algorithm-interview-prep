// add-caveats.mjs — append fact-check caveats to fast-moving cards (MoE/vLLM/FP8...).
// Safe: edits one cards/<id>.js at a time, idempotent (skips if marker already present).
import { writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cardsDir = path.resolve(__dirname, '..', 'cards');
const importFresh = (p) => import(pathToFileURL(p).href + `?t=${Date.now()}`);
const cardToFile = (c) => `export default ${JSON.stringify(c, null, 2)};\n`;

const MARKER = '（事实核查';
const CAVEATS = {
  'moe-router':
    '（事实核查·2025）常见过时设定：Mixtral 8x7B 是 8 专家 Top-2；而 DeepSeek-V3 已是 256 个路由专家 + 1 个共享专家、每 token Top-8，并采用 aux-loss-free（无辅助损失，用 bias 偏置做负载均衡）。面试按最新配置答，别把两者混为一谈。',
  'moe-ep-alltoall':
    '（事实核查·2025）EP 的通信核心是 all-to-all 交换 token：把每个 token 发给持有目标专家的 GPU，算完再 all-to-all 收回。DeepSeek 用 group-limited routing 限制每 token 最多发往少数节点以压通信量；vLLM 的 MoE 同样走 all-to-all。别以为 MoE 只是“矩阵乘换大一点”。',
  'mgpu-ep':
    '（事实核查·2025）专家并行(EP)把专家切到多卡，token 经 all-to-all 重排；常与 DP/TP 组合（如 EP+DP）。DeepSeek 训练/推理用大规模 EP（跨数十卡）。代价是 all-to-all 通信与负载不均，需要 capacity factor 与 token dropping 兜底。',
  'mm-mla-vs-attn':
    '（事实核查·2025）MLA（DeepSeek）用低秩投影压缩 K/V，KV 缓存可降到 MHA 的约 1/10~1/20，是长上下文 KV 压缩的 SOTA 路线；区别于 MQA（单 KV 头）和 GQA（分组 KV 头）。被问“怎么减 KV”优先答 MLA/量化/GQA 三档。',
  'pa-vllm-impl':
    '（事实核查·2025）vLLM V1 已重构为 unified scheduler + 连续批处理；PagedAttention 把 KV 缓存按 block 分页管理以减碎片，并支持 chunked prefill 与投机解码。别只背“PagedAttention 显存省”，要能讲 scheduler 如何统一排队 prefill/decode。',
  'cb-vllm':
    '（事实核查·2025）vLLM V1 相比 V0 重构了调度与前后端，吞吐更高、支持投机解码与更细的批处理；实测常与 TRT-LLM / SGLang 同台比较。答“高吞吐推理框架”要能列 vLLM / TRT-LLM(+Dynamo) / SGLang 的差异。',
  'cb-trt-llm':
    '（事实核查·2025）NVIDIA 方向是 TensorRT-LLM 配合 NVIDIA Dynamo 做分布式推理服务（disaggregated prefill/decode、请求路由、弹性）。支持 in-flight batching、paged KV、FP8。别把 TRT-LLM 当孤立库，现在强调与 Dynamo 编排协同。',
  'quant-fp8':
    '（事实核查·2025）FP8(E4M3/MXFP8) 已用于训练前向与推理降本；Blackwell 进一步引入 NVFP4（FP4）把权重/激活压更狠。注意 FP8 训练需要 careful loss scaling 与收敛性验证，并非无脑替换。要能量化“精度换算力”的 trade-off。',
  'inf-speculative-decoding':
    '（事实核查·2025）投机解码 = 小草稿模型 draft 多个 token + 大目标模型并行 verify（一次前向验证一整段）。加速比取决于草稿接受率，且草稿模型本身有开销；并非所有场景都划算（高接受率才显著加速）。',
};

let changed = 0;
for (const [id, caveat] of Object.entries(CAVEATS)) {
  const file = path.join(cardsDir, `${id}.js`);
  if (!existsSync(file)) {
    console.log(`skip ${id}: file not found`);
    continue;
  }
  const mod = await importFresh(file);
  const card = mod.default;
  const arr = Array.isArray(card.pitfalls) ? card.pitfalls : (card.pitfalls = []);
  if (arr.some((s) => typeof s === 'string' && s.startsWith(MARKER))) {
    console.log(`skip ${id}: caveat already present`);
    continue;
  }
  arr.push(caveat);
  writeFileSync(file, cardToFile(card));
  changed++;
  console.log(`+ caveat -> ${id} (pitfalls now ${arr.length})`);
}
console.log(`done: ${changed} card(s) updated`);
