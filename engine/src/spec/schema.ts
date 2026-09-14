// 요약: 영상 spec(JSON)의 유일한 스키마. 씬 타입·레이아웃·팔레트 이름은 여기서만 정의한다.
import { z } from "zod";

export const PALETTE_NAMES = ["ember", "navy", "violet", "forest", "pastel"] as const;
export const LAYOUT_NAMES = ["split", "full-graphic", "full-face"] as const;
export type PaletteName = (typeof PALETTE_NAMES)[number];
export type LayoutName = (typeof LAYOUT_NAMES)[number];

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

export const sceneSchema = z.discriminatedUnion("type", [
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
  scenes: z.array(sceneSchema).min(1),
});

export type VideoSpec = z.infer<typeof videoSpecSchema>;
export type Scene = VideoSpec["scenes"][number];
export type SceneType = Scene["type"];
export type SceneOf<T extends SceneType> = Extract<Scene, { type: T }>;
export type Caption = Scene["captions"][number];
export type Icon = z.infer<typeof iconSchema>;
