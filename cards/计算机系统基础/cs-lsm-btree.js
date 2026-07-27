export default {
  "id": "cs-lsm-btree",
  "kind": "concept",
  "category": "计算机系统基础",
  "title": "存储结构：LSM-Tree 与 B+树",
  "difficulty": "Hard",
  "prompt": "写密集与读密集场景下分别适合 LSM-Tree 还是 B+树？请讲清读写放大、compaction 与适用取舍？",
  "quickAnswer": "B+树原地更新、点查快、读放大低，但随机写需大量随机 IO。LSM-Tree 把写先落内存再批量顺序刷成 SSTable，写吞吐高、写放大可控，但读可能跨多层（读放大），并靠 compaction 合并淘汰旧版本。写多读少选 LSM（如 RocksDB），读多改少选 B+树（如 InnoDB）。",
  "code": "def put(lsm, key, val):\n    lsm.memtable[key] = val          # 内存写，顺序落盘\n    if lsm.memtable.full():\n        lsm.flush_to_sstable()       # 生成 L0 SSTable\n        lsm.maybe_compact()          # 层级合并",
  "complexity": "写 O(1) 内存；compaction 摊还 O(写放大)",
  "beginnerSummary": "B+树像随时改动的字典，查得快但改写乱；LSM 像先记草稿再定期整理成册，写起来飞快，只是查的时候可能要翻好几本册子。",
  "explanationFocus": "是什么：LSM-Tree（日志结构合并树）以顺序写和后台合并换取高写吞吐；B+树以平衡多路索引支持高效原地更新与点查，二者代表存储引擎在读写放大上的不同取舍。",
  "approach": "核心思路：LSM 用内存 memtable + 多层不可变 SSTable + compaction 把随机写变顺序写；B+树用树高平衡的页结构让点查与范围扫描稳定；按读写比例选择。",
  "derivation": [
    "为什么需要：传统 B 树随机写造成大量随机 IO 与写放大，难以应对海量写入。",
    "怎么实现：LSM 写 memtable，溢写 SSTable，compact 合并同 key 多版本；B+树分裂/合并页维持平衡。",
    "有什么代价：LSM 读放大（查多层+布隆过滤）、空间放大（旧版本未清）；B+树写放大与随机 IO。",
    "怎么评测：比写吞吐、点查/范围查延迟、写放大与空间占用（如 RocksDB vs InnoDB 基准）。"
  ],
  "edgeCases": [
    "写放大在 compaction 不及时时暴涨，挤占 IO 与磁盘。",
    "LSM 读冷 key 需穿透多层并查布隆过滤器，尾延迟高。",
    "B+树页分裂导致写抖动与碎片化。"
  ],
  "pitfalls": [
    "以为 LSM 写快就无视 compaction 配置，导致磁盘被反复重写。",
    "用 LSM 做重读少写的元数据索引，反而比 B+树更慢。"
  ],
  "prerequisites": [
    "磁盘顺序 IO 与随机 IO 性能差异",
    "索引结构与树高对数复杂度"
  ],
  "workedExample": [
    "RocksDB 写 100 万 KV：先写内存，批量刷盘，compaction 合并 L0→L1 去重。",
    "InnoDB 主键点查：B+树三层即可定位，几乎无读放大。"
  ],
  "lineByLine": [
    "memtable[key]=val：写入内存有序结构，极快且为顺序落盘铺垫。",
    "if full：memtable 写满则冻结并转为 immutable。",
    "flush_to_sstable：将内存表顺序写成 L0 文件，避免随机写。",
    "maybe_compact：后台合并层间数据，清理过期版本、降低读放大。"
  ],
  "followUps": [
    {
      "question": "布隆过滤器在 LSM 中起什么作用？",
      "answer": "用极小空间判断某 key 是否\"可能存在于某层\"，避免对不存在的 key 做无谓的多层磁盘查找，显著降低读放大。"
    },
    {
      "question": "compaction 有哪些策略？",
      "answer": "常见 size-tiered（按大小合并，写放大低）与 leveled（分层、读放大低、写放大高），需在读写放大间权衡。"
    }
  ],
  "followUpAnswers": [
    "用极小空间判断某 key 是否\"可能存在于某层\"，避免对不存在的 key 做无谓的多层磁盘查找，显著降低读放大。",
    "常见 size-tiered（按大小合并，写放大低）与 leveled（分层、读放大低、写放大高），需在读写放大间权衡。"
  ],
  "order": 10
};
