-- insights 테이블에 tags 컬럼 추가
ALTER TABLE insights ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 태그 검색을 위한 GIN 인덱스
CREATE INDEX IF NOT EXISTS idx_insights_tags ON insights USING GIN (tags);
