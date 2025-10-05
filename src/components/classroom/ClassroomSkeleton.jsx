import Skeleton from '../common/Skeleton';

const ClassroomSkeleton = () => (
  <div className="bg-gray-200 rounded-3xl p-4 animate-pulse min-h-[200px] flex flex-col justify-between">
    <div className="space-y-3">
      <Skeleton className="w-12 h-12 rounded-full bg-gray-300" />
      <div>
        <Skeleton className="h-6 w-3/4 mb-2 bg-gray-300" />
        <Skeleton className="h-4 w-1/2 bg-gray-300" />
      </div>
    </div>
    <div className="flex -space-x-2">
      <Skeleton className="h-10 w-10 rounded-full bg-gray-300 border-2 border-gray-200" />
      <Skeleton className="h-10 w-10 rounded-full bg-gray-300 border-2 border-gray-200" />
      <Skeleton className="h-10 w-10 rounded-full bg-gray-300 border-2 border-gray-200" />
    </div>
  </div>
);

export default ClassroomSkeleton;
