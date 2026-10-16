// 요약: 모든 씬이 공유하는 프리미티브 — 배경 글로우, 카드, 칩, 글리프 타일, 타이핑 커서.
import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { clamp, EASE_OUT, type Palette } from "../theme";
import { FONT_MONO, FONT_UI } from "../fonts";

export const Glow: React.FC<{ p: Palette; seed: string }> = ({ p, seed }) => {
  const f = useCurrentFrame();
  const dx = Math.sin(f / 50) * 40;
  const dy = Math.cos(f / 65) * 30;
  const dots = new Array(18).fill(0).map((_, i) => ({
    x: random(`${seed}x${i}`) * 1080,
    y: random(`${seed}y${i}`) * 1920,
    r: 2 + random(`${seed}r${i}`) * 3,
    s: 0.2 + random(`${seed}s${i}`) * 0.6,
  }));
  // flat 팔레트는 단색 배경 — 카드가 주인공이라 배경이 움직이면 시선을 뺏는다
  if (p.flat) return <AbsoluteFill style={{ backgroundColor: p.bg }} />;
  return (
    <AbsoluteFill style={{ backgroundColor: p.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 700px at ${300 + dx}px ${500 + dy}px, ${p.glowA}, transparent 70%), radial-gradient(820px 820px at ${820 - dx}px ${1400 - dy}px, ${p.glowB}, transparent 70%)`,
        }}
      />
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: d.x,
            top: (((d.y - f * d.s) % 1920) + 1920) % 1920,
            width: d.r,
            height: d.r,
            borderRadius: "50%",
            background: p.dark ? "rgba(255,255,255,0.35)" : "rgba(120,80,60,0.22)",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

export const Chip: React.FC<{ p: Palette; children: React.ReactNode; accent?: boolean; style?: React.CSSProperties }> = ({
  p,
  children,
  accent,
  style,
}) => (
  <div
    style={{
      padding: "10px 22px",
      borderRadius: 999,
      border: `1.5px solid ${accent ? p.accent : p.cardBorder}`,
      background: accent ? `${p.accent}22` : p.dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)",
      fontFamily: FONT_UI,
      fontWeight: 600,
      fontSize: 26,
      letterSpacing: "0.12em",
      color: accent ? p.accent : p.text,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

export const GlyphTile: React.FC<{ p: Palette; glyph: string; size?: number; color?: string; style?: React.CSSProperties }> = ({
  p,
  glyph,
  size = 56,
  color,
  style,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.3,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: color ?? (p.dark ? "rgba(255,255,255,0.08)" : "rgba(60,40,30,0.06)"),
      border: `1.5px solid ${p.cardBorder}`,
      fontFamily: FONT_UI,
      fontWeight: 700,
      fontSize: size * 0.42,
      color: p.text,
      flexShrink: 0,
      ...style,
    }}
  >
    {glyph}
  </div>
);

export const Cursor: React.FC<{ p: Palette; on: boolean; height?: number }> = ({ p, on, height = 38 }) => (
  <span
    style={{
      display: "inline-block",
      width: 16,
      height,
      marginLeft: 6,
      verticalAlign: "-6px",
      background: p.accent,
      opacity: on ? 0.9 : 0,
    }}
  />
);

export const Card: React.FC<{
  p: Palette;
  label?: string;
  chip?: React.ReactNode;
  windowDots?: boolean;
  enterAt?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ p, label, chip, windowDots, enterAt = 0, children, style }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        width: "100%",
        borderRadius: 36,
        background: p.card,
        border: `1.5px solid ${p.cardBorder}`,
        boxShadow: p.dark ? "0 40px 120px rgba(0,0,0,0.55)" : "0 30px 80px rgba(120,80,60,0.18)",
        backdropFilter: "blur(20px)",
        padding: 44,
        opacity: interpolate(f, [enterAt, enterAt + 12], [0, 1], clamp),
        translate: `0 ${interpolate(f, [enterAt, enterAt + 14], [40, 0], { ...clamp, easing: EASE_OUT })}px`,
        ...style,
      }}
    >
      {(label || chip || windowDots) && (
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
          {windowDots && (
            <div style={{ display: "flex", gap: 10, marginRight: 6 }}>
              {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                <div key={c} style={{ width: 16, height: 16, borderRadius: "50%", background: c, opacity: 0.9 }} />
              ))}
            </div>
          )}
          {label && (
            <div
              style={{
                fontFamily: FONT_UI,
                fontWeight: 600,
                fontSize: 30,
                letterSpacing: "0.14em",
                color: p.text,
                textTransform: "uppercase",
              }}
            >
              <span style={{ color: p.accent, marginRight: 12 }}>✳</span>
              {label}
            </div>
          )}
          <div style={{ flex: 1 }} />
          {chip}
        </div>
      )}
      {children}
    </div>
  );
};

export const MonoLine: React.FC<{ p: Palette; text: string; cursorOn: boolean; size?: number }> = ({
  p,
  text,
  cursorOn,
  size = 34,
}) => (
  <div style={{ fontFamily: FONT_MONO, fontSize: size, color: p.text, lineHeight: 1.4 }}>
    <span style={{ color: p.sub }}>&gt; </span>
    {text}
    <Cursor p={p} on={cursorOn} height={size * 1.1} />
  </div>
);
