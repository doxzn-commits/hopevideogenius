// 요약: 연락처 카드 — 키오스크·사이니지용. 멀리서 보고 **받아적는** 화면이라 전화번호가 가장 크다.
// 자막(하단 캡션)을 쓰지 않고 화면 글자가 전부다. 최소 노출 6초는 게이트가 강제한다.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT_KR, FONT_UI } from "../fonts";
import { clamp, EASE_OUT } from "../theme";
import { contactCardTimeline } from "../spec/timelines";
import type { SceneProps } from "./registry";

export const ContactCard: React.FC<SceneProps<"contact-card">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const { badge, name, tagline, lines, phone } = scene.props;
  const tl = contactCardTimeline();
  const rise = (at: number) => ({
    opacity: interpolate(f, [at, at + 10], [0, 1], clamp),
    translate: `0 ${interpolate(f, [at, at + 14], [18, 0], { ...clamp, easing: EASE_OUT })}px`,
  });

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 28, textAlign: "center" }}>
      {badge ? (
        <div
          style={{
            ...rise(tl.badgeIn),
            background: p.accent,
            color: "#FFFFFF",
            fontFamily: FONT_KR,
            fontWeight: 900,
            fontSize: 38,
            padding: "14px 34px",
            borderRadius: 999,
          }}
        >
          {badge}
        </div>
      ) : null}

      <div style={{ ...rise(tl.nameAt), fontFamily: FONT_KR, fontWeight: 900, fontSize: 104, color: p.text, letterSpacing: "-0.03em" }}>
        {name}
      </div>

      {tagline ? (
        <div style={{ ...rise(tl.nameAt + 4), fontFamily: FONT_KR, fontWeight: 700, fontSize: 40, color: p.sub }}>{tagline}</div>
      ) : null}

      {lines && lines.length > 0 ? (
        <div style={{ ...rise(tl.linesAt), display: "flex", flexDirection: "column", gap: 8 }}>
          {lines.map((ln, i) => (
            <div key={i} style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 44, color: p.text }}>
              {ln}
            </div>
          ))}
        </div>
      ) : null}

      {/* 전화번호 — 이 화면에서 가장 커야 하는 글자 */}
      <div
        style={{
          ...rise(tl.phoneAt),
          marginTop: 10,
          padding: "24px 44px",
          borderRadius: 32,
          border: `4px solid ${p.accent}`,
          fontFamily: FONT_UI,
          fontWeight: 700,
          fontSize: 86,
          letterSpacing: "0.02em",
          color: p.accent,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
      >
        {phone}
      </div>
    </div>
  );
};
