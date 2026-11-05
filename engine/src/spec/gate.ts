// 요약: spec 게이트. 레퍼런스 분석에서 나온 "기계가 판정할 수 있는 규칙"을 전부 여기에 박는다. lint-spec 과 Studio 경고 배너가 공용으로 쓴다.
// 근거 수치: factsheets/레퍼런스분석_claude스킬5_20260914.md
import { DEMO_ROLES, videoSpecSchema, type Scene, type VideoSpec } from "./schema";
import { FILM_T, notebookStepsTimeline, sceneEnd } from "./timelines";
import { CAPTION_HALF, FILM, FILM_TOKENS, LAYOUTS, SAFE, TEXT, filmTokens, maxCharsAt } from "./layout";


export const RULES = {
  sceneMinFrames: 18, // 레퍼런스 최단 샷 ≈0.6초
  sceneMaxFrames: 240, // 레퍼런스 최장 샷 ≈6초 + 여유. 넘으면 씬을 쪼갠다
  // 영상이 들어간 씬은 예외다. 소재가 시간을 끌고 가므로 "정보가 정체된다" 는 논리가 적용되지 않는다
  // (레퍼런스 5 는 46초 한 컷, 레퍼런스 4 는 53초 한 컷이다)
  mediaSceneMaxFrames: 1800, // 60초
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
  contactMinFrames: 180, // 연락처 6초 — 키오스크에서 보고 받아적는 데 걸리는 시간
  contactMaxFrames: 360, // 연락처는 정지 화면이 일이다. 씬 8초 상한의 "정보 정체" 논리가 적용되지 않는다
  headlineMinFrames: 39, // 레퍼런스 헤드라인 최단 1.3초 (팩트시트 §6.3)
  promptMaxChars: 46,
  videoScreenMinFrames: 60, // 영상 화면은 2초 이상 머물러야 움직임이 읽힌다
  screenMinFrames: 24, // 전시형 화면 하나가 머무는 최소 시간(0.8초). 레퍼런스 최단 0.4초 + 여유
  ctaKeywordMaxChars: 6, // 댓글 키워드는 한 단어 (본문 규칙과 동일 기준) // 요청문 말풍선 2줄(38px, 카드 폭 838px) 한계
} as const;

/**
 * 제작 규격(프로필). 기본은 30초(product-demo-30), 내용이 많을 때만 40초.
 * spec 의 profile 필드가 걸리면 아래 값들이 강제된다.
 */
export const PROFILES = {
  // 30초가 숏폼의 기본이다. 40초는 같은 내용을 담으면 속도감이 떨어진다.
  "product-demo-30": {
    label: "제품 데모 30초",
    totalFrames: 900,
    sceneCount: 7,
    sceneMinFrames: 60, // 2초
    sceneMaxFrames: 180, // 6초
    ctaMinFrames: 60,
    roles: DEMO_ROLES,
  },
  "product-demo-40": {
    label: "제품 데모 40초",
    totalFrames: 1200, // 40초 × 30fps
    sceneCount: 7,
    sceneMinFrames: 90, // 3초
    sceneMaxFrames: 210, // 7초
    ctaMinFrames: 60, // CTA 최소 2초
    roles: DEMO_ROLES, // hook → problem → solution → demo → differentiation → result → cta
  },
} as const;

/**
 * 필름형 규격. 근거: factsheets/레퍼런스분석_제품필름형_20261105.md §8·§9.4.
 * product-film = 폰 + 내레이션·BGM. film-kiosk = 무음 사이니지 — 소리가 없어 헤드라인이 메시지를 혼자 지고, 루프 이음새도 전환으로 센다.
 */
