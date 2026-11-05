// 요약: 레이아웃 좌표(순수 숫자). 게이트가 import 해야 하므로 remotion 에 의존하지 않는다. theme.ts 가 이걸 re-export 한다.
// 근거: factsheets/레퍼런스분석_claude스킬5_20260914.md §2 (1080×1920 환산 실측)
import type { LayoutName, ProfileName } from "./schema";

export type LayoutBox = {
  graphic: { top: number; bottom: number } | null;
  face: { top: number; radius: number } | null;
  captionY: number;
};

export const SIDE = 60;
/** 안전 영역 — 화면 문구는 가장자리에서 이 거리 안으로 들어오지 않는다 (모바일 가독성 기준) */
export const SAFE = 120;
export const CAPTION = { size: 64, stroke: 12, hl: "#FFD84D" } as const;
/** 자막 한 줄의 반높이(스트로크 포함) — 겹침 판정용 */
export const CAPTION_HALF = Math.round((CAPTION.size * 1.25) / 2 + CAPTION.stroke);

/**
 * 텍스트 폭 상수. 한글은 글자당 약 0.98em 을 차지한다.
 * 컴포넌트는 이 값으로 글자 크기를 줄이고, 게이트는 같은 값으로 "최소 크기에서도 안 들어가는 글자 수"를 판정한다.
 * → 한 곳만 고치면 둘이 같이 움직인다.
 */
export const TEXT = {
  availWidth: 1080 - SAFE * 2, // 안전 영역 안쪽 폭
  glyphRatio: 0.98,
  captionBase: 64,
  captionMin: 44,
  statementBase: 92,
  statementMin: 54,
} as const;

/** 주어진 글자 수가 들어가도록 줄인 글자 크기 (min 아래로는 줄이지 않는다 → 게이트가 대신 막는다) */
export const fitSize = (chars: number, base: number, min: number) =>
  Math.max(min, Math.min(base, Math.floor(TEXT.availWidth / Math.max(1, chars * TEXT.glyphRatio))));

/**
 * 씬이 실제로 쓸 레이아웃. 사람이 없고 full-graphic 이면 화면을 더 크게 쓴다.
 * 자막이 아예 없으면 안전 영역까지 전부 쓴다.
 */
export const resolveLayout = (
  layout: LayoutName,
  opts: { faceless: boolean; hasCaptions: boolean },
): LayoutBox => {
  const base = LAYOUTS[layout];
  if (layout !== "full-graphic") return base;
  const box = opts.faceless ? { ...base, ...FACELESS_FULL } : base;
  if (!opts.hasCaptions && box.graphic) return { ...box, graphic: { ...box.graphic, bottom: 1920 - SAFE } };
  return box;
};

/** 최소 크기에서 한 줄에 들어가는 최대 글자 수 */
export const maxCharsAt = (minSize: number) => Math.floor(TEXT.availWidth / (minSize * TEXT.glyphRatio));

/**
 * 지속 카드 geometry. 카드는 **씬이 바뀌어도 같은 자리에 같은 크기로** 있어야 한다.
 * 그래서 높이를 내용에 따라 늘리지 않고 고정한다(레퍼런스도 카드가 들썩이지 않는다).
 * 근거: factsheets/레퍼런스분석_마케팅커넥터5_20261016.md §2
 */
export const CARD = {
  x: 85,
  top: 295,
  width: 910,
  height: 1070,
  radius: 42,
  headerH: 160,
  pad: 36,
} as const;

/** 폰 목업 geometry (레퍼런스 실측 ×1.5). 녹화 영상이 이 안에서 재생된다. */
export const PHONE = {
  width: 555,
  height: 1013,
  top: 427,
  radius: 56,
  bezel: 12, // 흰 테두리 두께
} as const;

/**
 * 전시형 geometry (레퍼런스 실측 ×0.75). 타이틀 2행 + 전체폭 UI 밴드 + 하단 코드 창.
 * UI 밴드는 **좌우가 화면 밖으로 잘린다** — 작게 줄여 전부 보여주면 디테일이 죽는다.
 * 근거: factsheets/레퍼런스분석_UI킷쇼케이스_20261030.md §2
 */
export const SHOWCASE = {
  title1Y: 537,
  title2Y: 615,
  bandTop: 665,
  bandHeight: 590,
  codeX: 117,
  codeWidth: 848,
  codeTop: 1400,
  codeHeight: 367,
} as const;

/** 카드 안쪽 내용 영역 */
export const CARD_BODY = {
  left: CARD.x + CARD.pad,
  top: CARD.top + CARD.headerH + CARD.pad,
  width: CARD.width - CARD.pad * 2,
  height: CARD.height - CARD.headerH - CARD.pad * 2,
} as const;

/**
 * 사람이 없을 때(talkingHead: null) full-graphic 이 쓰는 더 넓은 박스.
 * 기본 full-graphic 은 아래쪽을 비워 두는데, 그 공간은 **원래 토킹헤드 자리**다.
 * 사람을 안 쓰면 그 자리가 그냥 빈 공간으로 남아 화면이 위로 쏠린다.
 */
export const FACELESS_FULL = { graphic: { top: 240, bottom: 1290 }, captionY: 1460 } as const;

/**
 * 필름형 geometry. 근거: factsheets/레퍼런스분석_제품필름형_20261105.md §5.
 * 콘텐츠는 y 378~1460 안에 두고 위·아래를 비운다. 슬롯은 목업 크기가 아니라 레이아웃이 정한다.
 */
