export default {
  "id": "de-web-crawl",
  "category": "多模态数据工程",
  "difficulty": "Easy",
  "title": "网页爬取与清洗",
  "prompt": "如何从大规模网页爬取中高效获取多模态内容，并把 HTML 清洗成结构化（文本+图片）数据？",
  "quickAnswer": "爬取侧用分布式爬虫遵守 robots 与限速，落原始 HTML；清洗侧用正文提取（如 readability）去导航/广告，抽取图片 URL 与邻近文本，做去重与质量过滤。关键是把\"抓取\"与\"解析\"解耦，原始快照可重放以便规则升级后免重复爬。",
  "approach": "爬虫只负责下载并存储原始页（含资源），清洗模块异步解析 HTML、提取正文与图片、规范 URL，再接入通用质量过滤与去重。",
  "explanationFocus": "是什么：网页爬取与清洗是获取多模态语料的第一步——用爬虫规模化下载网页并保存原始快照，再用解析与清洗把杂乱 HTML 转成结构化文本与图片引用。",
  "bruteForce": "朴素做法：边爬边解析，规则一改就要重新全量爬，浪费带宽且易封禁。",
  "invariant": "核心不变式：原始 HTML 快照一旦落盘即不可变，所有清洗都是其纯函数变换，保证可重放、可复现。",
  "walkthrough": "分布式爬 10 亿页，限速 5 req/s/域名，原始快照存对象存储；清洗阶段用正文提取保留平均 800 字正文，抽取平均 15 张图 URL，经 URL 去重后实际唯一页 7 亿，再去重冗余模板页。",
  "code": "def clean_page(raw_html):\n    doc = parse(raw_html)\n    text = extract_main_text(doc)\n    imgs = [norm_url(i.src) for i in doc.images]\n    return {'text': text, 'images': imgs}",
  "complexity": "每页解析 O(HTML 大小)，提取与 URL 规范为常数级；整体随页面数线性，瓶颈在网络 IO 与解析。",
  "beginnerSummary": "像把报纸扫描存档（爬取留原版），之后再用剪刀把正文和配图剪下来贴到干净本子上（清洗），原版始终留着以备重剪。",
  "diagram": "crawl ─► raw HTML (snapshot) ─► parse ─► main text + img urls ─► downstream\n   │                                     │\n 限速/robots                          重放无需再爬",
  "derivation": [
    "为什么需要：模型训练需要干净结构化数据，而原始网页充满导航/广告噪音。",
    "怎么实现：爬取与解析解耦，原始快照可重放，清洗为纯函数。",
    "有什么代价：存储原始快照占用空间，且需维护爬虫稳定性与反爬应对。",
    "怎么评测：抽样看正文提取准确率与图片 URL 有效率，统计去重率。"
  ],
  "edgeCases": [
    "JS 渲染页面原始 HTML 无正文，需 headless 渲染。",
    "相对 URL 需拼 base 才能用。",
    "软 404/陷阱链接产生垃圾页。",
    "编码声明错误导致乱码。"
  ],
  "pitfalls": [
    "爬取与清洗耦合，规则改了只能重爬。",
    "忽略 robots 与限速导致被封禁。"
  ],
  "prerequisites": [
    "HTTP 与爬虫基础",
    "HTML 解析与正文提取",
    "URL 规范化"
  ],
  "workedExample": [
    "raw_html 含导航+正文，extract_main_text 去掉导航留正文 800 字。",
    "doc.images 得 15 个 src，norm_url 转绝对地址。",
    "返回 {text, images} 供下游图文对构建。"
  ],
  "lineByLine": [
    "def clean_page(raw_html): 接收原始 HTML 字符串。",
    "doc = parse(raw_html) 解析为可查询的文档对象。",
    "text = extract_main_text(doc) 提取正文去噪音。",
    "imgs = [norm_url(i.src) for i in doc.images] 规范化图片地址。"
  ],
  "codeNotes": [
    "保存 raw_html 而非只存结果，是\"可重放\"的关键设计。"
  ],
  "followUps": [
    {
      "question": "为什么要存原始快照而不直接清洗？",
      "answer": "清洗规则会迭代，存原版可免重复爬取，随时用新规则重放，节约带宽且可复现。"
    },
    {
      "question": "JS 渲染页怎么处理？",
      "answer": "用 headless 浏览器渲染后再存最终 HTML，或仅对重要源启用渲染以控成本。"
    }
  ],
  "followUpAnswers": [
    "清洗规则会迭代，存原版可免重复爬取，随时用新规则重放，节约带宽且可复现。",
    "用 headless 浏览器渲染后再存最终 HTML，或仅对重要源启用渲染以控成本。"
  ],
  "kind": "concept"
};
