# INDEX — 전 문서 색인

> 요약: 이 레포의 모든 문서·핵심 코드의 경로·요약·키워드. **자동 생성 파일 — 직접 고치지 말고** `tools/index_seed.tsv` 를 고친 뒤 `python tools/mkindex.py` 실행.

총 31행. 찾는 법: 이 파일에서 요청 단어(한글·영문·스크립트명)로 검색 → 경로를 연다. 없으면 KNOWN-GAPS.md.

## 루트 문서

| 경로 | 요약 (무엇 / 언제 여나) | 키워드 |
|---|---|---|
| [00_부팅.md](00_부팅.md) | **00_부팅 — 이 레포를 처음 여는 AI에게** — 레포 소개·읽는 순서·폴더 역할·절대 규칙. **세션당 한 번, 처음 열 때만** 읽는 온보딩 문서 | 부팅, 시작, 처음, 온보딩, 레포 구조, 폴더가 뭐야, 어디부터 읽나, boot, getting started |
| [CLAUDE.md](CLAUDE.md) | **CLAUDE.md — 라우터** — 게이트 + 호출어→참조파일 표 + 최소 실행 경로 + 작업 후 정리(승격) 규칙. **매 작업마다 여기서 다음 파일을 고른다** | 라우터, 지침, 규칙, 승격 규칙, 정리 규칙, 어디에 기록하나, 게이트, 호출어, 커밋, push, 깃, 작업 마무리 |
| [KNOWN-GAPS.md](KNOWN-GAPS.md) | **KNOWN-GAPS — 레포에 없는 것** — 없는 것 전체 목록: 오디오·내레이션·BGM·효과음, 씬 전환(트랜지션·페이드), 업로드·썸네일·배포, 폰트 오프라인, 2줄 자막, 토킹헤드 자동 크롭, GitHub 원격 | 없는 기능, 미구현, 한계, 오디오 없음, 내레이션, 나레이션, 보이스오버, 성우, 더빙, 목소리, TTS, 음성, 오디오 트랙, 효과음, SFX, BGM, 배경음악, 사운드, 전환 효과, 트랜지션, 페이드, 디졸브, 크로스페이드, 와이프, 컷 전환, 유튜브, 쇼츠, 업로드, 썸네일, 배포, 깃허브 원격, 폰트 오프라인, 안 되는 것 |

## runbooks — 확정 절차

| 경로 | 요약 (무엇 / 언제 여나) | 키워드 |
|---|---|---|
| [runbooks/씬타입_추가절차.md](runbooks/씬타입_추가절차.md) | **새 씬 타입 추가하기** — **레지스트리에 없는 새 타입을 만들 때만.** 고칠 4곳(schema·timelines·컴포넌트·registry)과 확인 방법 | 새 씬 타입, 없는 장면, 새로 만들기, 모티프 구현, registry 등록, 스키마 추가, 승격, 코드로 내리기 |
| [runbooks/정보전달영상_제작절차.md](runbooks/정보전달영상_제작절차.md) | **정보 전달 영상 한 편 만들기** — 대본→자막 쪼개기→씬 타입 선택→spec 작성→게이트→미리보기→렌더까지 확정 절차. **이미 있는 씬을 영상에 넣는 방법도 여기** | 영상 만들어줘, 새 에피소드, 대본, 자막 쪼개기, 씬 넣기, 장면 추가, 이 장면 쓰고 싶다, 렌더, 내보내기, mp4, remotion render, 미리보기, studio |

## factsheets — 사실·수치·출처

| 경로 | 요약 (무엇 / 언제 여나) | 키워드 |
|---|---|---|
| [factsheets/레퍼런스분석_claude스킬5_20260914.md](factsheets/레퍼런스분석_claude스킬5_20260914.md) | **레퍼런스 분석 — 클로드 코드 스킬 5개 숏폼** — 레퍼런스 영상 실측: 컷 타이밍(평균 샷 1.9초), 레이아웃 좌표, 팔레트 5종(엔진 theme.ts 이름과 대응), 모션 모티프 12종, 대본 전개 구조 | 레퍼런스, 이 영상처럼, 스타일, 수치 근거, 컷 간격, 평균 샷, 자막 크기, 레퍼런스 팔레트(실측), 레이아웃 좌표, 모티프, ffprobe 측정 |

## labs — 날짜별 실험 로그

| 경로 | 요약 (무엇 / 언제 여나) | 키워드 |
|---|---|---|
| [labs/레포세팅_엔진부트스트랩_20260914.md](labs/레포세팅_엔진부트스트랩_20260914.md) | **레포 세팅 + 엔진 부트스트랩 기록** — 자막 겹침·아이콘 위치 버그를 코드로 고친 과정과 게이트 수치의 **근거**(왜 18자·왜 18프레임인지) + 게이트 역방향 테스트 결과 | 왜 이 값이야, 왜 18자, 왜 18프레임, 18자 근거, 자막 겹침, 버그 기록, 부트스트랩, 구조가 왜 이래, 실패한 것 |

