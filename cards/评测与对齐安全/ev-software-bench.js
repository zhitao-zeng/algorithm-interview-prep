export default {
  "id": "ev-software-bench",
  "category": "评测与对齐安全",
  "difficulty": "Hard",
  "title": "代码与软件工程基准",
  "prompt": "像 SWE-bench 这样的软件工程基准，是如何把\"真实 GitHub issue\"变成可评测任务的？",
  "quickAnswer": "SWE-bench 抽取真实仓库里\"有对应 PR 修复的 issue\"，用历史提交构造环境，让模型生成 patch，再用该 PR 关联的测试能否通过来自动判分；它考察的是定位、修改与通过测试的综合工程能力。",
  "approach": "从\"任务构造、环境还原、补丁评测、指标\"四步说明：选有修复 PR 的 issue，回退到修复前状态，模型生成 diff，运行 FAIL_TO_PASS 与 PASS_TO_PASS 测试判定。",
  "explanationFocus": "是什么：软件工程基准（以 SWE-bench 为代表）用真实开源仓库的历史 issue 与修复 PR 构造任务，要求模型在还原的环境中产出能通过测试的补丁，评测端到端工程能力。",
  "bruteForce": "朴素做法是只做函数级代码补全并跑单元测试，但脱离了仓库上下文与多文件改动，无法反映真实工程里\"读懂仓库、定位问题、改对地方\"的能力。",
  "invariant": "评测必须在\"回退到修复前提交\"的干净环境中进行，且 PASS_TO_PASS 测试必须全部仍通过，否则补丁破坏了原有功能。",
  "walkthrough": "先锁定仓库与 base commit 并安装依赖；把 issue 描述作为模型输入；模型输出 patch 并 apply；运行 FAIL_TO_PASS 验证问题修复、PASS_TO_PASS 验证无回归；两者都过才算解决。",
  "complexity": "以仓库级环境执行为主：每个任务需拉仓库、装依赖、跑测试套件，单任务常耗时数分钟，全量评测需大规模 CI 与容器编排。",
  "beginnerSummary": "SWE-bench 就像给程序员派真实 bug 单：模型要读整个代码库、写出补丁，并且让原来失败的测试变绿、原来通过的测试不翻车。",
  "diagram": "issue + base commit\n        |\n   build env (deps)\n        |\n   model -> patch\n        |\n   run FAIL_TO_PASS + PASS_TO_PASS\n        |\n   resolved?",
  "code": "def swe_resolve(env, model, task):\n    patch = model.generate(task.issue, env.repo)\n    env.apply(patch)\n    f2p = env.run(task.fail_to_pass)\n    p2p = env.run(task.pass_to_pass)\n    return all(f2p) and all(p2p)",
  "derivation": [
    "为什么需要：传统代码题只考片段补全，测不出在大型仓库中定位与修改的真实工程能力。",
    "怎么实现：挑选\"有修复 PR 的 issue\"，回退到修复前提交构造环境，以 PR 关联测试作判据自动评分。",
    "有什么代价：环境构建与依赖安装昂贵且易失败；测试套件运行慢；数据需人工筛选保证可复现。",
    "怎么评测：以 FAIL_TO_PASS 通过且 PASS_TO_PASS 不退化为\"已解决\"指标，并细分各仓库成功率。"
  ],
  "edgeCases": [
    "依赖在特定系统版本才能装好，环境漂移会导致评测失败而非模型失败。",
    "测试本身有随机性，需固定随机种子与多次运行确认稳定。",
    "模型改动触发了未列入 PASS_TO_PASS 的隐藏回归，漏判。",
    "issue 描述信息不足，模型无法定位，属任务噪声。"
  ],
  "pitfalls": [
    "只用单文件 diff 近似 SWE 任务，严重低估真实工程难度。",
    "忽略 PASS_TO_PASS 回归，把\"修好一个测试却破一片\"误判为解决。"
  ],
  "prerequisites": [
    "理解 git diff、patch 与仓库提交历史的基本概念。",
    "了解持续集成中测试套件（单元/集成测试）的作用。"
  ],
  "workedExample": [
    "场景一：模型补丁让 3 个 FAIL_TO_PASS 变绿，但 1 个 PASS_TO_PASS 翻红，判为未解决。",
    "场景二：同一 issue 在 Python 3.9 环境通过、3.11 失败，定位为依赖版本问题而非模型问题。"
  ],
  "lineByLine": [
    "def swe_resolve(env, model, task): 定义解决单个 SWE 任务的函数。",
    "patch = model.generate(task.issue, env.repo) 模型基于 issue 与仓库生成补丁。",
    "env.apply(patch) 在环境中应用补丁。",
    "f2p = env.run(task.fail_to_pass) 运行原本失败的测试。",
    "p2p = env.run(task.pass_to_pass) 运行原应通过测试以防回归。",
    "return all(f2p) and all(p2p) 两者全过才视为解决。"
  ],
  "codeNotes": [
    "fail_to_pass 与 pass_to_pass 双集合是 SWE-bench 防\"假修复\"的核心判据设计。"
  ],
  "followUps": [
    {
      "question": "SWE-bench 的 FAIL_TO_PASS 和 PASS_TO_PASS 分别防什么？",
      "answer": "FAIL_TO_PASS 验证 issue 真被修复（原失败测试变绿），PASS_TO_PASS 验证补丁没有破坏其他原有功能，二者同时成立才算解决。"
    },
    {
      "question": "为什么 SWE 基准比函数补全更难？",
      "answer": "它要求跨多文件定位问题、理解仓库上下文并产出可集成补丁，且要在真实依赖环境中通过测试，远超孤立片段补全。"
    }
  ],
  "followUpAnswers": [
    "FAIL_TO_PASS 验证 issue 真被修复（原失败测试变绿），PASS_TO_PASS 验证补丁没有破坏其他原有功能，二者同时成立才算解决。",
    "它要求跨多文件定位问题、理解仓库上下文并产出可集成补丁，且要在真实依赖环境中通过测试，远超孤立片段补全。"
  ],
  "kind": "concept"
};
