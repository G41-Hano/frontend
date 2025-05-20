import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Realistic mock data
const generateMockResults = (questionCount, studentCount) => {
  const studentNames = [
    { name: 'Emma Johnson', username: 'emma.j' },
    { name: 'Liam Smith', username: 'l.smith' },
    { name: 'Olivia Davis', username: 'olivia22' },
    { name: 'Noah Wilson', username: 'noah_w' },
    { name: 'Ava Brown', username: 'ava.brown' },
    { name: 'William Taylor', username: 'will_t' },
    { name: 'Sophia Martinez', username: 'sophia_m' },
    { name: 'James Anderson', username: 'j.anderson' },
    { name: 'Isabella Thomas', username: 'bella_t' },
    { name: 'Benjamin Lee', username: 'ben.lee' }
  ];

  const selectedStudents = studentNames.slice(0, studentCount);
  
  // Generate results for each question
  return Array(questionCount).fill(null).map(() => {
    // For each question, generate a result for each student
    return selectedStudents.map(student => {
      const correct = Math.random() > 0.3; // 70% chance of correct answer
      const timeSpent = (Math.random() * 2 + 0.5).toFixed(1); // Between 0.5 and 2.5 minutes
      
      return {
        student: student.name,
        username: student.username,
        answer: correct ? 'Correct' : 'Incorrect',
        isCorrect: correct,
        time: timeSpent,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString() // Random time in last 24h
      };
    });
  });
};

// Mock drill data
const mockDrill = {
  id: 1,
  title: "Sign Language Basics",
  status: "published",
  questions: [
    {
      id: 1,
      text: "What is the sign for 'Hello'?",
      image: "https://images.unsplash.com/photo-1508780709619-79562169bc64?w=600&auto=format&fit=crop&q=60",
      options: ["A", "B", "C", "D"],
      correct_answer: "A"
    },
    {
      id: 2,
      text: "What is the sign for 'Thank you'?",
      image: "https://images.unsplash.com/photo-1516383740770-fbcc5ccbece0?w=600&auto=format&fit=crop&q=60",
      options: ["A", "B", "C", "D"],
      correct_answer: "B"
    },
    {
      id: 3,
      text: "What is the sign for 'Please'?",
      image: "https://images.unsplash.com/photo-1508002366005-75a695ee2d17?w=600&auto=format&fit=crop&q=60",
      options: ["A", "B", "C", "D"],
      correct_answer: "C"
    },
    {
      id: 4,
      text: "What is the sign for 'Sorry'?",
      image: "https://images.unsplash.com/photo-1574879948818-1cfda7aa5b1a?w=600&auto=format&fit=crop&q=60",
      options: ["A", "B", "C", "D"],
      correct_answer: "D"
    },
    {
      id: 5,
      text: "What is the sign for 'Good'?",
      image: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&auto=format&fit=crop&q=60",
      options: ["A", "B", "C", "D"],
      correct_answer: "A"
    }
  ]
};

const ViewDrillResults = () => {
  const { drillId } = useParams();
  const navigate = useNavigate();
  const [drill, setDrill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [results, setResults] = useState([]); // Per question
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, avgTime: 0 });

  useEffect(() => {
    // Simulate API call with timeout
    const timer = setTimeout(() => {
      try {
        // Use mock drill data instead of API call
        setDrill(mockDrill);
        
        // Generate mock results based on number of questions
        const mockResults = generateMockResults(
          mockDrill.questions.length, 
          Math.floor(Math.random() * 5) + 3 // 3-7 students
        );
        setResults(mockResults);
        
        setLoading(false);
      } catch (err) {
        console.error('Error generating mock data:', err);
        setError('Failed to load drill results. Please try again.');
        setLoading(false);
      }
    }, 800); // Simulate network delay
    
    return () => clearTimeout(timer);
  }, [drillId]);

  // Calculate stats when question index or results change
  useEffect(() => {
    if (results.length === 0 || !results[questionIdx]) return;
    
    const currentResults = results[questionIdx];
    const correct = currentResults.filter(r => r.isCorrect).length;
    const incorrect = currentResults.length - correct;
    const totalTime = currentResults.reduce((sum, r) => sum + parseFloat(r.time), 0);
    const avgTime = totalTime / currentResults.length;
    
    setStats({
      correct,
      incorrect,
      avgTime: avgTime.toFixed(1),
      correctPercentage: Math.round((correct / currentResults.length) * 100)
    });
  }, [questionIdx, results]);

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
  const currentResults = results[questionIdx] || [];

  const ImageWithFallback = ({ src, alt, className }) => {
    const [error, setError] = useState(false);
    
    return error ? (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <i className="fa-solid fa-image text-gray-400 text-4xl"></i>
      </div>
    ) : (
      <img 
        src={src} 
        alt={alt} 
        className={className}
        onError={() => setError(true)}
      />
    );
  };

  return (
    <div className="p-8 animate-fadeIn">
      {/* Large Header Banner */}
      <div className="bg-[#4C53B4] text-white p-6 rounded-xl shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-white/5 rounded-full"></div>
        
        <div className="flex items-center justify-between relative">
          <div>
            <h1 className="text-3xl font-bold mb-1">Drill Results</h1>
            <h2 className="text-xl font-medium mb-2">{drill.title}</h2>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span><i className="fa-solid fa-calendar-days mr-1"></i> Created: {new Date().toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span><i className="fa-solid fa-user-group mr-1"></i> {currentResults.length} Students</span>
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
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#F7F9FC] p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Total Students</div>
          <div className="text-2xl font-bold text-gray-800">{currentResults.length}</div>
        </div>
        <div className="bg-[#F0FFF4] p-4 rounded-xl border border-green-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Correct Answers</div>
          <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
        </div>
        <div className="bg-[#FFF5F5] p-4 rounded-xl border border-red-100 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Incorrect Answers</div>
          <div className="text-2xl font-bold text-red-500">{stats.incorrect}</div>
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
        
        {questions[questionIdx]?.image && (
          <div className="mb-4 flex justify-center">
            <ImageWithFallback 
              src={questions[questionIdx].image} 
              alt={`Question ${questionIdx + 1}`} 
              className="max-h-64 rounded-lg shadow object-cover"
            />
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time (min)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentResults.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-8">
                  <div className="flex flex-col items-center">
                    <i className="fa-solid fa-inbox text-3xl mb-2 text-gray-300"></i>
                    No results yet for this question.
                  </div>
                </td>
              </tr>
            ) : (
              currentResults.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[#4C53B4] flex items-center justify-center text-white">
                        {r.student.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{r.student}</div>
                        <div className="text-sm text-gray-500">@{r.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      r.isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {r.answer}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {r.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewDrillResults;
