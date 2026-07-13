export const categories = ['全部', '链表', '二叉树', '数组/窗口', '二分/TopK', '搜索/图', '动态规划', '模型手写', 'ASR 专项'];

// 统一工厂保证每张卡都可被 validateQuestionCard 校验，并让复习页仍可使用 approach。
const categoryGuide = {
  '链表': {
    bruteForce: (title) => `《${title}》可先把节点值或指针关系完整收集后重建；这能验证结果，但额外空间掩盖了原地指针操作。`,
    derivation: (focus) => [`先明确 ${focus} 中每个指针的职责。`, '画出断链前必须暂存的 next 关系。', '用两到三个节点演示一次完整的重连。'],
    invariant: (focus) => `链表处理中始终保留 ${focus} 所需的已处理链段入口和未处理链段入口。`,
    walkthrough: (title) => `演练《${title}》时，在纸上标出头、尾和临时指针，每次连边后检查是否仍能到达剩余节点。`,
    edgeCases: ['空链表', '单节点链表', '头节点或尾节点参与操作'],
    codeNotes: ['节点重连前先保存 next，避免断链。', 'dummy 节点能统一头部变化的分支。'],
    followUps: ['能否做到原地修改？', '若节点流式到达如何维护状态？'],
    followUpAnswers: ['多数链表题可用常数个指针原地完成，但要明确哪些节点仍被引用。', '只保留后续操作需要的边界节点或缓存窗口。'],
    pitfalls: ['覆盖 next 前没有暂存后继节点。', '头节点变化却没有 dummy 或新头变量。'],
  },
  '二叉树': {
    bruteForce: (title) => `《${title}》的基线做法是枚举根、路径或子树后逐一验证，通常会重复遍历同一子树。`,
    derivation: (focus) => [`确定 ${focus} 适合前序、后序还是层序。`, '定义递归返回值或队列中元素的精确含义。', '在空节点处给出可组合的基线。'],
    invariant: (focus) => `树遍历时，每个已完成子树都已产出 ${focus} 所需的正确摘要。`,
    walkthrough: (title) => `用三层小树演练《${title}》，逐次写出递归返回值或队列内容。`,
    edgeCases: ['空树', '退化为单链的树', '只有左子树或只有右子树'],
    codeNotes: ['递归终止条件先处理空节点。', 'BFS 每层开始前固定当前队列长度。'],
    followUps: ['递归深度过大如何处理？', '如何输出具体路径而非仅数值？'],
    followUpAnswers: ['可改为显式栈或迭代遍历以规避调用栈限制。', '在递归/回溯中维护父指针或路径数组。'],
    pitfalls: ['把子树返回值与全局答案混为一谈。', '遗漏空节点导致访问 left/right 出错。'],
  },
  '数组/窗口': {
    bruteForce: (title) => `《${title}》可枚举所有子数组或窗口再计算指标，复杂度常为 O(n²) 或更高。`,
    derivation: (focus) => [`识别 ${focus} 是否具有单调性或可增量维护性。`, '定义窗口左右端点和辅助结构保存的信息。', '证明每个元素进入和离开窗口次数有限。'],
    invariant: (focus) => `当前窗口始终满足 ${focus} 的约束，辅助结构准确反映窗口内元素。`,
    walkthrough: (title) => `演练《${title}》时逐项移动左右边界，并记录哈希表、队列或计数器变化。`,
    edgeCases: ['空数组', '窗口长度为 1', '重复值与全相同元素'],
    codeNotes: ['left 指针只能右移，避免重复扫描。', '队列中优先保存下标以便淘汰过期元素。'],
    followUps: ['如何返回区间而不只返回数值？', '数据流无限长时如何处理？'],
    followUpAnswers: ['更新最优答案时同时保存左右端点。', '维护固定大小窗口和可淘汰的增量统计。'],
    pitfalls: ['收缩窗口后忘记更新计数。', '用值而非下标导致无法判断元素是否过期。'],
  },
  '二分/TopK': {
    bruteForce: (title) => `《${title}》可线性扫描或完整排序得到答案，但没有利用有序性、堆或分区性质。`,
    derivation: (focus) => [`写出 ${focus} 的单调判定或目标秩。`, '确定闭区间或半开区间的含义。', '每轮排除不可能包含答案的一半或一组候选。'],
    invariant: (focus) => `答案始终位于当前搜索区间或 TopK 候选集合中，${focus} 没有被错误排除。`,
    walkthrough: (title) => `演练《${title}》时列出 l、r、mid（或堆顶）并说明每次淘汰理由。`,
    edgeCases: ['空数组', '目标不存在', '目标在首尾边界'],
    codeNotes: ['统一区间语义并在循环后验证候选。', 'TopK 的堆大小应严格受 k 限制。'],
    followUps: ['重复值如何改变判定？', '如何处理在线插入？'],
    followUpAnswers: ['重复值可能破坏严格单调，需要收缩边界或使用 lower_bound。', '维护大小受限的堆或平衡树。'],
    pitfalls: ['l/r 更新导致死循环或漏掉 mid。', '第 k 大和升序第 n-k 个下标混淆。'],
  },
  '搜索/图': {
    bruteForce: (title) => `《${title}》可不加剪枝地枚举所有路径或状态，分支数会快速爆炸。`,
    derivation: (focus) => [`把 ${focus} 表示为节点、边或回溯状态。`, '明确 visited/path 在何时写入和恢复。', '利用层数、排序或入度做剪枝。'],
    invariant: (focus) => `搜索前沿只包含 ${focus} 下尚未扩展且状态合法的候选。`,
    walkthrough: (title) => `演练《${title}》时画出一层搜索树或队列，标记访问和回溯恢复的位置。`,
    edgeCases: ['起点就是终点', '不存在可行路径', '存在环或重复状态'],
    codeNotes: ['BFS 入队时标记访问，避免重复入队。', '回溯函数退出前恢复现场。'],
    followUps: ['何时选 BFS 而不是 DFS？', '如何输出一条具体路径？'],
    followUpAnswers: ['无权最短步数使用 BFS；枚举组合或深度结构常用 DFS。', '保存 parent 或在 path 中记录选择。'],
    pitfalls: ['visited 标记时机错误造成重复搜索。', '回溯遗漏恢复导致后续分支被污染。'],
  },
  '动态规划': {
    bruteForce: (title) => `《${title}》的递归基线会重复计算相同子问题，通常呈指数增长。`,
    derivation: (focus) => [`把 ${focus} 写成状态定义。`, '枚举最后一次选择并建立转移。', '设置可验证的初始状态与遍历顺序。'],
    invariant: (focus) => `计算到当前下标时，所有更小子问题的 ${focus} 状态已是最优值。`,
    walkthrough: (title) => `用最小输入填一张《${title}》的 DP 表，解释每个格子来自哪个前驱。`,
    edgeCases: ['空输入', '只有一个状态', '目标不可达或全为负值'],
    codeNotes: ['转移依赖方向决定循环顺序。', '可压缩时只保留下一步真正依赖的状态。'],
    followUps: ['如何恢复具体方案？', '如何把空间压缩？'],
    followUpAnswers: ['记录选择或从最终状态按转移反向回溯。', '用滚动数组或有限个前驱变量替换整张表。'],
    pitfalls: ['dp 初值把不可达状态误设为 0。', '正序/倒序更新错误导致同一元素被重复使用。'],
  },
  '模型手写': {
    bruteForce: (title) => `《${title}》的朴素实现直接按定义展开张量运算，正确但常忽略数值稳定性与向量化。`,
    derivation: (focus) => [`从 ${focus} 的数学定义写出张量形状。`, '识别指数、归一化或索引中的数值稳定点。', '区分训练与推理时需要保存的状态。'],
    invariant: (focus) => `实现始终保持 ${focus} 的形状约束、概率归一化或尺度约束。`,
    walkthrough: (title) => `用一个极小张量演练《${title}》，逐步核对形状和中间数值。`,
    edgeCases: ['极大或极小 logits', 'batch 大小为 1', 'mask、padding 或空类别'],
    codeNotes: ['优先使用稳定的库算子和 keepdims/keepdim。', '注释每个张量的 batch、序列、通道维度。'],
    followUps: ['如何提升数值稳定性？', '如何降低显存或计算量？'],
    followUpAnswers: ['使用 log-sum-exp、减最大值、eps 与高精度累积。', '用分块、缓存、稀疏化或 fused kernel。'],
    pitfalls: ['softmax 前后 mask 顺序错误。', '张量维度或广播方向写反。'],
  },
  'ASR 专项': {
    bruteForce: (title) => `《${title}》可枚举所有对齐或转写路径再求和/比较，但路径数随帧数指数增长。`,
    derivation: (focus) => [`明确 ${focus} 的时间轴、标签轴和 blank 语义。`, '定义每个前缀或格点累计的概率/状态。', '在对数域合并多条等价路径。'],
    invariant: (focus) => `每步保存的分数完整覆盖 ${focus} 下所有合法历史，而不会重复或遗漏对齐路径。`,
    walkthrough: (title) => `演练《${title}》时写出两三帧的 token、blank 与前缀/状态转移。`,
    edgeCases: ['空音频帧', '连续 blank', '同一帧连续输出多个标签'],
    codeNotes: ['概率累积应在 log 域使用 log-sum-exp。', '流式场景要明确何时提交稳定前缀和截断缓存。'],
    followUps: ['如何融合语言模型？', '如何降低流式延迟？'],
    followUpAnswers: ['在 beam 扩展分数中加入语言模型权重和长度奖励。', '减小 chunk 和右上下文，并采用稳定前缀策略。'],
    pitfalls: ['把 blank 删除与重复合并顺序写反。', '缓存无限增长或状态没有随输出 token 更新。'],
  },
};

const q = (id, category, difficulty, title, prompt, quickAnswer, code, complexity, extra = {}) => {
  const guide = categoryGuide[category];
  const explanationFocus = extra.explanationFocus || `${title}：${quickAnswer}`;
  return ({
  id, category, difficulty, title, prompt, quickAnswer,
  approach: extra.approach || quickAnswer,
  explanationFocus,
  bruteForce: extra.bruteForce || guide.bruteForce(title),
  derivation: extra.derivation || guide.derivation(explanationFocus),
  invariant: extra.invariant || guide.invariant(explanationFocus),
  walkthrough: extra.walkthrough || guide.walkthrough(title),
  edgeCases: extra.edgeCases || guide.edgeCases,
  code, codeNotes: extra.codeNotes || guide.codeNotes,
  complexity,
  followUps: extra.followUps || guide.followUps,
  followUpAnswers: extra.followUpAnswers || guide.followUpAnswers,
  pitfalls: extra.pitfalls || guide.pitfalls,
  beginnerSummary: extra.beginnerSummary,
  prerequisites: extra.prerequisites,
  workedExample: extra.workedExample,
  lineByLine: extra.lineByLine,
});
};

const py = (body) => `# Python\n${body}`;

