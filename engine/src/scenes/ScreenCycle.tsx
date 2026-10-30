// 요약: 전시형 — 타이틀 2행 + 전체폭 UI 밴드(스크린 교체) + 코드 창. 설명하지 않고 전시한다.
// 화면 교체는 **스켈레톤 → 콘텐츠** 순서다. 로딩을 연출해야 "진짜 앱"처럼 보인다.
import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { CodeWindow } from "../components/CodeWindow";
import { FONT_UI } from "../fonts";
import { clamp, EASE_OUT } from "../theme";
import { SHOWCASE } from "../spec/layout";
import { screenCycleTimeline } from "../spec/timelines";
import type { SceneProps } from "./registry";
import type { Palette } from "../theme";

/** 스크린샷이 없을 때 깔리는 회색 블록 — 레퍼런스의 로딩 상태와 같은 역할 */
const Skeleton: React.FC<{ seed: string; p: Palette }> = ({ seed, p }) => (
  <div style={{ width: "100%", height: "100%", background: "#F4F1F4", padding: 36, display: "flex", gap: 20 }}>
    <div style={{ width: 90, display: "flex", flexDirection: "column", gap: 14 }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ height: 30, borderRadius: 8, background: "rgba(20,20,30,0.07)" }} />
      ))}
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ height: 40, width: "42%", borderRadius: 10, background: "rgba(20,20,30,0.1)" }} />
      <div style={{ display: "flex", gap: 16, flex: 1 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              borderRadius: 14,
              background: i === 0 ? `${p.accent}33` : "rgba(20,20,30,0.06)",
              opacity: 0.6 + random(`${seed}${i}`) * 0.4,
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

export const ScreenCycle: React.FC<SceneProps<"screen-cycle">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const { title, screens, code, sweep } = scene.props;
  const tl = screenCycleTimeline(scene.props);
  const d = scene.durationInFrames;

  // 화면을 같은 길이로 나눠 차례로 보여준다
  const slot = d / screens.length;
  const index = Math.min(screens.length - 1, Math.floor(f / slot));
  const localF = f - index * slot;
  const screen = screens[index];
  const shown = localF >= tl.skeleton; // 스켈레톤이 먼저, 그다음 콘텐츠

  return (
    <AbsoluteFill style={{ background: p.bg }}>
      {/* 타이틀 2행 — 둘째 줄만 강조색 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          // 실측: 1행 중심 537, 2행 중심 615 → 블록 상단은 537 - 84/2
          top: SHOWCASE.title1Y - 42,
          textAlign: "center",
          fontFamily: FONT_UI,
          fontWeight: 700,
          fontSize: 84,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: p.text,
          opacity: interpolate(f, [tl.titleIn, tl.titleIn + 12], [0, 1], clamp),
          translate: `0 ${interpolate(f, [tl.titleIn, tl.titleIn + 14], [14, 0], { ...clamp, easing: EASE_OUT })}px`,
        }}
      >
        <div style={{ height: 84 }}>{title.line1}</div>
        <div style={{ height: 70, fontSize: 70, color: p.accent }}>{title.line2}</div>
      </div>

      {/* UI 밴드 — 좌우가 화면 밖으로 잘린다. 작게 줄여 전부 보여주면 디테일이 죽는다 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: SHOWCASE.bandTop,
          height: SHOWCASE.bandHeight,
          overflow: "hidden",
          background: "#F4F1F4",
          opacity: interpolate(f, [tl.bandIn, tl.bandIn + 12], [0, 1], clamp),
        }}
      >
        {screen.src && shown ? (
          <Img
            src={staticFile(screen.src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
              opacity: interpolate(localF, [tl.skeleton, tl.skeleton + 8], [0, 1], clamp),
            }}
          />
        ) : (
          <Skeleton seed={`s${index}`} p={p} />
        )}
        {screen.label ? (
          <div
            style={{
              position: "absolute",
              left: 28,
              bottom: 20,
              fontFamily: FONT_UI,
              fontSize: 22,
              color: "rgba(20,20,30,0.45)",
            }}
          >
            {screen.label}
          </div>
        ) : null}
      </div>

      {code ? (
        <CodeWindow
          lang={code.lang}
          lines={code.lines}
          width={SHOWCASE.codeWidth}
          height={SHOWCASE.codeHeight}
          style={{
            position: "absolute",
            left: SHOWCASE.codeX,
            top: SHOWCASE.codeTop,
            opacity: interpolate(f, [tl.codeIn, tl.codeIn + 12], [0, 1], clamp),
          }}
        />
      ) : null}

      {/* 마무리 대각선 스윕 — 루프 이음새를 가린다 */}
      {sweep ? (
        <div
          style={{
            position: "absolute",
            inset: "-20%",
            background: `linear-gradient(105deg, transparent 40%, ${p.bg} 46%, ${p.bg} 54%, transparent 60%)`,
            translate: `${interpolate(f, [d - 18, d], [-160, 160], { ...clamp, easing: EASE_OUT })}% 0`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
