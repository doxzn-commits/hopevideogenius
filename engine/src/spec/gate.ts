// 요약: spec 게이트. 레퍼런스 분석에서 나온 "기계가 판정할 수 있는 규칙"을 전부 여기에 박는다. lint-spec 과 Studio 경고 배너가 공용으로 쓴다.
// 근거 수치: factsheets/레퍼런스분석_claude스킬5_20260914.md
import { videoSpecSchema, type VideoSpec } from "./schema";
import { sceneEnd } from "./timelines";
import { CAPTION_HALF, LAYOUTS } from "./layout";

export const RULES = {
  sceneMinFrames: 18, // 레퍼런스 최단 샷 ≈0.6초
  sceneMaxFrames: 240, // 레퍼런스 최장 샷 ≈6초 + 여유. 넘으면 씬을 쪼갠다
  captionMaxChars: 18, // 공백 제외. 한 줄 자막(≈60px, 좌우 60px 여백) 한계
  captionMinFrames: 15, // 자막이 0.5초 미만 보이면 못 읽는다
  titleNameMaxChars: 14, // title-card 이름(모노 84px) 한 줄 한계
  rowsMax: 8, // terminal-list 카드 높이 한계
  iconsMax: 6, // icon-flow 가로 960px 한계
  totalMaxSeconds: 90, // 숏폼 권장 상한 (경고)
} as const;

export type Issue = { level: "error" | "warn"; where: string; msg: string };

/**
 * 레이아웃 상수 자체의 불변식.
 * 사람이 없는 레이아웃(face === null)에서 자막이 그래픽 영역과 겹치면 둘 다 못 읽는다.
 * (사람이 있는 split 은 카드 하단에 자막이 겹치는 것이 레퍼런스의 의도된 모습이라 예외)
 */
export const checkLayouts = (): Issue[] => {
  const issues: Issue[] = [];
  for (const [name, box] of Object.entries(LAYOUTS)) {
    if (box.face === null && box.graphic && box.graphic.bottom > box.captionY - CAPTION_HALF) {
      issues.push({
        level: "error",
        where: `LAYOUTS.${name}`,
        msg: `그래픽 하단 ${box.graphic.bottom} 이 자막 상단 ${box.captionY - CAPTION_HALF} 과 겹침`,
      });
    }
    if (box.graphic && box.graphic.top >= box.graphic.bottom)
      issues.push({ level: "error", where: `LAYOUTS.${name}`, msg: "graphic.top >= graphic.bottom" });
  }
  return issues;
};

const visibleChars = (s: string) => [...s.replace(/\s/g, "")].length;

export const checkSpec = (raw: unknown): { spec: VideoSpec | null; issues: Issue[] } => {
  const parsed = videoSpecSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      spec: null,
      issues: parsed.error.issues.map((i) => ({ level: "error", where: i.path.join("."), msg: i.message })),
    };
  }
  const spec = parsed.data;
  const issues: Issue[] = [];
  const err = (where: string, msg: string) => issues.push({ level: "error", where, msg });
  const warn = (where: string, msg: string) => issues.push({ level: "warn", where, msg });

  let total = 0;
  spec.scenes.forEach((s, i) => {
    const w = `scenes[${i}] ${s.type}`;
    const d = s.durationInFrames;
    total += d;

    if (d < RULES.sceneMinFrames) err(w, `씬 ${d}f < 최소 ${RULES.sceneMinFrames}f`);
    if (d > RULES.sceneMaxFrames) err(w, `씬 ${d}f > 최대 ${RULES.sceneMaxFrames}f — 씬을 쪼개라`);
    const end = sceneEnd(s);
    if (d < end) err(w, `애니메이션이 ${end}f 에 끝나는데 씬이 ${d}f 에서 잘림`);

    if (s.type === "face-only" && s.layout !== "full-face") err(w, "face-only 는 layout: full-face 만 허용");
    if (s.type !== "face-only" && s.layout === "full-face") err(w, "full-face 레이아웃은 face-only 타입만 허용");

    s.captions.forEach((c, j) => {
      const cw = `${w} captions[${j}]`;
      const next = s.captions[j + 1];
      if (next && next.at <= c.at) err(cw, "at 은 오름차순이어야 함");
      if (c.at >= d) err(cw, `at ${c.at}f 가 씬 길이 ${d}f 밖`);
      const shown = (next ? next.at : d) - c.at;
      if (shown < RULES.captionMinFrames) err(cw, `자막 노출 ${shown}f < ${RULES.captionMinFrames}f`);
      const n = visibleChars(c.text);
      if (n > RULES.captionMaxChars) err(cw, `자막 ${n}자 > ${RULES.captionMaxChars}자 — 자막을 둘로 나눠라`);
      if (c.hl && !c.text.includes(c.hl)) err(cw, `hl "${c.hl}" 이 text 안에 없음`);
    });

    if (s.type === "terminal-list") {
      if (s.props.rows.length > RULES.rowsMax) err(w, `rows ${s.props.rows.length} > ${RULES.rowsMax}`);
      if (s.props.highlight !== undefined && s.props.highlight >= s.props.rows.length)
        err(w, `highlight ${s.props.highlight} 가 rows 범위 밖`);
    }
    if (s.type === "icon-flow" && s.props.icons.length > RULES.iconsMax)
      err(w, `icons ${s.props.icons.length} > ${RULES.iconsMax}`);
    if (s.type === "title-card") {
      if (visibleChars(s.props.name) > RULES.titleNameMaxChars)
        err(w, `name ${visibleChars(s.props.name)}자 > ${RULES.titleNameMaxChars}자`);
      if (s.props.index && s.props.total && s.props.index > s.props.total) err(w, "index > total");
    }
  });

  if (spec.talkingHead === null && spec.scenes.some((s) => s.layout !== "full-graphic"))
    warn("talkingHead", "영상 경로 없음 — 사람 영역이 자리표시 실루엣으로 렌더됨");
  if (total / spec.fps > RULES.totalMaxSeconds)
    warn("scenes", `총 ${(total / spec.fps).toFixed(1)}초 > 권장 ${RULES.totalMaxSeconds}초`);

  return { spec, issues };
};
