import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function SeriesLoading() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="h-7 w-28 bg-gray-200 rounded animate-pulse" />
        </div>
      </header>
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  );
}
