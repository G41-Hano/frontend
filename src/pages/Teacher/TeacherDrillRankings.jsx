import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api';
import drillBg from '../../assets/drill_bg.png';
import Podium from '../../components/drill/student/Podium';

const TeacherDrillRankings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Allow classroomId and drillName to be provided via navigation state (used when teacher opens leaderboard)
  const [classroomId, setClassroomId] = useState(location.state?.classroomId || null);
  const [drillName, setDrillName] = useState(location.state?.drillName || '');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        // First get the drill details to get the classroom ID, but if the API forbids access (403)
        // we fall back to using values passed via navigation state (teachers may not have access to the drill detail endpoint).
        let resolvedClassroomId = classroomId; // start with any value we may have from state
        try {
          const drillResponse = await api.get(`/api/drills/${id}/`);
          const classroomIdFromApi = drillResponse.data.classroom;
          const drillNameFromApi = drillResponse.data.title;
          resolvedClassroomId = classroomIdFromApi;
          setClassroomId(classroomIdFromApi);
          setDrillName(drillNameFromApi);
        } catch (err) {
          // If forbidden and we have classroomId from location.state, continue using it
          if (err.response && err.response.status === 403 && location.state?.classroomId) {
            resolvedClassroomId = location.state.classroomId;
            setClassroomId(location.state.classroomId);
            setDrillName(location.state.drillName || '');
          } else {
            throw err; // rethrow to be handled by outer catch
          }
        }

        // Ensure we have a classroom id to fetch students
        if (!resolvedClassroomId) {
          throw new Error('Missing classroom id for leaderboard');
        }

        // Get all students in the classroom
        const classroomResponse = await api.get(`/api/classrooms/${resolvedClassroomId}/students/`);
        const allStudents = classroomResponse.data.students;

        // Get drill results with cache-busting parameter
        const resultsResponse = await api.get(`/api/drills/${id}/results/?t=${Date.now()}`);
        const results = resultsResponse.data;

        // Create a map of student results, keeping only their latest attempt
        const resultsMap = new Map();
        results.forEach(result => {
          const studentId = result.student.id;
          const currentLatest = resultsMap.get(studentId);
          
          // If no result exists for this student or this result has a higher run_number, update the map
          if (!currentLatest || result.run_number > currentLatest.run_number) {
            resultsMap.set(studentId, result);
          }
        });

        // Combine all students with their latest results
        const transformedData = allStudents.map(student => {
          const result = resultsMap.get(student.id);
          return {
            id: student.id,
            name: student.name,
            avatar: student.avatar,
            points: result ? result.points : 0,
            run_number: result ? result.run_number : 0,
            hasAttempted: !!result
          };
        });

        // Filter out students who haven't attempted the drill and sort by points
        const sortedData = transformedData
          .filter(student => student.hasAttempted)
          .sort((a, b) => {
            if (b.points === a.points) {
              return a.name.localeCompare(b.name);
            }
            return b.points - a.points;
          });
        
        setLeaderboard(sortedData);
      } catch (err) {
        setError('Failed to load leaderboard');
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [id]);

  // Rest of the component remains the same...
  // Function to get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#EEF1F5]">
      <div className="max-w-[95%] mx-auto mt-8">
        <div
          className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 animate-slideIn relative overflow-hidden"
          style={{
            backgroundImage: `url(${drillBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: 500,
          }}
        >
          <button
            onClick={() => classroomId ? navigate(`/t/classes/${classroomId}`) : navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 mb-8 bg-white border-2 border-[#4C53B4] text-[#4C53B4] font-bold rounded-xl shadow hover:bg-[#f3f6fd] transition-colors text-lg"
            style={{ position: 'relative', zIndex: 20 }}
          >
            <i className="fa-solid fa-arrow-left text-[#4C53B4] text-base"></i>
            Back to Classroom
          </button>
          <div className="absolute inset-0 bg-blue-100/60 pointer-events-none rounded-2xl" />
          <div className="relative z-10 p-4 sm:p-0">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#e09b1a] text-center mb-6 sm:mb-8 tracking-wide flex items-center justify-center gap-2">
              <span>{drillName} Leaderboard</span>
            </h2>
            {loading ? (
              <div className="text-center text-gray-500 py-12">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-12">{error}</div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center text-gray-400 py-12">No students attempted the Drill yet.</div>
            ) : (
              <>
                <Podium drillLeaderboard={leaderboard} onUserSelect={() => {}} />
                {/* Table for the rest */}
                <div className="w-full sm:max-w-lg mx-auto bg-white/80 rounded-xl shadow p-4">
                  <div className="flex font-bold text-[#e09b1a] text-base sm:text-lg mb-2">
                    <div className="flex-1 pl-2">NAME</div>
                    <div className="w-20 sm:w-24 text-right pr-2">POINTS</div>
                  </div>
                  {leaderboard.slice(3).map((student) => (
                    <div key={student.id} className="flex items-center border-t border-gray-200 py-2">
                      <div className="flex-1 font-semibold text-gray-700 pl-2">
                        {student.name}
                      </div>
                      <div className="w-20 sm:w-24 text-right font-bold text-gray-700 pr-2">{student.points}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDrillRankings;