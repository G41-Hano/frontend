import Skeleton from '../Skeleton';

const DrillResultsSkeleton = () => (
  <div className="p-8 animate-fadeIn">
    {/* Header Banner Skeleton */}
    <div className="bg-gray-100 p-6 rounded-xl shadow-lg mb-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-6 w-64 mb-3" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-20 rounded-xl" />
        </div>
      </div>
    </div>
    
    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm animate-pulse">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
    
    {/* Question Navigation Skeleton */}
    <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[...Array(8)].map((_, idx) => (
          <Skeleton key={idx} className="w-10 h-10 rounded-lg" />
        ))}
      </div>
    </div>
    
    {/* Attempt Filtering Skeleton */}
    <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
    
    {/* Current Question Skeleton */}
    <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-pulse">
      <Skeleton className="h-7 w-3/4 mb-4" />
      <Skeleton className="h-6 w-32 rounded-full mb-4" />
      
      {/* Question Image Placeholder */}
      <div className="mb-4 flex justify-center">
        <Skeleton className="h-64 w-96 rounded-lg" />
      </div>
      
      {/* Choices Skeleton */}
      <div className="mb-4">
        <Skeleton className="h-5 w-20 mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 rounded-lg border border-gray-200">
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Progress Bar Skeleton */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-2.5 w-full rounded-full" />
      </div>
    </div>
    
    {/* Results Table Skeleton */}
    <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm animate-pulse">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="divide-y divide-gray-200">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-8">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default DrillResultsSkeleton;
