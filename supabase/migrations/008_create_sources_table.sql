-- =============================================
-- X Article Editor - 소스(출처) 관리 테이블
-- =============================================
-- 뉴스레터, 블로그 등 인사이트 출처를 체계적으로 관리

-- 1. sources 테이블 생성
CREATE TABLE IF NOT EXISTS sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- 기본 정보
    name VARCHAR(200) NOT NULL UNIQUE,     -- 소스 이름 (예: "Lenny's Newsletter")
    url TEXT,                               -- 소스 URL
    description TEXT,                       -- 설명
    category VARCHAR(20) DEFAULT 'other',   -- newsletter, blog, podcast, youtube, twitter, other

    -- 메타
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_sources_name ON sources(name);
CREATE INDEX IF NOT EXISTS idx_sources_category ON sources(category);

-- 3. updated_at 자동 업데이트 트리거 (기존 함수 재사용)
DROP TRIGGER IF EXISTS update_sources_updated_at ON sources;
CREATE TRIGGER update_sources_updated_at
    BEFORE UPDATE ON sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. insights 테이블에 source_id FK 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'insights' AND column_name = 'source_id'
    ) THEN
        ALTER TABLE insights ADD COLUMN source_id UUID REFERENCES sources(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. source_id 인덱스
CREATE INDEX IF NOT EXISTS idx_insights_source_id ON insights(source_id);

-- 6. 기존 insights.source 텍스트 → sources 테이블로 자동 마이그레이션
-- 기존에 source 텍스트가 있는 인사이트들을 sources 테이블에 등록하고 연결
INSERT INTO sources (name, category)
SELECT DISTINCT source, 'other'
FROM insights
WHERE source IS NOT NULL AND source != ''
ON CONFLICT (name) DO NOTHING;

UPDATE insights
SET source_id = s.id
FROM sources s
WHERE insights.source = s.name
  AND insights.source IS NOT NULL
  AND insights.source != ''
  AND insights.source_id IS NULL;

-- 7. RLS 비활성화 (개발용)
ALTER TABLE sources DISABLE ROW LEVEL SECURITY;

-- 8. 코멘트 추가
COMMENT ON TABLE sources IS '인사이트 출처 관리 - 뉴스레터, 블로그, 팟캐스트 등';
COMMENT ON COLUMN sources.category IS 'newsletter, blog, podcast, youtube, twitter, other';
COMMENT ON COLUMN insights.source_id IS '출처 테이블 FK (sources.id)';
