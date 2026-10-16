// 요약: 큰 한글 자막 레이어. 사람 영상 위에 그려진다. 강조어(hl)는 노란색. 길이 제한은 게이트가 판정한다.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { CAPTION, clamp, EASE_OUT, SAFE } from "../theme";
import { TEXT, fitSize } from "../spec/layout";
import { FONT_KR } from "../fonts";
import type { Caption } from "../spec/schema";

const Piece: React.FC<{ text: string; hl?: string; hlColor: string }> = ({ text, hl, hlColor }) => {
  if (!hl || !text.includes(hl)) return <>{text}</>;
  const [head, ...rest] = text.split(hl);
  return (
    <>
      {head}
      <span style={{ color: hlColor }}>{hl}</span>
      {rest.join(hl)}
    </>
  );
};

export const Captions: React.FC<{ captions: Caption[]; y: number; style?: "overlay" | "plain"; color?: string; hlColor?: string }> = ({
  captions,
  y,
  style = "overlay",
  color,
  hlColor,
}) => {
  const f = useCurrentFrame();
  let active: Caption | null = null;
  for (const c of captions) if (f >= c.at) active = c;
  if (!active) return null;
  const local = f - active.at;
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE,
        right: SAFE,
        top: y,
        translate: "0 -50%",
        scale: interpolate(local, [0, 5], [0.94, 1], { ...clamp, easing: EASE_OUT }),
        textAlign: "center",
        fontFamily: FONT_KR,
        fontWeight: 900,
        // 긴 자막은 안전 영역 폭에 맞춰 줄어든다 (최소 크기는 layout.ts TEXT 가 정하고, 그 아래는 게이트가 막는다)
        fontSize: fitSize([...active.text].length, TEXT.captionBase, TEXT.captionMin),
        lineHeight: 1.25,
        whiteSpace: "nowrap",
        letterSpacing: "-0.02em",
        // plain = 단색 배경 위 어두운 글씨(외곽선 없음). overlay = 그래픽·사람 위 흰 글씨 + 외곽선.
        color: style === "plain" ? (color ?? "#1A1A1A") : "#FFFFFF",
        WebkitTextStroke: style === "plain" ? undefined : `${CAPTION.stroke}px rgba(0,0,0,0.88)`,
        paintOrder: style === "plain" ? undefined : "stroke fill",
        textShadow: style === "plain" ? undefined : "0 6px 26px rgba(0,0,0,0.45)",
      }}
    >
      <Piece text={active.text} hl={active.hl} hlColor={hlColor ?? CAPTION.hl} />
    </div>
  );
};
