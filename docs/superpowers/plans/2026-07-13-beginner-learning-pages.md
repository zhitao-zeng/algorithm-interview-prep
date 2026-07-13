# 初学者学习页与 GitHub Pages 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 为全部 60 道题提供初学者可读的完整解答，并自动部署静态站点到 GitHub Pages。

**架构：** `questions.js` 保存每题的完整学习内容；`quiz-core.js` 定义内容契约、校验及展示段落；`app.js` 仅负责状态与 DOM 渲染。Node 内置测试覆盖契约和展示顺序，GitHub Actions 将仓库根目录部署到 Pages。

**技术栈：** HTML、CSS、浏览器 ES Modules、Node.js 内置 `node:test`、GitHub Actions Pages。

---

## 文件结构

- 修改：`.gitignore` — 忽略本地视觉原型目录。
- 创建：`package.json` — 提供 `node --test` 脚本，不引入外部依赖。
- 修改：`questions.js` — 为 60 题补充初学者内容、完整 Python 函数和结构化追问。
- 修改：`quiz-core.js` — 生成学习段落、校验新内容契约。
- 修改：`app.js` — 渲染分步学习页、逐行解释及可展开追问；模拟模式按段揭晓。
- 修改：`styles.css` — 为概念卡、演练步骤、行级讲解与问答控件提供响应式样式。
- 创建：`tests/quiz-core.test.js` — 测试内容契约、章节顺序和全题库完整性。
- 创建：`.github/workflows/deploy-pages.yml` — 自动上传和部署 GitHub Pages。
- 创建：`README.md` — 说明本地预览、测试、学习方式与 Pages 地址。

### 任务 1：建立可重复的内容测试基线

**文件：**
- 创建：`package.json`
- 创建：`tests/quiz-core.test.js`
- 修改：`.gitignore`

- [ ] **步骤 1：添加测试入口与忽略规则**

```json
{
  "type": "module",
  "scripts": { "test": "node --test" }
}
```

在 `.gitignore` 加入：

```gitignore
.superpowers/
```

- [ ] **步骤 2：编写现有题库基线测试**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { questions } from '../questions.js';
import { validateQuestionCard } from '../quiz-core.js';

test('现有 60 道题均通过基础内容校验', () => {
  assert.equal(questions.length, 60);
  for (const question of questions) {
    assert.equal(validateQuestionCard(question).valid, true, question.title);
  }
});
```

- [ ] **步骤 3：运行测试确认通过**

运行：`npm test`

预期：PASS，输出 1 个通过测试且无失败。

- [ ] **步骤 4：提交测试基线**

```bash
git add .gitignore package.json tests/quiz-core.test.js
git commit -m "test: define beginner content contract"
```

### 任务 2：定义学习内容契约与渲染段落

**文件：**
- 修改：`quiz-core.js:30-103`
- 测试：`tests/quiz-core.test.js`

- [ ] **步骤 1：添加失败的问答结构与顺序测试**

```js
const beginnerFixture = {
  id: 'fixture', title: '样例', prompt: '样例题', quickAnswer: '答案',
  beginnerSummary: '从最小输入开始理解。', prerequisites: ['概念 A', '概念 B'],
  workedExample: ['先处理输入。', '再得到输出。'], derivation: ['发现规律。', '应用规律。'],
  code: 'def solve(items):\\n    return items',
  lineByLine: ['定义函数接收输入。', '返回计算结果。', '调用者获得输出。'],
  complexity: '时间 O(1)，空间 O(1)', edgeCases: ['空输入', '单个输入', '重复输入'],
  followUps: [{ question: '为什么这样做？', answer: '因为样例的目标是展示问答结构。' }, { question: '复杂度是多少？', answer: '这个最小样例为 O(1)。' }],
  pitfalls: ['遗漏边界', '误解输入'],
};

test('追问以问题和答案对象成对保存', () => {
  assert.equal(validateQuestionCard(beginnerFixture, { beginner: true }).valid, true);
  assert.ok(beginnerFixture.followUps.every(({ question: prompt, answer }) => prompt && answer));
});

