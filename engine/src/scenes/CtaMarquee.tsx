// 요약: 필름형 CTA. 전화번호(또는 행동 버튼)가 검정 pill 안에서 화면의 가장 큰 글자다. 컷 시점에 전부 떠 있고 움직임은 느린 것만 쓴다.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT_FILM } from "../fonts";
import { useFilm } from "../components/film";
import { ctaMarqueeTimeline } from "../spec/timelines";
import { FILM } from "../theme";
import type { SceneProps } from "./registry";

export const CtaMarquee: React.FC<SceneProps<"cta-marquee">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const t = useFilm();
  const tl = ctaMarqueeTimeline();
  const { badge, name, tagline, lines, phone, button, rows, pulse = 0.012 } = scene.props;
  // 삼각파 — 레퍼런스도 직선이다
  const phase = (f % tl.pulsePeriod) / tl.pulsePeriod;
  const scale = 1 - pulse * interpolate(phase, [0, 0.5, 1], [0, 1, 0]);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FILM, color: p.text }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: FILM.contentTop,
          bottom: 1920 - FILM.contentBottom,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: rows ? "flex-start" : "center",
        }}
      >
        {badge ? (
          <div
            style={{
              padding: "14px 34px",
              border: `2.5px solid ${p.text}`,
              borderRadius: 999,
              fontWeight: 700,
              fontSize: t.tagline - 8,
              letterSpacing: "-0.02em",
              marginBottom: 54,
            }}
          >
            {badge}
          </div>
        ) : null}
        {name ? <div style={{ fontWeight: 800, fontSize: t.name, letterSpacing: "-0.03em", lineHeight: 1.2 }}>{name}</div> : null}
        {tagline ? <div style={{ fontWeight: 600, fontSize: t.tagline, letterSpacing: "-0.02em", marginTop: 14 }}>{tagline}</div> : null}
        {(lines ?? []).map((ln, i) => (
          <div key={i} style={{ fontWeight: 700, fontSize: t.ctaLine, letterSpacing: "-0.02em", lineHeight: 1.4, marginTop: i === 0 ? 10 : 0 }}>
            {ln}
          </div>
        ))}
        {phone || button ? (
          <div
            style={{
              marginTop: 70,
              padding: phone ? "42px 46px" : "40px 110px",
              background: "#101010",
              color: "#FFFFFF",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: phone ? t.phone : t.button,
              letterSpacing: phone ? "-0.01em" : "-0.02em",
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
              whiteSpace: "nowrap",
              scale,
            }}
          >
            {phone ?? button}
          </div>
        ) : null}
      </div>
      {/* 마퀴 행 — 허락받은 실제 이름만 들어온다 */}
      {(rows ?? []).map((row, i) => {
        const speed = tl.rowSpeeds[i % tl.rowSpeeds.length];
        const x = ((f / 30) * speed) % 1200;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: -1200,
              top: 1037 + i * 142,
              translate: `${x}px 0`,
              display: "flex",
              gap: 72,
              whiteSpace: "nowrap",
              fontWeight: 600,
              fontSize: t.tagline,
              color: p.sub,
            }}
          >
            {new Array(8)
              .fill(row)
              .flat()
              .map((label: string, j: number) => (
                <span key={j}>{label}</span>
              ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
