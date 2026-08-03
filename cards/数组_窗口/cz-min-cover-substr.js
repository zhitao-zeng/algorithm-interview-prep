export default {
  "id": "cz-min-cover-substr",
  "category": "数组/窗口",
  "difficulty": "Hard",
  "title": "最小覆盖子串",
  "prompt": "给定字符串 s 和 t，请在 s 中找到包含 t 中所有字符（含重复次数）的最短子串；若不存在返回空串。例如 s = \"ADOBECODEBANC\"，t = \"ABC\" 时，最短覆盖子串是 \"BANC\"？",
  "quickAnswer": "滑动窗口 + 双哈希表。用 need 记录 t 的字符需求，右指针扩张窗口，当窗口满足需求（matched==种类数）时用左指针收缩到最小。全程维护最短合法窗口。时间 O(|s|+|t|)，空间 O(字符集)。",
  "approach": "need=Counter(t)，window 记录窗口内字符计数，have 表示已满足需求的字符种类数。右指针扩张并更新 window/have；当 have==len(need) 时在 while 内左指针收缩并刷新最优解。",
  "explanationFocus": "是什么：最小覆盖子串是\"先扩张满足条件、再收缩求最优\"的滑动窗口范式，用两个计数器分别描述\"目标需求\"和\"窗口现状\"，以种类匹配数驱动收缩。",
  "bruteForce": "枚举所有子串起点终点，逐一统计是否覆盖 t，时间 O(|s|^2 * |t|)。",
  "invariant": "window 中保存当前窗口各字符计数；have 表示\"计数达到需求\"的字符种类数；best 保存目前最短合法窗口的 (长度,左,右)。",
  "walkthrough": "s=\"ADOBECODEBANC\", t=\"ABC\"(need A:1,B:1,C:1)。右扩到首个含 A,B,C 的窗口：右到 index 9(B) 时窗口含 A,B,C，have=3；收缩左：左从0到...找到 \"BANC\"。最优长度4，返回 \"BANC\"。",
  "code": "from collections import Counter\n\ndef min_window(s, t):\n    need = Counter(t)\n    required = len(need)\n    have = 0\n    window = {}\n    left = 0\n    best = (len(s) + 1, 0, 0)\n    for right, ch in enumerate(s):\n        window[ch] = window.get(ch, 0) + 1\n        if ch in need and window[ch] == need[ch]:\n            have += 1\n        while have == required:\n            if right - left + 1 < best[0]:\n                best = (right - left + 1, left, right)\n            left_ch = s[left]\n            window[left_ch] -= 1\n            if left_ch in need and window[left_ch] < need[left_ch]:\n                have -= 1\n            left += 1\n    if best[0] > len(s):\n        return \"\"\n    return s[best[1]:best[2] + 1]",
  "complexity": "O(|s| + |t|) / O(字符集)",
  "beginnerSummary": "像用放大镜在长纸上找最短一段能盖住所有必要印章：先向右拉开直到章都齐了，再从左收一收，能收则收，记下最短的那段。",
  "diagram": "s = A D O B E C O D E B A N C\n        [A D O B E C ...] 含 A,B,C\n        收左 -> [B E C O D E B A N C] 最短 BANC",
  "derivation": [
    "为什么需要：暴力枚举子串代价高，需要线性扫描。",
    "怎么实现：右扩左缩的滑动窗口，用 need/window 两计数器与 have 判断覆盖。",
    "有什么代价：空间 O(字符集)；注意 t 中重复字符必须按次数满足。",
    "怎么评测：检查返回子串是否包含 t 全部字符且长度最短（与暴力比对）。"
  ],
  "edgeCases": [
    "t 比 s 长必返回空；",
    "t 含重复字符（如 \"AA\"）需窗口出现两次；",
    "s 恰好等于 t 返回自身；",
    "无解返回空串。"
  ],
  "pitfalls": [
    "用\"种类数 have\"判断而非\"总字符数\"，否则重复字符会误判满足；",
    "收缩左边界时先判断是否使某字符跌破需求再 have-=1，顺序不能反。"
  ],
  "prerequisites": [
    "滑动窗口",
    "Counter 计数与种类匹配"
  ],
  "workedExample": [
    "输入 s=\"ADOBECODEBANC\", t=\"ABC\" -> 输出 \"BANC\"",
    "输入 s=\"a\", t=\"a\" -> 输出 \"a\""
  ],
  "lineByLine": [
    "need 统计 t 的字符需求，required 为需求种类数；",
    "右指针扩张，更新 window 计数，若某字符刚达到需求则 have+=1；",
    "have==required 时在 while 里尝试左缩，刷新 best 最短窗口；",
    "左缩时先减 window[left_ch]，若跌破需求则 have-=1 并停止收缩。"
  ],
  "codeNotes": [
    "best 初始长度设为 len(s)+1，便于用 < 判断\"找到更短\"；",
    "只在 ch in need 时才影响 have，避免无关字符干扰匹配计数。"
  ],
  "followUps": [
    {
      "question": "如果要返回所有长度最小且都覆盖 t 的子串？",
      "answer": "在刷新 best 时收集所有等于当前最小长度的区间，并在发现更短区间时清空重建列表。"
    },
    {
      "question": "字符顺序有要求吗？",
      "answer": "没有，本题只要求\"包含\"各字符及次数，不要求顺序；若要顺序匹配应改用子序列/双指针不同做法。"
    }
  ],
  "followUpAnswers": [
    "在刷新 best 时收集所有等于当前最小长度的区间，并在发现更短区间时清空重建列表。",
    "没有，本题只要求\"包含\"各字符及次数，不要求顺序；若要顺序匹配应改用子序列/双指针不同做法。"
  ],
  "kind": "code"
};
