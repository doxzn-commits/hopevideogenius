# -*- coding: utf-8 -*-
"""필름형 렌더 측정기. 팩트시트 §2 방식(180x320 회색조 인접 MAD)으로 합격 기준을 잰다.

사용: python tools/measure_film.py engine/out/<이름>.mp4 engine/specs/<이름>.json [--sheet 시트.png]
- 흰 샷(씬별 중간 프레임): 흰 픽셀(>245), 채도 픽셀(HSV S>0.25 이고 V>40)
- 명암 전환 횟수(루프 이음새 포함), 다크 시간 비율
- 정지 프레임(MAD<0.05) 비율, 막별 정지·평균 MAD
- 상시 로고 띠 안정성(씬 경계 제외, 인접 프레임 차이)
--sheet: 씬별 시작·중간·끝 프레임 시트를 만든다(눈으로 잘림·겹침 확인)
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image


def read_gray(path, w=180, h=320):
    cmd = ["ffmpeg", "-v", "error", "-i", path, "-vf", f"scale={w}:{h}:flags=area,format=gray", "-f", "rawvideo", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)


def grab(path, frame):
    with tempfile.TemporaryDirectory() as d:
        out = os.path.join(d, "f.png")
        subprocess.run(
            ["ffmpeg", "-v", "error", "-i", path, "-vf", f"select=eq(n\\,{frame})", "-frames:v", "1", "-y", out], check=True
        )
        return Image.open(out).convert("RGB").copy()


def white_stats(img):
    a = np.asarray(img).astype(np.float32)
    mx, mn = a.max(2), a.min(2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    lum = a @ np.array([0.299, 0.587, 0.114], np.float32)
    return float((lum > 245).mean() * 100), float(((sat > 0.25) & (mx > 40)).mean() * 100)


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("spec")
    ap.add_argument("--sheet")
    args = ap.parse_args()
    spec = json.load(open(args.spec, encoding="utf8"))
    scenes = spec["scenes"]
    g = read_gray(args.video)
    n = len(g)
    mad = np.abs(g[1:] - g[:-1]).mean((1, 2))
    total = sum(s["durationInFrames"] for s in scenes)
    print(f"프레임 {n} (spec {total}), {n / 30:.2f}초")

    still = (mad < 0.05).mean() * 100
    print(f"완전 정지(MAD<0.05) {still:.1f}%   <0.2 {(mad < 0.2).mean() * 100:.1f}%   중앙값 {np.median(mad):.3f}")

    acc = 0
    dark = 0
    flips = 0
    bounds = []
    print("\n#  씬              프레임      길이  배경   정지%  평균MAD  흰%   채도%")
    for i, s in enumerate(scenes):
        d = s["durationInFrames"]
        a, b = acc, acc + d
        seg = mad[a : b - 1]
        is_dark = s["palette"] == "film-dark"
        dark += d if is_dark else 0
        nxt = scenes[(i + 1) % len(scenes)]
        flips += (nxt["palette"] == "film-dark") != is_dark
        w, sat = white_stats(grab(args.video, a + int(d * 0.8)))
        print(
            f"{i + 1}  {s['type']:<14} {a:>4}-{b - 1:<4} {d / 30:>5.2f}s {'다크' if is_dark else '흰 '}  "
            f"{(seg < 0.05).mean() * 100:>5.1f}  {seg.mean():>6.2f}  {w:>5.1f}  {sat:>5.2f}"
        )
        bounds.append((a, b))
        acc = b
    print(f"\n다크 시간 {dark / total * 100:.1f}%   명암 전환 {flips}회(루프 이음새 포함)")

    # 상시 로고 띠: 로고가 켜져 있는 같은 톤 구간에서 띠가 변하면 로고가 움직인 것이다
    band = g[:, int(1410 / 6) : int(1472 / 6), :]
    worst = 0.0
    acc = 0
    for s in scenes:
        d = s["durationInFrames"]
        hidden = s.get("hideBrand", s["type"] == "logo-outro" or s["props"].get("mode") == "tilt" or (s["type"] == "cta-marquee" and s["props"].get("name")))
        if not hidden and d > 2:
            worst = max(worst, float(np.abs(band[acc + 1 : acc + d] - band[acc + 1]).mean((1, 2)).max()))
        acc += d
    print(f"로고 띠 최대 변화 {worst:.3f} (0 에 가까울수록 고정)")

    # 큰 움직임 동시성은 눈으로 본다. 여기서는 MAD 상위 구간만 찍는다
    runs = []
    i = 0
    while i < len(mad):
        if mad[i] > 1:
            j = i
            while j + 1 < len(mad) and mad[j + 1] > 1:
                j += 1
            runs.append((i, j, float(mad[i : j + 1].max())))
            i = j + 1
        else:
            i += 1
    print("MAD>1 구간:", ", ".join(f"{a}-{b}({m:.0f})" for a, b, m in runs))

    if args.sheet:
        tw, th = 216, 384
        rows = []
        for a, b in bounds:
            rows.append([a, a + (b - a) // 2, b - 1])
        sheet = Image.new("RGB", (len(rows) * (tw + 6), 3 * (th + 6)), "#808080")
        for c, r in enumerate(rows):
            for k, fr in enumerate(r):
                sheet.paste(grab(args.video, fr).resize((tw, th), Image.LANCZOS), (c * (tw + 6), k * (th + 6)))
        sheet.save(args.sheet)
        print("시트:", args.sheet)


if __name__ == "__main__":
    sys.exit(main())
