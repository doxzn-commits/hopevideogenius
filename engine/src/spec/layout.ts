// 요약: 레이아웃 좌표(순수 숫자). 게이트가 import 해야 하므로 remotion 에 의존하지 않는다. theme.ts 가 이걸 re-export 한다.
// 근거: factsheets/레퍼런스분석_claude스킬5_20260914.md §2 (1080×1920 환산 실측)
import type { LayoutName } from "./schema";

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
};
