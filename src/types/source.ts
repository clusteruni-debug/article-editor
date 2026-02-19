export type SourceCategory = 'newsletter' | 'blog' | 'podcast' | 'youtube' | 'twitter' | 'other';

export const SOURCE_CATEGORY_LABELS: Record<SourceCategory, { emoji: string; label: string }> = {
  newsletter: { emoji: '📧', label: '뉴스레터' },
  blog: { emoji: '📝', label: '블로그' },
  podcast: { emoji: '🎙️', label: '팟캐스트' },
  youtube: { emoji: '🎬', label: '유튜브' },
  twitter: { emoji: '🐦', label: 'X/트위터' },
  other: { emoji: '📌', label: '기타' },
};

export const SOURCE_CATEGORIES: SourceCategory[] = [
  'newsletter', 'blog', 'podcast', 'youtube', 'twitter', 'other',
];

export interface Source {
  id: string;
  name: string;
  url?: string;
  description?: string;
  category: SourceCategory;
  created_at: string;
  updated_at: string;
}

export interface SourceInsert {
  name: string;
  url?: string;
  description?: string;
  category?: SourceCategory;
}

export interface SourceUpdate {
  name?: string;
  url?: string;
  description?: string;
  category?: SourceCategory;
}

// 소스 + 인사이트 수 통계
export interface SourceStats extends Source {
  insight_count: number;
}
