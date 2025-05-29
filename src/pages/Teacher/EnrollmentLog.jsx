export default function EnrollmentLog({enrolledNames, notEnrolledNames}) {
  if (!enrolledNames || !notEnrolledNames) return <>
    <p>NO NAMES RECEIVED</p>
  </>
  return <>
    <div className='flex gap-2 text-left transition-all duration-200 text-sm'>
      {
        enrolledNames.length > 0  && (
          <>
            <div className='flex-1 bg-gray-100 border-2 border-gray-200 px-4 py-2.5 rounded-2xl'>
              <p className="font-semibold text-[#4C53B4] text-base">
                <i className="fa-solid fa-check-circle mr-2 text-green-500"/>Successfully Enrolled ({enrolledNames.length})
              </p>
              <ol className='list-decimal pl-5'>
                {enrolledNames.map((user, index) => (
                  <li key={index}>{user}</li>
                ))}
              </ol>
            </div>
          </>
        )
      }
      {
        enrolledNames.length === 0 && notEnrolledNames.length === 0 && (
            <div className='flex-1 bg-gray-100 border-2 border-gray-200 px-4 py-2.5 rounded-2xl'>
              <p className="font-semibold text-[#4C53B4] text-base text-center">
                No students enrolled
              </p>
            </div>

        )
      }
      {
        notEnrolledNames.length > 0 && (
          <>
            <div className='flex-1 bg-gray-100 border-2 border-gray-200 px-4 py-2.5 rounded-2xl'>
              <p className="font-semibold text-[#4C53B4] text-base">
                <i className="fa-solid fa-circle-xmark mr-2 text-red-500"/>Failed to Enroll ({notEnrolledNames.length})
              </p>
              <ol className='list-decimal pl-5'>
                {notEnrolledNames.map((user, index) => (
                  <li key={index}>{user}</li>
                ))}
              </ol>
            </div>
          </>
        )
      }
    </div>
  </>
}