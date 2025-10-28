import Skeleton from '../Skeleton';

const DashboardSkeleton = () => (
  <div className="bg-[#F7F9FC] min-h-screen animate-fadeIn">
    <div className="max-w-[95%] mx-auto py-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8 animate-pulse">
        <Skeleton className="h-9 w-80" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        {/* Overall Class Score Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm lg:col-span-3 animate-pulse">
          <Skeleton className="h-4 w-32 mb-6" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-24" />
            <Skeleton className="w-20 h-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-40 mt-2" />
        </div>

        {/* Drills Assigned Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm lg:col-span-3 animate-pulse">
          <Skeleton className="h-4 w-28 mb-6" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16" />
            <Skeleton className="w-20 h-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-36 mt-2" />
        </div>

        {/* Student Distribution Cards */}
        <div className="lg:col-span-6">
          <div className="flex gap-2 justify-center">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 flex flex-col items-center shadow-lg animate-pulse flex-1"
                style={{ minWidth: '160px', maxWidth: '200px', minHeight: '180px' }}
              >
                <Skeleton className="h-10 w-12 mb-2" />
                <Skeleton className="h-6 w-16 mb-1" />
                <Skeleton className="h-3 w-20 mb-4" />
                <Skeleton className="h-6 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Students Proficiency Table Skeleton */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 animate-pulse">
          <Skeleton className="h-6 w-48" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left">
                  <Skeleton className="h-3 w-20" />
                </th>
                <th className="px-6 py-3 text-left">
                  <Skeleton className="h-3 w-32" />
                </th>
                <th className="px-6 py-3 text-left">
                  <Skeleton className="h-3 w-16" />
                </th>
                <th className="px-6 py-3 text-left">
                  <Skeleton className="h-3 w-24" />
                </th>
                <th className="px-6 py-3 text-left">
                  <Skeleton className="h-3 w-28" />
                </th>
                <th className="px-6 py-3 text-center">
                  <Skeleton className="h-3 w-32 mx-auto" />
                </th>
                <th className="px-6 py-3 text-center">
                  <Skeleton className="h-3 w-20 mx-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Skeleton className="w-8 h-8 rounded-full mr-3" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-10 w-32 rounded-lg" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <Skeleton className="w-10 h-10 rounded-full" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <Skeleton className="w-10 h-10 rounded-full" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Class Leaderboard Skeleton */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden animate-pulse">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="p-6">
          {/* Podium Skeleton */}
          <div className="flex justify-center items-end gap-8 mb-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className={`${i === 2 ? 'w-32 h-32' : 'w-24 h-24'} rounded-full mb-2`} />
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-6 w-16 rounded-lg" />
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="space-y-2">
            <div className="flex items-center border-b border-gray-200 pb-2">
              <Skeleton className="h-4 w-32 flex-1" />
              <Skeleton className="h-4 w-24" />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center border-t border-gray-200 py-2">
                <Skeleton className="h-4 w-40 flex-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardSkeleton;
