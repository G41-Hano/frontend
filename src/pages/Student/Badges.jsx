import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import sparkle from '../../assets/sparkles.png'; // Assuming the sparkle asset is named sparkle.png

const Badges = ({ studentId }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBadge, setHoveredBadge] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        let response;
        if (studentId) {
          response = await api.get('/api/badges/earned_badges/', { params: { student_id: studentId } });
        } else {
          response = await api.get('/api/badges/');
        }
        setBadges(response.data);
      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, [studentId]);

  return (
    <div className="min-h-screen p-6 bg-transparent">
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4C53B4]"></div>
          </div>
        ) : badges.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] w-full animate-fadeIn">
            <h2 className="text-5xl font-extrabold text-[#e09b1a] mb-2 drop-shadow-sm ">No Badges yet?</h2>
            <p className="text-xl text-gray-800 mb-8 font-semibold animate-pulse">Let's keep learning to earn your first batch!</p>
            <div className="bg-[#DE6C62] rounded-2xl px-8 py-8 mb-8 max-w-2xl w-full text-center animate-wiggle">
              <p className="text-white font-extrabold text-2xl mb-2">Stay motivated!</p>
              <p className="text-white font-bold text-lg mb-2">Every drill you complete brings you closer to earning badges.</p>
              <p className="text-white font-bold text-lg">Keep going—you can do it!</p>
            </div>
            <div className="bg-[#7B3FA0] rounded-2xl px-8 py-6 max-w-xl w-full text-center mb-4">
              <p className="text-white font-semibold text-lg mb-4">You have a new vocabulary drill waiting. Take it now to update your progress!</p>
              <button className="bg-[#D6F25A] text-black font-bold px-6 py-2 rounded-full shadow hover:bg-lime-400 transition animate-wiggle" onClick={() => navigate('/s/classes')}>START DRILL</button>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-3xl p-8">
              <h1 className="text-5xl font-extrabold text-[#e09b1a] mb-2">Badges</h1>
              <div className="flex items-center mb-8">
                <span className="text-lg font-semibold text-gray-500 mr-4">Earned Badges</span>
                <div className="flex-1 h-1 bg-gray-300 rounded opacity-50"></div>
              </div>
              <div className="flex flex-wrap gap-10 justify-start">
                {badges.map((badge, idx) => (
                  <div
                    className={`flex flex-col items-center w-64 transition-transform duration-300 ${
                      hoveredBadge === idx ? 'scale-110 animate-bounce' : ''
                    }`}
                    key={idx}
                    onMouseEnter={() => setHoveredBadge(idx)}
                    onMouseLeave={() => setHoveredBadge(null)}
                    onClick={() => setSelectedBadge(badge)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={badge.image}
                      alt={badge.name}
                      className="w-40 h-40 object-contain mb-4 drop-shadow-lg"
                    />
                    <h2 className="text-xl font-bold text-gray-800 text-center mb-2">{badge.name}</h2>
                    <p className="text-gray-600 text-center text-sm">{badge.description}</p>
                  </div>
                ))}
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
                    {/* Sparkles - left and right, even bigger */}
                    <img src={sparkle} alt="sparkle" className="absolute left-[-110px] top-1/2 -translate-y-1/2 w-40 h-40" style={{transform: 'rotate(-10deg)'}} />
                    <img src={sparkle} alt="sparkle" className="absolute right-[-110px] top-1/2 -translate-y-1/2 w-40 h-40" style={{transform: 'rotate(10deg)'}} />
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
          </>
        )}
      </div>
    </div>
  );
};

export default Badges;