export const questions = [
  q('206', '链表', 'Easy', '反转链表', '原地反转单链表并返回新头。', '维护 prev、cur、nxt；先保存 nxt 再反转 cur.next。', py('class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val, self.next = val, next\n\ndef reverse_list(head):\n    prev, cur = None, head\n    while cur:\n        nxt = cur.next\n        cur.next = prev\n        prev, cur = cur, nxt\n    return prev'), '时间 O(n)，空间 O(1)', {
    invariant: 'prev 始终是已经反转好的前缀头结点。',
    beginnerSummary: '输入是一条由 next 串起来的单链表，输出是方向完全相反的新头节点；目标是不新建整条链，只把每条箭头掉头。',
    prerequisites: ['ListNode 的 val 存值，next 指向下一个节点或 None。', 'prev 保存已经翻好的部分，cur 是正准备处理的节点。'],
    workedExample: ['1 → 2 → 3 中先处理 1：保存 nxt=2，再让 1.next 指向 None，prev 变成 1。', '接着处理 2：保存 3，让 2.next 指向 1；最后处理 3，得到 3 → 2 → 1。'],
    derivation: ['直接把值放进数组再倒序可以得到答案，但没有练习链表指针。', '每次只改变 cur 的一条 next 前先保存后继 nxt，就能安全地把 cur 接到 prev 前面。'],
    lineByLine: ['ListNode 类说明题目节点包含值和下一跳。', 'while cur 保证空链表会直接返回 None，循环逐节点处理。', '先保存 nxt，再改 cur.next，因此不会丢失尚未处理的链段。', 'prev, cur 同时前进，最终 prev 就是新头节点。'],
    followUps: [{ question: '为什么必须先保存 nxt？', answer: '改写 cur.next 后，原来通往剩余节点的箭头会断开。把它保存到 nxt，才能在本轮结束后继续走到原链表的下一个节点。' }, { question: '能否用递归？', answer: '可以，递归先翻转后半段再把当前节点接到末尾；但递归会占用 O(n) 调用栈，迭代只需要三个指针。' }],
  }),
  q('92', '链表', 'Medium', '反转链表 II', '反转位置 left 到 right 的链表区间。', 'dummy 定位 left 前驱，反复把区间后续节点头插到该前驱之后。', py('class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val, self.next = val, next\n\ndef reverse_between(head, left, right):\n    dummy = ListNode(0, head)\n    before = dummy\n    for _ in range(left - 1):\n        before = before.next\n    cur = before.next\n    for _ in range(right - left):\n        move = cur.next\n        cur.next = move.next\n        move.next = before.next\n        before.next = move\n    return dummy.next'), '时间 O(n)，空间 O(1)', {
    beginnerSummary: '输入链表和从 1 开始的位置 left、right，输出只把这两个位置之间的节点反过来后的链表；区间外的顺序不变。',
    prerequisites: ['dummy 是头节点前的虚拟节点，使 left=1 时也有前驱。', 'before 始终指向待翻转区间前面的节点，cur 是区间原来的第一个节点。'],
    workedExample: ['1 → 2 → 3 → 4 → 5，left=2、right=4 时，before 指向 1，cur 指向 2。', '先把 3 插到 1 后面得到 1 → 3 → 2 → 4 → 5，再插入 4，结果为 1 → 4 → 3 → 2 → 5。'],
    derivation: ['可以先切下区间、完整翻转、再接回，但需要保存多个边界。', '固定 before 和 cur，把 cur 后面的节点逐个头插，能在一次扫描中完成局部反转。'],
    lineByLine: ['dummy 统一了反转从头开始和从中间开始的情况。', '第一个 for 让 before 恰好停在 left 前面。', '每次 move=cur.next 后，先把 move 从原处摘下，再插到 before 后。', 'cur 始终留在反转区间的尾部，循环结束返回 dummy.next。'],
    followUps: [{ question: 'left 等于 right 时为什么不用特别翻转？', answer: 'right-left 为 0，第二个循环不执行，链表没有任何指针被修改，正好保留原样。' }, { question: '为什么不能直接从 head 开始？', answer: '当 left 为 1 时，原头会改变；dummy 为它提供了稳定的前驱，最后统一返回 dummy.next。' }],
  }),
  q('23', '链表', 'Hard', '合并 K 个升序链表', '合并 k 条有序链表。', '小根堆保存每条链表当前头；弹出最小节点后把它的 next 入堆。', py('from heapq import heappop, heappush\n\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val, self.next = val, next\n\ndef merge_k_lists(lists):\n    heap = []\n    for index, node in enumerate(lists):\n        if node:\n            heappush(heap, (node.val, index, node))\n    dummy = tail = ListNode()\n    while heap:\n        _, index, node = heappop(heap)\n        tail.next, tail = node, node\n        if node.next:\n            heappush(heap, (node.next.val, index, node.next))\n    tail.next = None\n    return dummy.next'), '时间 O(N log k)，空间 O(k)', {
    beginnerSummary: '输入是 k 条各自升序的链表，输出是一条包含所有节点且仍升序的链表。小根堆每次告诉我们所有链表当前头中最小的那个。',
    prerequisites: ['小根堆的 heappop 总会取出元组中最小的 val。', '元组里的 index 是平手时的比较标记，避免 Python 比较两个 ListNode。'],
    workedExample: ['[1→4]、[1→3]、[2] 先把 1、1、2 放进堆，弹出第一条的 1 并把 4 放入。', '之后堆顶依次为另一条 1、2、3、4，接到 tail 后得到 1→1→2→3→4。'],
    derivation: ['逐一把 k 条链表两两合并可行，但每次都要重复扫描已合并结果。', '堆只保留每条链的一个候选节点；弹出一个才补入它的后继，因此堆最多有 k 个节点。'],
    lineByLine: ['导入 heappush 和 heappop，代码不依赖未定义的堆函数。', '初始化时跳过空链表，堆中只放可用节点。', 'dummy 和 tail 让第一个输出节点也能用同一套连接逻辑。', '弹出节点后只把它自己的后继入堆，保持每条链最多一个候选。'],
    followUps: [{ question: '为什么堆元素要带 index？', answer: '若两个节点值相等，Python 会继续比较元组下一项。index 是可比较的整数，避免它尝试比较两个没有大小关系的节点对象。' }, { question: '分治合并和堆法如何选择？', answer: '两者时间都是 O(N log k)。分治的额外空间主要来自递归/队列，堆法更直观地表达“每次选最小头”。' }],
  }),
  q('146', '链表', 'Medium', 'LRU Cache', '实现 O(1) 的 get/put 与最近最少使用淘汰。', '哈希表定位节点，双向链表维护新旧顺序；访问即移到头部，满时弹出尾部。', py('class Node:\n    def __init__(self, key=0, value=0):\n        self.key, self.value = key, value\n        self.prev = self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.capacity, self.cache = capacity, {}\n        self.head, self.tail = Node(), Node()\n        self.head.next, self.tail.prev = self.tail, self.head\n\n    def _remove(self, node):\n        node.prev.next, node.next.prev = node.next, node.prev\n\n    def _add_front(self, node):\n        node.next, node.prev = self.head.next, self.head\n        self.head.next.prev = node\n        self.head.next = node\n\n    def get(self, key):\n        if key not in self.cache:\n            return -1\n        node = self.cache[key]\n        self._remove(node)\n        self._add_front(node)\n        return node.value\n\n    def put(self, key, value):\n        if key in self.cache:\n            self._remove(self.cache[key])\n        node = Node(key, value)\n        self.cache[key] = node\n        self._add_front(node)\n        if len(self.cache) > self.capacity:\n            least = self.tail.prev\n            self._remove(least)\n            del self.cache[least.key]'), 'get/put 均 O(1)', {
    invariant: 'head 后是最近使用节点，tail 前是最久未使用节点，cache 中每个键都有对应链表节点。',
    beginnerSummary: 'LRU 缓存需要按键快速查值，也要在容量满时删掉最久没用的键。字典负责按键定位，双向链表负责记录新旧顺序。',
    prerequisites: ['字典 cache 把 key 映射到链表节点，查找是 O(1)。', '双向链表的 prev/next 可在已知节点时 O(1) 删除和插入。'],
    workedExample: ['容量为 2：put(1,1)、put(2,2) 后顺序是 2,1；get(1) 后顺序变成 1,2。', 'put(3,3) 超过容量，尾部的 2 被删除，之后 get(2) 返回 -1。'],
    derivation: ['只用字典能快速 get，却不知道哪个键最久未用；只用链表又不能快速按键找到节点。', '把两者组合，get/put 都先定位节点再移动到头部，容量超限时删除 tail 前节点。'],
    lineByLine: ['两个哨兵节点 head/tail 避免在首尾插删时写空指针分支。', '_remove 直接让前后邻居相连，节点已知所以是 O(1)。', 'get 命中后移到头部，表示它刚刚被使用。', 'put 超容量时 tail.prev 正是最久未使用的真实节点，删除它并同步字典。'],
    followUps: [{ question: '为什么更新已有 key 时也要移动它？', answer: '写入本身也是一次使用；如果不移动，它可能刚更新就仍被当成最久未使用而错误淘汰。' }, { question: '容量为 0 会怎样？', answer: '放入一个节点后长度立刻超过 0，代码会把它淘汰；因此 get 永远返回 -1，符合没有可存空间的含义。' }],
  }),

  q('21', '链表', 'Easy', '合并两个有序链表', '合并两条升序单链表。', 'dummy 尾指针每次接较小头，最后接上未耗尽的一条。', py('class ListNode:\n    def __init__(self, val=0, next=None): self.val, self.next = val, next\ndef merge_two_lists(a, b):\n    dummy = tail = ListNode()\n    while a and b:\n        if a.val <= b.val: tail.next, a = a, a.next\n        else: tail.next, b = b, b.next\n        tail = tail.next\n    tail.next = a or b\n    return dummy.next'), '时间 O(m+n)，空间 O(1)', { beginnerSummary: '输入两条升序链表，输出按升序连接的同一批节点；每次只挑两个当前头里较小的一个。', prerequisites: ['链表头是各自剩余节点中的最小值。', 'tail 指向已经合并好的末尾。'], workedExample: ['1→2 与 1→3 先接左边 1，左指针移到 2。', '再接右边 1、2，最后把剩余 3 一次接上。'], derivation: ['收集后排序可做但浪费已有顺序。', '重复选择两个头的较小者会保持整体有序。'], lineByLine: ['dummy 提供固定返回入口。', 'while 比较两条未耗尽链的头节点。', 'tail 前进后始终指向已合并部分末尾。', '一条耗尽时另一条本身有序，可直接连接。'], followUps: [{ question: '为什么相等时任选一条？', answer: '两个值相等时先接哪一个都不破坏升序；代码用 <= 固定优先第一条，结果更稳定。' }, { question: '空链表需要单独判断吗？', answer: '不需要。while 不会进入，最后 a or b 会自然返回另一条链或 None。' }] }),
  q('25', '链表', 'Hard', 'K 个一组翻转链表', '每 k 个节点翻转一次，尾部不足 k 个保留。', '先探测是否够 k 个，再把 [groupPrev.next, kth] 原地反转并接回。', py('class ListNode:\n    def __init__(self, val=0, next=None): self.val, self.next = val, next\ndef reverse_k_group(head, k):\n    dummy = ListNode(0, head); before = dummy\n    while True:\n        kth = before\n        for _ in range(k):\n            kth = kth.next\n            if not kth: return dummy.next\n        after, prev, cur = kth.next, kth.next, before.next\n        while cur is not after:\n            nxt = cur.next; cur.next = prev; prev, cur = cur, nxt\n        old_start = before.next\n        before.next, before = kth, old_start'), '时间 O(n)，空间 O(1)', { beginnerSummary: '输入链表和 k，每凑够 k 个节点才反转；最后不足 k 个的尾巴保留。', prerequisites: ['before 是当前组之前的节点。', 'kth 用来确认当前组确有 k 个节点。'], workedExample: ['1→2→3→4→5，k=2，先翻 1、2 得 2→1→3→4→5。', '再翻 3、4 得 2→1→4→3→5，5 不足一组不动。'], derivation: ['不先数 k 个会错误翻转尾部残组。', '把组后节点当作反转初始 prev，翻转后组尾自动接回。'], lineByLine: ['dummy 让首组也有前驱。', 'for 循环先找 kth，遇到 None 立即保留剩余节点。', '内层循环在 after 边界前反转这一整组。', 'old_start 翻转后是组尾，成为下一组的前驱。'], followUps: [{ question: 'k=1 时会怎样？', answer: '每一组只有一个节点，反转不会改变任何顺序，因此返回原链表。' }, { question: '为什么保存 after？', answer: '反转会改写 kth.next；提前保存组后入口，才能知道停止位置并正确接回后半段。' }] }),
  q('141', '链表', 'Easy', '环形链表', '判断单链表是否含环。', 'Floyd 快慢指针：有环时快指针最终追上慢指针。', py('class ListNode:\n    def __init__(self, val=0, next=None): self.val, self.next = val, next\ndef has_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast: return True\n    return False'), '时间 O(n)，空间 O(1)', { beginnerSummary: '输出链表是否绕成圈。slow 一步一步走，fast 两步两步走；有环时 fast 会追上 slow。', prerequisites: ['slow 每轮走一步，fast 每轮走两步。', 'fast and fast.next 保护第二步不会访问空节点。'], workedExample: ['1→2→3→2 时，两个指针进入环后相对距离每轮缩小 1。', '1→2→None 时 fast 到 None，返回 False。'], derivation: ['集合记录访问节点需要 O(n) 空间。', '环内快指针相对慢指针每轮多走一步，必在有限轮内相遇。'], lineByLine: ['指针从 head 同时出发，空表也安全。', '循环条件保证 fast 可以走两步。', '相遇说明某节点被沿环再次到达。', 'fast 到末尾则路径无环。'], followUps: [{ question: '相遇为什么一定在环里？', answer: '无环链表不会重复节点，快指针只能先到 None，不可能回头碰到慢指针。' }, { question: '能算环长吗？', answer: '可以，在首次相遇点固定一个指针，让另一个绕一圈计数，到再次相遇的步数就是环长。' }] }),
  q('142', '链表', 'Medium', '环形链表 II', '返回环的入口节点。', '相遇后一个指针回头，两指针每次一步，再次相遇即入口。', py('class ListNode:\n    def __init__(self, val=0, next=None): self.val, self.next = val, next\ndef detect_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow, fast = slow.next, fast.next.next\n        if slow is fast: break\n    else:\n        return None\n    seeker = head\n    while seeker is not slow:\n        seeker, slow = seeker.next, slow.next\n    return seeker'), '时间 O(n)，空间 O(1)', { beginnerSummary: '有环则返回入口节点，无环必须返回 None。第一次快慢相遇只能证明有环，第二次同速走才定位入口。', prerequisites: ['while 的 else 只在没有 break 时运行，这里处理无环。', 'seeker 从头开始，slow 从相遇点开始。'], workedExample: ['3→2→0→-4 且 -4 指向 2，快慢指针先在环内相遇。', 'seeker 与 slow 同速走，第一次同点是值为 2 的入口。'], derivation: ['集合可找第一个重复节点但额外耗空间。', '利用快慢相遇的路程关系，让一个回头同速走会在入口重合。'], lineByLine: ['保护条件保证无环时不访问 None.next。', 'break 只在首次相遇时触发。', '循环正常结束时 else 明确返回 None。', '两个一步指针第二次相遇的位置就是入口。'], followUps: [{ question: '为何无环一定要先返回 None？', answer: '无环没有相遇点可供第二阶段使用；继续走既不符合题意，也可能对 None 取 next。' }, { question: '自环是否适用？', answer: '适用。首次循环就相遇，seeker 和 slow 都在头节点，立即返回该节点。' }] }),
  q('160', '链表', 'Easy', '相交链表', '找两条单链表第一个公共节点。', 'a 走完接 b，b 走完接 a；总路程相同，最多第二轮相遇。', py('class ListNode:\n    def __init__(self, val=0, next=None): self.val, self.next = val, next\ndef get_intersection_node(head_a, head_b):\n    a, b = head_a, head_b\n    while a is not b:\n        a = a.next if a else head_b\n        b = b.next if b else head_a\n    return a'), '时间 O(m+n)，空间 O(1)', { beginnerSummary: '求两条链最先共享的节点对象，而不是值相同的节点。两个指针交换链表后走过总路程相等。', prerequisites: ['is 比较是否同一节点对象。', '相交后的后缀完全共享。'], workedExample: ['A=4→1→8，B=5→6→1→8，8 是同一个节点对象。', 'a 走 A 再走 B，b 走 B 再走 A，二者在 8 同时到达。'], derivation: ['先数长度并让长链先走差值可行。', '交换起点自动抵消长度差，也会在无交点时同到 None。'], lineByLine: ['两个指针从各自头节点开始。', '未相遇则走一步，到尾部改走另一条链。', '总路径相同，所以第二段会对齐。', '退出时返回交点或 None。'], followUps: [{ question: '值相同就是相交吗？', answer: '不是。不同节点可以存同一个值；必须是内存中同一节点，才会共享之后的 next 路径。' }, { question: '无交点为什么不会死循环？', answer: '两指针都走完 A+B 后会同时为 None；None is None，循环自然结束。' }] }),

  q('102', '二叉树', 'Medium', '二叉树层序遍历', '按层返回二叉树节点值。', 'BFS 每轮先固定队列长度，恰好弹出这一层。', py('from collections import deque\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val, self.left, self.right = val, left, right\ndef level_order(root):\n    if not root: return []\n    q, answer = deque([root]), []\n    while q:\n        level = []\n        for _ in range(len(q)):\n            node = q.popleft(); level.append(node.val)\n            if node.left: q.append(node.left)\n            if node.right: q.append(node.right)\n        answer.append(level)\n    return answer'), '时间 O(n)，空间 O(w)', { beginnerSummary: '按从上到下、从左到右把树分层输出；队列中保存下一批待访问节点。', prerequisites: ['TreeNode 有 val、left、right。', 'deque 支持 O(1) 的 popleft。'], workedExample: ['树 3 的孩子为 9、20，第一轮队列只弹出 3，输出 [3]。', '第二轮固定长度为 2，弹出 9、20 并把 15、7 入队，输出 [9,20]。'], derivation: ['递归按深度收集也可做。', 'BFS 的队列天然按层排列，先固定本层长度即可分层。'], lineByLine: ['空树返回空列表。', '队列从根开始。', 'len(q) 在入队孩子前固定，避免混入下一层。', '本层收集完再追加到 answer。'], followUps: [{ question: '为什么不能直接遍历当前 q？', answer: '遍历过程中会加入孩子，边遍历边增长会把下一层误算到当前层；先取长度能固定边界。' }, { question: 'w 是什么？', answer: 'w 是树最宽一层的节点数，队列最多同时保存这一层及其下一层候选。' }] }),
  q('103', '二叉树', 'Medium', '二叉树锯齿层序遍历', '按层交替从左到右和从右到左输出。', '普通 BFS，奇数层把当前层结果反转。', py('from collections import deque\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val, self.left, self.right = val, left, right\ndef zigzag_level_order(root):\n    if not root: return []\n    q, answer, left_to_right = deque([root]), [], True\n    while q:\n        level = []\n        for _ in range(len(q)):\n            node = q.popleft(); level.append(node.val)\n            if node.left: q.append(node.left)\n            if node.right: q.append(node.right)\n        answer.append(level if left_to_right else level[::-1])\n        left_to_right = not left_to_right\n    return answer'), '时间 O(n)，空间 O(w)', { beginnerSummary: '仍然按层 BFS，但每隔一层把刚收集的值倒过来，形成左右方向交替的输出。', prerequisites: ['left_to_right 记录当前层输出方向。', 'level[::-1] 会生成倒序列表。'], workedExample: ['根层输出 [3]，方向切换。', '下一层按队列取到 [9,20]，因为方向反向而输出 [20,9]。'], derivation: ['可用双端队列按不同方向插值。', '先做普通层序，再只反转输出数组，孩子入队规则始终简单一致。'], lineByLine: ['空树直接返回。', '队列始终按正常左到右扩展孩子。', '每层结束时依方向选择原数组或倒序数组。', '布尔值翻转保证下一层改变方向。'], followUps: [{ question: '反转会改变下一层顺序吗？', answer: '不会，反转的是已收集的 level 副本；孩子始终按 left、right 入队。' }, { question: '空间会更多吗？', answer: '除了每层结果外只多一个布尔变量，主要空间仍是 BFS 队列的宽度。' }] }),
  q('105', '二叉树', 'Medium', '前序与中序构造二叉树', '由 preorder 和 inorder 重建树。', '前序首元素为根；哈希表定位中序根，递归切分左右子树区间。', py('class TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val, self.left, self.right = val, left, right\ndef build_tree(preorder, inorder):\n    pos = {value: i for i, value in enumerate(inorder)}\n    def build(pre_left, in_left, size):\n        if size == 0: return None\n        root = TreeNode(preorder[pre_left])\n        left_size = pos[root.val] - in_left\n        root.left = build(pre_left + 1, in_left, left_size)\n        root.right = build(pre_left + 1 + left_size, in_left + left_size + 1, size - left_size - 1)\n        return root\n    return build(0, 0, len(preorder))'), '时间 O(n)，空间 O(n)', { beginnerSummary: '前序数组第一个值永远是当前子树根；中序数组中根左边全是左子树，右边全是右子树。', prerequisites: ['前序顺序是根、左、右。', '中序顺序是左、根、右。'], workedExample: ['pre=[3,9,20,15,7] 的根是 3。', '3 在 inorder 中把 [9] 与 [15,20,7] 切开，递归构造两边。'], derivation: ['每次在线性 inorder 里找根会达 O(n²)。', '预先建 pos 哈希表，根位置 O(1) 获得，递归区间不复制数组。'], lineByLine: ['TreeNode 明确题设节点类型。', 'pos 记录每个值的中序位置。', 'size 为 0 是空子树终止条件。', 'left_size 划分两段并确定右子树的前序起点。'], followUps: [{ question: '值能重复吗？', answer: '经典题通常保证值唯一；有重复值时单个位置哈希表不足以唯一划分树。' }, { question: '为什么不切片？', answer: '切片会复制数组，代码虽直观但额外耗时和空间；下标加长度复用原数组。' }] }),

  q('124', '二叉树', 'Hard', '二叉树最大路径和', '路径可从任意节点开始结束，求最大节点和。', '后序返回向下单臂贡献。', py('class TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val, self.left, self.right = val, left, right\ndef max_path_sum(root):\n    best = float("-inf")\n    def dfs(node):\n        nonlocal best\n        if not node: return 0\n        left, right = max(0, dfs(node.left)), max(0, dfs(node.right))\n        best = max(best, node.val + left + right)\n        return node.val + max(left, right)\n    dfs(root); return best'), '时间 O(n)，空间 O(h)', { beginnerSummary: '路径可任意起止；向父节点只能返回一条向下分支，当前节点可合并左右更新答案。', prerequisites: ['后序先得到左右贡献。', '负贡献用 0 舍弃。'], workedExample: ['20 的左右贡献是 15、7。', '15→20→7 的和 42 更新答案。'], derivation: ['枚举路径会重复子树。', '每点只算单臂贡献并合并一次。'], lineByLine: ['best 用负无穷兼容全负树。', '空节点贡献为 0。', 'max(0,...) 去掉负支。', '返回时只能选一条支路。'], followUps: [{ question: '为何不能返回左右和？', answer: '父节点若接上左右和会形成分叉，不是一条简单路径。' }, { question: '全负树呢？', answer: '全局答案仍会选择值最大的单个节点。' }] }),
  q('297', '二叉树', 'Hard', '二叉树序列化与反序列化', '把任意二叉树编码并可无歧义恢复。', '前序值加 # 空标记。', py('class TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val, self.left, self.right = val, left, right\nclass Codec:\n    def serialize(self, root):\n        def walk(n): return ["#"] if not n else [str(n.val)] + walk(n.left) + walk(n.right)\n        return ",".join(walk(root))\n    def deserialize(self, data):\n        tokens = iter(data.split(","))\n        def build():\n            value = next(tokens)\n            if value == "#": return None\n            node = TreeNode(int(value)); node.left, node.right = build(), build()\n            return node\n        return build()'), '时间 O(n)，空间 O(n)', { beginnerSummary: '字符串既要保存值，也要写出空孩子 #，才能还原原来的树形。', prerequisites: ['前序是根、左、右。', '# 表示空节点。'], workedExample: ['1 的左 2、右 3 写为 1,2,#,#,3,#,#。', '读到 1 建根，2 建左子树，两个 # 结束它。'], derivation: ['只记录值会丢失形状。', '同一前序规则读写 token 就能无歧义恢复。'], lineByLine: ['TreeNode 定义题设类型。', 'walk 为每个空节点写 #。', '迭代器让 build 逐个消费 token。', 'build 递归填左右孩子。'], followUps: [{ question: '为什么必须写 #？', answer: '没有空标记时同一值序列可以对应多种树形。' }, { question: '负数能处理吗？', answer: '能，str 写出负号，int 会恢复整数。' }] }),
  q('331', '二叉树', 'Medium', '验证二叉树前序序列化', '不用建树判断前序串是否合法。', '维护可用槽位。', py('def is_valid_serialization(preorder):\n    slots = 1\n    for token in preorder.split(","):\n        slots -= 1\n        if slots < 0: return False\n        if token != "#": slots += 2\n    return slots == 0'), '时间 O(n)，空间 O(1)', { beginnerSummary: '每个节点占一个槽；非空节点再产生两个孩子槽，# 只占槽。', prerequisites: ['根开始有一个槽。', '非空节点提供两个孩子位置。'], workedExample: ['9 后槽从 1 变 2，3 后变 3。', '三个 # 消耗三个槽，最后为 0。'], derivation: ['建树可验证但多占空间。', '槽位精确表示尚待填的孩子位置。'], lineByLine: ['初始槽是根位置。', 'token 先消耗槽。', '负槽代表节点过多。', '结束必须正好为 0。'], followUps: [{ question: '为何 # 不加槽？', answer: '空节点没有孩子。' }, { question: '剩余槽代表什么？', answer: '表示序列缺少某些孩子标记。' }] }),
  q('236', '二叉树', 'Medium', '最近公共祖先', '普通二叉树中求 p、q 的最近公共祖先。', '后序汇报左右是否找到目标。', py('class TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val, self.left, self.right = val, left, right\ndef lowest_common_ancestor(root, p, q):\n    if not root or root is p or root is q: return root\n    left = lowest_common_ancestor(root.left, p, q)\n    right = lowest_common_ancestor(root.right, p, q)\n    if left and right: return root\n    return left or right'), '时间 O(n)，空间 O(h)', { beginnerSummary: '最近公共祖先是同时包含 p、q 的最低节点；左右子树各找到一个时当前根就是答案。', prerequisites: ['is 比较节点身份。', '后序先查左右。'], workedExample: ['左子树找到 5，右子树找到 1。', '根 3 收到两个非空结果，返回 3。'], derivation: ['可保存两条根路径再比较。', '一次后序递归即可让左右报告结果。'], lineByLine: ['空或命中目标直接返回。', '递归查左右子树。', '左右都非空说明目标分居两边。', '仅一边非空时继续上传。'], followUps: [{ question: 'p 是 q 的祖先呢？', answer: '递归先命中 p 并返回它，所以 p 成为答案。' }, { question: '目标不存在呢？', answer: '经典题保证存在；不保证时要额外记录两个目标是否都找到。' }] }),

  q('3', '数组/窗口', 'Medium', '无重复字符的最长子串', '求不含重复字符的最长连续子串。', '用哈希表记录每个字符最近位置；遇到重复字符时把左边界跳到旧位置之后。', py('def length_of_longest_substring(s):\n    last = {}\n    left = best = 0\n    for right, ch in enumerate(s):\n        if ch in last:\n            left = max(left, last[ch] + 1)\n        last[ch] = right\n        best = max(best, right - left + 1)\n    return best'), '时间 O(n)，空间 O(min(n, 字符集))', {
    beginnerSummary: '连续子串不能跳过字符。窗口 [left, right] 始终没有重复；字符再次出现时，left 只向右移动，不会把窗口错误扩大。',
    prerequisites: ['字典把字符映射到最近一次出现的下标。', '窗口长度是 right-left+1，left 只能向右移动。'],
    workedExample: ['输入 "abcabcbb"：读到 a、b、c 时窗口长度依次为 1、2、3。', '再次读到 a 时把 left 从 0 跳到 1，窗口变成 "bca"；继续扫描得到最大长度 3。'],
    derivation: ['暴力枚举每个起点并向右检查会重复扫描，最坏 O(n²)。', '保存最近下标后，冲突时一次跳过不可能合法的前缀；每个字符只被处理常数次。'],
    lineByLine: ['last 保存字符最近下标，使重复检查为 O(1)。', 'left=max(left,last[ch]+1) 防止 left 在旧重复位置之前倒退。', '更新 last 后用窗口长度刷新 best，空字符串自然返回 0。'],
    edgeCases: ['空字符串返回 0', '全部字符相同，答案为 1', '重复字符出现在当前窗口外时 left 不应倒退'],
    followUps: [{ question: '为什么 left 不能直接赋值？', answer: '旧重复字符可能在当前窗口外；直接赋值会让 left 左移并把已经排除的字符重新放回窗口。' }, { question: '如何返回子串本身？', answer: '刷新 best 时同时保存 best_left 和 best_right，最后返回 s[best_left:best_right+1]。' }],
  }),
  q('1', '数组/窗口', 'Easy', '两数之和', '返回和为 target 的两个下标。', '遍历时查找 target-x 是否已出现；查不到再记录当前值和下标。', py('def two_sum(nums, target):\n    seen = {}\n    for i, value in enumerate(nums):\n        need = target - value\n        if need in seen:\n            return [seen[need], i]\n        seen[value] = i\n    return []'), '时间 O(n)，空间 O(n)', {
    beginnerSummary: '只需找一对不同位置的数。扫描到 value 时，若它的补数 target-value 之前出现过，就立刻得到两个下标。',
    prerequisites: ['字典查找和插入平均为 O(1)。', '先查补数再记录当前数，避免同一个元素被使用两次。'],
    workedExample: ['nums=[2,7,11,15]、target=9：读到 2 时记录 {2:0}。', '读到 7 时需要 2，字典命中，返回 [0,1]。'],
    derivation: ['双重循环枚举所有配对需要 O(n²)。', '把已经扫描的值放进字典，每个新值只查一次补数，整体降为 O(n)。'],
    lineByLine: ['seen 记录值到下标的映射。', 'need 是让当前值达到 target 的唯一补数。', '命中时返回旧下标和当前下标，保证是两个位置。', '完整扫描仍无配对时返回空列表。'],
    edgeCases: ['空数组或只有一个元素返回空列表', '重复值如 [3,3]、target=6 必须记录第一个下标', '负数和 target 为负数同样按补数计算'],
    followUps: [{ question: '为什么不能先把所有值都放进字典？', answer: '如果当前值与自己互补，先存完可能错误地使用同一个下标；边扫描边先查再存能避免该问题。' }, { question: '输入保证恰好一组时还需返回空列表吗？', answer: '可以保留空列表作为健壮的兜底；若题目保证有解，调用者也可直接使用返回的两个下标。' }],
  }),
  q('42', '数组/窗口', 'Hard', '接雨水', '计算柱状图能接住的雨水。', '双指针维护两侧最高柱；处理较矮的一侧时，水位已经由该侧最高柱和对侧当前柱保证。', py('def trap(height):\n    if not height:\n        return 0\n    left, right = 0, len(height) - 1\n    left_max = right_max = 0\n    water = 0\n    while left < right:\n        if height[left] <= height[right]:\n            left_max = max(left_max, height[left])\n            water += left_max - height[left]\n            left += 1\n        else:\n            right_max = max(right_max, height[right])\n            water += right_max - height[right]\n            right -= 1\n    return water'), '时间 O(n)，空间 O(1)', {
    beginnerSummary: '每根柱子的积水高度是左右最高柱较小值减去自身高度。双指针让我们从较矮的一侧开始结算，因此不必保存整张前缀/后缀最高表。',
    prerequisites: ['积水量等于水面高度减柱高，水面由左右最高柱较小者决定。', 'left、right 指向尚未结算的两端，left_max/right_max 保存各自已见最高值。'],
    workedExample: ['[0,1,0,2] 中指针从两端开始；先结算左端 0，left_max=0。', '到高度 1 后 left_max=1，下一根 0 可接 1 格；遇到 2 后总水量为 1。'],
    derivation: ['为每个位置预存左右最高值可做 O(n) 空间。', '若左柱不高于右柱，则左侧水位一定由 left_max 决定，结算左端后向内移动；右侧对称。'],
    lineByLine: ['空列表直接返回 0，避免访问首尾元素。', '比较两端高度决定本轮结算哪一侧。', '更新最高值后累加 max-height，保证不会加负水量。', '每轮移动一个指针，因此总扫描为线性。'],
    edgeCases: ['空数组或长度 1 无法蓄水，返回 0', '单调递增/递减柱形没有水', '全是相同高度时水量为 0'],
    followUps: [{ question: '为什么只维护一个侧的 max 就够？', answer: '当处理左侧时，右端当前高度不低于左端，说明右侧至少提供足够高的挡板；左侧水位由 left_max 决定。' }, { question: '能否用单调栈？', answer: '可以按凹槽计算，时间仍 O(n) 但需要 O(n) 栈空间；双指针更省内存。' }],
  }),
  q('128', '数组/窗口', 'Medium', '最长连续序列', '无序数组求最长连续整数序列。', '放入集合后只从没有前驱 x-1 的数字开始向右扩展，每个连续段只扫描一次。', py('def longest_consecutive(nums):\n    values = set(nums)\n    best = 0\n    for x in values:\n        if x - 1 not in values:\n            y = x\n            while y in values:\n                y += 1\n            best = max(best, y - x)\n    return best'), '时间 O(n) 均摊，空间 O(n)', {
    beginnerSummary: '序列不要求在原数组相邻，只要求数值连续。集合能 O(1) 平均判断某个整数是否存在，只有序列起点才向右数。',
    prerequisites: ['集合删除重复值并支持平均 O(1) 成员检查。', '若 x-1 不在集合，x 才可能是连续段起点。'],
    workedExample: ['nums=[100,4,200,1,3,2] 建集合后，1 没有前驱，从 1 数到 4，长度 4。', '3 和 4 都有前驱，不再重复扩展；200 单独成段，答案仍为 4。'],
    derivation: ['排序后扫描也能求解，但需要 O(n log n) 且要处理重复值。', '只从起点扩展保证每个元素最多在一次扩展中被访问，均摊 O(n)。'],
    lineByLine: ['values=set(nums) 统一处理重复数字和无序输入。', '起点判断跳过所有段内元素，避免重复工作。', 'while 找到连续段右边界 y，y-x 就是该段长度。', '空集合循环不执行，返回 0。'],
    edgeCases: ['空数组返回 0', '重复数字不应增加长度', '负数序列如 [-2,-1,0] 也能正常连接'],
    followUps: [{ question: '为什么复杂度是均摊 O(n)？', answer: '虽然外层和内层看似嵌套，但只有起点会进入 while；每个集合元素最多被某个连续段向右访问一次。' }, { question: '如何返回最长序列的起止值？', answer: '刷新 best 时同时保存 start=x、end=y-1，最后返回这两个边界。' }],
  }),
  q('239', '数组/窗口', 'Hard', '滑动窗口最大值', '返回每个长度 k 窗口的最大值。', '单调递减双端队列保存下标；队首是最大值，先淘汰过期下标，再从尾部淘汰更小候选。', py('from collections import deque\n\ndef max_sliding_window(nums, k):\n    if not nums or k <= 0 or k > len(nums):\n        return []\n    window = deque()\n    result = []\n    for i, value in enumerate(nums):\n        while window and window[0] <= i - k:\n            window.popleft()\n        while window and nums[window[-1]] <= value:\n            window.pop()\n        window.append(i)\n        if i >= k - 1:\n            result.append(nums[window[0]])\n    return result'), '时间 O(n)，空间 O(k)', {
    beginnerSummary: '窗口每次右移一格，要快速知道窗口最大值。队列下标对应的值从队首到队尾递减，所以队首总是最大候选。',
    prerequisites: ['deque 两端都能 O(1) 加删。', '保存下标而不只是值，才能判断元素是否已经滑出窗口。'],
    workedExample: ['nums=[1,3,-1,-3,5]、k=3：加入 1、3 时从尾删除 1，队首为 3，首个答案是 3。', 'i=4 加入 5 后完整窗口是 [-1,-3,5]；下标 1 的 3 已过期，队尾的 -1、-3 等更小候选也被 5 淘汰，窗口最大值为 5。'],
    derivation: ['每个窗口重新 max 需要 O(nk)。', '新值更大时，从队尾淘汰所有更小或相等候选；这些候选更早进入且未来不可能胜过新值。每个下标最多入队出队一次，故线性。'],
    lineByLine: ['先移除 i-k 之前的过期下标。', '从尾删除不大于当前值的下标，维护递减性。', '当前下标入队后，队首就是窗口最大值。', 'i 达到 k-1 才开始输出完整窗口答案。'],
    edgeCases: ['k<=0、空数组或 k 大于数组长度返回空列表', 'k=1 时输出原数组副本', '重复最大值保留较新的下标，旧下标可安全淘汰'],
    followUps: [{ question: '为什么队列要存下标？', answer: '值本身无法说明是否离开窗口；下标能用 i-k 判断过期。' }, { question: '若要返回最大值及其下标怎么办？', answer: '队首本来就是下标，输出 (nums[window[0]], window[0]) 即可。' }],
  }),
  q('334', '数组/窗口', 'Medium', '递增三元子序列', '判断是否存在 i<j<k 且 nums[i]<nums[j]<nums[k]。', '维护历史扫描中仍可证明存在的递增前缀阈值 first、second；遇到大于 second 的数即组成三元组。', py('def increasing_triplet(nums):\n    first = second = float("inf")\n    for value in nums:\n        if value <= first:\n            first = value\n        elif value <= second:\n            second = value\n        else:\n            return True\n    return False'), '时间 O(n)，空间 O(1)', {
    beginnerSummary: '只需知道是否存在，不必保存三元组。first、second 是历史扫描中仍可证明存在的递增前缀阈值；阈值越小，后面越容易找到第三个更大值。',
    prerequisites: ['子序列要求下标递增，但中间允许跳过元素。', '用无穷大表示还没有找到可证明的 first 或 second 阈值。'],
    workedExample: ['nums=[2,1,5,0,4,6]：先把 first 更新为 1，读到 5 得 second=5。', '读到 0 后把 first 更新得更小，读到 4 把 second 降为 4，最后 6>4，返回 True。'],
    derivation: ['枚举三元组需要 O(n³)，维护所有前缀候选也会浪费空间。', '保留最小的 first、second 阈值是安全的：更小的阈值不会减少未来可行的第三个数。'],
    invariant: 'first、second 表示历史扫描中仍可证明存在的递增前缀阈值；即使 first 更新，已有 first<second 的证据仍保留，后续更大值可作为第三项。',
    lineByLine: ['value<=first 时把可证明前缀的 first 阈值降得更小。', '否则若不超过 second，更新 second 阈值；已有递增前缀证据仍保留。', '既大于 first 又大于 second 时，三元组已按扫描顺序成立。', '循环结束仍无第三值则返回 False。'],
    edgeCases: ['长度小于 3 直接返回 False', '严格递增要求使用 <，相等值不能充当下一项', '全相等或严格递减数组没有三元组'],
    followUps: [{ question: '为什么更新 first 不会破坏下标顺序？', answer: 'first、second 表示历史扫描中仍可证明存在的递增前缀阈值；更新 first 不会丢掉已有 first<second 的证据，后续更大值即可作为第三项。' }, { question: '如何返回一组具体下标？', answer: '额外保存 first_index 和 second_index；发现第三个值时返回这两个下标及当前下标。' }],
  }),

  q('33', '二分/TopK', 'Medium', '搜索旋转排序数组', '在无重复旋转数组中找 target。', '每轮至少一侧有序；若 target 落在有序侧就收缩到该侧，否则搜索另一侧。', py('def search_rotated(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[left] <= nums[mid]:\n            if nums[left] <= target < nums[mid]:\n                right = mid - 1\n            else:\n                left = mid + 1\n        else:\n            if nums[mid] < target <= nums[right]:\n                left = mid + 1\n            else:\n                right = mid - 1\n    return -1'), '时间 O(log n)，空间 O(1)', {
    beginnerSummary: '旋转只把一个有序数组从某处切开再拼接，因此每轮中点左边或右边至少有一段保持有序，可以像普通二分一样排除一半。',
    prerequisites: ['二分区间 [left,right] 是仍可能包含 target 的闭区间。', '无重复时 nums[left]<=nums[mid] 能准确判断左半是否有序。'],
    workedExample: ['[4,5,6,7,0,1,2] 搜索 0：中点 7，左半有序但 0 不在其中，丢掉左半。', '区间 [0,1,2] 的中点为 1，右半有序且 0 在左侧，继续收缩后命中 0。'],
    derivation: ['线性扫描能找到答案但为 O(n)。', '利用有序半边的边界比较，每轮排除不可能的一半，得到 O(log n)。'],
    lineByLine: ['空数组时 left>right，循环不执行并返回 -1。', '命中中点立即返回，避免继续改变边界。', '先判断哪一半有序，再检查 target 是否落在其闭开区间。', '边界更新使用 mid±1，保证区间严格缩小。'],
    edgeCases: ['空数组返回 -1', '只有一个元素时只检查一次', 'target 不存在时最终 left 越过 right'],
    followUps: [{ question: '数组允许重复值时还成立吗？', answer: '重复会让两端和中点相等，无法判断哪半有序；可在相等时收缩 left、right，但最坏复杂度退化为 O(n)。' }, { question: '为什么用 <= 判断左侧有序？', answer: '无重复且闭区间下，left 与 mid 相等代表左侧仍是正常非降序，单元素区间也能被处理。' }],
  }),
  q('153', '二分/TopK', 'Medium', '寻找旋转排序数组最小值', '数组无重复，找旋转点最小值。', '比较中点和右端：中点较大说明最小值在右边，否则保留中点并收缩右边界。', py('def find_min_rotated(nums):\n    if not nums:\n        return None\n    left, right = 0, len(nums) - 1\n    while left < right:\n        mid = (left + right) // 2\n        if nums[mid] > nums[right]:\n            left = mid + 1\n        else:\n            right = mid\n    return nums[left]'), '时间 O(log n)，空间 O(1)', {
    beginnerSummary: '未旋转数组最小值在最左；旋转后最小值是断点。中点若比右端大，说明中点位于左段，断点只能在右侧。',
    prerequisites: ['循环保持最小值位于 [left,right]。', 'right=mid 而不是 mid-1，因为 mid 可能就是最小值。'],
    workedExample: ['[3,4,5,1,2] 中点 5>2，最小值在右半，left 移到 3。', '新区间 [1,2] 中点 1<=2，保留 mid 并让 right=mid，最终返回 1。'],
    derivation: ['线性扫描为 O(n)，但旋转数组两段各自有序。', '每次比较中点与右端都能确定一半不含断点，闭区间收缩到单点。'],
    lineByLine: ['空列表没有定义的最小值，约定返回 None。', 'left<right 保证至少保留一个候选。', 'nums[mid]>nums[right] 时断点在 mid 右侧。', '否则 mid 及其左侧仍可能是最小值，故 right=mid。'],
    edgeCases: ['空数组返回 None', '长度 1 返回唯一元素', '未旋转数组如 [1,2,3] 最终返回首元素'],
    followUps: [{ question: '有重复值时如何修改？', answer: '若 nums[mid]==nums[right]，无法排除右端，可令 right-=1；正确但最坏会退化为 O(n)。' }, { question: '为什么不能写 right=mid-1？', answer: '当 mid 恰好是最小值时会把答案删掉；right=mid 才能保留它。' }],
  }),
  q('347', '二分/TopK', 'Medium', '前 K 个高频元素', '返回出现频率最高的 k 个元素。', 'Counter 统计频率后维护大小为 k 的小根堆；频率相同的元素按数值作稳定的并列规则。', py('from collections import Counter\nfrom heapq import heappush, heappop\n\ndef top_k_frequent(nums, k):\n    if k <= 0:\n        return []\n    counts = Counter(nums)\n    heap = []\n    for value, frequency in counts.items():\n        heappush(heap, (frequency, value))\n        if len(heap) > k:\n            heappop(heap)\n    return [value for _, value in heap]'), '时间 O(n log k)，空间 O(n)', {
    beginnerSummary: '先数每个数字出现多少次，再只保留频率最高的 k 个。小根堆堆顶是当前最容易被淘汰的候选。',
    prerequisites: ['Counter 是值到频率的字典。', '堆元组按频率再按值比较；堆大小超过 k 时弹出最小元组。'],
    workedExample: ['[1,1,1,2,2,3] 的频率为 1→3、2→2、3→1；k=2 时先放 1、2。', '放入 3 后弹出频率最低的 3，剩下 [1,2]（返回顺序不保证）。'],
    derivation: ['完整排序所有不同值需要 O(u log u)。', '大小受限的堆只保留 k 个候选，复杂度 O(u log k)，u≤n。'],
    lineByLine: ['k<=0 返回空结果，避免无意义建堆。', 'counts.items() 逐个处理不同值及其频率。', '堆超过 k 时弹出最小频率，保持 TopK。', '并列频率按 value 的元组顺序确定保留规则，结果列表无需排序。'],
    edgeCases: ['k<=0 返回空列表', 'k 大于不同元素数时返回全部不同元素', '频率相同时题目通常允许任意答案，本实现用数值作为稳定 tie-breaker'],
    followUps: [{ question: '为什么并列频率可以任意选？', answer: '题目只要求频率最高的 k 个；若第 k 名存在并列，任取其中 k 个都满足条件。代码用数值比较只是让结果可复现。' }, { question: '如何按频率降序输出？', answer: '对堆结果再执行 sorted(result, key=lambda x: counts[x], reverse=True)；这会增加 O(k log k)。' }],
  }),
  q('4', '二分/TopK', 'Hard', '两个正序数组中位数', '要求 O(log(min(m,n))) 求中位数。', '在较短数组上二分切分点，使左半所有元素不大于右半；用哨兵处理切在数组边界的情况。', py('def find_median_sorted_arrays(a, b):\n    if len(a) > len(b):\n        a, b = b, a\n    total = len(a) + len(b)\n    if total == 0:\n        return None\n    left, right = 0, len(a)\n    half = (total + 1) // 2\n    while left <= right:\n        cut_a = (left + right) // 2\n        cut_b = half - cut_a\n        left_a = a[cut_a - 1] if cut_a else float("-inf")\n        right_a = a[cut_a] if cut_a < len(a) else float("inf")\n        left_b = b[cut_b - 1] if cut_b else float("-inf")\n        right_b = b[cut_b] if cut_b < len(b) else float("inf")\n        if left_a > right_b:\n            right = cut_a - 1\n        elif left_b > right_a:\n            left = cut_a + 1\n        else:\n            left_max = max(left_a, left_b)\n            if total % 2:\n                return left_max\n            return (left_max + min(right_a, right_b)) / 2\n    raise ValueError("输入数组必须有序")'), '时间 O(log(min(m,n)))（任一数组为空时 O(1) 特判），空间 O(1)', {
    beginnerSummary: '把两个数组合并后，中位数是中间位置；但合并会花 O(m+n)。切分两数组，让左边正好有一半元素，再用边界值计算中位数。',
    prerequisites: ['切分点 cut 表示左半取几个元素，左半元素数量固定为 half。', '两个数组有序时，只需比较切分两侧的四个边界。'],
    workedExample: ['a=[1,3]、b=[2] 时交换为短数组 b；切分后左半 [1,2]，右半 [3]。', '总长度为 3，左半最大值 2，因此中位数为 2。'],
    derivation: ['合并排序虽然简单，但复杂度 O(m+n)。', '只在较短数组二分 cut_a，并由 half-cut_a 推出 cut_b；满足交叉边界后即可停止。'],
    lineByLine: ['先让 a 成为较短数组，保证二分复杂度。', '哨兵 -inf/inf 让切分在首尾时也能比较。', '交叉边界错误时移动二分区间。', '奇数取左半最大值，偶数取左右中间值平均。'],
    edgeCases: ['两个数组都空时返回 None', '其中一个为空时退化为另一个数组的中位数', '切分点落在首尾时依靠哨兵避免越界'],
    followUps: [{ question: '为什么必须二分较短数组？', answer: 'cut_b=half-cut_a 必须落在 b 的合法范围；在较短数组上二分可保证范围小且更容易满足边界。' }, { question: '输入未排序会怎样？', answer: '交叉边界不再代表整体顺序，算法结果不可靠；应先排序或明确要求正序输入。' }],
  }),
  q('215', '二分/TopK', 'Medium', '数组第 K 大元素', '在无序数组找第 k 大。', '把第 k 大转换为升序下标 n-k，用原地 partition 把目标放到正确一侧，重复缩小范围。', py('import random\n\ndef find_kth_largest(nums, k):\n    if not 1 <= k <= len(nums):\n        return None\n    target = len(nums) - k\n\n    def partition(left, right):\n        pivot_index = random.randint(left, right)\n        nums[pivot_index], nums[right] = nums[right], nums[pivot_index]\n        pivot = nums[right]\n        store = left\n        for i in range(left, right):\n            if nums[i] <= pivot:\n                nums[store], nums[i] = nums[i], nums[store]\n                store += 1\n        nums[store], nums[right] = nums[right], nums[store]\n        return store\n\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        pivot_index = partition(left, right)\n        if pivot_index == target:\n            return nums[pivot_index]\n        if pivot_index < target:\n            left = pivot_index + 1\n        else:\n            right = pivot_index - 1\n    return None'), '期望 O(n)（随机 pivot），最坏 O(n²)，空间 O(1)', {
    beginnerSummary: '第 k 大等于升序排列下标 n-k 的元素。partition 把不大于 pivot 的值放左边，大于的放右边；只继续搜索包含目标下标的一侧。',
    prerequisites: ['partition 返回 pivot 在当前区间排序后的最终下标。', '目标下标 target=len(nums)-k，k=1 就是最后一个位置。'],
    workedExample: ['nums=[3,2,1,5,6,4]、k=2，目标下标为 4。以 4 分区后目标若在右侧，只保留右区间。', '继续分区后下标 4 的值为 5，返回第 2 大元素 5。'],
    derivation: ['完整排序需要 O(n log n)，堆解法需要 O(n log k)。', 'Quickselect 每轮只递归/循环一侧；随机 pivot 时平均线性，但固定极端 pivot 可能 O(n²)。'],
    lineByLine: ['非法 k 返回 None，避免越界。', 'partition 内 store 标记下一个应放小值的位置，并最终放置 pivot。', '比较 pivot_index 与 target 决定保留左区间还是右区间。', '命中目标下标立即返回，不必排序其他元素。'],
    edgeCases: ['空数组或 k 不在 1..n 返回 None', '重复值允许 partition 正常工作', 'k=1 返回最大值，k=n 返回最小值'],
    followUps: [{ question: '如何降低最坏 O(n²) 风险？', answer: '随机选择 pivot 后与 right 交换再分区，或使用 median-of-medians；平均性能更稳定。' }, { question: '为什么代码会修改 nums？', answer: '原地 partition 通过交换元素节省空间；若调用者需保留原数组，可先传入 nums[:] 的副本。' }],
  }),

  q('46', '搜索/图', 'Medium', '全排列', '返回无重复数组的所有排列。', '回溯维护 path 和 used；长度到 n 时复制答案。', py('def dfs():\n    if len(path)==len(nums):ans.append(path[:]);return\n    for i,x in enumerate(nums):\n        if not used[i]:\n            used[i]=1; path.append(x); dfs(); path.pop(); used[i]=0'), '时间 O(n·n!)，空间 O(n)'),
  q('78', '搜索/图', 'Medium', '子集', '返回数组的全部子集。', '每个元素只有选或不选两种分支，也可按起点枚举组合。', py('ans=[[]]\nfor x in nums:\n    ans += [s+[x] for s in ans]\nreturn ans'), '时间 O(n·2^n)，空间 O(n·2^n)'),
  q('39', '搜索/图', 'Medium', '组合总和', '元素可重复使用，找和为 target 的组合。', '递归从 start 开始，允许下一层仍使用当前下标以避免排列重复。', py('def dfs(start,remain):\n    if remain==0:ans.append(path[:]);return\n    for i in range(start,len(candidates)):\n        x=candidates[i]\n        if x>remain:break\n        path.append(x); dfs(i,remain-x); path.pop()'), '指数级，取决于解空间'),
  q('79', '搜索/图', 'Medium', '单词搜索', '在字母网格中判断是否能走出单词。', '从每格 DFS，当前路径临时标记访问，回溯时恢复。', py('def dfs(i,j,k):\n    if k==len(word):return True\n    if bad(i,j,k):return False\n    ch=board[i][j]; board[i][j]="#"\n    ok=any(dfs(i+di,j+dj,k+1) for di,dj in dirs)\n    board[i][j]=ch; return ok'), '时间 O(mn·4^L)，空间 O(L)'),
  q('994', '搜索/图', 'Medium', '腐烂的橘子', '求所有新鲜橘子腐烂的最少分钟。', '多源 BFS：所有腐烂橘子同时入队，每层代表一分钟。', py('q=deque(rotten); minutes=0\nwhile q and fresh:\n    for _ in range(len(q)):\n        i,j=q.popleft()\n        for ni,nj in neighbors(i,j):\n            if grid[ni][nj]==1:grid[ni][nj]=2; fresh-=1; q.append((ni,nj))\n    minutes+=1\nreturn minutes if fresh==0 else -1'), '时间 O(mn)，空间 O(mn)'),
  q('200', '搜索/图', 'Medium', '岛屿数量', '统计网格中四连通岛屿数量。', '扫描到陆地就计数并 DFS/BFS 淹没整个连通块。', py('for i in range(m):\n for j in range(n):\n  if grid[i][j]=="1":\n   ans+=1; flood(i,j)  # flood 将访问过的陆地改为 0'), '时间 O(mn)，空间 O(mn)'),

  q('53', '动态规划', 'Easy', '最大子数组和', '求连续子数组最大和。', 'Kadane：以当前位置结尾的最好和，要么从当前数重启要么接前缀。', py('best=cur=nums[0]\nfor x in nums[1:]:\n    cur=max(x,cur+x); best=max(best,cur)\nreturn best'), '时间 O(n)，空间 O(1)'),
  q('121', '动态规划', 'Easy', '买卖股票的最佳时机', '最多一次交易的最大利润。', '扫描中维护历史最低买入价，用当天卖出更新利润。', py('low=float("inf"); ans=0\nfor p in prices:\n    low=min(low,p); ans=max(ans,p-low)\nreturn ans'), '时间 O(n)，空间 O(1)'),
  q('198', '动态规划', 'Medium', '打家劫舍', '不能抢相邻房屋时的最大金额。', 'dp[i]=前 i 间最大值，转移为不抢 i 或抢 i 加 dp[i-2]。', py('prev2=prev1=0\nfor x in nums:\n    prev2,prev1=prev1,max(prev1,prev2+x)\nreturn prev1'), '时间 O(n)，空间 O(1)'),
  q('55', '动态规划', 'Medium', '跳跃游戏', '判断能否到达最后下标。', '贪心维护最远可达位置，遍历到不可达位置立即失败。', py('far=0\nfor i,step in enumerate(nums):\n    if i>far:return False\n    far=max(far,i+step)\nreturn True'), '时间 O(n)，空间 O(1)'),
  q('1143', '动态规划', 'Medium', '最长公共子序列', '求两个字符串的 LCS 长度。', '字符相等取左上加一，否则取上方和左方较大值。', py('dp=[[0]*(n+1) for _ in range(m+1)]\nfor i in range(1,m+1):\n for j in range(1,n+1):\n  dp[i][j]=dp[i-1][j-1]+1 if a[i-1]==b[j-1] else max(dp[i-1][j],dp[i][j-1])\nreturn dp[m][n]'), '时间 O(mn)，空间 O(mn)'),
  q('139', '动态规划', 'Medium', '单词拆分', '判断字符串能否由词典词拼出。', 'dp[i] 表示前 i 个字符可拆；枚举末词起点 j。', py('dp=[False]*(len(s)+1); dp[0]=True\nfor i in range(1,len(s)+1):\n    dp[i]=any(dp[j] and s[j:i] in words for j in range(i))\nreturn dp[-1]'), '时间 O(n²)，空间 O(n)'),
  q('416', '动态规划', 'Medium', '分割等和子集', '是否可分成和相等的两组。', '总和为奇数直接否；0/1 背包倒序更新能否凑到 sum/2。', py('if sum(nums)%2:return False\nt=sum(nums)//2; dp=[True]+[False]*t\nfor x in nums:\n    for s in range(t,x-1,-1):dp[s]|=dp[s-x]\nreturn dp[t]'), '时间 O(n·sum)，空间 O(sum)'),
  q('72', '动态规划', 'Hard', '编辑距离与 WER 回溯', '求编辑距离，并解释 WER 的 S/D/I 回溯。', 'dp 记录最少编辑；从右下沿取得最优的前驱反向走即可累计替换、删除、插入。', py('for i in range(1,m+1):\n for j in range(1,n+1):\n  dp[i][j]=dp[i-1][j-1] if ref[i-1]==hyp[j-1] else 1+min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1])\n# 回溯前驱，WER=(S+D+I)/len(ref)'), '时间 O(mn)，空间 O(mn)', { followUps: ['如何把空间压缩为 O(n)？', '为什么 WER 需要回溯？'], followUpAnswers: ['只需距离时保留两行；需要操作序列则保留父指针或重算。', '回溯才能区分相同距离中的替换、删除和插入。'] }),

  q('cross-entropy', '模型手写', 'Medium', '多分类 Cross Entropy', '手写稳定的 softmax 交叉熵。', '先减每行最大 logit，再 logsumexp；损失是正确类负对数概率。', py('z=logits-logits.max(axis=1,keepdims=True)\nlogp=z-np.log(np.exp(z).sum(axis=1,keepdims=True))\nloss=-logp[np.arange(len(y)),y].mean()'), '时间 O(B·C)，空间 O(B·C)', { invariant: '平移所有 logits 不改变 softmax 概率。' }),
  q('bce', '模型手写', 'Medium', '二分类 BCEWithLogits', '解释为何 BCE 应直接吃 logits。', '稳定公式 max(x,0)-x*y+log1p(exp(-abs(x)))，避免先 sigmoid 溢出。', py('def bce_logits(x,y):\n    return np.maximum(x,0)-x*y+np.log1p(np.exp(-np.abs(x)))'), '时间 O(n)，空间 O(n)'),
  q('batchnorm', '模型手写', 'Medium', 'BatchNorm', '训练和推理阶段 BN 有何不同。', '训练用当前 batch 均值方差并更新滑动统计；推理用 running mean/var。', py('mu=x.mean(axis=0); var=x.var(axis=0)\ny=gamma*(x-mu)/np.sqrt(var+eps)+beta\nrunning_mu=momentum*running_mu+(1-momentum)*mu'), '时间 O(元素数)，空间 O(C)'),
  q('dropout', '模型手写', 'Easy', 'Dropout', '实现 inverted dropout 并说明推理行为。', '训练时以 keep_prob 采样掩码并除以 keep_prob；推理直接恒等映射。', py('if training:\n    mask=(np.random.rand(*x.shape)<keep)/keep\n    return x*mask\nreturn x'), '时间 O(元素数)，空间 O(元素数)'),
  q('positional-encoding', '模型手写', 'Medium', '正弦位置编码', '写出 Transformer 的 sinusoidal 位置编码。', '偶数维用 sin(pos/10000^(2i/d))，奇数维用 cos，使相对位移可线性表达。', py('pos=np.arange(L)[:,None]; i=np.arange(0,d,2)\npe=np.zeros((L,d)); angle=pos/10000**(i/d)\npe[:,0::2]=np.sin(angle); pe[:,1::2]=np.cos(angle)'), '时间 O(Ld)，空间 O(Ld)'),
  q('topk-sampling', '模型手写', 'Medium', 'Top-K Sampling', '实现只在概率最高 k 个 token 中采样。', '取 top-k logits，把其余置为 -inf，重新 softmax 后按分布采样。', py('idx=np.argpartition(logits,-k)[-k:]\nmasked=np.full_like(logits,-np.inf); masked[idx]=logits[idx]\np=np.exp(masked-masked.max()); p/=p.sum()\nreturn rng.choice(len(p),p=p)'), '时间 O(V)，空间 O(V)'),
  q('beam-search', '模型手写', 'Hard', 'Beam Search', '解释束搜索的状态、打分和终止。', '每步扩展每条 beam 的 top 候选，累计 logprob，保留全局前 beam_size 条。', py('beams=[([],0.0)]\nfor _ in range(max_len):\n    cand=[]\n    for seq,score in beams:\n        for tok,lp in top_tokens(seq):cand.append((seq+[tok],score+lp))\n    beams=sorted(cand,key=lambda x:x[1],reverse=True)[:beam_size]'), '时间 O(T·beam·V)，空间 O(beam·T)'),
  q('kmeans', '模型手写', 'Medium', 'K-Means', '写出 KMeans 的 E/M 两步并说明空簇处理。', 'E 步分配最近中心，M 步取簇均值；空簇可重置为最远样本。', py('for _ in range(iters):\n    label=((x[:,None]-centers[None])**2).sum(-1).argmin(1)\n    for k in range(K):\n        if np.any(label==k): centers[k]=x[label==k].mean(0)'), '每轮 O(nKd)，空间 O(nK)'),
  q('iou', '模型手写', 'Easy', 'IoU', '计算两个 xyxy 框的 Intersection over Union。', '交集宽高取 max(0, min(right)-max(left))，再除并集。', py('iw=max(0,min(a[2],b[2])-max(a[0],b[0]))\nih=max(0,min(a[3],b[3])-max(a[1],b[1]))\ninter=iw*ih\nreturn inter/(area(a)+area(b)-inter+1e-9)'), '时间 O(1)，空间 O(1)'),
  q('nms', '模型手写', 'Medium', 'NMS', '按置信度抑制重叠检测框。', '按分数降序取最高框，删除与它 IoU 超阈值的剩余框，直到为空。', py('keep=[]\norder=scores.argsort()[::-1]\nwhile len(order):\n    i=order[0]; keep.append(i)\n    order=order[1:][iou(boxes[i],boxes[order[1:]])<thr]'), '朴素 O(n²)，空间 O(n)'),
  q('convolution', '模型手写', 'Medium', '二维卷积输出尺寸', '解释卷积输出尺寸和 im2col 思路。', '单边输出 floor((W+2P-K)/S)+1；对每个滑窗与卷积核逐元素乘加。', py('out=(W+2*P-K)//S+1\nfor oy in range(out):\n for ox in range(out):\n  patch=padded[oy*S:oy*S+K,ox*S:ox*S+K]\n  y[oy,ox]=(patch*kernel).sum()'), '直接实现 O(HW·K²)，空间 O(HW)'),
  q('attention', '模型手写', 'Hard', '缩放点积 Attention', '实现 Attention(Q,K,V)=softmax(QKᵀ/√d + mask)V。', '先算 score 并除以 √d 控制方差；mask 在 softmax 前置为负无穷，再与 V 相乘。', py('scores = Q @ K.transpose(-1, -2) / math.sqrt(Q.shape[-1])\nif mask is not None:\n    scores = scores.masked_fill(~mask, float("-inf"))\nweights = scores.softmax(dim=-1)\noutput = weights @ V'), '时间 O(L²d)，空间 O(L²)', {
    derivation: ['QKᵀ 给出每个 query 对所有 key 的相似度。', '缩放防止 d 较大时 softmax 饱和。', 'softmax 后每一行是对 value 的凸组合。'],
    invariant: '每个未被 mask 的 query 行权重和为 1，且被 mask 的位置概率为 0。',
    walkthrough: '用两个 query、三个 key 的小矩阵，先算一行分数，再 softmax 并加权 value。',
    edgeCases: ['全为 mask 的行需要避免产生 NaN', 'causal mask 不能看到未来 token', '注意 batch/head 维度广播'],
    codeNotes: ['mask 必须在 softmax 之前应用。', '实际框架中应使用稳定的 fused softmax。'],
    followUps: ['为什么是除以 √d 而不是 d？', 'Self Attention 与 Cross Attention 有何差异？'],
    followUpAnswers: ['点积方差随 d 增大，除以 √d 可将量级稳定在常数。', 'Self 的 Q/K/V 来自同一序列；Cross 的 Q 来自解码器，K/V 来自编码器。'],
    pitfalls: ['把 mask 放到 softmax 后会破坏归一化。', '漏掉缩放会使大维度下梯度变差。'],
  }),
  q('rmsnorm', '模型手写', 'Medium', 'RMSNorm', '手写 RMSNorm，并与 LayerNorm 比较。', '沿 hidden 维计算均方根，不减均值；归一化后只乘可学习 scale。', py('def rmsnorm(x, weight, eps=1e-6):\n    rms = (x.pow(2).mean(dim=-1, keepdim=True) + eps).sqrt()\n    return x / rms * weight'), '时间 O(元素数)，额外空间 O(1)', {
    derivation: ['计算每个 token 的均方根 rms。', 'x/rms 把向量尺度归一。', '用 weight 恢复每个通道的可学习缩放。'],
    invariant: '归一化维度固定为最后一维 hidden size，eps 位于开方前。',
    walkthrough: '对向量 [3,4]，rms=√((9+16)/2)，逐维相除后再乘 weight。',
    edgeCases: ['全零向量依赖 eps 防除零', '输入可含 batch 与序列维', '半精度下 eps 不能过小'],
    codeNotes: ['RMSNorm 不需要减均值，也通常没有 bias。', 'keepdim 保证能与原输入广播。'],
    followUps: ['与 LayerNorm 的关键差异？', '为什么常用于大语言模型？'],
    followUpAnswers: ['LayerNorm 还会中心化并除标准差；RMSNorm 只控制尺度。', '计算略少且在实践中训练稳定，常作为 Transformer 的归一化层。'],
    pitfalls: ['误把均方根写成均值。', 'mean 的维度写错会跨 token 归一化。'],
  }),
  q('conv1d', '模型手写', 'Medium', '一维卷积', '手写单通道一维卷积并计算输出长度。', '每个输出位置取长度 K 的窗口与卷积核点积；长度为 floor((L+2P-K)/S)+1。', py('def conv1d(x, kernel, stride=1, pad=0):\n    x = np.pad(x, (pad, pad))\n    out_len = (len(x) - len(kernel)) // stride + 1\n    return np.array([(x[i*stride:i*stride+len(kernel)] * kernel).sum()\n                     for i in range(out_len)])'), '时间 O(L·K)，空间 O(L)', {
    derivation: ['先在时间轴两端补零。', '滑窗以 stride 移动，每次与 kernel 点积。', '多通道时对输入通道求和并为每个输出通道使用一组核。'],
    invariant: '第 i 个输出只读取补零后从 i·stride 开始的连续 K 个采样点。',
    walkthrough: '输入 [1,2,3]、核 [1,1]、stride=1 时依次得到 3、5。',
    edgeCases: ['核长大于有效输入', 'stride 大于 1', 'padding 导致边界窗口含零'],
    codeNotes: ['深度学习库通常实现的是互相关，不会翻转 kernel。', '实际张量布局还要处理 batch、channel 维。'],
    followUps: ['dilation 如何改变感受野？', 'Conv1d 如何用于语音？'],
    followUpAnswers: ['采样窗口内部间隔 dilation，感受野增大而参数量不变。', '可沿时间轴提取局部声学模式，stride 同时实现下采样。'],
    pitfalls: ['把卷积翻核与框架互相关语义混淆。', '输出长度公式漏掉 padding 或 stride。'],
  }),

  q('ctc-greedy', 'ASR 专项', 'Medium', 'CTC Greedy Decode', '把逐帧 argmax token 解码为文本。', '先合并连续重复 token，再删除 blank；顺序不能颠倒。', py('out=[]; prev=None\nfor t in tokens:\n    if t!=prev and t!=blank:out.append(t)\n    prev=t\nreturn out'), '时间 O(T)，空间 O(T)', { pitfalls: ['先删 blank 会把 a, blank, a 错误合并。', 'argmax 只给局部最优，不等于全局最优转写。'] }),
  q('ctc-prefix-beam', 'ASR 专项', 'Hard', 'CTC Prefix Beam Search', '说明 prefix beam 为什么维护 p_blank 和 p_nonblank。', '同一前缀以 blank/nonblank 结尾的转移不同；分开累计才能正确处理重复字符。', py('for prefix in beams:\n    pb,pnb=score[prefix]\n    next[prefix].blank += (pb+pnb)*p(blank)\n    for c in vocab_no_blank:\n        # c==last 时只能从 blank 扩展同前缀\n        update_prefix(prefix,c,pb,pnb)'), '时间约 O(T·beam·V)，空间 O(beam)', { followUps: ['如何融合语言模型？', '为什么要做 log-sum-exp？'], followUpAnswers: ['扩展分数时加上 λ·LM(prefix+c) 和长度奖励。', '同一前缀有多条对齐路径，概率应相加；对数域用 log-sum-exp。'] }),
  q('rnnt', 'ASR 专项', 'Hard', 'RNN-T 前向递推', '解释 RNN-T 的 t/u 二维格点与 blank、label 转移。', 'encoder 推进时间 t，prediction 网络推进标签 u；blank 走 (t+1,u)，标签走 (t,u+1)。', py('alpha[0,0]=0\nfor t in range(T+1):\n for u in range(U+1):\n  alpha[t+1,u]=logadd(alpha[t+1,u],alpha[t,u]+logp_blank[t,u])\n  alpha[t,u+1]=logadd(alpha[t,u+1],alpha[t,u]+logp_label[t,u])'), '时间 O(TU)，空间 O(TU)'),
  q('rnnt-greedy', 'ASR 专项', 'Hard', 'RNN-T Greedy Decode', '实现 RNN-T 的时间同步贪心解码。', '每个 encoder 帧反复取 joint 网络最大 token；若是 blank 则前进到下一帧，否则输出 token 并更新 prediction state。', py('state = predictor.start()\nfor t in range(T):\n    for _ in range(max_symbols_per_frame):\n        token = joint(encoder[t], state).argmax()\n        if token == blank: break\n        output.append(token)\n        state = predictor.step(token, state)'), '时间 O(T·M·V)，空间 O(U)', {
    derivation: ['encoder 先产生当前声学帧表示。', 'blank 表示当前帧不再发标签并推进时间。', '非 blank 标签不推进时间，但会更新预测网络状态。'],
    invariant: '在同一时间帧内，只有预测到 blank 才能推进 t；输出标签必须更新 prediction state。',
    walkthrough: '若 t=0 依次输出 “你”“好” 后遇到 blank，才进入 t=1。',
    edgeCases: ['连续 blank', '单帧输出多个 token', '必须设置每帧最大输出数防止死循环'],
    codeNotes: ['实际实现通常使用 logit argmax，不必先 softmax。', 'max_symbols_per_frame 是延迟与死循环保护。'],
    followUps: ['与 CTC greedy 的最大差别？', '如何提高准确率？'],
    followUpAnswers: ['RNN-T 的非 blank 不推进时间且依赖 prediction 网络；CTC 每帧只选一个独立 token。', '用 beam search、语言模型融合或更强的 encoder/predictor。'],
    pitfalls: ['预测到非 blank 后忘记更新 prediction state。', '没有 blank 或上限保护会导致单帧无限循环。'],
  }),
  q('streaming-cache', 'ASR 专项', 'Hard', '流式 ASR 缓存', 'Transformer/Conformer 流式识别如何缓存。', '缓存历史 KV 或左上下文；每个 chunk 只算新增帧，并控制右上下文带来的延迟。', py('cache=init_cache()\nfor chunk in stream:\n    y,cache=encoder(chunk,cache,left_context=L)\n    partial=decoder.step(y,decoder_cache)\n    emit_stable_prefix(partial)'), '每 chunk 约 O(chunk·context)，缓存 O(context)', { followUps: ['如何降低首字延迟？', '缓存为何要截断？'], followUpAnswers: ['减小 chunk 和右上下文，或使用更早的稳定前缀策略。', '无限缓存会使计算和显存随音频长度线性增长。'] }),
];

