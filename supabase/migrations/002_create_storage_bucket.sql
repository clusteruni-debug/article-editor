-- =============================================
-- X Article Editor - Storage 버킷 설정
-- =============================================
-- 이 SQL을 Supabase 대시보드의 SQL Editor에서 실행하세요.
-- 또는 Storage 메뉴에서 직접 버킷을 생성할 수 있습니다.

-- 1. article-images 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'article-images',
    'article-images',
    true,
    5242880,  -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- 2. Storage RLS 정책 - 누구나 이미지 조회 가능
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'article-images');

-- 3. Storage RLS 정책 - 누구나 이미지 업로드 가능 (개발용)
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
CREATE POLICY "Anyone can upload images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'article-images');

-- 4. Storage RLS 정책 - 누구나 이미지 삭제 가능 (개발용)
DROP POLICY IF EXISTS "Anyone can delete images" ON storage.objects;
CREATE POLICY "Anyone can delete images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'article-images');
