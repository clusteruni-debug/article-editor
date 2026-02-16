import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

const BUCKET_NAME = 'article-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// 🔐 MIME 타입에서 안전한 확장자 결정
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const articleId = formData.get('articleId') as string | null;
    const safeArticleId = articleId?.replace(/[^a-zA-Z0-9-_]/g, '') || '';

    // 파일 검증
    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WebP만 가능)' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '파일 크기가 5MB를 초과합니다.' },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = await createServerSupabaseClient();

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // articleId가 지정된 경우 업로드 대상 글 소유권 확인
    if (safeArticleId) {
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .select('id, author_id')
        .eq('id', safeArticleId)
        .eq('author_id', user.id)
        .maybeSingle();

      if (articleError) {
        return NextResponse.json(
          { error: '업로드 권한 확인 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }

      if (!article) {
        return NextResponse.json(
          { error: '업로드 권한이 없습니다.' },
          { status: 403 }
        );
      }
    }

    // 파일 업로드 - MIME 타입에서 확장자 결정 (파일명 조작 방지)
    const fileExt = MIME_TO_EXT[file.type] || 'jpg';
    const fileName = `${nanoid()}.${fileExt}`;
    // articleId 검증 (경로 탐색 공격 방지)
    const filePath = safeArticleId ? `${safeArticleId}/${fileName}` : fileName;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      // 프로덕션에서는 상세 에러 숨기기
      if (process.env.NODE_ENV === 'development') {
        console.error('Upload error:', uploadError);
      }
      return NextResponse.json(
        { error: '업로드 실패. 잠시 후 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    // 공개 URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    // 프로덕션에서는 상세 에러 숨기기
    if (process.env.NODE_ENV === 'development') {
      console.error('Server error:', error);
    }
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
