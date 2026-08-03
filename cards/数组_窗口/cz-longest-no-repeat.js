export default {
  "id": "cz-longest-no-repeat",
  "category": "数组/窗口",
  "difficulty": "Medium",
  "title": "无重复字符最长子串",
  "prompt": "给定一个字符串 s，请找出其中不含有重复字符的最长子串的长度。例如 s = \"abcabcbb\" 时，最长无重复子串是 \"abc\"，长度为 3？",
  "quickAnswer": "滑动窗口 + 哈希表记录每个字符最近出现的位置。右指针推进，遇到重复就把左指针跳到\"上次出现位置+1\"，窗口内始终无重复。时间 O(n)，空间 O(字符集)。",
  "approach": "用字典 last 存字符->最近下标。遍历 i，字符 ch：若 ch 在 last 且 last[ch]>=start，则 start=last[ch]+1；更新 last[ch]=i；用 i-start+1 更新最优长度。",
  "explanationFocus": "是什么：滑动窗口维护一个\"内部无重复字符\"的区间 [start,i]，用哈希表把\"查重+定位\"从 O(n) 降到 O(1)，实现线性扫描。",
  "bruteForce": "枚举所有子串起点终点，用集合判断是否含重复，时间 O(n^3) 或 O(n^2)。",
  "invariant": "窗口 [start,i] 内所有字符互不相同；last 记录窗口内每个字符的最新下标；best 是当前最大长度。",
  "walkthrough": "s=\"abcabcbb\"。i0 a:start=0,best=1,last{a:0}；i1 b:best=2,last{b:1}；i2 c:best=3,last{c:2}；i3 a:last[a]=0>=start=0 -> start=1,last{a:3},best=max(3,3-1+1=3)；i4 b:last[b]=1>=1 -> start=2,best=3；i5 c:start=3；后续遇 b 时 start=5。最终 best=3。",
  "code": "def length_of_longest_substring(s):\n    last = {}\n    start = 0\n    best = 0\n    for i, ch in enumerate(s):\n        if ch in last and last[ch] >= start:\n            start = last[ch] + 1\n        last[ch] = i\n        best = max(best, i - start + 1)\n    return best",
  "complexity": "O(n) / O(min(n, 字符集大小))",
  "beginnerSummary": "像在一条街上找一段\"没有两家同招牌\"的店铺，右走到撞招牌就把左端直接跳到那家招牌上次出现位置的下一间。",
  "diagram": "s = a b c a b c b b\n    [a b c] -> 撞 a, 左跳到 a后\n      [b c a] -> 撞 b, 左跳到 b后",
  "derivation": [
    "为什么需要：暴力枚举子串代价高，需要线性解法。",
    "怎么实现：滑动窗口配合\"字符->最近位置\"哈希表，遇重复即收缩左边界。",
    "有什么代价：空间取决于字符集（ASCII 128 或 Unicode 更大）；左指针跳跃而非逐格移动仍均摊 O(n)。",
    "怎么评测：用暴力子串集合法在小规模上验证长度一致。"
  ],
  "edgeCases": [
    "空字符串返回 0；",
    "所有字符相同（如 \"bbbbb\"）返回 1；",
    "全不同字符返回整个长度；",
    "重复出现在窗口外时不影响（start 已越过）。"
  ],
  "pitfalls": [
    "跳跃左边界前必须判断 last[ch]>=start，否则会错误收缩已不含该字符的窗口；",
    "更新 last[ch]=i 要在计算 best 之前，保证位置最新。"
  ],
  "prerequisites": [
    "滑动窗口",
    "哈希表记录最近位置"
  ],
  "workedExample": [
    "输入 \"abcabcbb\" -> 输出 3",
    "输入 \"bbbbb\" -> 输出 1",
    "输入 \"pwwkew\" -> 输出 3"
  ],
  "lineByLine": [
    "last 记录每个字符最近一次出现下标，start 为窗口左端；",
    "若 ch 已出现过且其位置在窗口内，则把 start 跳到该位置之后；",
    "写入/更新 last[ch]=i 为当前位置；",
    "用当前窗口长度 i-start+1 刷新 best。"
  ],
  "codeNotes": [
    "条件 last[ch] >= start 是关键，避免被窗口外的旧位置误伤；",
    "start 跳跃式移动，但每个字符最多被左右指针各访问一次。"
  ],
  "followUps": [
    {
      "question": "如果要求返回子串本身而不是长度？",
      "answer": "在刷新 best 时同时记录 (start,i) 区间，最后切片 s[start:i+1] 即可。"
    },
    {
      "question": "字符是 Unicode（如中文）时空间如何？",
      "answer": "last 用普通字典即可，空间为实际出现字符数，最坏 O(n)，仍可行。"
    }
  ],
  "followUpAnswers": [
    "在刷新 best 时同时记录 (start,i) 区间，最后切片 s[start:i+1] 即可。",
    "last 用普通字典即可，空间为实际出现字符数，最坏 O(n)，仍可行。"
  ],
  "kind": "code"
};
