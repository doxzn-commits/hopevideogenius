// 요약: 영상 spec(JSON)의 유일한 스키마. 씬 타입·레이아웃·팔레트 이름은 여기서만 정의한다.
import { z } from "zod";

export const PALETTE_NAMES = ["ember", "navy", "violet", "forest", "pastel", "ivory", "olive", "paper", "ink", "film-light", "film-dark"] as const;
export const LAYOUT_NAMES = ["split", "full-graphic", "full-face", "card", "stack", "phone", "showcase", "film"] as const;
/** 자막 표현: overlay = 흰 글씨 + 외곽선(그래픽 위), plain = 어두운 글씨(단색 배경 위), headline = 필름형 무장식·진입 없음 */
export const CAPTION_STYLES = ["overlay", "plain", "headline"] as const;
/** 필름형 헤드라인 슬롯. 좌표는 layout.ts FILM.slots */
export const CAPTION_SLOTS = ["low", "top", "mid", "center", "peak"] as const;
/** 제품 데모 영상의 7단 구조. profile 이 걸리면 이 순서를 강제한다. */
export const DEMO_ROLES = ["hook", "problem", "solution", "demo", "differentiation", "result", "cta"] as const;
/** outro 는 필름형에서만 쓴다. 제품 데모 프로필의 순서 강제는 DEMO_ROLES 만 본다 */
export const ROLE_NAMES = [...DEMO_ROLES, "outro"] as const;
export const PROFILE_NAMES = ["free", "product-demo-30", "product-demo-40", "product-film", "film-kiosk"] as const;
export type PaletteName = (typeof PALETTE_NAMES)[number];
export type LayoutName = (typeof LAYOUT_NAMES)[number];
export type RoleName = (typeof ROLE_NAMES)[number];
export type ProfileName = (typeof PROFILE_NAMES)[number];

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
  /** 필름형 헤드라인 슬롯 (없으면 low) */
  captionSlot: z.enum(CAPTION_SLOTS).optional(),
  /** 상시 로고 숨김. 없으면 씬 타입이 정한다(brandHidden) */
  hideBrand: z.boolean().optional(),
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

/**
 * 연락처 카드 — 키오스크·사이니지용. 지나가는 사람이 **멀리서 보고 받아적는다**.
 * 그래서 전화번호가 가장 크고, 최소 노출 시간을 게이트가 강제한다.
 */
export const contactCardProps = z.object({
  badge: z.string().optional(),
  name: z.string().min(1),
  tagline: z.string().optional(),
  /** 주소·층수 같은 보조 정보 */
  lines: z.array(z.string()).max(2).optional(),
  phone: z.string().min(1),
});

/**
 * 필름형 훅 — 대상 고객이 실제로 치는 문장이 뜨고 한 줄이 드래그 선택된다.
 * 키오스크는 글자가 커서 한 줄 13자 제한에 걸리므로 3줄까지 허용한다.
 */
export const selectHookProps = z.object({
  lines: z.array(z.string().min(1)).min(2).max(3),
  selectLine: z.number().int().min(0).max(2),
});

/** 필름형 문구 단독 화면. 진입 애니메이션이 없는 것이 기본이다(rise 를 켜면 37px 14f 상승) */
export const filmTextProps = z.object({
  lines: z.array(z.string().min(1)).min(1).max(3),
  /** 이 줄만 한 단계 낮은 톤으로 */
  subLine: z.number().int().min(0).max(2).optional(),
  rise: z.boolean().optional(),
  /** 이 단어에 손 밑줄을 긋는다. 영상의 급소 한 곳에만 쓴다 */
  mark: z.string().min(1).optional(),
});

const answerLineSchema = z.object({
  text: z.string().min(1),
  /** 답 하나만 크게 보여줄 때 */
  big: z.boolean().optional(),
  /** 줄 안에서 링크색으로 칠할 구절 */
  hl: z.string().optional(),
});

