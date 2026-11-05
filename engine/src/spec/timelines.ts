// 요약: 모든 씬의 내부 타이밍(프레임) 원천. 씬 컴포넌트와 게이트가 같은 함수를 쓴다 → "애니메이션이 끝나기 전에 컷" 을 자동 판정.
import type { Scene, SceneOf } from "./schema";

export const T = {
  typePerChar: 1.5, // 명령 타이핑 속도(프레임/글자)
  nameTypePerChar: 2, // 타이틀 이름 타이핑 속도
  rowStagger: 5, // 리스트 행 등장 간격
  barFill: 12, // 진행바 채우는 시간
  settle: 12, // 마지막 동작 후 머무는 최소 시간
  iconPopStagger: 4,
  linkPerIcon: 8,
} as const;

export const titleCardTimeline = (p: SceneOf<"title-card">["props"]) => {
  const cardIn = 10;
  const typeStart = 16;
  const typeEnd = typeStart + Math.ceil(p.name.length * T.nameTypePerChar);
  const subtitleAt = typeEnd + 4;
  return { cardIn, typeStart, typeEnd, subtitleAt, end: subtitleAt + T.settle };
};

export const terminalListTimeline = (p: SceneOf<"terminal-list">["props"]) => {
  const typeStart = 6;
  const typeEnd = typeStart + Math.ceil(p.command.length * T.typePerChar);
  const rowsStart = typeEnd + 6;
  const rowsEnd = rowsStart + p.rows.length * T.rowStagger + T.barFill;
  const highlightAt = p.highlight === undefined ? null : rowsEnd + 6;
  return { typeStart, typeEnd, rowsStart, rowsEnd, highlightAt, end: (highlightAt ?? rowsEnd) + T.settle };
};

export const beforeAfterTimeline = () => {
  const beforeStart = 6;
  const beforeEnd = 36;
  const afterStart = 42;
  const afterEnd = 54;
  return { beforeStart, beforeEnd, afterStart, afterEnd, chipSwap: afterStart, end: afterEnd + T.settle };
};

export const promptRunTimeline = (p: SceneOf<"prompt-run">["props"]) => {
  const promptStart = 6;
  const promptEnd = promptStart + Math.ceil([...p.prompt].length * 1.1);
  const toolAt = promptEnd + 6; // 툴 호출 행 등장 (실행 중…)
  const doneAt = toolAt + 14; // ✓ 완료
  const resultAt = doneAt + 4;
  const rows = p.result
    ? p.result.kind === "table"
      ? p.result.rows.length
      : p.result.kind === "funnel"
        ? p.result.steps.length
        : p.result.kind === "thumbs"
          ? p.result.items.length
          : 2
    : 0;
  const resultEnd = p.result ? resultAt + rows * T.rowStagger + T.barFill : doneAt;
  return { promptStart, promptEnd, toolAt, doneAt, resultAt, resultEnd, end: resultEnd + T.settle };
};

/** 녹화 씬은 내부 애니메이션이 없다(영상이 알아서 흐른다). 프레임 등장만 있으면 된다. */
export const contactCardTimeline = () => ({ badgeIn: 0, nameAt: 8, linesAt: 18, phoneAt: 26, end: 26 + 14 + T.settle });

export const screenCycleTimeline = (p: SceneOf<"screen-cycle">["props"]) => {
  const titleIn = 0;
  const bandIn = 10;
  const codeIn = 20;
  const skeleton = 8; // 화면마다 스켈레톤이 먼저 깔리는 시간
  return { titleIn, bandIn, codeIn, skeleton, end: codeIn + 12 + T.settle };
};

export const screenRecordTimeline = () => ({ frameIn: 12, end: 12 + T.settle });

export const appIntroTimeline = () => ({ glyphIn: 0, roleAt: 10, captionAt: 18, end: 18 + 12 + T.settle });

export const toggleListTimeline = (p: SceneOf<"toggle-list">["props"]) => {
  const startAt = p.startAt ?? 12;
  const stagger = 14; // 토글 하나가 켜지는 간격
  const lastOn = startAt + (p.items.length - 1) * stagger;
  return { startAt, stagger, lastOn, end: lastOn + 10 + T.settle };
};

/** 현재 프레임에서 켜진 토글 개수 — 씬과 카드 머리글(N/total)이 같은 값을 쓴다 */
export const toggleOnCount = (p: SceneOf<"toggle-list">["props"], frame: number) => {
  const { startAt, stagger } = toggleListTimeline(p);
  let n = 0;
  for (let i = 0; i < p.items.length; i++) if (frame >= startAt + i * stagger) n = i + 1;
  return n;
};

