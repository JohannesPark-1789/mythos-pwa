# Mythos PWA — Phase 2 작업 지시문

> 데스크탑 Claude Code 세션 시작 시 이 문서를 첫 메시지로 붙여넣으면 됨.
> 함께 제공: `characters_tier1.json` (Tier 1 30명 데이터)

---

## 프로젝트 개요

- **이름:** Mythos — 그리스로마 신화 학습 PWA
- **목적:** 신화 등장인물 200+명을 4개 언어(한글/영어/그리스어/라틴어)로 익히는 도구
- **사용자:** 박해준 (개인 학습용, 모바일 우선)
- **저장소:** `mythos-pwa` (GitHub 단일 저장소)

## 작업 환경 (중요)

- **노트북 → 데스크탑으로 환경 이전.** 노트북에서 Phase 1(데이터 큐레이션) 완료, Phase 2 npm install 단계에서 hang 발생.
- **OneDrive 폴더 사용 금지.** `node_modules` 동기화 충돌이 원인일 가능성 → 작업 폴더는 `C:\dev\` 또는 `C:\Users\<user>\projects\` 같은 OneDrive 밖 로컬 디스크에 둘 것.
- **BW Platform 작업 환경 검증 완료.** 데스크탑에 Node/npm/Claude Code 정상 동작 확인됨.

## 기술 스택 (확정)

| 항목 | 선택 |
|---|---|
| 프레임워크 | Next.js 14 (App Router) |
| 빌드 모드 | `output: 'export'` (완전 정적) |
| 서브패스 | `basePath: '/mythos-pwa'` |
| 언어 | TypeScript (strict) |
| 스타일 | Tailwind CSS v3 |
| PWA | **`@ducanh2912/next-pwa`** (Next 14 호환 메인테인 포크) |
| 로컬 DB | Dexie.js (IndexedDB 래퍼) |
| 계보 그래프 | React Flow (Phase 5에서 도입) |
| 폰트 (한/영) | Pretendard Variable |
| 폰트 (그리스어) | Noto Serif |
| 폰트 (라틴어) | EB Garamond |
| 폰트 호스팅 | **모두 `public/fonts/`에 self-host** (PWA 오프라인 작동용, Google Fonts CDN 금지) |
| 배포 | GitHub Pages via GitHub Actions |

## 핵심 제약사항

1. **완전 정적 export.** 서버 컴포넌트의 동적 기능(SSR, API routes, ISR, 동적 라우트) 사용 금지.
2. **모든 상태는 클라이언트.** 학습 이력은 IndexedDB(Dexie), 설정은 localStorage.
3. **basePath 설정 필수.** GitHub Pages 서브패스(`/mythos-pwa`) 대응. `next/image` `loader` 또는 `unoptimized: true` 필요.
4. **PWA 오프라인 작동.** Service Worker, `manifest.json`, 폰트 self-host, 첫 방문 후 네트워크 없이 작동.

---

## Phase 2 목표 (이 세션에서 완성)

### A. 프로젝트 골격
- [ ] Next.js 14 + TypeScript + Tailwind 셋업 (`npx create-next-app@14 . --typescript --tailwind --app --no-src-dir`)
- [ ] `next.config.js`에 `output: 'export'`, `basePath: '/mythos-pwa'`, `images.unoptimized: true` 설정
- [ ] `@ducanh2912/next-pwa` 설치 + 설정 (Service Worker, `manifest.json`, 아이콘 placeholder 192/512)
- [ ] 폰트 self-host:
  - `public/fonts/` 아래에 Pretendard Variable (woff2), Noto Serif (Greek subset, woff2), EB Garamond (woff2)
  - `app/layout.tsx`에서 `next/font/local`로 로드
- [ ] 단일 라이트 테마 (아래 디자인 시스템 섹션 참조)

### B. 데이터 레이어
- [ ] `data/characters.json` 배치 — 제공된 `characters_tier1.json`의 `characters` 배열을 그대로 사용
- [ ] TypeScript 타입 정의 (`types/character.ts`) — 아래 데이터 모델 섹션 참조
- [ ] Dexie 스키마 정의 (`lib/db.ts`):
  - `cards` 테이블: `{ id, characterId, ef, interval, reps, due, lastReview }`
  - `attempts` 테이블: `{ id, characterId, mode, correct, timestamp }`
  - `progression` 테이블: `{ tier, masteredCount, unlockedAt }`
  - `settings` 테이블 (또는 localStorage 병행): `{ frontLanguage, displayLanguages, fontSize, forceUnlock }`
- [ ] 데이터 로더 (`lib/data.ts`): JSON → 메모리 → 필터/검색 함수

### C. 라이브러리 페이지 (`/library`)
- [ ] 인물 카드 그리드 (반응형: 모바일 1열, 태블릿 2열, 데스크탑 3열)
- [ ] 카테고리 필터 (올림포스/티탄/영웅/지하세계/원시신/기타신)
- [ ] 티어 필터 (T1/T2/T3 — 잠금 상태 표시)
- [ ] 검색바 (ko/en/grc/grc_translit/la 모두 매칭, 대소문자/악센트 무시)
- [ ] 카드 클릭 → 상세 모달 (4언어 + 역할/도메인/심볼 + 가족 + 스토리 훅)

### D. 설정 페이지 (`/settings`)
- [ ] 플래시카드 앞면 언어 선택 (ko/en/grc/la)
- [ ] 표시 언어 토글 (학습 중 뒷면에 어떤 언어를 보일지, 다중 선택 가능)
- [ ] 본문 글자 크기 (작게/보통/크게, 각각 -2/0/+2px)
- [ ] 티어 강제 해제 토글 (디폴트 OFF)
- [ ] 학습 데이터 초기화 버튼 (확인 다이얼로그)

### E. 홈 페이지 (`/`)
- [ ] 현재 진도 요약 (티어별 mastered/total, 다음 티어 해제 조건 진행률)
- [ ] 오늘 복습할 카드 수 (SRS `due ≤ today` 기준)
- [ ] 학습 모드 진입 버튼 4개 (플래시카드, 퀴즈, 계보도, 라이브러리)
  - 플래시카드/퀴즈/계보도는 Phase 3~5에서 채울 예정이지만 라우트는 미리 생성

---

## 데이터 모델

```ts
// types/character.ts
export type Category =
  | "올림포스" | "티탄" | "영웅" | "트로이"
  | "괴물" | "님프" | "지하세계" | "원시신" | "기타신";

