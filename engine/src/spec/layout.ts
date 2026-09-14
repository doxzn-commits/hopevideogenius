// 요약: 레이아웃 좌표(순수 숫자). 게이트가 import 해야 하므로 remotion 에 의존하지 않는다. theme.ts 가 이걸 re-export 한다.
// 근거: factsheets/레퍼런스분석_claude스킬5_20260914.md §2 (1080×1920 환산 실측)
import type { LayoutName } from "./schema";

export type LayoutBox = {
  graphic: { top: number; bottom: number } | null;
  face: { top: number; radius: number } | null;
  captionY: number;
};

export const SIDE = 60;
export const CAPTION = { size: 64, stroke: 12, hl: "#FFD84D" } as const;
/** 자막 한 줄의 반높이(스트로크 포함) — 겹침 판정용 */
export const CAPTION_HALF = Math.round((CAPTION.size * 1.25) / 2 + CAPTION.stroke);

export const LAYOUTS: Record<LayoutName, LayoutBox> = {
  // split: 자막이 카드 하단에 살짝 겹치는 것이 레퍼런스의 의도된 모습이다.
  split: { graphic: { top: 110, bottom: 1110 }, face: { top: 1170, radius: 120 }, captionY: 940 },
  // full-graphic: 사람이 없으므로 자막은 그래픽 아래에 둔다 (겹치면 읽을 수 없다 → 게이트가 판정).
  "full-graphic": { graphic: { top: 200, bottom: 1010 }, face: null, captionY: 1130 },
  "full-face": { graphic: null, face: { top: 0, radius: 0 }, captionY: 1130 },
};
