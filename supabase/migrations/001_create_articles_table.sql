-- =============================================
-- X Article Editor - Supabase 데이터베이스 설정
-- =============================================
-- 이 SQL을 Supabase 대시보드의 SQL Editor에서 실행하세요.
-- https://supabase.com/dashboard > 프로젝트 선택 > SQL Editor

-- 1. articles 테이블 생성
CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    content_text TEXT,
    cover_image_url TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);

-- 3. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS (Row Level Security) 활성화 (선택사항 - 인증 사용시)
-- 현재는 인증 없이 사용하므로 비활성화 상태로 둡니다.
-- 인증을 추가하려면 아래 주석을 해제하세요.

-- ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Anyone can read published articles"
--     ON articles FOR SELECT
--     USING (status = 'published');

-- CREATE POLICY "Anyone can create articles"
--     ON articles FOR INSERT
--     WITH CHECK (true);

-- CREATE POLICY "Anyone can update articles"
--     ON articles FOR UPDATE
--     USING (true);

-- CREATE POLICY "Anyone can delete articles"
--     ON articles FOR DELETE
--     USING (true);

-- 5. 현재는 모든 사용자가 접근 가능하도록 설정
-- (개발/테스트 용도)
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
