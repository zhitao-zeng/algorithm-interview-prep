export default {
  "id": "gr-word-ladder",
  "category": "搜索/图",
  "difficulty": "Hard",
  "title": "单词接龙(BFS)",
  "prompt": "给定起始单词 beginWord、目标单词 endWord 和单词字典 wordList，每次只能把一个字母换成另一个，且新词必须在字典中，求从 begin 到 end 的最短变换步数（含首尾）？例如 begin=\"hit\", end=\"cog\", 字典 [\"hot\",\"dot\",\"dog\",\"cog\"] 时返回 5？",
  "quickAnswer": "把每个单词视为图节点、差一个字母视为边，从 begin 做 BFS 求到 end 的最短路径长度。为高效建边用通配符模式做邻接，时间约 O(N*L^2)，空间 O(N*L)。",
  "approach": "把所有单词（含 begin）按\"* 位置通配\"模式分组建虚拟邻接；从 begin 起 BFS，每步把当前词每个位置换成 \"*\" 找邻居词，未访问则入队并记录步数，遇 end 返回。",
  "explanationFocus": "是什么：单词接龙本质是\"词与词仅差一字符\"的图上的最短路径问题，每个合法单词是节点，变换一步即一条边，BFS 给出最少变换次数。",
  "bruteForce": "从 begin 递归枚举每个位置换 26 个字母的所有分支，不剪枝会指数爆炸且重复访问。",
  "invariant": "队列按变换步数分层；每个单词首次出队时的步数即最短步数，之后不再更新。",
  "walkthrough": "begin=\"hit\", end=\"cog\", dict=[\"hot\",\"dot\",\"dog\",\"cog\",\"lot\",\"log\"]：hit→hot(2)→dot/lot(3)→dog/log(4)→cog(5)，返回 5。",
  "code": "from collections import deque, defaultdict\n\ndef ladder_length(begin, end, word_list):\n    words = set(word_list)\n    if end not in words:\n        return 0\n    words.add(begin)\n    graph = defaultdict(list)\n    for w in words:\n        for i in range(len(w)):\n            pattern = w[:i] + '*' + w[i+1:]\n            graph[pattern].append(w)\n    q = deque([(begin, 1)])\n    seen = {begin}\n    while q:\n        word, step = q.popleft()\n        if word == end:\n            return step\n        for i in range(len(word)):\n            pattern = word[:i] + '*' + word[i+1:]\n            for nb in graph[pattern]:\n                if nb not in seen:\n                    seen.add(nb)\n                    q.append((nb, step + 1))\n    return 0",
  "complexity": "时间约 O(N*L^2)（N 词数 L 长度，建图+遍历），空间 O(N*L)。",
  "beginnerSummary": "像玩\"改一字变新词\"游戏从起点词走到终点词，每一步只改一个字母且新词要在词典里，BFS 保证你走的步数最少。",
  "diagram": "hit\n |\nhot\n / \\\ndot lot\n |   |\ndog log\n |\ncog  (步数:5)",
  "derivation": [
    "为什么需要：状态空间最短变换（如基因序列、密码猜测）都可建模为图最短路径。",
    "怎么实现：通配符模式建邻接，BFS 分层找 end。",
    "有什么代价：单词很长时建图开销大；需确保 end 在字典否则返回 0。",
    "怎么评测：无通路返回 0；有通路返回最少步数含首尾。"
  ],
  "edgeCases": [
    "endWord 不在 wordList 中直接返回 0。",
    "begin 等于 end 时通常返回 1（视定义）。",
    "存在多条等长最短路径，返回任一步数即可。"
  ],
  "pitfalls": [
    "忘记把 begin 也加入建图导致无法起跳。",
    "用 26 字母暴力枚举而非通配符建图，效率低很多。"
  ],
  "prerequisites": [
    "BFS最短路",
    "字符串处理/哈希"
  ],
  "workedExample": [
    "begin=\"hit\", end=\"cog\", dict=[\"hot\",\"dot\",\"dog\",\"cog\",\"lot\",\"log\"]。",
    "最短链 hit→hot→dot→dog→cog，步数 5。"
  ],
  "lineByLine": [
    "把字典与 begin 放入集合，按通配符模式建邻接表。",
    "begin 入队步数 1，seen 防重复。",
    "出队遇 end 返回步数，否则沿通配邻居扩展。"
  ],
  "codeNotes": [
    "通配符 graph 把\"差一字\"的邻居查找从 O(26L) 降到 O(L) 邻接遍历。"
  ],
  "followUps": [
    {
      "question": "如何输出具体变换路径？",
      "answer": "在扩展时记录 parent 单词，到达 end 后回溯重建序列。"
    },
    {
      "question": "若要求所有最短路径呢？",
      "answer": "BFS 记录每个节点在最短层的所有前驱，到达 end 后 DFS 展开所有路径。"
    }
  ],
  "followUpAnswers": [
    "在扩展时记录 parent 单词，到达 end 后回溯重建序列。",
    "BFS 记录每个节点在最短层的所有前驱，到达 end 后 DFS 展开所有路径。"
  ],
  "kind": "code"
};
