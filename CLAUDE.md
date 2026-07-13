# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

정적 원페이지 홈페이지: 한국건설기술인협회(KOCEA) 예비청년 건설기술인 장학사업 소개 페이지.
빌드 도구/프레임워크/백엔드 없음 — 순수 HTML/CSS/JS만으로 구성되고 GitHub Pages로 배포한다.
사용자로부터 어떠한 정보도 수집하지 않는다 (폼/DB/API 없음).

Repo: `https://github.com/dikasteria-72/Scholarship.git` (branch: `main`)

## Commands

빌드/린트/테스트 파이프라인이 없다 (정적 파일이라 컴파일 불필요). 로컬 미리보기만 하면 된다:

```bash
# 아무 정적 서버로 루트에서 실행 후 http://localhost:8765 접속
node -e "require('http').createServer((req,res)=>{const fs=require('fs'),path=require('path');const types={'.html':'text/html','.css':'text/css','.js':'application/javascript','.mp4':'video/mp4'};let p=req.url.split('?')[0];if(p==='/')p='/index.html';fs.readFile(path.join(process.cwd(),p),(e,d)=>{if(e){res.writeHead(404);res.end();return}res.writeHead(200,{'Content-Type':types[path.extname(p)]||'text/plain'});res.end(d)})}).listen(8765)"
```

이 환경(Windows)에는 `python`/`chromium-cli`가 없다. 브라우저 렌더링을 직접 확인해야 할 때는
`puppeteer-core` + 로컬 설치된 `C:/Program Files/Google/Chrome/Application/chrome.exe`를
`executablePath`로 지정해 스크린샷을 찍는 방식을 사용했다 (scratchpad에 임시 스크립트 작성).

## Architecture

원페이지 스크롤 구조. 섹션 순서가 곧 정보 설계이므로 순서를 바꾸지 말 것:

`index.html`
1. `#hero` — 배경 영상(자체 호스팅 `assets/videos/hero.mp4`) + 캐치프레이즈(`.hero-content`) +
   협회명(`.hero-brand#heroBrand`).
   - **데스크톱**: 영상을 `object-fit: cover`로 풀블리드, 그 위에 텍스트를 얹는다. 텍스트는
     항상 보이는 게 아니라 **영상 타이밍에 맞춰 2단계로** 페이드 노출된다(`js/main.js`가
     `timeupdate`로 `.show` 토글, 영상이 loop이라 매 사이클 반복): **0~11.5초**엔 캐치프레이즈
     (`.hero-content.show`), **12.5~14.5초**엔 협회명(`.hero-brand.show`). 얼굴과 겹치지
     않게 `.hero-content { margin-top: 28vh }`로 하단 배치, `.hero-desc`는 한 줄 고정
     (`white-space: nowrap` + `.hero-content` `max-width: 960px`).
   - **모바일(≤720px)**: 가로(16:9) 영상을 세로 화면에서 좌우로 크롭하지 않도록 히어로를
     [상단 영상 배너 → 하단 네이비 배경 텍스트]로 재구성한다 — `.hero`를 block+네이비 배경으로
     바꾸고 `.hero-bg`에 `aspect-ratio: 16/9`를 줘 전체 장면을 보여준 뒤, `.hero-content`를
     배너 아래에 항상 표시(영상 타이밍 노출은 데스크톱 전용). 영상 위에 텍스트가 얹히지 않으므로
     `.hero-video` 어둡게 깔던 필터는 해제한다.
2. `#intro` — 협회장 인사말(편지 형식 본문 `.intro-text` + 협회장 이미지 `.intro-img`, 2열 그리드)
3. `#video` — 금년도 행사 하이라이트 영상 3편 (썸네일 카드 그리드 → 클릭 시 라이트박스에서 유튜브 재생)
4. `#gallery` — 사진 그리드 + 라이트박스
5. `#press` — 언론 보도 3열 표(연번/보도매체명/보도제목). 보도제목은 기사 URL 링크(새 탭).
   데스크톱은 `.press-table` 표, **모바일(≤720px)은 각 행을 카드로 전환**(thead 숨김, 연번은
   우상단 accent 뱃지, 제목은 세로 패딩으로 탭 영역 확보). 현재 17행은 플레이스홀더.