## engine — 실행 코드

| 경로 | 요약 (무엇 / 언제 여나) | 키워드 |
|---|---|---|
| [engine/README.md](engine/README.md) | **엔진 구조 요약** — engine 폴더별 역할·설치(npm i)·명령어·레이어 순서. 영상 규격(1080×1920 9:16 / 30fps)도 여기 | 엔진 구조, 설치, npm install, 의존성, 환경 세팅, 노드, Remotion 버전, 명령어, 어떻게 렌더, 레이어 순서, 9:16, 세로 영상, 해상도, fps, 프레임레이트, 영상 규격 |
| [engine/specs/demo-repo-rules.json](engine/specs/demo-repo-rules.json) | **데모 spec (5씬 15초)** — 새 spec 을 만들 때 복사해서 시작하는 원본. 5개 씬 구성 = 씬 타입 4종 + face-only | 데모, 예시 spec, 템플릿, 복사해서 시작, 샘플 영상, spec 예제 |
| [engine/src/fonts.ts](engine/src/fonts.ts) | **폰트 로딩** — 라벨=Montserrat, 코드=JetBrains Mono, 한글 자막=Noto Sans KR (Google Fonts 원격 로딩) | 폰트, 글꼴, 한글 폰트, 자막 폰트, 몬세라트, 모노스페이스, 폰트 바꾸기 |
| [engine/src/index.ts](engine/src/index.ts) | **Remotion 엔트리** — registerRoot 로 Root 를 등록하는 진입점. 건드릴 일 거의 없다 | 엔트리, 진입점, registerRoot, index.ts |
| [engine/src/specs.ts](engine/src/specs.ts) | **spec 등록 목록 (새 spec 은 여기)** — specs/*.json 을 Studio 에 등록한다. **새 spec 이 Studio 에 안 보이면 가장 먼저 고칠 곳** | spec 등록, Studio 에 안 보임, 컴포지션이 없음, import 추가, 새 spec 추가 |
| [engine/src/theme.ts](engine/src/theme.ts) | **팔레트 이름·색값** — 팔레트 5종 이름(ember·navy·violet·forest·pastel)과 색값, 공통 이징. 팔레트 이름 목록의 원천 | 색, 팔레트 이름, 팔레트 목록, 테마 색상, 배경색, 어떤 색 쓰나, ember navy violet forest pastel, 이징 |
| [engine/src/Root.tsx](engine/src/Root.tsx) | **Composition 등록 (보통 고칠 필요 없음)** — spec 별 Remotion Composition 을 만든다. **새 spec 등록은 여기가 아니라 src/specs.ts** | Root, 내부 구조, 건드릴 일 거의 없음, 컴포지션 생성 |
| [engine/src/SpecVideo.tsx](engine/src/SpecVideo.tsx) | **영상 조립** — 씬·사람·자막 레이어 순서를 고정하고 spec 을 한 편으로 조립. (자막 좌표는 spec/layout.ts) | 레이어 순서, 조립, 전체 영상, 자막이 가림, 시퀀스 |
| [engine/src/spec/gate.ts](engine/src/spec/gate.ts) | **게이트 값(RULES) — 제한을 바꾸는 곳** — 자막 길이·씬 길이·애니메이션 잘림·레이아웃 겹침의 판정 로직과 현재 값. **값의 근거는 labs/레포세팅_엔진부트스트랩_20260914.md** | 게이트 값, 제한 바꾸기, 18자, 자막 글자 수, 몇 글자, 최대 길이, 씬 길이 제한, 판정 로직, lint 실패, 오류 메시지 |
| [engine/src/spec/layout.ts](engine/src/spec/layout.ts) | **레이아웃 좌표** — split·full-graphic·full-face 좌표와 자막 Y. **자막이 겹친다/위치를 바꾸고 싶다 → 여기부터** | 레이아웃, 좌표, 자막 위치, 토킹헤드 위치, 안전 영역, split 가 뭐야, 자막이 겹침 |
| [engine/src/spec/schema.ts](engine/src/spec/schema.ts) | **spec 스키마 (zod)** — 씬별 props 와 필드 정의. **씬 타입 목록의 원천은 registry.ts, 팔레트 색은 theme.ts** | 스키마, zod, props 뭐 넣나, 필드, 필수 값, spec 형식, 유효성 |
| [engine/src/spec/timelines.ts](engine/src/spec/timelines.ts) | **씬 내부 타이밍** — 씬별 프레임 계산의 원천(컴포넌트·게이트 공용). 잘림 여부를 **판정**하는 기준값은 gate.ts | 타이밍, 프레임 수, 애니메이션 길이, 잘림, sceneEnd, 타이핑 속도, 등장 간격 |
| [engine/src/scenes/BeforeAfter.tsx](engine/src/scenes/BeforeAfter.tsx) | **씬 구현 — before-after** — OLD WAY vs WITH IT 막대 비교 + 숫자 카운트업. (영상에 넣는 법은 runbooks/정보전달영상_제작절차.md) | 비교, 전후, before after, 시간 절감, 막대 그래프, 카운트업, 씬 구현 수정 |
| [engine/src/scenes/IconFlow.tsx](engine/src/scenes/IconFlow.tsx) | **씬 구현 — icon-flow** — 아이콘들이 선으로 이어지고 마지막에 하나로 합쳐진다. (영상에 넣는 법은 runbooks/정보전달영상_제작절차.md) | 아이콘, 연결, 흐름, 합쳐짐, 도구 연결, 탭 호핑, 씬 구현 수정 |
| [engine/src/scenes/TerminalList.tsx](engine/src/scenes/TerminalList.tsx) | **씬 구현 — terminal-list** — 명령 타이핑 → 결과 행 등장 → 진행바 → 1위 하이라이트. (영상에 넣는 법은 runbooks/정보전달영상_제작절차.md) | 터미널, 목록, 랭킹, 설치 화면, 리스트 씬, 하이라이트, 진행바, 씬 구현 수정 |
| [engine/src/scenes/TitleCard.tsx](engine/src/scenes/TitleCard.tsx) | **씬 구현 — title-card** — 카드 스택에서 이름이 타이핑되는 챕터 표지. (영상에 넣는 법은 runbooks/정보전달영상_제작절차.md) | 타이틀, 챕터, N 번째는, 표지, 이름 카드, 씬 구현 수정 |
| [engine/src/scenes/registry.ts](engine/src/scenes/registry.ts) | **씬 레지스트리 — 씬 타입 목록의 원천** — 씬 타입 → 컴포넌트 매핑. **어떤 씬이 있는지 확인할 때 여기** (face-only 는 이 파일 안에 정의) | 씬 목록, 어떤 씬 있나, 씬 종류, registry, 타입 매핑, 사용 가능한 장면 |
| [engine/src/components/Captions.tsx](engine/src/components/Captions.tsx) | **자막 레이어** — 자막 글꼴·강조 색·외곽선 스타일. (위치·겹침 좌표는 spec/layout.ts) | 자막 스타일, 캡션, 강조 색, 노란색, 글자 크기, 외곽선, 폰트 굵기 |
| [engine/src/components/TalkingHead.tsx](engine/src/components/TalkingHead.tsx) | **토킹헤드 레이어** — 사람 영상 배치·크롭·자리표시 실루엣 | 사람 영상, 토킹헤드, 얼굴, 영상 합성, 크롭, 자리표시, 인물 위치 |
| [engine/src/components/ui.tsx](engine/src/components/ui.tsx) | **공용 프리미티브** — 배경 글로우·카드·칩·글리프 타일·모노 명령줄 | 카드, 칩, 배경, 글로우, 타일, 공통 컴포넌트, 터미널 창 |
| [engine/scripts/lint-spec.ts](engine/scripts/lint-spec.ts) | **게이트 실행 CLI (값은 gate.ts)** — specs/*.json 검사 + 레이아웃 불변식 + spec 등록 여부. 오류 시 exit 1 | lint:spec, 게이트 실행, 검사 명령, 커밋이 막힘, 오류 확인 |

## tools — 색인·패키징

| 경로 | 요약 (무엇 / 언제 여나) | 키워드 |
|---|---|---|
| [tools/hooks/pre-commit](tools/hooks/pre-commit) | **pre-commit 훅** — 커밋마다 INDEX.md 갱신 + 스테이징된 spec 게이트 실행. git config core.hooksPath tools/hooks 로 설치 | 훅, hook, pre-commit, 자동 색인, 커밋할 때, hooksPath, 설치 |
| [tools/index_seed.tsv](tools/index_seed.tsv) | **색인 시드** — 파일별 분류·제목·요약·키워드 5열 TSV. **검색이 안 되면 여기를 고치고 반드시 python tools/mkindex.py 를 실행**한다 | 시드, 키워드 추가, 색인 보강, tsv, 요약이 이상해, 검색이 안 됨, 문서를 못 찾음 |
| [tools/mkindex.py](tools/mkindex.py) | **INDEX 자동 생성기** — index_seed.tsv + 본문 자동 추출로 INDEX.md 생성. --check 는 최신 여부만 판정 | 색인 갱신, INDEX 만들기, mkindex, 인덱스 스크립트, seed 반영, 색인 생성 |
