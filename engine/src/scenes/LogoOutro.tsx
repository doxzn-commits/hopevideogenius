// 요약: 끝 로고 단독. 1.12→1 수축 뒤 아주 느리게 후퇴한다. 다음 루프의 흰 훅으로 하드컷된다.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT_FILM } from "../fonts";
import { useFilm } from "../components/film";
import { logoOutroTimeline } from "../spec/timelines";
import { clamp, EASE_MOVE, FILM } from "../theme";
import type { SceneProps } from "./registry";

export const LogoOutro: React.FC<SceneProps<"logo-outro">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const t = useFilm();
  const tl = logoOutroTimeline();
  const settle = interpolate(f, [0, tl.settleEnd], [1.12, 1], { ...clamp, easing: EASE_MOVE });
  const drift = interpolate(f, [tl.settleEnd, tl.settleEnd + tl.driftFrames], [1, 0.92], clamp);
  const { text, logo } = scene.props;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", translate: `0 ${FILM.center - 960}px` }}>
      <div style={{ scale: settle * drift, fontFamily: FONT_FILM, fontWeight: 800, fontSize: t.logo, letterSpacing: "-0.03em", color: p.text }}>
        {logo ? <Img src={staticFile(logo)} style={{ height: t.logo }} /> : text}
      </div>
    </AbsoluteFill>
  );
};