// 第三批题卡的完整初学者内容：保留题目顺序，只替换迁移阶段的占位代码和讲解。
const enhance = (id, fields) => Object.assign(questions.find((question) => question.id === id), fields);
enhance('46', {
  complexity: '时间 O(n·n!)，辅助空间 O(n)（不计存放全部排列的输出空间）',
  beginnerSummary: '排列要求每个位置都放一个尚未使用的数字；走到底就得到一种顺序，退回一步时必须撤销选择。',
  prerequisites: ['回溯状态由 path（当前顺序）和 used（数字是否占用）组成。', 'path[:] 是快照，不能把之后会变化的同一个列表直接放进答案。'],
  workedExample: ['nums=[1,2,3] 先选 1，再选 2、3 得到 [1,2,3]。', '退回到 [1,2] 撤销 3，再换成其他未使用数字；最终得到 6 种顺序。'],
  derivation: ['暴力枚举 n! 个顺序仍需避免同一层重复占用数字。', '每层选择一个未使用下标，递归返回后恢复 used 和 path，搜索树的每条根到叶路径恰好对应一个排列。'],
  code: py(`def permute(nums):
    result = []
    path = []
    used = [False] * len(nums)

    def dfs():
        if len(path) == len(nums):
            result.append(path[:])
            return
        for i, value in enumerate(nums):
            if used[i]:
                continue
            used[i] = True
            path.append(value)
            dfs()
            path.pop()
            used[i] = False

    dfs()
    return result`),
  lineByLine: ['used 按下标记录某个元素是否已经放入当前 path。', '达到 n 个元素时复制 path，随后 return 让上一层尝试下一个选择。', '递归调用后先 pop，再把 used[i] 恢复为 False，保证兄弟分支互不污染。', '空数组的 dfs 立即收集一个空排列 [[]]。'],
  edgeCases: ['空数组返回 [[]]，表示唯一的空排列', '单元素只有一个排列', '题目保证无重复；若允许重复值需先排序并跳过同层重复'],
  followUps: [{ question: '为什么要标记下标而不是值？', answer: '这样即使输入出现相同值也能区分两个位置；无重复题目中两者都可行，但下标更稳健。' }, { question: '如何只求排列数量？', answer: '无需保存 path 和 result，返回 n! 或在回溯叶子处累加计数即可，从 O(n·n!) 的输出空间降为 O(n)。' }],
  pitfalls: ['忘记复制 path 导致所有答案最后都指向空列表。', '忘记恢复 used 会让后续排列缺少元素。'],
});
enhance('78', {
  beginnerSummary: '每个元素只有“选入”或“不选入”两条分支；到达数组末尾时，当前 path 就是一份子集。',
  prerequisites: ['子集不考虑元素顺序，因此递归下标只向右移动。', '每个叶子都要复制 path，空集是必然存在的结果。'],
  workedExample: ['nums=[1,2]：根节点不选 1 得到空集或 [2]。', '选 1 的分支再决定 2，得到 [1] 和 [1,2]，总共 4 个子集。'],
  derivation: ['每个元素二选一，搜索树有 2^n 个叶子。', '也可在每次进入 dfs 时收集当前 path，再从 start 开始尝试后续元素，天然避免排列重复。'],
  code: py(`def subsets(nums):
    result = []
    path = []

    def dfs(start):
        result.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            dfs(i + 1)
            path.pop()

    dfs(0)
    return result`),
  lineByLine: ['每次进入 dfs 都先收集当前 path，所以空集和中间层组合都会出现。', 'i 从 start 开始，保证后面元素不会回到前面形成重复排列。', '递归完成后 pop 撤销本层选择，继续尝试同层下一个元素。'],
  edgeCases: ['空数组返回 [[]]', '输入有重复值时若要求去重需排序并跳过同层相等元素', '子集数量为 2^n，输出本身占主要空间'],
  followUps: [{ question: '为什么递归参数是 i+1？', answer: '当前元素只能使用一次，下一层必须从它右边开始；若允许重复使用才会传 i。' }, { question: '如何生成固定大小 k 的子集？', answer: '只有 len(path)==k 时收集，并在剩余元素不足以凑满 k 时剪枝。' }],
  pitfalls: ['把 start 写成 0 会重复生成同一组合的不同排列。', '只在叶子收集会漏掉空集和中间长度的子集。'],
});
enhance('39', {
  beginnerSummary: '组合中的数字可重复使用，但同一层只能从当前下标及其右侧挑选，避免 [2,3] 与 [3,2] 重复。',
  prerequisites: ['先排序，使 candidates[i] > remain 时可以提前停止。', '递归传 i 而不是 i+1，表示当前数字还可以再次使用。'],
  workedExample: ['candidates=[2,3,6,7]、target=7：从 2 开始得到 [2,2,3]。', '继续从起点尝试 7 得到 [7]；路径和超过 target 的分支立即返回。'],
  derivation: ['枚举所有序列会产生大量排列重复。', 'start 约束选择下标不下降，remain 记录还差多少；remain==0 收集，remain<0 或候选过大剪枝。'],
  code: py(`def combination_sum(candidates, target):
    candidates = sorted(set(candidates))
    result = []
    path = []

    def dfs(start, remain):
        if remain == 0:
            result.append(path[:])
            return
        for i in range(start, len(candidates)):
            value = candidates[i]
            if value > remain:
                break
            path.append(value)
            dfs(i, remain - value)
            path.pop()

    dfs(0, target)
    return result`),
  lineByLine: ['sorted(set(...)) 让剪枝成立并消除输入中的重复候选。', 'remain==0 是成功终止；path[:] 保存当前组合。', '递归使用 i 而非 i+1，体现数字可以重复使用。', 'for 循环退出前 pop，恢复现场。'],
  edgeCases: ['target=0 返回一个空组合 [[]]', '空候选或 target<0 返回空列表', '候选必须为正数；若含 0 或负数需额外防止无限递归'],
  followUps: [{ question: '为什么不会生成 [3,2]？', answer: '下一层 start 不小于当前 i，只允许下标不下降，因此组合按非降序构造。' }, { question: '每个候选只能用一次怎么办？', answer: '把递归参数改为 i+1；若同层去重，还要排序并跳过 candidates[i]==candidates[i-1]。' }],
  pitfalls: ['误传 i+1 会漏掉重复使用当前数字的合法答案。', '未排序就 break 会错误剪掉后续较小候选。'],
});
enhance('79', {
  beginnerSummary: '从每个与单词首字母相同的格子出发，四方向走；当前格暂时改成 #，递归失败后必须恢复原字母。',
  prerequisites: ['路径不能重复使用同一格，visited 可用原地标记实现。', 'k 表示正在匹配 word[k]；匹配完最后一个字母即可成功。'],
  workedExample: ['board=[A,B;C,D]、word="AB"：从 A 向右走到 B，k 到末尾返回 True。', '若某条路把 A 标成 # 后走不通，恢复 A，才能从其他起点或方向再次尝试。'],
  derivation: ['单纯 DFS 若不记录路径会在环中重复使用格子。', '每次进入格子先检查边界、字符和访问状态；退出前恢复现场，使不同分支共享同一棋盘。'],
  code: py(`def exist(board, word):
    if not word:
        return True
    if not board or not board[0]:
        return False
    rows, cols = len(board), len(board[0])

    def dfs(r, c, k):
        if k == len(word):
            return True
        if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != word[k]:
            return False
        original = board[r][c]
        board[r][c] = '#'
        found = any(dfs(r + dr, c + dc, k + 1)
                    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        board[r][c] = original
        return found

    return any(dfs(r, c, 0) for r in range(rows) for c in range(cols))`),
  lineByLine: ['边界和字符检查放在访问前，避免越界或匹配错误字母。', 'original 保存字符，# 标记当前路径已占用。', '四个方向任一成功就返回 True，但无论成功与否都恢复 original。', '遍历所有起点，任何一个起点成功即可结束。'],
  edgeCases: ['空 word 约定返回 True', '空棋盘返回 False（非空 word）', '单行或单列棋盘仍只能按相邻方向移动'],
  followUps: [{ question: '为什么恢复现场不能省略？', answer: '同一个格子可能属于另一条候选路径；不恢复会把失败分支的标记泄漏给后续搜索。' }, { question: '如何降低搜索量？', answer: '先比较棋盘字符计数与 word 计数，必要时从出现更少的一端反向搜索；也可按相邻字符频率排序方向。' }],
  pitfalls: ['先递归再标记会让相邻回到当前格。', '用全局 visited 却不按路径撤销，会错误阻断合法分支。'],
});
enhance('994', {
  beginnerSummary: '所有腐烂橘子在同一时刻开始传播；BFS 每处理一层就是过去 1 分钟，最后检查是否仍有新鲜橘子。',
  prerequisites: ['队列保存待扩散的腐烂坐标，入队时立即把新鲜橘子改为 2。', 'fresh 计数让我们区分已经没有新鲜橘子和永远无法到达的情况。'],
  workedExample: ['网格 [[2,1,1],[0,1,1]]：初始队列只有 (0,0)，第一层只感染右侧一个邻居（下方是 0）。', '按层继续传播，fresh 变成 0 时返回经过的分钟数；若被 0 隔断则返回 -1。'],
  derivation: ['逐个腐烂源做 DFS 会重复计算时间且无法表达同时发生。', '多源 BFS 把所有源放在同一层，层数就是到达每格的最短分钟数。'],
  code: py(`from collections import deque

def oranges_rotting(grid):
    if not grid or not grid[0]:
        return 0
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    while queue and fresh:
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    queue.append((nr, nc))
        minutes += 1
    return minutes if fresh == 0 else -1`),
  lineByLine: ['扫描时把所有腐烂橘子一起入队，并统计 fresh。', '固定本轮 len(queue)，保证新入队橘子在下一分钟处理。', '感染时立即改为 2 并减少 fresh，避免重复入队。', '队列耗尽仍有 fresh 说明存在隔离区域，返回 -1。'],
  edgeCases: ['没有新鲜橘子返回 0', '没有腐烂源但有新鲜橘子返回 -1', '空网格返回 0'],
  followUps: [{ question: '为什么必须多源同时入队？', answer: '多个腐烂源在同一分钟并行传播；统一初始层才能得到每个橘子的最短腐烂时间。' }, { question: '如何不修改输入？', answer: '复制 grid 或额外维护 visited/状态矩阵，代价是 O(mn) 额外空间。' }],
  pitfalls: ['忘记按层计时会把同一分钟的传播误算成多分钟。', '出队时才标记会导致同一新鲜橘子被重复入队。'],
});
enhance('200', {
  beginnerSummary: '扫描每个格子；遇到陆地就把岛屿数量加一，并用 DFS/BFS 把这个四连通陆地整体淹没，之后不会重复计数。',
  prerequisites: ['四连通只允许上、下、左、右，不包含对角线。', '访问过的陆地可以原地改成 "0"，也可用 visited 集合记录。'],
  workedExample: ['网格 [["1","1","0"],["0","1","0"],["0","0","1"]]：左上陆地触发一次 flood，淹没三个相连格。', '最后右下孤立的 "1" 再触发一次，答案为 2；代码约定网格元素是字符串。'],
  derivation: ['对每个陆地单独判断会重复遍历同一连通块。', '发现一个新岛后一次 flood 访问其所有成员；每格最多进出一次，整体线性。'],
  code: py(`from collections import deque

def num_islands(grid):
    if not grid or not grid[0]:
        return 0
    rows, cols = len(grid), len(grid[0])
    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != '1':
                continue
            islands += 1
            grid[r][c] = '0'
            queue = deque([(r, c)])
            while queue:
                cr, cc = queue.popleft()
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nr, nc = cr + dr, cc + dc
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '1':
                        grid[nr][nc] = '0'
                        queue.append((nr, nc))
    return islands`),
  lineByLine: ['遇到非字符串 "1" 的格子直接跳过，只有未访问陆地才增加 islands。', '入队前立刻把字符串 "1" 改成 "0"，保证同一格不会重复入队。', 'BFS 四方向扩展整个连通块，水和对角线都不会连岛。', '外层扫描结束后每个岛只计数一次。'],
  edgeCases: ['空网格返回 0', '全是字符串 "0" 返回 0', '单个字符串 "1" 或只有对角相邻的字符串 "1" 分别计数'],
  followUps: [{ question: '可以用 DFS 吗？', answer: '可以，递归或显式栈都能淹没连通块；显式队列更不容易触发 Python 递归深度限制。' }, { question: '为什么入队时就改成 0？', answer: '若等出队才标记，同一陆地可能被多个邻居重复发现，队列会膨胀。' }],
  pitfalls: ['把对角线也当连通会少算岛屿。', '调用未定义的 flood 辅助函数会使代码无法独立运行。'],
});

