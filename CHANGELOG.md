# X Article Editor - 변경 이력 및 로드맵

## [2026-02-05] - 아티클 목록 페이지네이션 + 필터/정렬 강화
### 작업 내용
- **서버사이드 페이지네이션** (10개 단위)
  - Supabase `.range()` + `count: 'exact'`로 서버에서 페이징
  - 총 아티클 개수 표시 + 페이지 번호 네비게이션
- **서버사이드 필터링/검색**
  - 검색어: Supabase `ilike`로 서버에서 검색 (300ms 디바운스)
  - 태그 필터: `contains` 연산자로 서버사이드 처리
  - 상태 필터: 전체/임시저장/발행됨
- **정렬 옵션**: 최신순, 오래된순, 최근 수정순, 제목순
- **뷰 모드 전환**: 카드뷰 (기존) / 리스트뷰 (컴팩트 한 줄)
- **URL 쿼리 파라미터 연동**
  - 검색어, 태그, 상태, 정렬, 페이지, 뷰 모드 전부 URL에 반영
  - 새로고침해도 필터 상태 유지, 북마크 가능
- **필터 초기화 버튼** (검색 결과 영역)
- **삭제 후 페이지 보정** (마지막 아이템 삭제 시 이전 페이지로)

### 새 파일
- `src/components/ui/Pagination.tsx` (페이지네이션 컴포넌트)
- `src/components/article/ArticleListView.tsx` (컴팩트 리스트뷰)

### 수정 파일
- `src/hooks/useArticle.ts` (getArticlesPaginated, getAllTags 함수 추가)
- `src/app/page.tsx` (전면 재작성: 페이지네이션/필터/정렬/URL/뷰모드)

### DB 변경: 없음

### 다음에 할 것
- 사용성 테스트 (페이지 전환, 필터 조합, URL 복원)
- 휴지통(trash) 페이지도 동일 패턴 적용 고려

---

## [2026-02-04] - 인사이트 폼 UX 개선: 출처/링크 분리 + 삭제 UX
### 작업 내용
- **출처와 링크 필드 분리**
  - `insights.link` TEXT 컬럼 추가 (개별 인사이트의 원문 링크)
  - 기존 source에 URL(http)이 입력된 행 → link 컬럼으로 자동 이관
  - InsightForm에 "원문 링크" URL input 추가 (출처 아래)
- **출처 선택 해제 UX 개선** (SourceSelect)
  - 소스 선택된 상태: 칩(pill) 형태 + "X 해제" 버튼으로 시각적 명확화
  - 미선택 상태: 기존 검색/입력 방식 유지
- **태그 삭제 UX 개선** (InsightForm)
  - 태그 hover 시 빨간색 배경/텍스트 강조로 삭제 의도 명확화
- **InsightCard 링크 아이콘**
  - link 값이 있으면 외부 링크 아이콘 표시 (새 탭에서 열기)

### 새 파일
- `supabase/migrations/009_add_insights_link.sql`

### 수정 파일
- `src/types/insight.ts` (link 필드 추가)
- `src/hooks/useInsight.ts` (link 매핑/저장)
- `src/components/insight/InsightForm.tsx` (링크 입력 + 태그 UX)
- `src/components/insight/InsightCard.tsx` (링크 아이콘)
- `src/components/source/SourceSelect.tsx` (선택 해제 칩 UI)

### 다음에 할 것
- Supabase에서 009 마이그레이션 실행 필요
- UX 사용성 테스트 (출처 선택/해제, 링크 입력, 태그 삭제)

---

## [2026-02-04] - 뉴스레터 소스 관리 시스템
### 작업 내용
- **소스(출처) 관리 시스템 추가**
  - `sources` 테이블 생성 (name UNIQUE, url, description, category)
  - `insights.source_id` FK 컬럼 추가 (ON DELETE SET NULL)
  - 기존 source 텍스트 → sources 테이블 자동 마이그레이션
  - 카테고리: 뉴스레터, 블로그, 팟캐스트, 유튜브, X/트위터, 기타
- **소스 CRUD** (useSource 훅)
  - 생성/수정/삭제 + UNIQUE name 중복 에러 처리
  - 소스별 인사이트 수 통계 (getSourceStats)
- **소스 관리 모달** (SourceManager)
  - 목록 + 생성/편집/삭제 UI
  - 소스별 인사이트 수, 카테고리 이모지, URL 링크 표시
- **인사이트 폼에 소스 선택** (SourceSelect)
  - 텍스트 입력 + 기존 소스 자동완성 필터링
  - "새 출처 추가" 인라인 생성 (카테고리, URL 입력)
- **인사이트 페이지에 소스 필터** 추가 (태그 필터 아래, 보라색 pill 버튼)
- `insights.source` TEXT 컬럼 유지 (하위호환)

### 새 파일
- `supabase/migrations/008_create_sources_table.sql`
- `src/types/source.ts`
- `src/hooks/useSource.ts`
- `src/components/source/SourceSelect.tsx`
- `src/components/source/SourceManager.tsx`
- `src/components/source/index.ts`

### 수정 파일
- `src/types/insight.ts` (source_id 필드 추가)
- `src/hooks/useInsight.ts` (source_id 매핑/저장)
- `src/components/insight/InsightForm.tsx` (SourceSelect 통합)
- `src/app/insights/page.tsx` (소스 관리/필터 통합)

### 다음에 할 것
- Supabase에서 008 마이그레이션 실행 필요
- 소스 관리 UI 사용성 테스트

---

## [2026-02-04] - 인사이트 태그/필터 시스템
### 작업 내용
- 인사이트 날짜별 그룹핑 + 아코디언 (최근 3일 펼침, 나머지 접힘)
- 태그 시스템 (DB tags 컬럼, 기본 추천 태그 8개, 입력 UI, 필터)
- 검색에 태그 포함, 정렬 드롭다운 (최신순/오래된순)
- 통계 바를 클릭 가능한 상태 필터로 통합 (중복 상태 필터 제거)
- .env.local 설정 (Supabase + Gemini)

### 영향 파일
- `src/app/insights/page.tsx`, `src/components/insight/InsightCard.tsx`
- `src/components/insight/InsightForm.tsx`, `src/hooks/useInsight.ts`
- `src/types/insight.ts`, `supabase/migrations/007_add_insights_tags.sql`

### 다음에 할 것
- Supabase에서 007 마이그레이션 실행 필요 (tags 컬럼)
- 인사이트에 태그 데이터 추가하여 필터 기능 활용

---

## 현재 버전 기능 (v1.0)

### 에디터 핵심
- **Tiptap 기반 리치 텍스트 에디터**
- 서식: 굵게, 기울임, 밑줄, 취소선
- 제목: H1, H2, H3, 본문(P)
- 목록: 글머리 기호, 번호 매기기
- 인용문
- 이미지 붙여넣기 & 드래그앤드롭

### 글 관리
- Supabase 연동 (DB + Storage)
- 자동 저장 (30초 간격)
- 태그 추가/삭제/필터링
- 글 검색 (제목/내용)
- 휴지통 (7일 보관 후 자동 삭제)
- 버전 히스토리 (복원 기능)

### 내보내기
- Markdown (.md)
- HTML (.html)
- JSON (.json)

### 글쓰기 도구
- 글자 수 / 읽기 시간 표시
- 글쓰기 목표 설정 (일일 글자 수)
- 맞춤법 검사 (자주 틀리는 표현 30개+)
- AI 글쓰기 도우미 (Gemini 연동)

### UI/UX
- 다크 모드 지원
- 모바일 반응형 최적화
- 키보드 단축키
  - `Ctrl+S`: 임시저장
  - `Ctrl+Shift+P`: 발행
  - `Ctrl+,`: 설정
  - `Escape`: 메뉴 닫기

### 대시보드
- 글쓰기 활동 통계 (총 글 수, 글자 수, 주간/월간)
- 플랫폼별 성과 추적
- 태그별 분석

---

## 향후 개선 고려사항

### 글쓰기 습관
- [ ] 연속 작성일 (스트릭) 표시
- [ ] 글쓰기 리마인더 알림
- [ ] 주간/월간 리포트

### 에디터 UX
- [ ] 집중 모드 (Zen Mode)
- [ ] 글 템플릿 저장/불러오기
- [ ] 단어/문장 반복 감지

### AI 기능 확장
- [ ] 글 요약 자동 생성
- [ ] 톤앤매너 분석/조정
- [ ] SEO 제목 제안
- [ ] 글 구조 피드백

### 콘텐츠 관리
- [ ] 폴더/카테고리 분류
- [ ] 글 간 링크 연결
- [ ] 시리즈 순서 드래그 정렬

### 퍼블리싱 (선택)
- [ ] X/Twitter 직접 게시
- [ ] 공개 공유 링크

---

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Editor**: Tiptap
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API

---

## 개발 환경

```bash
# 설치
npm install

# 개발 서버
npm run dev

# 빌드
npm run build
```

## 환경 변수 (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```
