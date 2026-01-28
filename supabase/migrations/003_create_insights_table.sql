-- =============================================
-- X Article Editor - 인사이트 테이블 설정
-- =============================================
-- 뉴스레터 키워드 → 아티클 연결 추적용

-- 1. articles 테이블에 tags 컬럼 추가 (없는 경우)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'articles' AND column_name = 'tags'
    ) THEN
        ALTER TABLE articles ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- 2. articles 테이블에 linked_insight_id 컬럼 추가 (인사이트 역참조용)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'articles' AND column_name = 'linked_insight_id'
    ) THEN
        ALTER TABLE articles ADD COLUMN linked_insight_id UUID;
    END IF;
END $$;

-- 3. insights 테이블 생성
CREATE TABLE IF NOT EXISTS insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- 핵심 정보
    keyword VARCHAR(200) NOT NULL,
    summary TEXT,
    source TEXT,                    -- 뉴스레터 이름, URL 등
    insight_date DATE DEFAULT CURRENT_DATE,

    -- 분류
    action_type VARCHAR(20) DEFAULT 'observe',  -- execute, idea, observe, reference
    status VARCHAR(20) DEFAULT 'unread',        -- unread, idea, drafted, published

    -- 아티클 연결
    linked_article_id UUID REFERENCES articles(id) ON DELETE SET NULL,

    -- 플랫폼 발행 추적
    platforms_published TEXT[] DEFAULT '{}',    -- ['twitter', 'blog', 'instagram']

    -- 메타
    notes TEXT,                     -- 추가 메모
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_insights_status ON insights(status);
CREATE INDEX IF NOT EXISTS idx_insights_action_type ON insights(action_type);
CREATE INDEX IF NOT EXISTS idx_insights_insight_date ON insights(insight_date DESC);
CREATE INDEX IF NOT EXISTS idx_insights_linked_article ON insights(linked_article_id);
CREATE INDEX IF NOT EXISTS idx_insights_keyword ON insights USING gin(to_tsvector('simple', keyword));

-- 5. updated_at 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_insights_updated_at ON insights;
CREATE TRIGGER update_insights_updated_at
    BEFORE UPDATE ON insights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. articles 테이블에 인사이트 FK 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'articles_linked_insight_id_fkey'
    ) THEN
        ALTER TABLE articles
        ADD CONSTRAINT articles_linked_insight_id_fkey
        FOREIGN KEY (linked_insight_id) REFERENCES insights(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 7. RLS 비활성화 (개발용)
ALTER TABLE insights DISABLE ROW LEVEL SECURITY;

-- 8. 코멘트 추가
COMMENT ON TABLE insights IS '뉴스레터 인사이트 - 키워드 기반 아티클 아이디어 추적';
COMMENT ON COLUMN insights.action_type IS 'execute(🔥실행), idea(💡아이디어), observe(👀관찰), reference(📌참고만)';
COMMENT ON COLUMN insights.status IS 'unread(미확인), idea(아이디어), drafted(작성중), published(발행완료)';
COMMENT ON COLUMN insights.platforms_published IS '발행된 플랫폼 목록: twitter, blog, instagram, thread 등';
