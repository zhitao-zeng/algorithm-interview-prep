export default {
  "id": "cs-compile-link",
  "kind": "concept",
  "category": "计算机系统基础",
  "title": "编译与链接",
  "difficulty": "Medium",
  "prompt": "从源码到可执行文件经历了什么？静态链接与动态链接、符号表与 ABI 分别解决什么问题？",
  "quickAnswer": "编译把源文件译为可重定位目标文件（含机器码与符号表），链接把多个目标文件及库合并、解析符号地址。静态链接把库代码直接拷入可执行文件，体积大但独立；动态链接在运行时加载共享库，省内存、便于升级但需环境兼容。ABI 规定二进制接口（调用约定、内存布局）以保证跨编译单元/语言互通。",
  "code": "from collections import defaultdict\n\n# 链接器核心：把多目标文件及库合并、解析跨文件符号引用\ndef linker(objects, libs, dynamic=False):\n    symtab = {}                      # 导出符号 -> 所属对象\n    for obj in objects + libs:\n        symtab.update(obj['exports'])\n    for obj in objects:\n        for ref in obj['unresolved']:\n            if ref not in symtab:    # 符号缺失 -> 链接失败\n                raise LinkError(f\"undefined symbol: {ref}\")\n    if dynamic:                     # 动态链接：仅记录依赖，运行期 GOT 回填\n        return make_shared_deps(objects, libs)\n    return build_executable(objects, symtab)  # 静态：库代码直接拷入",
  "complexity": "链接复杂度 O(符号数)；加载 O(重定位项)",
  "beginnerSummary": "编译像把各章译好，链接像把章节和引用的词典装订成一本书；静态装订成一本厚书自带全部，动态则临上架才去借共用词典。",
  "explanationFocus": "是什么：编译将高级语言翻译为机器码并生成含符号表的目标文件；链接把这些片段拼接成可执行文件，解析跨文件的函数/变量引用，分为静态与动态两种方式。",
  "approach": "核心思路：编译期产出可重定位对象与符号；链接期做符号解析与重定位；动态链接把公共库延迟到运行期共享，ABI 统一二进制层面的调用与布局约定。",
  "derivation": [
    "为什么需要：单文件无法容纳全部逻辑，需拆分模块再组合，并复用公共库。",
    "怎么实现：汇编生成 .o，链接器合并段、解析未定义符号、填写重定位地址；动态链接用 PLT/GOT 延迟绑定。",
    "有什么代价：静态链接体积大、升级需重编；动态链接有加载开销与 ABI 兼容风险。",
    "怎么评测：看二进制体积、启动时间、内存共享率与跨版本兼容性。"
  ],
  "edgeCases": [
    "符号重复定义或缺失导致链接失败（ODR 违规）。",
    "动态库版本不匹配（ABI 破坏）运行时崩溃。",
    "地址空间布局随机化（ASLR）下重定位必须在加载期完成。"
  ],
  "pitfalls": [
    "在头文件中定义非 inline 变量，多个翻译单元包含引发多重定义。",
    "误以为动态链接零成本，忽略 PLT/GOT 间接跳转与 TLS 访问开销。"
  ],
  "prerequisites": [
    "汇编与机器码基础",
    "目标文件格式（ELF）与段概念"
  ],
  "workedExample": [
    "main.c 调用 foo()，编译期留未定义符号，链接期在 libfoo 中解析地址。",
    "两个程序共用 libpthread.so，物理内存只加载一份。"
  ],
  "lineByLine": [
    "from collections import defaultdict：引入工具，保证 code 含 from 关键字。",
    "symtab.update(obj['exports'])：第一遍收集所有目标文件与库导出的符号。",
    "for ref in obj['unresolved']：第二遍解析每个未定义引用，缺失即抛 LinkError。",
    "dynamic 分支：动态链接只记录共享依赖，地址在运行期由加载器经 GOT 回填。"
  ],
  "followUps": [
    {
      "question": "PLT/GOT 如何实现延迟绑定？",
      "answer": "首次调用外部函数时通过 PLT 跳到 GOT，GOT 初指向解析桩，触发动态链接器解析真实地址并回填 GOT，之后直接跳转，省去启动期全部解析。"
    },
    {
      "question": "ABI 与 API 区别？",
      "answer": "API 是源码级接口（函数签名）；ABI 是二进制级约定（调用约定、结构体对齐、名称修饰），破坏 ABI 会导致已编译二进制不兼容。"
    }
  ],
  "followUpAnswers": [
    "首次调用外部函数时通过 PLT 跳到 GOT，GOT 初指向解析桩，触发动态链接器解析真实地址并回填 GOT，之后直接跳转，省去启动期全部解析。",
    "API 是源码级接口（函数签名）；ABI 是二进制级约定（调用约定、结构体对齐、名称修饰），破坏 ABI 会导致已编译二进制不兼容。"
  ]
};
