import React, { useEffect, useState } from 'react';
import sparkles from '../assets/sparkles.png';
import api from '../api';

const BadgeEarnedModal = ({ onViewBadges, onClose, badgeId }) => {
  const [open, setOpen] = useState(false);
  const [badges, setBadges] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Fetch all unread badges on mount
  useEffect(() => {
    const fetchUnreadBadges = async () => {
      try {
        const res = await api.get('/api/badges/unread-earned/');
        if (res.data && res.data.length > 0) {
          setBadges(res.data);
          // If badgeId is provided, find its index, else default to 0
          if (badgeId) {
            const idx = res.data.findIndex(b => String(b.id) === String(badgeId));
            setCurrentIdx(idx >= 0 ? idx : 0);
          } else {
            setCurrentIdx(0);
          }
          setOpen(true);
        } else {
          setBadges([]);
          setOpen(false);
        }
      } catch (err) {
        setBadges([]);
        setOpen(false);
      }
    };
    fetchUnreadBadges();
  }, [badgeId]);

  const handleClose = async () => {
    const badge = badges[currentIdx];
    if (badge && badge.badge && badge.badge.id) {
      const badgeId = badge.badge.id;
      const notifsForBadge = badges.filter(b => b.badge && b.badge.id === badgeId);
      for (const notif of notifsForBadge) {
        await api.post(`/api/notifications/${notif.id}/mark-as-read/`);
      }
    }
    if (currentIdx < badges.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setOpen(false);
      setBadges([]);
      if (onClose) onClose();
    }
  };

  if (!open || !badges.length) return null;
  const badge = badges[currentIdx];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-1000">
      <div
        className="relative flex flex-col items-center justify-center rounded-[32px] border-8 p-0 animate-fadeIn"
        style={{
          background: '#8A2799',
          borderColor: '#781B86',
          minWidth: '420px',
          minHeight: '220px',
          maxWidth: '650px',
          width: '100%',
          maxHeight: '95vh',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-8 relative">
          <h2 className="text-3xl font-extrabold text-white text-center mb-1" style={{fontFamily: 'Baloo, sans-serif'}}>Drill Completed</h2>
          <p className="text-white text-center mb-2 text-base font-semibold">Congratulations on finishing the drill!</p>
          <h3 className="text-2xl font-extrabold text-[#A6FF4D] text-center mb-2" style={{fontFamily: 'Baloo, sans-serif'}}>You have earned a badge!</h3>
          <div className="flex flex-col items-center mb-2 mt-2 w-full">
            <div className="relative flex flex-row items-center justify-center gap-4" style={{minHeight: '220px'}}>
              <img
                src={sparkles}
                alt="sparkles"
                className="absolute left-[-90px] top-1/2 -translate-y-1/2 w-[150px] h-[150px] object-contain pointer-events-none select-none animate-spin-slow"
                style={{filter: 'brightness(1.2)', border: 'none', zIndex: 1}}
              />
              <img
                src={sparkles}
                alt="sparkles"
                className="absolute right-[-90px] top-1/2 -translate-y-1/2 w-[150px] h-[150px] object-contain pointer-events-none select-none animate-spin-slow-reverse"
                style={{filter: 'brightness(1.2)', border: 'none', zIndex: 1}}
              />
              {/* Badge image */}
              <img
                src={badge?.badge?.image_url}
                alt={badge?.badge?.name}
                className="w-52 h-52 object-contain drop-shadow-lg z-10"
                style={{marginTop: '10px'}}
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/120x120?text=No+Image';
                }}
              />
            </div>
            <div className="mt-2 text-center">
              <span className="block text-2xl font-extrabold text-white" style={{fontFamily: 'Baloo, sans-serif'}}>
                {badge?.badge?.name}
              </span>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-8 w-full">
            <button
              onClick={onViewBadges}
              className="bg-[#FBE18F] text-[#8A2799] font-bold px-8 py-2 rounded-full shadow hover:bg-yellow-300 transition text-lg w-44"
              style={{fontFamily: 'Baloo, sans-serif'}}>
              View Badges
            </button>
            <button
              onClick={handleClose}
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