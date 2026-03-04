-- =============================================
-- Storage RLS 정책 보안 강화
-- 개발용 "누구나 가능" 정책 → 인증 사용자만 허용
-- =============================================

-- 1. 기존 개발용 정책 삭제
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete images" ON storage.objects;

-- 2. 인증 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'article-images'
        AND auth.uid() IS NOT NULL
    );

-- 3. 인증 사용자만 삭제 가능
CREATE POLICY "Authenticated users can delete images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'article-images'
        AND auth.uid() IS NOT NULL
    );

-- 참고: SELECT (Public Access) 정책은 유지 — 이미지는 공개 조회 가능
