export default {
  "kind": "code",
  "id": "79",
  "category": "搜索/图",
  "difficulty": "Medium",
  "title": "单词搜索",
  "prompt": "在字母网格中判断是否能走出单词。",
  "quickAnswer": "从每格 DFS，当前路径临时标记访问，回溯时恢复。",
  "approach": "从每格 DFS，当前路径临时标记访问，回溯时恢复。",
  "explanationFocus": "单词搜索：从每格 DFS，当前路径临时标记访问，回溯时恢复。",
  "bruteForce": "《单词搜索》可不加剪枝地枚举所有路径或状态，分支数会快速爆炸。",
  "derivation": [
    "不能简单遍历查找，因为字母可弯折且不能重复用格。",
    "对每个首字母格做 DFS，每步只在「未访问且字母匹配」的邻居里继续；index 走到单词末尾即找到。",
    "单个格子在多分支中可能被多次尝试，故必须在返回前清除 visited 标记（回溯）。"
  ],
  "invariant": "搜索前沿只包含 单词搜索：从每格 DFS，当前路径临时标记访问，回溯时恢复。 下尚未扩展且状态合法的候选。",
  "walkthrough": "演练《单词搜索》时画出一层搜索树或队列，标记访问和回溯恢复的位置。",
  "edgeCases": [
    "单词长度 1：首字母匹配即 True。",
    "网格或单词为空：按约定返回 False/True。",
    "单词比格子总数还长：必然 False，可提前返回。"
  ],
  "code": "# Python\ndef exist(board, word):\n    if not word:\n        return True\n    if not board or not board[0]:\n        return False\n    rows, cols = len(board), len(board[0])\n\n    def dfs(r, c, k):\n        if k == len(word):\n            return True\n        if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != word[k]:\n            return False\n        original = board[r][c]\n        board[r][c] = '#'\n        found = any(dfs(r + dr, c + dc, k + 1)\n                    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)))\n        board[r][c] = original\n        return found\n\n    return any(dfs(r, c, 0) for r in range(rows) for c in range(cols))",
  "codeNotes": [
    "BFS 入队时标记访问，避免重复入队。",
    "回溯函数退出前恢复现场。"
  ],
  "complexity": "时间 O(m·n·3^L)（每个格起步，每步最多 3 个新方向，L=单词长），空间 O(L)（递归栈 + visited）。",
  "followUps": [
    {
      "question": "为什么恢复现场不能省略？",
      "answer": "同一个格子可能属于另一条候选路径；不恢复会把失败分支的标记泄漏给后续搜索。"
    },
    {
      "question": "如何降低搜索量？",
      "answer": "先比较棋盘字符计数与 word 计数，必要时从出现更少的一端反向搜索；也可按相邻字符频率排序方向。"
    }
  ],
  "followUpAnswers": [
    "无权最短步数使用 BFS；枚举组合或深度结构常用 DFS。",
    "保存 parent 或在 path 中记录选择。"
  ],
  "pitfalls": [
    "找到一条路径后忘记回溯清除 visited 标记，导致其他起点/分支误判「该格已占用」。",
    "递归前没先判越界，直接访问 board[nr][nc] 会下标越界报错。"
  ],
  "beginnerSummary": "在二维字母网格里找是否有一条连续路径（上下左右相邻、不重复使用同一格）拼出目标单词。用 DFS+回溯：从每个与单词首字母相同的格子出发，尝试四个方向延伸，每步检查边界与字母匹配，并在「已访问」集合里标记当前格；若走通整个单词则成功；走不通就撤销标记回溯。只要任一起点能走通即返回 True。",
  "prerequisites": [
    "路径必须相邻（上下左右）且每个格子最多用一次 → 用 visited 集合/矩阵防止重复走同一格。",
    "DFS 沿四个方向探索；当前格匹配 word[index] 才继续往下层（index+1）。",
    "回溯：探索失败时要「取消当前格的访问标记」，让其他分支还能用它。"
  ],
  "workedExample": [
    "board=[[A,B,C,E],[S,F,C,S],[A,D,E,E]]，找 \"ABCCED\"。从 (0,0)=A 出发，右到 B，下到 C，右到 C，下到 E，左到 D，全部匹配 → True。",
    "若中途字母不符或越界，撤销该格标记回溯到上一步，尝试别的方向。"
  ],
  "lineByLine": [
    "遍历每个 (i,j)：若 board[i][j]==word[0]，调用 dfs(i,j,0)。",
    "dfs(r,c,k)：k==len(word) 返回 True；越界或已访问或字母不符返回 False。",
    "标记 visited[(r,c)]=True，对四个方向递归 dfs(nr,nc,k+1)。",
    "无论结果如何，回溯 visited[(r,c)]=False 并据此返回。"
  ],
  "diagram": "board:\n  A B C E\n  S F C S\n  A D E E\n找 \"ABCCED\":\nA→B→C→C→E→D  (相邻, 不重复用同格)\nvisited 标记, 此路不通则回溯取消标记"
};
