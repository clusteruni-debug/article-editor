# X Article Editor — CC/CX 파일 담당

| 영역 | 파일/디렉토리 | 담당 | 근거 |
|------|-------------|:----:|------|
| API 라우트 | src/app/api/** | CC | 서버 로직, 보안 |
| DB 레이어 | src/lib/supabase/* | CC | 스키마 연동, RLS |
| 타입 정의 | src/types/* | CC | 공유 인터페이스 |
| 에디터 코어 | src/lib/tiptap/* | CC | TipTap 확장, 복잡 |
| UI 컴포넌트 | src/components/** | CX | 패턴 반복 |
| 커스텀 훅 | src/hooks/* | CX | 단일 파일 |
| 유틸리티 | src/lib/utils/* | CX | 독립 모듈 |
| 페이지 | src/app/**/page.tsx | CX | UI 중심 |
| 환경 설정 | .env* | 수동 | — |
