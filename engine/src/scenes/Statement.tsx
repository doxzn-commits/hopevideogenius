// 요약: 화면 문구 전용 씬. 최대 두 줄(스키마가 강제), 두 번째 줄은 0.3초 뒤 등장하며 강조색을 줄 수 있다.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT_KR, FONT_UI } from "../fonts";
import { clamp, EASE_OUT } from "../theme";
import { TEXT, fitSize } from "../spec/layout";
import { statementTimeline } from "../spec/timelines";
import type { SceneProps } from "./registry";

export const Statement: React.FC<SceneProps<"statement">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const { kicker, lines, accentLine } = scene.props;
  const tl = statementTimeline(scene.props);
  // 두 줄의 크기를 맞추기 위해 가장 긴 줄 기준으로 한 번만 계산한다
  const size = fitSize(Math.max(...lines.map((l) => [...l].length)), TEXT.statementBase, TEXT.statementMin);

  return (
    <div style={{ width: "100%", textAlign: "center" }}>
      {kicker ? (
        <div
          style={{
            fontFamily: FONT_UI,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: p.sub,
            marginBottom: 44,
            opacity: interpolate(f, [0, 10], [0, 1], clamp),
          }}
        >
          {kicker}
        </div>
      ) : null}
      {lines.map((line, i) => {
        const at = i * tl.lineStagger;
        return (
          <div
            key={i}
            style={{
              fontFamily: FONT_KR,
              fontWeight: 900,
              fontSize: size,
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              letterSpacing: "-0.03em",
              color: i === accentLine ? p.accent : p.text,
              opacity: interpolate(f, [at, at + 12], [0, 1], clamp),
              // 아래에서 24px 올라오며 등장 (기획 원칙)
              translate: `0 ${interpolate(f, [at, at + 14], [24, 0], { ...clamp, easing: EASE_OUT })}px`,
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};
