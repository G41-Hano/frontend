import Skeleton from '../common/Skeleton';

const DrillSkeleton = () => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="flex-grow">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  </div>
);

export default DrillSkeleton;