export const socialCtaTimeline = (p: SceneOf<"social-cta">["props"]) => {
  const profileIn = 0;
  const followAt = 16; // 팔로우 → 팔로잉 으로 상태 변화
  const commentIn = 32;
  const typeStart = 46;
  const typeEnd = typeStart + Math.ceil([...p.comment.keyword].length * 4);
  const dmAt = p.dm ? typeEnd + 10 : typeEnd;
  return { profileIn, followAt, commentIn, typeStart, typeEnd, dmAt, end: dmAt + 16 + T.settle };
};

export const statementTimeline = (p: SceneOf<"statement">["props"]) => {
  const lineStagger = 9; // 두 번째 문장은 0.3초 뒤 (기획 원칙)
  const lastIn = (p.lines.length - 1) * lineStagger + 12;
  return { lineStagger, end: lastIn + T.settle };
};

export const browserMockTimeline = (p: SceneOf<"browser-mock">["props"]) => {
  const windowIn = 12;
  const blocksStart = windowIn + 4;
  const blocksEnd = blocksStart + p.blocks.length * 4 + 10;
  const cursorEnd = p.cursor && p.cursor.length > 0 ? Math.max(...p.cursor.map((c) => c.at)) + 16 : 0;
  return { windowIn, blocksStart, blocksEnd, cursorEnd, end: Math.max(blocksEnd, cursorEnd) + T.settle };
};

export const iconFlowTimeline = (p: SceneOf<"icon-flow">["props"]) => {
  const popEnd = p.icons.length * T.iconPopStagger + 8;
  const linksEnd = popEnd + (p.icons.length - 1) * T.linkPerIcon;
  const collapseAt = p.collapseTo ? linksEnd + 8 : null;
  return { popEnd, linksEnd, collapseAt, end: (collapseAt !== null ? collapseAt + 18 : linksEnd) + T.settle };
};

/** 필름형 공통 값. 근거: 팩트시트 §6.1, §9.2 */
export const FILM_T = {
  moveMin: 14, // 위치 이동 최소·최대 — 벗어나면 급하거나 늘어진다
  moveMax: 22,
  panelSlide: 15,
  handPerChar: 1.5, // 손글씨 써지는 속도(프레임/글자)
  markFrames: 14, // 밑줄 하나가 그어지는 시간
  markStagger: 10,
  inkLead: 6, // 슬라이드가 끝나기 이만큼 전에 쓰기 시작한다(감속 곡선이라 이미 94% 와 있다). 빈 페이지를 줄인다
  inkHold: 39, // 필기가 끝난 뒤 다 읽을 때까지 머무는 최소 시간(1.3초)
} as const;

export const selectHookTimeline = () => ({ riseEnd: 14, fadeEnd: 6, selectStart: 2, selectEnd: 24, end: 24 + T.settle });

export const filmTextTimeline = () => ({ riseEnd: 14, markAt: 8, markEnd: 30, end: 30 });

export const aiAnswerTimeline = (p: SceneOf<"ai-answer">["props"]) => {
  const started = p.startTyped ?? 0;
  const typeStart = started > 0 ? 0 : 4; // pill 은 컷 시점에 이미 떠 있다
  const typeEnd = typeStart + Math.ceil(18 * (1 - started));
  const sentAt = typeEnd + 2;
  const riseStart = sentAt + 4;
  const riseEnd = riseStart + 20;
  const answerStart = riseEnd - 6;
  const answerStagger = 5;
  const answerEnd = answerStart + Math.max(0, p.answer.length - 1) * answerStagger + 10;
  const stackAt = answerEnd + 6; // 카드·공책이 올라오기 시작하는 시점
  const cardRise = 20;
  const cardHold = 24;
  const cardSlide = 18;
  const nCards = p.cards?.length ?? 0;
  const tiltRise = 18;
  const tiltDrift = 45;
  const end =
    p.mode === "tilt"
      ? stackAt + tiltRise + T.settle
      : nCards > 0
        ? stackAt + cardRise + (nCards - 1) * (cardHold + cardSlide) + T.settle
        : answerEnd + T.settle;
  return { typeStart, typeEnd, sentAt, riseStart, riseEnd, answerStart, answerStagger, answerEnd, stackAt, cardRise, cardHold, cardSlide, tiltRise, tiltDrift, end };
};

