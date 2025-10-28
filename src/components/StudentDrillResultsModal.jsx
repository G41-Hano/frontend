import React, { useState, useEffect } from 'react';
import api from '../api';

const StudentDrillResultsModal = ({ student, drills, onClose }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentResults = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const studentId = student.id;
        const resultPromises = drills.map(drill => 
          // Fetch results for this specific drill and student
          api.get(`/api/drills/${drill.id}/results/student/?student_id=${studentId}`)
             .then(res => ({
               drill: drill,
               results: res.data || [] // Array of attempts for this drill
             }))
             .catch(err => {
               console.error(`Failed to fetch results for drill ${drill.id}:`, err);
               return { drill: drill, results: [] };
             })
        );

        const allResults = await Promise.all(resultPromises);
        
        // Process results to combine them and find the best attempt ID
        const combinedResults = allResults
          .filter(item => item.results.length > 0)
          .map(item => {
            // Calculate max points for visualization/highlighting
            const maxPointsResult = item.results.reduce((best, current) => {
                return (current.points || 0) > (best.points || 0) ? current : best;
            }, item.results[0]);

            return {
              ...item.drill,
              drill_results: item.results.map(r => ({
                  ...r,
                  is_best_attempt: r.id === maxPointsResult.id
              }))
            }
          });

        setResults(combinedResults);
        
      } catch (err) {
        setError("Failed to load drill results for the student.");
      } finally {
        setLoading(false);
      }
    };

    if (student && drills.length > 0) {
      fetchStudentResults();
    } else if (student) {
      setLoading(false);
    }
  }, [student, drills]);

  if (!student) return null;

  return (
    // FIX: Removed background classes entirely to make the backdrop transparent
    // To ensure overlay, keep fixed inset-0 and z-50
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4"> 
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fadeIn">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-[#4C53B4] rounded-t-3xl p-6 text-white shadow-lg z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              Drill History: {student.name}
            </h2>
            <button onClick={onClose} className="text-white opacity-70 hover:opacity-100 transition-opacity">
              <i className="fa-solid fa-xmark text-2xl"></i>
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4C53B4]"></div>
              <p className="ml-4 text-gray-600">Fetching drill history...</p>
            </div>
          )}

          {error && <p className="text-red-500 text-center py-10">{error}</p>}

          {!loading && results.length === 0 && (
            <p className="text-gray-600 text-center py-10">
              {student.name} has not attempted any drills yet.
            </p>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-6">
              {results.map(drill => (
                <div key={drill.id} className="bg-[#F7F9FC] rounded-xl p-5 shadow-inner border border-gray-200">
                  <h3 className="text-xl font-extrabold text-[#4C53B4] mb-4 border-b pb-2">{drill.title}</h3>
                  
                  <div className="space-y-3">
                    {drill.drill_results.map((result, index) => {
                      const isBestAttempt = result.is_best_attempt;
                      const attemptDate = new Date(result.completion_time || result.start_time).toLocaleDateString();
                      
                      return (
                        <div 
                          key={result.id} 
                          className={`p-4 rounded-lg border-2 transition-all shadow-sm 
                            ${isBestAttempt 
                              ? 'bg-[#FFDF9F] border-yellow-400' 
                              : 'bg-white border-gray-100 hover:bg-gray-50'
                            }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <span className="text-base font-bold text-gray-800">
                                Attempt {result.run_number}
                              </span>
                              {isBestAttempt && (
                                <span className="text-xs font-bold text-yellow-800 bg-yellow-300 px-2 py-0.5 rounded-full">
                                  <i className="fa-solid fa-star mr-1"></i> BEST
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">
                              {attemptDate}
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-2xl font-extrabold text-green-600">
                              {result.points} <span className="text-lg font-semibold text-gray-700">pts</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                             <i className="fa-solid fa-sync"></i> Total run: {result.run_number}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDrillResultsModal;