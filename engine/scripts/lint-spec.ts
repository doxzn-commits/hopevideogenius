// 요약: spec 게이트 CLI. 인자 없으면 specs/*.json 전부 검사. 오류 1개라도 있으면 exit 1 (pre-commit 훅이 이걸 부른다).
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { RULES, checkLayouts, checkSpec } from "../src/spec/gate";
import { FILM_TOKENS } from "../src/spec/layout";

const root = resolve(__dirname, "..");
const args = process.argv.slice(2);
const files = args.length
  ? args.map((a) => resolve(a))
  : readdirSync(join(root, "specs"))
      .filter((f) => f.endsWith(".json"))
      .map((f) => join(root, "specs", f));

const registry = readFileSync(join(root, "src", "specs.ts"), "utf8");
let errorCount = 0;

const layoutIssues = checkLayouts();
if (layoutIssues.length) {
  console.log("\n✗ 레이아웃 불변식 (src/spec/layout.ts)");
  for (const i of layoutIssues) console.log(`   [오류] ${i.where}: ${i.msg}`);
  errorCount += layoutIssues.length;
}

for (const file of files) {
  const name = basename(file);
  const { spec, issues } = checkSpec(JSON.parse(readFileSync(file, "utf8")));
  if (!registry.includes(`/specs/${name}`)) {
    issues.push({ level: "error", where: "src/specs.ts", msg: `${name} 미등록 — Studio 에 안 보인다` });
  }
  // 녹화 파일이 없으면 렌더가 검은 화면으로 조용히 나간다 → 여기서 막는다 (Node 전용 검사)
  // 소리·로고 파일 — 없으면 렌더가 깨지거나 조용히 빠진다
  const need = (where: string, path?: string) => {
    if (path && !existsSync(join(root, "public", path))) issues.push({ level: "error", where, msg: `파일을 찾을 수 없다: engine/public/${path}` });
  };
  if (spec) {
    need("audio.bgm", spec.audio?.bgm);
    need("audio.voice", spec.audio?.voice);
    need("brand.logo", spec.brand?.logo);
  }
  if (spec)
    spec.scenes.forEach((sc, i) => {
      if (sc.type === "logo-outro") need(`scenes[${i}] logo-outro`, sc.props.logo);
      if (sc.type === "ui-stage") {
        sc.props.panels.forEach((pn, j) => need(`scenes[${i}] ui-stage panels[${j}]`, pn.src));
        need(`scenes[${i}] ui-stage pip`, sc.props.pip?.src ?? undefined);
      }
      if (sc.type === "ai-answer")
        (sc.props.cards ?? []).forEach((c, j) => c.images?.forEach((im) => need(`scenes[${i}] ai-answer cards[${j}]`, im ?? undefined)));
      if (sc.type === "screen-record" && sc.props.src && !existsSync(join(root, "public", sc.props.src)))
        issues.push({
          level: "error",
          where: `scenes[${i}] screen-record`,
          msg: `녹화 파일을 찾을 수 없다: engine/public/${sc.props.src}`,
        });
      if (sc.type === "screen-cycle")
        sc.props.screens.forEach((scr, j) => {
          if (scr.src && !existsSync(join(root, "public", scr.src)))
            issues.push({
              level: "error",
              where: `scenes[${i}] screen-cycle screens[${j}]`,
              msg: `스크린샷을 찾을 수 없다: engine/public/${scr.src}`,
            });
          if (!scr.src)
            issues.push({
              level: "warn",
              where: `scenes[${i}] screen-cycle screens[${j}]`,
              msg: "스크린샷 없음 — 스켈레톤으로 렌더된다",
            });
        });
    });

  const errors = issues.filter((i) => i.level === "error");
  const warns = issues.filter((i) => i.level === "warn");
  errorCount += errors.length;

  const frames = spec ? spec.scenes.reduce((a, s) => a + s.durationInFrames, 0) : 0;
  const head = spec ? `${name} — ${spec.id}, 씬 ${spec.scenes.length}개, ${(frames / spec.fps).toFixed(1)}초` : `${name} — 파싱 실패`;
  console.log(`\n${errors.length ? "✗" : "✓"} ${head}`);
  for (const i of errors) console.log(`   [오류] ${i.where}: ${i.msg}`);
  for (const i of warns) console.log(`   [경고] ${i.where}: ${i.msg}`);
}

// 문구를 쓰기 전에 알아야 하는 값이라 매번 같이 찍는다 (상한은 layout.ts 의 폰트 크기에서 역산된다)
console.log(
  `\n글자 수 상한(공백 포함) — 자막 ${RULES.captionMaxChars}자 · statement 한 줄 ${RULES.statementLineMaxChars}자 · ` +
    `title-card name ${RULES.titleNameMaxChars}자 · prompt ${RULES.promptMaxChars}자 · ` +
    `필름 헤드라인 ${FILM_TOKENS["product-film"].headlineMaxChars}자 · 키오스크 헤드라인 ${FILM_TOKENS["film-kiosk"].headlineMaxChars}자`,
);
console.log(errorCount ? `\n게이트 실패: 오류 ${errorCount}개` : "\n게이트 통과");
process.exit(errorCount ? 1 : 0);
