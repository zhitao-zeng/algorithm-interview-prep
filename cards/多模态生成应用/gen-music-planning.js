export default {
  "id": "gen-music-planning",
  "category": "多模态生成应用",
  "difficulty": "Medium",
  "title": "音乐生成的两级规划：专辑与单曲蓝图",
  "prompt": "做专辑级音乐生成时，CollectionPlanner 与 TrackPlanner 两级规划分别负责什么，如何衔接？",
  "quickAnswer": "CollectionPlanner 在专辑级定主题、曲目数量与情绪曲线，输出每首的粗蓝图；TrackPlanner 接收单首蓝图细化 BPM、调式、段落结构与配器，二者通过蓝图数据结构衔接，保证整专连贯又各有辨识度。",
  "code": "from dataclasses import dataclass\nfrom typing import List\n\n@dataclass\nclass TrackBlueprint:\n    title: str\n    bpm: int\n    key: str\n    mood: str\n\nclass CollectionPlanner:\n    def __init__(self, theme: str):\n        self.theme = theme\n        self.tracks: List[TrackBlueprint] = []\n\n    def add_track(self, bp: TrackBlueprint):\n        self.tracks.append(bp)\n\n    def plan(self) -> 'TrackPlanner':\n        # 专辑级规划后, 把单首蓝图交给 TrackPlanner 细化\n        return TrackPlanner(self.tracks)\n\nclass TrackPlanner:\n    def __init__(self, tracks: List[TrackBlueprint]):\n        self.tracks = tracks\n\n    def blueprint(self, idx: int) -> TrackBlueprint:\n        return self.tracks[idx]\n",
  "complexity": "规划阶段 O(tracks)；生成阶段每首 O(steps)，整体 O(tracks·steps)",
  "beginnerSummary": "两级规划像先写歌单大纲（专辑基调），再给每首写分镜脚本（单曲细节），大纲管整体统一，分镜管每首好听。",
  "derivation": [
    "为什么需要：一次性生成整专容易风格漂移、曲目雷同，需要上层约束主题一致、下层保多样。",
    "怎么实现：CollectionPlanner 产出带主题/数量的曲目蓝图列表，TrackPlanner 逐首细化 BPM/调式/情绪并回写。",
    "有什么代价：两级带来额外编排逻辑与接口，蓝图字段不一致会断链；过度约束会牺牲即兴感。",
    "怎么评测：用整专风格聚类看连贯性，用曲间相似度看多样性，人工听审情绪曲线是否起伏自然。"
  ],
  "edgeCases": [
    "曲目数过多时情绪曲线需防止中段疲软，插入高能曲。",
    "相邻曲同调式易听感疲劳，需自动转调错开。",
    "蓝图字段缺失导致 TrackPlanner 取默认，风格跑偏。",
    "用户改专辑主题后需级联重规划，避免脏蓝图。"
  ],
  "pitfalls": [
    "把 TrackPlanner 当独立生成器用，丢掉专辑级约束导致听起来像拼盘。",
    "蓝图用可变对象共享，修改一首污染整专状态。"
  ],
  "prerequisites": [
    "音乐理论（BPM/调式/曲式）",
    "层次化生成与状态管理",
    "多样性与一致性度量"
  ],
  "workedExample": [
    "CollectionPlanner 规划 8 首夏日治愈专辑，情绪从舒缓到欢快再回落，输出 8 个 TrackBlueprint。",
    "TrackPlanner 把第 3 首定为 120 BPM、C 大调、轻快，生成后其风格聚类中离群度适中，既连贯又有辨识。"
  ],
  "lineByLine": [
    "@dataclass class TrackBlueprint：定义单曲蓝图字段。",
    "class CollectionPlanner：专辑级规划器，持有主题与曲目列表。",
    "def add_track：向专辑追加一首粗蓝图。",
    "def plan：把蓝图列表交给 TrackPlanner 细化。",
    "class TrackPlanner：接收曲目蓝图做单首细化。",
    "def blueprint：按索引返回细化后的单曲蓝图。"
  ],
  "followUps": [
    {
      "question": "两级规划相比端到端生成优势在哪？",
      "answer": "上层控连贯、下层保多样，且便于人工在蓝图层编辑，不必重训生成模型。"
    },
    {
      "question": "如何让曲间不过于相似？",
      "answer": "在 CollectionPlanner 层对相邻蓝图做调式/BPM 约束错开，并用 Jaccard 比结构相似度超阈值则重采样。"
    },
    {
      "question": "蓝图用什么格式传递最稳？",
      "answer": "用不可变 dataclass/JSON Schema，TrackPlanner 只读不写回原对象，避免级联污染。"
    }
  ],
  "followUpAnswers": [
    "上层控连贯、下层保多样，且便于人工在蓝图层编辑，不必重训生成模型。",
    "在 CollectionPlanner 层对相邻蓝图做调式/BPM 约束错开，并用 Jaccard 比结构相似度超阈值则重采样。",
    "用不可变 dataclass/JSON Schema，TrackPlanner 只读不写回原对象，避免级联污染。"
  ],
  "explanationFocus": "是什么：两级音乐规划把生成拆成专辑层（CollectionPlanner 定主题与曲目蓝图）与单曲层（TrackPlanner 细化 BPM/调式/段落），用蓝图数据结构衔接。",
  "approach": "先由上向下产出约束性蓝图保证整专连贯，再由下向上细化每首细节保证辨识度，通过不可变蓝图在两级间安全传参。",
  "kind": "concept"
};