export const FILM_PROFILES = {
  "product-film": {
    label: "제품 필름",
    totalMin: 1050,
    totalMax: 1170,
    sceneCountMin: 7,
    sceneCountMax: 9,
    sceneMinFrames: 60,
    sceneMaxFrames: 240,
    needsVoice: true,
    loop: false,
    outroMinFrames: 60,
    contactMinFrames: 0,
  },
  "film-kiosk": {
    label: "필름 키오스크(무음·루프)",
    totalMin: 840,
    totalMax: 1000, // 필기 유지 시간을 확보하느라 960 에서 늘렸다
    sceneCountMin: 7,
    sceneCountMax: 10,
    sceneMinFrames: RULES.headlineMinFrames,
    sceneMaxFrames: 240,
    needsVoice: false,
    loop: true,
    outroMinFrames: 45,
    contactMinFrames: 240, // 8초 — 지나가다 번호를 받아적는 시간
  },
} as const;

const FILM_SCENE_TYPES = ["select-hook", "film-text", "ai-answer", "notebook-steps", "ui-stage", "cta-marquee", "logo-outro"];
const isDark = (s: Scene) => s.palette === "film-dark";

/** 다크 시간 비율 25~40%, 명암 전환 4~6회 — lint 와 측정 스크립트가 같은 기준을 쓴다 */
export const FILM_BALANCE = { darkMin: 0.25, darkMax: 0.4, flipsMin: 4, flipsMax: 6, callbackMin: 0.5, callbackMax: 0.6 } as const;

/** 영상 확장자 — 씬 컴포넌트(ScreenCycle)와 같은 기준을 쓴다 */
export const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i;

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
  // 키오스크 글자 불변식: 멀리서 읽는다. 헤드라인 72~84, 오브제 44 이상, 전화번호가 제일 크다
  const k = FILM_TOKENS["film-kiosk"];
  const bad = (msg: string) => issues.push({ level: "error", where: "FILM_TOKENS.film-kiosk", msg });
  if (k.headline < 72 || k.headline > 84) bad(`headline ${k.headline} 이 72~84 밖`);
  if (k.headlineWeight < 700) bad("헤드라인 굵기는 700 이상");
  if (k.headlineMaxChars > 13) bad("한 줄 13자 이내");
  (["pillText", "answerText", "note", "stepLabel", "tagline", "ctaLine", "brand"] as const).forEach((key) => {
    if (k[key] < k.objectMin) bad(`${key} ${k[key]} < 오브제 최소 ${k.objectMin}`);
  });
  // 연락처 위계: 전화번호 > 위치 > 상호 > 태그라인. 위치는 찾아오는 데 필요한 정보다
  if (k.ctaLine < 64) bad(`위치 ${k.ctaLine} < 64`);
  if (k.ctaLine <= k.name || k.name <= k.tagline) bad("연락처 위계는 전화번호 > 위치 > 상호 > 태그라인");
  (["name", "ctaLine", "display", "headline", "answerBig"] as const).forEach((key) => {
    if (k[key] >= k.phone) bad(`${key} ${k[key]} ≥ 전화번호 ${k.phone} — 전화번호가 가장 커야 한다`);
  });
  return issues;
};

const visibleChars = (s: string) => [...s.replace(/\s/g, "")].length;
/** 폭 계산용 글자 수 — 공백도 자리를 차지하므로 포함한다 (컴포넌트의 fitSize 와 같은 기준) */
const widthChars = (s: string) => [...s].length;

