// 요약: 목록의 토글이 차례로 켜지는 인트로. 카드 머리글의 N/total 이 같은 타임라인으로 같이 올라간다.
// 영상 전체의 목차 역할 — "이 N개를 보여주겠다"를 3초 안에 약속한다.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT_UI } from "../fonts";
import { CARD_INK, CARD_SUB, clamp, EASE_OUT } from "../theme";
import { toggleListTimeline } from "../spec/timelines";
import type { SceneProps } from "./registry";

export const ToggleList: React.FC<SceneProps<"toggle-list">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const { items } = scene.props;
  const tl = toggleListTimeline(scene.props);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
      {items.map((it, i) => {
        const onAt = tl.startAt + i * tl.stagger;
        const on = f >= onAt;
        const knob = interpolate(f, [onAt, onAt + 8], [0, 1], { ...clamp, easing: EASE_OUT });
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "18px 20px",
              borderRadius: 20,
              // 막 켜진 줄만 살짝 밝게 — 어디가 바뀌었는지 눈이 따라간다
              background: on ? `rgba(30,25,20,${0.05 * (1 - Math.min(1, (f - onAt) / 20))})` : "transparent",
            }}
          >
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: 18,
                background: it.tint ?? "#1A1A1A",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT_UI,
                fontWeight: 700,
                fontSize: 28,
                flexShrink: 0,
              }}
            >
              {it.glyph}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 34, color: CARD_INK }}>{it.name}</div>
              {it.sub ? (
                <div style={{ fontFamily: FONT_UI, fontSize: 26, color: CARD_SUB, marginTop: 2 }}>{it.sub}</div>
              ) : null}
            </div>
            <div
              style={{
                width: 84,
                height: 46,
                borderRadius: 23,
                background: on ? "#2F7CF6" : p.track,
                display: "flex",
                alignItems: "center",
                padding: 5,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  translate: `${knob * 38}px 0`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
