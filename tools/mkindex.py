#!/usr/bin/env python3
"""INDEX.md 생성기.

- tools/index_seed.tsv (경로<TAB>분류<TAB>제목<TAB>한줄요약<TAB>키워드) 를 우선 사용
- seed 에 없는 문서는 내용에서 제목(첫 # 헤더)과 요약('> 요약:' 줄 또는 첫 문단)을 자동 추출
- 분류별로 묶어 경로·요약·키워드 3열 표로 출력. 색인은 이것 하나만 유지한다.

사용: python tools/mkindex.py [--check]
  --check : INDEX.md 가 최신이 아니면 exit 1 (CI/훅용)
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEED = ROOT / "tools" / "index_seed.tsv"
OUT = ROOT / "INDEX.md"

# 분류 순서 = INDEX.md 섹션 순서
CATEGORIES = ["root", "runbooks", "factsheets", "labs", "engine", "previews", "tools"]
CATEGORY_TITLE = {
    "root": "루트 문서",
    "runbooks": "runbooks — 확정 절차",
    "factsheets": "factsheets — 사실·수치·출처",
    "labs": "labs — 날짜별 실험 로그",
    "engine": "engine — 실행 코드",
    "previews": "previews — 유형 미리보기 페이지",
    "tools": "tools — 색인·패키징",
}
DOC_EXT = {".md", ".txt"}
# engine 은 코드가 많으므로 색인 대상을 명시적으로 제한한다
ENGINE_GLOBS = ["README.md", "public/README.md", "public/screens/README.md", "specs/*.json", "src/*.ts", "src/*.tsx", "src/spec/*.ts",
                "src/scenes/*.tsx", "src/scenes/*.ts", "src/components/*.tsx", "scripts/*.ts"]
SKIP_DIRS = {"node_modules", ".git", "out", ".bkit", "__pycache__", "public"}


def load_seed() -> dict[str, dict]:
    seed: dict[str, dict] = {}
    if not SEED.exists():
        return seed
    for n, line in enumerate(SEED.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip() or line.startswith("#"):
            continue
        cols = line.split("\t")
        if len(cols) != 5:
            print(f"[mkindex] seed {n}행: 5열이 아님({len(cols)}열) — 건너뜀", file=sys.stderr)
            continue
        path, cat, title, summary, keywords = (c.strip() for c in cols)
        seed[path] = dict(cat=cat, title=title, summary=summary, keywords=keywords)
    return seed


def extract(path: Path) -> tuple[str, str]:
    """(제목, 요약) 자동 추출."""
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.stem, ""
    title, summary = path.stem, ""
    lines = text.splitlines()
    for ln in lines:
        m = re.match(r"^#\s+(.+)", ln)
        if m:
            title = m.group(1).strip()
            break
    for ln in lines:
        m = re.match(r"^\s*(?:>|//|\*|#)?\s*요약\s*[:：]\s*(.+)", ln)
        if m:
            summary = m.group(1).strip()
            break
    if not summary:
        for ln in lines:
            s = ln.strip()
            if s and not s.startswith(("#", "```", "|", "---", "import ", "//", "/*", "{")):
                summary = s
                break
    return title, summary[:160]


def collect_files() -> list[tuple[str, str]]:
    """(상대경로, 분류) 목록."""
    files: list[tuple[str, str]] = []
    for p in sorted(ROOT.glob("*.md")):
        if p.name != "INDEX.md":
            files.append((p.name, "root"))
    for cat in ("runbooks", "factsheets", "labs", "previews", "tools"):
        base = ROOT / cat
        if not base.exists():
            continue
        for p in sorted(base.rglob("*")):
            if p.is_file() and not (set(p.relative_to(ROOT).parts) & SKIP_DIRS):
                if p.suffix in DOC_EXT or cat in ("tools", "previews"):
                    files.append((p.relative_to(ROOT).as_posix(), cat))
    engine = ROOT / "engine"
    if engine.exists():
        seen: set[str] = set()
        for g in ENGINE_GLOBS:
            for p in sorted(engine.glob(g)):
                rel = p.relative_to(ROOT).as_posix()
                if rel not in seen:
                    seen.add(rel)
                    files.append((rel, "engine"))
    return files


def esc(s: str) -> str:
    return s.replace("|", "\\|").replace("\n", " ")


def build() -> str:
    seed = load_seed()
    rows: dict[str, list[tuple[str, str, str, str]]] = {c: [] for c in CATEGORIES}
    missing_kw: list[str] = []
    present = set()
    for rel, cat in collect_files():
        present.add(rel)
        s = seed.get(rel)
        title, summary = extract(ROOT / rel)
        if s:
            cat = s["cat"] if s["cat"] in rows else cat
            title = s["title"] or title
            summary = s["summary"] or summary
            keywords = s["keywords"]
        else:
            keywords = ""
            missing_kw.append(rel)
        rows[cat].append((rel, title, summary, keywords))

    stale = sorted(set(seed) - present)
    total = sum(len(v) for v in rows.values())
    out = [
        "# INDEX — 전 문서 색인",
        "",
        "> 요약: 이 레포의 모든 문서·핵심 코드의 경로·요약·키워드. **자동 생성 파일 — 직접 고치지 말고** "
        "`tools/index_seed.tsv` 를 고친 뒤 `python tools/mkindex.py` 실행.",
        "",
        f"총 {total}행. 찾는 법: 이 파일에서 요청 단어(한글·영문·스크립트명)로 검색 → 경로를 연다. "
        "없으면 KNOWN-GAPS.md.",
        "",
    ]
    for cat in CATEGORIES:
        if not rows[cat]:
            continue
        out += [f"## {CATEGORY_TITLE[cat]}", "", "| 경로 | 요약 (무엇 / 언제 여나) | 키워드 |", "|---|---|---|"]
        for rel, title, summary, kw in rows[cat]:
            label = f"**{esc(title)}** — {esc(summary)}" if summary else f"**{esc(title)}**"
            out.append(f"| [{rel}]({rel}) | {label} | {esc(kw) or '⚠ 키워드 없음'} |")
        out.append("")
    if missing_kw or stale:
        out += ["## 색인 건강 상태", ""]
        if missing_kw:
            out.append(f"- ⚠ seed 에 키워드가 없는 파일 {len(missing_kw)}개: " + ", ".join(f"`{m}`" for m in missing_kw))
        if stale:
            out.append(f"- ⚠ seed 에 있으나 실제로 없는 경로 {len(stale)}개: " + ", ".join(f"`{m}`" for m in stale))
        out.append("")
    return "\n".join(out)


def main() -> int:
    text = build()
    if "--check" in sys.argv:
        cur = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
        if cur != text:
            print("[mkindex] INDEX.md 가 최신이 아님 — python tools/mkindex.py 실행", file=sys.stderr)
            return 1
        return 0
    OUT.write_text(text, encoding="utf-8", newline="\n")
    print(f"[mkindex] INDEX.md updated: {text.count(chr(10) + '| [')} rows")
    return 0


if __name__ == "__main__":
    sys.exit(main())
