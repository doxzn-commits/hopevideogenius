// 요약: OLD WAY vs WITH IT 막대 비교 + 숫자 카운트다운. 레퍼런스의 "31 MIN → 짧은 빨간 바" 모티프.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Chip } from "../components/ui";
import { FONT_UI } from "../fonts";
import { clamp, EASE_OUT } from "../theme";
import { beforeAfterTimeline } from "../spec/timelines";
import type { SceneProps } from "./registry";

/** 텍스트 안 첫 숫자를 진행도에 맞춰 카운트업한다. "31 MIN" → "12 MIN" → "31 MIN" */
const countUp = (text: string, prog: number) => text.replace(/\d+/, (m) => String(Math.max(1, Math.round(Number(m) * prog))));

const Bar: React.FC<{
  p: SceneProps<"before-after">["p"];
  label: string;
  value: number;
  text: string;
  start: number;
  end: number;
  accent: boolean;
}> = ({ p, label, value, text, start, end, accent }) => {
  const f = useCurrentFrame();
  const prog = interpolate(f, [start, end], [0, 1], { ...clamp, easing: EASE_OUT });
  return (
    <div style={{ opacity: interpolate(f, [start, start + 8], [0, 1], clamp) }}>
      <div style={{ fontFamily: FONT_UI, fontWeight: 600, fontSize: 26, letterSpacing: "0.2em", color: p.sub, marginBottom: 14 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <div style={{ flex: 1, height: 64, borderRadius: 32, background: p.track, overflow: "hidden" }}>
          <div
            style={{
              width: `${prog * value * 100}%`,
              height: "100%",
              borderRadius: 32,
              background: accent ? p.accent : p.dark ? "rgba(255,255,255,0.28)" : "rgba(120,90,70,0.35)",
            }}
          />
        </div>
        <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 44, color: accent ? p.accent : p.text, width: 200 }}>
          {countUp(text, prog)}
        </div>
      </div>
    </div>
  );
};

export const BeforeAfter: React.FC<SceneProps<"before-after">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const { label, chipBefore, chipAfter, before, after } = scene.props;
  const tl = beforeAfterTimeline();
  const swapped = f >= tl.chipSwap;
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 70 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Chip p={p}>
          <span style={{ color: p.accent, marginRight: 10 }}>●</span>
          {label}
        </Chip>
        <Chip p={p} accent={swapped} style={{ scale: swapped ? 1.06 : 1 }}>
          {swapped ? chipAfter : chipBefore}
        </Chip>
      </div>
      <Bar p={p} label={before.label} value={before.value} text={before.text} start={tl.beforeStart} end={tl.beforeEnd} accent={false} />
      <Bar p={p} label={after.label} value={after.value} text={after.text} start={tl.afterStart} end={tl.afterEnd} accent />
    </div>
  );
};
