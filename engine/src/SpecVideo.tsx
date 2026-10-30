// 요약: spec 하나를 영상으로 조립한다. 레이어 순서 = 배경 → 그래픽 → 사람 → 자막 → (게이트 경고). 순서를 바꾸면 자막이 얼굴에 가린다.
import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { useCurrentFrame } from "remotion";
import { SCENES } from "./scenes/registry";
import { Glow } from "./components/ui";
import { Captions } from "./components/Captions";
import { CardShell } from "./components/CardShell";
import { TalkingHead } from "./components/TalkingHead";
import { CARD_BODY, resolveLayout } from "./spec/layout";
import { toggleOnCount } from "./spec/timelines";
import { PALETTES, SIDE } from "./theme";
import { FONT_MONO } from "./fonts";
import type { Scene, VideoSpec } from "./spec/schema";
import type { Issue } from "./spec/gate";

export const totalFrames = (spec: VideoSpec) => spec.scenes.reduce((a, s) => a + s.durationInFrames, 0);

const SceneFrame: React.FC<{ scene: Scene; faceless: boolean }> = ({ scene, faceless }) => {
  const p = PALETTES[scene.palette];
  const layout = resolveLayout(scene.layout, { faceless, hasCaptions: scene.captions.length > 0 });
  const box = layout.graphic;
  const Comp = SCENES[scene.type] as React.FC<{ scene: Scene; p: typeof p }>;
  const bottom = box?.bottom; // 확장은 resolveLayout 이 이미 했다
  // 전시형: 타이틀·밴드·코드 창까지 씬이 화면 전체를 직접 그린다
  if (scene.layout === "showcase") {
    const Full = SCENES[scene.type] as React.FC<{ scene: Scene; p: typeof p }>;
    return <Full scene={scene} p={p} />;
  }

  // 카드형: 틀은 SpecVideo 가 씬 밖에서 그리고(그래서 씬이 바뀌어도 유지된다), 여기서는 내용만 카드 안쪽에 그린다
  if (scene.layout === "card") {
    const Inner = SCENES[scene.type] as React.FC<{ scene: Scene; p: typeof p }>;
    return (
      <AbsoluteFill>
        <div style={{ position: "absolute", left: CARD_BODY.left, top: CARD_BODY.top, width: CARD_BODY.width, height: CARD_BODY.height }}>
          <Inner scene={scene} p={p} />
        </div>
      </AbsoluteFill>
    );
  }

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
            height: (bottom ?? box.bottom) - box.top,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* 사람이 없으면 그래픽을 12% 키운다 (폭 960×1.12=1075 로 1080 안에 겨우 들어간다) */}
          <div style={{ width: "100%", scale: faceless && scene.layout === "full-graphic" ? 1.12 : 1 }}>
            <Comp scene={scene} p={p} />
          </div>
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
  let activeStart = 0;
  for (const s of spec.scenes) {
    if (frame < acc + s.durationInFrames) {
      active = s;
      activeStart = acc;
      break;
    }
    acc += s.durationInFrames;
    activeStart = acc;
  }

  const activeP = PALETTES[active.palette];

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* 카드형 배경 + 카드 틀 — 씬 밖에 있으므로 씬이 바뀌어도 그대로 있다 (컷 없이 내용만 교체) */}
      {active.layout === "card" ? (
        <>
          <AbsoluteFill style={{ backgroundColor: activeP.bg }} />
          {active.card ? (
            <CardShell
              p={activeP}
              card={
                // toggle-list 는 켜진 토글 수가 곧 진행 숫자다 — 씬과 머리글이 같은 타임라인을 쓴다
                active.type === "toggle-list"
                  ? { ...active.card, index: toggleOnCount(active.props, frame - activeStart) }
                  : active.card
              }
            />
          ) : null}
        </>
      ) : null}
      <Series>
        {spec.scenes.map((s, i) => (
          <Series.Sequence key={i} durationInFrames={s.durationInFrames} name={`${i + 1}·${s.type}`}>
            <SceneFrame scene={s} faceless={spec.talkingHead === null} />
          </Series.Sequence>
        ))}
      </Series>
      <TalkingHead src={spec.talkingHead} layout={active.layout} />
      <Series>
        {spec.scenes.map((s, i) => (
          <Series.Sequence key={i} durationInFrames={s.durationInFrames} name={`자막 ${i + 1}`}>
            <Captions
              captions={s.captions}
              y={resolveLayout(s.layout, { faceless: spec.talkingHead === null, hasCaptions: s.captions.length > 0 }).captionY}
              // 단색 배경(flat 팔레트)에서는 외곽선이 필요 없다 — 외곽선·노란 강조는 사진/그래픽 위에서만 쓴다
              style={s.captionStyle ?? (["card", "stack", "phone"].includes(s.layout) || PALETTES[s.palette].flat ? "plain" : "overlay")}
              // 자막은 카드 밖(배경 위)이라 색은 배경 기준이다. 카드 안쪽 색(CARD_INK)과 혼동하지 말 것.
              color={PALETTES[s.palette].text}
              hlColor={
                ["card", "stack", "phone"].includes(s.layout) || PALETTES[s.palette].flat
                  ? PALETTES[s.palette].accent
                  : undefined
              }
            />
          </Series.Sequence>
        ))}
      </Series>
      {errors.length > 0 ? <GateBanner issues={errors} /> : null}
    </AbsoluteFill>
  );
};
