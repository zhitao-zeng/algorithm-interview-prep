export default {
  "id": "gen-lora",
  "category": "多模态生成应用",
  "difficulty": "Medium",
  "title": "LoRA 微调扩散模型与适配器状态恢复坑",
  "prompt": "用 diffusers 微调扩散模型时，为什么直接恢复 Lightning LoRA 的 adapter 状态会让加速失效，应如何排查与恢复？",
  "quickAnswer": "diffusers 的 adapter 状态保存/恢复若命中 Lightning 自定义模块会错位，导致 LoRA 权重未真正挂载；应改用 set_adapters 的 scale 切换，并在恢复前用 32 步无 LoRA 的 anchor 图重建基准，再加载 LoRA。",
  "code": "import torch\nimport torch.nn as nn\n\nclass LoRALinear(nn.Module):\n    def __init__(self, base: nn.Linear, r: int = 4, alpha: float = 8.0):\n        super().__init__()\n        self.base = base\n        self.base.weight.requires_grad_(False)\n        self.lora_a = nn.Parameter(torch.randn(r, base.in_features) * 0.01)\n        self.lora_b = nn.Parameter(torch.zeros(base.out_features, r))\n        self.scale = alpha / r\n\n    def forward(self, x):\n        return self.base(x) + (x @ self.lora_a.T @ self.lora_b.T) * self.scale\n\ndef safe_recover(pipe, lora_path, anchor_steps: int = 32):\n    # 不用 adapter 状态恢复, 改用 scale 切换, 并先用 32 步无 LoRA anchor 恢复基准\n    pipe.set_adapters(['default'], adapter_weights=[0.0])\n    base_latents = pipe('', num_inference_steps=anchor_steps).images\n    pipe.load_lora_weights(lora_path)\n    pipe.set_adapters(['default'], adapter_weights=[1.0])\n    return base_latents\n",
  "complexity": "注入 LoRA 额外时间 O(r·(in+out))、空间 O(r·(in+out))；恢复为 O(1) 元数据操作",
  "beginnerSummary": "LoRA 像给大模型贴两张轻薄便利贴来改笔迹；恢复时若贴歪了，加速贴纸就白贴，要先撕掉重贴并对齐基准。",
  "derivation": [
    "为什么需要：全量微调扩散模型显存高、易遗忘，LoRA 用低秩增量只训小矩阵，便于多风格切换。",
    "怎么实现：在 Linear 上并联 A·B 低秩分支并以 α/r 缩放，冻结原权重；切换风格只换 adapter 及其 scale。",
    "有什么代价：LoRA rank 过小会欠拟合，过大又接近全量；Lightning 等加速 LoRA 依赖特定模块名，状态恢复易错位。",
    "怎么评测：对比恢复前后同 seed 出图与无 LoRA baseline 的相似度，确认加速 LoRA 生效且画质不漂移。"
  ],
  "edgeCases": [
    "多个 LoRA 同时挂载时 adapter 名冲突会被静默覆盖。",
    "Lightning LoRA 与基础 LoRA 的模块命名空间不同，直接 load 会 KeyError。",
    "scale 设为 0 不等于卸载，仍需 set_adapters 显式切换避免残差。",
    "恢复时 pipeline 已缓存 latent 会导致 anchor 图不一致。"
  ],
  "pitfalls": [
    "用 save_pretrained 后直接 load_lora_weights 恢复 Lightning 状态，会因模块名不匹配使加速失效还无报错。",
    "误以为 adapter_weights=[0.0] 等同于卸载 LoRA，实际分支仍在计算图里。"
  ],
  "prerequisites": [
    "低秩分解与微调基础",
    "diffusers 的 adapter / pipeline 机制",
    "扩散模型采样与步数调度"
  ],
  "workedExample": [
    "复现故障：加载 Lightning LoRA 后出图与无加速版本无异，定位到 adapter 状态未挂载。",
    "按 safe_recover 先用 32 步无 LoRA 生成 anchor 基线，再 load + scale=1.0，确认加速生效且身份一致。"
  ],
  "lineByLine": [
    "class LoRALinear(nn.Module)：在原有 Linear 上定义低秩包装层。",
    "self.base.weight.requires_grad_(False)：冻结原权重，只训增量。",
    "self.lora_a/lora_b：定义 r×in 与 out×r 两个小矩阵作为低秩分支。",
    "self.scale=alpha/r：用 α/r 控制低秩增量幅度。",
    "forward：输出原分支 + 低秩分支缩放结果。",
    "def safe_recover：恢复函数，先用 scale=0 走 32 步无 LoRA anchor。",
    "pipe.load_lora_weights + set_adapters scale=1.0：最后挂载并打开 LoRA。"
  ],
  "followUps": [
    {
      "question": "如何验证 Lightning LoRA 真的生效而不是被忽略？",
      "answer": "固定 seed 对比开启/关闭加速的延迟与单步耗时，并比对 latent 轨迹，若耗时与画质都无差异说明未挂载。"
    },
    {
      "question": "为什么要用 32 步无 LoRA 的 anchor？",
      "answer": "anchor 提供稳定的基准分布，恢复后以此为参照校验 LoRA 是否引入预期偏移，避免把 baseline 漂移误判为成功。"
    },
    {
      "question": "多 LoRA 组合时 scale 怎么设？",
      "answer": "按风格权重给每个 adapter 单独 adapter_weights，并确保总权和不溢出，必要时归一化。"
    }
  ],
  "followUpAnswers": [
    "固定 seed 对比开启/关闭加速的延迟与单步耗时，并比对 latent 轨迹，若耗时与画质都无差异说明未挂载。",
    "anchor 提供稳定的基准分布，恢复后以此为参照校验 LoRA 是否引入预期偏移，避免把 baseline 漂移误判为成功。",
    "按风格权重给每个 adapter 单独 adapter_weights，并确保总权和不溢出，必要时归一化。"
  ],
  "explanationFocus": "是什么：LoRA 是向预训练权重并联低秩矩阵、只训练小增量参数的高效微调方法；在扩散模型里它通过 adapter 机制实现多风格热切换。",
  "approach": "排查加速失效时放弃 adapter 状态整体恢复，改为 scale 切换 + 无 LoRA anchor 重建基准，再加载并开启 LoRA，从而隔离 Lightning 模块命名错位问题。",
  "kind": "concept"
};
