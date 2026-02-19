import { createClient } from './client';
import { nanoid } from 'nanoid';

const BUCKET_NAME = 'article-images';

export async function uploadImage(file: File, articleId: string): Promise<string> {
  const supabase = createClient();

  const fileExt = file.name.split('.').pop() || 'png';
  const fileName = `${nanoid()}.${fileExt}`;
  const filePath = `${articleId}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('[ERROR] 이미지 업로드 실패:', error);
    throw new Error(`이미지 업로드 실패: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function deleteImage(filePath: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error('[ERROR] 이미지 삭제 실패:', error);
    throw new Error(`이미지 삭제 실패: ${error.message}`);
  }
}

export function getPublicUrl(filePath: string): string {
  const supabase = createClient();

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return publicUrl;
}