enhance('53', {
  beginnerSummary: '把 cur 定义为“必须以当前位置结尾”的最大和；当前数可以单独开新子数组，也可以接在旧 cur 后面。',
  prerequisites: ['连续子数组不能跳过元素。', '全负数组不能把答案初始化为 0，必须从第一个数开始。'],
  workedExample: ['[-2,1,-3,4]：cur 从 -2 开始，读到 1 时重启为 1。', '读到 -3 后 cur=-2，读到 4 时比较 4 与 -2+4=2，重启得到 4；全程 best 记录最大值。'],
  derivation: ['枚举起点终点是 O(n²)。', '若前缀 cur 为负，接下去只会拖累后面的和，因此在每个位置比较 x 与 cur+x 即可丢弃负前缀。'],
  code: py(`def max_sub_array(nums):
    if not nums:
        return 0
    values = iter(nums)
    cur = best = next(values)
    for value in values:
        cur = max(value, cur + value)
        best = max(best, cur)
    return best`),
  lineByLine: ['空输入按约定返回 0。', 'cur 和 best 从首元素初始化，兼容全负数组。', 'cur 比较重启与延续两种选择。', 'best 维护所有结尾位置状态的最大值。'],
  edgeCases: ['空数组返回 0', '全负数组返回最大（最不负）元素', '单元素直接返回该元素'],
  followUps: [{ question: '如何返回子数组边界？', answer: '记录 start；当 value 大于 cur+value 时把 start 设为当前位置，并在刷新 best 时保存 start、end。' }, { question: '为什么丢弃负 cur 是安全的？', answer: '任何后缀接上负数都会比从后一个位置重新开始更小，不可能成为更优前缀。' }],
  pitfalls: ['用 0 初始化会把全负答案错误变成 0。', '把题目连续子数组误当成可跳过元素的子序列。'],
});
enhance('121', {
  beginnerSummary: '每天只能先买后卖一次；扫描时保存之前见过的最低价格，今天卖出所得利润就是 price-min_price。',
  prerequisites: ['买入下标必须早于卖出下标。', '不交易的利润是 0，所以答案不能为负。'],
  workedExample: ['prices=[7,1,5,3,6,4]：最低价先变成 1。', '卖出 6 时利润 5，之后价格 4 不会超过当前 best。'],
  derivation: ['枚举买卖日是 O(n²)。', '对每个卖出日，最优买入一定是此前最低价；一次扫描同时更新低点和利润。'],
  code: py(`def max_profit(prices):
    lowest = float('inf')
    profit = 0
    for price in prices:
        lowest = min(lowest, price)
        profit = max(profit, price - lowest)
    return profit`),
  lineByLine: ['lowest 初始化为正无穷，第一天价格会成为最低点。', '先更新最低价，保证只能用过去或当天买入。', 'price-lowest 是以今天卖出的最佳利润。', '空数组循环不执行，返回 0。'],
  edgeCases: ['空数组或单价格返回 0', '价格单调下降时不交易，返回 0', '价格相同不产生利润'],
  followUps: [{ question: '如何返回买卖日期？', answer: '更新 lowest 时保存 low_day；刷新 profit 时同时保存 low_day 和当前 day。' }, { question: '允许多次交易时还能用这个状态吗？', answer: '不能；需要持有/不持有状态 DP，或在无手续费时累加每天上涨。' }],
  pitfalls: ['先用未来最低价再计算会违反时间顺序。', '把负利润返回给调用者，忽略不交易选项。'],
});
enhance('198', {
  beginnerSummary: '处理前 i 间房屋时，最后一间只有“抢”或“不抢”：不抢沿用前一间最优，抢则加上前两间最优。',
  prerequisites: ['相邻房屋不能同时抢。', 'dp[i] 表示前 i 间（不是下标 i）能得到的最大金额。'],
  workedExample: ['[2,7,9,3,1]：前两间最优为 0、2、7。', '处理 9 时比较不抢 7 与抢 2+9=11，后面继续得到 12。'],
  derivation: ['每种抢法暴力枚举会指数增长。', '转移 dp_i=max(dp_{i-1}, dp_{i-2}+value) 只依赖两个前状态，可滚动保存。'],
  code: py(`def rob(nums):
    two_back = one_back = 0
    for amount in nums:
        two_back, one_back = one_back, max(one_back, two_back + amount)
    return one_back`),
  lineByLine: ['两个 0 表示还没有房屋时的基线。', 'two_back 是处理当前前两间的结果，one_back 是前一间结果。', '元组赋值同时推进状态，避免覆盖仍要使用的 two_back。', '空列表自然返回 0。'],
  edgeCases: ['空数组返回 0', '单屋返回其金额', '金额全为 0 时答案为 0'],
  followUps: [{ question: '如何恢复抢了哪些房屋？', answer: '保留完整 dp 后从末尾比较 dp[i-1] 与 dp[i-2]+nums[i-1]，沿较优转移反向走。' }, { question: '房屋首尾相邻（环形）怎么办？', answer: '分别求不抢第一间和不抢最后一间的线性结果，取较大值。' }],
  pitfalls: ['把 prev 变量更新顺序写错会丢失 dp[i-2]。', '错误允许相邻房屋同时抢。'],
});
enhance('55', {
  beginnerSummary: 'far 是扫描到目前为止最远能到达的下标；若当前 i 已超过 far，说明中间出现不可达断点。',
  prerequisites: ['nums[i] 表示从 i 最多向右跳多少格。', '只需判断可达性，不需要真的枚举每次跳几格。'],
  workedExample: ['[2,3,1,1,4]：从 0 可到 2，处理 1 时 far 更新到 4。', '[3,2,1,0,4]：far 到 3 后，i=4 超过 far，返回 False。'],
  derivation: ['DFS 枚举跳法会指数爆炸。', '所有已访问位置的最大覆盖区间可合并为 far；每次只扩展 far，不必保留路径。'],
  code: py(`def can_jump(nums):
    if not nums:
        return False
    far = 0
    for i, jump in enumerate(nums):
        if i > far:
            return False
        far = max(far, i + jump)
        if far >= len(nums) - 1:
            return True
    return True`),
  lineByLine: ['空数组没有起点，按约定返回 False。', 'i>far 说明当前位置不可达，立即失败。', '用 i+jump 更新最远覆盖范围。', '一旦覆盖末尾即可提前成功。'],
  edgeCases: ['空数组返回 False，单元素返回 True', '起点为 0 且数组更长时返回 False', '末尾是 0 不影响已提前到达的情况'],
  followUps: [{ question: '为什么不需要选择具体跳跃长度？', answer: '只要某个已达位置能覆盖更远边界，其他较短跳法不会增加可达范围；far 已概括全部可能性。' }, { question: '如何求最少跳跃次数？', answer: '按 far 和当前层边界做 BFS 式贪心，每次扩展一层并计数。' }],
  pitfalls: ['把 i==far 当成不可达，实际上该位置仍可处理。', '空数组与单元素的约定混淆。'],
});
enhance('1143', {
  beginnerSummary: 'dp[i][j] 表示 a 前 i 个字符与 b 前 j 个字符的最长公共子序列长度；字符相等接左上，不等则跳过一边。',
  prerequisites: ['子序列允许删除字符但不能改变剩余顺序。', '空前缀与任何字符串的 LCS 都是 0。'],
  workedExample: ['a="abcde"、b="ace"：a 与 a 相等，dp[1][1]=1。', '遇到 b 与 c 不等时取上方/左方较大值，最终 dp[5][3]=3（ace）。'],
  derivation: ['暴力枚举子序列组合数量指数级。', '最后字符相等时一定可配对；不等时最优解必跳过其中一个，因此取两个子问题最大值。'],
  code: py(`def longest_common_subsequence(a, b):
    rows, cols = len(a), len(b)
    dp = [[0] * (cols + 1) for _ in range(rows + 1)]
    for i in range(1, rows + 1):
        for j in range(1, cols + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[rows][cols]`),
  lineByLine: ['多开一行一列 0，统一表示空前缀。', 'i、j 对应当前前缀末尾字符 a[i-1]、b[j-1]。', '相等时沿左上并加一，不等时只能跳过一侧。', '右下角就是完整字符串的答案。'],
  edgeCases: ['任一字符串为空返回 0', '完全相同返回较短长度', '没有公共字符返回 0'],
  followUps: [{ question: '如何恢复具体 LCS 字符串？', answer: '从右下角回溯：相等就记录字符并走左上，不等就走 dp 较大的上方或左方。' }, { question: '空间能否压缩？', answer: '只求长度时保留一维 dp 并从左到右更新，同时用 prev_diag 保存左上旧值。' }],
  pitfalls: ['把子串（必须连续）和子序列混淆。', '相等时错误取 max 上方/左方会漏掉当前配对。'],
});
enhance('139', {
  complexity: '时间 O(n·L²)（L 为词典最大词长，含切片复制成本），空间 O(n)',
  beginnerSummary: 'dp[i] 表示 s 的前 i 个字符能否被词典拆开；若存在 j<i，dp[j] 为真且 s[j:i] 在词典中，则 dp[i] 为真。',
  prerequisites: ['字符串切片 s[j:i] 左闭右开。', 'dp[0]=True 表示空前缀是可拆的起点。'],
  workedExample: ['s="leetcode"、词典 {leet,code}：dp[4] 因 leet 为真。', '处理 i=8 时找到 j=4 且 code 在词典中，dp[8]=True。'],
  derivation: ['递归尝试每个切分点会重复计算相同前缀。', '按结束位置递推，且只回看最长词长 L 个字符；由于 Python 切片会复制最多 L 个字符，时间复杂度是 O(n·L²)，空间 O(n)。'],
  code: py(`def word_break(s, word_dict):
    words = set(word_dict)
    max_word_len = max((len(word) for word in words), default=0)
    dp = [False] * (len(s) + 1)
    dp[0] = True
    for end in range(1, len(s) + 1):
        start_min = max(0, end - max_word_len)
        for start in range(start_min, end):
            if dp[start] and s[start:end] in words:
                dp[end] = True
                break
    return dp[-1]`),
  lineByLine: ['words=set 让词典查询清晰且快速，并计算最长词长 max_word_len。', 'dp[0] 是空前缀基线。', 'end 固定当前要证明的前缀长度，start 只在最近 L 个字符内枚举。', '找到一个合法切分就 break，不必继续试其他起点。'],
  edgeCases: ['空字符串返回 True（零个词即可拼出）', '词典为空时非空字符串返回 False', '词典中有重复词不影响集合判断'],
  followUps: [{ question: '如何返回一种拆分方案？', answer: 'dp[end] 变为保存前驱 start；命中时记录 parent[end]=start，最后从 n 反向切片。' }, { question: '如何优化长词典？', answer: '按最大词长限制 start 范围，或使用 Trie 从每个可达位置向前匹配。' }],
  pitfalls: ['dp[0] 忘记设 True 会导致所有前缀都无法启动。', '把不可达状态当成空字符串误判。'],
});
enhance('416', {
  complexity: '时间 O(n·target)，空间 O(target)，其中 target=sum(nums)/2',
  beginnerSummary: '两组和相等等价于从 nums 中选出一个子集，其和等于总和的一半；一维布尔背包记录每个和是否可达。',
  prerequisites: ['总和为奇数时不可能平分。', '每个数字只能使用一次，所以容量循环必须从大到小。'],
  workedExample: ['[1,5,11,5] 总和 22，目标 11；先用 1、5 更新可达和。', '遇到 11 时 dp[11] 变真，表示找到子集 [11]，另一组为 [1,5,5]。'],
  derivation: ['枚举所有子集是 O(2^n)。', 'dp[sum] 表示是否能用已处理数字凑出 sum；倒序更新防止同一数字在本轮被重复使用。'],
  code: py(`def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    dp = [False] * (target + 1)
    dp[0] = True
    for value in nums:
        for current in range(target, value - 1, -1):
            dp[current] = dp[current] or dp[current - value]
    return dp[target]`),
  lineByLine: ['奇数总和直接返回 False，避免创建无意义的表。', 'dp[0]=True 表示不选任何数即可凑出 0。', '容量从 target 倒序，读取的是上一轮状态。', 'dp[target] 即是否存在目标子集。'],
  edgeCases: ['空数组总和为 0，返回 True（两组都为空）', '单个正数无法平分，通常返回 False', '若题目允许负数，需改用集合 DP；本实现假设非负整数'],
  followUps: [{ question: '为什么不能正序更新？', answer: '正序会让刚写入的 dp[current] 在同一轮再次被使用，相当于重复选择同一个数字。' }, { question: '如何恢复具体子集？', answer: '保存每个和第一次变真的 value 和前驱和，最后从 target 反向追踪选择。' }],
  pitfalls: ['把奇数总和继续除法会产生错误目标。', '未说明非负数前提就直接处理负数输入。'],
});
enhance('72', {
  beginnerSummary: '编辑距离允许替换、删除、插入。dp[i][j] 是 ref 前 i 个词/字符变成 hyp 前 j 个的最少操作；回溯前驱可把操作区分为 S、D、I。',
  prerequisites: ['dp[i][0]=i（全删除），dp[0][j]=j（全插入）。', 'WER 按词统计，S/D/I 分别是替换、删除、插入，分母是参考词数。'],
  workedExample: ['ref="kitten"、hyp="sitting"：末尾 n/g 不等，可从替换、删除、插入三种前驱取最小。', '回溯到相等字符只走左上；其余按前驱累计 S、D 或 I，距离为 3。'],
  derivation: ['最后一步若字符相等不增加代价；否则分别尝试删除 ref、插入 hyp、替换两者。', '从右下沿满足等式的前驱反向走，按 token 计数即可得到 WER 的 S+D+I。'],
  code: py(`def edit_distance_with_ops(ref, hyp):
    m, n = len(ref), len(hyp)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            same = ref[i - 1] == hyp[j - 1]
            dp[i][j] = dp[i - 1][j - 1] if same else 1 + min(
                dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    i, j = m, n
    substitutions = deletions = insertions = 0
    while i or j:
        if i and j and ref[i - 1] == hyp[j - 1] and dp[i][j] == dp[i - 1][j - 1]:
            i, j = i - 1, j - 1
        elif i and j and dp[i][j] == dp[i - 1][j - 1] + 1:
            substitutions += 1
            i, j = i - 1, j - 1
        elif i and dp[i][j] == dp[i - 1][j] + 1:
            deletions += 1
            i -= 1
        else:
            insertions += 1
            j -= 1
    return {'distance': dp[m][n], 'S': substitutions, 'D': deletions, 'I': insertions,
            'wer': (substitutions + deletions + insertions) / m if m else 0.0}`),
  lineByLine: ['首行首列写入全插入/全删除的基线，避免访问未定义 dp。', '每格比较三种前驱，字符相等时沿左上且不增加代价。', '回溯优先匹配相等，其次按等式识别替换、删除、插入。', '参考长度 m 为 0 时 WER 约定返回 0，避免除零。'],
  edgeCases: ['ref 和 hyp 都空时距离和 WER 都为 0', 'ref 为空且 hyp 非空时全是插入，WER 约定为 0', '按字符传入可得到字符编辑距离；按词列表传入即可统计 WER'],
  followUps: [{ question: '为什么不能只看距离就得到 WER？', answer: '同一个最短距离可能由不同数量的替换、删除、插入组成；WER 需要沿具体前驱回溯并分类。' }, { question: '如何压缩空间？', answer: '只要距离可用两行；若仍需操作序列，可保存父指针，或用 Hirschberg 等分治方法。' }],
  pitfalls: ['直接使用未定义的 dp/ref/hyp 片段会无法运行。', '把 WER 分母写成 hyp 长度，正确分母应是参考词数。'],
});

