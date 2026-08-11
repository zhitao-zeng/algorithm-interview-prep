export default {
  "id": "ocr-direction-cls",
  "category": "OCR 文字检测与识别",
  "difficulty": "Easy",
  "title": "方向分类与旋转文本处理",
  "prompt": "OCR 中如何做文本方向分类，旋转或倒置文本应在流水线哪一步校正？",
  "quickAnswer": "用轻量分类器(如浅 CNN)判定文本为 0/90/180/270 度，在送识别前按判定角度旋转归正，避免识别器因方向错乱而读错。",
  "code": "import cv2\nimport numpy as np\n\nDIRECTION_ANGLES = {0: 0, 1: 90, 2: 180, 3: 270}\n\ndef correct_orientation(img, direction_cls):\n    \"\"\"按方向分类结果旋转图像到正向\"\"\"\n    angle = DIRECTION_ANGLES[int(direction_cls(img))]\n    if angle == 0:\n        return img\n    h, w = img.shape[:2]\n    dsize = (h, w) if angle in (90, 270) else (w, h)  # 90/270° 旋转后宽高互换, 否则裁切内容\n    m = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0)\n    return cv2.warpAffine(img, m, dsize, flags=cv2.INTER_LINEAR)\n",
  "complexity": "时间 O(H·W)（旋转），空间 O(H·W)",
  "beginnerSummary": "就像先把倒过来的书转正再读。方向分类器先判断这页字是头朝哪，转正后识别器才不会把字读反。",
  "derivation": [
    "为什么需要：拍照/扫描常出现旋转或倒置文本，识别器通常只在正向训练，方向错误会直接导致整行读错。",
    "怎么实现：训练一个 4 类(0/90/180/270)轻量分类头，推理时输出角度，用仿射变换把图像转回正向再识别。",
    "有什么代价：增加一次前向与旋转开销；极端角度(如 45°)不在 4 类内会误判，需后处理兜底。",
    "怎么评测：在含旋转的样本上统计方向分类准确率，并看端到端识别率是否随校正提升。"
  ],
  "edgeCases": [
    "接近 45° 的斜拍文本",
    "近似正方形使旋转后裁切丢失信息",
    "空白或纯背景图误分类",
    "竖排中文被判为横排"
  ],
  "pitfalls": [
    "把方向分类放在识别之后导致已读错",
    "旋转插值引入模糊影响小字",
    "4 类假设忽略任意角度"
  ],
  "prerequisites": [
    "图像仿射变换",
    "图像分类基础",
    "OCR 流水线组织"
  ],
  "workedExample": [
    "一张倒置 180° 的店招先被分类为 2 类，旋转回正向后 CRNN 正确读出店名。",
    "90° 竖排标题若误判为 0°，识别器会把竖排当横排读成乱码，应优先走竖排分支。"
  ],
  "lineByLine": [
    "DIRECTION_ANGLES: 映射类别到旋转角度。",
    "def correct_orientation(img, direction_cls): 方向校正入口。",
    "direction_cls(img): 轻量分类器输出 0-3。",
    "cv2.warpAffine: 按角度仿射旋转回正向。"
  ],
  "followUps": [
    {
      "question": "为什么方向分类通常放在检测之后、识别之前？",
      "answer": "检测得到的单行/单词区域更规整、方向更单一，分类更准；在整图做方向分类会因多方向文本互相干扰而失效。"
    },
    {
      "question": "任意角度旋转文本怎么处理？",
      "answer": "可改用 STN(空间变换网络)或先做精细旋转角度回归(连续角度)，再配合检测多边形直接按框朝向送识别，避免硬分类。"
    }
  ],
  "followUpAnswers": [
    "检测得到的单行/单词区域更规整、方向更单一，分类更准；在整图做方向分类会因多方向文本互相干扰而失效。",
    "可改用 STN(空间变换网络)或先做精细旋转角度回归(连续角度)，再配合检测多边形直接按框朝向送识别，避免硬分类。"
  ],
  "invariant": "旋转后图像内容与原图一致仅做刚体变换，方向类别到角度的映射在循环前后保持 0/90/180/270 之一。",
  "walkthrough": "img 为 180° 倒置；direction_cls→类别2；DIRECTION_ANGLES[2]=180；getRotationMatrix2D 绕中心转 180°，warpAffine 输出正向图供识别。",
  "kind": "code"
};
