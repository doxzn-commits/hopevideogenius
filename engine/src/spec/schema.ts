// 요약: 영상 spec(JSON)의 유일한 스키마. 씬 타입·레이아웃·팔레트 이름은 여기서만 정의한다.
import { z } from "zod";

export const PALETTE_NAMES = ["ember", "navy", "violet", "forest", "pastel", "ivory", "olive", "paper", "ink"] as const;
export const LAYOUT_NAMES = ["split", "full-graphic", "full-face", "card", "stack", "phone", "showcase"] as const;
/** 자막 표현: overlay = 흰 글씨 + 외곽선(그래픽 위), plain = 어두운 글씨(단색 배경 위) */
export const CAPTION_STYLES = ["overlay", "plain"] as const;
/** 제품 데모 영상의 7단 구조. profile 이 걸리면 이 순서를 강제한다. */
export const ROLE_NAMES = ["hook", "problem", "solution", "demo", "differentiation", "result", "cta"] as const;
export const PROFILE_NAMES = ["free", "product-demo-30", "product-demo-40"] as const;
export type PaletteName = (typeof PALETTE_NAMES)[number];
export type LayoutName = (typeof LAYOUT_NAMES)[number];
export type RoleName = (typeof ROLE_NAMES)[number];

const captionSchema = z.object({
  text: z.string().min(1),
  at: z.number().int().min(0),
  hl: z.string().optional(),
});

const iconSchema = z.object({
  glyph: z.string().min(1),
  label: z.string().optional(),
  color: z.string().optional(),
});

/** 지속 카드의 머리글. 씬이 바뀌어도 카드 틀은 그대로 있고 이 값만 바뀐다. */
export const cardSchema = z.object({
  app: z.string().min(1),
  glyph: z.string().min(1),
  status: z.string().optional(), // 예: "Claude에 연결됨"
  index: z.number().int().positive().optional(),
  total: z.number().int().positive().optional(),
  tint: z.string().optional(), // 앱 아이콘 배경색
});

const base = {
  durationInFrames: z.number().int().positive(),
  layout: z.enum(LAYOUT_NAMES),
  palette: z.enum(PALETTE_NAMES),
  captions: z.array(captionSchema),
  /** layout: "card" 일 때 필수 — 카드 머리글 */
  card: cardSchema.optional(),
  captionStyle: z.enum(CAPTION_STYLES).optional(),
  /** 7단 구조에서 이 씬이 맡는 역할 (제품 데모 프로필에서 필수) */
  role: z.enum(ROLE_NAMES).optional(),
};

export const titleCardProps = z.object({
  kicker: z.string(),
  name: z.string().min(1),
  subtitle: z.string().optional(),
  glyph: z.string().optional(),
  index: z.number().int().positive().optional(),
  total: z.number().int().positive().optional(),
});

export const terminalListProps = z.object({
  header: z.string(),
  chip: z.string().optional(),
  command: z.string().min(1),
  rows: z
    .array(z.object({ glyph: z.string(), name: z.string(), value: z.number().min(0).max(1) }))
    .min(1),
  highlight: z.number().int().min(0).optional(),
  highlightBadge: z.string().optional(),
});

const barSchema = z.object({ label: z.string(), value: z.number().min(0).max(1), text: z.string() });
export const beforeAfterProps = z.object({
  label: z.string(),
  chipBefore: z.string(),
  chipAfter: z.string(),
  before: barSchema,
  after: barSchema,
});

export const iconFlowProps = z.object({
  label: z.string(),
  chip: z.string().optional(),
  icons: z.array(iconSchema).min(2),
  collapseTo: iconSchema.optional(),
});

/** 화면 문구 전용 씬. 한 장면당 최대 두 줄(기획 원칙)이라 스키마가 3줄 이상을 거부한다. */
export const statementProps = z.object({
  kicker: z.string().optional(),
  lines: z.array(z.string().min(1)).min(1).max(2),
  accentLine: z.number().int().min(0).max(1).optional(),
});