const maxPathCard = questions.find((question) => question.id === '124');
maxPathCard.code = py('class TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val, self.left, self.right = val, left, right\ndef max_path_sum(root):\n    if not root:\n        return 0\n    best = float("-inf")\n    def dfs(node):\n        nonlocal best\n        if not node: return 0\n        left, right = max(0, dfs(node.left)), max(0, dfs(node.right))\n        best = max(best, node.val + left + right)\n        return node.val + max(left, right)\n    dfs(root)\n    return best');
maxPathCard.beginnerSummary = '路径可任意起止；向父节点只能返回一条向下分支，当前节点可合并左右更新答案。空树没有路径，约定返回 0。';
maxPathCard.workedExample = ['20 的左右贡献是 15、7。', '15→20→7 的和 42 更新答案；若输入为空树，函数直接返回 0。'];
maxPathCard.lineByLine = ['函数开头先把空树定义为路径和 0，避免返回负无穷。', 'best 用负无穷兼容全负的非空树。', 'max(0, ...) 去掉会拖累路径的负贡献。', '返回给父节点时只能选择一条向下分支。'];

const codecCard = questions.find((question) => question.id === '297');
codecCard.code = py('class TreeNode:\n    def __init__(self, val=0, left=None, right=None): self.val, self.left, self.right = val, left, right\nclass Codec:\n    def serialize(self, root):\n        parts = []\n        def visit(node):\n            if not node:\n                parts.append("#")\n                return\n            parts.append(str(node.val))\n            visit(node.left)\n            visit(node.right)\n        visit(root)\n        return ",".join(parts)\n    def deserialize(self, data):\n        tokens = iter(data.split(","))\n        def build():\n            value = next(tokens)\n            if value == "#": return None\n            node = TreeNode(int(value))\n            node.left, node.right = build(), build()\n            return node\n        return build()');
codecCard.lineByLine = ['TreeNode 定义题设节点类型。', 'serialize 只创建一个 parts 列表，visit 通过 append 依次写入 token。', '最后一次 join 把 token 合成字符串，因此退化树也只线性处理每个节点。', 'deserialize 用迭代器按同一前序规则递归重建左右孩子。'];

