# screens — 화면 녹화와 스크린샷

> 요약: 녹화형(mp4)과 전시형(png) 소재를 넣는 곳. 파일은 깃에 올라가지 않는다. 촬영·캡처 요령이 여기 있다.

## 녹화형 — 앱 화면 녹화 (mp4)
- **세로 전체 화면**으로 찍는다. 폰 목업(555×1013 비율 ≈ 9:16.5)에 `cover` 로 맞춰진다.
- 탭 전환은 **천천히**. 영상에서 자막이 2~4초마다 바뀌므로 그보다 느리게 움직여야 따라온다.
- 찍기 전에 끈다: 알림, 배터리 경고, 개인정보가 보이는 화면.
- 소리는 쓰지 않는다(엔진이 무음으로 재생한다).
- 앞부분을 잘라내려면 다시 찍지 말고 spec 의 `props.trimBefore` 에 프레임 수를 적는다.

파일명 예: `home-scroll.mp4`, `device-list.mp4`, `routine-create.mp4`
spec: `"src": "screens/home-scroll.mp4"`

## 전시형 — UI 스크린샷 (png)
- **가로로 넓게** 찍는다. 밴드가 1080×590 이고 `objectPosition: top center` 로 **상단 정렬로 잘린다**.
  화면 아래쪽은 잘려 나가므로 중요한 것을 위에 둔다.
- 실제 데이터가 든 화면이 좋다. 빈 상태는 전시형의 설득력을 떨어뜨린다.
- 3~5장. 레퍼런스는 화면 하나가 0.4~2.2초만 머문다 — 다 읽히지 않아도 된다.

파일명 예: `overview.png`, `messages.png`, `rewards.png`
spec: `"screens": [{ "src": "screens/overview.png", "label": "Overview" }]`

## 확인
```bash
cd engine && npm run lint:spec    # 경로가 틀리면 오류로 막는다
```
