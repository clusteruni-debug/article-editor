-- =============================================
-- 성능 개선을 위한 추가 인덱스
-- =============================================

-- 1. articles 테이블 - 전문 검색 인덱스 (한국어 지원)
CREATE INDEX IF NOT EXISTS idx_articles_content_text_gin
ON articles USING gin(to_tsvector('simple', coalesce(content_text, '')));

-- 2. articles 테이블 - 태그 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_articles_tags_gin
ON articles USING gin(tags);

-- 3. insights 테이블 - 상태별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_insights_status_created
ON insights(status, created_at DESC);

-- 4. insights 테이블 - 키워드 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_insights_keyword_gin
ON insights USING gin(to_tsvector('simple', keyword));

-- 5. article_stats 테이블 - 플랫폼별 집계 최적화
CREATE INDEX IF NOT EXISTS idx_article_stats_platform_recorded
ON article_stats(platform, recorded_at DESC);

-- 6. series 테이블 - 상태별 조회
CREATE INDEX IF NOT EXISTS idx_series_status
ON series(status);

-- 7. articles - 시리즈 순서 조회 최적화
CREATE INDEX IF NOT EXISTS idx_articles_series_order
ON articles(series_id, series_order)
WHERE series_id IS NOT NULL;
