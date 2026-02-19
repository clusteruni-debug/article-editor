-- 아티클 버전 히스토리 테이블
-- Supabase SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS article_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  content_text TEXT,
  version_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 동일 아티클의 버전 번호 유일성 보장
  UNIQUE(article_id, version_number)
);

-- 인덱스
CREATE INDEX idx_article_versions_article_id ON article_versions(article_id);
CREATE INDEX idx_article_versions_created_at ON article_versions(created_at DESC);

-- RLS 정책 (선택사항)
ALTER TABLE article_versions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능 (인증 없이 사용하는 경우)
CREATE POLICY "Allow all access to article_versions" ON article_versions
  FOR ALL USING (true) WITH CHECK (true);