export type Character = {
  id: string;
  tier: 1 | 2 | 3;
  category: Category;
  names: {
    ko: string;
    en: string;
    grc: string;          // 그리스어 원어 (악센트 포함)
    grc_translit: string; // 학술적 음역 (Cháos, Hēraklês 등)
    la: string;           // 라틴어 (로마식 이름)
    la_note?: string;     // 보충 설명 ("음차 동일", "Pluto 일반적" 등)
  };
  role: string;
  domains: string[];
  symbols: string[];
  family: {
    parents: string[];   // character.id 또는 외부 인물명
    consorts: string[];
    children: string[];
    siblings: string[];
  };
  story_hooks: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
};
```

---

## 학습 시스템 (Phase 3~5 사양 — Phase 2에서는 라우트만 생성)

### 플래시카드 + SM-2 SRS (Phase 3)
- **알고리즘:** SuperMemo 2 (SM-2)
  - 응답 quality: 0~5 (앱에서는 다시/어려움/괜찮음/쉬움 4단계 → 1/3/4/5 매핑)
  - `EF`(easiness factor) 초기값 2.5, 최소 1.3
  - 정답 시 `interval` 갱신: 1일 → 6일 → `prev * EF`
  - 오답 시 `interval = 1`, `reps = 0` 리셋

### 4지선다 퀴즈 (Phase 4) — 5가지 문제 유형
1. **언어 매칭** (한글 → 영어/그리스어/라틴어 중 하나)
2. **역언어 매칭** (그리스어/라틴어 → 한글, 1번의 역방향)
3. **역할 → 인물** (역할 설명으로 인물 맞추기)
4. **심볼 → 인물** (심볼 1~2개로 인물 맞추기)
5. **가족관계** (X의 부모/배우자/자식은? 형식)

### 계보/관계도 (Phase 5)
- React Flow 사용
- 노드: 인물 카드 (카테고리 좌측 보더로 색상 구분)
- 엣지: parent→child(실선), consort(점선)
- 클릭 → 모달, 호버 → 가족 라인 강조

### 티어 잠금 해제 조건
- **Tier 1 → Tier 2:** Tier 1 카드 중 **85%가 SRS `interval ≥ 7일`** AND **최근 50문제 정답률 ≥ 80%**
- **Tier 2 → Tier 3:** Tier 2 카드에 대해 동일 조건
- **강제 해제 토글** (설정 페이지, 디폴트 OFF) — 위 조건 무시하고 즉시 다음 티어 접근 가능
- 데이터 분포:
  - **Tier 1 (30명):** 올림포스 14 + 티탄 6 + 영웅 5 + 원시신 3 + 지하세계 1 + 기타신 1
  - **Tier 2 (60명):** Phase 7 추가 (트로이 인물, 추가 영웅, 주요 님프, 괴물 일부)
  - **Tier 3 (110명+):** Phase 8 추가 (마이너 신, 영웅의 동반자, 지방 신화 등)

---

## 디자인 시스템 — 눈 피로 최소화 단일 라이트 테마

**핵심 원칙:** 다크모드 없음. 순백(#FFFFFF) 배경 금지, 순흑(#000000) 텍스트 금지. 종이책/Kindle Paperwhite 톤.

```css
/* === 배경 (미색 크림 톤) === */
--bg-primary:   #FAF7F2;  /* 본문 배경 */
--bg-secondary: #F4EFE6;  /* 카드 배경 (살짝 어둡게) */
--bg-elevated:  #FFFFFF;  /* 모달만 순백 (대비 강조 필요시) */

/* === 텍스트 (짙은 회색, 순흑 금지) === */
--text-primary:   #2A2A2A;  /* 본문 */
--text-secondary: #5C5751;  /* 보조 */
--text-muted:     #8B857E;  /* 메타 정보 */

/* === 카테고리 액센트 (채도 낮춤, 박물관 라벨 톤) === */
--accent-olympian:   #B8860B;  /* 어두운 골드 (올림포스) */
--accent-titan:      #6B4F8C;  /* 어두운 보라 (티탄) */
--accent-hero:       #9C2A2A;  /* 어두운 적갈색 (영웅) */
--accent-underworld: #4A5258;  /* 슬레이트 (지하세계) */
--accent-primordial: #5C6B5C;  /* 어두운 올리브 (원시신) */
--accent-other:      #8B6F47;  /* 갈색 (기타신) */

/* === 보더/구분선 (그림자 대신) === */
--border-soft:   rgba(0,0,0,0.06);
--border-medium: rgba(0,0,0,0.12);
```

**타이포그래피:**
- 본문: **17px (모바일) / 16px (데스크탑)**, line-height **1.7**
- 한글: Pretendard Variable, letter-spacing -0.01em
- 그리스어: Noto Serif, letter-spacing 0.02em (악센트 식별성)
- 라틴어: EB Garamond, 이탤릭 강조 가능
- 본문 크기는 설정에서 ±2px 조정

**카드/UI 표현 규칙:**
- **그림자 사용 금지.** 1px 보더(`--border-soft`) + 살짝 다른 배경색으로 깊이감 표현
- **카테고리 액센트는 카드 좌측 3px 보더로만 표시.** 카드 배경을 액센트로 채우는 것 금지 (시각 노이즈 최소화)
- 카드 코너 반경 **8px** (너무 둥글지 않게, 학술적 인상 유지)
- 호버: 배경색 1톤 변화만 (스케일/그림자 변화 금지)

---

## 파일 구조 (목표)

```
mythos-pwa/
├── app/
│   ├── layout.tsx              # 폰트, 메타, PWA manifest 링크
│   ├── globals.css             # CSS 변수, Tailwind base
│   ├── page.tsx                # 홈 (진도 요약)
│   ├── library/page.tsx
│   ├── settings/page.tsx
│   ├── flashcards/page.tsx     # Phase 3 (라우트만)
│   ├── quiz/page.tsx           # Phase 4 (라우트만)
│   └── tree/page.tsx           # Phase 5 (라우트만)
├── components/
│   ├── CharacterCard.tsx
│   ├── CharacterModal.tsx
│   ├── FilterBar.tsx
│   ├── SearchBar.tsx
│   ├── ProgressBadge.tsx
│   └── FontSizeControl.tsx
├── data/
│   └── characters.json         # 제공된 Tier 1 30명
├── lib/
│   ├── db.ts                   # Dexie 스키마
│   ├── data.ts                 # 데이터 로더/필터/검색
│   ├── srs.ts                  # SM-2 (Phase 3)
│   ├── progression.ts          # 티어 해제 로직
│   └── i18n.ts                 # 언어 라벨/카테고리 표시
├── types/
│   └── character.ts
├── public/
│   ├── manifest.json
│   ├── icons/                  # 192/512 placeholder
│   └── fonts/                  # Pretendard, Noto Serif, EB Garamond (woff2)
├── .github/workflows/
│   └── deploy.yml              # GitHub Pages 자동 배포
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## GitHub Actions 배포 워크플로

`.github/workflows/deploy.yml`:
- `main` 브랜치 push 시 자동 실행
- Node 20, `npm ci`, `npm run build`
- `out/` 디렉토리를 `gh-pages` 브랜치로 푸시 (또는 `actions/deploy-pages` 사용)
- GitHub Pages 설정: source = `gh-pages` 브랜치 (또는 Pages Actions)
- `.nojekyll` 파일 포함 (언더스코어 파일 무시 방지)

---

## 작업 진행 방식

1. **A → B → C → D → E** 순서로 진행
2. 각 섹션 완료 후 짧게 보고 (파일 트리 또는 스크린샷)
3. 막히면 즉시 멈추고 질문 (npm install hang 같은 환경 이슈는 특히)
4. Phase 2 완료 기준:
   - `npm run dev` → 로컬에서 홈/라이브러리/설정 페이지 정상 렌더
   - `npm run build` → 정적 export 성공, `out/` 디렉토리 생성
   - PWA: 빌드 후 `out/manifest.json`, Service Worker 파일 존재 확인

---

## Phase 3 이후 예고

- **Phase 3:** 플래시카드 + SM-2 SRS 엔진
- **Phase 4:** 4지선다 퀴즈 (5가지 문제 유형)
- **Phase 5:** React Flow 계보도
- **Phase 6:** GitHub Pages 첫 배포 + 폰에 PWA 설치 테스트
- **Phase 7:** Tier 2 데이터 추가 (60명)
- **Phase 8:** Tier 3 데이터 추가 (110명+)

---

**다음 액션:** 데스크탑에서 OneDrive 밖 경로에 이 폴더 둔 뒤, Claude Code 세션에서 위 체크리스트 A부터 순서대로 진행. Tier 1 JSON은 `characters_tier1.json`으로 별도 제공됨 (`data/characters.json`으로 복사 또는 이동).
