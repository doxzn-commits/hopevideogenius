// 요약: 팔로우 → 댓글 키워드 입력 → DM 도착. 숏폼 CTA 3단을 한 씬에서 순서대로 보여준다.
// 요구 행동은 둘(팔로우·댓글)이지만 화면은 한 번에 하나씩만 움직인다.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT_UI } from "../fonts";
import { CARD_INK, CARD_SUB, clamp, EASE_OUT } from "../theme";
import { socialCtaTimeline } from "../spec/timelines";
import { CARD } from "../spec/layout";
import type { SceneProps } from "./registry";
import type { Palette } from "../theme";

const Sheet: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 32,
        padding: 28,
        boxShadow: "0 24px 70px rgba(0,0,0,0.25)",
        opacity: interpolate(f, [at, at + 10], [0, 1], clamp),
        translate: `0 ${interpolate(f, [at, at + 14], [24, 0], { ...clamp, easing: EASE_OUT })}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const SocialCta: React.FC<SceneProps<"social-cta">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const { profile, follow, comment, dm } = scene.props;
  const tl = socialCtaTimeline(scene.props);
  const followed = f >= tl.followAt;
  const typed = Math.floor(interpolate(f, [tl.typeStart, tl.typeEnd], [0, [...comment.keyword].length], clamp));
  const accent = p.cardAccent ?? p.accent;

  return (
    // 폭을 카드형 씬(CARD.width)과 맞춰, 카드 구간에서 넘어와도 덩어리 크기가 변하지 않는다
    <div style={{ height: "100%", width: "100%", maxWidth: CARD.width, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1단 — 프로필: 팔로우 → 팔로잉 으로 상태가 바뀐다 */}
      <Sheet at={tl.profileIn}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 86,
              height: 86,
              borderRadius: "50%",
              background: "#1A1A1A",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_UI,
              fontWeight: 700,
              fontSize: 36,
            }}
          >
            {profile.glyph ?? profile.name.slice(0, 1)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 38, color: CARD_INK }}>{profile.name}</div>
            <div style={{ fontFamily: FONT_UI, fontSize: 28, color: CARD_SUB }}>{profile.handle}</div>
          </div>
        </div>
        <div
          style={{
            marginTop: 20,
            padding: "16px 0",
            borderRadius: 16,
            textAlign: "center",
            fontFamily: FONT_UI,
            fontWeight: 700,
            fontSize: 32,
            background: followed ? "rgba(30,25,20,0.06)" : accent,
            color: followed ? CARD_INK : "#FFFFFF",
            scale: interpolate(f, [tl.followAt, tl.followAt + 6, tl.followAt + 12], [1, 1.03, 1], clamp),
          }}
        >
          {followed ? follow.after : follow.before}
        </div>
      </Sheet>

      {/* 2단 — 댓글: 키워드를 한 글자씩 친다 */}
      <Sheet at={tl.commentIn} style={{ flex: 1 }}>
        <div style={{ textAlign: "center", fontFamily: FONT_UI, fontWeight: 700, fontSize: 32, color: CARD_INK, paddingBottom: 20, borderBottom: "1.5px solid rgba(30,25,20,0.08)" }}>
          {comment.title}
        </div>
        <div style={{ display: "flex", gap: 18, paddingTop: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(30,25,20,0.08)", flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: FONT_UI, fontSize: 26, color: CARD_SUB }}>{comment.me ?? "나"}</div>
            <div style={{ fontFamily: FONT_UI, fontWeight: 900, fontSize: 48, color: accent, letterSpacing: "-0.02em" }}>
              {[...comment.keyword].slice(0, typed).join("")}
              {typed < [...comment.keyword].length && Math.floor(f / 6) % 2 === 0 ? (
                <span style={{ opacity: 0.6 }}>|</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* 3단 — DM 도착 */}
        {dm && f >= tl.dmAt ? (
          <div
            style={{
              marginTop: 24,
              background: "#20261D",
              borderRadius: 24,
              padding: 24,
              opacity: interpolate(f, [tl.dmAt, tl.dmAt + 10], [0, 1], clamp),
              translate: `0 ${interpolate(f, [tl.dmAt, tl.dmAt + 12], [16, 0], { ...clamp, easing: EASE_OUT })}px`,
            }}
          >
            <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 24, color: accent }}>{dm.badge}</div>
            <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 34, color: "#FFFFFF", marginTop: 6 }}>
              {dm.headline}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, background: "#FFFFFF", borderRadius: 18, padding: 18, marginTop: 18 }}>
              <div style={{ width: 62, height: 62, borderRadius: 16, background: "#1A1A1A", flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: FONT_UI, fontWeight: 700, fontSize: 30, color: CARD_INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {dm.title}
                </div>
                {dm.sub ? <div style={{ fontFamily: FONT_UI, fontSize: 24, color: CARD_SUB }}>{dm.sub}</div> : null}
              </div>
            </div>
          </div>
        ) : null}
      </Sheet>
    </div>
  );
};

export type { Palette };
