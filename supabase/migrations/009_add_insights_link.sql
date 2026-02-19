-- 인사이트에 개별 원문 링크(link) 컬럼 추가
-- 기존 source 필드에 URL이 들어간 경우 link로 이관

-- 1. link 컬럼 추가
ALTER TABLE insights ADD COLUMN IF NOT EXISTS link TEXT;

-- 2. 기존 source에 URL 패턴(http)이 있는 행 → link로 이동, source는 NULL 처리
UPDATE insights
SET link = source, source = NULL
WHERE source IS NOT NULL
  AND source LIKE 'http%'
  AND link IS NULL;
