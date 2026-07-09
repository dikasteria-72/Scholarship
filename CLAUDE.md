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
1. `#hero` — 배경 영상(자체 호스팅 mp4) + 캐치프레이즈
2. `#intro` — 사업 소개, 협회장 대표 이미지
3. `#support` — 지원 대상/금액/인원/절차 카드 4개
4. `#video` — 금년도 행사 하이라이트 영상 3편 (썸네일 카드 그리드 → 클릭 시 라이트박스에서 유튜브 재생)
5. `#gallery` — 사진 그리드 + 라이트박스
6. `#history` — 통계 카운터 + 타임라인
7. `footer#contact` — 협회 연락처

`css/style.css`는 `:root` CSS 변수(색상 토큰)를 최상단에 정의하고 섹션 순서대로 스타일을 배치한다.
새 섹션 추가 시 기존 변수(`--navy`, `--accent`, `--radius`, `--container` 등)를 재사용할 것.

`js/main.js`는 IIFE 하나에 기능별로 나뉘어 있다: sticky nav, 모바일 메뉴 토글, `IntersectionObserver`
기반 scroll reveal(`.reveal` → `.in-view`), 통계 카운터 애니메이션, 갤러리 라이트박스.
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

- 길이: 10~20초 무음 루프
- 해상도: 1080p 이하
- 용량: 10MB 미만 (초기 로딩 속도 때문)
- 원본 행사 영상(유튜브 업로드본)에서 인상적인 구간만 잘라 무음 처리해서 사용
- 폴백용 정지 이미지는 `assets/images/hero-poster.jpg`에 추가 가능 (아직 없음)

## 실제 콘텐츠로 교체해야 할 플레이스홀더

런칭 전 아래 항목을 실제 자료로 교체해야 한다. HTML 내 `[플레이스홀더]` 문자열로 표시되어 있다.

| 위치 | 현재 상태 | 교체 파일/방법 |
|---|---|---|
| 로고 | 완료 — `assets/images/ci.png` 적용 (`.nav-logo`/`.footer-logo`, 어두운 배경에서는 CSS invert 필터로 흰색 표시) | - |
| 히어로 배경 | 그라디언트 폴백 | `assets/videos/hero.mp4` (위 사양 참고) |
| 사업소개 대표 이미지 | 완료 — `assets/images/chairman.jpg` 적용 (`.intro-img`, 원본 3:4 비율에 프레임을 맞춤) | - |
| 사업소개/지원내용 문구 | `[플레이스홀더]` 텍스트 | index.html 직접 수정 |
| 행사 하이라이트 영상 3편 | `VIDEO_ID_1`~`VIDEO_ID_3` | 유튜브 업로드 후 `.video-card`의 `data-video-id`와 썸네일 `background-image` url의 영상 ID 교체 (썸네일은 `img.youtube.com`에서 자동 생성되므로 별도 캡처 이미지 불필요) |
| 갤러리 사진 6장 | 회색 placeholder | `assets/images/gallery-01.jpg` ~ `gallery-06.jpg` 추가 (자동 반영됨) |
| 연혁 통계 숫자 | 예시값 (128/320/5) | `.stat-num`의 `data-target` 값 교체 |
| 문의처 | 예시 주소/전화 | footer 직접 수정 |

## 배포

GitHub Pages로 배포 예정 (아직 미설정). 콘텐츠 교체 완료 후 `main` 브랜치를 push하고
저장소 Settings → Pages에서 소스를 `main` 브랜치 루트로 지정하면 된다.
