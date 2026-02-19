import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center py-10">
          <LoadingSpinner size="lg" />
        </div>
      </main>
    </div>
  );
}
