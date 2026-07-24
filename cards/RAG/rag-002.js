export default {
  "kind": "concept",
  "id": "rag-002",
  "category": "RAG",
  "difficulty": "Medium",
  "title": "中文 RAG 如何选 embedding 模型？",
  "prompt": "中文场景下做 RAG，embedding 模型该怎么选，要关注哪些指标？",
  "quickAnswer": "中文优先 BGE 系列(bge-large-zh 维度 1024、C-MTEB 榜首)，做检索时 query 加指令、向量归一化、按需选维度与显存。",
  "approach": "以 C-MTEB/MMTEB 榜单为准，按『语言匹配+检索子任务分数+维度/显存』权衡选型。",
  "explanationFocus": "是什么：embedding 模型把文本映射成定长稠密向量，其质量直接决定召回上限；中文需专用中文模型。",
  "bruteForce": "直接用 OpenAI text-embedding-ada-002(维度1536)做中文：中文 MTEB 仅约 53 分，明显弱于专用中文模型且无法私有部署。",
  "derivation": [
    "为什么需要：不同模型语义空间差异巨大，维度与训练语料决定中英/检索表现，选错会召回稀疏。",
    "怎么实现：参考 MTEB/C-MTEB 榜单，中文用 bge-large-zh(1024维)/bge-m3(多语言多粒度)；query 端加检索指令，encode 时 normalize_embeddings=True。",
    "有什么代价：维度越高越占内存与存储(1024维 float32 约 4KB/条)，大模型推理慢；需平衡召回率与成本。",
    "怎么评测：用检索子任务(NDCG@10)与 C-MTEB 平均分为客观依据，线上用 Context Recall 反推。"
  ],
  "invariant": "经验法则：query 与 document 必须用同一模型、同一归一化设置，否则相似度不可比。",
  "walkthrough": "bge-large-zh 在 C-MTEB 平均 64.2、检索 71.53 居首；维度 1024。短查询检索时长文档建议加指令『为这个句子生成表示以用于检索相关文章:』。",
  "edgeCases": [
    "query 与 doc 用不同模型编码，点积无意义",
    "未归一化时余弦相似度退化，阈值难定",
    "短句相似度偏高(0.6~1 集中)，需提高阈值如 0.8+",
    "max_seq 截断导致长文信息丢失"
  ],
  "code": "from sentence_transformers import SentenceTransformer\nmodel = SentenceTransformer('BAAI/bge-large-zh')\nq = model.encode(['为这个句子生成表示以用于检索相关文章:'+t for t in queries], normalize_embeddings=True)\nd = model.encode(docs, normalize_embeddings=True)\nscores = q @ d.T",
  "codeNotes": [
    "只给 query 加指令，document 端不加",
    "normalize 后用点积近似余弦，省去再归一化"
  ],
  "complexity": "编码为 O(序列长度)，可批处理；向量库检索与维度数线性相关。",
  "followUps": [
    {
      "question": "维度选 512/768/1024 怎么定？",
      "answer": "数据量与显存受限选小维度(bge-small 512)，追求召回选大维度；同系列大模型通常更优但更慢。"
    },
    {
      "question": "如何判断相似度阈值？",
      "answer": "绝对阈值不可靠(分布集中在0.6~1)，应看相对排序；若必须卡阈值，按业务分布实测取 0.8/0.85/0.9。"
    }
  ],
  "followUpAnswers": [
    "数据量与显存受限选小维度(bge-small 512)，追求召回选大维度；同系列大模型通常更优但更慢。",
    "绝对阈值不可靠(分布集中在0.6~1)，应看相对排序；若必须卡阈值，按业务分布实测取 0.8/0.85/0.9。"
  ],
  "pitfalls": [
    "query/doc 编码设置不一致导致相似度失真",
    "误信绝对相似度数值而非相对排序",
    "忽视中文专用模型直接用英文模型"
  ],
  "beginnerSummary": "embedding 模型像『翻译官』，把句子翻成数字串；中文要用懂中文的翻译官(BGE)，且问句和文档要用同一个。",
  "prerequisites": [
    "文本向量化基础",
    "余弦相似度"
  ],
  "workedExample": [
    "选 bge-large-zh，维度 1024",
    "query 加指令编码并归一化，doc 直接归一化编码，点积排序取 top-k"
  ],
  "lineByLine": [
    "SentenceTransformer 加载 BGE 中文模型",
    "对 query 拼接检索指令后编码",
    "normalize_embeddings 保证向量单位长度",
    "矩阵乘得到相似度分数矩阵"
  ],
  "diagram": "Query+instruction -> [BGE] -> q_vec(1024,|v|=1)\nDoc -> [BGE] -> d_vec(1024,|v|=1)\nscore = q_vec · d_vec"
};