// 模型手写与 ASR 专项：完整初学者内容与可独立运行实现。
enhance('cross-entropy', {
  beginnerSummary: '输入 logits 形状 (B,C) 与整数标签 y 形状 (B,)，输出平均损失。每行先减最大值不会改变 softmax，却能避免 exp 溢出。',
  prerequisites: ['logits 是未归一化类别分数，y[i] 是样本 i 的正确类别下标。', 'softmax 概率和为 1，交叉熵是正确类概率的负对数。'],
  workedExample: ['logits=[[2,1,0]] 减最大值后为 [0,-1,-2]，指数都安全。', 'y=[0] 时损失为正确类负对数概率，正确类分数越大损失越小。'],
  derivation: ['logsumexp(z)=m+log(sum(exp(z-m)))，m=max(z) 在 softmax 分子分母中相消。', '按 y 索引 log 概率并对 B 个样本求平均。'],
  code: py('import numpy as np\n\ndef cross_entropy(logits, labels):\n    logits = np.asarray(logits, dtype=float)  # (B, C)\n    labels = np.asarray(labels, dtype=int)     # (B,)\n    if logits.ndim != 2 or labels.shape != (logits.shape[0],):\n        raise ValueError("logits must be (B,C), labels must be (B,)")\n    shifted = logits - logits.max(axis=1, keepdims=True)\n    logsumexp = np.log(np.exp(shifted).sum(axis=1))\n    log_prob = shifted - logsumexp[:, None]\n    return float(-log_prob[np.arange(logits.shape[0]), labels].mean())'),
  lineByLine: ['np.asarray 固定 batch 和类别维度。', 'shifted 减行最大值，logsumexp 稳定计算归一化常数。', 'log_prob 是逐类对数概率，按 labels 取正确类。', 'mean 汇总成标量损失。'],
  edgeCases: ['空 batch 需由调用者定义行为', '类别下标越界会报错', '极大 logits 仍保持有限值'],
  followUps: [{ question: '为什么不用先 softmax 再 log？', answer: '先 softmax 可能溢出或下溢为 0，随后 log 得到 inf；log-sum-exp 直接在对数域更稳定。' }, { question: '标签能用 one-hot 吗？', answer: '可以用 -(target*log_prob).sum(axis=1).mean()，整数标签版本更省内存。' }],
  pitfalls: ['忘记按 batch 平均导致 loss 尺度随 B 变化。', '把最大值跨样本求，破坏每个样本独立归一化。'],
});

enhance('bce', {
  beginnerSummary: '输入同形状 logits x 与 0/1 标签 y，输出 BCE。直接使用 logits 的稳定公式，避免 sigmoid 饱和时出现 log(0)。',
  prerequisites: ['logit 是 sigmoid 前的实数，sigmoid(x)=1/(1+e^-x)。', 'BCE=-y log σ(x)-(1-y)log(1-σ(x))，标签也可为软 0~1 值。'],
  workedExample: ['x=0、y=1 时损失约 0.693，表示模型没有偏向。', 'x=50、y=1 时稳定公式接近 0，不会计算 log(1-1) 得 NaN。'],
  derivation: ['BCE 可化为 max(x,0)-x*y+log1p(exp(-abs(x)))。', 'max、abs 与 log1p 让正负两侧指数都保持安全。'],
  code: py('import numpy as np\n\ndef bce_with_logits(logits, targets, reduction="mean"):\n    x = np.asarray(logits, dtype=float)\n    y = np.asarray(targets, dtype=float)\n    if x.shape != y.shape:\n        raise ValueError("logits and targets must have the same shape")\n    loss = np.maximum(x, 0.0) - x*y + np.log1p(np.exp(-np.abs(x)))\n    if reduction == "none": return loss\n    if reduction == "sum": return float(loss.sum())\n    return float(loss.mean())'),
  lineByLine: ['检查 logits 与 targets 逐元素对齐。', 'maximum 项处理正 logits 的线性部分。', 'log1p(exp(-abs(x))) 在两侧保持有限。', 'reduction 控制逐元素、总和或均值。'],
  edgeCases: ['极大正负 logits 仍有限', 'targets 应在 [0,1]', '空输入的 mean 行为需约定'],
  followUps: [{ question: 'logit 的梯度是什么？', answer: '梯度为 sigmoid(x)-y；正样本 logit 太小时梯度为负，会推动它增大。' }, { question: '类别不平衡怎么办？', answer: '可给正负样本加 class weight 或 focal loss，但仍使用稳定 logits 公式。' }],
  pitfalls: ['先 sigmoid 再手写 log 会在饱和区产生 inf。', '把标签当成 0/255 而未归一化。'],
});

enhance('batchnorm', {
  beginnerSummary: '输入 x 形状 (B,C)，沿 batch 维归一化每个通道。训练用当前均值方差并更新 running 统计；评估固定使用 running 统计。',
  prerequisites: ['均值和方差沿 axis=0 计算，每个通道各有一个统计量。', 'gamma、beta 形状 (C,)，eps 防止方差为零时除零。'],
  workedExample: ['x=[[1,3],[3,5]] 的均值为 [2,4]，方差为 [1,1]，标准化约为 [[-1,-1],[1,1]]。', 'eval 即使 batch=1 也使用训练累计统计，结果不依赖同批样本。'],
  derivation: ['训练态 y=gamma*(x-mu)/sqrt(var+eps)+beta，并用 momentum 更新 running。', '推理态跳过当前 batch 估计，保证线上输出稳定。'],
  code: py('import numpy as np\n\ndef batch_norm(x, gamma, beta, running_mean, running_var, training=True, momentum=0.1, eps=1e-5):\n    x = np.asarray(x, dtype=float)  # (B,C)\n    gamma, beta = np.asarray(gamma), np.asarray(beta)\n    if training:\n        mean, var = x.mean(axis=0), x.var(axis=0)\n        running_mean[...] = (1-momentum)*running_mean + momentum*mean\n        running_var[...] = (1-momentum)*running_var + momentum*var\n    else:\n        mean, var = running_mean, running_var\n    return gamma*(x-mean)/np.sqrt(var+eps) + beta'),
  lineByLine: ['mean/var 跨 batch 维，保留通道维。', '训练态原地更新 running 数组。', 'eval 分支使用固定统计，避免单样本方差不可靠。', '广播 gamma、beta 后输出仍为 (B,C)。'],
  edgeCases: ['B=1 时方差为 0，eps 保证有限', 'running_var 必须非负且长度为 C', '卷积特征通常要沿 N,H,W 聚合'],
  followUps: [{ question: 'momentum 会写反吗？', answer: '本实现新值=(1-momentum)*旧+momentum*当前；不同框架命名可能相反，需核对文档。' }, { question: 'BN 与 LayerNorm 差异？', answer: 'BN 跨 batch，受 batch 大小影响；LayerNorm 对每个样本的 hidden 维统计，更适合小 batch 序列。' }],
  pitfalls: ['eval 仍用当前 batch 统计导致结果漂移。', '忘记更新 running 或让 running 参与梯度。'],
});

enhance('dropout', {
  beginnerSummary: '输入任意形状 x，训练随机丢弃元素并将保留值除以 keep_prob；推理直接返回 x，保持两阶段期望尺度一致。',
  prerequisites: ['Bernoulli 掩码决定元素是否保留。', 'inverted scaling 使 E[mask*x/p]=x。'],
  workedExample: ['keep_prob=0.5、x=[2,4]、mask=[1,0] 时输出 [4,0]，多次平均接近 [2,4]。', 'training=False 时不采样、不缩放，恒等返回。'],
  derivation: ['保留概率 p 时输出 mask*x/p，期望为 p*x/p=x。', '因此缩放提前放训练阶段，推理无需额外操作。'],
  code: py('import numpy as np\n\ndef dropout(x, keep_prob=0.5, training=True, rng=None):\n    x = np.asarray(x, dtype=float)\n    if not 0 < keep_prob <= 1: raise ValueError("keep_prob must be in (0,1]")\n    if not training: return x.copy()\n    generator = np.random.default_rng() if rng is None else rng\n    mask = generator.random(x.shape) < keep_prob\n    return x*mask/keep_prob'),
  lineByLine: ['检查 keep_prob 防止除零。', 'eval 直接返回副本且数值不变。', '生成与 x 同形状的随机掩码。', '保留值除以 keep_prob 保持期望尺度。'],
  edgeCases: ['keep_prob=1 等价恒等映射', 'keep_prob<=0 报错', '固定 rng 可复现测试'],
  followUps: [{ question: '为什么 eval 不乘 keep_prob？', answer: '训练阶段已除以 keep_prob，使训练输出期望等于原输入，eval 直接使用原输入即可。' }, { question: 'Dropout 与 BN 如何排序？', answer: '常把 dropout 放在线性层或激活后，避免在 BN 前破坏统计；最终仍需实验验证。' }],
  pitfalls: ['训练忘记除 keep_prob，导致输出偏小。', '推理忘记关闭 dropout，结果每次随机。'],
});

enhance('positional-encoding', {
  beginnerSummary: '给长度 L、隐藏维 d 的序列生成形状 (L,d) 的固定位置向量；偶数维 sin、奇数维 cos，让注意力知道 token 的顺序。',
  prerequisites: ['pos 是 0..L-1 的位置，维度 i 使用不同频率。', '正弦余弦值在 [-1,1]，可直接与 token embedding 相加。'],
  workedExample: ['L=2,d=4 时位置 0 的偶数维 sin(0)=0、奇数维 cos(0)=1。', '位置 1 使用不同波长，得到另一行向量；与 embedding 相加后形状仍为 (L,d)。'],
  derivation: ['PE[pos,2i]=sin(pos/10000^(2i/d))，PE[pos,2i+1]=cos(pos/10000^(2i/d))。', '不同维度的频率组合编码绝对位置，且位移可表示为线性变换。'],
  code: py('import numpy as np\n\ndef positional_encoding(length, dim):\n    pos = np.arange(length, dtype=float)[:, None]\n    even = np.arange(0, dim, 2)\n    angle = pos / np.power(10000.0, even / dim)\n    pe = np.zeros((length, dim), dtype=float)\n    pe[:, 0::2] = np.sin(angle)\n    pe[:, 1::2] = np.cos(angle[:, :pe[:, 1::2].shape[1]])\n    return pe'),
  lineByLine: ['pos[:,None] 生成 (L,1)，便于广播到各频率。', 'even 选择偶数维并计算对应角度。', 'zeros 预分配 (L,d)，切片写入 sin/cos。', '返回可与 (L,d) embedding 相加的矩阵。'],
  edgeCases: ['dim=1 时没有奇数 cos 维，切片仍安全', 'length=0 返回形状 (0,d)', 'd 必须为正整数'],
  followUps: [{ question: '为什么 embedding 维度必须一致？', answer: '位置编码要与 token embedding 逐元素相加，形状必须同为 (L,d)；否则无法广播到每个通道。' }, { question: '可学习位置编码有何不同？', answer: '可学习表能适应训练长度但外推较弱；正弦编码无额外参数，可直接扩展到更长序列。' }],
  pitfalls: ['奇偶维频率指数写成 i/d 而非 2i/d。', '把位置编码沿 batch 维错误广播。'],
});

enhance('topk-sampling', {
  beginnerSummary: '输入词表 logits 形状 (V,)，只保留最大的 k 个 token；其余概率设为 0，并在保留集合内重新归一化后采样一个下标。',
  prerequisites: ['logits 不是概率，采样前需要 softmax。', '截断后必须再次归一化，否则概率和小于 1。'],
  workedExample: ['logits=[2,1,0]、k=2 时保留下标 0、1，概率按 exp(2)、exp(1) 重新归一化。', 'k>=V 时等价普通 categorical 采样，k=1 时退化为贪心 argmax。'],
  derivation: ['选取 top-k 集合 S，将 S 外 logit 置为 -inf。', '对 S 使用减最大值的 softmax，p_i=exp(z_i-m)/sum_j∈S exp(z_j-m)。'],
  code: py('import numpy as np\n\ndef top_k_sample(logits, k, rng=None):\n    logits = np.asarray(logits, dtype=float)\n    if logits.ndim != 1 or not 1 <= k <= logits.size: raise ValueError("invalid logits or k")\n    idx = np.argpartition(logits, -k)[-k:]\n    values = logits[idx]\n    probs = np.exp(values-values.max()); probs /= probs.sum()\n    generator = np.random.default_rng() if rng is None else rng\n    return int(generator.choice(idx, p=probs))'),
  lineByLine: ['检查一维词表 logits 和 k 范围。', 'argpartition 取得 k 个候选，无需完整排序。', '对候选减最大值后指数化并归一化。', 'rng.choice 按候选概率返回原词表下标。'],
  edgeCases: ['k=1 返回最大 logit 下标', 'k=V 保留全部词表', '全为 -inf 的 logits 无法归一化，应提前拒绝'],
  followUps: [{ question: 'Top-k 与 Top-p 如何组合？', answer: '先按概率排序取累计和不超过 p 的最小集合，再可叠加 k 上限；两者都要在截断后重新归一化。' }, { question: '为什么采样前还要除温度？', answer: 'logits/temperature 会控制分布尖锐程度；温度越低越接近贪心，越高越随机，再执行 top-k。' }],
  pitfalls: ['把 top-k 概率直接当作已归一化分布。', '在 softmax 后用 -inf 乘概率，造成 NaN。'],
});

enhance('beam-search', {
  beginnerSummary: '束搜索维护最多 beam_size 条序列及其累计 log 概率。每步扩展候选、保留全局分数最高的束，遇到 EOS 可提前结束。',
  prerequisites: ['累计 log 概率用加法，避免很多小概率相乘下溢。', 'beam 是 (token 序列, score, finished) 状态，而非只保存最后 token。'],
  workedExample: ['beam=2 时第一步保留 A(-0.1)、B(-0.2)，丢弃 C(-1.0)。', '下一步同时扩展 A/B，比较所有新分数；即使 B 当前较低，也可能因后续概率更高而胜出。'],
  derivation: ['对每条活跃 beam 取词表候选并加上 token logprob。', '按累计分数排序截断到 beam_size；完成 EOS 的序列不再扩展，最终在完成束中取最高分。'],
  code: py('import numpy as np\n\ndef beam_search(log_probs, beam_size=3, eos=0):\n    # log_probs[t, prefix_last, token] 是示例条件分数，形状 (T,V,V)\n    log_probs = np.asarray(log_probs, dtype=float)\n    beams = [((), 0.0, False)]\n    for t in range(log_probs.shape[0]):\n        candidates = []\n        for seq, score, done in beams:\n            if done: candidates.append((seq, score, True)); continue\n            row = log_probs[t, seq[-1] if seq else 0]\n            for token in np.argsort(row)[-beam_size:]:\n                token = int(token); candidates.append((seq+(token,), score+float(row[token]), token == eos))\n        candidates.sort(key=lambda item: item[1], reverse=True)\n        beams = candidates[:beam_size]\n        if all(done for _, _, done in beams): break\n    return list(max(beams, key=lambda item: item[1])[0])'),
  lineByLine: ['log_probs 用 (T,V,V) 示例条件分数，函数不依赖外部模型。', 'beams 保存完整序列、累计分数和是否结束。', '每步取候选 token，加 logprob 后统一排序截断。', '全部结束或时间轴耗尽时返回最高分序列。'],
  edgeCases: ['beam_size=1 就是贪心搜索', '没有 EOS 时运行到 max 步后返回当前最高分', '长度偏置可用 length penalty 修正'],
  followUps: [{ question: '为什么累计 log 概率可以相加？', answer: '路径概率是每步条件概率的乘积，取对数后乘积变成加法，同时避免下溢。' }, { question: '如何处理不同长度的偏置？', answer: '短序列少乘几项天然分数较高，可除以长度或使用 length penalty，再比较最终 beam。' }],
  pitfalls: ['只保留每条 beam 的局部最优而非全局候选。', 'EOS 后仍继续扩展，导致完成序列被污染。'],
});

enhance('kmeans', {
  beginnerSummary: '给 n 个 d 维样本 x，K-Means 交替执行 E 步分配最近中心和 M 步求簇均值，输出标签与中心；空簇需重新放置中心。',
  prerequisites: ['欧氏距离平方可用向量差平方和比较，省去开平方。', '每轮目标函数是样本到所属中心的距离平方和。'],
  workedExample: ['x=[[0],[1],[9],[10]]、K=2 初始中心 [0],[10]，E 步标签为 0,0,1,1。', 'M 步中心更新为 [0.5],[9.5]；若某簇为空，用离当前中心最远样本重置它。'],
  derivation: ['固定中心时最近中心分配使距离最小；固定标签时均值使平方误差最小。', '交替更新单调降低目标（但可能陷入局部最优），多次随机初始化可改善结果。'],
  code: py('import numpy as np\n\ndef kmeans(x, k, iterations=20, seed=0):\n    x = np.asarray(x, dtype=float)  # (n,d)\n    if not 1 <= k <= len(x): raise ValueError("invalid k")\n    rng = np.random.default_rng(seed)\n    centers = x[rng.choice(len(x), size=k, replace=False)].copy()\n    for _ in range(iterations):\n        dist = ((x[:, None, :]-centers[None, :, :])**2).sum(axis=2)\n        labels = dist.argmin(axis=1)\n        for j in range(k):\n            members = x[labels == j]\n            centers[j] = members.mean(axis=0) if len(members) else x[dist.min(axis=1).argmax()]\n    return labels, centers'),
  lineByLine: ['随机抽取 K 个不同样本作为初始中心。', 'dist 形状 (n,K)，argmin 得到每个样本标签。', '每个非空簇取成员均值更新中心。', '空簇重置为离最近中心最远的样本，避免 NaN。'],
  edgeCases: ['K>n 或 K<=0 应报错', '重复样本可能产生空簇，重置策略保证有限', '不同 seed 可能得到不同局部最优'],
  followUps: [{ question: '如何选择 K？', answer: '可用 elbow 曲线、silhouette 分数或业务先验；K-Means 本身不自动决定 K。' }, { question: '为什么需要标准化特征？', answer: '平方距离会被量纲大的维度支配，先标准化或使用合适距离能让各特征贡献可比。' }],
  pitfalls: ['空簇直接取 mean 得到 NaN。', '把标签更新和中心更新顺序写反，破坏 E/M 交替。'],
});

enhance('iou', {
  beginnerSummary: '输入两个 xyxy 框 [x1,y1,x2,y2]，输出交并比 IoU=交集面积/并集面积，范围 0~1；边界相切时交集为 0。',
  prerequisites: ['x2>x1、y2>y1 表示合法框，宽高用右下减左上。', '并集面积=框 A 面积+框 B 面积-交集面积，避免重叠重复计算。'],
  workedExample: ['A=[0,0,2,2]、B=[1,1,3,3]，交集是 1x1=1，并集为 4+4-1=7。', '两框仅在边界相切时宽或高为 0，IoU 应为 0 而不是负值。'],
  derivation: ['交集左上取坐标最大值，右下取最小值。', '宽高分别 max(0,right-left)、max(0,bottom-top)，再按面积公式求比值。'],
  code: py('def iou(box_a, box_b):\n    ax1, ay1, ax2, ay2 = box_a\n    bx1, by1, bx2, by2 = box_b\n    iw = max(0.0, min(ax2, bx2)-max(ax1, bx1))\n    ih = max(0.0, min(ay2, by2)-max(ay1, by1))\n    inter = iw*ih\n    area_a = max(0.0, ax2-ax1)*max(0.0, ay2-ay1)\n    area_b = max(0.0, bx2-bx1)*max(0.0, by2-by1)\n    union = area_a+area_b-inter\n    return inter/union if union else 0.0'),
  lineByLine: ['解包四个边界坐标，明确 xyxy 而非 xywh。', '交集左上取 max、右下取 min。', 'max(0) 处理不重叠和相切边界。', '并集为两面积减交集，空框返回 0。'],
  edgeCases: ['完全不重叠 IoU=0', '一个框退化为零面积时 IoU=0', '坐标反向时本实现按零面积处理'],
  followUps: [{ question: '为什么不能把宽高写成 abs？', answer: '交集要求边界有重叠；不重叠时应取 0，abs 会把没有交集的间隔误当成正宽。' }, { question: 'IoU 阈值如何影响 NMS？', answer: '阈值低会更激进地抑制相邻框，阈值高会保留更多重叠框；需按目标密集程度调节。' }],
  pitfalls: ['忘记从并集减交集，导致比值可能小于 1。', '相切时产生负宽高并得到负面积。'],
});

enhance('nms', {
  beginnerSummary: '输入 boxes 形状 (N,4)、scores 形状 (N,)，按分数从高到低保留框，并删除与已保留框 IoU 大于阈值的框，输出索引。',
  prerequisites: ['NMS 假设同一类别框竞争；多类别应按类别分别执行。', 'IoU 衡量重叠程度，score 决定优先保留谁。'],
  workedExample: ['两个高度重叠框分数 0.9、0.8 且 IoU=0.7、阈值 0.5：先保留 0.9，再抑制 0.8。', '与其 IoU=0.2 的第三个框不会被删除，最终索引包含两个框。'],
  derivation: ['将索引按分数降序排序，取最高者加入 keep。', '只保留与该框 IoU<=threshold 的剩余索引，循环直到为空；朴素实现 O(N²)。'],
  code: py('import numpy as np\n\ndef nms(boxes, scores, threshold=0.5):\n    boxes, scores = np.asarray(boxes, float), np.asarray(scores, float)\n    order = scores.argsort()[::-1]\n    keep = []\n    while order.size:\n        i = int(order[0]); keep.append(i)\n        rest = order[1:]\n        survivors = []\n        for j in rest:\n            ax1, ay1, ax2, ay2 = boxes[i]; bx1, by1, bx2, by2 = boxes[int(j)]\n            iw = max(0.0, min(ax2,bx2)-max(ax1,bx1)); ih = max(0.0, min(ay2,by2)-max(ay1,by1))\n            inter = iw*ih; aa = max(0.0,ax2-ax1)*max(0.0,ay2-ay1); ab = max(0.0,bx2-bx1)*max(0.0,by2-by1)\n            union = aa+ab-inter; overlap = inter/union if union else 0.0\n            if overlap <= threshold: survivors.append(int(j))\n        order = np.asarray(survivors, dtype=int)\n    return keep'),
  lineByLine: ['argsort 生成按 score 降序的候选索引。', '取 order[0] 作为当前最高分并加入 keep。', '逐个计算与当前框 IoU，超过阈值者被抑制。', '剩余索引继续循环，直到候选为空。'],
  edgeCases: ['boxes 为空返回空列表', 'threshold=0 只允许不重叠框', '不同类别必须分组以免互相抑制'],
  followUps: [{ question: 'Soft-NMS 有何不同？', answer: 'Soft-NMS 不直接删除重叠框，而是按 IoU 连续降低其分数，密集目标场景通常召回更好。' }, { question: '为什么先取最高分？', answer: 'NMS 的贪心假设最高分框最可信；保留它后删除冲突框能用简单 O(N²) 得到稳定结果。' }],
  pitfalls: ['order 更新时错误包含已取出的首元素。', '把不同类别的框混在一起抑制。'],
});

