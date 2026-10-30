# previews — 유형 미리보기 페이지

> 요약: 영상 유형 4종을 템플릿 렌더 영상과 함께 보여주는 한 장짜리 HTML. Artifact 로 발행해 공유한다. 다시 만드는 절차가 여기 있다.

## 무엇인가
`types.html` 한 파일이 전부다. 유형마다 **우리 템플릿을 실제로 렌더한 mp4** 를 걸어 두고,
측정 수치(분당 컷·길이·자막 주기)·쓸 때·소재·엔진 매핑·**망하는 방식**을 같이 적었다.
분류 근거는 `runbooks/레퍼런스분석_절차.md`, 각 유형의 실측값은 `factsheets/레퍼런스분석_*.md`.

## 다시 만드는 절차
영상은 산출물이라 커밋되지 않는다(`.gitignore`). 그래서 **렌더부터** 해야 한다.

```bash
cd engine && npm ci
npx remotion render DemoRepoRules        out/demo.mp4            # A 설명형
npx remotion render TemplateProductDemo40 out/product-demo-40.mp4 # B 서사형
npx remotion render TemplateCardTools     out/card-tools.mp4      # C 시연형(코드)
npx remotion render TemplateScreenRecord  out/screen-record.mp4   # C 시연형(녹화)
npx remotion render TemplateShowcase      out/showcase.mp4        # D 전시형
```

⚠ **녹화형은 녹화 파일이 있어야 화면이 나온다.** 없으면 자리표시 프레임으로 렌더된다.
`engine/public/screens/` 에 mp4 를 넣고 `specs/template-screen-record.json` 의 `src` 를 채운 뒤 렌더한다.
전시형도 같다 — 스크린샷이 없으면 스켈레톤(로딩 상태)으로 돌아간다. 그 상태로도 형식은 보인다.

그다음 Artifact 로 발행한다(파일 맵으로 mp4 5개를 같이 올린다):

| 페이지가 참조하는 경로 | 실제 파일 |
|---|---|
| `previews/explainer.mp4` | `engine/out/demo.mp4` |
| `previews/pitch.mp4` | `engine/out/product-demo-40.mp4` |
| `previews/demo-code.mp4` | `engine/out/card-tools.mp4` |
| `previews/demo-record.mp4` | `engine/out/screen-record.mp4` |
| `previews/showcase.mp4` | `engine/out/showcase.mp4` |

## 고칠 때
- 유형이 늘거나 수치가 바뀌면 `types.html` 의 해당 섹션과 상단 측정표를 같이 고친다.
- 페이지는 자막·사람이 없는 정적 문서다. 라이브러리를 더하지 않는다(폰트만 Google Fonts).
- 같은 URL 로 다시 발행하려면 기존 Artifact 링크를 알아야 한다. 모르면 목록에서 찾는다.
