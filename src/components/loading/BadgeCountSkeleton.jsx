import Skeleton from '../Skeleton';

const BadgeCountSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.05)] px-3 sm:px-4 py-2 flex items-center gap-2 animate-pulse">
      {/* Badge Icon Skeleton */}
      <div className="w-6 sm:w-7 h-6 sm:h-7 bg-gray-200 rounded"></div>
      
      {/* Badge Count Skeleton */}
      <Skeleton className="h-4 w-6" />
    </div>
  );
};

export default BadgeCountSkeleton;