const glassCardSchema = z.object({
  title: z.string().min(1),
  meta: z.string().optional(),
  /** public/ 기준 이미지. 없으면 그라데이션 자리표시 */
  images: z.array(z.string().min(1).nullable()).max(2).optional(),
  button: z.string().optional(),
  /** 평점·수치가 지어낸 값이면 true — "예시" 라벨이 붙는다 */
  sample: z.boolean().optional(),
});

/** 공책 한 줄. print = 활자(즉시), hand = 손글씨(왼→오로 써진다). marks 는 밑줄 칠 단어 */
const noteLineSchema = z.object({
  text: z.string().min(1),
  ink: z.enum(["print", "hand"]).optional(),
  marks: z.array(z.string().min(1)).max(4).optional(),
});

/**
 * 프롬프트 pill → 답변 → (카드 | 공책). 같은 prompt 를 두 번 쓰고 두 번째를 tilt 로 하면 콜백이 된다.
 * list = 평면 공개, tilt = 카드/공책이 원근으로 기울어 올라온다(영상당 1회, 게이트가 막는다).
 */
export const aiAnswerProps = z.object({
  /** 줄바꿈은 \n 으로 직접 끊는다. 타이핑 도중 줄이 바뀌지 않게 하려는 것이다 */
  prompt: z.string().min(1),
  answer: z.array(answerLineSchema).max(6),
  cards: z.array(glassCardSchema).max(4).optional(),
  /** tilt 에서 카드 대신 올라오는 공책 */
  notebook: z.object({ lines: z.array(z.string().min(1)).min(1).max(4) }).optional(),
  mode: z.enum(["list", "tilt"]),
  /** 타이핑 도중부터 시작(0~1). 콜백은 이미 친 문장이라 0.6 근처가 맞다 */
  startTyped: z.number().min(0).max(1).optional(),
});

/** 공책 오브제 하나가 지속되고 안쪽 페이지만 바뀐다. 소재를 갈아 끼우면 "단계 설명" 어디에나 쓴다. */
export const notebookStepsProps = z.object({
  pages: z
    .array(
      z.object({
        /** 씬 시작 기준 프레임. 헤드라인 at 과 같게 둔다(슬라이드는 1f 뒤에 시작한다) */
        at: z.number().int().min(0),
        label: z.string().min(1),
        lines: z.array(noteLineSchema).min(1).max(4),
      }),
    )
    .min(1)
    .max(4),
  /** slide = 15f 슬라이드, cut = 하드 스왑 */
  transition: z.enum(["slide", "cut"]).optional(),
});

const panelBase = {
  /** 씬 시작 기준 프레임 */
  at: z.number().int().min(0),
  /** true 면 슬라이드 없이 하드 스왑 */
  cut: z.boolean().optional(),
  /** 지어낸 수치면 true — 패널에 "예시" 라벨이 붙는다 */
  sample: z.boolean().optional(),
  /** 실제 녹화·캡처가 있으면 코드 UI 대신 이 파일을 쓴다 (public/ 기준) */
  src: z.string().min(1).optional(),
};

export const panelSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("line-chart"),
    ...panelBase,
    title: z.string().min(1),
    from: z.number(),
    to: z.number(),
    suffix: z.string().optional(),
    chip: z.string().optional(),
    /** 선 모양. 0~1, 왼→오 */
    points: z.array(z.number().min(0).max(1)).min(3).max(12),
  }),
  z.object({
    kind: z.literal("rank-list"),
    ...panelBase,
    title: z.string().min(1),
    rows: z.array(z.object({ label: z.string().min(1), value: z.string(), me: z.boolean().optional() })).min(2).max(7),
  }),
  z.object({
    kind: z.literal("doc-columns"),
    ...panelBase,
    left: z.array(z.string().min(1)).min(2).max(8),
    right: z.array(z.string().min(1)).min(2).max(8),
  }),
]);

