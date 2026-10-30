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
    case "face-only":
      return 0;
  }
};
