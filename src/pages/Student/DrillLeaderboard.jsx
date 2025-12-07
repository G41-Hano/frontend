// DrillLeaderboard.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import drillBg from '../../assets/drill_bg.png';
import Podium from '../../components/drill/student/Podium';

const DrillLeaderboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classroomId, setClassroomId] = useState(null);
  const [drillName, setDrillName] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        // First get the drill details to get the classroom ID
        const drillResponse = await api.get(`/api/drills/${id}/`);
        const classroomId = drillResponse.data.classroom;
        const drillName = drillResponse.data.title;
        setClassroomId(classroomId);
        setDrillName(drillName);

        // Get all students in the classroom
        const classroomResponse = await api.get(`/api/classrooms/${classroomId}/students/`);
        const allStudents = classroomResponse.data.students;

        // Get drill results
        const resultsResponse = await api.get(`/api/drills/${id}/results/`);
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
            onClick={() => navigate(`/s/classes/${classroomId}`)}
            className="inline-flex items-center gap-2 px-6 py-3 mb-8 bg-white border-2 border-[#4C53B4] text-[#4C53B4] font-bold rounded-xl shadow hover:bg-[#f3f6fd] transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ position: 'relative', zIndex: 20 }}
            disabled={!classroomId}
          >
            <i className="fa-solid fa-arrow-left text-[#4C53B4] text-base"></i>
            Back to Classroom
          </button>
          <div className="absolute inset-0 bg-blue-100/60 pointer-events-none rounded-2xl" />
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-[#e09b1a] text-center mb-8 tracking-wide flex items-center justify-center gap-2">
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
                <div className="max-w-lg mx-auto bg-white/80 rounded-xl shadow p-4">
                  <div className="flex font-bold text-[#e09b1a] text-lg mb-2">
                    <div className="flex-1">NAME</div>
                    <div className="w-24 text-right">POINTS</div>
                  </div>
                  {leaderboard.slice(3).map((student) => (
                    <div key={student.id} className="flex items-center border-t border-gray-200 py-2">
                      <div className="flex-1 font-semibold text-gray-700">
                        {student.name}
                      </div>
                      <div className="w-24 text-right font-bold text-gray-700">{student.points}</div>
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

export default DrillLeaderboard;