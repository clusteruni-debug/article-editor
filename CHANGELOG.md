# X Article Editor - 변경 이력 및 로드맵

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
