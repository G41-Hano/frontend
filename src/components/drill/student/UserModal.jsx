import React from 'react';

const UserModal = ({ user, onClose }) => {
  if (!user) return null;
  
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-xl min-w-[320px] relative animate-scaleIn">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#e09b1a]">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#4C53B4] font-bold text-3xl flex items-center justify-center h-full">{user.name?.[0]?.toUpperCase() || '?'}</span>
            )}
          </div>
          <div className="text-2xl font-bold text-[#4C53B4]">{user.name}</div>
          <div className="text-lg text-gray-700">Points: <span className="font-bold text-[#e09b1a]">{user.points}</span></div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