/** 브라우저 목업 + 커서 이동 + 클릭 글로우 + 느린 확대(105~115%). UI 모션그래픽의 기본 씬. */
export const browserMockProps = z.object({
  url: z.string().min(1),
  chip: z.string().optional(),
  blocks: z
    .array(
      z.object({
        w: z.number().min(0.05).max(1), // 콘텐츠 폭 비율
        label: z.string().optional(),
        accent: z.boolean().optional(),
        tall: z.boolean().optional(),
      }),
    )
    .min(1),
  /** 커서 키프레임. x,y 는 브라우저 콘텐츠 영역 기준 0~1 비율 */
  cursor: z
    .array(z.object({ at: z.number().int().min(0), x: z.number().min(0).max(1), y: z.number().min(0).max(1), click: z.boolean().optional() }))
    .optional(),
  /** 느린 확대 배율. 모션 원칙상 1.15 를 넘지 못한다 */
  zoom: z.number().min(1).max(1.15).optional(),
});

/**
 * 결과 패널 4종. 레퍼런스에서 커넥터마다 다른 그림이 나오는데, 전부 이 넷 중 하나다.
 * 숫자는 일부러 회색 막대로 가린다 → 지어낸 수치를 말하지 않으면서 "결과가 나왔다"를 보여준다.
 */
export const resultSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("thumbs"),
    title: z.string(),
    items: z.array(z.object({ rank: z.number().int().positive().optional(), metrics: z.array(z.string()).max(2) })).min(1).max(3),
  }),
  z.object({
    kind: z.literal("table"),
    title: z.string(),
    columns: z.array(z.string()).min(2).max(4),
    rows: z.array(z.object({ label: z.string(), toggle: z.boolean().optional(), badge: z.string().optional() })).min(1).max(4),
  }),
  z.object({
    kind: z.literal("funnel"),
    title: z.string(),
    steps: z.array(z.object({ label: z.string(), value: z.number().min(0).max(1), drop: z.boolean().optional() })).min(2).max(5),
    note: z.string().optional(),
  }),
  z.object({
    kind: z.literal("upload"),
    title: z.string(),
    account: z.string(),
    actions: z.array(z.string()).min(1).max(2),
  }),
]);

/** 요청문 → 툴 실행(실행 중→완료) → 결과 패널. 카드형 영상의 핵심 씬. */
export const promptRunProps = z.object({
  prompt: z.string().min(1),
  tool: z.object({ name: z.string().min(1), target: z.string().optional() }),
  result: resultSchema.optional(),
  /** 결과 패널 우상단 "예시" 라벨 — 실제 데이터가 아님을 표시한다 */
  sample: z.boolean().optional(),
});

/** 큰 아이콘 + 역할 한 줄. "첫 번째, ○○" 챕터 표지의 카드 버전. */
export const appIntroProps = z.object({
  role: z.string().min(1), // 그 도구로 하는 일 (예: "릴스 조사")
  caption: z.string().optional(), // 예: "Bright Data로 하는 일"
});

/** 목록의 토글이 차례로 켜지는 인트로. 카드 머리글의 N/total 이 같이 올라간다(엔진이 세어 준다). */
export const toggleListProps = z.object({
  items: z
    .array(z.object({ glyph: z.string().min(1), name: z.string().min(1), sub: z.string().optional(), tint: z.string().optional() }))
    .min(2)
    .max(6),
  startAt: z.number().int().min(0).optional(),
});

/** 팔로우 → 댓글 키워드 → DM. 숏폼 CTA 의 정석 3단. */
export const socialCtaProps = z.object({
  profile: z.object({ name: z.string().min(1), handle: z.string().min(1), glyph: z.string().optional() }),
  follow: z.object({ before: z.string(), after: z.string() }),
  comment: z.object({ title: z.string(), keyword: z.string().min(1), me: z.string().optional() }),
  dm: z
    .object({ badge: z.string(), headline: z.string(), title: z.string(), sub: z.string().optional() })
    .optional(),
});

