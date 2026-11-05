// 요약: 고정 틀(soft·browser·panel) 안에서 패널이 슬라이드·하드 스왑된다. 틀은 움직이지 않고 내용만 바뀐다. 패널 3종 + 줌 + PiP. 수치는 sample 로 표시한다.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Video } from "@remotion/media";
import { FONT_FILM } from "../fonts";
import { useFilm } from "../components/film";
import { VIDEO_EXT } from "../spec/gate";
import { uiStageTimeline } from "../spec/timelines";
import { clamp, EASE_MOVE, FILM, type Palette } from "../theme";
import type { SceneOf } from "../spec/schema";
import type { SceneProps } from "./registry";

type Panel = SceneOf<"ui-stage">["props"]["panels"][number];

const GREEN = "#34B68A"; // 유일한 데이터 색 (팩트시트 §4)
const INK = "#0B0B0B";
const INK2 = "rgba(11,11,11,0.45)";
const PANEL_GAP = 1100;

const LineChart: React.FC<{ panel: Extract<Panel, { kind: "line-chart" }>; drawStart: number; drawEnd: number; w: number; h: number }> = ({
  panel,
  drawStart,
  drawEnd,
  w,
  h,
}) => {
  const f = useCurrentFrame();
  const t = useFilm();
  const prog = interpolate(f, [drawStart, drawEnd], [0, 1], clamp);
  const value = panel.from + (panel.to - panel.from) * prog;
  const cw = w - 96;
  const ch = h * 0.42;
  const pts = panel.points.map((v, i) => [(i / (panel.points.length - 1)) * cw, ch - v * ch] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const seg = Math.min(pts.length - 2, Math.floor(prog * (pts.length - 1)));
  const local = prog * (pts.length - 1) - seg;
  const tipX = pts[seg][0] + (pts[seg + 1][0] - pts[seg][0]) * local;
  const tipY = pts[seg][1] + (pts[seg + 1][1] - pts[seg][1]) * local;
  return (
    <div style={{ position: "absolute", inset: 48, fontFamily: FONT_FILM }}>
      <div style={{ fontSize: t.answerText - 4, fontWeight: 600, color: INK2 }}>{panel.title}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginTop: 10 }}>
        <div style={{ fontSize: t.answerBig + 40, fontWeight: 700, letterSpacing: "-0.03em", color: INK, fontVariantNumeric: "tabular-nums" }}>
          {value.toFixed(1)}
          {panel.suffix ?? ""}
        </div>
        {panel.chip ? <div style={{ fontSize: t.answerText - 6, fontWeight: 600, color: GREEN }}>{panel.chip}</div> : null}
      </div>
      <svg width={cw} height={ch} style={{ position: "absolute", left: 0, bottom: 0, overflow: "visible" }}>
        <path d={d} fill="none" stroke={GREEN} strokeWidth={4} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
        <circle cx={tipX} cy={tipY} r={9} fill={GREEN} />
      </svg>
    </div>
  );
};

