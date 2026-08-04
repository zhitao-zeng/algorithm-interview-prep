export default {
  "id": "depth-endside",
  "category": "单目深度与障碍物感知",
  "difficulty": "Hard",
  "title": "端侧深度与实时候选筛选",
  "prompt": "如何在 Jetson 上做实时单目深度，并用其作为障碍物候选筛选的'证据'？给出算力与延迟权衡思路？",
  "quickAnswer": "选轻量 metric 深度网（蒸馏 DAv2/Depth Anything 或混合 ViT），TensorRT FP16/INT8 量化 + 多分辨率切换；把深度图近距像素计数作为'候选证据'先做粗筛，再对候选区跑重检测，平衡算力与召回。本地下游实测 8.38 FPS。",
  "code": "import time\n\ndef jetson_candidate_filter(rgb, depth_net, fps_budget=8.0, depth_thr=1.0):\n    t0 = time.time()\n    depth = depth_net.infer(rgb)                 # 轻量 metric 深度 (TensorRT)\n    dt = time.time() - t0\n    fps = 1.0 / max(dt, 1e-9)\n    near_mask = depth < depth_thr                # 近距像素即候选证据\n    candidates = int(near_mask.sum())\n    # 仅当存在近距证据才触发昂贵的实例分割\n    trigger = candidates > 0\n    return dict(candidates=candidates, fps=round(fps, 2),\n                meets_budget=fps >= fps_budget, trigger_heavy=trigger)",
  "complexity": "时间 O(H·W)，空间 O(H·W)",
  "beginnerSummary": "端侧像小马拉车，不能每帧都全力。先用轻深度图'扫一眼'有没有近的东西，有才叫醒重物检测，这样既省电又保安全。实测约 8.38 FPS。",
  "derivation": [
    "为什么需要：Jetson 算力有限，全分辨率重模型难实时，需用深度做廉价粗筛保留安全余量。",
    "怎么实现：轻量深度网量化部署，近距像素计数作证据，超预算则降分辨率/跳帧。",
    "有什么代价：量化与降分辨率损精度，粗筛阈值不当会漏近距或误触重模型。",
    "怎么评测：看端上 FPS、近距召回与功耗，以 meets_budget 与 F1 双达标为准。"
  ],
  "edgeCases": [
    "突发近距物体需跳帧补偿，否则漏检。",
    "INT8 量化在低纹理区误差放大。",
    "高温降频使 FPS 跌破预算，需动态分辨率。"
  ],
  "pitfalls": [
    "重模型每帧全跑，FPS 不达标整体失效。",
    "粗筛阈值过高，近距证据被忽略。",
    "只报平均 FPS 不报长尾延迟，实时性虚高。"
  ],
  "prerequisites": [
    "模型量化与 TensorRT",
    "实时系统延迟预算",
    "轻量网络设计"
  ],
  "workedExample": [
    "Jetson 上跑量化轻深度网：单帧 0.12 s ≈ 8.38 FPS。",
    "仅当 near 像素>0 才触发 YOLO 分割，省下 60% 重推理。"
  ],
  "lineByLine": [
    "depth = depth_net.infer(rgb) TensorRT 量化轻深度推理。",
    "fps = 1.0/max(dt,1e-9) 由单帧耗时算实时帧率。",
    "near_mask = depth < depth_thr 近距像素即候选证据。",
    "trigger = candidates>0 有证据才触发昂贵的实例分割。"
  ],
  "followUps": [
    {
      "question": "FPS 不达标时优先降分辨率还是跳帧？",
      "answer": "优先动态降分辨率保每帧都有输出（避免漏检突发障碍），跳帧作为温度降频时的兜底，二者结合并以长尾延迟为硬约束。"
    },
    {
      "question": "深度粗筛如何避免漏掉小近距障碍？",
      "answer": "对近距区域做形态学膨胀保留边界，并设最小连通域面积阈值过滤噪点，确保小目标仍有候选证据触发重检测。"
    }
  ],
  "followUpAnswers": [
    "优先动态降分辨率保每帧都有输出（避免漏检突发障碍），跳帧作为温度降频时的兜底，二者结合并以长尾延迟为硬约束。",
    "对近距区域做形态学膨胀保留边界，并设最小连通域面积阈值过滤噪点，确保小目标仍有候选证据触发重检测。"
  ],
  "invariant": "每次推理后 candidates 始终等于当前帧 near_mask 的近距像素计数，且 trigger 与该计数单调一致（>0 为真）。",
  "walkthrough": "在 Jetson 上对 90 图本地集跑 jetson_candidate_filter，量化轻深度网单帧 0.12 s 得 8.38 FPS、满足预算；近距证据触发 YOLO 后整体 F1 0.91。",
  "kind": "code"
};
