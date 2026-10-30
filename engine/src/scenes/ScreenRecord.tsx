// 요약: 폰 목업 안에서 화면 녹화를 재생한다. 소재가 코드가 아니라 실제 녹화 파일이다.
// 파일이 없으면(src: null) 자리표시 프레임만 그려서, 녹화 전에 구성을 먼저 잡을 수 있다.
import React from "react";
import { interpolate, staticFile, useCurrentFrame } from "remotion";
import { Video } from "@remotion/media";
import { FONT_UI } from "../fonts";
import { clamp, EASE_OUT } from "../theme";
import { PHONE } from "../spec/layout";
import { screenRecordTimeline } from "../spec/timelines";
import type { SceneProps } from "./registry";

export const ScreenRecord: React.FC<SceneProps<"screen-record">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const { src, trimBefore, fit, placeholder } = scene.props;
  const tl = screenRecordTimeline();
  const inner = PHONE.radius - PHONE.bezel;

  return (
    <div
      style={{
        width: PHONE.width,
        height: PHONE.height,
        borderRadius: PHONE.radius,
        background: "#FFFFFF",
        padding: PHONE.bezel,
        boxShadow: "0 30px 80px rgba(20,20,40,0.16)",
        opacity: interpolate(f, [0, tl.frameIn], [0, 1], clamp),
        translate: `0 ${interpolate(f, [0, tl.frameIn + 4], [20, 0], { ...clamp, easing: EASE_OUT })}px`,
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: inner, overflow: "hidden", background: "#0E0E12" }}>
        {src ? (
          <Video
            src={staticFile(src)}
            trimBefore={trimBefore}
            // 녹화에는 보통 쓸 수 없는 소리가 들어 있다. 기본은 무음.
            volume={0}
            style={{ width: "100%", height: "100%", objectFit: fit ?? "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              background: "linear-gradient(180deg,#22222B 0%,#131318 100%)",
              fontFamily: FONT_UI,
              color: "rgba(255,255,255,0.55)",
              textAlign: "center",
              padding: 40,
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>녹화 파일 없음</div>
            <div style={{ fontSize: 24, lineHeight: 1.5 }}>
              {placeholder ?? "engine/public/screens/ 에 mp4 를 넣고 props.src 에 경로를 적으세요"}
            </div>
          </div>
        )}
      </div>
      {/* 하단 홈 인디케이터 — 폰처럼 보이게 하는 최소 장치 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          translate: "-50% 0",
          bottom: PHONE.bezel + 14,
          width: 150,
          height: 6,
          borderRadius: 3,
          background: "rgba(255,255,255,0.5)",
        }}
      />
    </div>
  );
};
