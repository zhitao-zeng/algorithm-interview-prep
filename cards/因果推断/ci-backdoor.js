export default {
  "id": "ci-backdoor",
  "kind": "concept",
  "category": "因果推断",
  "title": "因果图与后门准则(Backdoor Criterion)",
  "difficulty": "Medium",
  "prompt": "什么是后门准则？结合 DAG 说明如何找到\"调整集\"来识别因果效应，并解释 d-分离直觉？",
  "quickAnswer": "后门准则给出变量集合 Z 的判定：Z 阻断所有从 T 到 Y 的\"后门\"(指向 T 的)路径，且 Z 不含 T 与 Y 之间的中介，则调整 Z 后可识别因果效应。d-分离指通过条件化阻断所有\"开放\"路径，使 T 与 Y 在给定 Z 下统计独立。",
  "code": "from collections import defaultdict\n\ndef find_adjustment_set(dag, t, y):\n    # 直觉版：收集指向 t 的父节点(典型后门来源)作为候选调整集\n    parents = dag.get(t, [])\n    # 真后门准则还需排除中介与 y 自身，这里给出最小候选\n    return [p for p in parents if p != y]\n\ndef is_d_separated(dag, a, b, given):\n    # 给定 given 后 a,b 是否 d-分离(示意：无未被阻断的开放路径)\n    return all(p not in given for p in dag.get(a, []) if p in dag.get(b, []))",
  "complexity": "枚举路径 O(V+E)；真实实现需处理对撞与条件集",
  "beginnerSummary": "想看清\"药→康复\"这条线，得先把那些从侧面偷偷连进来的管子(后门)掐断，剩下的直连才是药的真实作用。",
  "explanationFocus": "是什么：后门准则给出一个变量集合 Z 的判定条件——阻断所有从处理 T 指向结果 Y 的后门路径且不含中介——满足条件时，对 Z 做调整即可由观测数据识别因果效应。",
  "approach": "画出 DAG，找出所有后门路径，选取能阻断它们的极小调整集(常取 T 的父节点集合)，再对 Z 做回归/分层/加权。",
  "derivation": [
    "为什么需要：DAG 显式表达变量间因果关系，帮我们系统性找出并阻断混杂路径。",
    "怎么实现：列出所有含指向 T 的边的 T-Y 路径(后门)，选 Z 使其每条被条件化阻断。",
    "有什么代价：需正确指定 DAG(方向错则调整集错)；未观测变量会使某些后门不可识别。",
    "怎么评测：检查调整集是否满足准则、调整前后效应是否稳定、做敏感性分析。"
  ],
  "edgeCases": [
    "图中含未观测变量时，部分后门无法被任何观测 Z 阻断，效应不可识别。",
    "调整 collider(被 T 与 Y 共同导致)会打开本被阻断的路径，反而引入偏倚。",
    "存在前门路径(经中介)时不能仅用后门调整估计总效应。"
  ],
  "pitfalls": [
    "凭直觉乱加协变量，误把 collider 或中介纳入调整集。",
    "DAG 方向画错，导致后门识别与调整完全错误。"
  ],
  "prerequisites": [
    "有向无环图(DAG)基础",
    "d-分离与条件独立"
  ],
  "workedExample": [
    "DAG：Z→T, Z→Y, T→Y。Z 是混杂，唯一后门是 Z→T←Z→Y(实为 Z 同时指向二者)。",
    "调整集 Z={Z} 即可阻断后门；不调整时偏倚=β_ZT·β_ZY，调整后效应=β_TY(净因果)。"
  ],
  "lineByLine": [
    "def find_adjustment_set：取处理 t 的父节点作为后门来源的最小候选调整集。",
    "[p for p in parents if p != y]：排除结果 y 自身，避免无效/有害调整。",
    "def is_d_separated：示意性判断给定 given 后 a、b 间是否还有开放连接。"
  ],
  "followUps": [
    {
      "question": "后门准则和前门准则有什么区别？",
      "answer": "后门准则处理混杂(从 T 之前来的后门路径)，用调整 Z 阻断；前门准则处理 T→Y 经中介 M、且存在未被观测混杂 T-Y 的情况，先用 T 估 M 再用 M 估 Y，绕开不可观测混杂。"
    },
    {
      "question": "为什么调整 collider 是危险的？",
      "answer": "collider 被两条箭头指向，本来 T 与 Y 经它在条件化前是独立的；一旦以 collider 为条件，反而让 T 与 Y 在给定它后相关，打开新的伪路径引入偏倚，这就是碰撞偏倚。"
    }
  ],
  "followUpAnswers": [
    "后门准则处理混杂(从 T 之前来的后门路径)，用调整 Z 阻断；前门准则处理 T→Y 经中介 M、且存在未被观测混杂 T-Y 的情况，先用 T 估 M 再用 M 估 Y，绕开不可观测混杂。",
    "collider 被两条箭头指向，本来 T 与 Y 经它在条件化前是独立的；一旦以 collider 为条件，反而让 T 与 Y 在给定它后相关，打开新的伪路径引入偏倚，这就是碰撞偏倚。"
  ],
  "order": 4
};
