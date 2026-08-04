export default {
  "id": "ma-a11y-agent",
  "category": "多模态Agent",
  "difficulty": "Medium",
  "title": "无障碍/UI 感知 Agent",
  "prompt": "为什么基于无障碍树（accessibility tree）的 UI 感知能提升多模态 Agent 的准确率与效率？",
  "quickAnswer": "无障碍树把屏幕上的控件以结构化、带语义标签的节点树暴露出来，Agent 无需从像素里猜按钮含义与坐标，直接拿到\"这是什么、可点吗、在哪\"的干净信息，从而更快更准地决策并降低视觉误读。",
  "approach": "把感知从\"看图猜\"升级为\"读树取语义\"：用无障碍树得到控件列表与层级，必要时再用截图补视觉细节，形成树为主、图为辅的混合感知。",
  "explanationFocus": "是什么：无障碍/UI 感知 Agent 是一类优先利用操作系统或浏览器提供的无障碍树（accessibility tree）来理解界面的多模态 Agent；无障碍树把界面元素组织成带角色、名称、状态与边界框的节点树，Agent 可直接读取结构化控件信息，再辅以截图做视觉确认，从而高效准确地操作界面。",
  "bruteForce": "纯像素方案要模型从截图中识别每个按钮并猜测其功能与坐标，遇到小字、伪装按钮或重叠元素极易读错，且每步重读全图很费 token。",
  "invariant": "无障碍树节点到屏幕可交互元素的映射一致，Agent 基于树选的动作在坐标解析后与真实控件对齐。",
  "walkthrough": "①读取无障碍树得到控件列表；②匹配指令到目标节点（如\"搜索框\"）；③取边界框转坐标；④执行点击/输入；⑤用树状态变化校验是否生效。",
  "complexity": "树解析与匹配约 O(节点数)，远小于全图视觉编码；但需把树坐标映射到屏幕，额外开销小，整体比纯视觉更省。",
  "beginnerSummary": "无障碍树就像界面的\"目录\"：不用盯图片猜哪个是按钮，直接告诉你\"这是个搜索框、可输入、在这儿\"，Agent 找起来又快又准。",
  "diagram": "[a11y tree] -> nodes(role,name,box)\n                   |\n            match to intent -> coords -> act\n                   ^                      |\n              screenshot (aux) <---- verify",
  "code": "def perceive(ui):\n    tree = ui.accessibility_tree()       # nodes with role/name/box\n    nodes = [n for n in tree if n.clickable or n.editable]\n    return nodes\n\ndef act_on(ui, nodes, intent):\n    target = match(nodes, intent)         # by role+name\n    ui.click(target.box.center)\n    return ui.accessibility_tree().changed",
  "derivation": [
    "为什么需要：纯视觉从像素猜控件既慢又易错，且浪费大量 token，需要更干净的结构化界面信息。",
    "怎么实现：读取系统/浏览器的无障碍树获得带语义的控件节点，匹配意图后取坐标执行，并以树状态变化校验。",
    "有什么代价：并非所有界面都提供完整无障碍树（如游戏 Canvas），此时需回退视觉；树与渲染有时不同步。",
    "怎么评测：对比纯视觉与树增强 Agent 在点击准确率、步数与 token 消耗上的差异，看效率与精度提升。"
  ],
  "edgeCases": [
    "Canvas/游戏界面无障碍树为空，必须回退到截图感知。",
    "树节点名称缺失或被合并，匹配意图失败需视觉兜底。",
    "树坐标与视觉渲染因缩放不一致，点击偏移需校正。"
  ],
  "pitfalls": [
    "完全依赖树忽略视觉，遇到未标注装饰性可点元素会漏掉。",
    "把树节点的可访问名当唯一键，重名控件会匹配错。"
  ],
  "prerequisites": [
    "操作系统/浏览器的无障碍 API",
    "界面控件的结构化表示与匹配"
  ],
  "workedExample": [
    "网页填表：从树直接定位各 input 的名称与类型，依次填写而非肉眼找框。",
    "设置调整：读树找到\"深色模式\"开关节点并切换，校验状态位变化。"
  ],
  "lineByLine": [
    "accessibility_tree 把界面转成语义节点，是省 token 的关键。",
    "match 用角色+名称对齐意图，比从图里猜更稳。",
    "changed 用树状态回读确认动作生效，形成闭环。"
  ],
  "codeNotes": [
    "只保留可交互节点作候选，大幅缩小匹配与决策空间。"
  ],
  "followUps": [
    {
      "question": "树和截图怎么融合最好？",
      "answer": "以树为主做决策、以截图补树缺失的视觉上下文，既保效率又补覆盖。"
    },
    {
      "question": "无障碍树不全怎么办？",
      "answer": "用视觉模型检测树外可点元素并反向补节点，或对整图做检测兜底。"
    }
  ],
  "followUpAnswers": [
    "以树为主做决策、以截图补树缺失的视觉上下文，既保效率又补覆盖。",
    "用视觉模型检测树外可点元素并反向补节点，或对整图做检测兜底。"
  ],
  "kind": "concept"
};
