import React from 'react';
import { Tooltip } from 'react-tooltip';
import rank1 from '../../../assets/rank1.png';
import rank2 from '../../../assets/rank2.png';
import rank3 from '../../../assets/rank3.png';

const Podium = ({ drillLeaderboard, onUserSelect }) => {
  return (
    <div className="flex justify-center items-end gap-4 mb-6">
      {[1, 0, 2].map((idx, pos) => {
        const student = drillLeaderboard[idx];
        if (!student) return <div key={pos} className="w-20" />;
        const rank = pos === 0 ? 2 : pos === 1 ? 1 : 3;
        const rankImages = [rank2, rank1, rank3];
        const size = pos === 1 ? 'w-36 h-36' : 'w-32 h-32';

        return (
          <div
            key={student.id}
            className={`flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105 group`}
            onClick={() => onUserSelect(student)}
            data-tooltip-id={`podium-tip-${student.id}`}
          >
            <div className={`relative ${size} flex items-center justify-center`}>
              <img src={rankImages[pos]} alt={`Rank ${rank}`} className="absolute inset-0 w-full h-full z-10 pointer-events-none" />
              <div className={`relative ${pos === 1 ? 'w-25 h-25' : 'w-22 h-22'} rounded-full overflow-hidden flex items-center justify-center mt-2.5`}>
                {student.avatar ? (
                  <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#4C53B4] font-bold text-lg">{student.name?.[0]?.toUpperCase() || '?'}</span>   
                )}
              </div>
            </div>
            <div className={`mt-2 text-center ${pos === 1 ? 'font-extrabold text-base' : 'font-bold text-sm'} text-gray-800 group-hover:text-[#e09b1a]`}>
              {student.name}
            </div>
            <div className="text-center text-gray-600 font-bold text-sm">{student.points || student.totalPoints}</div>
            <Tooltip id={`podium-tip-${student.id}`} place="top">
              <span>{student.name}<br/>Points: {student.points || student.totalPoints}</span>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
};

export default Podium;