export const FILM = {
  contentTop: 378,
  contentBottom: 1460,
  center: 879,
  brandY: 1441,
  // peak: 전체 높이를 쓰는 tilt 샷 전용. 콘텐츠 띠 위로 나간다
  slots: { low: 1230, top: 402, mid: 1314, center: 879, peak: 214 },
  /** 프롬프트 pill. 시작 위치 → 답변이 뜨면 riseBy 만큼 올라간다 */
  pill: { x: 70, width: 940, top: 790, riseBy: 260, radius: 60 },
  /** 공책 오브제 */
  notebook: { x: 70, width: 940, top: 400, height: 720, radius: 36, rule: 116, header: 124 },
  /** 콜백 공책. rotateX 37deg(레퍼런스)는 글자가 눕는다 — 읽혀야 해서 30deg 로 줄였다 */
  tilt: { top: 880, deg: 30, perspective: 1600, rule: 136, ruleTop: 20, padLeft: 100, padBottom: 24, lift: 190 },
  /** 다크 유리 카드 */
  glass: { x: 119, width: 842, top: 402, height: 780, radius: 45 },
  /** ui-stage 틀 3종 */
  frames: {
    soft: { x: 57, width: 966, top: 511, height: 587, radius: 36 },
    browser: { x: 102, width: 876, top: 476, height: 578, radius: 36 },
    panel: { x: 66, width: 947, top: 489, height: 839, radius: 36 },
  },
  shadow: "0 6px 22px rgba(0,0,0,0.14)",
  line: 1.5, // 외곽선 1px(720) = 1.5px(1080)
} as const;

export type FilmTokens = {
  /** 헤드라인 크기·굵기, 한 줄 글자 수 상한(공백 포함) */
  headline: number;
  headlineWeight: number;
  headlineMaxChars: number;
  /** 다크·흰 문구 화면과 훅의 글자 크기, 행 간격 */
  display: number;
  displayRow: number;
  brand: number;
  pillText: number;
  answerText: number;
  answerBig: number;
  /** 공책 활자·손글씨 */
  note: number;
  hand: number;
  tiltHand: number;
  stepLabel: number;
  /** CTA */
  name: number;
  logo: number;
  tagline: number;
  ctaLine: number;
  phone: number;
  button: number;
  /** 읽혀야 하는 오브제 글자의 하한 — 게이트 불변식이 이 값으로 토큰을 검사한다 */
  objectMin: number;
};

/**
 * 프로필별 글자 토큰. product-film 은 폰 기준 실측값(§5), film-kiosk 는 멀리서 지나가며 보는 기준이다.
 * 키오스크 값이 큰 이유와 한계: labs/김세연매쓰_필름형제작_20261105.md
 */
export const FILM_TOKENS: Record<"product-film" | "film-kiosk", FilmTokens> = {
  "product-film": {
    headline: 54, headlineWeight: 600, headlineMaxChars: 20,
    display: 58, displayRow: 82, brand: 40,
    pillText: 34, answerText: 34, answerBig: 48,
    note: 38, hand: 64, tiltHand: 72, stepLabel: 28,
    name: 72, logo: 90, tagline: 36, ctaLine: 48, phone: 60, button: 44,
    objectMin: 24,
  },
  "film-kiosk": {
    headline: 80, headlineWeight: 700, headlineMaxChars: 13,
    display: 84, displayRow: 124, brand: 46,
    pillText: 46, answerText: 44, answerBig: 104,
    note: 66, hand: 112, tiltHand: 112, stepLabel: 46,
    name: 84, logo: 115, tagline: 54, ctaLine: 88, phone: 108, button: 60,
    objectMin: 44,
  },
};

export const filmTokens = (profile?: ProfileName): FilmTokens =>
  profile === "film-kiosk" ? FILM_TOKENS["film-kiosk"] : FILM_TOKENS["product-film"];

export const LAYOUTS: Record<LayoutName, LayoutBox> = {
  // split: 자막이 카드 하단에 살짝 겹치는 것이 레퍼런스의 의도된 모습이다.
  split: { graphic: { top: 110, bottom: 1110 }, face: { top: 1170, radius: 120 }, captionY: 940 },
  // full-graphic: 사람이 없으므로 자막은 그래픽 아래에 둔다 (겹치면 읽을 수 없다 → 게이트가 판정).
  "full-graphic": { graphic: { top: 200, bottom: 1010 }, face: null, captionY: 1130 },
  "full-face": { graphic: null, face: { top: 0, radius: 0 }, captionY: 1130 },
  // card: 그래픽은 카드 안에 들어가므로 graphic 박스를 쓰지 않는다. 자막은 카드 아래.
  card: { graphic: null, face: null, captionY: CARD.top + CARD.height + 90 },
  // stack: 카드 여러 장을 세로로 쌓는 씬(CTA 등). 자막 위치는 card 와 같게 맞춰 전환이 매끄럽다.
  stack: { graphic: { top: 260, bottom: 1340 }, face: null, captionY: CARD.top + CARD.height + 90 },
  // phone: 녹화형 — 폰 목업 안에서 화면 녹화가 흐른다. **자막이 위에 있다**
  // (폰 화면 하단에 탭 바가 있어 아래를 비워야 한다. 근거: 레퍼런스분석_스마트홈녹화형 §2)
  phone: { graphic: { top: PHONE.top, bottom: PHONE.top + PHONE.height }, face: null, captionY: 322 },
  // showcase: 전시형 — 씬이 화면 전체를 직접 그린다(타이틀·밴드·코드 창). 자막은 쓰지 않는다(게이트가 막는다).
  showcase: { graphic: null, face: null, captionY: 1452 },
  // film: 씬이 화면 전체를 직접 그린다. 헤드라인은 슬롯(FILM.slots)으로 간다
  film: { graphic: null, face: null, captionY: FILM.slots.low },
};
