export default {
  "id": "depth-scale-ambiguity",
  "category": "单目深度与障碍物感知",
  "difficulty": "Medium",
  "title": "尺度模糊与尺度校准",
  "prompt": "单目深度为何存在尺度模糊？给定相对深度图与少量稀疏度量点，如何用最小二乘求得仿射尺度并完成校准？",
  "quickAnswer": "单目无基线，深度只能确定到乘性常数加偏移（仿射模糊）。用稀疏度量点 (i,j,d_gt) 拟合 d_metric = a·d_rel + b 的最小二乘解，再对全图施加 a·d_rel+b 即完成从相对到度量的校准。",
  "code": "import numpy as np\n\ndef calibrate_scale(rel_depth, sparse_metric):\n    # rel_depth: HxW 相对深度; sparse_metric: [(i,j,metric), ...]\n    A, b = [], []\n    for i, j, m in sparse_metric:\n        A.append([rel_depth[i, j], 1.0])  # d_metric = a*s + b\n        b.append(m)\n    A = np.array(A); b = np.array(b)\n    a, b_scale = np.linalg.lstsq(A, b, rcond=None)[0]\n    return float(a), float(b_scale)\n\ndef apply_scale(rel_depth, a, b):\n    return a * rel_depth + b",
  "complexity": "时间 O(p·d + d³)，p 为稀疏点数、d 为参数维(2)，空间 O(p)",
  "beginnerSummary": "单目像一只眼，只能判断'谁前谁后'却不知道'差几米'，这叫尺度模糊。给几处已知真实距离的点，就能反推出整体放缩与偏移，把'排名'翻译成'米数'。",
  "derivation": [
    "为什么需要：单目无双目视差，深度估计只能确定到仿射等价类，绝对尺度缺失会直接毁掉 1 m 阈值判定。",
    "怎么实现：用稀疏度量点构造超定方程组 d_gt = a·d_rel + b，最小二乘求 (a,b)，全图仿射变换即得 metric 深度。",
    "有什么代价：校准依赖稀疏点质量，点少或含噪时 a、b 抖动，外推区误差放大。",
    "怎么评测：用校准后 RMSE 与近距 F1 验证，对比未校准时的尺度漂移量。"
  ],
  "edgeCases": [
    "稀疏点少于 2 个或共线，最小二乘无唯一解。",
    "稀疏点含离群（漏检/错标），a、b 被严重带偏。",
    "标定域与测试域光照/季节变化，仿射关系失效。"
  ],
  "pitfalls": [
    "对整图用单一全局尺度，忽略尺度随距离非线性变化。",
    "用 YOLO 估计的车辆尺寸作先验时未扣除透视投影误差。",
    "把相对深度直接当米数用而不校准，阈值全错。"
  ],
  "prerequisites": [
    "最小二乘与线性代数基础",
    "单目相机尺度不确定性",
    "仿射变换概念"
  ],
  "workedExample": [
    "输入：相对深度图 + 3 个由已知车长反推的近距度量点。",
    "拟合得 a=4.2, b=0.1，全图 d_metric=4.2·d_rel+0.1，近距区域从 0.23 变为约 1.07 m。"
  ],
  "lineByLine": [
    "for i,j,m in sparse_metric: 遍历每个已知真实距离的点。",
    "A.append([rel_depth[i,j],1.0]) 构造仿射方程的两列（斜率项与偏置项）。",
    "np.linalg.lstsq(A,b,rcond=None) 解超定方程得最优 (a,b)。",
    "return a*rel_depth+b 将全图相对深度映射到度量空间。"
  ],
  "followUps": [
    {
      "question": "稀疏点不足时如何稳定尺度？",
      "answer": "可用 RANSAC 剔除离群点后拟合，或借助已知尺寸物体（车长/人体高）的密度先验做贝叶斯校准，再对结果做时序平滑。"
    },
    {
      "question": "为何不直接回归 metric 而要校准相对深度？",
      "answer": "相对深度训练信号更易大规模获取、泛化更好；metric 受域偏移敏感，在线用少量先验校准比重训更省且更稳。"
    }
  ],
  "followUpAnswers": [
    "可用 RANSAC 剔除离群点后拟合，或借助已知尺寸物体（车长/人体高）的密度先验做贝叶斯校准，再对结果做时序平滑。",
    "相对深度训练信号更易大规模获取、泛化更好；metric 受域偏移敏感，在线用少量先验校准比重训更省且更稳。"
  ],
  "invariant": "每处理一个稀疏点，矩阵 A、向量 b 始终包含此前所有点的 (s,1) 行与对应度量值，且未加入的点不出现。",
  "walkthrough": "取 6 个近距正例的车身尺寸先验点，拟合 a、b 后把相对深度转 metric；在 90 图本地集上 RMSE 由未校准的 3.7 降到 1.03。",
  "kind": "code"
};
