#!/usr/bin/env python3
"""레퍼런스 영상 분석기 — 재는 것은 사람이 하지 않는다.

측정: 길이·해상도·fps / 컷 지점(임계값 2단) / 컨택트시트 / 대표 색 / 형식 자동 분류.
근거 수치와 분류 기준: runbooks/레퍼런스분석_절차.md

사용:
  python tools/analyze_video.py <영상경로> [--out <폴더>] [--grid 5x4]
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

# Windows 콘솔 기본 인코딩(cp949)은 "—", "▶" 를 못 찍고 죽는다. 출력 인코딩을 먼저 고정한다.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, OSError):
        pass

# 형식 분류 임계값 (runbooks/레퍼런스분석_절차.md §3 와 같은 값)
CUTS_PER_MIN_EXPLAINER = 20  # 이 이상이면 설명형
CUTS_PER_MIN_DEMO = 0.5  # 이 이상이면 시연·서사형
SHOWCASE_MAX_SEC = 12  # 이하 + 컷 0 이면 전시형


def run(args: list[str]) -> str:
    r = subprocess.run(args, capture_output=True, text=True, encoding="utf-8", errors="replace")
    return (r.stdout or "") + (r.stderr or "")


def probe(path: Path) -> dict:
    out = run(["ffprobe", "-v", "error", "-show_entries",
               "format=duration:stream=codec_type,width,height,r_frame_rate",
               "-of", "json", str(path)])
    data = json.loads(out)
    v = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), {})
    num, _, den = (v.get("r_frame_rate") or "0/1").partition("/")
    fps = round(float(num) / float(den or 1), 2) if float(den or 1) else 0.0
    return {
        "duration": float(data.get("format", {}).get("duration", 0)),
        "width": v.get("width"),
        "height": v.get("height"),
        "fps": fps,
        "has_audio": any(s.get("codec_type") == "audio" for s in data.get("streams", [])),
    }


def cuts(path: Path, threshold: float) -> list[float]:
    out = run(["ffmpeg", "-v", "info", "-i", str(path), "-vf",
               f"select='gt(scene,{threshold})',showinfo", "-an", "-f", "null", "-"])
    return [round(float(t.split(":")[1]), 2) for t in out.split() if t.startswith("pts_time:")]


def sheets(path: Path, out_dir: Path, grid: str, every: float) -> list[str]:
    out_dir.mkdir(parents=True, exist_ok=True)
    pattern = str(out_dir / "sheet_%02d.jpg")
    run(["ffmpeg", "-v", "error", "-y", "-i", str(path), "-vf",
         f"fps=1/{every},scale=320:-1,tile={grid}", pattern])
    return sorted(p.name for p in out_dir.glob("sheet_*.jpg"))


def sample_color(path: Path, t: float, crop: str) -> str:
    r = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t), "-i", str(path), "-frames:v", "1",
                        "-vf", f"crop={crop},scale=1:1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                       capture_output=True)
    b = r.stdout[:3]
    return "#%02X%02X%02X" % tuple(b) if len(b) == 3 else "?"


def classify(info: dict, n_cuts: int) -> tuple[str, str]:
    dur = info["duration"] or 1
    per_min = n_cuts / (dur / 60)
    if n_cuts == 0 and dur <= SHOWCASE_MAX_SEC:
        return "전시형", f"컷 0회 + {dur:.1f}초(≤{SHOWCASE_MAX_SEC}초) — 보여주기만 하는 루프"
    if per_min >= CUTS_PER_MIN_EXPLAINER:
        return "설명형", f"분당 컷 {per_min:.1f}회(≥{CUTS_PER_MIN_EXPLAINER}) — 말이 끌고 가는 영상"
    if per_min >= CUTS_PER_MIN_DEMO:
        return "시연형 또는 서사형", f"분당 컷 {per_min:.1f}회 — 자막·구조를 더 봐야 갈린다"
    return "전시형 계열", f"분당 컷 {per_min:.1f}회, {dur:.1f}초 — 화면 유지형"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--out", default=None, help="컨택트시트 저장 폴더 (기본: 영상 옆 <이름>_분석/)")
    ap.add_argument("--grid", default="5x4")
    ap.add_argument("--every", type=float, default=0, help="시트 간격(초). 0이면 길이에 맞춰 자동")
    a = ap.parse_args()

    path = Path(a.video)
    if not path.exists():
        print(f"파일 없음: {path}", file=sys.stderr)
        return 1

    info = probe(path)
    dur = info["duration"]
    every = a.every or (0.3 if dur <= 15 else 1.0)
    out_dir = Path(a.out) if a.out else path.with_name(path.stem + "_분석")

    hard = cuts(path, 0.25)
    soft = cuts(path, 0.03)
    made = sheets(path, out_dir, a.grid, every)
    mid = dur / 2
    colors = {
        "좌상단": sample_color(path, mid, "60:60:30:30"),
        "중앙": sample_color(path, mid, "60:60:in_w/2-30:in_h/2-30"),
        "하단중앙": sample_color(path, mid, "60:60:in_w/2-30:in_h*0.8"),
    }
    kind, why = classify(info, len(hard))

    print(f"\n── {path.name}")
    print(f"길이 {dur:.2f}초 · {info['width']}×{info['height']} · {info['fps']}fps · 오디오 {'있음' if info['has_audio'] else '없음'}")
    print(f"컷(0.25) {len(hard)}회: {hard[:12]}{' …' if len(hard) > 12 else ''}")
    print(f"변화(0.03) {len(soft)}회: {soft[:12]}{' …' if len(soft) > 12 else ''}")
    if hard:
        gaps = [round(b - a_, 2) for a_, b in zip(hard, hard[1:])]
        if gaps:
            print(f"컷 간격 평균 {sum(gaps)/len(gaps):.2f}초 · 최단 {min(gaps)}초 · 최장 {max(gaps)}초")
    print("대표 색: " + ", ".join(f"{k} {v}" for k, v in colors.items()))
    print(f"컨택트시트 {len(made)}장 → {out_dir} ({every}초 간격)")
    print(f"\n▶ 추정 형식: {kind} — {why}")
    print("  다음: runbooks/레퍼런스분석_절차.md §4 대로 레이아웃·모티프를 재고 factsheets/ 에 기록한다.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
