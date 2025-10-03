
import React, { useEffect, useState } from 'react';
import sparkles from '../assets/sparkles.png';
import api from '../api';

const BadgeEarnedModal = ({ onViewBadges, onClose }) => {
  const [open, setOpen] = useState(false);
  const [badge, setBadge] = useState(null);

  useEffect(() => {
    // Fetch unread earned badge
    const fetchUnreadBadge = async () => {
      try {
        const res = await api.get('/api/badges/student-badges/');
        if (res.data && res.data.length > 0) {
          setBadge(res.data[0]);
          setOpen(true);
        } else {
          setOpen(false);
        }
      } catch (err) {
        setOpen(false);
      }
    };
    fetchUnreadBadge();
  }, []);

  if (!open || !badge) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="relative flex flex-col items-center justify-center rounded-[32px] border-8 p-0 animate-fadeIn"
        style={{
          background: '#8A2799',
          borderColor: '#781B86',
          width: '480px',
          height: '380px',
          maxWidth: '95vw',
          maxHeight: '95vh',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-8 relative">
          <h2 className="text-3xl font-extrabold text-white text-center mb-1" style={{fontFamily: 'Baloo, sans-serif'}}>Drill Completed</h2>
          <p className="text-white text-center mb-2 text-base font-semibold">Congratulations on finishing the drill!</p>
          <h3 className="text-2xl font-extrabold text-[#A6FF4D] text-center mb-2" style={{fontFamily: 'Baloo, sans-serif'}}>You have earned a badge!</h3>
          {/* Sparkles background */}
          <div className="relative flex justify-center items-center mb-2 mt-2 w-full" style={{height: '120px'}}>
            <img
              src={sparkles}
              alt="sparkles"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[120px] object-contain pointer-events-none select-none z-0"
              style={{filter: 'brightness(1.2)'}}
            />
            <img
              src={badge?.image}
              alt={badge?.name}
              className="relative w-36 h-36 object-contain drop-shadow-lg z-10"
              style={{marginTop: '10px'}}
            />
          </div>
          <div className="flex justify-center gap-6 mt-8 w-full">
            <button
              onClick={onViewBadges}
              className="bg-[#FBE18F] text-[#8A2799] font-bold px-8 py-2 rounded-full shadow hover:bg-yellow-300 transition text-lg w-44"
              style={{fontFamily: 'Baloo, sans-serif'}}>
              View Badges
            </button>
            <button
              onClick={() => { setOpen(false); if (onClose) onClose(); }}
              className="bg-[#FBE18F] text-[#8A2799] font-bold px-8 py-2 rounded-full shadow hover:bg-yellow-300 transition text-lg w-44"
              style={{fontFamily: 'Baloo, sans-serif'}}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeEarnedModal;