# engine — Remotion 영상 엔진

> 요약: spec(JSON) 한 장으로 9:16 정보 전달 영상을 조립하는 Remotion 프로젝트. 씬 타입·게이트·레이아웃 상수가 여기 있다.

## 구조
```
specs/*.json        영상 1편 = spec 1개 (씬 나열)
src/specs.ts        spec 등록 — 새 spec 은 여기 import 한 줄 추가 (빠뜨리면 게이트가 잡는다)
src/spec/schema.ts  spec 스키마(zod). 씬 타입·레이아웃·팔레트 이름의 원천
src/spec/timelines.ts 씬 내부 타이밍. 컴포넌트와 게이트가 공유 → 애니메이션 잘림 자동 판정
src/spec/gate.ts    RULES 상수 + checkSpec/checkLayouts. 기계가 판정 가능한 규칙은 전부 여기
src/spec/layout.ts  레이아웃 좌표(순수 숫자, remotion 비의존)
src/theme.ts        팔레트 5종 + 이징
src/scenes/         씬 컴포넌트 + registry.ts(타입→컴포넌트, 씬 타입의 원천)
src/components/     Glow·Card·Chip·GlyphTile·자막·토킹헤드
scripts/lint-spec.ts 게이트 CLI
```

## 명령
```bash
npm run lint:spec                 # 게이트 (렌더 전 필수)
npm run studio                    # 미리보기 http://localhost:3000/<id>
npx remotion still <id> --frame=100 --scale=0.5 out/f.png
npx remotion render <id> out/<이름>.mp4
npm run check                     # lint:spec + eslint + tsc
```

## 레이어 순서 (바꾸지 말 것)
배경 글로우 → 그래픽 카드 → 사람 영상 → 자막 → 게이트 경고 배너.
자막이 사람보다 아래로 가면 얼굴에 가려진다. `src/SpecVideo.tsx` 가 이 순서를 고정한다.

## 절차
영상 한 편 만들기: `../runbooks/정보전달영상_제작절차.md`
새 씬 타입 추가: `../runbooks/씬타입_추가절차.md`
