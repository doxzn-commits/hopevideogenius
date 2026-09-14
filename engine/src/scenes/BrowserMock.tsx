// 요약: 브라우저 목업 + 커서 이동 + 클릭 글로우 + 느린 확대(최대 115%). UI 모션그래픽의 기본 씬.
// 커서 좌표는 콘텐츠 영역 기준 0~1 비율이라 창 크기가 바뀌어도 그대로 재사용된다.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Chip } from "../components/ui";
import { FONT_MONO, FONT_UI } from "../fonts";
import { clamp, EASE_OUT } from "../theme";
import { browserMockTimeline } from "../spec/timelines";
import type { SceneProps } from "./registry";

const WIN_W = 960;
const CONTENT_H = 620;

/** 커서 키프레임 사이를 보간한다. 첫 키프레임 이전에는 첫 위치에 머문다. */
const cursorAt = (pts: { at: number; x: number; y: number }[], f: number) => {
  if (pts.length === 0) return null;
  let a = pts[0];
  let b = pts[0];
  for (let i = 0; i < pts.length; i++) {
    if (f >= pts[i].at) {
      a = pts[i];
      b = pts[i + 1] ?? pts[i];
    }
  }
  if (a === b) return { x: a.x, y: a.y };
  const t = interpolate(f, [a.at, b.at], [0, 1], { ...clamp, easing: EASE_OUT });
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
};

export const BrowserMock: React.FC<SceneProps<"browser-mock">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const { url, chip, blocks, cursor, zoom } = scene.props;
  const tl = browserMockTimeline(scene.props);
  const pts = cursor ?? [];
  const pos = cursorAt(pts, f);
  const d = scene.durationInFrames;

  return (
    <div
      style={{
        width: WIN_W,
        // 느린 확대: 씬 전체에 걸쳐 1 → zoom (최대 1.15)
        scale: zoom ? interpolate(f, [0, d], [1, zoom], { ...clamp, easing: EASE_OUT }) : 1,
        opacity: interpolate(f, [0, tl.windowIn], [0, 1], clamp),
        translate: `0 ${interpolate(f, [0, tl.windowIn + 4], [30, 0], { ...clamp, easing: EASE_OUT })}px`,
      }}
    >
      <div
        style={{
          borderRadius: 28,
          overflow: "hidden",
          border: `1.5px solid ${p.cardBorder}`,
          boxShadow: p.dark ? "0 40px 120px rgba(0,0,0,0.55)" : "0 30px 80px rgba(120,80,60,0.18)",
          background: p.card,
        }}
      >
        {/* 크롬 바 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "18px 24px",
            background: p.dark ? "rgba(255,255,255,0.04)" : "rgba(60,40,30,0.04)",
            borderBottom: `1.5px solid ${p.cardBorder}`,
          }}
        >
          <div style={{ display: "flex", gap: 9 }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <div key={c} style={{ width: 14, height: 14, borderRadius: "50%", background: c, opacity: 0.9 }} />
            ))}
          </div>
          <div
            style={{
              flex: 1,
              padding: "10px 20px",
              borderRadius: 999,
              background: p.dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.75)",
              fontFamily: FONT_MONO,
              fontSize: 24,
              color: p.sub,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {url}
          </div>
          {chip ? <Chip p={p} style={{ fontSize: 22, padding: "6px 16px" }}>{chip}</Chip> : null}
        </div>

        {/* 콘텐츠 + 커서 */}
        <div style={{ position: "relative", height: CONTENT_H, padding: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {blocks.map((b, i) => {
              const at = tl.blocksStart + i * 4;
              const inP = interpolate(f, [at, at + 10], [0, 1], { ...clamp, easing: EASE_OUT });
              return (
                <div
                  key={i}
                  style={{
                    width: `${b.w * 100}%`,
                    height: b.tall ? 150 : 44,
                    borderRadius: b.tall ? 20 : 12,
                    background: b.accent ? p.accent : p.dark ? "rgba(255,255,255,0.1)" : "rgba(60,40,30,0.09)",
                    opacity: inP,
                    translate: `0 ${(1 - inP) * 14}px`,
                    display: "flex",
                    alignItems: "center",
                    padding: b.label ? "0 20px" : 0,
                    fontFamily: FONT_UI,
                    fontWeight: 600,
                    fontSize: 26,
                    color: b.accent ? (p.dark ? "#0B0B0B" : "#FFFFFF") : p.sub,
                  }}
                >
                  {b.label}
                </div>
              );
            })}
          </div>

          {/* 클릭 글로우 — 클릭 프레임마다 원이 퍼지며 사라진다 */}
          {pts
            .filter((c) => c.click)
            .map((c, i) => {
              const t = f - c.at;
              if (t < 0 || t > 20) return null;
              const grow = interpolate(t, [0, 20], [0, 1], { ...clamp, easing: EASE_OUT });
              return (
                <div
                  key={`g${i}`}
                  style={{
                    position: "absolute",
                    left: 40 + c.x * (WIN_W - 80),
                    top: 40 + c.y * (CONTENT_H - 80),
                    width: 40 + grow * 90,
                    height: 40 + grow * 90,
                    marginLeft: -(20 + grow * 45),
                    marginTop: -(20 + grow * 45),
                    borderRadius: "50%",
                    border: `3px solid ${p.accent}`,
                    opacity: 1 - grow,
                  }}
                />
              );
            })}

          {pos ? (
            <svg
              width={40}
              height={48}
              viewBox="0 0 24 28"
              style={{
                position: "absolute",
                left: 40 + pos.x * (WIN_W - 80),
                top: 40 + pos.y * (CONTENT_H - 80),
                filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.35))",
              }}
            >
              {/* 마우스 포인터 — 회전시키지 않는다 (기울어지면 커서로 안 읽힌다) */}
              <path
                d="M2 1 L2 21 L7.5 16.5 L11 24.5 L14.5 23 L11 15.5 L18 15 Z"
                fill={p.dark ? "#FFFFFF" : "#1A1A1A"}
                stroke={p.dark ? "#1A1A1A" : "#FFFFFF"}
                strokeWidth={1.2}
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </div>
      </div>
    </div>
  );
};
