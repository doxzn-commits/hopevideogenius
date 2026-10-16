// 요약: 요청문 말풍선 → 툴 호출 행(실행 중 → ✓ 완료) → 결과 패널. 카드형 영상의 핵심 씬.
// 카드 틀은 CardShell 이 그리고, 여기서는 **카드 안 내용만** 그린다.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT_MONO, FONT_UI } from "../fonts";
import { clamp, EASE_OUT } from "../theme";
import { T, promptRunTimeline } from "../spec/timelines";
import type { SceneOf } from "../spec/schema";
import type { SceneProps } from "./registry";
import type { Palette } from "../theme";

type Result = NonNullable<SceneOf<"prompt-run">["props"]["result"]>;

/** 숫자를 쓰지 않는 자리표시 막대 — 지어낸 수치를 말하지 않기 위한 장치 */
const Blank: React.FC<{ p: Palette; w: number; h?: number }> = ({ p, w, h = 18 }) => (
  <div style={{ width: w, height: h, borderRadius: h / 2, background: p.track }} />
);

const ResultBody: React.FC<{ p: Palette; r: Result; at: number }> = ({ p, r, at }) => {
  const f = useCurrentFrame();
  const rowIn = (i: number) => {
    const s = at + i * T.rowStagger;
    return {
      opacity: interpolate(f, [s, s + 8], [0, 1], clamp),
      translate: `0 ${interpolate(f, [s, s + 10], [12, 0], { ...clamp, easing: EASE_OUT })}px`,
    };
  };

  if (r.kind === "thumbs")
    return (
      <div style={{ display: "flex", gap: 18 }}>
        {r.items.map((it, i) => (
          <div key={i} style={{ flex: 1, ...rowIn(i) }}>
            <div style={{ position: "relative", height: 210, borderRadius: 18, background: "#1F1F1F" }}>
              {it.rank ? (
                <div
                  style={{
                    position: "absolute",
                    left: -10,
                    top: -10,
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "#1A1A1A",
                    color: "#FFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONT_UI,
                    fontWeight: 700,
                    fontSize: 26,
                  }}
                >
                  {it.rank}
                </div>
              ) : null}
              <div style={{ position: "absolute", left: 16, bottom: 14, color: "#FFF", fontSize: 24 }}>▶</div>
            </div>
            {it.metrics.map((m, j) => (
              <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                <div style={{ fontFamily: FONT_UI, fontSize: 24, color: p.sub }}>{m}</div>
                <Blank p={p} w={110} h={14} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );

  if (r.kind === "table")
    return (
      <div>
        <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
          <div style={{ flex: 2 }} />
          {r.columns.map((c, i) => (
            <div key={i} style={{ flex: 1, fontFamily: FONT_UI, fontSize: 24, color: p.sub, textAlign: "center" }}>
              {c}
            </div>
          ))}
        </div>
        {r.rows.map((row, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", ...rowIn(i) }}>
            <div style={{ flex: 2, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 30, color: "#1A1A1A" }}>{row.label}</span>
              {row.badge ? (
                <span
                  style={{
                    fontFamily: FONT_UI,
                    fontSize: 20,
                    padding: "4px 12px",
                    borderRadius: 999,
                    background: `${p.accent}22`,
                    color: p.accent,
                  }}
                >
                  {row.badge}
                </span>
              ) : null}
            </div>
            {r.columns.slice(0, -1).map((_, j) => (
              <div key={j} style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <Blank p={p} w={70} h={14} />
              </div>
            ))}
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              {row.toggle === undefined ? (
                <Blank p={p} w={70} h={14} />
              ) : (
                <div
                  style={{
                    width: 72,
                    height: 40,
                    borderRadius: 20,
                    background: row.toggle ? "#2F7CF6" : p.track,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: row.toggle ? "flex-end" : "flex-start",
                    padding: 4,
                  }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#FFFFFF" }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );

  if (r.kind === "funnel")
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {r.steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, ...rowIn(i) }}>
            <div style={{ width: 180, fontFamily: FONT_UI, fontWeight: 600, fontSize: 30, color: "#1A1A1A" }}>{s.label}</div>
            <div style={{ flex: 1, height: 42, borderRadius: 10, background: p.track, overflow: "hidden" }}>
              <div
                style={{
                  width: `${interpolate(f, [at + i * T.rowStagger, at + i * T.rowStagger + T.barFill], [0, s.value * 100], { ...clamp, easing: EASE_OUT })}%`,
                  height: "100%",
                  background: s.drop ? "#E5484D" : "#F7BD2B",
                }}
              />
            </div>
            {s.drop && r.note ? (
              <div
                style={{
                  fontFamily: FONT_UI,
                  fontWeight: 600,
                  fontSize: 22,
                  color: "#E5484D",
                  border: "1.5px solid #E5484D",
                  borderRadius: 999,
                  padding: "6px 14px",
                  whiteSpace: "nowrap",
                }}
              >
                {r.note}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "center", ...rowIn(0) }}>
      <div style={{ width: 150, height: 210, borderRadius: 18, background: "#1F1F1F" }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 30, color: "#1A1A1A", marginBottom: 16 }}>
          {r.account}
        </div>
        <Blank p={p} w={260} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
          {r.actions.map((a, i) => (
            <div
              key={i}
              style={{
                ...rowIn(i),
                padding: "14px 0",
                borderRadius: 14,
                textAlign: "center",
                fontFamily: FONT_UI,
                fontWeight: 600,
                fontSize: 28,
                background: i === r.actions.length - 1 ? "#1A1A1A" : "transparent",
                color: i === r.actions.length - 1 ? "#FFFFFF" : "#1A1A1A",
                border: i === r.actions.length - 1 ? "none" : `1.5px solid ${p.track}`,
              }}
            >
              {a}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PromptRun: React.FC<SceneProps<"prompt-run">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const { prompt, tool, result, sample } = scene.props;
  const tl = promptRunTimeline(scene.props);
  const typed = Math.floor(interpolate(f, [tl.promptStart, tl.promptEnd], [0, [...prompt].length], clamp));
  const done = f >= tl.doneAt;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 요청문 — 사용자가 실제로 치는 문장 */}
      <div
        style={{
          background: p.bubble ?? p.track,
          borderRadius: 24,
          padding: "26px 30px",
          fontFamily: FONT_UI,
          fontWeight: 600,
          fontSize: 38,
          lineHeight: 1.45,
          color: "#1A1A1A",
          minHeight: 110,
        }}
      >
        {[...prompt].slice(0, typed).join("")}
      </div>

      {/* 툴 호출 행 — 실행 중 → ✓ 완료 */}
      {f >= tl.toolAt ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "#FFFFFF",
            border: `1.5px solid ${p.cardBorder}`,
            borderRadius: 18,
            padding: "18px 24px",
            opacity: interpolate(f, [tl.toolAt, tl.toolAt + 8], [0, 1], clamp),
          }}
        >
          <div style={{ fontFamily: FONT_MONO, fontSize: 30, color: "#1A1A1A", flex: 1 }}>
            {tool.name}
            {tool.target ? <span style={{ color: p.sub }}> · {tool.target}</span> : null}
          </div>
          <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 28, color: done ? "#1E8E54" : p.sub }}>
            {done ? "✓ 완료" : "실행 중…"}
          </div>
        </div>
      ) : null}

      {/* 결과 패널 */}
      {result && f >= tl.resultAt ? (
        <div
          style={{
            background: "#FFFFFF",
            border: `1.5px solid ${p.cardBorder}`,
            borderRadius: 24,
            padding: 28,
            opacity: interpolate(f, [tl.resultAt, tl.resultAt + 8], [0, 1], clamp),
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", marginBottom: 22 }}>
            <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 34, color: "#1A1A1A", flex: 1 }}>
              {result.title}
            </div>
            {sample ? <div style={{ fontFamily: FONT_UI, fontSize: 24, color: p.sub }}>예시</div> : null}
          </div>
          <ResultBody p={p} r={result} at={tl.resultAt + 4} />
        </div>
      ) : null}
    </div>
  );
};
