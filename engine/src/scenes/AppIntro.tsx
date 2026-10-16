// 요약: 카드 안에 큰 아이콘 + 역할 한 줄. "첫 번째, ○○" 챕터 표지의 카드 버전.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT_UI } from "../fonts";
import { clamp, EASE_OUT } from "../theme";
import { appIntroTimeline } from "../spec/timelines";
import type { SceneProps } from "./registry";

export const AppIntro: React.FC<SceneProps<"app-intro">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const tl = appIntroTimeline();
  const card = scene.card;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
      <div
        style={{
          width: 190,
          height: 190,
          borderRadius: 48,
          background: card?.tint ?? "#1A1A1A",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_UI,
          fontWeight: 700,
          fontSize: 84,
          opacity: interpolate(f, [tl.glyphIn, tl.glyphIn + 12], [0, 1], clamp),
          scale: interpolate(f, [tl.glyphIn, tl.glyphIn + 14], [0.82, 1], { ...clamp, easing: EASE_OUT }),
        }}
      >
        {card?.glyph ?? "●"}
      </div>
      <div
        style={{
          fontFamily: FONT_UI,
          fontWeight: 700,
          fontSize: 62,
          color: "#1A1A1A",
          letterSpacing: "-0.02em",
          opacity: interpolate(f, [tl.roleAt, tl.roleAt + 10], [0, 1], clamp),
          translate: `0 ${interpolate(f, [tl.roleAt, tl.roleAt + 12], [16, 0], { ...clamp, easing: EASE_OUT })}px`,
        }}
      >
        {scene.props.role}
      </div>
      {scene.props.caption ? (
        <div
          style={{
            fontFamily: FONT_UI,
            fontWeight: 600,
            fontSize: 30,
            color: p.sub,
            opacity: interpolate(f, [tl.captionAt, tl.captionAt + 10], [0, 1], clamp),
          }}
        >
          {scene.props.caption}
        </div>
      ) : null}
    </div>
  );
};
