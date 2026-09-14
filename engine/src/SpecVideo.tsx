// 요약: spec 하나를 영상으로 조립한다. 레이어 순서 = 배경 → 그래픽 → 사람 → 자막 → (게이트 경고). 순서를 바꾸면 자막이 얼굴에 가린다.
import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { useCurrentFrame } from "remotion";
import { SCENES } from "./scenes/registry";
import { Glow } from "./components/ui";
import { Captions } from "./components/Captions";
import { TalkingHead } from "./components/TalkingHead";
import { LAYOUTS, PALETTES, SIDE } from "./theme";
import { FONT_MONO } from "./fonts";
import type { Scene, VideoSpec } from "./spec/schema";
import type { Issue } from "./spec/gate";

export const totalFrames = (spec: VideoSpec) => spec.scenes.reduce((a, s) => a + s.durationInFrames, 0);

const SceneFrame: React.FC<{ scene: Scene }> = ({ scene }) => {
  const p = PALETTES[scene.palette];
  const box = LAYOUTS[scene.layout].graphic;
  const Comp = SCENES[scene.type] as React.FC<{ scene: Scene; p: typeof p }>;
  return (
    <AbsoluteFill>
      <Glow p={p} seed={scene.palette} />
      {box ? (
        <div
          style={{
            position: "absolute",
            left: SIDE,
            right: SIDE,
            top: box.top,
            height: box.bottom - box.top,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Comp scene={scene} p={p} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const GateBanner: React.FC<{ issues: Issue[] }> = ({ issues }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      padding: 24,
      background: "rgba(180,20,20,0.92)",
      fontFamily: FONT_MONO,
      fontSize: 22,
      color: "white",
      lineHeight: 1.5,
    }}
  >
    ⚠ SPEC 게이트 실패 ({issues.length}) — npm run lint:spec
    {issues.slice(0, 4).map((i, n) => (
      <div key={n}>
        · {i.where}: {i.msg}
      </div>
    ))}
  </div>
);

export const SpecVideo: React.FC<{ spec: VideoSpec; issues: Issue[] }> = ({ spec, issues }) => {
  const frame = useCurrentFrame();
  const errors = issues.filter((i) => i.level === "error");

  let acc = 0;
  let active = spec.scenes[spec.scenes.length - 1];
  for (const s of spec.scenes) {
    if (frame < acc + s.durationInFrames) {
      active = s;
      break;
    }
    acc += s.durationInFrames;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Series>
        {spec.scenes.map((s, i) => (
          <Series.Sequence key={i} durationInFrames={s.durationInFrames} name={`${i + 1}·${s.type}`}>
            <SceneFrame scene={s} />
          </Series.Sequence>
        ))}
      </Series>
      <TalkingHead src={spec.talkingHead} layout={active.layout} />
      <Series>
        {spec.scenes.map((s, i) => (
          <Series.Sequence key={i} durationInFrames={s.durationInFrames} name={`자막 ${i + 1}`}>
            <Captions captions={s.captions} y={LAYOUTS[s.layout].captionY} />
          </Series.Sequence>
        ))}
      </Series>
      {errors.length > 0 ? <GateBanner issues={errors} /> : null}
    </AbsoluteFill>
  );
};
