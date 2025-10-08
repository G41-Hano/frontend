// DrillLeaderboard.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import drillBg from '../../assets/drill_bg.png';

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
            className="inline-flex items-center gap-2 px-6 py-3 mb-8 bg-white border-2 border-[#4C53B4] text-[#4C53B4] font-bold rounded-xl shadow hover:bg-[#f3f6fd] transition-colors text-lg"
            style={{ position: 'relative', zIndex: 20 }}
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
                {/* Top 3 Podium: 2nd (left), 1st (center), 3rd (right) */}
                <div className="flex justify-center items-end gap-8 mb-10">
                  {[1, 0, 2].map((idx, pos) => {
                    const student = leaderboard[idx];
                    if (!student) return <div key={pos} className="w-32" />;
                    // Podium order: left=2nd, center=1st, right=3rd
                    const rank = pos === 0 ? 2 : pos === 1 ? 1 : 3;
                    const borderColors = [
                      'border-purple-400', // 2nd place (left)
                      'border-yellow-400', // 1st place (center)
                      'border-orange-400'  // 3rd place (right)
                    ];
                    const size = pos === 1 ? 'w-32 h-32' : 'w-24 h-24';
                    const ring = pos === 1 ? 'ring-4 ring-yellow-300' : '';
                    return (
                      <div key={student.id} className="flex flex-col items-center">
                        {/* Rank and Crown above image */}
                        <div className="flex flex-col items-center mb-2">
                          <span className={`font-extrabold text-2xl ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-purple-400' : 'text-orange-400'}`}>{rank}</span>
                          {rank === 1 && (
                            <span className="-mt-2 text-yellow-400 text-4xl drop-shadow-lg">👑</span>
                          )}
                        </div>
                        <div className={`relative ${size} rounded-full overflow-hidden border-4 ${borderColors[pos]} bg-white flex items-center justify-center ${ring}`}>
                          {student.avatar ? (
                            <img 
                              src={student.avatar} 
                              alt={student.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `<span class="text-[#4C53B4] font-bold text-3xl">${getInitials(student.name)}</span>`;
                              }}
                            />
                          ) : (
                            <span className="text-[#4C53B4] font-bold text-3xl">{getInitials(student.name)}</span>
                          )}
                        </div>
                        <div className={`mt-4 text-center ${pos === 1 ? 'font-extrabold text-xl' : 'font-bold text-lg'} text-gray-800`}>
                          {student.name}
                        </div>
                        <div className="text-center text-gray-600 font-bold">{student.points}</div>
                      </div>
                    );
                  })}
                </div>
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