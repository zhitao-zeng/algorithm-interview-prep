export default {
  "id": "gen-comfyui",
  "category": "多模态生成应用",
  "difficulty": "Medium",
  "title": "ComfyUI 工作流工程：队列、取消恢复与长视频拼接",
  "prompt": "用 ComfyUI 做工程化生成时，如何设计任务队列、取消恢复、历史追踪与长视频分段拼接？",
  "quickAnswer": "用队列管理异步任务并支持取消与从断点恢复，执行历史落盘便于追溯与复用，长视频按时间窗切段分别生成后再拼接；关键是把工作流图与中间 latent 持久化，使中断可续跑。",
  "code": "from collections import deque\nfrom typing import Callable, List\n\nclass WorkflowQueue:\n    def __init__(self):\n        self.tasks: deque = deque()\n        self.history: List[str] = []\n\n    def enqueue(self, job: Callable):\n        self.tasks.append(job)\n\n    def run(self):\n        while self.tasks:\n            job = self.tasks.popleft()\n            out = job()\n            self.history.append(out)\n\n    def resume(self, segments: List[str]) -> str:\n        # 长视频分段拼接, 失败可从历史续跑\n        return ''.join(segments)\n",
  "complexity": "队列 O(1) 入出、拼接 O(segments)，历史 O(N) 存储",
  "beginnerSummary": "ComfyUI 工程像工厂流水线：任务排队、可随时喊停并从断点接上，做过的活留档，长片先分段拍再拼成完整片。",
  "derivation": [
    "为什么需要：交互式单图不够，产品化要并发、可中断、可复现，长视频超出显存需分段。",
    "怎么实现：用 deque 维护任务队列，history 记录输出；取消时保存当前 latent，恢复时从断点续；长视频按段生成后拼接。",
    "有什么代价：持久化 latent 与历史占存储；队列调度不当会饿死长任务或抢占显存。",
    "怎么评测：压测并发吞吐与中断恢复成功率，长视频拼接处无跳变、帧率一致即为达标。"
  ],
  "edgeCases": [
    "取消发生在某段中间，恢复需从该段首帧 latent 而非整任务头。",
    "多参考图/视频/音频条件混用时图尺寸不一致导致节点报错。",
    "历史无限增长撑爆磁盘，需要滚动清理策略。",
    "拼接段间色彩/光照不一致出现可见接缝。"
  ],
  "pitfalls": [
    "只存最终图不存工作流图，恢复时无法复现参数。",
    "长视频不分段的拼接在显存峰值崩，误以为是模型问题。"
  ],
  "prerequisites": [
    "ComfyUI 节点图与 API 调度",
    "队列/异步任务与持久化",
    "视频编解码与拼接"
  ],
  "workedExample": [
    "提交 5 个参考图条件任务进队列，第 3 个跑到一半取消，恢复时从历史读 latent 续跑成功。",
    "一段 60s 视频按 10s 分段生成 6 段，拼接后检查接缝无跳变、帧率恒定 24fps。"
  ],
  "lineByLine": [
    "class WorkflowQueue：封装任务队列与历史。",
    "self.tasks=deque()：用双端队列存待跑任务。",
    "self.history=[]：记录已完成输出便于追溯。",
    "def enqueue：把 callable 任务入队。",
    "def run：循环取任务执行并写历史。",
    "def resume：接收分段列表拼接成长视频。",
    "return ''.join(segments)：按顺序合并分段。"
  ],
  "followUps": [
    {
      "question": "取消恢复为什么要存 latent 而不是只存图？",
      "answer": "图是解码后的像素，恢复要重编码且损质量；存 latent 可直接续扩散，省算力且无缝。"
    },
    {
      "question": "多条件（图/视频/音频）如何统一入图？",
      "answer": "分别走编码器节点映射到同维 latent 再 concat/相加，注意尺寸与帧率对齐，否则节点报 shape 错。"
    },
    {
      "question": "长视频分段怎么选窗口？",
      "answer": "按显存与运动连续性选 8–15s，段间留 1–2 帧重叠做交叉淡入，消除接缝。"
    }
  ],
  "followUpAnswers": [
    "图是解码后的像素，恢复要重编码且损质量；存 latent 可直接续扩散，省算力且无缝。",
    "分别走编码器节点映射到同维 latent 再 concat/相加，注意尺寸与帧率对齐，否则节点报 shape 错。",
    "按显存与运动连续性选 8–15s，段间留 1–2 帧重叠做交叉淡入，消除接缝。"
  ],
  "explanationFocus": "是什么：ComfyUI 工作流工程是把节点图生成能力产品化，涵盖参考图/视频/音频多条件、任务队列、取消恢复、历史追踪与长视频分段拼接等系统能力。",
  "approach": "用队列调度异步任务并把工作流图与中间 latent 持久化，支持取消后从断点恢复；长视频按时间窗分段生成再平滑拼接，历史落盘保证可复现。",
  "kind": "concept"
};