6. `#history` — 통계 카운터 + 타임라인
7. `#support` — 대상/절차/유의사항 3단계. sticky-scroll 방식으로 스크롤에 따라
   좌측 텍스트와 우측 이미지가 함께 전환된다 (`#supportScroll` 250vh 래퍼 안에
   `position: sticky` 패널, `js/main.js`가 스크롤 진행률을 계산해 단계 전환).
   두산에너빌리티 메인 페이지의 "에너지 솔루션 신사업" 슬라이드 섹션에서 레이아웃(좌 텍스트/
   우 이미지, 점 페이지네이션)을 참고했으나, 라이브러리·휠 하이재킹 없이 순수 sticky+스크롤
   진행률 계산으로 재구현함.

   **핵심 구조(중요)**: 각 단계 `.support-step`가 자기 이미지를 직접 포함한다 —
   `.support-step-media`(배경이미지 div `support-01~03.jpg`) + `.support-step-text`(제목+본문).
   과거엔 이미지가 별도 `.support-visual` 컨테이너에서 공유됐으나, 데스크톱/모바일을 한 구조로
   통일하기 위해 이미지를 각 단계 안으로 넣고 `.support-visual`은 제거함. 제목
   "2026년도 선발전형"(`.support-header`)도 sticky 패널 안에 있어 단계가 바뀌는 동안 고정 표시된다.
   - **데스크톱**: `.support-sticky-inner`는 flex 컬럼(제목→점→`.support-step-stack`), 각 단계는
     `position:absolute; inset:0`로 같은 자리에 겹쳐 opacity 크로스페이드. 단계 내부는 2열 그리드로
     `grid-column`을 지정해 좌=`.support-step-text`, 우=`.support-step-media`(높이 `max-height:460px`).
     sticky 높이는 `calc(100vh - nav)`에 `max-height:680px` 상한(짧은 단계에서 footer와의 여백 축소).
   - **모바일(≤900px)**: sticky를 해제(`position:static`, 높이 auto)하고 세 단계를 일반 흐름으로
     세로로 모두 펼친다 — 단계별 [이미지 → 전체 텍스트]가 순서대로 쌓이고 점(dots)은 숨김.
     고정 화면 높이 안에 긴 텍스트를 넣으면 잘리기 때문에 채택한 방식. `js/main.js`의 단계 전환은
     그대로 돌지만 모바일 CSS가 모든 `.support-step`을 항상 보이게 강제하므로 무해하다.
8. `footer#contact` — 협회 연락처

`css/style.css`는 `:root` CSS 변수(색상 토큰)를 최상단에 정의하고 섹션 순서대로 스타일을 배치한다.
새 섹션 추가 시 기존 변수(`--navy`, `--accent`, `--radius`, `--container` 등)를 재사용할 것.

`js/main.js`는 IIFE 하나에 기능별로 나뉘어 있다: sticky nav, 히어로 텍스트 타이밍 노출
(영상 0~11.5초엔 `.hero-content.show`, 12.5~14.5초엔 `.hero-brand.show` 토글 —
`SHOW_START/SHOW_END`, `BRAND_START/BRAND_END` 상수), 모바일 메뉴 토글, `IntersectionObserver`
기반 scroll reveal(`.reveal` → `.in-view`), 지원내용 sticky-scroll 단계 전환(`#supportScroll`),
통계 카운터 애니메이션, 갤러리·영상 공용 라이트박스.
프레임워크/모듈 번들러 없이 바닐라 JS로 전부 처리한다 — 새 인터랙션도 이 패턴을 따를 것.

## Design system

- 컬러: 협회 CI(로고) 기준 네이비(`--navy #1b3a6b`) + 포인트 오렌지(`--accent #f5a623`), 화이트/그레이 배경
- 폰트: Pretendard (CDN, jsdelivr)
- 참고 레퍼런스 3사이트(유한재단 장학사업 페이지, Noni Cerâmica, 두산에너빌리티)에서
  "재단의 신뢰감 + 기업 완성도 + 공예 사이트 감성"을 조합하기로 결정 — 딱딱한 협회 사이트가 아니라
  청년 타겟에 맞는 감성적 브랜드 페이지를 지향한다.
- 인터랙션: sticky nav, scroll reveal, 카운터 애니메이션 등 최신 트렌드 반영. 과한 애니메이션/파비콘 변경 지양.

