// 요약: 아이콘들이 순서대로 연결선으로 이어지고, 마지막에 하나로 합쳐진다. 레퍼런스의 "탭 호핑 / 6개 도구 연결" 모티프.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Chip, GlyphTile } from "../components/ui";
import { FONT_UI } from "../fonts";
import { clamp, EASE_OUT } from "../theme";
import { T, iconFlowTimeline } from "../spec/timelines";
import type { SceneProps } from "./registry";

const AREA = 960; // 1080 - 좌우 여백 60*2
const TILE = 118;
const ROW_H = 300; // 아이콘 줄 + 라벨 + 합쳐진 타일(180)이 모두 들어가는 높이

export const IconFlow: React.FC<SceneProps<"icon-flow">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const { label, chip, icons, collapseTo } = scene.props;
  const tl = iconFlowTimeline(scene.props);
  const spacing = AREA / icons.length;
  const centers = icons.map((_, i) => spacing * (i + 0.5));
  const first = centers[0];
  const last = centers[centers.length - 1];
  const linkProg = interpolate(f, [tl.popEnd, tl.linksEnd], [0, 1], { ...clamp, easing: EASE_OUT });
  const collapse =
    tl.collapseAt === null ? 0 : interpolate(f, [tl.collapseAt, tl.collapseAt + 16], [0, 1], { ...clamp, easing: EASE_OUT });

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 90 }}>
        <Chip p={p}>
          <span style={{ color: p.accent, marginRight: 10 }}>●</span>
          {label}
        </Chip>
        {chip ? <Chip p={p}>{chip}</Chip> : null}
      </div>

      <div style={{ position: "relative", height: ROW_H }}>
        {/* 흩어진 아이콘들 — 합쳐질 때 사라진다 */}
        <div style={{ position: "absolute", inset: 0, opacity: 1 - collapse }}>
          <div style={{ position: "absolute", left: first, top: TILE / 2, width: last - first, height: 3, background: p.track }} />
          <div
            style={{
              position: "absolute",
              left: first,
              top: TILE / 2,
              width: (last - first) * linkProg,
              height: 3,
              background: p.accent,
              boxShadow: `0 0 24px ${p.accent}88`,
            }}
          />
          {icons.map((ic, i) => {
            const at = i * T.iconPopStagger;
            const pop = interpolate(f, [at, at + 10], [0, 1], { ...clamp, easing: EASE_OUT });
            const reached = linkProg >= (i === 0 ? 0 : (centers[i] - first) / (last - first) - 0.001);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: centers[i] - TILE / 2,
                  top: 0,
                  width: TILE,
                  textAlign: "center",
                  opacity: pop,
                  translate: `0 ${(1 - pop) * 20}px`,
                  scale: reached ? 1.06 : 1,
                }}
              >
                <GlyphTile
                  p={p}
                  glyph={ic.glyph}
                  size={TILE}
                  color={ic.color}
                  style={{
                    borderColor: reached ? p.accent : p.cardBorder,
                    boxShadow: reached ? `0 0 40px ${p.accent}55` : "none",
                    margin: "0 auto",
                  }}
                />
                {ic.label ? (
                  <div style={{ marginTop: 16, fontFamily: FONT_UI, fontSize: 24, color: p.sub, letterSpacing: "0.06em" }}>
                    {ic.label}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* 하나로 합쳐진 결과 — 같은 자리에 겹쳐 등장한다 */}
        {collapseTo && collapse > 0 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: collapse,
              scale: interpolate(collapse, [0, 1], [0.7, 1]),
            }}
          >
            <GlyphTile p={p} glyph={collapseTo.glyph} size={180} color={collapseTo.color} style={{ borderColor: p.accent }} />
            {collapseTo.label ? (
              <div style={{ marginTop: 24, fontFamily: FONT_UI, fontWeight: 600, fontSize: 34, letterSpacing: "0.1em", color: p.text }}>
                {collapseTo.label}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};
