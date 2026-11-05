// 요약: 필름형 훅 — 문장이 뜨고 한 줄이 드래그 선택된다. 선택 영역이 흰 샷의 유일한 색이다.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT_FILM } from "../fonts";
import { useFilm } from "../components/film";
import { selectHookTimeline } from "../spec/timelines";
import { clamp, EASE_MOVE, EASE_REVEAL, FILM } from "../theme";
import type { SceneProps } from "./registry";

export const SelectHook: React.FC<SceneProps<"select-hook">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const t = useFilm();
  const tl = selectHookTimeline();
  const { lines, selectLine } = scene.props;
  const rise = interpolate(f, [0, tl.riseEnd], [114, 0], { ...clamp, easing: EASE_MOVE });
  const wipe = interpolate(f, [tl.selectStart, tl.selectEnd], [0, 1], { ...clamp, easing: EASE_REVEAL });
  const rest = interpolate(f, [0, tl.fadeEnd], [0, 1], clamp);
  const handle = p.selectionHandle ?? p.accent;
  const selH = Math.round(t.display * 1.3);
  const selTop = (t.displayRow - selH) / 2;
  const handleOn = f >= tl.selectStart ? 1 : 0;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", translate: `0 ${FILM.center - 960}px` }}>
      <div style={{ translate: `0 ${rise}px`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {lines.map((ln, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              height: t.displayRow,
              lineHeight: `${t.displayRow}px`,
              opacity: i === 0 ? 1 : rest,
              fontFamily: FONT_FILM,
              fontWeight: t.headlineWeight,
              fontSize: t.display,
              letterSpacing: "-0.02em",
              color: p.text,
              whiteSpace: "nowrap",
            }}
          >
            {i === selectLine ? (
              <>
                <div style={{ position: "absolute", left: -10, top: selTop, height: selH, width: `calc((100% + 20px) * ${wipe})`, background: p.selection }} />
                {/* 선택 핸들: 왼쪽은 위 점, 오른쪽은 아래 점. 오른쪽은 와이프 끝을 따라간다 */}
                <div style={{ position: "absolute", left: -12, top: selTop, width: 3, height: selH, background: handle, opacity: handleOn }}>
                  <div style={{ position: "absolute", left: -6, top: -13, width: 15, height: 15, borderRadius: 99, background: handle }} />
                </div>
                <div style={{ position: "absolute", left: `calc(-10px + (100% + 20px) * ${wipe})`, top: selTop, width: 3, height: selH, background: handle, opacity: handleOn }}>
                  <div style={{ position: "absolute", left: -6, bottom: -13, width: 15, height: 15, borderRadius: 99, background: handle }} />
                </div>
              </>
            ) : null}
            <span style={{ position: "relative" }}>{ln}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
