// 요약: 필름형 공용 부품 — 글자 토큰 컨텍스트, 상시 로고, 스파크, 공책 종이, 손글씨, 밑줄. 값은 전부 layout.ts FILM·FILM_TOKENS 에서 온다.
import React, { createContext, useContext } from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT_FILM, FONT_HAND } from "../fonts";
import { FILM, FILM_TOKENS, type FilmTokens } from "../spec/layout";
import { clamp, EASE_MOVE, type Palette } from "../theme";

/** 프로필별 글자 크기. SpecVideo 가 spec.profile 로 채운다 */
export const FilmContext = createContext<FilmTokens>(FILM_TOKENS["product-film"]);
export const useFilm = () => useContext(FilmContext);

/** 상시 로고. 받은 로고가 없으면 워드마크다 — 심벌을 지어내지 않는다 */
export const Brand: React.FC<{ brand: { text: string; logo?: string }; color: string }> = ({ brand, color }) => {
  const t = useFilm();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: FILM.brandY,
        translate: "0 -50%",
        display: "flex",
        justifyContent: "center",
        fontFamily: FONT_FILM,
        fontWeight: 700,
        fontSize: t.brand,
        letterSpacing: "-0.02em",
        color,
      }}
    >
      {brand.logo ? <Img src={staticFile(brand.logo)} style={{ height: t.brand }} /> : brand.text}
    </div>
  );
};

export const Spark: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 0c1 7 4 11 12 12-8 1-11 5-12 12-1-7-4-11-12-12 8-1 11-5 12-12z" />
  </svg>
);

/** 줄이 쳐진 공책 종이. 줄 간격과 글자 줄이 같은 값을 쓴다 */
export const NotebookPaper: React.FC<{
  p: Palette;
  width: number;
  height: number;
  ruleTop: number;
  rule?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ p, width, height, ruleTop, rule = FILM.notebook.rule, children, style }) => (
  <div
    style={{
      position: "relative",
      width,
      height,
      background: "#FFFFFF",
      border: `${FILM.line}px solid ${p.dark ? "rgba(255,255,255,0.5)" : "#D9E0E6"}`,
      borderRadius: FILM.notebook.radius,
      boxShadow: FILM.shadow,
      overflow: "hidden",
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: ruleTop,
        bottom: 0,
        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${rule - 2}px, #E3E8ED ${rule - 2}px, #E3E8ED ${rule}px)`,
      }}
    />
    {children}
  </div>
);

/** 손글씨 한 줄. 왼쪽에서 오른쪽으로 써진다 */
export const HandLine: React.FC<{ text: string; start: number; end: number; size: number; color?: string }> = ({
  text,
  start,
  end,
  size,
  color = "#14171C",
}) => {
  const f = useCurrentFrame();
  const shown = end > start ? interpolate(f, [start, end], [0, 100], clamp) : 100;
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: FONT_HAND,
        // 부모 굵기를 상속하면 가짜 볼드로 뭉개진다. 서체가 400 하나뿐이다
        fontWeight: 400,
        fontSize: size,
        color,
        whiteSpace: "nowrap",
        // 펜 글씨가 멀리서 끊어져 보여서 획을 살짝 두껍게 한다
        WebkitTextStroke: `${(size * 0.012).toFixed(2)}px ${color}`,
        // 시작 전에는 왼쪽 여백만큼 획 끝이 새어 나온다 → 아예 숨긴다
        visibility: shown > 0 ? "visible" : "hidden",
        clipPath: `inset(-30% ${100 - shown}% -30% -2%)`,
      }}
    >
      {text}
    </span>
  );
};

/** 조금 흔들리는 손 밑줄. 흰 샷의 유일한 색이다 */
const Underline: React.FC<{ at: number; end: number; color: string }> = ({ at, end, color }) => {
  const f = useCurrentFrame();
  const drawn = interpolate(f, [at, end], [1, 0], { ...clamp, easing: EASE_MOVE });
  return (
    <svg
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      style={{ position: "absolute", left: -4, bottom: -10, width: "calc(100% + 8px)", height: 14, overflow: "visible" }}
    >
      <path
        d="M1 6 C 28 3.5, 66 8, 99 4.5"
        fill="none"
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={drawn}
        opacity={f < at ? 0 : 1}
      />
    </svg>
  );
};

/** 문장 안의 단어에 밑줄을 긋는다. marks 순서대로 timing 이 대응한다 */
export const MarkedText: React.FC<{
  text: string;
  marks: string[];
  timing: { at: number; end: number }[];
  color: string;
}> = ({ text, marks, timing, color }) => {
  const parts: React.ReactNode[] = [];
  let rest = text;
  marks.forEach((m, i) => {
    const at = rest.indexOf(m);
    if (at < 0) return;
    parts.push(rest.slice(0, at));
    parts.push(
      <span key={i} style={{ position: "relative", display: "inline-block", lineHeight: 1.2 }}>
        {m}
        <Underline at={timing[i].at} end={timing[i].end} color={color} />
      </span>,
    );
    rest = rest.slice(at + m.length);
  });
  parts.push(rest);
  return <>{parts}</>;
};
