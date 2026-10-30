// 요약: 팔레트·레이아웃 좌표·자막 스타일 수치. 레퍼런스 실측값(1080×1920 환산)이 원천.
import { Easing } from "remotion";
import type { PaletteName } from "./spec/schema";

export { LAYOUTS, SIDE, SAFE, CAPTION, CAPTION_HALF } from "./spec/layout";

export type Palette = {
  bg: string;
  glowA: string;
  glowB: string;
  card: string;
  cardBorder: string;
  text: string;
  sub: string;
  accent: string; // 반드시 6자리 hex (뒤에 알파 2자리를 붙여 쓴다)
  track: string;
  dark: boolean;
  /** true 면 배경 글로우 없이 단색 — 카드형처럼 카드가 주인공일 때 */
  flat?: boolean;
  /** 카드 본문 바탕(헤더보다 약간 어두운 면) */
  cardBody?: string;
  /** 요청문 말풍선 바탕 */
  bubble?: string;
  /** 카드(흰 바탕) 안에서 쓰는 강조색 — 배경용 accent 가 흰 바탕에서 안 보일 때를 위한 값 */
  cardAccent?: string;
};

/** 카드 안은 항상 흰 바탕이라 글자색이 팔레트와 무관하게 고정이다 */
export const CARD_INK = "#1A1A1A";
export const CARD_SUB = "rgba(26,26,26,0.45)";

export const PALETTES: Record<PaletteName, Palette> = {
  ember: {
    bg: "#0A0605", glowA: "rgba(150,72,28,0.55)", glowB: "rgba(110,62,18,0.35)",
    card: "rgba(36,24,20,0.78)", cardBorder: "rgba(255,196,160,0.16)",
    text: "#F3E8E0", sub: "rgba(243,232,224,0.5)", accent: "#E0795A", track: "rgba(255,255,255,0.07)", dark: true,
  },
  navy: {
    bg: "#060B14", glowA: "rgba(30,110,140,0.45)", glowB: "rgba(40,60,130,0.35)",
    card: "rgba(16,26,40,0.8)", cardBorder: "rgba(160,210,255,0.14)",
    text: "#E6F0FA", sub: "rgba(230,240,250,0.5)", accent: "#4FC3E8", track: "rgba(255,255,255,0.07)", dark: true,
  },
  violet: {
    bg: "#0A0718", glowA: "rgba(110,60,200,0.45)", glowB: "rgba(40,50,140,0.4)",
    card: "rgba(24,20,44,0.8)", cardBorder: "rgba(200,180,255,0.16)",
    text: "#EEE9FF", sub: "rgba(238,233,255,0.5)", accent: "#9D7BFF", track: "rgba(255,255,255,0.07)", dark: true,
  },
  forest: {
    bg: "#04100A", glowA: "rgba(30,140,80,0.45)", glowB: "rgba(20,90,70,0.35)",
    card: "rgba(14,34,24,0.8)", cardBorder: "rgba(170,255,210,0.14)",
    text: "#E6F7EE", sub: "rgba(230,247,238,0.5)", accent: "#4ADE9A", track: "rgba(255,255,255,0.07)", dark: true,
  },
  pastel: {
    bg: "#F7F2EC", glowA: "rgba(255,176,130,0.6)", glowB: "rgba(255,226,120,0.5)",
    card: "rgba(255,255,255,0.82)", cardBorder: "rgba(110,70,50,0.12)",
    text: "#3B2A22", sub: "rgba(59,42,34,0.5)", accent: "#E0482C", track: "rgba(60,40,30,0.08)", dark: false,
  },
  // 카드형 레퍼런스 실측값 (factsheets/레퍼런스분석_마케팅커넥터5_20261016.md §3)
  ivory: {
    bg: "#ECE8E3", glowA: "transparent", glowB: "transparent",
    card: "#FFFFFF", cardBorder: "rgba(30,25,20,0.06)",
    text: "#1A1A1A", sub: "rgba(26,26,26,0.45)", accent: "#1E8E54", track: "rgba(30,25,20,0.08)",
    dark: false, flat: true, cardBody: "#F7F5F1", bubble: "#E6E6DD", cardAccent: "#1E8E54",
  },
  // 녹화형 — 녹화 화면이 이미 복잡하므로 프레임은 최대한 조용하게 둔다
  paper: {
    bg: "#FDFFFF", glowA: "transparent", glowB: "transparent",
    card: "#FFFFFF", cardBorder: "rgba(20,20,30,0.08)",
    text: "#111111", sub: "rgba(17,17,17,0.45)", accent: "#3B5BFE", track: "rgba(20,20,30,0.08)",
    dark: false, flat: true, cardBody: "#F7F7F9", bubble: "#EFEFF3", cardAccent: "#3B5BFE",
  },
  olive: {
    bg: "#20261D", glowA: "transparent", glowB: "transparent",
    card: "#FFFFFF", cardBorder: "rgba(0,0,0,0.08)",
    text: "#F2F3EE", sub: "rgba(242,243,238,0.5)", accent: "#B9D84A", track: "rgba(255,255,255,0.1)",
    dark: true, flat: true, cardBody: "#F7F5F1", bubble: "#E6E6DD", cardAccent: "#4C6B14",
  },
};

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
