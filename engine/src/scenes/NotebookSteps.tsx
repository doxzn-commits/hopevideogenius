// 요약: 공책 오브제 하나가 지속되고 페이지만 바뀐다(슬라이드 15f 또는 하드 스왑). 밑줄·손글씨가 쓰여지는 표현은 이 공책 안에서만 쓴다.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT_FILM } from "../fonts";
import { HandLine, MarkedText, NotebookPaper, useFilm } from "../components/film";
import { notebookStepsTimeline } from "../spec/timelines";
import { clamp, EASE_MOVE, FILM } from "../theme";
import type { SceneProps } from "./registry";

const PAGE_GAP = 1100; // 패널 슬라이드 간격(팩트시트 §9.2)

export const NotebookSteps: React.FC<SceneProps<"notebook-steps">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const t = useFilm();
  const { pages } = scene.props;
  const tl = notebookStepsTimeline(scene.props);
  const N = FILM.notebook;
  const HEADER = N.header;
  const rows = Math.floor((N.height - HEADER) / N.rule);

  const pos = tl.pages.reduce((acc, pg, i) => {
    if (i === 0) return acc;
    if (!tl.slide) return acc + (f >= pg.moveStart ? 1 : 0);
    return acc + interpolate(f, [pg.moveStart, pg.moveEnd], [0, 1], { ...clamp, easing: EASE_MOVE });
  }, 0);
  let active = 0;
  pages.forEach((pg, i) => {
    if (f >= pg.at) active = i;
  });

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: N.x, top: N.top }}>
        <NotebookPaper p={p} width={N.width} height={N.height} ruleTop={HEADER}>
          {/* 단계 표시 — 틀에 붙어 있어서 슬라이드에 끌려가지 않는다. 활성 표시는 0프레임에 바뀐다 */}
          <div
            style={{
              position: "absolute",
              left: 56,
              top: 0,
              height: HEADER,
              display: "flex",
              alignItems: "center",
              gap: 44,
              fontFamily: FONT_FILM,
              fontWeight: 700,
              fontSize: t.stepLabel,
              letterSpacing: "-0.02em",
            }}
          >
            {pages.map((pg, i) => (
              <div key={i} style={{ color: i === active ? p.text : "rgba(11,11,11,0.22)" }}>
                {pg.label}
              </div>
            ))}
          </div>

          {pages.map((pg, i) => {
            const pt = tl.pages[i];
            const offset = Math.max(0, Math.floor((rows - pg.lines.length) / 2));
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 56,
                  right: 40,
                  top: HEADER + offset * N.rule,
                  translate: `${(i - pos) * PAGE_GAP}px 0`,
                }}
              >
                {pg.lines.map((ln, j) => {
                  const lt = pt.lines[j];
                  const hand = ln.ink === "hand";
                  return (
                    <div
                      key={j}
                      style={{
                        height: N.rule,
                        lineHeight: `${N.rule}px`,
                        whiteSpace: "nowrap",
                        translate: `0 ${hand ? 8 : 10}px`,
                        fontFamily: FONT_FILM,
                        fontWeight: 600,
                        fontSize: t.note,
                        letterSpacing: "-0.02em",
                        color: p.text,
                      }}
                    >
                      {hand ? (
                        <HandLine text={ln.text} start={lt.start} end={lt.writeEnd} size={t.hand} />
                      ) : (
                        <MarkedText text={ln.text} marks={ln.marks ?? []} timing={lt.marks} color={p.mark ?? p.accent} />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </NotebookPaper>
      </div>
    </AbsoluteFill>
  );
};