enhance('ctc-prefix-beam', {
  complexity: '时间 O(T·beam·V log(beam·V))（含候选排序），峰值空间 O(beam·V·T)（候选前缀 tuple）',
  code: py('import math\n\ndef _logadd(a, b):\n    if a == -math.inf: return b\n    if b == -math.inf: return a\n    m = max(a, b); return m + math.log(math.exp(a-m)+math.exp(b-m))\n\ndef ctc_prefix_beam(log_probs, blank, beam_size=3):\n    if beam_size <= 0: raise ValueError("beam_size must be positive")\n    if not log_probs: return []\n    vocab = len(log_probs[0])\n    if not 0 <= blank < vocab: raise ValueError("blank out of range")\n    beams = {(): (0.0, -math.inf)}\n    for frame in log_probs:\n        if len(frame) != vocab: raise ValueError("inconsistent vocabulary size")\n        next_scores = {}\n        for prefix, (pb, pnb) in beams.items():\n            total = _logadd(pb, pnb); old = next_scores.get(prefix, (-math.inf, -math.inf))\n            next_scores[prefix] = (_logadd(old[0], total + float(frame[blank])), old[1])\n            for token, value in enumerate(frame):\n                if token == blank: continue\n                lp = float(value); last = prefix[-1] if prefix else None\n                if token == last:\n                    same = next_scores.get(prefix, (-math.inf, -math.inf))\n                    next_scores[prefix] = (same[0], _logadd(same[1], pnb + lp))\n                    extended = prefix + (token,); ext = next_scores.get(extended, (-math.inf, -math.inf))\n                    next_scores[extended] = (ext[0], _logadd(ext[1], pb + lp))\n                else:\n                    extended = prefix + (token,); ext = next_scores.get(extended, (-math.inf, -math.inf))\n                    next_scores[extended] = (ext[0], _logadd(ext[1], total + lp))\n        beams = dict(sorted(next_scores.items(), key=lambda item: _logadd(*item[1]), reverse=True)[:beam_size])\n    return list(max(beams.items(), key=lambda item: _logadd(*item[1]))[0])'),
});

enhance('rmsnorm', {
  code: py('import torch\n\ndef rms_norm(x, weight, eps=1e-6):\n    x = torch.as_tensor(x, dtype=torch.float32); weight = torch.as_tensor(weight, dtype=x.dtype)\n    if weight.ndim != 1 or weight.shape[0] != x.shape[-1]: raise ValueError("weight must be shape (D,)")\n    rms = torch.sqrt(x.square().mean(dim=-1, keepdim=True) + eps)\n    return x/rms * weight'),
});

enhance('rnnt-greedy', {
  code: py('import numpy as np\n\ndef rnnt_greedy(encoder, predictor_start, joint, predictor_step, blank, max_symbols_per_frame=5):\n    if max_symbols_per_frame <= 0: raise ValueError("max_symbols_per_frame must be positive")\n    state = predictor_start(); output = []\n    for frame in encoder:\n        for _ in range(max_symbols_per_frame):\n            token = int(np.asarray(joint(frame, state)).argmax())\n            if token == blank: break\n            output.append(token); state = predictor_step(token, state)\n    return output'),
});

enhance('streaming-cache', {
  code: py('import numpy as np\n\ndef streaming_encode(chunks, encode_chunk, left_context=16):\n    if left_context < 0: raise ValueError("left_context must be non-negative")\n    cache = None; outputs = []\n    for chunk in chunks:\n        chunk = np.asarray(chunk, dtype=float)\n        context = chunk if cache is None else np.concatenate([cache, chunk], axis=0)\n        old_len = 0 if cache is None else len(cache)\n        outputs.append(encode_chunk(context, old_len))\n        cache = context[-left_context:] if left_context else context[:0]\n    return outputs, cache'),
});

enhance('nms', {
  code: py('import numpy as np\n\ndef nms(boxes, scores, threshold=0.5):\n    boxes, scores = np.asarray(boxes, float), np.asarray(scores, float)\n    if boxes.ndim != 2 or boxes.shape[1:] != (4,) or scores.shape != (len(boxes),): raise ValueError("boxes must be (N,4), scores (N,)")\n    if not 0 <= threshold <= 1: raise ValueError("threshold must be in [0,1]")\n    order = scores.argsort()[::-1]; keep = []\n    while order.size:\n        i = int(order[0]); keep.append(i); rest = order[1:]; survivors = []\n        for j in rest:\n            ax1,ay1,ax2,ay2=boxes[i]; bx1,by1,bx2,by2=boxes[int(j)]\n            iw=max(0.0,min(ax2,bx2)-max(ax1,bx1)); ih=max(0.0,min(ay2,by2)-max(ay1,by1)); inter=iw*ih\n            aa=max(0.0,ax2-ax1)*max(0.0,ay2-ay1); ab=max(0.0,bx2-bx1)*max(0.0,by2-by1); union=aa+ab-inter\n            if (inter/union if union else 0.0) <= threshold: survivors.append(int(j))\n        order=np.asarray(survivors,dtype=int)\n    return keep'),
});

enhance('convolution', {
  beginnerSummary: '输入单通道图像 x 形状 (H,W)、核形状 (K,K)，stride S、padding P；输出尺寸 floor((H+2P-K)/S)+1 与宽度同理。代码按深度学习的互相关（不翻核）。',
  prerequisites: ['每个输出像素是滑窗与 kernel 的逐元素乘加。', 'padding 先在边缘补零，stride 决定窗口每次移动多少格。'],
  workedExample: ['H=W=5,K=3,P=1,S=1，输出尺寸 floor((5+2-3)/1)+1=5。', '角落窗口含补零，中心窗口覆盖原图 3x3；stride=2 时输出为 3x3。'],
  derivation: ['补零后有效高宽为 H+2P、W+2P。', '窗口左上从 oy*S、ox*S 开始，所有合法窗口数给出输出尺寸。'],
  code: py('import numpy as np\n\ndef conv2d(image, kernel, stride=1, padding=0):\n    image, kernel = np.asarray(image, float), np.asarray(kernel, float)\n    h, w = image.shape; kh, kw = kernel.shape\n    padded = np.pad(image, ((padding,padding),(padding,padding)))\n    oh = (h+2*padding-kh)//stride + 1; ow = (w+2*padding-kw)//stride + 1\n    out = np.empty((oh, ow), float)\n    for oy in range(oh):\n        for ox in range(ow):\n            patch = padded[oy*stride:oy*stride+kh, ox*stride:ox*stride+kw]\n            out[oy, ox] = (patch*kernel).sum()\n    return out'),
  lineByLine: ['np.pad 扩展边界，保持中心与边缘统一处理。', 'oh/ow 使用 floor 输出尺寸公式。', '双循环枚举输出位置并切出 KxK patch。', 'patch*kernel 求和得到互相关值。'],
  edgeCases: ['kernel 大于补零后图像时输出尺寸可能非正，应先检查', 'stride>1 会下采样', 'padding=0 是无边界补零的 valid 模式'],
  followUps: [{ question: '为什么叫卷积却不翻转 kernel？', answer: '深度学习框架通常实现互相关，训练会学习到等价方向；数学卷积若严格定义需翻转核。' }, { question: '多通道如何扩展？', answer: '输入增加 C 维，窗口对每个通道求和；每个输出通道拥有一组 (C,kh,kw) 核并加 bias。' }],
  pitfalls: ['输出尺寸漏掉 +2P 或 stride。', '切片终点使用 ox+kw 而忘记乘 stride。'],
});

enhance('ctc-prefix-beam', {
  complexity: '时间 O(T·beam·V log(beam·V))（含候选排序），峰值空间 O(beam·V·T)（候选前缀 tuple）',
  code: py('import math\n\ndef _logadd(a, b):\n    if a == -math.inf: return b\n    if b == -math.inf: return a\n    m = max(a, b); return m + math.log(math.exp(a-m)+math.exp(b-m))\n\ndef ctc_prefix_beam(log_probs, blank, beam_size=3):\n    if beam_size <= 0: raise ValueError("beam_size must be positive")\n    if not log_probs: return []\n    vocab = len(log_probs[0])\n    if not 0 <= blank < vocab: raise ValueError("blank out of range")\n    beams = {(): (0.0, -math.inf)}\n    for frame in log_probs:\n        if len(frame) != vocab: raise ValueError("inconsistent vocabulary size")\n        next_scores = {}\n        for prefix, (pb, pnb) in beams.items():\n            total = _logadd(pb, pnb); old = next_scores.get(prefix, (-math.inf, -math.inf))\n            next_scores[prefix] = (_logadd(old[0], total + float(frame[blank])), old[1])\n            for token, value in enumerate(frame):\n                if token == blank: continue\n                lp = float(value); last = prefix[-1] if prefix else None\n                if token == last:\n                    same = next_scores.get(prefix, (-math.inf, -math.inf))\n                    next_scores[prefix] = (same[0], _logadd(same[1], pnb + lp))\n                    extended = prefix + (token,); ext = next_scores.get(extended, (-math.inf, -math.inf))\n                    next_scores[extended] = (ext[0], _logadd(ext[1], pb + lp))\n                else:\n                    extended = prefix + (token,); ext = next_scores.get(extended, (-math.inf, -math.inf))\n                    next_scores[extended] = (ext[0], _logadd(ext[1], total + lp))\n        beams = dict(sorted(next_scores.items(), key=lambda item: _logadd(*item[1]), reverse=True)[:beam_size])\n    return list(max(beams.items(), key=lambda item: _logadd(*item[1]))[0])'),
});

enhance('rmsnorm', {
  code: py('import torch\n\ndef rms_norm(x, weight, eps=1e-6):\n    x = torch.as_tensor(x, dtype=torch.float32); weight = torch.as_tensor(weight, dtype=x.dtype)\n    if weight.ndim != 1 or weight.shape[0] != x.shape[-1]: raise ValueError("weight must be shape (D,)")\n    rms = torch.sqrt(x.square().mean(dim=-1, keepdim=True) + eps)\n    return x/rms * weight'),
});

enhance('rnnt-greedy', {
  code: py('import numpy as np\n\ndef rnnt_greedy(encoder, predictor_start, joint, predictor_step, blank, max_symbols_per_frame=5):\n    if max_symbols_per_frame <= 0: raise ValueError("max_symbols_per_frame must be positive")\n    state = predictor_start(); output = []\n    for frame in encoder:\n        for _ in range(max_symbols_per_frame):\n            token = int(np.asarray(joint(frame, state)).argmax())\n            if token == blank: break\n            output.append(token); state = predictor_step(token, state)\n    return output'),
});

enhance('streaming-cache', {
  code: py('import numpy as np\n\ndef streaming_encode(chunks, encode_chunk, left_context=16):\n    if left_context < 0: raise ValueError("left_context must be non-negative")\n    cache = None; outputs = []\n    for chunk in chunks:\n        chunk = np.asarray(chunk, dtype=float)\n        context = chunk if cache is None else np.concatenate([cache, chunk], axis=0)\n        old_len = 0 if cache is None else len(cache)\n        outputs.append(encode_chunk(context, old_len))\n        cache = context[-left_context:] if left_context else context[:0]\n    return outputs, cache'),
});

enhance('nms', {
  code: py('import numpy as np\n\ndef nms(boxes, scores, threshold=0.5):\n    boxes, scores = np.asarray(boxes, float), np.asarray(scores, float)\n    if boxes.ndim != 2 or boxes.shape[1:] != (4,) or scores.shape != (len(boxes),): raise ValueError("boxes must be (N,4), scores (N,)")\n    if not 0 <= threshold <= 1: raise ValueError("threshold must be in [0,1]")\n    order = scores.argsort()[::-1]; keep = []\n    while order.size:\n        i = int(order[0]); keep.append(i); rest = order[1:]; survivors = []\n        for j in rest:\n            ax1,ay1,ax2,ay2=boxes[i]; bx1,by1,bx2,by2=boxes[int(j)]\n            iw=max(0.0,min(ax2,bx2)-max(ax1,bx1)); ih=max(0.0,min(ay2,by2)-max(ay1,by1)); inter=iw*ih\n            aa=max(0.0,ax2-ax1)*max(0.0,ay2-ay1); ab=max(0.0,bx2-bx1)*max(0.0,by2-by1); union=aa+ab-inter\n            if (inter/union if union else 0.0) <= threshold: survivors.append(int(j))\n        order=np.asarray(survivors,dtype=int)\n    return keep'),
});

enhance('attention', {
  beginnerSummary: 'Q、K、V 形状分别为 (B,H,Lq,D)、(B,H,Lk,D)、(B,H,Lk,Dv)。计算 QKᵀ/√D，先应用布尔 mask，再沿 key 维 softmax，输出 (B,H,Lq,Dv)。',
  prerequisites: ['点积衡量 query 与 key 的相似度，softmax 把相似度变成权重。', 'mask=True 表示允许关注；缩放 √D 防止维度大时 softmax 饱和。'],
  workedExample: ['单头 Q=[1,0]、K=[[1,0],[0,1]] 时分数为 [1,0]/√2，权重偏向第一个 key。', 'causal mask 在位置 t 屏蔽 t 之后的 key，softmax 前设为 -inf，输出不会看到未来。'],
  derivation: ['scores=QKᵀ/√D，形状 (B,H,Lq,Lk)。', 'masked softmax 每个 query 行权重和为 1，最后 weights@V 得到加权值。'],
  code: py('import math\nimport torch\n\ndef scaled_attention(q, k, v, mask=None):\n    # q:(B,H,Lq,D), k:(B,H,Lk,D), v:(B,H,Lk,Dv)\n    scores = q @ k.transpose(-1, -2) / math.sqrt(q.shape[-1])\n    if mask is not None:\n        scores = scores.masked_fill(~mask, torch.finfo(scores.dtype).min)\n    weights = torch.softmax(scores, dim=-1)\n    return weights @ v, weights'),
  lineByLine: ['矩阵乘法得到每个 query 对所有 key 的分数。', '除以 sqrt(D) 控制点积方差。', 'softmax 前将禁止位置设为极小值。', 'weights@v 输出每行 value 的凸组合。'],
  edgeCases: ['全 mask 行会产生无意义分布，应在上游保证至少一个可见 key', 'Lq 与 Lk 可不同用于 cross attention', 'mask 需能广播到 (B,H,Lq,Lk)'],
  followUps: [{ question: '为什么除以 √D？', answer: '若 Q、K 各维独立单位方差，点积方差约为 D；除以 √D 将标准差缩回约 1，避免 softmax 饱和。' }, { question: 'Self 与 Cross Attention 差异？', answer: 'Self 的 Q/K/V 来自同一序列；Cross 的 Q 来自解码器，K/V 来自编码器，长度可不同。' }],
  pitfalls: ['mask 放在 softmax 后会破坏归一化。', '把最后一维 Dv 误当成 key 长度 Lk。'],
});

enhance('rmsnorm', {
  beginnerSummary: '输入 x 形状 (...,D)，沿最后 hidden 维计算均方根，不减均值；输出仍为 (...,D)，只乘可学习 weight。eps 放在开方前防零除。',
  prerequisites: ['RMS=sqrt(mean(x²)+eps) 衡量向量尺度。', 'weight 形状 (D,) 通过广播恢复每个通道的可学习比例。'],
  workedExample: ['x=[3,4] 时 RMS=sqrt(12.5)，归一化后两个分量平方均值约为 1。', '全零向量依赖 eps 得到有限的 0，而不是 NaN。'],
  derivation: ['rms=(mean(x²)+eps)^1/2；y=x/rms*weight。', '与 LayerNorm 不同，RMSNorm 不中心化，因此计算更少。'],
  code: py('import torch\n\n\ndef rms_norm(x, weight, eps=1e-6):\n    x = torch.as_tensor(x, dtype=torch.float32)\n    weight = torch.as_tensor(weight, dtype=x.dtype)\n    if x.shape[-1] != weight.numel(): raise ValueError("weight must match hidden size")\n    rms = torch.sqrt(x.square().mean(dim=-1, keepdim=True) + eps)\n    return x/rms * weight'),
  lineByLine: ['转换输入并固定最后一维为 hidden。', '检查 weight 长度与 hidden size 对齐。', 'mean(...,keepdim=True) 保留广播维度。', '除 RMS 后乘可学习 weight，返回原形状。'],
  edgeCases: ['全零向量由 eps 防止除零', '半精度下 eps 不宜过小', '输入可包含 batch 与 sequence 前缀维'],
  followUps: [{ question: '与 LayerNorm 的关键差异？', answer: 'LayerNorm 先减均值再除标准差并常带 bias；RMSNorm 只除均方根，保留均值方向。' }, { question: '为什么大模型常用 RMSNorm？', answer: '它省去均值计算和 bias，计算略少，同时实践中能保持稳定的尺度控制。' }],
  pitfalls: ['把均方根写成 mean(x) 或标准差。', '沿 batch 维求均值，导致不同 token 互相影响。'],
});

enhance('conv1d', {
  beginnerSummary: '输入单通道序列 x 长度 L、kernel 长度 K；stride S、padding P 后输出长度 floor((L+2P-K)/S)+1。框架语义是互相关，不翻转 kernel。',
  prerequisites: ['每个输出位置取连续 K 个时间采样与 kernel 点积。', 'padding 在序列两端补零，stride 控制窗口移动步长。'],
  workedExample: ['x=[1,2,3]、kernel=[1,1]、stride=1、padding=0，输出 [3,5]。', 'padding=1 时窗口含边界零，输出长度为 4，首个值是 1。'],
  derivation: ['补零后长度 L+2P；合法起点数量给出 floor((L+2P-K)/S)+1。', '多通道时对每个输入通道的乘积求和，再为每个输出通道加 bias。'],
  code: py('import numpy as np\n\ndef conv1d(x, kernel, stride=1, padding=0):\n    x, kernel = np.asarray(x, float), np.asarray(kernel, float)\n    if stride <= 0 or padding < 0: raise ValueError("invalid stride or padding")\n    padded = np.pad(x, (padding, padding))\n    out_len = (len(x)+2*padding-len(kernel))//stride + 1\n    if out_len <= 0: return np.empty(0, dtype=float)\n    return np.array([(padded[i*stride:i*stride+len(kernel)]*kernel).sum() for i in range(out_len)])'),
  lineByLine: ['np.pad 在时间轴两端补零。', '输出公式显式包含原长度、padding、kernel 和 stride。', '按 stride 取连续窗口并与 kernel 点积。', '输出数组长度与公式一致。'],
  edgeCases: ['kernel 大于补零后输入返回空数组', 'stride>1 会下采样', 'padding 窗口边界含零'],
  followUps: [{ question: 'dilation 如何改变感受野？', answer: '窗口内采样间隔变为 dilation，等效核宽为 dilation*(K-1)+1，参数量不变但看到更长上下文。' }, { question: 'Conv1d 如何用于语音？', answer: '沿时间轴提取局部声学模式，stride 可做下采样；真实模型还要处理 batch、channel 和 bias。' }],
  pitfalls: ['把数学卷积翻核与框架互相关混淆。', '输出长度漏掉 padding 或 stride。'],
});

enhance('ctc-greedy', {
  beginnerSummary: '输入每帧 argmax 后的 token 列表 tokens（长度 T）和 blank 标记；先合并相邻重复，再删除 blank，输出 token 序列。',
  prerequisites: ['CTC blank 表示该帧不输出字符。', '重复合并只针对相邻帧，blank 会打断重复关系。'],
  workedExample: ['路径 [a,a,blank,b,b] 先合并为 [a,blank,b]，再删 blank 得 [a,b]。', '路径 [a,blank,a] 不能合并两个 a，因为 blank 将它们分开，输出 [a,a]。'],
  derivation: ['扫描保持 prev；当前 token 与 prev 相同则跳过，否则先判断是否为 blank。', '顺序必须是“合并连续重复后删 blank”；先删 blank 会错误合并跨 blank 的字符。'],
  code: py('def ctc_greedy(tokens, blank):\n    output, previous = [], None\n    for token in tokens:\n        if token != previous and token != blank:\n            output.append(token)\n        previous = token\n    return output'),
  lineByLine: ['output 收集最终 token，previous 保存上一帧原始 token。', '相邻重复先被跳过，blank 不加入输出。', '每帧更新 previous，blank 能打断重复关系。', '扫描结束返回最多 T 个 token 的列表。'],
  edgeCases: ['全 blank 输出空列表', '单帧输入直接返回一个非 blank token', '空 tokens 返回空列表'],
  followUps: [{ question: '为什么先合并再删 blank？', answer: 'CTC 规则只合并相邻重复；[a,blank,a] 中 blank 打断相邻关系，先删 blank 会错误变成一个 a。' }, { question: '贪心一定是最优吗？', answer: '不一定；它逐帧取局部最大，可能遗漏多条稍低概率但联合概率更高的路径，beam search 可缓解。' }],
  pitfalls: ['先过滤 blank 再去重，错误合并跨 blank 字符。', '把所有重复 token 都合并，而不是只合并相邻重复。'],
});

