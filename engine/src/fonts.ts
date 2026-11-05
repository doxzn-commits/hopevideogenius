// 요약: 폰트 로딩. 라벨=Montserrat(대문자 자간), 코드=JetBrains Mono, 한글 자막=Noto Sans KR. 필름형=Pretendard·나눔손글씨 펜(로컬, public/fonts, OFL).
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadKR } from "@remotion/google-fonts/NotoSansKR";

const label = loadMontserrat("normal", { weights: ["500", "600", "700"], subsets: ["latin"] }).fontFamily;
const mono = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily;
const kr = loadKR("normal", { weights: ["700", "900"] }).fontFamily;

export const FONT_UI = `${label}, ${kr}, sans-serif`;
export const FONT_MONO = `${mono}, ${kr}, monospace`;
export const FONT_KR = `${kr}, sans-serif`;

/** 필름형 로컬 폰트. Google Fonts 에 없다. 렌더가 폰트를 기다리도록 delayRender 로 묶는다 */
const LOCAL_FONTS: { family: string; file: string; weight: string }[] = [
  { family: "Pretendard", file: "Pretendard-Medium.woff2", weight: "500" },
  { family: "Pretendard", file: "Pretendard-SemiBold.woff2", weight: "600" },
  { family: "Pretendard", file: "Pretendard-Bold.woff2", weight: "700" },
  { family: "Pretendard", file: "Pretendard-ExtraBold.woff2", weight: "800" },
  { family: "NanumPen", file: "NanumPenScript-Regular.ttf", weight: "400" },
];

if (typeof document !== "undefined") {
  const wait = delayRender("로컬 폰트 로딩");
  Promise.all(
    LOCAL_FONTS.map(({ family, file, weight }) =>
      new FontFace(family, `url("${staticFile(`fonts/${file}`)}")`, { weight }).load().then((face) => document.fonts.add(face)),
    ),
  )
    .then(() => continueRender(wait))
    // 폰트가 없으면 대체 서체로 조용히 나가지 않게 렌더를 멈춘다
    .catch((e) => cancelRender(e));
}

export const FONT_FILM = `Pretendard, ${kr}, sans-serif`;
export const FONT_HAND = `NanumPen, ${kr}, sans-serif`;
