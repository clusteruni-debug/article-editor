# X Article Editor - 변경 이력 및 로드맵

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