export const notebookStepsTimeline = (p: SceneOf<"notebook-steps">["props"]) => {
  const slide = p.transition === "cut" ? 0 : FILM_T.panelSlide;
  const pages = p.pages.map((pg, i) => {
    const moveStart = i === 0 ? 0 : pg.at + 1; // 헤드라인 교체가 슬라이드보다 1프레임 먼저다
    let cursor = i === 0 ? 6 : moveStart + Math.max(2, slide - FILM_T.inkLead);
    const lines = pg.lines.map((ln) => {
      const hand = ln.ink === "hand";
      const start = cursor;
      const writeEnd = hand ? start + Math.ceil([...ln.text].length * FILM_T.handPerChar) : start;
      const marks = (ln.marks ?? []).map((_, m) => ({
        at: writeEnd + m * FILM_T.markStagger,
        end: writeEnd + m * FILM_T.markStagger + FILM_T.markFrames,
      }));
      const lineEnd = marks.length ? marks[marks.length - 1].end : writeEnd;
      // 밑줄은 끊기지 않고 이어서 그어진다. 손글씨는 앞 줄이 끝나야 다음 줄을 쓴다
      cursor = hand ? lineEnd + 2 : marks.length ? marks[marks.length - 1].at + FILM_T.markStagger : cursor;
      return { start, writeEnd, marks, lineEnd, hand };
    });
    const inkEnd = Math.max(0, ...lines.filter((l) => l.hand).map((l) => l.writeEnd));
    return { moveStart, moveEnd: moveStart + slide, lines, inkEnd, end: Math.max(moveStart + slide, ...lines.map((l) => l.lineEnd)) };
  });
  return { slide, pages, end: pages[pages.length - 1].end + T.settle };
};

export const uiStageTimeline = (p: SceneOf<"ui-stage">["props"]) => {
  const slide = FILM_T.panelSlide;
  const draw = { "line-chart": 40, "rank-list": 25, "doc-columns": 0 } as const;
  const panels = p.panels.map((pn, i) => {
    const moveStart = i === 0 ? 0 : pn.at + 1;
    const moveEnd = i === 0 || pn.cut ? moveStart : moveStart + slide;
    return { moveStart, moveEnd, drawEnd: moveEnd + draw[pn.kind] };
  });
  const zoomFrames = p.zoom?.frames ?? 26;
  const zoomEnd = p.zoom ? p.zoom.at + zoomFrames : 0;
  return { slide, panels, zoomFrames, zoomEnd, end: Math.max(zoomEnd, panels[panels.length - 1].drawEnd) + T.settle };
};

/** 연락처는 컷 시점에 이미 다 떠 있다. 움직이는 것은 맥동·마퀴처럼 느린 것뿐이다 */
export const ctaMarqueeTimeline = () => ({
  pulsePeriod: 64, // 레퍼런스 32f 는 버튼용이다. 받아적는 글자는 절반 속도로 둔다
  rowSpeeds: [-15, 22.5, -15], // px/s
  end: 0,
});

export const logoOutroTimeline = () => ({ settleEnd: 12, driftFrames: 72, end: 12 + T.settle });

/** 상시 로고를 숨기는 씬. 클라이맥스(tilt)·끝 로고·상호가 크게 찍힌 CTA 뿐이다 */
export const brandHidden = (s: Scene): boolean =>
  s.hideBrand ??
  (s.type === "logo-outro" || (s.type === "ai-answer" && s.props.mode === "tilt") || (s.type === "cta-marquee" && Boolean(s.props.name)));

/** 씬 애니메이션이 끝나는 프레임. durationInFrames 는 이 값 이상이어야 한다. */
export const sceneEnd = (s: Scene): number => {
  switch (s.type) {
    case "title-card":
      return titleCardTimeline(s.props).end;
    case "terminal-list":
      return terminalListTimeline(s.props).end;
    case "before-after":
      return beforeAfterTimeline().end;
    case "icon-flow":
      return iconFlowTimeline(s.props).end;
    case "statement":
      return statementTimeline(s.props).end;
    case "prompt-run":
      return promptRunTimeline(s.props).end;
    case "app-intro":
      return appIntroTimeline().end;
    case "contact-card":
      return contactCardTimeline().end;
    case "screen-cycle":
      return screenCycleTimeline(s.props).end;
    case "screen-record":
      return screenRecordTimeline().end;
    case "toggle-list":
      return toggleListTimeline(s.props).end;
    case "social-cta":
      return socialCtaTimeline(s.props).end;
    case "browser-mock":
      return browserMockTimeline(s.props).end;
    case "select-hook":
      return selectHookTimeline().end;
    case "film-text":
      return s.props.mark ? filmTextTimeline().markEnd : s.props.rise ? filmTextTimeline().riseEnd : 0;
    case "ai-answer":
      return aiAnswerTimeline(s.props).end;
    case "notebook-steps":
      return notebookStepsTimeline(s.props).end;
    case "ui-stage":
      return uiStageTimeline(s.props).end;
    case "cta-marquee":
      return ctaMarqueeTimeline().end;
    case "logo-outro":
      return logoOutroTimeline().end;
    case "face-only":
      return 0;
  }
};
