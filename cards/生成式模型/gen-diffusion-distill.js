export default {
  "id": "gen-diffusion-distill",
  "kind": "concept",
  "category": "生成式模型",
  "title": "扩散蒸馏 / 一致性模型",
  "difficulty": "Hard",
  "prompt": "扩散蒸馏 / 一致性模型（如 LCM）是如何实现一步或极少步生成的？如何既保质量又加速？",
  "quickAnswer": "扩散蒸馏用教师（多步扩散）监督学生网络，使其单步或极少步就能从噪声映射到数据。一致性模型（CM）进一步约束同轨迹上不同噪声水平点映射到同一端点（self-consistency），从而任意步数都一致；LCM 在预训练 LDM 上做一致性蒸馏，常用 1–4 步出图，速度提升数量级且质量可控。",
  "code": "def consistency_loss(student, teacher, x, t, t2):\n    xt  = add_noise(x, t);  xt2 = add_noise(x, t2)\n    f1 = student(xt, t);  f2 = stop(teacher(xt2, t2))\n    return ((f1 - f2) ** 2).mean()        # 同端点一致性",
  "complexity": "O(S·H·W·C)，S=1~4",
  "beginnerSummary": "普通扩散要走上千步“台阶”下山，蒸馏像是直接教会模型“坐滑梯”一两步滑到底，还尽量不摔（保持画质）。",
  "explanationFocus": "是什么：扩散蒸馏 / 一致性模型是一类把多步扩散压缩为单步或极少步生成的加速技术，通过对齐教师轨迹或端点一致性来保质量。",
  "approach": "用预训练多步模型作教师，训练学生满足边界条件 f(x_T)=x_T 与自洽性 f(x_t,t)≈f(x_{t2},t2)；LCM 在 LDM 潜空间做此蒸馏，采样时一次或几次去噪即出图。",
  "derivation": [
    "为什么需要：千步采样落地贵，需 1–4 步实时生成。",
    "怎么实现：一致性约束 + 教师引导，潜空间蒸馏 LCM。",
    "有什么代价：蒸馏需额外训练且可能略损多样/细节；步数越少越易糊。",
    "怎么评测：比少步 FID 与时延，验证一步生成可用性。"
  ],
  "edgeCases": [
    "边界 t=0 须满足 f(x0,0)=x0 防止漂移。",
    "一步生成对复杂提示易结构错误，常用 2–4 步。",
    "与 CFG 蒸馏需把引导也并入学生。"
  ],
  "pitfalls": [
    "忽略边界条件→端点不一致、画面崩。",
    "用太少步强求零损质量→必妥协。"
  ],
  "prerequisites": [
    "DDIM / 确定性采样",
    "知识蒸馏",
    "一致性边界条件"
  ],
  "workedExample": [
    "以 50 步 SD 教师，在潜空间采同轨迹两点。",
    "训练学生满足两端点一致性损失。",
    "推理时 1 步从噪声得潜变量，VAE 解码成图。"
  ],
  "lineByLine": [
    "add_noise 在两点 t、t2 加噪得到 xt、xt2。",
    "student 预测端点，teacher 提供停止梯度的目标。",
    "一致性 MSE 约束同轨迹映射到同一结果，实现少步可用。"
  ],
  "followUps": [
    {
      "question": "LCM 与 GAN 加速有何不同？",
      "answer": "LCM 仍基于扩散框架、稳定不训崩；GAN 直接生成但易模式崩塌、难控。"
    },
    {
      "question": "一致性模型的边界条件？",
      "answer": "要求 f(x,0)=x，即干净点映射自身，保证轨迹自洽。"
    },
    {
      "question": "几步最实用？",
      "answer": "文生图常用 4 步，实时可用 1–2 步但需权衡细节。"
    }
  ],
  "followUpAnswers": [
    "LCM 仍基于扩散框架、稳定不训崩；GAN 直接生成但易模式崩塌、难控。",
    "要求 f(x,0)=x，即干净点映射自身，保证轨迹自洽。",
    "文生图常用 4 步，实时可用 1–2 步但需权衡细节。"
  ],
  "order": 11
};
