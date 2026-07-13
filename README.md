# BytePrep 算法面试题库

面向算法、模型手写和 ASR 面试的初学者学习页。每道题都按“通俗目标 → 前置概念 → 手动演练 → 推导 → 完整 Python → 逐行解释 → 复杂度 → 边界 → 追问答案”的顺序讲解。

## 使用方式

- 复习模式默认显示完整的深入讲解，适合补回基础知识。
- 模拟模式先隐藏答案，点击“揭晓下一步”逐段查看，并配有 45 分钟计时器。
- “已掌握”进度保存在浏览器本地，不上传个人数据。

## 本地运行

项目无构建依赖。可以直接用浏览器打开 `index.html`，或启动任意静态服务器：

```bash
python3 -m http.server 8000
```

然后打开 <http://localhost:8000/>。

运行测试：

```bash
npm test
```

## GitHub Pages

仓库已配置 GitHub Actions。将仓库 Pages 设置中的 **Source** 设为 **GitHub Actions** 后，推送到 `main` 或手动运行 `Deploy GitHub Pages` 工作流即可发布。

公开地址：<https://zhitao-zeng.github.io/algorithm-interview-prep/>
