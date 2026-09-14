// 요약: 영상 spec(JSON)의 유일한 스키마. 씬 타입·레이아웃·팔레트 이름은 여기서만 정의한다.
import { z } from "zod";

export const PALETTE_NAMES = ["ember", "navy", "violet", "forest", "pastel"] as const;
export const LAYOUT_NAMES = ["split", "full-graphic", "full-face"] as const;
/** 제품 데모 영상의 7단 구조. profile 이 걸리면 이 순서를 강제한다. */
export const ROLE_NAMES = ["hook", "problem", "solution", "demo", "differentiation", "result", "cta"] as const;
export const PROFILE_NAMES = ["free", "product-demo-40"] as const;
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

const base = {
  durationInFrames: z.number().int().positive(),
  layout: z.enum(LAYOUT_NAMES),
  palette: z.enum(PALETTE_NAMES),
  captions: z.array(captionSchema),
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

export const sceneSchema = z.discriminatedUnion("type", [
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
