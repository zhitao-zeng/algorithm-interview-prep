export default {
  kind: 'concept',
  id: 'rvq',
  category: '语音大模型',
  difficulty: 'Medium',
  title: '残差向量量化 RVQ',
  prompt: 'RVQ 怎样用多层码本逐步逼近声音？为什么“第一层语义、后续层声学”不是它的天然性质？',
  quickAnswer: 'RVQ 先用第一个码本近似原向量，再把剩余误差交给后续码本逐层补偿。它天然提供的是“从粗到细的重建”，不是“从语义到声学的分层”。只有加入语义蒸馏等额外目标后，第一层才可能稳定地偏向内容信息。',
  approach: '编码时每层都量化当前残差，解码时把各层选中的码向量相加。先理解重建机制，再单独判断模型是否有语义约束。',
  explanationFocus: 'RVQ 的本体是残差重建；语义分层是特定 tokenizer 的训练结果。',
  bruteForce: '单层 VQ 若想同时覆盖大量声学细节，往往需要很大的码本；直接把普通 RVQ-1 当语义 token，又会混淆重建粗层与内容层。',
  derivation: [
    '为什么需要：高维音频表示很难用一个有限码本精确覆盖。',
    '怎么实现：第 l 层从码本中选出最接近当前残差的向量，减掉它后把新残差交给下一层。',
    '有什么代价：层数越多，码率、存储和生成成本越高；训练不当还会出现码本条目长期不用。',
    '怎么评测：逐层增加码本并画出码率—重建质量曲线；若声称某层有语义，还要额外报告音素相关性或下游内容任务。',
  ],
  invariant: '重建向量等于各层选中码向量之和；层号本身不能证明该层表达语义。',
  walkthrough: 'x 先匹配 c1，得到 r1=x-c1；r1 再匹配 c2；最终用 c1+c2+… 重建。',
  edgeCases: [
    '码本坍缩：部分条目从不被选择，需要监控使用率并重置。',
    '过多层码本提高重建质量，却会增加每个时间步要生成的 token 数。',
    '只训练重建损失时，第一层可能保留说话人和信道信息，不能直接称为语义层。',
  ],
  code: "def rvq_encode(x, codebooks):\n    residual = x\n    codes = []\n    for codebook in codebooks:\n        index, vector = codebook.nearest(residual)\n        codes.append(index)\n        residual = residual - vector\n    return codes",
  codeNotes: [
    '每层都处理上一层未解释掉的残差。',
    '解码时按索引取回各层向量并求和。',
  ],
  complexity: '若有 L 层、T 个时间步、每层 K 个码向量且向量维度为 D，朴素最近邻编码约 O(LTKD)；解码求和约 O(LTD)。',
  followUps: [
    { question: '为什么有人把 RVQ 第一层叫语义 token？', answer: '在 SpeechTokenizer、Mimi 等特定模型里，第一层接受了语义教师或等价约束，所以更偏内容；这不是普通 RVQ 自动拥有的性质。' },
    { question: '增加层数一定更好吗？', answer: '重建通常会改善，但码率和生成成本也会上升。应根据可懂度、音质和延迟的联合曲线选择。' },
  ],
  followUpAnswers: [
    '第一层的语义性需要训练目标与评测共同证明。',
    '层数选择是码率、音质和生成成本之间的折中。',
  ],
  pitfalls: [
    '前面说“语义不是天然属性”，后面又说“第一层天然近似语义”——这两句话互相矛盾。',
    '只看重建音质，不监控码本使用率和 token 生成成本。',
  ],
  beginnerSummary: 'RVQ 像分几次修图：第一次先修掉最明显的误差，第二次只修第一次没修好的部分，后面继续补。这样能用多个小码本逐步逼近声音。但“第一次修的是语义”并不是规则；如果训练时没有专门教它内容信息，第一层只是一层较粗的声音编码。',
  prerequisites: [
    '向量量化：用码本中最近的向量近似连续向量。',
    '残差：原向量减去当前近似后仍未被表示的部分。',
    '语义蒸馏：额外用内容教师约束某层关注音素与语言。',
  ],
  workedExample: [
    '示意：x 经第一码本选到 c1，剩余 r1=x-c1；第二码本再用 c2 近似 r1。',
    '重建得到 x_hat=c1+c2；若再加入第三层，就是继续量化 r2=r1-c2。',
  ],
  lineByLine: [
    '把初始残差设为原向量。',
    '每层查找当前残差的最近码向量。',
    '记录索引并扣除已解释部分。',
    '层级语义要靠额外目标验证，不能从这段循环推出。',
  ],
  diagram: 'x ─▶ 码本 1 得 c1 ─▶ 残差 r1 ─▶ 码本 2 得 c2 ─▶ 残差 r2\n重建：x_hat = c1 + c2 + …\n注意：粗到细重建 ≠ 天然的语义到声学分层',
  references: [
    { title: 'SpeechTokenizer: Unified Speech Tokenizer for Speech Language Models', url: 'https://arxiv.org/abs/2308.16692' },
  ],
};