/** 고정 틀 안에서 패널이 바뀐다. 틀은 움직이지 않고 내용만 슬라이드·줌한다. */
export const uiStageProps = z.object({
  frame: z.enum(["soft", "browser", "panel"]),
  panels: z.array(panelSchema).min(1).max(4),
  zoom: z
    .object({
      at: z.number().int().min(0),
      to: z.number().min(1).max(2),
      frames: z.number().int().min(12).max(40).optional(),
      /** 줌 중심 [x, y] 0~1. 잘리면 안 되는 쪽에 둔다 */
      origin: z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]).optional(),
    })
    .optional(),
  pip: z.object({ src: z.string().min(1).nullable(), d: z.number().int().min(120).max(260).optional() }).optional(),
});

/**
 * 필름형 CTA. 행동 버튼(button) 또는 전화번호(phone) 중 하나가 검정 pill 안에 들어간다.
 * rows 는 **허락받은 실제 로고·이름만**. 없으면 빼고 위로 올린다(없는 실적을 꾸미지 않는다).
 */
export const ctaMarqueeProps = z.object({
  badge: z.string().optional(),
  /** 상호. 있으면 상시 로고는 숨긴다(같은 글자가 두 번 나온다) */
  name: z.string().optional(),
  tagline: z.string().optional(),
  lines: z.array(z.string().min(1)).max(2).optional(),
  phone: z.string().min(1).optional(),
  button: z.string().min(1).optional(),
  rows: z.array(z.array(z.string().min(1)).min(1)).max(3).optional(),
  /** 맥동 폭. 0 이면 멈춘다. 전화번호는 받아적는 글자라 작게 둔다 */
  pulse: z.number().min(0).max(0.1).optional(),
});

/** 끝 로고 단독. 다크 배경에서 다음 루프로 하드컷된다. */
export const logoOutroProps = z.object({
  text: z.string().min(1),
  /** public/ 기준 로고 파일. 받은 로고가 없으면 비워 두고 워드마크로 쓴다 */
  logo: z.string().min(1).optional(),
});

export const sceneSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("select-hook"), ...base, props: selectHookProps }),
  z.object({ type: z.literal("film-text"), ...base, props: filmTextProps }),
  z.object({ type: z.literal("ai-answer"), ...base, props: aiAnswerProps }),
  z.object({ type: z.literal("notebook-steps"), ...base, props: notebookStepsProps }),
  z.object({ type: z.literal("ui-stage"), ...base, props: uiStageProps }),
  z.object({ type: z.literal("cta-marquee"), ...base, props: ctaMarqueeProps }),
  z.object({ type: z.literal("logo-outro"), ...base, props: logoOutroProps }),
  z.object({ type: z.literal("contact-card"), ...base, props: contactCardProps }),
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
  /** 상시 로고. 씬 밖(SpecVideo)에서 그려서 씬이 바뀌어도 움직이지 않는다. logo 가 없으면 text 워드마크 */
  brand: z.object({ text: z.string().min(1), logo: z.string().min(1).optional() }).optional(),
  /** 소리. 모든 경로는 public/ 기준. 없으면 무음으로 나간다 */
  audio: z
    .object({
      bgm: z.string().min(1).optional(),
      voice: z.string().min(1).optional(),
      /** 내레이션 시작 프레임 */
      voiceAt: z.number().int().min(0).optional(),
      bgmVolume: z.number().min(0).max(1).optional(),
      voiceVolume: z.number().min(0).max(1).optional(),
    })
    .optional(),
  /** 템플릿 표시. 소재가 없어도 구성을 렌더해 볼 수 있게 "소리 필수" 오류를 경고로 낮춘다 */
  template: z.boolean().optional(),
  scenes: z.array(sceneSchema).min(1),
});

export type VideoSpec = z.infer<typeof videoSpecSchema>;
export type Scene = VideoSpec["scenes"][number];
export type SceneType = Scene["type"];
export type SceneOf<T extends SceneType> = Extract<Scene, { type: T }>;
export type Caption = Scene["captions"][number];
export type Icon = z.infer<typeof iconSchema>;
