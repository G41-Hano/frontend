import Skeleton from '../Skeleton';

const BadgeSkeleton = ({ count = 6 }) => {
  return (
    <div className="flex flex-wrap gap-10 justify-start">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col items-center w-64 animate-pulse"
        >
          {/* Badge Image Skeleton */}
          <div className="w-40 h-40 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
            <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
          </div>
          
          {/* Badge Name Skeleton */}
          <Skeleton className="h-6 w-32 mb-2" />
          
          {/* Badge Description Skeleton */}
          <Skeleton className="h-4 w-48 mb-1" />
          <Skeleton className="h-4 w-40" />
        </div>
      ))}
    </div>
  );
};

export default BadgeSkeleton;
