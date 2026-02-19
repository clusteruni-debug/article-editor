-- 휴지통 기능을 위한 soft delete 컬럼 추가
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE articles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 삭제된 글 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_articles_deleted_at ON articles(deleted_at);

-- 7일 지난 글 자동 삭제 함수 (선택사항 - cron job으로 실행)
CREATE OR REPLACE FUNCTION cleanup_deleted_articles()
RETURNS void AS $$
BEGIN
  DELETE FROM articles
  WHERE deleted_at IS NOT NULL
  AND deleted_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;
