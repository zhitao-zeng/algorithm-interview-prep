export default {
  "id": "ma-phone-agent",
  "category": "多模态Agent",
  "difficulty": "Medium",
  "title": "手机操作Agent",
  "prompt": "手机操作 Agent 和桌面 GUI Agent 相比，有哪些独有的挑战与设计要点？",
  "quickAnswer": "手机 Agent 面对小屏、触控手势、系统返回栈与通知干扰，比桌面更碎、状态更易跳变。设计上更依赖\"界面语义+动作空间离散化(点/滑/输/回)\"、以及用世界模型预判滑动后的页面，才能在有限上下文里稳定完成多步任务。",
  "approach": "把动作空间规范为有限集合{tap, swipe, type, back, home}，用 VLM 从截图抽取可点元素与语义，结合页面栈状态做规划，并对返回/通知做特殊处理。",
  "explanationFocus": "是什么：手机操作 Agent 是在移动端 OS 上以截图/UI 树为观测、以触控动作为手段的多模态智能体，专用于在 App 内自动完成任务。",
  "bruteForce": "录制固定手势脚本(如固定坐标 swipe)，换机型/换页面就失灵，无法应对动态列表与弹窗。",
  "invariant": "页面栈深度与关键页面标识构成可恢复的状态，Agent 在任何一步都应能通过 back/home 回到已知锚点，保证任务可重入。",
  "walkthrough": "以\"在购物 App 下单一杯奶茶\"为例：截图 1080×2400，VLM 定位\"搜索\"tap(540,220)→输入\"奶茶\"→在结果列表 tap 第 1 项(360,800)→tap\"下单\"(900,2200)；中途弹通知，Agent 用 back 退回商品页，共 9 步约 25s 完成下单。",
  "code": "def phone_act(vlm, shot, page_stack, goal):\n    act = vlm.predict(shot, goal, page_stack)   # 离散动作之一\n    if act['type'] == 'back':\n        page_stack.pop()                        # 维护页面栈\n    else:\n        page_stack.append(act)\n    return act, page_stack",
  "complexity": "每步 VLM 前向 O(model)；页面栈维护 O(1)，最多保存数十层；任务 K 步总耗时 ≈ K×单步，与 App 规模无关。",
  "beginnerSummary": "像让一个只会戳屏幕的手指替你点外卖：它看屏幕找\"搜索\"、打字、点商品，遇到弹窗就按返回继续，直到下单成功。",
  "diagram": "[手机截图] -> [VLM 抽取元素] -> 离散动作\n                 ^                |  (tap/swipe/type/back)\n           目标+页面栈 <------ [执行+截图]",
  "derivation": [
    "为什么需要：手机功能繁多且无统一 API，用户希望\"说一句就办好\"，需自动触控操作。",
    "怎么实现：VLM 从截图抽可点元素，动作空间离散化，配页面栈做可重入规划。",
    "有什么代价：小屏信息密度高易误点，通知/弹窗打断状态，上下文窗口受限。",
    "怎么评测：任务成功率、平均步数、对中断(通知/弹窗)的恢复能力。"
  ],
  "edgeCases": [
    "来电/通知打断，页面跳转，Agent 需 back 回锚点。",
    "长列表需多次 swipe 才能见到目标，容易滑过头。",
    "不同分辨率/字体下元素坐标相对位置变化，绝对坐标失效。"
  ],
  "pitfalls": [
    "不维护页面栈，遇到弹窗就迷失，无法回到任务上下文。",
    "在输入法弹出的脆弱状态下误点，把文字打进错误框。"
  ],
  "prerequisites": [
    "移动端 UI 语义(视图层级)",
    "VLM 视觉定位",
    "栈/状态机式的任务规划"
  ],
  "workedExample": [
    "截图显示搜索框在 (540,220)，VLM 输出 tap(540,220) 并输入\"奶茶\"。",
    "结果页第 1 项在 (360,800)，tap 后中途弹通知，用 back 退回商品页继续下单，9 步完成。"
  ],
  "lineByLine": [
    "vlm.predict 综合截图、目标与页面栈，输出四种离散动作之一。",
    "遇到 back 时 page_stack.pop() 回退一层，保持状态可恢复。",
    "其他动作 push 进栈，供后续判断\"是否已在该页面\"做去重。"
  ],
  "codeNotes": [
    "页面栈是手机 Agent 的稳定锚，比纯历史文本更省 token 且利于循环检测。"
  ],
  "followUps": [
    {
      "question": "为什么手机 Agent 更依赖页面栈而不是全文历史？",
      "answer": "手机屏小、上下文贵，页面栈用极少信息表达\"我在哪\"，既能去重又能从中断恢复，比堆截图历史高效。"
    },
    {
      "question": "swipe 这种连续动作怎么离散化？",
      "answer": "常规范为固定方向+比例(如上滑 1/3 屏)，或让 VLM 输出起止坐标，再映射成系统手势事件。"
    }
  ],
  "followUpAnswers": [
    "手机屏小、上下文贵，页面栈用极少信息表达\"我在哪\"，既能去重又能从中断恢复，比堆截图历史高效。",
    "常规范为固定方向+比例(如上滑 1/3 屏)，或让 VLM 输出起止坐标，再映射成系统手势事件。"
  ],
  "kind": "concept"
};
