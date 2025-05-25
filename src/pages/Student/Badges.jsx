import React, { useState, useEffect } from 'react';
import api from '../../api';

const Badges = ({ studentId }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        let response;
        if (studentId) {
          response = await api.get('/api/badges/student-badges/', { params: { student_id: studentId } });
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
        <div className="rounded-3xl p-8">
          <h1 className="text-5xl font-extrabold text-[#e09b1a] mb-2">Badges</h1>
          <div className="flex items-center mb-8">
            <span className="text-lg font-semibold text-gray-500 mr-4">Earned Badges</span>
            <div className="flex-1 h-1 bg-gray-300 rounded opacity-50"></div>
          </div>
          {loading ? (
            <div className="text-center text-gray-500 text-lg py-12">Loading...</div>
          ) : (
            <div className="flex flex-wrap gap-10 justify-start">
              {badges.length > 0 ? (
                badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center w-64"
                  >
                    <img
                      src={badge.image}
                      alt={badge.name}
                      className="w-40 h-40 object-contain mb-4"
                    />
                    <h2 className="text-xl font-bold text-gray-800 text-center mb-2">{badge.name}</h2>
                    <p className="text-gray-600 text-center text-sm">{badge.description}</p>
                  </div>
                ))
              ) : (
                <div className="w-full text-center text-gray-400 py-12">
                  <span role="img" aria-label="trophy" className="text-5xl">🏆</span>
                  <p className="mt-2">No badges earned yet. Keep practicing to earn badges!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Badges;
