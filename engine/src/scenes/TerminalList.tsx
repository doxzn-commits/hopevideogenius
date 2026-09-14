// 요약: 명령 타이핑 → 결과 행 스태거 등장 → 진행바 채움 → 1위 행 하이라이트. 레퍼런스의 "스킬 랭킹/설치 리스트" 모티프.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Card, Chip, GlyphTile, MonoLine } from "../components/ui";
import { FONT_MONO, FONT_UI } from "../fonts";
import { clamp, EASE_OUT } from "../theme";
import { T, terminalListTimeline } from "../spec/timelines";
import type { SceneProps } from "./registry";

export const TerminalList: React.FC<SceneProps<"terminal-list">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const { header, chip, command, rows, highlight, highlightBadge } = scene.props;
  const tl = terminalListTimeline(scene.props);
  const typed = Math.floor(interpolate(f, [tl.typeStart, tl.typeEnd], [0, command.length], clamp));
  const hlProg =
    tl.highlightAt === null ? 0 : interpolate(f, [tl.highlightAt, tl.highlightAt + 10], [0, 1], { ...clamp, easing: EASE_OUT });

  return (
    <Card p={p} label={header} windowDots chip={chip ? <Chip p={p}>{chip}</Chip> : undefined}>
      <MonoLine p={p} text={command.slice(0, typed)} cursorOn={Math.floor(f / 8) % 2 === 0} />
      <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map((r, i) => {
          const s = tl.rowsStart + i * T.rowStagger;
          const inP = interpolate(f, [s, s + 8], [0, 1], { ...clamp, easing: EASE_OUT });
          const bar = interpolate(f, [s + 4, s + 4 + T.barFill], [0, r.value], { ...clamp, easing: EASE_OUT });
          const isHl = i === highlight;
          const dim = highlight !== undefined && !isHl ? 1 - 0.55 * hlProg : 1;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "14px 18px",
                borderRadius: 20,
                opacity: inP * dim,
                translate: `0 ${(1 - inP) * 24}px`,
                scale: isHl ? 1 + 0.04 * hlProg : 1,
                background: isHl ? `${p.accent}${Math.round(hlProg * 34).toString(16).padStart(2, "0")}` : "transparent",
                border: `1.5px solid ${isHl ? `${p.accent}${Math.round(hlProg * 150).toString(16).padStart(2, "0")}` : "transparent"}`,
                boxShadow: isHl ? `0 0 ${60 * hlProg}px ${p.accent}44` : "none",
              }}
            >
              <div style={{ fontFamily: FONT_MONO, fontSize: 26, color: p.sub, width: 44 }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <GlyphTile p={p} glyph={r.glyph} size={52} />
              <div
                style={{
                  fontFamily: FONT_UI,
                  fontSize: 32,
                  fontWeight: 600,
                  color: p.text,
                  flex: "0 0 320px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {r.name}
              </div>
              {isHl && highlightBadge ? (
                <Chip p={p} accent style={{ fontSize: 22, padding: "6px 16px", opacity: hlProg }}>
                  {highlightBadge}
                </Chip>
              ) : null}
              <div style={{ flex: 1, height: 10, borderRadius: 5, background: p.track, overflow: "hidden" }}>
                <div style={{ width: `${bar * 100}%`, height: "100%", borderRadius: 5, background: p.accent }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
