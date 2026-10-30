# public — 소재(영상·이미지·폰트)를 넣는 곳

> 요약: spec 이 가리키는 파일은 전부 이 폴더 기준이다. **여기 있는 미디어는 깃에 올라가지 않는다**(.gitignore). 새 컴퓨터에서는 소재를 따로 받아야 한다.

## 어디에 무엇을 넣나

| 소재 | 넣을 곳 | spec 에 적는 값 | 쓰는 유형 |
|---|---|---|---|
| **토킹헤드 영상** (사람이 말하는 세로 영상) | `public/talking-head.mp4` | 최상위 `"talkingHead": "talking-head.mp4"` | A 설명형 |
| **앱 화면 녹화** (세로 mp4) | `public/screens/<이름>.mp4` | `props.src: "screens/<이름>.mp4"` | E 녹화형 |
| **UI 스크린샷** (가로로 넓은 png·jpg) | `public/screens/<이름>.png` | `props.screens[].src: "screens/<이름>.png"` | F 전시형 |
| **폰트 파일** (쓸 경우) | `public/fonts/` | `src/fonts.ts` 에서 local-fonts 방식으로 교체 | 전부 |

경로는 항상 **`public/` 을 뺀 상대경로**다. `staticFile("screens/a.mp4")` → `engine/public/screens/a.mp4`

## 파일이 없으면 어떻게 되나
- **토킹헤드 없음** → 사람 영역이 자리표시 실루엣으로 렌더된다(경고)
- **녹화 없음** (`src: null`) → 폰 안에 "녹화 파일 없음" 자리표시(경고)
- **스크린샷 없음** (`src: null`) → UI 밴드가 스켈레톤(로딩 상태)으로 렌더된다(경고)
- **경로를 적었는데 파일이 없음** → `npm run lint:spec` 이 **오류로 막는다**.
  검은 화면으로 조용히 렌더되는 걸 막기 위해서다.

## 왜 깃에 안 올리나
산출물·소재는 재생성하거나 다시 받을 수 있고, 레포는 코드와 지침만으로 388KB를 유지한다.
`.gitignore` 가 mp4·png·jpg 등을 막는다(폰트 ttf/otf 만 예외로 추적된다 — 없으면 렌더가 재현되지 않기 때문).

**다른 컴퓨터로 옮길 때**: 레포는 clone 으로 끝나지만 `public/` 안의 소재는 따로 복사해야 한다.
소재 없이도 게이트와 렌더는 돌아간다(자리표시로 나온다).