enhance('ctc-prefix-beam', {
  beginnerSummary: '前缀束搜索为每个前缀分别维护以 blank 结尾的 p_b 和以非 blank 结尾的 p_nb；两者转移规则不同，最后合并得到前缀总分。',
  prerequisites: ['同一前缀可由多条对齐路径产生，概率要在 log 域用 logaddexp 相加。', '若新字符等于前缀末字符，只能从 blank 状态扩展，避免错误合并重复。'],
  workedExample: ['前缀 (a,) 的 p_b 表示末帧 blank，p_nb 表示末帧 a；下一帧 blank 会让两者都回到 p_b。', '扩展字符 a 时仅从 p_b 进入 (a,a)，扩展 b 时可从 p_b+p_nb 进入 (a,b)。'],
  derivation: ['blank 转移保持前缀；非 blank 转移新增字符，或在重复字符规则下只从 blank 扩展。', '每帧按 p_b+p_nb 排序截断 beam，最终取总 log 概率最高的前缀。'],
  code: py('import math\n\ndef _logadd(a, b):\n    if a == -math.inf: return b\n    if b == -math.inf: return a\n    m = max(a, b); return m + math.log(math.exp(a-m)+math.exp(b-m))\n\ndef ctc_prefix_beam(log_probs, blank, beam_size=3):\n    # log_probs: (T,V)，每行已是 log softmax\n    beams = {(): (0.0, -math.inf)}  # prefix -> (p_blank, p_nonblank)\n    for frame in log_probs:\n        next_scores = {}\n        for prefix, (pb, pnb) in beams.items():\n            total = _logadd(pb, pnb)\n            old = next_scores.get(prefix, (-math.inf, -math.inf))\n            value = old[0]\n            value = _logadd(value, total + float(frame[blank]))\n            next_scores[prefix] = (value, old[1])\n            for token, lp in enumerate(frame):\n                if token == blank: continue\n                last = prefix[-1] if prefix else None\n                new_prefix = prefix if token == last else prefix + (token,)\n                base = pb if token == last else total\n                old = next_scores.get(new_prefix, (-math.inf, -math.inf))\n                nb = _logadd(old[1], base + float(lp))\n                next_scores[new_prefix] = (old[0], nb)\n        beams = dict(sorted(next_scores.items(), key=lambda item: _logadd(*item[1]), reverse=True)[:beam_size])\n    return list(max(beams.items(), key=lambda item: _logadd(*item[1]))[0])'),
  lineByLine: ['_logadd 在概率相加时保持对数数值稳定。', 'beams 值对分别表示 blank/nonblank 结尾分数。', 'blank 保持前缀，非 blank 按重复规则决定是否追加 token。', '每帧按合并分数截断，最终返回最高总分前缀。'],
  edgeCases: ['全 blank 返回空前缀', 'beam_size=1 退化为近似贪心', '空帧序列返回空前缀'],
  followUps: [{ question: '如何融合语言模型？', answer: '扩展新前缀时加入 λ·LM(prefix+token) 与长度奖励，再按总分排序。' }, { question: '为什么必须区分 p_b/p_nb？', answer: '重复字符从 nonblank 直接扩展会违反 CTC 合并规则；只有区分末尾状态才能正确计算。' }],
  pitfalls: ['把 p_b、p_nb 当成普通概率直接相加，长序列会下溢。', '重复字符总是追加或总是不追加，忽略末尾 blank。'],
});

enhance('rnnt', {
  beginnerSummary: 'RNN-T 在二维格点 (t,u) 上前向递推：t 是 encoder 帧数、u 是已输出标签数。blank 走到 (t+1,u)，label 走到 (t,u+1)，总复杂度 O(TU)。',
  prerequisites: ['logp_blank 形状 (T,U+1)，logp_label 形状 (T,U)，元素是 log 概率。', 'alpha[t,u] 是到达格点的对数总概率，多个路径用 logaddexp 合并。'],
  workedExample: ['从 (0,0) 可先输出标签到 (0,1)，也可 blank 到 (1,0)；两条路径概率相加。', '到 (T,U) 表示所有 T 帧与 U 个标签均消费完，alpha[T,U] 是序列概率。'],
  derivation: ['按 t、u 遍历，每格向右（label）和向下（blank）转移。', '初始 alpha[0,0]=0，其余 -inf；使用 logaddexp 防止多路径下溢。'],
  code: py('import numpy as np\n\ndef rnnt_forward(logp_blank, logp_label):\n    logp_blank, logp_label = np.asarray(logp_blank,float), np.asarray(logp_label,float)\n    T, up1 = logp_blank.shape\n    if logp_label.shape != (T, up1-1): raise ValueError("inconsistent RNNT shapes")\n    alpha = np.full((T+1, up1), -np.inf)\n    alpha[0,0] = 0.0\n    for t in range(T+1):\n        for u in range(up1):\n            if not np.isfinite(alpha[t,u]): continue\n            if t < T:\n                alpha[t+1,u] = np.logaddexp(alpha[t+1,u], alpha[t,u]+logp_blank[t,u])\n            if t < T and u < up1-1:\n                alpha[t,u+1] = np.logaddexp(alpha[t,u+1], alpha[t,u]+logp_label[t,u])\n    return float(alpha[T, up1-1]), alpha'),
  lineByLine: ['检查两张概率表的 T、U 维一致。', 'alpha 初始化为负无穷，仅起点为 0。', 'blank 在 t<T 时推进时间轴。', 'label 在 t<T 且 u<U 时推进标签轴，并用 logaddexp 合并路径。'],
  edgeCases: ['T=0 或 U=0 时只允许相应空路径', '非法形状应立即报错', '极小概率用对数域保持有限'],
  followUps: [{ question: '为什么 label 转移不推进 t？', answer: 'RNN-T 允许同一声学帧输出多个标签，prediction 网络沿 u 轴前进；blank 才表示消费当前帧。' }, { question: '如何降低 O(TU) 空间？', answer: '若只求总分可按 u 或 t 滚动保存一行；若要回溯对齐则需保存父指针或完整格点。' }],
  pitfalls: ['把 blank 和 label 方向写反。', '在 t=T 后仍访问 logp_label[t] 越界。'],
});

enhance('rnnt-greedy', {
  beginnerSummary: '给定 T 个 encoder 帧、joint 函数和 predictor 状态：每帧反复取最大 token；blank 才推进下一帧，非 blank 输出并更新 predictor，且每帧设置最大输出数 M。',
  prerequisites: ['blank 表示结束当前帧，非 blank 不消耗时间。', 'prediction state 依赖已输出 token，输出后必须更新。'],
  workedExample: ['帧 0 的 joint 依次预测“你”“好”“blank”，输出两个 token 后才进入帧 1。', '若某帧始终预测非 blank，M 上限会打断循环并推进时间，避免死循环。'],
  derivation: ['外层按 encoder 时间 t，内层最多循环 M 次。', 'argmax 得到 token；blank break，否则追加 token 并调用 predictor_step。'],
  code: py('import numpy as np\n\ndef rnnt_greedy(encoder, predictor_start, joint, predictor_step, blank, max_symbols_per_frame=5):\n    state = predictor_start()\n    output = []\n    for frame in encoder:  # frame shape (D,)\n        for _ in range(max_symbols_per_frame):\n            logits = np.asarray(joint(frame, state))  # (V,)\n            token = int(logits.argmax())\n            if token == blank: break\n            output.append(token)\n            state = predictor_step(token, state)\n    return output'),
  lineByLine: ['初始化 predictor state，output 保存转写 token。', '外层逐帧处理 encoder 表示。', '内层限制每帧最多 M 个非 blank 输出。', 'blank 结束当前帧，否则更新 state 并继续同帧解码。'],
  edgeCases: ['连续 blank 立即推进时间', '单帧多个 token 需要 predictor 状态串联', 'M<=0 应在调用前拒绝'],
  followUps: [{ question: '与 CTC greedy 最大差别？', answer: 'RNN-T 非 blank 不推进时间且依赖 prediction 网络，可一帧输出多个 token；CTC 每帧独立取一个。' }, { question: '如何提高准确率？', answer: '使用 RNN-T beam search、语言模型融合或更强的 encoder/predictor。' }],
  pitfalls: ['非 blank 后忘记更新 predictor state。', '没有 max_symbols_per_frame 导致单帧无限循环。'],
});

enhance('streaming-cache', {
  beginnerSummary: '流式模型按 chunk 输入新帧，只缓存最近 left_context 帧或 Transformer KV；每次返回新输出与更新后的有限缓存，避免重复计算全部历史。',
  prerequisites: ['chunk_size 决定延迟与吞吐，left_context 决定模型可见历史。', '缓存必须在 chunk 边界拼接，不能丢掉跨边界卷积/注意力所需上下文。'],
  workedExample: ['chunk1=[0..3]、chunk2=[4..7]、left_context=2；处理 chunk2 时输入缓存 [2,3] 加新帧 [4..7]。', '更新后只保留最后两帧 [6,7]，下个 chunk 不会让缓存无限增长。'],
  derivation: ['维护 cache 拼接 context+chunk，encoder 只产生新 chunk 的输出。', '处理完成后 cache=context_plus_chunk[-left_context:]；解码器状态另行持续更新。'],
  code: py('import numpy as np\n\ndef streaming_encode(chunks, encode_chunk, left_context=16):\n    cache = np.empty((0,), dtype=float)\n    outputs = []\n    for chunk in chunks:\n        chunk = np.asarray(chunk, dtype=float)\n        context = np.concatenate([cache, chunk])\n        encoded = encode_chunk(context, len(cache))  # 只返回新 chunk 对应输出\n        outputs.append(encoded)\n        cache = context[-left_context:] if left_context else np.empty((0,), dtype=float)\n    return outputs, cache'),
  lineByLine: ['cache 初始为空一维帧序列。', '拼接旧上下文和新 chunk，encode_chunk 知道旧长度即可丢弃旧输出。', '只保存新输出，避免重复发射历史帧。', '切片保留最后 left_context 帧，控制显存和计算。'],
  edgeCases: ['首个 chunk 没有历史缓存', 'left_context=0 表示无历史上下文', 'chunk 为空时应由 encode_chunk 定义行为'],
  followUps: [{ question: '如何降低首字延迟？', answer: '减小 chunk 和右上下文，或采用更早的稳定前缀提交；代价是吞吐和上下文可能下降。' }, { question: '为什么缓存必须截断？', answer: '无限缓存会让每个 chunk 的注意力和显存随音频总长度线性增长，最终失去流式优势。' }],
  pitfalls: ['只缓存输出不缓存卷积左上下文，导致 chunk 边界断裂。', 'cache 与 chunk 维度不一致，拼接后产生隐性广播或错误。'],
});

// 边界与数值安全修订。
enhance('cross-entropy', {
  code: py('import numpy as np\n\ndef cross_entropy(logits, labels):\n    logits = np.asarray(logits, dtype=float)  # (B,C)\n    labels = np.asarray(labels, dtype=int)\n    if logits.ndim != 2 or logits.shape[0] == 0 or labels.shape != (logits.shape[0],):\n        raise ValueError("logits must be non-empty (B,C), labels must be (B,)")\n    if np.any(labels < 0) or np.any(labels >= logits.shape[1]):\n        raise ValueError("labels out of range")\n    shifted = logits - logits.max(axis=1, keepdims=True)\n    logsumexp = np.log(np.exp(shifted).sum(axis=1))\n    log_prob = shifted - logsumexp[:, None]\n    return float(-log_prob[np.arange(logits.shape[0]), labels].mean())'),
});

enhance('bce', {
  code: py('import numpy as np\n\ndef bce_with_logits(logits, targets, reduction="mean"):\n    x = np.asarray(logits, dtype=float); y = np.asarray(targets, dtype=float)\n    if x.shape != y.shape: raise ValueError("logits and targets must have the same shape")\n    if np.any((y < 0) | (y > 1)): raise ValueError("targets must be in [0,1]")\n    if reduction not in ("none", "sum", "mean"): raise ValueError("invalid reduction")\n    loss = np.maximum(x, 0.0) - x*y + np.log1p(np.exp(-np.abs(x)))\n    if reduction == "none": return loss\n    if reduction == "sum": return float(loss.sum())\n    return float(loss.mean())'),
});

enhance('batchnorm', {
  code: py('import numpy as np\n\ndef batch_norm(x, gamma, beta, running_mean, running_var, training=True, momentum=0.1, eps=1e-5):\n    x = np.asarray(x, dtype=float); gamma, beta = np.asarray(gamma), np.asarray(beta)\n    running_mean, running_var = np.asarray(running_mean), np.asarray(running_var)\n    if x.ndim != 2 or gamma.shape != (x.shape[1],) or beta.shape != (x.shape[1],): raise ValueError("BN shapes must be (B,C) and (C,)")\n    if running_mean.shape != gamma.shape or running_var.shape != gamma.shape: raise ValueError("running stats shape mismatch")\n    if not 0 <= momentum <= 1: raise ValueError("momentum must be in [0,1]")\n    if training:\n        mean, var = x.mean(axis=0), x.var(axis=0)\n        running_mean[...] = (1-momentum)*running_mean + momentum*mean\n        running_var[...] = (1-momentum)*running_var + momentum*var\n    else: mean, var = running_mean, running_var\n    return gamma*(x-mean)/np.sqrt(var+eps) + beta'),
});

enhance('topk-sampling', {
  code: py('import numpy as np\n\ndef top_k_sample(logits, k, rng=None):\n    logits = np.asarray(logits, dtype=float)\n    if logits.ndim != 1 or not 1 <= k <= logits.size: raise ValueError("invalid logits or k")\n    if not np.all(np.isfinite(logits)): raise ValueError("top-k logits must be finite")\n    idx = np.argpartition(logits, -k)[-k:]; values = logits[idx]\n    probs = np.exp(values-values.max()); probs /= probs.sum()\n    generator = np.random.default_rng() if rng is None else rng\n    return int(generator.choice(idx, p=probs))'),
});

enhance('beam-search', {
  complexity: '时间 O(T·beam·V log V)，候选排序另有 O(T·beam² log beam)；峰值空间 O(beam²·T)（候选完整序列），保留束 O(beam·T)',
  beginnerSummary: '束搜索维护最多 beam_size 条序列及累计 log 概率。EOS 只标记序列完成、不作为普通输出 token；每步按分数保留候选。',
  edgeCases: ['beam_size<=0 或 eos 越界立即报错', '没有 EOS 时运行到 max 步返回当前最高分', '存在完成序列时最终优先从完成序列选最高分'],
  code: py('import numpy as np\n\ndef beam_search(log_probs, beam_size=3, eos=0):\n    log_probs = np.asarray(log_probs, dtype=float)  # (T,V,V)\n    if log_probs.ndim != 3: raise ValueError("log_probs must be (T,V,V)")\n    if beam_size <= 0: raise ValueError("beam_size must be positive")\n    vocab = log_probs.shape[-1]\n    if log_probs.shape[1] != vocab or not 0 <= eos < vocab: raise ValueError("invalid EOS or vocabulary shape")\n    beams = [((), 0.0, False)]; finished = []\n    for t in range(log_probs.shape[0]):\n        candidates = []\n        for seq, score, done in beams:\n            if done: candidates.append((seq, score, True)); continue\n            row = log_probs[t, seq[-1] if seq else 0]\n            for token in np.argsort(row)[-beam_size:]:\n                token = int(token); new_score = score + float(row[token])\n                if token == eos: candidates.append((seq, new_score, True))\n                else: candidates.append((seq+(token,), new_score, False))\n        candidates.sort(key=lambda item: item[1], reverse=True)\n        beams = candidates[:beam_size]\n        finished.extend(item for item in beams if item[2])\n        if beams and all(done for _, _, done in beams): break\n    pool = finished if finished else beams\n    return list(max(pool, key=lambda item: item[1])[0]) if pool else []'),
});

enhance('kmeans', {
  code: py('import numpy as np\n\ndef kmeans(x, k, iterations=20, seed=0):\n    x = np.asarray(x, dtype=float)\n    if x.ndim != 2 or not 1 <= k <= len(x): raise ValueError("invalid x or k")\n    if iterations <= 0: raise ValueError("iterations must be positive")\n    rng = np.random.default_rng(seed); centers = x[rng.choice(len(x), size=k, replace=False)].copy()\n    for _ in range(iterations):\n        dist = ((x[:, None, :]-centers[None, :, :])**2).sum(axis=2); labels = dist.argmin(axis=1)\n        for j in range(k):\n            members = x[labels == j]\n            centers[j] = members.mean(axis=0) if len(members) else x[dist.min(axis=1).argmax()]\n    final_dist = ((x[:, None, :]-centers[None, :, :])**2).sum(axis=2)\n    return final_dist.argmin(axis=1), centers'),
});

enhance('ctc-prefix-beam', {
  complexity: '时间 O(T·beam·V log(beam·V))（含候选排序），峰值空间 O(beam·V·T)（候选前缀 tuple）',
  code: py('import math\n\ndef _logadd(a,b):\n    if a == -math.inf: return b\n    if b == -math.inf: return a\n    m=max(a,b); return m+math.log(math.exp(a-m)+math.exp(b-m))\n\ndef ctc_prefix_beam(log_probs, blank, beam_size=3):\n    if beam_size<=0: raise ValueError("beam_size must be positive")\n    if not log_probs: return []\n    vocab=len(log_probs[0]); beams={(): (0.0,-math.inf)}\n    for frame in log_probs:\n        if len(frame)!=vocab or not 0<=blank<vocab: raise ValueError("invalid log_probs or blank")\n        nxt={}\n        for prefix,(pb,pnb) in beams.items():\n            total=_logadd(pb,pnb); old=nxt.get(prefix,(-math.inf,-math.inf))\n            nxt[prefix]=(_logadd(old[0],total+float(frame[blank])),old[1])\n            for token,value in enumerate(frame):\n                if token==blank: continue\n                lp=float(value); last=prefix[-1] if prefix else None\n                if token==last:\n                    same=nxt.get(prefix,(-math.inf,-math.inf)); nxt[prefix]=(same[0],_logadd(same[1],pnb+lp))\n                    ext=prefix+(token,); prev=nxt.get(ext,(-math.inf,-math.inf)); nxt[ext]=(prev[0],_logadd(prev[1],pb+lp))\n                else:\n                    ext=prefix+(token,); prev=nxt.get(ext,(-math.inf,-math.inf)); nxt[ext]=(prev[0],_logadd(prev[1],total+lp))\n        beams=dict(sorted(nxt.items(),key=lambda item:_logadd(*item[1]),reverse=True)[:beam_size])\n    return list(max(beams.items(),key=lambda item:_logadd(*item[1]))[0])'),
});
enhance('rmsnorm', { code: py('import torch\n\ndef rms_norm(x,weight,eps=1e-6):\n    x=torch.as_tensor(x,dtype=torch.float32); weight=torch.as_tensor(weight,dtype=x.dtype)\n    if weight.ndim!=1 or weight.shape[0]!=x.shape[-1]: raise ValueError("weight must be shape (D,)")\n    return x/torch.sqrt(x.square().mean(dim=-1,keepdim=True)+eps)*weight') });
enhance('rnnt-greedy', { code: py('import numpy as np\n\ndef rnnt_greedy(encoder,predictor_start,joint,predictor_step,blank,max_symbols_per_frame=5):\n    if max_symbols_per_frame<=0: raise ValueError("max_symbols_per_frame must be positive")\n    state=predictor_start(); out=[]\n    for frame in encoder:\n        for _ in range(max_symbols_per_frame):\n            token=int(np.asarray(joint(frame,state)).argmax())\n            if token==blank: break\n            out.append(token); state=predictor_step(token,state)\n    return out') });
enhance('streaming-cache', { code: py('import numpy as np\n\ndef streaming_encode(chunks,encode_chunk,left_context=16):\n    if left_context<0: raise ValueError("left_context must be non-negative")\n    cache=None; outputs=[]\n    for chunk in chunks:\n        chunk=np.asarray(chunk,dtype=float); context=chunk if cache is None else np.concatenate([cache,chunk],axis=0)\n        outputs.append(encode_chunk(context,0 if cache is None else len(cache))); cache=context[-left_context:] if left_context else context[:0]\n    return outputs,cache') });
enhance('nms', { code: py('import numpy as np\n\ndef nms(boxes,scores,threshold=0.5):\n    boxes,scores=np.asarray(boxes,float),np.asarray(scores,float)\n    if boxes.ndim!=2 or boxes.shape[1:]!=(4,) or scores.shape!=(len(boxes),): raise ValueError("boxes must be (N,4), scores (N,)")\n    if not 0<=threshold<=1: raise ValueError("threshold must be in [0,1]")\n    order=scores.argsort()[::-1]; keep=[]\n    while order.size:\n        i=int(order[0]); keep.append(i); rest=order[1:]; survivors=[]\n        for j in rest:\n            ax1,ay1,ax2,ay2=boxes[i]; bx1,by1,bx2,by2=boxes[int(j)]; iw=max(0,min(ax2,bx2)-max(ax1,bx1)); ih=max(0,min(ay2,by2)-max(ay1,by1)); inter=iw*ih; aa=max(0,ax2-ax1)*max(0,ay2-ay1); ab=max(0,bx2-bx1)*max(0,by2-by1); union=aa+ab-inter\n            if (inter/union if union else 0)<=threshold: survivors.append(int(j))\n        order=np.asarray(survivors,dtype=int)\n    return keep') });
const _ctcCard = questions.find((question) => question.id === 'ctc-prefix-beam');
enhance('ctc-prefix-beam', { code: _ctcCard.code.replace('if not log_probs:', 'if len(log_probs) == 0:') });
const _ceCard = questions.find((question) => question.id === 'cross-entropy');
enhance('cross-entropy', { code: _ceCard.code
  .replace('labels = np.asarray(labels, dtype=int)', 'labels = np.asarray(labels)\n    if not np.issubdtype(labels.dtype, np.integer): raise ValueError("labels must be integers")\n    labels = labels.astype(int)')
  .replace('logits.shape[0] == 0', 'logits.shape[0] == 0 or logits.shape[1] == 0') });
enhance('convolution', {
  edgeCases: ['stride<=0 或 padding<0 报错', 'kernel 大于补零后图像时报错', 'padding=0 是 valid 模式'],
  complexity: '时间 O(HW·K²)，空间 O(HW)',
  // Final input-validation overlays are applied immediately before this card's code.
  // Final input-validation overlays are applied immediately before this card's code.
  code: py('import numpy as np\n\ndef conv2d(image, kernel, stride=1, padding=0):\n    image, kernel = np.asarray(image, float), np.asarray(kernel, float)\n    if image.ndim != 2 or kernel.ndim != 2: raise ValueError("image and kernel must be 2-D")\n    if stride <= 0 or padding < 0: raise ValueError("invalid stride or padding")\n    h, w = image.shape; kh, kw = kernel.shape\n    if kh > h+2*padding or kw > w+2*padding: raise ValueError("kernel larger than padded image")\n    padded = np.pad(image, ((padding,padding),(padding,padding)))\n    oh = (h+2*padding-kh)//stride + 1; ow = (w+2*padding-kw)//stride + 1\n    out = np.empty((oh, ow), float)\n    for oy in range(oh):\n        for ox in range(ow): out[oy,ox] = (padded[oy*stride:oy*stride+kh, ox*stride:ox*stride+kw]*kernel).sum()\n    return out'),
});
