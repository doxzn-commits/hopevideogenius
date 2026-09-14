// 요약: 씬 타입 → 컴포넌트 매핑. **씬 타입의 유일한 원천**. 새 타입은 schema.ts + timelines.ts + 여기 3곳에 등록한다.
import type React from "react";
import type { SceneOf, SceneType } from "../spec/schema";
import type { Palette } from "../theme";
import { TitleCard } from "./TitleCard";
import { TerminalList } from "./TerminalList";
import { BeforeAfter } from "./BeforeAfter";
import { IconFlow } from "./IconFlow";
import { Statement } from "./Statement";
import { BrowserMock } from "./BrowserMock";

export type SceneProps<T extends SceneType> = { scene: SceneOf<T>; p: Palette };

const FaceOnly: React.FC<SceneProps<"face-only">> = () => null;

export const SCENES: { [K in SceneType]: React.FC<SceneProps<K>> } = {
  "title-card": TitleCard,
  "terminal-list": TerminalList,
  "before-after": BeforeAfter,
  "icon-flow": IconFlow,
  statement: Statement,
  "browser-mock": BrowserMock,
  "face-only": FaceOnly,
};
