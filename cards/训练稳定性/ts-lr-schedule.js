export default {
  "id": "ts-lr-schedule",
  "category": "训练稳定性",
  "difficulty": "Easy",
  "title": "学习率调度与warmup",
  "prompt": "为什么大模型训练需要warmup和LR调度，常见策略怎么选？",
  "quickAnswer": "训练初期权重随机、梯度大，直接上大LR易把参数甩飞或NaN；warmup用较小LR逐步升温让batch统计与优化器矩稳定。随后用cosine/linear decay逐步降温收敛。常用：linear warmup + cosine decay，或constant+linear decay；预训练常warmup约总step的1-3%。",
  "approach": "先用warmup_steps把LR从~0线性升到peak，再按cosine衰减到min_lr；用PyTorch LambdaLR或transformer常见调度器组合实现；监控前几百步loss是否平稳决定warmup长度。",
  "explanationFocus": "是什么：LR调度是随训练进程动态调整学习率；warmup是开头一段让LR从近0缓慢升到目标值，旨在训练最不稳的初期保护参数与优化器状态。",
  "bruteForce": "全程恒定大LR（如3e-4）从头用：初期梯度爆炸、loss突刺频繁，甚至NaN，需反复重启。",
  "invariant": "warmup结束时LR=peak且优化器一阶矩(m)已积累到稳定统计；之后LR单调不增，保证收敛阶段不被大步长破坏。",
  "walkthrough": "7B模型，总step=100k，peak LR=3e-4，warmup=2000步（占2%）。第0步LR≈0，线性升到第2000步达3e-4；之后cosine降到第100k步的min_lr=3e-5。对比无warmup：前500步出现3次loss spike，warmup版全程平稳。",
  "code": "import torch, math\n\ndef lr_lambda(step, warmup=2000, total=100000, peak=3e-4, min_lr=3e-5):\n    if step < warmup:\n        return (step + 1) / warmup          # 线性升温\n    p = (step - warmup) / max(1, total - warmup)\n    cos = 0.5 * (1 + math.cos(math.pi * p))  # cosine衰减\n    return min_lr / peak + (1 - min_lr / peak) * cos\n\nsched = torch.optim.lr_scheduler.LambdaLR(opt, lr_lambda)\n",
  "complexity": "时间：调度计算 O(1) 每步；错误调度导致重训 O(总step)。空间：仅存标量状态。",
  "beginnerSummary": "warmup像汽车起步先轻踩油门再加速，直接一脚地板油会打滑失控；LR调度像先加速后滑行到停车。",
  "diagram": "\n LR:  /      /  ______  (warmup升 -> cosine降)\n     /         ___\n    0  warmup    total step\n",
  "derivation": [
    "为什么需要：初期参数随机、梯度大，大LR会破坏训练；warmup给系统热身。",
    "怎么实现：LambdaLR组合线性warmup与cosine衰减，返回每步乘子。",
    "有什么代价：warmup占用少量step但几乎无副作用；warmup过短仍不稳、过长则峰值step浪费。",
    "怎么评测：前warmup步loss平稳无spike，末端LR=min_lr且loss收敛。"
  ],
  "edgeCases": [
    "warmup过长：峰值LR来得太晚，收敛变慢。",
    "warmup=0且peak过大：初期spike/NaN。",
    "cosine末端未留min_lr：最后步长过大抖动。",
    "重启训练未重置sched：LR错位。"
  ],
  "pitfalls": [
    "把warmup步数设成总step比例过大（如>10%）拖慢。",
    "恢复checkpoint后忘记同步scheduler状态，LR跳变。"
  ],
  "prerequisites": [
    "优化器与学习率",
    "梯度尺度直觉",
    "cosine/linear函数"
  ],
  "workedExample": [
    "总100k step、warmup=2000（2%）、peak=3e-4、min=3e-5。",
    "对比无warmup：前者前500步3次spike，warmup版平稳。",
    "cosine末端LR降至3e-5，loss平滑收敛。"
  ],
  "lineByLine": [
    "if step<warmup: return (step+1)/warmup 线性升温乘子。",
    "p 计算warmup后进度比例[0,1]。",
    "cos=0.5*(1+cos(pi*p)) cosine从1降到0。",
    "LambdaLR把乘子作用于base LR得到实际LR。"
  ],
  "codeNotes": [
    "恢复训练务必load scheduler state_dict，否则LR曲线与时间错位。"
  ],
  "followUps": [
    {
      "question": "warmup长度怎么定？",
      "answer": "经验取总step的1-3%，并观察前几百步loss：若无spike可缩短，频繁spike则加长。"
    },
    {
      "question": "cosine和step decay怎么选？",
      "answer": "预训练长程用cosine平滑收敛最好；短训练或需早停可用step decay，但易在跳变点抖动。"
    }
  ],
  "followUpAnswers": [
    "经验取总step的1-3%，并观察前几百步loss：若无spike可缩短，频繁spike则加长。",
    "预训练长程用cosine平滑收敛最好；短训练或需早停可用step decay，但易在跳变点抖动。"
  ],
  "kind": "concept"
};