test('快速模式保留代码和追问，深入模式添加学习步骤', () => {
  const quick = detailSections(beginnerFixture, 'quick').map(({ key }) => key);
  assert.deepEqual(quick, ['beginnerSummary', 'code', 'complexity', 'followUps', 'pitfalls']);
});
```

- [ ] **步骤 2：运行测试并确认失败**

运行：`npm test`

预期：FAIL，旧的 `followUps` 是字符串数组，且 `detailSections` 没有新章节。

- [ ] **步骤 3：实现内容契约**

在 `quiz-core.js` 中让 `detailSections` 返回以下数据类型：`text`、`concepts`、`steps`、`code`、`lineNotes`、`cards`、`qa`、`list`。扩展 `validateQuestionCard(card, { beginner = false } = {})`：始终校验既有字段；仅当 `beginner: true` 时再要求 `beginnerSummary` 是非空字符串，`prerequisites`、`workedExample`、`lineByLine` 为至少两项非空数组，`followUps` 为至少两项各有非空 `question`/`answer` 的对象。这样任务 1 的旧题库基线在内容迁移前仍保持通过。

```js
['followUps', '常见追问与答案', 'qa']
```

- [ ] **步骤 4：运行测试确认通过**

运行：`npm test`

预期：`npm test` 全部通过；既有题库基线继续使用默认校验，新样例使用 `beginner: true` 校验。

- [ ] **步骤 5：提交核心契约**

```bash
git add quiz-core.js tests/quiz-core.test.js
git commit -m "feat: add beginner learning content contract"
```

### 任务 3：将全部题目迁移为完整初学者解答

**文件：**
- 修改：`questions.js:1-221`
- 测试：`tests/quiz-core.test.js`

- [ ] **步骤 1：增加会失败的全题库质量测试**

```js
test('60 道题均提供完整 Python 函数和逐行说明', () => {
  assert.equal(questions.length, 60);
  for (const question of questions) {
    assert.equal(validateQuestionCard(question, { beginner: true }).valid, true, question.title);
    assert.match(question.code, /def |class |from |import /, question.title);
    assert.ok(question.lineByLine.length >= 3, question.title);
    assert.ok(question.workedExample.length >= 2, question.title);
  }
});
```

- [ ] **步骤 2：运行测试并确认失败**

运行：`npm test`

预期：FAIL，当前代码片段缺少完整函数签名、必要导入或逐行解释。

- [ ] **步骤 3：按分类撰写内容并修正代码**

按以下顺序迁移，每题都填入 `beginnerSummary`、`prerequisites`、`workedExample`、`derivation`、可执行风格的 `code`、`lineByLine`、至少两项 `{ question, answer }` 追问、边界和易错点：

1. 链表（9 题）：补全 `ListNode` 假设、无环保护和 dummy 节点解释。
2. 二叉树（7 题）：补全 `TreeNode`、空树基线和队列/递归返回值说明。
3. 数组/窗口、二分/TopK（11 题）：补全输入校验、边界索引及单调性说明。
4. 搜索/图、动态规划（14 题）：补全递归基线、访问状态恢复和状态转移含义。
5. 模型手写（14 题）：补全 NumPy/PyTorch 导入、张量形状及数值稳定性说明。
6. ASR 专项（5 题）：补全符号定义、blank 语义和对数域计算说明。

每个函数只引用同一代码块中声明、导入或显式注释为题设提供的对象。将旧的平行 `followUps`/`followUpAnswers` 替换为对象数组，例如：

```js
followUps: [{
  question: '为什么先保存 next？',
  answer: '把 cur.next 改为 prev 后，原来的后继边会断开；先保存 next 才能继续遍历余下链表。',
}]
```

- [ ] **步骤 4：运行测试确认通过**

运行：`npm test`

预期：所有全题库契约测试通过，输出 `pass` 且没有 `fail`。

- [ ] **步骤 5：提交完整题库**

```bash
git add questions.js tests/quiz-core.test.js
git commit -m "feat: expand beginner-friendly question explanations"
```

### 任务 4：实现分步学习与模拟模式揭晓

**文件：**
- 修改：`app.js:34-79`
- 修改：`styles.css`
- 测试：`tests/quiz-core.test.js`

- [ ] **步骤 1：添加失败的渲染数据测试**

```js
test('深入模式包含概念、演练、逐行说明和问答段落', () => {
  const types = detailSections(questions[0], 'deep').map(({ type }) => type);
  assert.deepEqual(types, ['text', 'concepts', 'steps', 'steps', 'code', 'lineNotes', 'text', 'cards', 'qa', 'list']);
});
```

- [ ] **步骤 2：运行测试并确认失败**

运行：`npm test`

预期：FAIL，`detailSections` 或渲染器尚未提供新段落类型。

- [ ] **步骤 3：实现 DOM 渲染与可访问交互**

在 `app.js` 增加 `conceptSection`、`lineNotesSection` 和 `qaSection`。`qaSection` 使用原生 `<details><summary>`，每个问题的答案置于其内容中。把“揭晓答案”状态改为 `revealedSections` 集合：模拟模式按学习顺序显示一个“继续下一步”按钮；复习模式始终展示所有段落。

```js
function qaSection(title, items) {
  const section = document.createElement('section');
  section.className = 'detail-section';
  section.append(document.createElement('h3')).textContent = title;
  for (const item of items) {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = item.question;
    const answer = document.createElement('p');
    answer.textContent = item.answer;
    details.append(summary, answer); section.append(details);
  }
  return section;
}
```

在 `styles.css` 为 `.concept-list`、`.line-notes`、`.worked-example` 和 `.detail-section details` 添加移动端单栏布局、清晰间距和键盘焦点样式。

- [ ] **步骤 4：运行测试和语法检查确认通过**

运行：`npm test && node --check app.js && node --check quiz-core.js && node --check questions.js`

预期：全部命令退出码为 0。

- [ ] **步骤 5：提交学习页交互**

```bash
git add app.js styles.css quiz-core.js tests/quiz-core.test.js
git commit -m "feat: render guided beginner learning path"
```

### 任务 5：配置 GitHub Pages 与项目说明

**文件：**
- 创建：`.github/workflows/deploy-pages.yml`
- 创建：`README.md`

- [ ] **步骤 1：添加会失败的工作流内容测试**

```js
import fs from 'node:fs';
test('Pages workflow deploys on main', () => {
  const workflow = fs.readFileSync('.github/workflows/deploy-pages.yml', 'utf8');
  assert.match(workflow, /actions\/deploy-pages/);
  assert.match(workflow, /main/);
});
```

- [ ] **步骤 2：运行测试并确认失败**

运行：`npm test`

预期：FAIL，`.github/workflows/deploy-pages.yml` 不存在。

- [ ] **步骤 3：添加 GitHub Pages 工作流与 README**

```yaml
name: Deploy GitHub Pages
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: '.' }
      - id: deployment
        uses: actions/deploy-pages@v4
```

README 说明：用浏览器直接打开 `index.html` 或使用任意静态文件服务器预览；运行 `npm test`；在仓库 Pages 设置中将 Source 选为 GitHub Actions；最终链接为 `https://zhitao-zeng.github.io/algorithm-interview-prep/`。

- [ ] **步骤 4：运行完整验证**

运行：`npm test && node --check app.js && node --check quiz-core.js && node --check questions.js && git status --short`

预期：测试和语法检查通过；状态只显示本任务待提交的 README 与工作流文件。

- [ ] **步骤 5：提交部署配置与说明**

```bash
git add .github/workflows/deploy-pages.yml README.md tests/quiz-core.test.js
git commit -m "ci: deploy static site to GitHub Pages"
```

## 最终验证

- [ ] 在本地 HTTP 静态服务器中打开 `index.html`，确认复习模式的所有学习段落和问答答案可读。
- [ ] 开始模拟模式，确认答案分段隐藏并可按顺序揭晓。
- [ ] 运行 `npm test` 与三个 `node --check` 命令。
- [ ] 推送 `main` 后在 Actions 中确认部署成功，并访问 Pages 地址。