/** 필름형 규칙. 팩트시트 §9.4 + 키오스크 변형 */
const checkFilm = (spec: VideoSpec, total: number, err: (w: string, m: string) => void, warn: (w: string, m: string) => void) => {
  const name = spec.profile as keyof typeof FILM_PROFILES;
  const prof = FILM_PROFILES[name];
  const t = filmTokens(spec.profile);
  const p = `profile ${name}`;
  const n = spec.scenes.length;

  if (n < prof.sceneCountMin || n > prof.sceneCountMax) err(p, `장면 ${n}개가 규격 ${prof.sceneCountMin}~${prof.sceneCountMax}개 밖`);
  if (total < prof.totalMin || total > prof.totalMax) err(p, `총 ${total}f 가 규격 ${prof.totalMin}~${prof.totalMax}f 밖`);
  if (!spec.brand) err(p, "brand 가 없다 — 상시 로고가 이 형식의 축이다");

  // 소리: product-film 은 필수, film-kiosk 는 선택
  if (prof.needsVoice && !spec.audio?.voice) {
    const msg = "audio.voice 없음 — 소리 없이 내면 이 형식이 아니다. 무음이면 profile 을 film-kiosk 로";
    if (spec.template) warn(p, msg);
    else err(p, msg);
  }

  let dark = 0;
  let flips = 0;
  let tilts = 0;
  const prompts: string[] = [];
  let callbackAt: number | null = null;
  let acc = 0;
  spec.scenes.forEach((s, i) => {
    const w = `${p} scenes[${i}] ${s.type}`;
    const d = s.durationInFrames;
    if (s.layout !== "film") err(w, "필름형은 모든 씬이 layout: film 이다");
    if (s.palette !== "film-light" && s.palette !== "film-dark") err(w, `팔레트 ${s.palette} — film-light·film-dark 만 허용`);
    if (s.captionStyle && s.captionStyle !== "headline") err(w, "captionStyle 은 headline 만 — 다른 자막은 숏폼 자막이 된다");
    const contact = s.type === "cta-marquee" && Boolean(s.props.phone);
    if (d < prof.sceneMinFrames) err(w, `${d}f < 규격 최소 ${prof.sceneMinFrames}f`);
    if (d > prof.sceneMaxFrames && !contact) err(w, `${d}f > 규격 최대 ${prof.sceneMaxFrames}f`);
    if (contact && d < prof.contactMinFrames) err(w, `연락처 ${d}f < 최소 ${prof.contactMinFrames}f`);

    s.captions.forEach((c, j) => {
      const cw = `${w} captions[${j}]`;
      const len = [...c.text].length;
      if (len > t.headlineMaxChars) err(cw, `헤드라인 ${len}자(공백 포함) > ${t.headlineMaxChars}자`);
      const next = s.captions[j + 1];
      const shown = (next ? next.at : d) - c.at;
      if (shown < RULES.headlineMinFrames) err(cw, `헤드라인 유지 ${shown}f < ${RULES.headlineMinFrames}f(1.3초)`);
      if (c.hl) warn(cw, "헤드라인은 강조색을 쓰지 않는다 — hl 은 무시된다");
    });

    if (s.type === "select-hook" || s.type === "film-text")
      s.props.lines.forEach((ln, j) => {
        const len = [...ln].length;
        if (len > t.headlineMaxChars) err(`${w} lines[${j}]`, `${len}자(공백 포함) > 한 줄 ${t.headlineMaxChars}자`);
      });
    if (s.type === "ai-answer") {
      prompts.push(s.props.prompt);
      if (s.props.mode === "tilt") {
        tilts += 1;
        callbackAt = acc;
      }
    }
    if (isDark(s)) dark += d;
    const next = spec.scenes[i + 1] ?? (prof.loop ? spec.scenes[0] : null);
    if (next && isDark(s) !== isDark(next)) flips += 1;
    acc += d;
  });

  if (tilts > 1) err(p, `tilt ${tilts}회 — 3D 는 영상당 1회만`);
  const ratio = dark / total;
  if (ratio < FILM_BALANCE.darkMin || ratio > FILM_BALANCE.darkMax) warn(p, `다크 시간 ${(ratio * 100).toFixed(1)}% — 권장 25~40%`);
  if (flips < FILM_BALANCE.flipsMin || flips > FILM_BALANCE.flipsMax) warn(p, `명암 전환 ${flips}회 — 권장 4~6회${prof.loop ? "(루프 이음새 포함)" : ""}`);
  if (prompts.length < 2 || new Set(prompts).size === prompts.length) warn(p, "같은 prompt 를 쓰는 ai-answer 가 2회 이상이어야 콜백이 된다");
  if (callbackAt !== null) {
    const at = callbackAt / total;
    if (at < FILM_BALANCE.callbackMin || at > FILM_BALANCE.callbackMax) warn(p, `콜백 시작 ${(at * 100).toFixed(0)}% — 권장 50~60%`);
  }
  const last = spec.scenes[n - 1];
  if (last.type !== "logo-outro") err(p, "마지막 씬은 logo-outro 다");
  else if (last.durationInFrames < prof.outroMinFrames) err(p, `끝 로고 ${last.durationInFrames}f < 최소 ${prof.outroMinFrames}f`);
  if (name === "film-kiosk" && !spec.scenes.some((s) => s.type === "cta-marquee" && s.props.phone))
    err(p, "키오스크는 전화번호가 있는 cta-marquee 가 있어야 한다");
};

