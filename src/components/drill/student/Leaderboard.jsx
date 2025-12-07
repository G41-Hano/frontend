import React from 'react';
import { Tooltip } from "react-tooltip";
import Podium from './Podium';

const Leaderboard = ({ 
  drillLeaderboard, 
  loadingLeaderboard, 
  leaderboardError, 
  onUserSelect 
}) => {
  return (
      <>
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
            <Podium drillLeaderboard={drillLeaderboard} onUserSelect={onUserSelect} />
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
      </>
  );
};

export default Leaderboard;
