import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api';

const ViewDrillResults = () => {
  const [searchParams] = useSearchParams();
  const drillId = searchParams.get('drillId');
  const navigate = useNavigate();
  const [drill, setDrill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [allDrillResults, setAllDrillResults] = useState([]); 
  const [stats, setStats] = useState({ 
    correct: 0, 
    incorrect: 0, 
    avgTime: 0, 
    correctPercentage: 0, 
    totalStudents: 0,
    studentsAnsweredCurrentQuestion: 0 
  });

  // Helper function to get absolute URL for media
  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:8000${url}`;
  };

  useEffect(() => {
    const fetchDrillAndResults = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch drill details
        const drillResponse = await api.get(`/api/drills/${drillId}/`);
        setDrill(drillResponse.data);
        console.log("Drill Response: ", drillResponse.data);
        console.log("Created At: ", drillResponse.data.created_at);
        console.log("Created At Type: ", typeof drillResponse.data.created_at);

        // Fetch drill results
        const resultsResponse = await api.get(`/api/drills/${drillId}/results/`);
        setAllDrillResults(resultsResponse.data);
        console.log("Results Response: ", resultsResponse.data);
        console.log("Picture Word: ", drillResponse.data.questions?.find(q => q.type === 'P')?.pictureWord);
        console.log("Memory Game Cards: ", drillResponse.data.questions?.find(q => q.type === 'G')?.memoryCards);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching drill results:', err.response?.data || err.message);
        if (err.response && err.response.status === 403) {
          setError("You don't have permission to view results for this drill.");
        } else {
          setError(err.response?.data?.error || 'Failed to load drill results. Please try again.');
        }
        setLoading(false);
      }
    };

    fetchDrillAndResults();
  }, [drillId]);

  // Calculate stats when question or results change
  useEffect(() => {
    if (!drill || allDrillResults.length === 0) {
      setStats({ correct: 0, incorrect: 0, avgTime: 0, correctPercentage: 0, totalStudents: 0, studentsAnsweredCurrentQuestion: 0 });
      return;
    }

    const currentQuestion = drill.questions[questionIdx];
    if (!currentQuestion) {
      setStats({ correct: 0, incorrect: 0, avgTime: 0, correctPercentage: 0, totalStudents: 0, studentsAnsweredCurrentQuestion: 0 });
      return;
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let totalTimeTaken = 0;
    let studentsAnswered = 0;

    // Process each student's drill result
    allDrillResults.forEach(drillResult => {
      const questionResult = drillResult.question_results.find(qr => qr.question_id === currentQuestion.id);
      if (questionResult) {
        studentsAnswered++;
        if (questionResult.is_correct) {
          correctCount++;
        } else {
          incorrectCount++;
        }
        if (questionResult.time_taken) {
          totalTimeTaken += questionResult.time_taken;
        }
      }
    });

    const totalStudentsWithResults = allDrillResults.length;
    const avgTime = studentsAnswered > 0 ? totalTimeTaken / studentsAnswered : 0;
    const correctPercentage = studentsAnswered > 0 ? Math.round((correctCount / studentsAnswered) * 100) : 0;

    setStats({
      totalStudents: totalStudentsWithResults,
      correct: correctCount,
      incorrect: incorrectCount,
      avgTime: avgTime.toFixed(1),
      correctPercentage,
      studentsAnsweredCurrentQuestion: studentsAnswered
    });
  }, [questionIdx, allDrillResults, drill]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4C53B4]"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
          <p className="text-red-600 flex items-center gap-2 justify-center">
            <i className="fa-solid fa-face-frown"></i>
            {error}
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 text-sm text-red-600 hover:text-red-800 flex items-center gap-2 mx-auto"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Back
          </button>
        </div>
      </div>
    );
  }
  
  if (!drill) return null;

  const questions = drill.questions || [];

  const ImageWithFallback = ({ src, alt, className }) => {
    const [error, setError] = useState(false);
    const absoluteSrc = getMediaUrl(src);
    
    return error ? (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <i className="fa-solid fa-image text-gray-400 text-4xl"></i>
      </div>
    ) : (
      <img 
        src={absoluteSrc} 
        alt={alt} 
        className={className}
        onError={() => setError(true)}
      />
    );
  };

  return (
    <div className="p-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#4C53B4] text-white p-6 rounded-xl shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-white/5 rounded-full"></div>
        
        <div className="flex items-center justify-between relative">
          <div>
            <h1 className="text-3xl font-bold mb-1">Drill Results</h1>
            <h2 className="text-xl font-medium mb-2">{drill.title}</h2>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span><i className="fa-solid fa-calendar-days mr-1"></i> Created: {drill.created_at ? new Date(drill.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A'}</span>
              <span className="mx-2">•</span>
              <span><i className="fa-solid fa-user-group mr-1"></i> {stats.totalStudents} Students</span>
              <span className="mx-2">•</span>
              <span><i className="fa-solid fa-list-check mr-1"></i> {questions.length} Questions</span>
            </div>
          </div>
          <button 
            className="px-4 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <i className="fa-solid fa-arrow-left"></i>
            Back
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#F7F9FC] p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Total Students</div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalStudents}</div>
        </div>
        <div className="bg-[#F0FFF4] p-4 rounded-xl border border-green-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Correct Answers</div>
          <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
        </div>
        <div className="bg-[#F0F4FF] p-4 rounded-xl border border-blue-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Avg. Time (min)</div>
          <div className="text-2xl font-bold text-blue-600">{stats.avgTime}</div>
        </div>
      </div>
      
      {/* Question Navigation */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-gray-700">Question Navigation</h3>
          <div className="text-sm text-gray-500">
            {questionIdx + 1} of {questions.length}
          </div>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setQuestionIdx(idx)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                idx === questionIdx 
                  ? 'bg-[#4C53B4] text-white font-bold shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
      
      {/* Current Question */}
      <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-xl mb-4 text-gray-800">
          Question {questionIdx + 1}: {questions[questionIdx]?.text}
        </h3>
        
        {/* Question Type */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {questions[questionIdx]?.type === 'M' && 'Multiple Choice'}
            {questions[questionIdx]?.type === 'F' && 'Blank Busters'}
            {questions[questionIdx]?.type === 'D' && 'Sentence Builder'}
            {questions[questionIdx]?.type === 'G' && 'Memory Game'}
            {questions[questionIdx]?.type === 'P' && 'Picture Word'}
          </span>
        </div>

        {/* Question Image */}
        {questions[questionIdx]?.image && (
          <div className="mb-4 flex justify-center">
            <ImageWithFallback 
              src={questions[questionIdx].image} 
              alt={`Question ${questionIdx + 1}`} 
              className="max-h-64 rounded-lg shadow object-cover"
            />
          </div>
        )}

        {/* Choices for Multiple Choice */}
        {questions[questionIdx]?.type === 'M' && questions[questionIdx]?.choices && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Choices:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {questions[questionIdx].choices.map((choice, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    idx === parseInt(questions[questionIdx].answer) 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-600">{String.fromCharCode(65 + idx)}.</span>
                    <span className="text-gray-700">{choice.text}</span>
                    {idx === parseInt(questions[questionIdx].answer) && (
                      <span className="ml-2 text-green-600">
                        <i className="fa-solid fa-check"></i> Correct Answer
                      </span>
                    )}
                  </div>
                  {choice.image && (
                    <div className="mt-2">
                      <ImageWithFallback 
                        src={choice.image} 
                        alt={`Choice ${idx + 1}`}
                        className="max-h-32 rounded-lg object-cover"
                      />
                    </div>
                  )}
                  {choice.video && (
                    <div className="mt-2">
                      <video 
                        src={getMediaUrl(choice.video)}
                        className="max-h-32 rounded-lg object-cover"
                        controls
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blank Busters Answer */}
        {questions[questionIdx]?.type === 'F' && (
          <div className="mb-4">
            <div className="font-mono text-xl tracking-wider text-[#4C53B4] bg-[#EEF1F5] p-4 rounded-xl text-center mb-4">
              {questions[questionIdx].pattern}
            </div>
            {questions[questionIdx].hint && (
              <div className="text-sm text-gray-500 mb-4">
                <span className="font-medium">Hint:</span> {questions[questionIdx].hint}
              </div>
            )}
            <h4 className="font-semibold text-gray-700 mb-2">Correct Answer:</h4>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              {questions[questionIdx].answer}
            </div>
          </div>
        )}

        {/* Drag and Drop Items */}
        {questions[questionIdx]?.type === 'D' && (
          <div className="mb-4">
            <div className="mb-4 p-4 bg-[#F7F9FC] rounded-lg border border-[#4C53B4]/10">
              {/* Sentence with Blanks */}
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                {(questions[questionIdx].sentence || '').split('_').map((part, index, array) => (
                  <span key={index}>
                    {part}
                    {index < array.length - 1 && (
                      <span className="inline-block min-w-[100px] h-8 mx-2 bg-[#EEF1F5] border-2 border-dashed border-[#4C53B4]/30 rounded-lg align-middle"></span>
                    )}
                  </span>
                ))}
              </div>
              {/* Available Words */}
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">Choices:</div>
                <div className="flex flex-wrap gap-2">
                  {[...(questions[questionIdx].dragItems || []), ...(questions[questionIdx].incorrectChoices || [])].map((item, i) => (
                    <div
                      key={i}
                      className={`px-4 py-2 rounded-lg text-sm font-medium 
                        ${item.isCorrect 
                          ? 'bg-[#4C53B4]/10 text-[#4C53B4] border-2 border-[#4C53B4]/20' 
                          : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                        }`}
                    >
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Memory Game Cards */}
        {questions[questionIdx]?.type === 'G' && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Memory Cards:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {questions[questionIdx].memoryCards?.map((card, idx) => {
                // Handle different media formats
                let mediaUrl = null;
                if (card.media) {
                  if (typeof card.media === 'string') {
                    // Media is stored as a string URL
                    mediaUrl = card.media;
                  } else if (typeof card.media === 'object' && card.media.url) {
                    // Media is stored as an object with url property
                    mediaUrl = card.media.url;
                  }
                }

                return (
                  <div key={idx} className="aspect-square bg-gray-50 border border-gray-200 rounded-lg p-2 flex flex-col items-center justify-center">
                    {mediaUrl && (
                      <ImageWithFallback 
                        src={mediaUrl} 
                        alt={card.content || `Card ${idx + 1}`}
                        className="max-h-32 max-w-full object-contain mb-2"
                      />
                    )}
                    {card.content && (
                      <span className="text-sm text-center">{card.content}</span>
                    )}
                    {!mediaUrl && !card.content && (
                      <span className="text-gray-400 text-sm">Empty Card</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Picture Word */}
        {questions[questionIdx]?.type === 'P' && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Pictures:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {questions[questionIdx].pictureWord?.map((pic, idx) => (
                <div key={idx} className="aspect-square bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                  {pic.media?.url && (
                    <ImageWithFallback 
                      src={pic.media.url} 
                      alt={`Picture ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
            <h4 className="font-semibold text-gray-700 mb-2">Correct Answer:</h4>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              {questions[questionIdx].answer}
            </div>
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 font-medium">Correct Answers</span>
            <span className="text-xs text-gray-600 font-bold">{stats.correctPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-500 h-2.5 rounded-full" 
              style={{ width: `${stats.correctPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Results Table */}
      <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-lg text-gray-700">Student Responses</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
             {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>*/}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
              {questionIdx === questions.length - 1 && (
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Points</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allDrillResults.length === 0 ? (
              <tr>
                <td colSpan={questionIdx === questions.length - 1 ? 5 : 4} className="text-center text-gray-400 py-8">
                  <div className="flex flex-col items-center">
                    <i className="fa-solid fa-inbox text-3xl mb-2 text-gray-300"></i>
                    No results yet for this question.
                  </div>
                </td>
              </tr>
            ) : (
              allDrillResults.map((drillResult) => {
                const questionResult = drillResult.question_results.find(
                  qr => qr.question_id === questions[questionIdx]?.id
                );
                
                if (!questionResult) return null;

                // Calculate total points by summing up all points_awarded
                const totalPoints = drillResult.question_results.reduce((sum, qr) => sum + (qr.points_awarded || 0), 0);

                return (
                  <tr key={drillResult.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-[#4C53B4] flex items-center justify-center text-white">
                          {drillResult.student.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{drillResult.student.name}</div>
                          <div className="text-sm text-gray-500">@{drillResult.student.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {questionResult.points_awarded}                    
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {questionResult.time_taken ? questionResult.time_taken.toFixed(1) : '-'}
                    </td> 
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(questionResult.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    {questionIdx === questions.length - 1 && (
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-sm text-green-500">
                        {totalPoints}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewDrillResults;
