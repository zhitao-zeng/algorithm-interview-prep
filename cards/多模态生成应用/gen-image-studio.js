export default {
  "id": "gen-image-studio",
  "category": "多模态生成应用",
  "difficulty": "Medium",
  "title": "多模型工作台架构：FastAPI + React + ComfyUI",
  "prompt": "多模型图像工作台（FastAPI + React + ComfyUI）应如何分层，才能同时服务算法实验与产品化？",
  "quickAnswer": "前端 React 负责交互与可视化，FastAPI 做鉴权、任务编排与统一 API，ComfyUI 作为生成执行后端；算法实验改工作流图即可上线，产品化通过同一 API 暴露，做到实验即生产。",
  "code": "from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass GenRequest(BaseModel):\n    model: str\n    prompt: str\n    ref_image: str | None = None\n\n@app.post('/generate')\ndef generate(req: GenRequest):\n    # 算法实验与产品化统一载体: 透传模型名给 ComfyUI 后端\n    return {'status': 'queued', 'model': req.model, 'prompt': req.prompt}\n",
  "complexity": "请求 O(1) 入队、生成 O(steps)，前端渲染 O(images)",
  "beginnerSummary": "工作台像一家照相馆：React 是前台点单屏，FastAPI 是店长调度，ComfyUI 是后厨相机；算法师调好参数前台就能直接卖。",
  "derivation": [
    "为什么需要：算法同学要快速试不同模型/工作流，产品要稳定 API，分离前后端与执行层可各司其职。",
    "怎么实现：React 发请求到 FastAPI，FastAPI 做校验与队列后调 ComfyUI API 生成，结果回传前端展示。",
    "有什么代价：三层带来部署与联调成本，ComfyUI 版本漂移会让实验结果难复现。",
    "怎么评测：用接口延迟、并发上限与实验到上线耗时衡量；同一请求在实验/生产环境结果一致即达标。"
  ],
  "edgeCases": [
    "大模型 OOM 时 FastAPI 需降级返回排队而非 500。",
    "前端传非预期模型名，后端要校验白名单防注入。",
    "ComfyUI 后端重启后队列丢失，需要持久化任务状态。",
    "参考图过大超出请求体限制需走对象存储。"
  ],
  "pitfalls": [
    "把生成逻辑写进 FastAPI 路由，导致和 ComfyUI 耦合难以替换。",
    "前后端共享一份工作流 JSON 但不同步版本，实验与生产结果对不上。"
  ],
  "prerequisites": [
    "REST API 与前后端分离",
    "ComfyUI API 与异步任务",
    "鉴权与任务队列"
  ],
  "workedExample": [
    "算法在 Studio 调好一个换脸工作流，保存为模板，产品前端直接以同 API 调用上线。",
    "压测下 FastAPI 把 200 并发请求排队，ComfyUI 顺序消费，P95 延迟稳定在 1.2s 内。"
  ],
  "lineByLine": [
    "from fastapi import FastAPI：引入 Web 框架。",
    "class GenRequest(BaseModel)：定义请求体的模型名/提示/参考图字段。",
    "@app.post('/generate')：暴露生成接口。",
    "def generate：校验请求并透传模型名给 ComfyUI 后端。",
    "return {...}：返回排队状态，交给异步执行。"
  ],
  "followUps": [
    {
      "question": "为什么不直接让前端调 ComfyUI？",
      "answer": "缺鉴权、队列与统一契约，且 ComfyUI 内部结构会变；FastAPI 做隔离层更稳更易治理。"
    },
    {
      "question": "实验与生产如何保证一致？",
      "answer": "工作流图与模型版本入版本库，API 按版本号加载，前端与算法共用同一份制品。"
    },
    {
      "question": "多模型怎么路由？",
      "answer": "在请求带 model 字段，FastAPI 映射到对应 ComfyUI 工作流与 GPU 池，避免互相抢占。"
    }
  ],
  "followUpAnswers": [
    "缺鉴权、队列与统一契约，且 ComfyUI 内部结构会变；FastAPI 做隔离层更稳更易治理。",
    "工作流图与模型版本入版本库，API 按版本号加载，前端与算法共用同一份制品。",
    "在请求带 model 字段，FastAPI 映射到对应 ComfyUI 工作流与 GPU 池，避免互相抢占。"
  ],
  "explanationFocus": "是什么：多模型图像工作台是以 FastAPI 为调度层、React 为交互层、ComfyUI 为生成执行层的系统，既是算法试错载体也是产品化出口。",
  "approach": "前后端分离并把生成能力收敛到 ComfyUI 后端，FastAPI 统一鉴权/队列/版本，使算法修改的工作流可一键作为生产 API 暴露。",
  "kind": "concept"
};
