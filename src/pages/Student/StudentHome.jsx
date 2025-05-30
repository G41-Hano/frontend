import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import HippoHappy from '../../assets/HippoIdle.gif';
import api from '../../api';

const StudentHome = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);

  // Fetch badges
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        console.log('Fetching badges for user:', user.id);
        const response = await api.get('/api/badges/');
        console.log('Badges response:', response.data);
        setBadges(response.data);
      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      fetchBadges();
    }
  }, [user?.id]);

  // Placeholder data - replace with actual data fetching later
  const completedDrills = 24;
  const totalDrills = 30; // Example total
  const completedPercentage = (completedDrills / totalDrills) * 100;

  const vocabularyMastery = [
    { word: 'Sun', level: 80 },
    { word: 'Water', level: 60 },
    { word: 'Hello', level: 95 },
    { word: 'Tree', level: 75 },
  ];

  const recentlyLearnedWords = ['Tree', 'Flower', 'Puddle', 'Mango', 'Apple'];

  const commonlyMissedWords = [
    { word: 'Word A', count: 5 },
    { word: 'Word B', count: 3 },
    { word: 'Word C', count: 7 },
    { word: 'Word D', count: 4 },
    { word: 'Word E', count: 6 },
  ];

  const recentDrills = [
    { id: 1, name: 'Nature', points: 600 },
    { id: 2, name: 'Weather', points: 200 },
    { id: 3, name: 'School Objects', points: 400 },
    { id: 4, name: 'Shapes', points: 700 },
    { id: 5, name: 'Colors', points: 900 },
  ];


  return (
    <div className="p-8 bg-[#EEF1F5] min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto flex gap-8">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Greeting Card */}
          <div className="bg-[#FFDF9F] rounded-3xl p-8 shadow-lg flex items-center relative overflow-hidden">
             {/* Abstract shape from image */}
             <div className="absolute -right-20 -top-10 w-48 h-48 bg-white/20 rounded-full"></div>
             <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/20 rounded-full"></div>
            <div className="flex-shrink-0 mr-8">
              {/* Placeholder for Hippo Image */}
              <img src={HippoHappy} alt="Hippo" className="w-40 h-40 object-contain" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#4C53B4] mb-2">
                Hi, {user?.first_name || 'Student'}!
              </h1>
              <p className="text-lg text-gray-700">Let's learn something new today</p>
            </div>
          </div>

          {/* New Drill Notification */}
          <div className="bg-white rounded-2xl p-6 shadow-md flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-700">You have a new drill waiting for you, answer now?</p>
            <button onClick={() => navigate('/s/classes')} className="bg-[#D6F25A] text-[#4C53B4] font-bold px-6 py-2 rounded-full hover:bg-lime-400 transition">Do it Now</button>
          </div>

          {/* Stats Section (Completed Drills and Vocabulary Mastery) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Completed Drills */}
            <div className="bg-[#EE7B6D] rounded-2xl p-6 shadow-md text-white flex flex-col justify-between">
              <h3 className="text-xl font-bold mb-2">Completed Drills</h3>
              <div className="text-5xl font-extrabold mb-4">{completedDrills}</div>
              <div className="w-full bg-white/30 rounded-full h-3">
                <div className="bg-white h-3 rounded-full" style={{ width: `${completedPercentage}%` }}></div>
              </div>
            </div>

            {/* Vocabulary Mastery */}
            <div className="bg-[#8A2799] rounded-2xl p-6 shadow-md text-white">
              <h3 className="text-xl font-bold mb-4">Vocabulary Mastery</h3>
              <p className="text-sm mb-4">Frequency of Words where Students Excel</p>
              {/* Placeholder for Bar Chart */}
              <div className="space-y-2">
                {vocabularyMastery.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm font-medium w-16">{item.word}</span>
                    <div className="flex-1 bg-white/30 rounded-full h-4">
                       {/* Placeholder bar */} 
                      <div 
                         className="bg-[#C3FD65] h-4 rounded-full"
                         style={{ width: `${item.level}%` }} // Use level as percentage
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recently Learned Words and Commonly Missed Words */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recently Learned Words */}
            <div className="bg-[#C3FD65] rounded-2xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recently Learned Words</h3>
              <ul className="space-y-2 text-gray-700">
                {recentlyLearnedWords.map((word, index) => (
                  <li key={index} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">{word}</li>
                ))}
              </ul>
            </div>

            {/* Commonly Mastered vs. Commonly Missed Words */}
            <div className="bg-[#FFDF9F] rounded-2xl p-6 shadow-md">
               <h3 className="text-xl font-bold text-[#4C53B4] mb-4">Commonly Mastered vs. <span className="text-[#EE7B6D]">Commonly Missed</span> Words</h3>
              {/* Placeholder for Bar Chart */}
               <div className="flex items-end gap-2 h-40">
                  {commonlyMissedWords.map((word, index) => (
                     <div key={index} className="w-8 bg-[#4C53B4] rounded-t-md flex flex-col justify-end items-center" style={{ height: `${word.count * 10}%` }}>
                       {/* Optional: Add word text or count if needed */}
                     </div>
                  ))}
                   {/* Add some dummy bars for 'mastered' */} 
                   <div className="w-8 bg-[#C3FD65] rounded-t-md" style={{ height: '80%' }}></div>
                   <div className="w-8 bg-[#C3FD65] rounded-t-md" style={{ height: '70%' }}></div>
                   <div className="w-8 bg-[#C3FD65] rounded-t-md" style={{ height: '90%' }}></div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Area */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-8">
          {/* Recent Badges Section */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#e09b1a]">Recent Badges</h3>
              <button 
                onClick={() => navigate('/s/badges')}
                className="text-sm text-gray-500 hover:underline"
              >
                See More
              </button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4C53B4]"></div>
              </div>
            ) : badges.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No badges earned yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {badges.slice(0, 4).map((badge, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <img
                      src={badge.image}
                      alt={badge.name}
                      className="w-20 h-20 object-contain mb-2 drop-shadow-md"
                    />
                    <p className="text-xs font-semibold text-gray-700">{badge.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Drills Section */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
             <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#8A2799]">Recent Drills</h3>
               {/* Placeholder for See More link */}
              <button className="text-sm text-gray-500 hover:underline">See More</button>
            </div>
            <ul className="space-y-3">
               {recentDrills.map(drill => (
                  <li key={drill.id} className="flex items-center justify-between p-3 bg-[#EEF1F5] rounded-lg">
                     <span className="text-gray-700 text-sm font-medium">{drill.name}</span>
                     <span className="text-[#8A2799] font-bold text-sm">{drill.points}</span>
                  </li>
               ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Badge Details Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-[#8A2799] rounded-2xl shadow-2xl flex flex-col items-center relative animate-fadeIn"
            style={{
              width: '700px',
              maxWidth: '98vw',
              border: '6px solid #781B86',
              borderRadius: '32px',
              padding: '2.5rem 2.5rem 2rem 2.5rem',
            }}
          >
            <h2
              className="mb-0 text-center"
              style={{
                fontSize: '3.2rem',
                color: '#C3FD65',
                WebkitTextStroke: '2px #557423',
                textStroke: '2px #557423',
                fontWeight: 1000,
                letterSpacing: '1px',
                textShadow: '0 2px 8px #55742344',
              }}
            >
              Badge Earned!
            </h2>
            <p className="text-white text-center text-lg mt-0">Congratulations on earning this badge!</p>
            <div className="relative flex items-center justify-center mb-4" style={{ minHeight: '220px', minWidth: '220px' }}>
              <img
                src={selectedBadge.image}
                alt={selectedBadge.name}
                className="w-48 h-48 object-contain drop-shadow-lg relative z-10"
              />
            </div>
            <h3 className="text-3xl font-extrabold text-yellow-300 mb-2 text-center" style={{ fontSize: '2.5rem' }}>{selectedBadge.name}</h3>
            <p className="text-white text-center text-base mb-6" style={{ fontSize: '1rem' }}>{selectedBadge.description}</p>
            <button
              className="bg-[#FBE18F] text-[#7B3FA0] font-bold px-8 py-2 rounded-full shadow hover:bg-yellow-300 transition text-lg"
              onClick={() => setSelectedBadge(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHome;