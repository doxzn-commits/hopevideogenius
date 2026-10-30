// 요약: spec 게이트. 레퍼런스 분석에서 나온 "기계가 판정할 수 있는 규칙"을 전부 여기에 박는다. lint-spec 과 Studio 경고 배너가 공용으로 쓴다.
// 근거 수치: factsheets/레퍼런스분석_claude스킬5_20260914.md
import { ROLE_NAMES, videoSpecSchema, type VideoSpec } from "./schema";
import { sceneEnd } from "./timelines";
import { CAPTION_HALF, LAYOUTS, SAFE, TEXT, maxCharsAt } from "./layout";


export const RULES = {
  sceneMinFrames: 18, // 레퍼런스 최단 샷 ≈0.6초
  sceneMaxFrames: 240, // 레퍼런스 최장 샷 ≈6초 + 여유. 넘으면 씬을 쪼갠다
  // 자막·문구는 폭에 맞춰 자동 축소된다. 최소 크기에서도 안 들어가면 오류 (layout.ts TEXT 가 원천)
  captionMaxChars: maxCharsAt(TEXT.captionMin),
  captionMinFrames: 15, // 자막이 0.5초 미만 보이면 못 읽는다
  titleNameMaxChars: 14, // title-card 이름(모노 84px) 한 줄 한계
  rowsMax: 8, // terminal-list 카드 높이 한계
  iconsMax: 6, // icon-flow 가로 960px 한계
  totalMaxSeconds: 90, // 숏폼 권장 상한 (경고)
  statementLineMaxChars: maxCharsAt(TEXT.statementMin), // 화면 문구 한 줄(92px 기준, 최소 54px 까지 축소)
  captionsPerSceneMax: 3, // 한 장면에 자막을 더 넣고 싶으면 씬을 쪼갠다
  cursorPointsMax: 6, // 커서 키프레임. 더 많으면 시선이 따라오지 못한다
  promptMaxChars: 46,
  screenMinFrames: 24, // 전시형 화면 하나가 머무는 최소 시간(0.8초). 레퍼런스 최단 0.4초 + 여유
  ctaKeywordMaxChars: 6, // 댓글 키워드는 한 단어 (본문 규칙과 동일 기준) // 요청문 말풍선 2줄(38px, 카드 폭 838px) 한계
} as const;

/**
 * 제작 규격(프로필). 제품 데모 영상은 7단 구조·장면당 3~7초·총 40초가 규격이다.
 * spec 의 profile 필드가 걸리면 아래 값들이 강제된다.
 */
export const PROFILES = {
  "product-demo-40": {
    label: "제품 데모 40초",
    totalFrames: 1200, // 40초 × 30fps
    sceneCount: 7,
    sceneMinFrames: 90, // 3초
    sceneMaxFrames: 210, // 7초
    ctaMinFrames: 60, // CTA 최소 2초
    roles: ROLE_NAMES, // hook → problem → solution → demo → differentiation → result → cta
  },
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
    if (box.captionY - CAPTION_HALF < SAFE || box.captionY + CAPTION_HALF > 1920 - SAFE)
      issues.push({
        level: "error",
        where: `LAYOUTS.${name}`,
        msg: `자막 Y ${box.captionY} 가 안전 영역(상하 ${SAFE}px) 밖`,
      });
    // 자막이 그래픽 위에 있든 아래에 있든(녹화형은 위다) 두 영역이 겹치면 둘 다 못 읽는다.
    // 사람이 있는 레이아웃(split)은 카드 하단에 자막이 겹치는 것이 의도된 모습이라 예외.
    if (box.face === null && box.graphic) {
      const capTop = box.captionY - CAPTION_HALF;
      const capBottom = box.captionY + CAPTION_HALF;
      if (capTop < box.graphic.bottom && capBottom > box.graphic.top)
        issues.push({
          level: "error",
          where: `LAYOUTS.${name}`,
          msg: `자막 영역(${capTop}~${capBottom}) 이 그래픽 영역(${box.graphic.top}~${box.graphic.bottom}) 과 겹침`,
        });
    }
    if (box.graphic && box.graphic.top >= box.graphic.bottom)
      issues.push({ level: "error", where: `LAYOUTS.${name}`, msg: "graphic.top >= graphic.bottom" });
  }
  return issues;
};

const visibleChars = (s: string) => [...s.replace(/\s/g, "")].length;
/** 폭 계산용 글자 수 — 공백도 자리를 차지하므로 포함한다 (컴포넌트의 fitSize 와 같은 기준) */
const widthChars = (s: string) => [...s].length;

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

    // 카드형: 머리글이 없으면 카드가 빈 채로 유지된다
    if (s.layout === "card" && !s.card) err(w, "layout: card 는 card(app·glyph) 가 필요하다");
    if (s.card && s.layout !== "card") warn(w, "card 를 줬지만 layout 이 card 가 아니라 무시된다");
    if ((s.type === "prompt-run" || s.type === "app-intro" || s.type === "toggle-list") && s.layout !== "card")
      err(w, `${s.type} 은 layout: card 에서만 쓴다`);
    if (s.type === "social-cta" && s.layout !== "stack") err(w, "social-cta 는 layout: stack 에서만 쓴다");
    if (s.type === "screen-record" && s.layout !== "phone") err(w, "screen-record 는 layout: phone 에서만 쓴다");
    if (s.type === "screen-cycle" && s.layout !== "showcase") err(w, "screen-cycle 은 layout: showcase 에서만 쓴다");
    if (s.layout === "showcase") {
      if (s.type !== "screen-cycle") err(w, "layout: showcase 는 screen-cycle 전용이다");
      // 전시형에 설명을 넣으면 설명형·시연형의 열화판이 된다 (레퍼런스분석_UI킷쇼케이스 §2-D)
      if (s.captions.length > 0) err(w, "전시형은 자막을 쓰지 않는다 — 설명이 필요하면 layout 을 바꿔라");
    }
    if (s.type === "screen-cycle") {
      const perScreen = d / s.props.screens.length;
      if (perScreen < RULES.screenMinFrames)
        err(w, `화면당 ${perScreen.toFixed(0)}f < 최소 ${RULES.screenMinFrames}f — 화면 수를 줄이거나 씬을 늘려라`);
    }
    if (s.layout === "phone" && s.type !== "screen-record") err(w, "layout: phone 은 screen-record 전용이다");
    if (s.type === "screen-record") {
      // 파일이 실제로 있는지는 Node 에서만 볼 수 있다 → scripts/lint-spec.ts 가 검사한다.
      // (여기서 node:fs 를 쓰면 Studio·렌더 번들이 깨진다)
      if (s.props.src === null) warn(w, "녹화 파일 없음 — 자리표시 프레임으로 렌더된다");
    }
    if (s.type === "toggle-list") {
      // 머리글의 total 과 실제 항목 수가 다르면 "5개 중 3개"처럼 말이 안 되는 화면이 된다
      if (!s.card?.total) err(w, "toggle-list 는 card.total 이 필요하다");
      else if (s.card.total !== s.props.items.length)
        err(w, `card.total ${s.card.total} ≠ items ${s.props.items.length}개`);
      if (s.card?.index !== undefined) warn(w, "toggle-list 의 card.index 는 엔진이 세므로 무시된다");
    }
    if (s.type === "social-cta") {
      const k = widthChars(s.props.comment.keyword);
      // 본문 규칙과 같은 기준: 댓글 키워드는 한 단어 (runbooks/소셜본문_작성절차.md)
      if (k > RULES.ctaKeywordMaxChars) err(w, `댓글 키워드 ${k}자 > ${RULES.ctaKeywordMaxChars}자 — 한 단어로`);
      if (/\s/.test(s.props.comment.keyword)) err(w, "댓글 키워드에 공백이 있다 — 한 단어로");
    }
    if (s.type === "prompt-run") {
      const n = widthChars(s.props.prompt);
      if (n > RULES.promptMaxChars) err(w, `요청문 ${n}자 > ${RULES.promptMaxChars}자 — 말풍선을 넘친다`);
    }
    if (s.type !== "face-only" && s.layout === "full-face") err(w, "full-face 레이아웃은 face-only 타입만 허용");

    if (s.captions.length > RULES.captionsPerSceneMax)
      err(w, `자막 ${s.captions.length}개 > ${RULES.captionsPerSceneMax}개 — 씬을 쪼개라`);

    s.captions.forEach((c, j) => {
      const cw = `${w} captions[${j}]`;
      const next = s.captions[j + 1];
      if (next && next.at <= c.at) err(cw, "at 은 오름차순이어야 함");
      if (c.at >= d) err(cw, `at ${c.at}f 가 씬 길이 ${d}f 밖`);
      const shown = (next ? next.at : d) - c.at;
      if (shown < RULES.captionMinFrames) err(cw, `자막 노출 ${shown}f < ${RULES.captionMinFrames}f`);
      const n = widthChars(c.text);
      if (n > RULES.captionMaxChars) err(cw, `자막 ${n}자(공백 포함) > ${RULES.captionMaxChars}자 — 자막을 둘로 나눠라`);
      if (c.hl && !c.text.includes(c.hl)) err(cw, `hl "${c.hl}" 이 text 안에 없음`);
    });

    if (s.type === "terminal-list") {
      if (s.props.rows.length > RULES.rowsMax) err(w, `rows ${s.props.rows.length} > ${RULES.rowsMax}`);
      if (s.props.highlight !== undefined && s.props.highlight >= s.props.rows.length)
        err(w, `highlight ${s.props.highlight} 가 rows 범위 밖`);
    }
    if (s.type === "icon-flow" && s.props.icons.length > RULES.iconsMax)
      err(w, `icons ${s.props.icons.length} > ${RULES.iconsMax}`);
    if (s.type === "statement")
      s.props.lines.forEach((line, j) => {
        const n = widthChars(line);
        if (n > RULES.statementLineMaxChars)
          err(w, `lines[${j}] ${n}자(공백 포함) > ${RULES.statementLineMaxChars}자 — 문장을 줄여라`);
      });
    if (s.type === "browser-mock" && s.props.cursor) {
      if (s.props.cursor.length > RULES.cursorPointsMax)
        err(w, `커서 키프레임 ${s.props.cursor.length} > ${RULES.cursorPointsMax}`);
      s.props.cursor.forEach((c, j) => {
        if (c.at >= d) err(w, `cursor[${j}].at ${c.at}f 가 씬 길이 ${d}f 밖`);
      });
    }
    if (s.type === "title-card") {
      if (visibleChars(s.props.name) > RULES.titleNameMaxChars)
        err(w, `name ${visibleChars(s.props.name)}자 > ${RULES.titleNameMaxChars}자`);
      if (s.props.index && s.props.total && s.props.index > s.props.total) err(w, "index > total");
    }
  });

  if (spec.profile && spec.profile !== "free") {
    const prof = PROFILES[spec.profile];
    const p = `profile ${spec.profile}`;
    if (spec.scenes.length !== prof.sceneCount) err(p, `장면 ${spec.scenes.length}개 ≠ 규격 ${prof.sceneCount}개`);
    if (total !== prof.totalFrames)
      err(p, `총 ${total}f(${(total / spec.fps).toFixed(1)}초) ≠ 규격 ${prof.totalFrames}f(${prof.totalFrames / spec.fps}초)`);
    spec.scenes.forEach((s, i) => {
      const w = `${p} scenes[${i}]`;
      if (s.durationInFrames < prof.sceneMinFrames || s.durationInFrames > prof.sceneMaxFrames)
        err(w, `${s.durationInFrames}f 가 규격 ${prof.sceneMinFrames}~${prof.sceneMaxFrames}f(3~7초) 밖`);
      const want = prof.roles[i];
      if (!s.role) err(w, `role 누락 — "${want}" 이어야 함`);
      else if (s.role !== want) err(w, `role "${s.role}" ≠ 규격 순서상 "${want}"`);
      if (want === "cta" && s.durationInFrames < prof.ctaMinFrames)
        err(w, `CTA ${s.durationInFrames}f < 최소 ${prof.ctaMinFrames}f(2초)`);
    });
  }

  // 사람이 들어가는 레이아웃이 있을 때만 경고한다 (card·full-graphic 은 사람이 없다)
  if (spec.talkingHead === null && spec.scenes.some((s) => LAYOUTS[s.layout].face !== null))
    warn("talkingHead", "영상 경로 없음 — 사람 영역이 자리표시 실루엣으로 렌더됨");
  if (total / spec.fps > RULES.totalMaxSeconds)
    warn("scenes", `총 ${(total / spec.fps).toFixed(1)}초 > 권장 ${RULES.totalMaxSeconds}초`);

  return { spec, issues };
};
