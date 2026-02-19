export type SeriesStatus = 'active' | 'completed' | 'archived';

export const SERIES_STATUS_LABELS: Record<SeriesStatus, { label: string; color: string }> = {
  active: { label: '진행중', color: 'blue' },
  completed: { label: '완결', color: 'green' },
  archived: { label: '보관', color: 'gray' },
};

export interface Series {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  status: SeriesStatus;
  created_at: string;
  updated_at: string;
}

export interface SeriesInsert {
  title: string;
  description?: string;
  cover_image_url?: string;
  status?: SeriesStatus;
}

export interface SeriesUpdate {
  title?: string;
  description?: string;
  cover_image_url?: string;
  status?: SeriesStatus;
}

export interface SeriesWithArticles extends Series {
  articles: {
    id: string;
    title: string;
    status: 'draft' | 'published';
    series_order: number;
    published_at?: string;
  }[];
  articleCount: number;
}