/**
 * 폰 목업 안에서 화면 녹화를 재생한다. 소재가 코드가 아니라 **실제 녹화 파일**이다.
 * 파일은 engine/public/screens/ 에 두고 경로만 적는다(산출물이라 커밋되지 않는다).
 */
export const screenRecordProps = z.object({
  /** public/ 기준 경로. null 이면 자리표시 프레임만 그린다(파일 없이 구성을 먼저 잡을 때) */
  src: z.string().min(1).nullable(),
  /** 녹화의 앞부분을 잘라내고 시작할 프레임 수 */
  trimBefore: z.number().int().min(0).optional(),
  /** 폰 화면에 맞추는 방식 */
  fit: z.enum(["cover", "contain"]).optional(),
  /** 자리표시일 때 보여줄 설명 */
  placeholder: z.string().optional(),
});

/**
 * 전시형 — 타이틀 + UI 스크린 사이클 + 코드 창. 설명하지 않고 전시한다.
 * 스크린샷은 engine/public/screens/ 에 두고 경로만 적는다(없으면 스켈레톤으로 렌더).
 */
export const screenCycleProps = z.object({
  title: z.object({ line1: z.string().min(1), line2: z.string().min(1) }),
  /**
   * 차례로 교체되는 UI 스크린. 각 화면은 스켈레톤 → 콘텐츠 순서로 들어온다.
   * src 는 **이미지(png·jpg)와 영상(mp4·webm·mov) 둘 다** 된다 — 확장자로 알아서 갈린다.
   */
  screens: z
    .array(
      z.object({
        src: z.string().min(1).nullable(),
        label: z.string().optional(),
        /** 영상일 때 앞부분을 잘라내고 시작할 프레임 수 */
        trimBefore: z.number().int().min(0).optional(),
      }),
    )
    .min(1)
    .max(6),
  /** 코드 창 — 읽으라고가 아니라 "코드로 만들었다"는 증거물이다 */
  code: z.object({ lang: z.string().min(1), lines: z.array(z.string()).min(1).max(16) }).optional(),
  /** 마지막에 지나가는 대각선 스윕 (루프 이음새를 가린다) */
  sweep: z.boolean().optional(),
});

export const sceneSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("screen-cycle"), ...base, props: screenCycleProps }),
  z.object({ type: z.literal("screen-record"), ...base, props: screenRecordProps }),
  z.object({ type: z.literal("prompt-run"), ...base, props: promptRunProps }),
  z.object({ type: z.literal("toggle-list"), ...base, props: toggleListProps }),
  z.object({ type: z.literal("social-cta"), ...base, props: socialCtaProps }),
  z.object({ type: z.literal("app-intro"), ...base, props: appIntroProps }),
  z.object({ type: z.literal("statement"), ...base, props: statementProps }),
  z.object({ type: z.literal("browser-mock"), ...base, props: browserMockProps }),
  z.object({ type: z.literal("title-card"), ...base, props: titleCardProps }),
  z.object({ type: z.literal("terminal-list"), ...base, props: terminalListProps }),
  z.object({ type: z.literal("before-after"), ...base, props: beforeAfterProps }),
  z.object({ type: z.literal("icon-flow"), ...base, props: iconFlowProps }),
  z.object({ type: z.literal("face-only"), ...base, props: z.object({}) }),
]);

export const videoSpecSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9-]+$/, "Composition id 는 영문·숫자·하이픈만"),
  title: z.string(),
  fps: z.literal(30),
  width: z.literal(1080),
  height: z.literal(1920),
  talkingHead: z.string().nullable(),
  /** 제작 규격. product-demo-40 은 7장면·각 3~7초·총 40초·역할 순서를 강제한다 */
  profile: z.enum(PROFILE_NAMES).optional(),
  scenes: z.array(sceneSchema).min(1),
});

export type VideoSpec = z.infer<typeof videoSpecSchema>;
export type Scene = VideoSpec["scenes"][number];
export type SceneType = Scene["type"];
export type SceneOf<T extends SceneType> = Extract<Scene, { type: T }>;
export type Caption = Scene["captions"][number];
export type Icon = z.infer<typeof iconSchema>;
