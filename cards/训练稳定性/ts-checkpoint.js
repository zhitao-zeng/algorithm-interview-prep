export default {
  "id": "ts-checkpoint",
  "category": "训练稳定性",
  "difficulty": "Medium",
  "title": "断点续训与容错",
  "prompt": "大规模训练如何做断点续训（checkpoint）以保证容错和可从故障中恢复？",
  "quickAnswer": "定期（如每N step或每小时）异步保存：模型权重、优化器state、LR scheduler、当前step/epoch、RNG状态、数据采样位置。恢复时全部载入即可无缝继续。关键是异步写盘+保留最近K份+校验完整性，避免写一半崩坏或覆盖好checkpoint。",
  "approach": "用torch.save把state_dict打包，写到临时文件再rename保证原子性；保存最近K份轮转；训练循环每固定间隔save；启动检测checkpoint目录自动resume。",
  "explanationFocus": "是什么：断点续训是把训练全部可恢复状态序列化到磁盘，使进程被杀/节点故障后能从最近点继续，而非从头开始，是大规模训练必备的容错机制。",
  "bruteForce": "只保存模型权重、不保存优化器与step，恢复后从step0重跑且优化器动量丢失，学习率与数据位置错位，训练崩坏。",
  "invariant": "恢复后的（参数、优化器矩、scheduler、step、RNG、数据游标）必须与故障前某step完全一致，保证后续轨迹可复现、loss连续。",
  "walkthrough": "256卡训练，每1000 step异步存一次，保留最近3份（ckpt-3000/4000/5000）。第5200步节点宕机，从ckpt-5000恢复：载入权重+Adam m/v（约26GB fp32）+step=5000+RNG+数据index，第5201步loss与故障前连续无跳变。",
  "code": "import torch, os, glob\n\ndef save_ckpt(model, opt, sched, step, meta, dir=\"ckpt\", keep=3):\n    path = f\"{dir}/ckpt-{step}.pt\"\n    tmp = path + \".tmp\"\n    torch.save({\"model\": model.state_dict(), \"opt\": opt.state_dict(),\n                \"sched\": sched.state_dict(), \"step\": step, **meta}, tmp)\n    os.replace(tmp, path)                      # 原子替换\n    old = sorted(glob.glob(f\"{dir}/ckpt-*.pt\"))[:-keep]\n    for f in old: os.remove(f)                 # 轮转保留最近keep份\n\ndef load_ckpt(model, opt, sched, dir=\"ckpt\"):\n    latest = max(glob.glob(f\"{dir}/ckpt-*.pt\"), key=os.path.getmtime)\n    sd = torch.load(latest)\n    model.load_state_dict(sd[\"model\"]); opt.load_state_dict(sd[\"opt\"])\n    sched.load_state_dict(sd[\"sched\"])\n    return sd[\"step\"]\n",
  "complexity": "时间：异步写盘几乎不阻塞训练（后台线程），同步写会占数个step；空间：每份约(参数+优化器state)大小，保留K份占K倍，13B fp32约52GB/份。",
  "beginnerSummary": "断点续训像游戏存档：不仅存角色（模型），还要存进度条、道具栏和随机种子，下次开机才能从原地继续，而不是重头玩。",
  "diagram": "\n 训练 loop\n   |\n   +-- step%1000==0 --> save(tmp) --> rename(原子) --> 轮转删旧\n   |\n 故障/宕机\n   |\n 重启 --> load_ckpt(最新) --> 从 step=N 继续\n",
  "derivation": [
    "为什么需要：大规模训练动辄数周，硬件故障/抢占不可避免，无checkpoint会前功尽弃。",
    "怎么实现：序列化全部状态，先写tmp再os.replace原子替换，轮转保留K份防止覆盖好点。",
    "有什么代价：每份占参数量+优化器大小，K份占K倍磁盘；同步写盘短暂阻塞训练。",
    "怎么评测：注入kill信号后恢复，对比恢复前后loss曲线连续、step精确接续、无精度回退。"
  ],
  "edgeCases": [
    "写盘中途崩溃留下.tmp半文件：用tmp+rename保证要么完整要么旧版仍在。",
    "只保留1份且它损坏：轮转保留>=3份降低风险。",
    "DDP下各卡state一致，只需rank0保存，避免重复写。",
    "数据采样位置未存，恢复后重复/跳过样本破坏分布。"
  ],
  "pitfalls": [
    "漏存优化器state，恢复后动量归零、LR错位。",
    "直接覆盖写同一文件，写一半崩坏则完好checkpoint也没了。"
  ],
  "prerequisites": [
    "state_dict序列化",
    "优化器与scheduler状态",
    "异步IO与原子写"
  ],
  "workedExample": [
    "256卡每1000 step存一次，含model/opt/sched/step/RNG/数据index。",
    "第5200步宕机，从ckpt-5000载入，step回到5000。",
    "第5201步loss与故障前连续，无重训、无跳变。"
  ],
  "lineByLine": [
    "torch.save 把全部可恢复状态打包到tmp文件。",
    "os.replace(tmp,path) 原子替换，保证外界看到的总是完整文件。",
    "sorted(...)[-keep:] 仅保留最近keep份，删旧省空间。",
    "load_ckpt 找最新文件并还原model/opt/sched/step。"
  ],
  "codeNotes": [
    "rank0保存、其他rank仅载入，避免多卡重复写同一checkpoint。"
  ],
  "followUps": [
    {
      "question": "ckpt该按step还是按时间保存？",
      "answer": "混合最稳：既按固定step（保证粒度）也按时间上限（如每30分钟），防止单step极慢时丢失过多进度。"
    },
    {
      "question": "如何验证ckpt没损坏？",
      "answer": "保存时附带元数据校验和（如hash），载入前校验；或保存后立刻load一次做sanity check。"
    }
  ],
  "followUpAnswers": [
    "混合最稳：既按固定step（保证粒度）也按时间上限（如每30分钟），防止单step极慢时丢失过多进度。",
    "保存时附带元数据校验和（如hash），载入前校验；或保存后立刻load一次做sanity check。"
  ],
  "kind": "concept"
};
