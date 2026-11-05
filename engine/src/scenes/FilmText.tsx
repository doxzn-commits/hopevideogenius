// 요약: 필름형 문구 단독 화면. 컷 시점에 이미 떠 있다. 명암 하드컷이 이 씬의 움직임 전부다.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT_FILM } from "../fonts";
import { MarkedText, useFilm } from "../components/film";
import { filmTextTimeline } from "../spec/timelines";
import { clamp, EASE_MOVE, FILM } from "../theme";
import type { SceneProps } from "./registry";

export const FilmText: React.FC<SceneProps<"film-text">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const t = useFilm();
  const { lines, subLine, rise, mark } = scene.props;
  const tl = filmTextTimeline();
  const y = rise ? interpolate(f, [0, tl.riseEnd], [37, 0], { ...clamp, easing: EASE_MOVE }) : 0;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", translate: `0 ${FILM.center - 960 + y}px` }}>
      {lines.map((ln, i) => (
        <div
          key={i}
          style={{
            height: t.displayRow,
            lineHeight: `${t.displayRow}px`,
            fontFamily: FONT_FILM,
            fontWeight: t.headlineWeight,
            fontSize: t.display,
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
            color: i === subLine ? p.sub : p.text,
          }}
        >
          {mark && ln.includes(mark) ? <MarkedText text={ln} marks={[mark]} timing={[{ at: tl.markAt, end: tl.markEnd }]} color={p.mark ?? p.accent} /> : ln}
        </div>
      ))}
    </AbsoluteFill>
  );
};
