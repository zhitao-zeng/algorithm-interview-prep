export default {
  "id": "ml-feature-eng",
  "category": "因果推断与树模型",
  "difficulty": "Medium",
  "title": "特征工程与数据链路（Python/SQL/Snowflake，处理效率 +40%）",
  "prompt": "如何在 Snowflake + Python 数据链路上做特征工程，使批量特征处理效率提升 40% 并保证特征可复现？",
  "quickAnswer": "链路分三层：SQL/Snowflake 做聚合与窗口特征下沉到仓库减少传输，Python 做轻量变换与目标编码，并用特征字典与版本化视图保证可复现。关键是用 Snowflake 的物化视图/结果缓存做预聚合、用批量向量化 pandas 替代逐行循环，从而整体吞吐 +40%。",
  "code": "import numpy as np\nimport pandas as pd\n\ndef build_features(df: pd.DataFrame) -> pd.DataFrame:\n    df = df.copy()\n    df[\"tenure_months\"] = (df[\"end_date\"] - df[\"start_date\"]).dt.days / 30.0\n    df[\"log_premium\"] = np.log1p(df[\"premium\"])\n    df[\"region_freq\"] = df.groupby(\"region\")[\"user_id\"].transform(\"count\")\n    df[\"avg_claim_by_region\"] = df.groupby(\"region\")[\"claim\"].transform(\"mean\")\n    return df.drop(columns=[\"start_date\", \"end_date\"])\n\n-- Snowflake SQL: 预聚合下沉，减少 Python 端计算\nCREATE OR REPLACE VIEW fct_user_features AS\nSELECT user_id, region,\n       COUNT(*) OVER (PARTITION BY region) AS region_freq,\n       AVG(claim) OVER (PARTITION BY region) AS avg_claim_by_region,\n       DATEDIFF('day', start_date, end_date) / 30.0 AS tenure_months\nFROM raw_policies;",
  "complexity": "时间 O(n) 向量化，空间 O(n)；SQL 端依赖仓库算力",
  "beginnerSummary": "特征工程像做饭备菜：尽量在仓库（大厨房）里把菜洗切好，只把半成品端到 Python（灶台）快速翻炒，比每道菜都从头在灶台处理快得多。",
  "derivation": [
    "为什么需要：原始日志海量且脏，逐行 Python 处理慢且易出错，需把重计算下沉到列式仓库并标准化。",
    "怎么实现：Snowflake 用窗口函数/物化视图做聚合下沉，Python 只做数值变换与编码，特征用字典与 Git 版本管理保证可复现。",
    "有什么代价：仓库计算有 credit 成本，视图过多易 stale，需调度刷新与血缘记录；复杂变换仍须在 Python 端。",
    "怎么评测：对比端到端耗时与特征一致性校验（哈希/行数对账），以 +40% 吞吐与目标分布漂移监控衡量成效。"
  ],
  "edgeCases": [
    "NULL 日期导致 tenure_months 为 NaN，需填充或剔除。",
    "高基数类别目标编码需做交叉验证防泄漏，避免训练集信息泄入。",
    "Snowflake 时区与本地不一致，窗口按天聚合会错位。",
    "增量更新时新地区 region_freq 为 1，需平滑避免极端值。"
  ],
  "pitfalls": [
    "在 Python 里逐行 apply 做聚合，放弃向量化导致慢数十倍。",
    "特征在训练/推断用不同 SQL 造成训练-服务偏斜（train-serving skew）。",
    "目标编码未做折叠（out-of-fold）引入泄漏，线上效果崩塌。"
  ],
  "prerequisites": [
    "SQL 聚合与窗口函数",
    "pandas 向量化与 groupby/transform",
    "训练-服务一致性（特征泄漏）概念"
  ],
  "workedExample": [
    "原链路在 Python 逐行算地区频次，1000 万行耗时 25 分钟。",
    "改写为 Snowflake 视图预聚合 + Python 仅做 log/premium 等轻变换，耗时降到 15 分钟（约 +40%）。",
    "特征字典登记字段含义与版本，离线重跑得到完全一致结果，保证可复现。"
  ],
  "lineByLine": [
    "import numpy/pandas：载入数值与表格库。",
    "df.copy()：避免修改入参原表。",
    "tenure_months：向量化算保单时长（月），替代逐行循环。",
    "log_premium=np.log1p：对右偏保费做 log1p 稳定模型。",
    "groupby(region).transform(count/mean)：在仓库思想下做地区级聚合特征。",
    "Snowflake VIEW：用窗口函数把聚合下沉到仓库，减少 Python 传输与计算。"
  ],
  "followUps": [
    {
      "question": "如何避免特征工程中的训练-服务偏斜（train-serving skew）？",
      "answer": "把同一套 SQL/Python 特征逻辑封装成共享函数或物化视图，训练与线上推断都调用同一入口，并用特征哈希对账两侧输出，定期做分布一致性校验。"
    },
    {
      "question": "目标编码怎么做才不泄漏？",
      "answer": "用 K 折或留一法（out-of-fold）计算编码：每条样本的地区均值来自排除自身的其他样本，或加平滑 (Σ+α·glob)/(n+α)，从根源阻断标签泄漏。"
    }
  ],
  "followUpAnswers": [
    "把同一套 SQL/Python 特征逻辑封装成共享函数或物化视图，训练与线上推断都调用同一入口，并用特征哈希对账两侧输出，定期做分布一致性校验。",
    "用 K 折或留一法（out-of-fold）计算编码：每条样本的地区均值来自排除自身的其他样本，或加平滑 (Σ+α·glob)/(n+α)，从根源阻断标签泄漏。"
  ],
  "explanationFocus": "是什么：特征工程是把原始日志转化为模型可学信号的过程，数据链路指从 Snowflake 仓库 SQL 预聚合到 Python 轻量变换的管线；核心是“重计算下沉仓库、轻变换留在 Python”，并以特征字典与版本化保证可复现。",
  "approach": "核心思路是用 Snowflake 窗口函数/物化视图把聚合特征在列式仓库算好减少传输，Python 仅做向量化数值变换与目标编码，配合特征版本管理与训练-服务一致性校验，使批处理效率提升约 40%。",
  "kind": "concept"
};
