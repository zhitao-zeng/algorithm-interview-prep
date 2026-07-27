export default {
  "id": "mmd-ocr-doc",
  "kind": "concept",
  "category": "多模态模型",
  "title": "文档与图表多模态理解",
  "difficulty": "Medium",
  "prompt": "OCR-free 文档多模态模型如何直接理解扫描件、图表和表格？版面结构与视觉特征在其中起什么作用？",
  "quickAnswer": "OCR-free 模型把文档整页作为图像输入，用高分辨率 VIT 编码后再由 LLM 直接回答，无需先做 OCR 文字框识别。关键是保留版面（行列、表格线、图表轴）的视觉结构：通过高分辨 patch、坐标感知注意力与结构化输出（HTML/Markdown 表格）还原语义。",
  "code": "def doc_to_tokens(page_image, encoder, max_res=1024):\n    image = resize_keep_aspect(page_image, max_res)   # 高分辨率保版面\n    patches = split_to_patches(image, patch_size=16)  # 细粒度切块\n    tokens = encoder(patches)                          # 视觉 token\n    return tokens                                      # 直接进 LLM, 无需 OCR",
  "complexity": "O((H·W)/P²·D)",
  "beginnerSummary": "传统方法读文档先框出每个字（OCR）再理解，容易在复杂排版下出错。OCR-free 模型把整页文档当一张图直接“看”，像人一样连版面带文字一起读懂，特别适合表格、图表这类结构复杂的内容。",
  "explanationFocus": "是什么：文档/图表多模态理解指让模型直接以扫描件、PDF、图表、表格的页面图像为输入，联合建模文字与版面/视觉结构，完成问答、抽取与结构化输出，且尽量不依赖独立 OCR 前置。",
  "approach": "用高分辨率 VIT 切细 patch 保留版面细节，必要时加坐标/2D 位置编码；LLM 在视觉 token 上做理解；结构化输出用 HTML/Markdown 表格还原；图表理解额外建模轴线、图例与数据点映射。",
  "derivation": [
    "为什么需要：OCR 流水线在复杂版面、手写、图表上易错且割裂文字与结构。",
    "怎么实现：高分辨率整页编码 + 坐标感知注意力 + 结构化输出，端到端联合训练。",
    "有什么代价：高分辨率导致 token 数巨大、显存高；长文档需分块与拼接。",
    "怎么评测：DocVQA、ChartQA、TableVQA 等以答案准确率评测。"
  ],
  "edgeCases": [
    "多栏排版文字顺序错乱，需版面感知重排。",
    "表格跨页断裂，结构还原失败。",
    "图表无坐标轴线，数据点难以映射。",
    "扫描倾斜/噪点导致字符混淆。"
  ],
  "pitfalls": [
    "直接用低分辨率 VIT，文字过小不可辨，等价于“瞎读”。",
    "输出纯文本忽略结构，表格语义丢失。"
  ],
  "prerequisites": [
    "高分辨率视觉编码与位置感知",
    "结构化输出（HTML/Markdown 表格）"
  ],
  "workedExample": [
    "DocVQA：把扫描文档整页输入，直接回答“合同金额是多少”，无需先 OCR。",
    "ChartQA：模型读柱状图 axes 与柱高，回答“哪一季度最高”。"
  ],
  "lineByLine": [
    "resize_keep_aspect 在高分辨率下保持版面比例，避免文字压缩失真。",
    "split_to_patches 把整页细切，使 LLM 能逐区域读取文字与表格线等结构。"
  ],
  "followUps": [
    {
      "question": "完全 OCR-free 和“OCR+LLM”哪种更好？",
      "answer": "OCR-free 端到端更强于版依赖与鲁棒性，但训练数据贵；实践中常混合：用 OCR 提供文本线索作辅助输入，模型再结合视觉版面做最终判断，兼顾准确与结构。"
    },
    {
      "question": "长文档超过上下文怎么办？",
      "answer": "采用分块编码+检索（RAG）只取相关页，或层次化：先页面级摘要再细读；也可做 token 压缩与跨页状态记忆。"
    }
  ],
  "followUpAnswers": [
    "OCR-free 端到端更强于版依赖与鲁棒性，但训练数据贵；实践中常混合：用 OCR 提供文本线索作辅助输入，模型再结合视觉版面做最终判断，兼顾准确与结构。",
    "采用分块编码+检索（RAG）只取相关页，或层次化：先页面级摘要再细读；也可做 token 压缩与跨页状态记忆。"
  ]
};
