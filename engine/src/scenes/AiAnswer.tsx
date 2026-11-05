// 요약: 프롬프트 pill → 답변 → (유리 카드 | 공책). 같은 prompt 를 두 번 쓰고 두 번째를 tilt 로 두면 콜백이 된다. 3D 는 tilt 에서만.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT_FILM } from "../fonts";
import { HandLine, NotebookPaper, Spark, useFilm } from "../components/film";
import { aiAnswerTimeline } from "../spec/timelines";
import { clamp, EASE_MOVE, EASE_REVEAL, FILM, type Palette } from "../theme";
import type { SceneOf } from "../spec/schema";
import type { SceneProps } from "./registry";

type Props = SceneOf<"ai-answer">["props"];

/** 글자 공개: 레이아웃이 흔들리지 않게 안 보이는 나머지를 같이 그린다 */
const Typed: React.FC<{ text: string; shown: number }> = ({ text, shown }) => {
  const chars = [...text];
  return (
    <>
      {chars.slice(0, shown).join("")}
      <span style={{ opacity: 0 }}>{chars.slice(shown).join("")}</span>
    </>
  );
};

const Pill: React.FC<{ prompt: string; shown: number; sent: number; p: Palette }> = ({ prompt, shown, sent, p }) => {
  const t = useFilm();
  return (
    <div
      style={{
        position: "relative",
        width: FILM.pill.width,
        padding: "34px 132px 34px 52px",
        boxSizing: "border-box",
        border: `${FILM.line}px solid rgba(255,255,255,0.55)`,
        borderRadius: FILM.pill.radius,
        fontFamily: FONT_FILM,
        fontWeight: 500,
        fontSize: t.pillText,
        lineHeight: 1.36,
        letterSpacing: "-0.02em",
        color: p.text,
        whiteSpace: "pre-line",
      }}
    >
      <Typed text={prompt} shown={shown} />
      {/* 전송 버튼 뒤 글로우 — 원 하나. 블룸 금지 */}
      <div
        style={{
          position: "absolute",
          right: -50,
          top: "50%",
          width: 260,
          height: 260,
          translate: "0 -50%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(38,92,255,0.62) 0%, rgba(38,92,255,0.2) 42%, rgba(38,92,255,0) 70%)",
          opacity: 0.55 + 0.45 * sent,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 32,
          top: "50%",
          translate: "0 -50%",
          width: 76,
          height: 76,
          borderRadius: "50%",
          border: `${FILM.line}px solid rgba(255,255,255,0.7)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20V4M5 11l7-7 7 7" />
        </svg>
      </div>
    </div>
  );
};

const AnswerLine: React.FC<{ line: Props["answer"][number]; p: Palette }> = ({ line, p }) => {
  const t = useFilm();
  const { text, hl, big } = line;
  const body = hl && text.includes(hl) ? text.split(hl) : null;
  return (
    <div
      style={{
        fontFamily: FONT_FILM,
        fontWeight: big ? 700 : 500,
        fontSize: big ? t.answerBig : t.answerText,
        lineHeight: 1.4,
        letterSpacing: "-0.02em",
        color: p.text,
      }}
    >
      {body ? (
        <>
          {body[0]}
          <span style={{ color: p.link }}>{hl}</span>
          {body.slice(1).join(hl ?? "")}
        </>
      ) : (
        text
      )}
    </div>
  );
};

const GlassCard: React.FC<{ card: NonNullable<Props["cards"]>[number]; p: Palette }> = ({ card, p }) => {
  const t = useFilm();
  return (
    <div
      style={{
        width: FILM.glass.width,
        height: FILM.glass.height,
        boxSizing: "border-box",
        padding: 42,
        background: p.card,
        border: `${FILM.line}px solid ${p.cardBorder}`,
        borderRadius: FILM.glass.radius,
        overflow: "hidden",
        fontFamily: FONT_FILM,
        color: p.text,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        position: "relative",
      }}
    >
      <div style={{ fontSize: t.answerText + 6, fontWeight: 700, letterSpacing: "-0.02em" }}>{card.title}</div>
      {card.meta ? <div style={{ fontSize: t.answerText - 8, fontWeight: 500, color: p.sub }}>{card.meta}</div> : null}
      <div style={{ flex: 1, display: "flex", gap: 16, marginRight: -120, minHeight: 0 }}>
        {[0, 1].map((i) => {
          const src = card.images?.[i];
          return src ? (
            <Img key={i} src={staticFile(src)} style={{ width: 430, height: "100%", objectFit: "cover", borderRadius: 15 }} />
          ) : (
            <div key={i} style={{ width: 430, height: "100%", borderRadius: 15, background: "linear-gradient(150deg, #2A2F36 0%, #15181C 100%)" }} />
          );
        })}
      </div>
      {card.button ? (
        <div
          style={{
            height: 112,
            flexShrink: 0,
            borderRadius: 999,
            background: p.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: t.answerText,
            fontWeight: 600,
          }}
        >
          {card.button}
        </div>
      ) : null}
      {card.sample ? <div style={{ position: "absolute", right: 42, top: 42, fontSize: 24, color: p.sub }}>예시</div> : null}
    </div>
  );
};

export const AiAnswer: React.FC<SceneProps<"ai-answer">> = ({ scene, p }) => {
  const f = useCurrentFrame();
  const t = useFilm();
  const props = scene.props;
  const tl = aiAnswerTimeline(props);
  const tilt = props.mode === "tilt";

  const chars = [...props.prompt];
  const started = Math.round(chars.length * (props.startTyped ?? 0));
  const shown = Math.round(interpolate(f, [tl.typeStart, tl.typeEnd], [started, chars.length], clamp));
  const sent = interpolate(f, [tl.sentAt, tl.sentAt + 8], [0, 1], clamp);

  // 콜백은 기울어 올라오는 공책 자리를 비워 줘야 해서 더 높이 올라간다
  const riseBy = tilt ? FILM.pill.riseBy + FILM.tilt.lift : FILM.pill.riseBy;
  const pillRise = interpolate(f, [tl.riseStart, tl.riseEnd], [0, -riseBy], { ...clamp, easing: EASE_MOVE });
  const pillHeight = t.pillText * 1.36 * props.prompt.split("\n").length + 68;
  const answerTop = FILM.pill.top - riseBy + pillHeight + 46;

  const cards = props.cards ?? [];
  const hasCards = !tilt && cards.length > 0;
  const firstRise = interpolate(f, [tl.stackAt, tl.stackAt + tl.cardRise], [1, 0], { ...clamp, easing: EASE_REVEAL });
  const back = hasCards ? 1 - firstRise : 0;
  // 카드 슬라이드: 간격은 화면폭이다
  const slid = cards.reduce((acc, _, i) => {
    if (i === 0) return acc;
    const at = tl.stackAt + tl.cardRise + i * tl.cardHold + (i - 1) * tl.cardSlide;
    return acc + interpolate(f, [at, at + tl.cardSlide], [0, 1], { ...clamp, easing: EASE_MOVE });
  }, 0);

  const tiltIn = interpolate(f, [tl.stackAt, tl.stackAt + tl.tiltRise], [0, 1], { ...clamp, easing: EASE_REVEAL });
  const drift = interpolate(f, [tl.stackAt + tl.tiltRise, tl.stackAt + tl.tiltRise + tl.tiltDrift * 2], [0, 1], clamp);

  return (
    <AbsoluteFill>
      {tilt ? (
        // 왼쪽 아래 글로우 — 이 샷에만 있다
        <AbsoluteFill style={{ background: "radial-gradient(60% 26% at 12% 72%, rgba(40,110,120,0.32) 0%, rgba(40,110,120,0) 100%)" }} />
      ) : null}
      <AbsoluteFill style={{ filter: back > 0 ? `blur(${back * 10}px) brightness(${1 - back * 0.6})` : undefined }}>
        <div style={{ position: "absolute", left: FILM.pill.x, top: FILM.pill.top, translate: `0 ${pillRise}px` }}>
          <Pill prompt={props.prompt} shown={shown} sent={sent} p={p} />
        </div>
        {props.answer.length > 0 ? (
          <div style={{ position: "absolute", left: FILM.pill.x + 40, right: FILM.pill.x + 40, top: answerTop, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ opacity: interpolate(f, [tl.answerStart, tl.answerStart + 10], [0, 1], clamp), marginBottom: 6 }}>
              <Spark size={t.answerText} color={p.text} />
            </div>
            {props.answer.map((ln, i) => {
              const at = tl.answerStart + i * tl.answerStagger;
              return (
                <div key={i} style={{ opacity: interpolate(f, [at, at + 10], [0, 1], clamp) }}>
                  <AnswerLine line={ln} p={p} />
                </div>
              );
            })}
          </div>
        ) : null}
      </AbsoluteFill>

      {hasCards
        ? cards.map((c, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: FILM.glass.x,
                top: FILM.glass.top,
                translate: `${(i - slid) * 1082}px ${firstRise * 500}px`,
                opacity: interpolate(f, [tl.stackAt, tl.stackAt + 6], [0, 1], clamp),
              }}
            >
              <GlassCard card={c} p={p} />
            </div>
          ))
        : null}

      {tilt && (props.notebook || cards[0]) ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: FILM.tilt.top, display: "flex", justifyContent: "center", perspective: FILM.tilt.perspective, perspectiveOrigin: "50% 20%" }}>
          <div
            style={{
              translate: `0 ${(1 - tiltIn) * 1100 - drift * 60}px`,
              rotate: `x ${FILM.tilt.deg}deg`,
              transformOrigin: "50% 0%",
              scale: 1 - drift * 0.06,
            }}
          >
            {props.notebook ? (
              <NotebookPaper
                p={p}
                width={FILM.notebook.width}
                // 내용 줄 수에 맞춘다. 화면 끝까지 빈 종이를 깔면 미완성처럼 보이고 다음 컷의 명암 대비가 죽는다
                height={FILM.tilt.ruleTop + props.notebook.lines.length * FILM.tilt.rule + FILM.tilt.padBottom}
                ruleTop={FILM.tilt.ruleTop}
                rule={FILM.tilt.rule}
              >
                <div style={{ position: "absolute", left: FILM.tilt.padLeft, top: FILM.tilt.ruleTop }}>
                  {props.notebook.lines.map((ln, i) => (
                    <div key={i} style={{ height: FILM.tilt.rule, lineHeight: `${FILM.tilt.rule}px`, translate: "0 14px" }}>
                      <HandLine text={ln} start={0} end={0} size={t.tiltHand} />
                    </div>
                  ))}
                </div>
              </NotebookPaper>
            ) : (
              <GlassCard card={cards[0]} p={p} />
            )}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
