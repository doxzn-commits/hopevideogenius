// 요약: 카드 스택에서 앞장이 올라오며 이름이 타이핑되는 챕터 타이틀. 레퍼런스의 "N 번째는 / ○○입니다" 모티프.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT_MONO, FONT_UI } from "../fonts";
import { clamp, EASE_OUT } from "../theme";
import { titleCardTimeline } from "../spec/timelines";
import type { SceneProps } from "./registry";

export const TitleCard: React.FC<SceneProps<"title-card">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const { kicker, name, subtitle, glyph, index, total } = scene.props;
  const tl = titleCardTimeline(scene.props);
  const typed = Math.floor(interpolate(f, [tl.typeStart, tl.typeEnd], [0, name.length], clamp));
  const pad = (n: number) => String(n).padStart(2, "0");
  const progress = index && total ? index / total : 0;

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          textAlign: "center",
          fontFamily: FONT_UI,
          fontWeight: 600,
          fontSize: 26,
          letterSpacing: "0.22em",
          color: p.sub,
          textTransform: "uppercase",
          marginBottom: 40,
          opacity: interpolate(f, [0, 10], [0, 1], clamp),
        }}
      >
        {kicker}
      </div>
      <div style={{ position: "relative", height: 460 }}>
        {[2, 1].map((k) => (
          <div
            key={k}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 36,
              background: p.card,
              border: `1.5px solid ${p.cardBorder}`,
              translate: `0 ${-k * 22}px`,
              scale: 1 - k * 0.045,
              opacity: interpolate(f, [0, 10], [0, 0.55], clamp),
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 36,
            background: p.card,
            border: `1.5px solid ${p.cardBorder}`,
            boxShadow: p.dark ? "0 40px 120px rgba(0,0,0,0.55)" : "0 30px 80px rgba(120,80,60,0.18)",
            backdropFilter: "blur(20px)",
            padding: 56,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            opacity: interpolate(f, [tl.cardIn, tl.cardIn + 10], [0, 1], clamp),
            translate: `0 ${interpolate(f, [tl.cardIn, tl.cardIn + 16], [60, 0], { ...clamp, easing: EASE_OUT })}px`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            {glyph ? <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 72, color: p.text }}>{glyph}</div> : null}
            <div style={{ fontFamily: FONT_MONO, fontSize: 40, color: p.sub }}>/</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 76, color: p.text, letterSpacing: "-0.02em" }}>
              {name.slice(0, typed)}
            </div>
          </div>
          {subtitle ? (
            <div
              style={{
                fontFamily: FONT_UI,
                fontWeight: 500,
                fontSize: 30,
                letterSpacing: "0.08em",
                color: p.sub,
                opacity: interpolate(f, [tl.subtitleAt, tl.subtitleAt + 10], [0, 1], clamp),
              }}
            >
              {subtitle}
            </div>
          ) : null}
          {index && total ? (
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ fontFamily: FONT_UI, fontSize: 24, letterSpacing: "0.2em", color: p.sub }}>PACK SLOT</div>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: p.track, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${interpolate(f, [tl.subtitleAt, tl.subtitleAt + 14], [0, progress * 100], { ...clamp, easing: EASE_OUT })}%`,
                    height: "100%",
                    background: p.accent,
                  }}
                />
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 30, color: p.text }}>
                {pad(index)} / {pad(total)}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
