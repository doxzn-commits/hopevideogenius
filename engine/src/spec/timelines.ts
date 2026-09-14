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
    case "face-only":
      return 0;
  }
};
