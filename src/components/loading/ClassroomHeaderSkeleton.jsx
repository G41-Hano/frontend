import Skeleton from '../Skeleton';

const ClassroomHeaderSkeleton = () => (
  <div className="bg-gray-200 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden min-h-[180px] animate-pulse">
    <div className="space-y-2 max-w-full sm:max-w-[65%]">
      <Skeleton className="h-10 w-3/4 bg-gray-300" />
      <Skeleton className="h-6 w-1/2 bg-gray-300" />
      <Skeleton className="h-10 w-40 bg-gray-300 mt-2" />
    </div>
    <div className="w-24 sm:w-40 h-24 sm:h-40 flex-shrink-0">
      <Skeleton className="h-full w-full rounded-full bg-gray-300" />
    </div>
  </div>
);

export default ClassroomHeaderSkeleton;
