// 요약: 폰트 로딩. 라벨=Montserrat(대문자 자간), 코드=JetBrains Mono, 한글 자막=Noto Sans KR.
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadKR } from "@remotion/google-fonts/NotoSansKR";

const label = loadMontserrat("normal", { weights: ["500", "600", "700"], subsets: ["latin"] }).fontFamily;
const mono = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily;
const kr = loadKR("normal", { weights: ["700", "900"] }).fontFamily;

export const FONT_UI = `${label}, ${kr}, sans-serif`;
export const FONT_MONO = `${mono}, ${kr}, monospace`;
export const FONT_KR = `${kr}, sans-serif`;
