import React from 'react';
import { Tooltip } from "react-tooltip";

const Leaderboard = ({ 
  drillLeaderboard, 
  loadingLeaderboard, 
  leaderboardError, 
  onUserSelect 
}) => {
  return (
    <div className="fixed bottom-8 right-8 w-[370px] min-h-[400px] bg-white/90 rounded-2xl shadow-2xl border-2 border-gray-100 p-6 flex flex-col items-center animate-fadeIn z-20">
      <h3 className="text-2xl font-extrabold text-[#e09b1a] text-center mb-4 tracking-wide flex items-center justify-center gap-2">
        <span>Leaderboard</span>
      </h3>
      {loadingLeaderboard ? (
        <div className="text-center text-gray-500 py-12">Loading...</div>
      ) : leaderboardError ? (
        <div className="text-center text-red-500 py-12">{leaderboardError}</div>
      ) : drillLeaderboard.length === 0 ? (
        <div className="text-center text-gray-400 py-12">No students have attempted this drill yet.</div>
      ) : (
        <div className="w-full">
          {/* Top 3 Podium */}
          <div className="flex justify-center items-end gap-4 mb-6">
            {[1, 0, 2].map((idx, pos) => {
              const student = drillLeaderboard[idx];
              if (!student) return <div key={pos} className="w-20" />;
              const rank = pos === 0 ? 2 : pos === 1 ? 1 : 3;
              const borderColors = [
                'border-purple-400',
                'border-yellow-400',
                'border-orange-400'
              ];
              const size = pos === 1 ? 'w-20 h-20' : 'w-14 h-14';
              const ring = pos === 1 ? 'ring-4 ring-yellow-300' : '';
              return (
                <div
                  key={student.id}
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105 group`}
                  onClick={() => onUserSelect(student)}
                  data-tip data-for={`podium-tip-${student.id}`}
                >
                  <div className="flex flex-col items-center mb-1">
                    <span className={`font-extrabold text-lg ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-purple-400' : 'text-orange-400'}`}>{rank}</span>
                    {rank === 1 && (
                      <span className="-mt-1 text-yellow-400 text-2xl drop-shadow-lg">👑</span>
                    )}
                  </div>
                  <div className={`relative ${size} rounded-full overflow-hidden border-4 ${borderColors[pos]} bg-white flex items-center justify-center ${ring} group-hover:ring-4 group-hover:ring-[#e09b1a]`}>
                    {student.avatar ? (
                      <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#4C53B4] font-bold text-lg">{student.name?.[0]?.toUpperCase() || '?'}</span>
                    )}
                  </div>
                  <div className={`mt-2 text-center ${pos === 1 ? 'font-extrabold text-base' : 'font-bold text-sm'} text-gray-800 group-hover:text-[#e09b1a]`}>
                    {student.name}
                  </div>
                  <div className="text-center text-gray-600 font-bold text-sm">{student.points}</div>
                  <Tooltip id={`podium-tip-${student.id}`} effect="solid" place="top">
                    <span>{student.name}<br/>Points: {student.points}</span>
                  </Tooltip>
                </div>
              );
            })}
          </div>
          {/* Table for the rest */}
          <div className="w-full bg-white/80 rounded-xl shadow p-2">
            <div className="flex font-bold text-[#e09b1a] text-base mb-1">
              <div className="flex-1">NAME</div>
              <div className="w-16 text-right">PTS</div>
            </div>
            {drillLeaderboard.slice(3).map((student) => (
              <div
                key={student.id}
                className="flex items-center border-t border-gray-200 py-1 cursor-pointer transition-all duration-150 hover:bg-[#fffbe6] hover:scale-[1.01]"
                onClick={() => onUserSelect(student)}
                data-tip data-for={`row-tip-${student.id}`}
              >
                <div className="flex-1 font-semibold text-gray-700 text-sm hover:text-[#e09b1a]">{student.name}</div>
                <div className="w-16 text-right font-bold text-gray-700 text-sm">{student.points}</div>
                <Tooltip id={`row-tip-${student.id}`} effect="solid" place="top">
                  <span>{student.name}<br/>Points: {student.points}</span>
                </Tooltip>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