## 히어로 배경영상 사양

`assets/videos/hero.mp4`에 파일을 넣으면 자동 재생된다 (`<video autoplay muted loop playsinline>`,
`object-fit: cover`). 파일이 없으면 네이비 그라디언트로 자연스럽게 폴백된다 (콘솔 에러 없음, 확인 완료).
현재 실제 파일(1920×1080, 약 15초)이 들어가 있다. **텍스트 노출 타이밍(캐치프레이즈 0~11.5초,
협회명 12.5~14.5초)은 이 영상 길이·장면 구성에 맞춘 값**이므로 영상을 교체하면 `js/main.js`의
`SHOW_START/SHOW_END`, `BRAND_START/BRAND_END`도 함께 조정할 것.

- 길이: 10~20초 무음 루프
- 해상도: 1080p 이하
- 용량: 10MB 미만 권장 (초기 로딩 속도 때문 — 현재 파일은 약 12.6MB로 약간 초과, 여유 되면 재압축)
- 원본 행사 영상(유튜브 업로드본)에서 인상적인 구간만 잘라 무음 처리해서 사용
- 폴백용 정지 이미지는 `assets/images/hero-poster.jpg`에 추가 가능 (아직 없음)

## 콘텐츠 항목 (교체/편집 방법)

주요 콘텐츠는 대부분 실제 자료로 교체 완료된 상태다. 아래는 각 항목의 현재 상태와
향후 교체·편집 방법을 정리한 참고표다.

| 위치 | 현재 상태 | 교체 파일/방법 |
|---|---|---|
| 로고 | 완료 — `assets/images/ci.png` 적용 (`.nav-logo`/`.footer-logo`, 어두운 배경에서는 CSS invert 필터로 흰색 표시) | - |
| 히어로 배경 | 완료 — `assets/videos/hero.mp4` 적용(약 12.6MB, 여유 되면 재압축) | 교체 시 위 사양 및 텍스트 타이밍(0~11.5초/12.5~14.5초) 참고 |
| 협회장 이미지 | 완료 — `assets/images/chairman.jpg` 적용 (`.intro-img`, 원본 3:4 비율에 프레임을 맞춤) | - |
| 인사말/지원내용 문구 | 완료 — 실제 문구 반영됨 | 수정 시 index.html 직접 편집 |
| 지원내용 단계 이미지 3장 | 회색 배경 placeholder | `assets/images/support-01.jpg` ~ `support-03.jpg` 추가 (자동 반영됨). 각 `.support-step`의 `.support-step-media` 배경으로 들어가며 `cover`로 크롭됨(데스크톱 우측 세로 이미지 `max-height:460px`, 모바일 16:10). 단계당 이미지 1장씩 대응 |
| 행사 하이라이트 영상 3편 | 완료 — 실제 유튜브 ID 3개 연결됨 | 교체 시 `.video-card`의 `data-video-id`와 썸네일 `background-image` url의 영상 ID를 함께 바꿈 (썸네일은 `img.youtube.com`에서 자동 생성되므로 별도 캡처 이미지 불필요) |
| 갤러리 사진 6장 | 완료 — `assets/images/img_1.jpg`~`img_6.jpg` + `og.jpg` 사용 (첫 장은 2×2로 크게 배치) | 교체 시 각 `.gallery-item`의 `background-image` url·`data-caption` 수정 |
| 보도자료 17건 | 플레이스홀더 — `#press`의 `.press-table` 17행(`[보도매체명]`/`[보도제목 플레이스홀더]`, `href="#"`) | 각 행의 매체명·제목 텍스트와 `.press-title a`의 `href`를 실제 기사 URL로 교체(개수 변동 시 `<tr>` 추가/삭제) |
| 연혁 통계 숫자 | 완료 — 실제값(200명/4개교/2.2억) | 수정 시 `.stat-num`의 `data-target`/`data-suffix` 값 교체 |
| 문의처 | 완료 — 실제 주소/전화 반영됨 | 수정 시 footer 직접 편집 |

## 배포

GitHub Pages로 배포 예정 (아직 미설정). 콘텐츠 교체 완료 후 `main` 브랜치를 push하고
저장소 Settings → Pages에서 소스를 `main` 브랜치 루트로 지정하면 된다.
