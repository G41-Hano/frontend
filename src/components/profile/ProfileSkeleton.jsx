import Skeleton from '../common/Skeleton';

const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-pulse">
    <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-gray-100 pb-6 mb-6">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="flex-grow text-center sm:text-left">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div>
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div>
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div>
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>

      {/* Button */}
      <div className="mt-8 flex justify-end">
        <Skeleton className="h-12 w-32" />
      </div>
    </div>
  </div>
);

export default ProfileSkeleton;
