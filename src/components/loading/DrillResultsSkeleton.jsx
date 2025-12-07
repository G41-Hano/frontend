import Skeleton from '../Skeleton';

const DrillResultsSkeleton = () => (
  <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn">
    {/* Header Banner Skeleton */}
    <div className="bg-gray-100 p-4 sm:p-6 rounded-xl shadow-lg mb-6 sm:mb-8 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <Skeleton className="h-7 sm:h-8 w-40 sm:w-48 mb-2" />
          <Skeleton className="h-5 sm:h-6 w-48 sm:w-64 mb-3" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Skeleton className="h-3 sm:h-4 w-32" />
            <Skeleton className="h-3 sm:h-4 w-32" />
            <Skeleton className="h-3 sm:h-4 w-32" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Skeleton className="h-10 w-full sm:w-24 rounded-xl" />
          <Skeleton className="h-10 w-full sm:w-20 rounded-xl" />
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
    <div className="mb-8 bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm animate-pulse">
      <Skeleton className="h-6 sm:h-7 w-3/4 mb-4" />
      <Skeleton className="h-5 sm:h-6 w-32 rounded-full mb-4" />
      
      {/* Question Image Placeholder */}
      <div className="mb-4 flex justify-center">
        <Skeleton className="h-48 sm:h-64 w-full sm:w-96 rounded-lg" />
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
      <div className="p-3 sm:p-4 bg-gray-50 border-b border-gray-200">
        <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
      </div>
      <div className="divide-y divide-gray-200">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 sm:w-10 h-8 sm:h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 mb-1" />
                <Skeleton className="h-2 sm:h-3 w-20 sm:w-24" />
              </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-8">
              <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
              <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
              <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default DrillResultsSkeleton;
