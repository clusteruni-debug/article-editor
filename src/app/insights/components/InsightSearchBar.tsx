'use client';

interface InsightSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOrder: 'desc' | 'asc';
  onSortChange: (order: 'desc' | 'asc') => void;
}

export function InsightSearchBar({
  searchQuery,
  onSearchChange,
  sortOrder,
  onSortChange,
}: InsightSearchBarProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="키워드, 요약, 출처, 태그 검색..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      <select
        value={sortOrder}
        onChange={(e) => onSortChange(e.target.value as 'desc' | 'asc')}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-gray-400 flex-shrink-0"
      >
        <option value="desc">최신순</option>
        <option value="asc">오래된순</option>
      </select>
    </div>
  );
}
