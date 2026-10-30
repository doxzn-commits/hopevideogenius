// 요약: 코드 창. **읽으라고 넣는 게 아니다** — "코드로 만들었다"는 증거물이라 내용은 멈춰 있어도 된다.
// 신택스 색칠은 라이브러리 없이 정규식 한 번으로 끝낸다(JSX·TS 기준, 완벽할 필요가 없다).
import React from "react";
import { FONT_MONO, FONT_UI } from "../fonts";

const COLORS = {
  keyword: "#C792EA",
  string: "#C3E88D",
  number: "#F78C6C",
  tag: "#F07178",
  attr: "#FFCB6B",
  comment: "#5C6370",
  plain: "#C8D3F5",
  gutter: "rgba(200,211,245,0.3)",
} as const;

const KEYWORDS = /^(import|from|export|const|let|var|return|function|if|else|await|async|new|type|interface|default)$/;

/** 한 줄을 토큰으로 쪼개 색을 입힌다. 문자열 → 주석 → 태그 → 숫자 → 키워드 순으로 본다. */
const colorize = (line: string): React.ReactNode[] => {
  const parts = line.split(/(\/\/.*$|'[^']*'|"[^"]*"|`[^`]*`|<\/?[A-Za-z][\w.]*|\b\d+(?:\.\d+)?\b|[A-Za-z_$][\w$]*)/g);
  return parts.filter(Boolean).map((t, i) => {
    let color: string = COLORS.plain;
    if (t.startsWith("//")) color = COLORS.comment;
    else if (/^['"`]/.test(t)) color = COLORS.string;
    else if (/^<\/?[A-Za-z]/.test(t)) color = COLORS.tag;
    else if (/^\d/.test(t)) color = COLORS.number;
    else if (KEYWORDS.test(t)) color = COLORS.keyword;
    else if (/^[a-z][\w$]*$/.test(t) && line.includes(`${t}=`)) color = COLORS.attr;
    return (
      <span key={i} style={{ color }}>
        {t}
      </span>
    );
  });
};

export const CodeWindow: React.FC<{
  lang: string;
  lines: string[];
  width: number;
  height: number;
  style?: React.CSSProperties;
}> = ({ lang, lines, width, height, style }) => (
  <div
    style={{
      width,
      height,
      borderRadius: 20,
      background: "#12121D",
      border: "1px solid rgba(255,255,255,0.08)",
      overflow: "hidden",
      ...style,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", padding: "14px 20px", gap: 9 }}>
      {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
        <div key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
      ))}
      <div style={{ flex: 1 }} />
      <div
        style={{
          fontFamily: FONT_UI,
          fontSize: 18,
          color: "rgba(255,255,255,0.4)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 6,
          padding: "2px 9px",
        }}
      >
        {lang}
      </div>
    </div>
    <div // 실측: 창 높이 367px 에 14줄 → 헤더 50 을 빼고 줄당 약 22px
      style={{ padding: "2px 20px", fontFamily: FONT_MONO, fontSize: 17, lineHeight: 1.32 }}>
      {lines.map((ln, i) => (
        <div key={i} style={{ display: "flex", gap: 16, whiteSpace: "pre" }}>
          <span style={{ color: COLORS.gutter, width: 26, textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
          <span>{colorize(ln)}</span>
        </div>
      ))}
    </div>
  </div>
);