/** 필름형 씬 자체 규칙 — 프로필과 무관하다 */
const checkFilmScene = (s: Scene, w: string, err: (w: string, m: string) => void, warn: (w: string, m: string) => void) => {
  if (s.type === "select-hook" && s.props.selectLine >= s.props.lines.length) err(w, `selectLine ${s.props.selectLine} 이 lines 범위 밖`);
  if (s.type === "cta-marquee" && !s.props.phone && !s.props.button) err(w, "phone 또는 button 중 하나는 있어야 한다");
  if (s.type === "ai-answer" && s.props.notebook && s.props.mode !== "tilt") warn(w, "notebook 은 tilt 에서만 그려진다");
  if (s.type === "ai-answer" && (s.props.cards ?? []).some((c) => !c.sample && !c.images?.some(Boolean)))
    warn(w, "카드에 실제 이미지가 없다 — 평점·수치를 지어냈다면 sample: true");
  if (s.type === "ui-stage") {
    s.props.panels.forEach((pn, j) => {
      const prev = s.props.panels[j - 1];
      if (prev && pn.at <= prev.at) err(`${w} panels[${j}]`, "at 은 오름차순이어야 함");
      if (pn.at >= s.durationInFrames) err(`${w} panels[${j}]`, `at ${pn.at}f 가 씬 길이 밖`);
      if (!pn.sample && !pn.src && pn.kind !== "doc-columns") warn(`${w} panels[${j}]`, "수치 패널에 sample 표시가 없다 — 실제 값이 아니면 sample: true");
    });
  }
  if (s.type === "notebook-steps") {
    const tl = notebookStepsTimeline(s.props);
    s.props.pages.forEach((pg, j) => {
      const pw = `${w} pages[${j}]`;
      const prev = s.props.pages[j - 1];
      if (prev && pg.at <= prev.at) err(pw, "at 은 오름차순이어야 함");
      if (j === 0 && pg.at !== 0) err(pw, "첫 페이지 at 은 0 이다");
      if (s.captions.length > 0 && !s.captions.some((c) => c.at === pg.at)) warn(pw, `at ${pg.at} 에 맞는 헤드라인이 없다 — 교체는 같은 프레임에`);
      const next = s.props.pages[j + 1];
      if (next && tl.pages[j].end > next.at) err(pw, `쓰기가 ${tl.pages[j].end}f 에 끝나는데 다음 페이지가 ${next.at}f 에 온다`);
      // 다 쓰자마자 넘어가면 완성된 문장을 못 읽는다. 다음 페이지 또는 씬 끝까지 재서 막는다
      const pageEnd = next ? next.at : s.durationInFrames;
      const inkEnd = tl.pages[j].inkEnd;
      if (inkEnd > 0 && pageEnd - inkEnd < FILM_T.inkHold)
        err(pw, `필기 완료 ${inkEnd}f ~ 페이지 끝 ${pageEnd}f = ${pageEnd - inkEnd}f < 최소 ${FILM_T.inkHold}f — 완성 문장을 읽을 시간이 없다`);
      pg.lines.forEach((ln, k) => {
        (ln.marks ?? []).forEach((m) => {
          if (!ln.text.includes(m)) err(`${pw} lines[${k}]`, `밑줄 "${m}" 이 text 안에 없음`);
        });
        if (ln.ink === "hand" && ln.marks?.length) err(`${pw} lines[${k}]`, "손글씨 줄에는 밑줄을 긋지 않는다");
      });
      if (pg.lines.length > Math.floor((FILM.notebook.height - FILM.notebook.header) / FILM.notebook.rule)) err(pw, "줄 수가 공책 칸을 넘는다");
    });
  }
};

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

    // 영상을 품은 씬은 더 길어도 된다 (녹화·스크롤은 소재 자체가 시간을 끌고 간다)
    const holdsVideo =
      s.type === "screen-record" ||
      (s.type === "screen-cycle" && s.props.screens.some((scr) => scr.src && VIDEO_EXT.test(scr.src)));
    const isContact = s.type === "contact-card" || (s.type === "cta-marquee" && Boolean(s.props.phone));
    const maxFrames = holdsVideo ? RULES.mediaSceneMaxFrames : isContact ? RULES.contactMaxFrames : RULES.sceneMaxFrames;

    if (d < RULES.sceneMinFrames) err(w, `씬 ${d}f < 최소 ${RULES.sceneMinFrames}f`);
    if (d > maxFrames) err(w, `씬 ${d}f > 최대 ${maxFrames}f — 씬을 쪼개라`);
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
    if (FILM_SCENE_TYPES.includes(s.type) && s.layout !== "film") err(w, `${s.type} 은 layout: film 에서만 쓴다`);
    if (isContact && d < RULES.contactMinFrames)
      err(w, `연락처 ${d}f < 최소 ${RULES.contactMinFrames}f(6초) — 보고 받아적을 시간이 없다`);
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
      // 영상 화면은 움직임을 보여줘야 하므로 더 오래 머물러야 한다
      const hasVideo = s.props.screens.some((scr) => scr.src && VIDEO_EXT.test(scr.src));
      if (hasVideo && perScreen < RULES.videoScreenMinFrames)
        err(w, `영상 화면이 있는데 화면당 ${perScreen.toFixed(0)}f < ${RULES.videoScreenMinFrames}f(2초) — 움직임이 안 보인다`);
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
      // 필름형 헤드라인 글자 수는 프로필이 정한다(아래 film 블록)
      if (s.layout !== "film" && n > RULES.captionMaxChars) err(cw, `자막 ${n}자(공백 포함) > ${RULES.captionMaxChars}자 — 자막을 둘로 나눠라`);
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
    checkFilmScene(s, w, err, warn);

    if (s.type === "title-card") {
      if (visibleChars(s.props.name) > RULES.titleNameMaxChars)
        err(w, `name ${visibleChars(s.props.name)}자 > ${RULES.titleNameMaxChars}자`);
      if (s.props.index && s.props.total && s.props.index > s.props.total) err(w, "index > total");
    }
  });

  if (spec.profile === "product-film" || spec.profile === "film-kiosk") checkFilm(spec, total, err, warn);
  else if (spec.profile && spec.profile !== "free") {
    const prof = PROFILES[spec.profile];
    const p = `profile ${spec.profile}`;
    if (spec.scenes.length !== prof.sceneCount) err(p, `장면 ${spec.scenes.length}개 ≠ 규격 ${prof.sceneCount}개`);
    if (total !== prof.totalFrames)
      err(p, `총 ${total}f(${(total / spec.fps).toFixed(1)}초) ≠ 규격 ${prof.totalFrames}f(${prof.totalFrames / spec.fps}초)`);
    spec.scenes.forEach((s, i) => {
      const w = `${p} scenes[${i}]`;
      if (s.durationInFrames < prof.sceneMinFrames || s.durationInFrames > prof.sceneMaxFrames)
        err(
          w,
          `${s.durationInFrames}f 가 규격 ${prof.sceneMinFrames}~${prof.sceneMaxFrames}f(${prof.sceneMinFrames / spec.fps}~${prof.sceneMaxFrames / spec.fps}초) 밖`,
        );
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
