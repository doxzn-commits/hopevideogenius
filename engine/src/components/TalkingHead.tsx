// 요약: 사람 영상 레이어. 레이아웃에 따라 하단 영역(split)·전체(full-face)·숨김(full-graphic). 영상이 없으면 자리표시 실루엣.
import React from "react";
import { staticFile } from "remotion";
import { Video } from "@remotion/media";
import { LAYOUTS } from "../theme";
import { FONT_UI } from "../fonts";
import type { LayoutName } from "../spec/schema";

const Placeholder: React.FC = () => (
  <div
    style={{
      width: "100%",
      height: "100%",
      background: "linear-gradient(180deg, #2C2C33 0%, #131317 100%)",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      position: "relative",
    }}
  >
    <div style={{ position: "absolute", bottom: -120, width: 620, height: 620, borderRadius: "50%", background: "rgba(255,255,255,0.09)" }} />
    <div style={{ position: "absolute", bottom: 250, width: 260, height: 300, borderRadius: "48%", background: "rgba(255,255,255,0.13)" }} />
    <div
      style={{
        position: "absolute",
        top: 40,
        fontFamily: FONT_UI,
        fontSize: 24,
        letterSpacing: "0.18em",
        color: "rgba(255,255,255,0.45)",
      }}
    >
      TALKING HEAD — spec.talkingHead 에 경로를 넣으세요
    </div>
  </div>
);

export const TalkingHead: React.FC<{ src: string | null; layout: LayoutName }> = ({ src, layout }) => {
  const face = LAYOUTS[layout].face;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: face ? face.top : 1920,
        bottom: 0,
        borderTopLeftRadius: face ? face.radius : 0,
        borderTopRightRadius: face ? face.radius : 0,
        overflow: "hidden",
        opacity: face ? 1 : 0,
      }}
    >
      {src ? (
        <Video src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 25%" }} />
      ) : (
        <Placeholder />
      )}
    </div>
  );
};
