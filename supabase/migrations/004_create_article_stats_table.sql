-- =============================================
-- X Article Editor - 성과 추적 테이블
-- =============================================

-- 1. article_stats 테이블 생성 (플랫폼별 성과 기록)
CREATE TABLE IF NOT EXISTS article_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- 아티클 연결
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,

    -- 플랫폼 정보
    platform VARCHAR(50) NOT NULL,  -- twitter, blog, instagram, thread, newsletter
    platform_post_url TEXT,          -- 해당 플랫폼 게시물 URL

    -- 성과 지표
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,        -- RT, 공유 등
    saves INTEGER DEFAULT 0,         -- 북마크, 저장 등
    clicks INTEGER DEFAULT 0,        -- 링크 클릭

    -- 추가 메트릭 (플랫폼별 특수 지표)
    impressions INTEGER DEFAULT 0,   -- 노출수
    reach INTEGER DEFAULT 0,         -- 도달수
    engagement_rate DECIMAL(5,2),    -- 참여율 (%)

    -- 기록 날짜
    recorded_at DATE DEFAULT CURRENT_DATE,

    -- 메타
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 같은 날 같은 플랫폼 중복 방지
    UNIQUE(article_id, platform, recorded_at)
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_article_stats_article_id ON article_stats(article_id);
CREATE INDEX IF NOT EXISTS idx_article_stats_platform ON article_stats(platform);
CREATE INDEX IF NOT EXISTS idx_article_stats_recorded_at ON article_stats(recorded_at DESC);

-- 3. updated_at 트리거
DROP TRIGGER IF EXISTS update_article_stats_updated_at ON article_stats;
CREATE TRIGGER update_article_stats_updated_at
    BEFORE UPDATE ON article_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS 비활성화 (개발용)
ALTER TABLE article_stats DISABLE ROW LEVEL SECURITY;

-- 5. 코멘트
COMMENT ON TABLE article_stats IS '아티클 플랫폼별 성과 추적';
COMMENT ON COLUMN article_stats.platform IS 'twitter, blog, instagram, thread, newsletter 등';
COMMENT ON COLUMN article_stats.engagement_rate IS '참여율 = (likes + comments + shares) / views * 100';