const RankList: React.FC<{ panel: Extract<Panel, { kind: "rank-list" }>; drawStart: number; drawEnd: number }> = ({ panel, drawStart, drawEnd }) => {
  const f = useCurrentFrame();
  const t = useFilm();
  // 넓은 행 간격에서 좁혀지며 들어온다
  const gap = interpolate(f, [drawStart, drawEnd], [64, 20], { ...clamp, easing: EASE_MOVE });
  return (
    <div style={{ position: "absolute", inset: 48, fontFamily: FONT_FILM, overflow: "hidden" }}>
      <div style={{ fontSize: t.answerText, fontWeight: 700, color: INK, marginBottom: 28 }}>{panel.title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap }}>
        {panel.rows.map((r, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "16px 22px",
              borderRadius: 16,
              background: r.me ? "#E5ECF2" : "transparent",
              fontSize: t.answerText - 2,
              fontWeight: r.me ? 700 : 500,
              color: INK,
            }}
          >
            <span>
              {i + 1}&nbsp;&nbsp;{r.label}
            </span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DocColumns: React.FC<{ panel: Extract<Panel, { kind: "doc-columns" }>; h: number }> = ({ panel, h }) => {
  const f = useCurrentFrame();
  const t = useFilm();
  const speed = 2.5; // 75px/s
  const col = (items: string[], dir: 1 | -1) => (
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: dir === 1 ? -h * 1.5 + f * speed : -f * speed, display: "flex", flexDirection: "column", gap: 18 }}>
        {[...items, ...items, ...items, ...items].map((s, i) => (
          <div
            key={i}
            style={{
              padding: 24,
              border: `${FILM.line}px solid #E5ECF2`,
              borderRadius: 16,
              background: "#FFFFFF",
              fontSize: t.answerText - 8,
              fontWeight: 500,
              lineHeight: 1.4,
              color: INK,
            }}
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 24, display: "flex", gap: 18, fontFamily: FONT_FILM }}>
      {col(panel.left, 1)}
      {col(panel.right, -1)}
    </div>
  );
};

const Stage: React.FC<{ frame: "soft" | "browser" | "panel"; p: Palette; children: React.ReactNode }> = ({ frame, p, children }) => {
  const box = FILM.frames[frame];
  const inner: React.CSSProperties =
    frame === "browser"
      ? { position: "absolute", left: 0, right: 0, top: 64, bottom: 0, overflow: "hidden" }
      : { position: "absolute", inset: frame === "soft" ? 18 : 36, background: "#FFFFFF", borderRadius: 24, overflow: "hidden", boxShadow: FILM.shadow };
  return (
    <div
      style={{
        position: "absolute",
        left: box.x,
        top: box.top,
        width: box.width,
        height: box.height,
        borderRadius: box.radius,
        overflow: "hidden",
        background: frame === "browser" ? "#FFFFFF" : frame === "soft" ? "#EEF6F9" : p.cardBody,
        border: frame === "browser" ? `${FILM.line}px solid #D9E0E6` : undefined,
        boxShadow: frame === "browser" ? FILM.shadow : undefined,
      }}
    >
      {frame === "browser" ? (
        <div style={{ position: "absolute", left: 28, top: 24, display: "flex", gap: 10 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 15, height: 15, borderRadius: 99, background: "#D9E0E6" }} />
          ))}
        </div>
      ) : null}
      <div style={inner}>{children}</div>
    </div>
  );
};

export const UiStage: React.FC<SceneProps<"ui-stage">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const { frame, panels, zoom, pip } = scene.props;
  const tl = uiStageTimeline(scene.props);
  const box = FILM.frames[frame];

  const pos = tl.panels.reduce((acc, pt, i) => {
    if (i === 0) return acc;
    if (panels[i].cut) return acc + (f >= pt.moveStart ? 1 : 0);
    return acc + interpolate(f, [pt.moveStart, pt.moveEnd], [0, 1], { ...clamp, easing: EASE_MOVE });
  }, 0);
  const zoomP = zoom ? interpolate(f, [zoom.at, zoom.at + tl.zoomFrames], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 0;
  const zoomScale = 1 + ((zoom?.to ?? 1) - 1) * zoomP;
  const pipD = (pip?.d ?? 210) - 60 * zoomP;
  const iw = box.width - 72;
  const ih = box.height - 72;

  return (
    <AbsoluteFill>
      <Stage frame={frame} p={p}>
        <div style={{ position: "absolute", inset: 0, scale: zoomScale, transformOrigin: `${(zoom?.origin?.[0] ?? 0.85) * 100}% ${(zoom?.origin?.[1] ?? 0.9) * 100}%` }}>
          {panels.map((pn, i) => {
            const pt = tl.panels[i];
            const media = pn.src ? (
              VIDEO_EXT.test(pn.src) ? (
                <Video src={staticFile(pn.src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Img src={staticFile(pn.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )
            ) : null;
            return (
              <div key={i} style={{ position: "absolute", inset: 0, translate: `${(i - pos) * PANEL_GAP}px 0` }}>
                {media ??
                  (pn.kind === "line-chart" ? (
                    <LineChart panel={pn} drawStart={pt.moveEnd} drawEnd={pt.drawEnd} w={iw} h={ih} />
                  ) : pn.kind === "rank-list" ? (
                    <RankList panel={pn} drawStart={pt.moveEnd - 10} drawEnd={pt.drawEnd} />
                  ) : (
                    <DocColumns panel={pn} h={ih} />
                  ))}
                {pn.sample ? (
                  <div style={{ position: "absolute", right: 28, top: 20, fontFamily: FONT_FILM, fontSize: 24, fontWeight: 600, color: INK2 }}>예시</div>
                ) : null}
              </div>
            );
          })}
        </div>
      </Stage>
      {pip ? (
        <div
          style={{
            position: "absolute",
            left: box.x + box.width - pipD - 24,
            top: box.top + box.height - pipD - 24,
            width: pipD,
            height: pipD,
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: FILM.shadow,
            background: "#E5ECF2",
          }}
        >
          {pip.src ? <Video src={staticFile(pip.src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
