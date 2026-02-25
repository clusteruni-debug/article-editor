'use client';

type SortOption = 'newest' | 'oldest' | 'updated' | 'title';
type StatusFilter = 'all' | 'draft' | 'published';
type ViewMode = 'card' | 'list';

const SORT_LABELS: Record<SortOption, string> = {
  newest: '최신순',
  oldest: '오래된순',
  updated: '최근 수정순',
  title: '제목순',
};

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: '전체',
  draft: '임시저장',
  published: '발행됨',
};

interface HomeHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  statusCounts: { total: number; draft: number; published: number };
  allTags: string[];
  selectedTag: string | null;
  onTagChange: (tag: string | null) => void;
}

export function HomeHeader({
  searchQuery,
  onSearchChange,
  searchInputRef,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  statusFilter,
  onStatusChange,
  statusCounts,
  allTags,
  selectedTag,
  onTagChange,
}: HomeHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* 검색 + 정렬 + 뷰 모드 */}
        <div className="flex items-center gap-3">
          {/* 검색 입력 */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="제목, 내용 검색... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* 정렬 드롭다운 */}
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:border-gray-400 cursor-pointer"
          >
            {Object.entries(SORT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* 뷰 모드 토글 */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('card')}
              className={`p-2 transition-colors ${viewMode === 'card' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              title="카드뷰"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              title="리스트뷰"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 상태 필터 */}
      <div className="max-w-6xl mx-auto px-4 pb-2 flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => onStatusChange('all')}
          className={`px-2.5 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${
            statusFilter === 'all'
              ? 'bg-gray-900 text-white'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          전체 {statusCounts.total}
        </button>
        <button
          onClick={() => onStatusChange('draft')}
          className={`px-2.5 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${
            statusFilter === 'draft'
              ? 'bg-yellow-500 text-white'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          임시저장 {statusCounts.draft}
        </button>
        <button
          onClick={() => onStatusChange('published')}
          className={`px-2.5 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${
            statusFilter === 'published'
              ? 'bg-green-600 text-white'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          발행됨 {statusCounts.published}
        </button>
      </div>

      {/* 태그 필터 */}
      {allTags.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pb-3 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-gray-400 flex-shrink-0">태그:</span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagChange(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
