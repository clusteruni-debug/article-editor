-- =============================================
-- X Article Editor - 시리즈 관리 테이블
-- =============================================

-- 1. series 테이블 생성
CREATE TABLE IF NOT EXISTS series (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- 시리즈 정보
    title VARCHAR(500) NOT NULL,
    description TEXT,
    cover_image_url TEXT,

    -- 상태
    status VARCHAR(20) DEFAULT 'active',  -- active, completed, archived

    -- 메타
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. articles 테이블에 시리즈 관련 컬럼 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'articles' AND column_name = 'series_id'
    ) THEN
        ALTER TABLE articles ADD COLUMN series_id UUID REFERENCES series(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'articles' AND column_name = 'series_order'
    ) THEN
        ALTER TABLE articles ADD COLUMN series_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_series_status ON series(status);
CREATE INDEX IF NOT EXISTS idx_articles_series_id ON articles(series_id);
CREATE INDEX IF NOT EXISTS idx_articles_series_order ON articles(series_id, series_order);

-- 4. updated_at 트리거
DROP TRIGGER IF EXISTS update_series_updated_at ON series;
CREATE TRIGGER update_series_updated_at
    BEFORE UPDATE ON series
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS 비활성화 (개발용)
ALTER TABLE series DISABLE ROW LEVEL SECURITY;

-- 6. 코멘트
COMMENT ON TABLE series IS '아티클 시리즈 - 연결된 글 묶음';
COMMENT ON COLUMN series.status IS 'active(진행중), completed(완결), archived(보관)';
COMMENT ON COLUMN articles.series_order IS '시리즈 내 순서 (1부터 시작)';
