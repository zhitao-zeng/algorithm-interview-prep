export default {
  "kind": "concept",
  "id": "mm-hires",
  "category": "多模态模型",
  "difficulty": "Hard",
  "title": "高分辨率图像处理",
  "prompt": "多模态模型怎么在不让视觉 token 爆炸的前提下看清高分辨率图像？",
  "quickAnswer": "核心是\"动态分辨率/切图\"：把大图切成若干子图(每块按模型尺寸编码)得到局部 token，再配一张下采样的全局图保留整体，最后合并所有视觉 token 喂 LLM。这样既保留细节又不让单图 token 线性爆炸。代表如 LLaVA-NeXT/InternVL 的动态切片。代价是序列更长、需位置编排。",
  "approach": "全局下采样 + 局部切图编码 → 合并 token(带位置) → LLM。",
  "explanationFocus": "是什么：高分辨率处理是用\"全局缩略+局部切片\"的方式在可控 token 数下保留图像细节，避免直接整体编码导致 token 爆炸。",
  "bruteForce": "把整张高分辨率图直接切小 patch：token 数随像素平方暴涨。",
  "derivation": [
    "为什么需要：OCR/细粒度任务需看清细节，但整体高分辨率让 token 数 (H/p)(W/p) 爆增、算力 O(N^2) 失控。",
    "怎么实现：生成一张低分辨率全局图 + 把原图按网格切成 K 块各编码，给每块打空间位置，合并全部 token；动态按原图比例决定切片数。",
    "有什么代价：切片多 → token 仍涨、注意力贵；切片边界信息割裂需位置补偿；预处理更复杂。",
    "怎么评测：OCR/文档/细粒度基准 vs token 数与延迟的权衡。"
  ],
  "invariant": "同一高分辨率图按相同切片策略得到可复现的合并 token 集。",
  "walkthrough": "1344x1008 图：全局缩到 336 + 切 3x2=6 块各 336，共 7 组 × 576 ≈ 4032 token。",
  "edgeCases": [
    "极端长宽比：切片数需按边比例。",
    "切片边界物体被切断：需重叠或上下文。",
    "token 上限：需截断或再池化。"
  ],
  "code": "def dynamic_slice(img, tile=336, max_tiles=9):\n    global_img = resize(img, tile)\n    tiles = split_into_grid(img, tile, max_tiles)   # 按需网格\n    toks = [encode(global_img)] + [encode(t) for t in tiles]\n    return concat_with_pos(toks)                    # 带空间位置合并",
  "codeNotes": [
    "全局图保整体语义。",
    "切片数随原图比例动态调整。"
  ],
  "complexity": "token 数 ≈ (1+切片数)×(tile/p)^2，远小于整体直切。",
  "followUps": [
    {
      "question": "全局图和局部切片各解决什么？",
      "answer": "全局图给整体布局与上下文，局部切片补细节(OCR/小物体)，二者互补。"
    },
    {
      "question": "切片太多怎么办？",
      "answer": "设最大切片数上限，超限则提高 tile 或先做区域检测只编码关键区。"
    }
  ],
  "followUpAnswers": [
    "全局给上下文、切片补细节。",
    "设上限或只编码关键区。"
  ],
  "pitfalls": [
    "只看全局图丢失细节。",
    "无脑加切片导致 token/算力失控。"
  ],
  "beginnerSummary": "看清高清大图但不能把图拆成天文数字的小块。办法是\"先拍一张小全景照记住全貌，再把大图裁成几张标准小照片分别细看\"，最后把这些照片(带位置标签)一起交给大脑。这样既看得细又不至于信息多到炸。",
  "prerequisites": [
    "整体编码 token 随像素平方涨。",
    "细节任务需高分辨率。",
    "需位置编排合并切片。"
  ],
  "workedExample": [
    "全局 336 + 6 切片各 336。",
    "合并约 4032 token 喂 LLM。"
  ],
  "lineByLine": [
    "生成低分辨率全局图。",
    "按网格切局部图。",
    "各块独立编码。",
    "带位置合并后入 LLM。"
  ],
  "diagram": "高清图 ─┬─▶ 全局缩略(整体)\n              └─▶ 切 K 块(细节)\n      两路编码 ─▶ 合并(带位置) ─▶ LLM"
};
