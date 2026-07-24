export default {
  "kind": "code",
  "id": "3",
  "category": "数组/窗口",
  "difficulty": "Medium",
  "title": "无重复字符的最长子串",
  "prompt": "求不含重复字符的最长连续子串。",
  "diagram": "s = \"abcabcbb\"\n窗口 [left,right], last=字符最近下标\n\na b c a b c b b\n↑       ↑\nleft=0  right=3 遇重复a → left跳到1\n窗 \"bca\" 长度3\n→ 全程不重复最长子串 = 3",
  "quickAnswer": "用哈希表记录每个字符最近位置；遇到重复字符时把左边界跳到旧位置之后。",
  "approach": "用哈希表记录每个字符最近位置；遇到重复字符时把左边界跳到旧位置之后。",
  "explanationFocus": "无重复字符的最长子串：用哈希表记录每个字符最近位置；遇到重复字符时把左边界跳到旧位置之后。",
  "bruteForce": "《无重复字符的最长子串》可枚举所有子数组或窗口再计算指标，复杂度常为 O(n²) 或更高。",
  "invariant": "当前窗口始终满足 无重复字符的最长子串：用哈希表记录每个字符最近位置；遇到重复字符时把左边界跳到旧位置之后。 的约束，辅助结构准确反映窗口内元素。",
  "walkthrough": "演练《无重复字符的最长子串》时逐项移动左右边界，并记录哈希表、队列或计数器变化。",
  "derivation": [
    "暴力枚举每个起点、向右检查是否出现重复，最坏要 O(n²) 且会重复扫描。",
    "保存每个字符最近下标后，冲突时一次跳过「不可能合法的前缀」（left 直接跳到旧位置之后），right 全程只前进，每个字符被处理常数次，降到 O(n)。",
    "为什么 left 用 max(left, last[ch]+1) 而不是直接赋值？因为旧重复字符可能已经在窗口外，直接赋值会让 left 左移、把已排除的字符重新放进窗口。"
  ],
  "edgeCases": [
    "空字符串返回 0。",
    "全部字符相同（如 \"bbbbb\"）：left 每次都跳到 right，答案为 1。",
    "重复字符出现在当前窗口外时，left 不应倒退（用 max 保护）。"
  ],
  "code": "# Python\ndef length_of_longest_substring(s):\n    last = {}\n    left = best = 0\n    for right, ch in enumerate(s):\n        if ch in last:\n            left = max(left, last[ch] + 1)\n        last[ch] = right\n        best = max(best, right - left + 1)\n    return best",
  "codeNotes": [
    "left 指针只能右移，避免重复扫描。",
    "队列中优先保存下标以便淘汰过期元素。"
  ],
  "complexity": "时间 O(n)，空间 O(min(n, 字符集大小))。每个字符最多被 right 访问一次、left 也只增不减；字典最多保存字符集大小的条目。",
  "followUps": [
    {
      "question": "为什么 left 不能直接赋值 last[ch]+1？",
      "answer": "旧重复字符可能已经在当前窗口之外（last[ch] < left），直接赋值会让 left 左移，把已经排除的字符重新放回窗口，破坏「无重复」性质。用 max(left, ...) 保证 left 只增不减。"
    },
    {
      "question": "如何返回子串本身而不只是长度？",
      "answer": "在刷新 best 时同时保存 best_left = left、best_right = right，最后返回 s[best_left:best_right+1] 即可。"
    }
  ],
  "followUpAnswers": [
    "更新最优答案时同时保存左右端点。",
    "维护固定大小窗口和可淘汰的增量统计。"
  ],
  "pitfalls": [
    "用 left = last[ch] + 1 直接赋值，导致 left 在旧重复字符位于窗口外时倒退。",
    "忘记在每次迭代更新 last[ch]，使重复检测基于过期位置。"
  ],
  "beginnerSummary": "子串是「连续的」一段字符，不能跳过。我们要找不含重复字符的最长连续子串长度。核心是用一个「滑动窗口」[left, right]：right 不断向右扩，一旦遇到一个已经在区间里出现过的字符，就把 left 向右移到「那个重复字符上一次出现位置的下一位」，保证窗口内始终没有重复。因为 left 只增不减，每个字符最多被处理常数次，整体线性。",
  "prerequisites": [
    "用一个字典 last 把「字符 → 它最近一次出现的下标」记录下来，这样重复检查是 O(1)。",
    "窗口长度 = right - left + 1；left 只能向右移动，不会把已经排除的字符重新放回去。",
    "当 right 遇到字符 ch 且 ch 在窗口内（last[ch] >= left）时，说明发生了重复，需要收缩 left。"
  ],
  "workedExample": [
    "输入 \"abcabcbb\"：right 读到 a、b、c 时窗口长度依次为 1、2、3，last 记录 a:0, b:1, c:2。",
    "right 再次读到 a（下标 3），此时 last[\"a\"]=0 >= left=0，说明 a 在窗口内；把 left 跳到 last[\"a\"]+1 = 1，窗口变成 \"bca\"（长度 3）。继续扫描，最大长度保持 3。"
  ],
  "lineByLine": [
    "last = {} 保存字符到最近下标的映射，使重复检查为 O(1)。",
    "left = max(left, last[ch] + 1) 只在「重复字符位于当前窗口内」时才真正移动 left，避免 left 倒退。",
    "更新 last[ch] = right 后，用 right - left + 1 刷新 best。",
    "空字符串时 right 不进入循环，best 保持 0，自然返回 0。"
  ]
};
