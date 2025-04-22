import { useState } from 'react';
import Badge from '../assets/Badge.png';
import Points from '../assets/Points.png';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ user, onMenuClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const isTeacher = user?.role === 'teacher';

  //Logout Function
  const handleLogout = () => {
    setIsDropdownOpen(false);
    navigate('/logout');
  };

  return (
    <header className="h-16 bg-white w-full flex items-center justify-between px-4 shadow-md z-20 sticky top-0">
      {/* Menu Button (Mobile) */}
      <button 
        onClick={onMenuClick}
        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1"></div>

      {/* Right side - Stats and Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Only show badges and points for students */}
        {!isTeacher && (
          <>
            {/* Badge Count Box */}
            <div className="bg-white rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.05)] px-3 sm:px-4 py-2 flex items-center gap-2">
              <img src={Badge} alt="Badges" className="w-6 sm:w-7 h-6 sm:h-7" />
              <span className="text-gray-600 font-medium font-baloo text-sm sm:text-base">{user?.badges || 0}</span>
            </div>

            {/* Points Box */}
            <div className="bg-white rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.05)] px-3 sm:px-4 py-2 flex items-center gap-2">
              <img src={Points} alt="Points" className="w-6 sm:w-7 h-6 sm:h-7" />
              <span className="text-gray-600 font-medium font-baloo text-sm sm:text-base">{user?.points || 0}</span>
            </div>
          </>
        )}

        {/* Notification Box */}
        <div className="bg-white rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.05)] p-2">
          <button className="text-gray-600 hover:text-gray-800 transition-colors w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center">
            <i className="fa-regular fa-bell text-lg sm:text-xl"></i>
          </button>
        </div>

        {/* Profile */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 rounded-lg px-2 sm:px-3 py-2 sm:py-3 transition-colors group"
          >
            {user?.avatar ? ( // if user has an avatar, show it
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-7 sm:w-8 h-7 sm:h-8 rounded-full"
              />
            ) : (
              <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-[#4C53B4] flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.[0] || 'U'} {/* if user has no avatar, show the first letter of the name */}
              </div>
            )}
            <span className="text-gray-600 font-baloo text-sm sm:text-base hidden sm:block">{user?.first_name + " " + user?.last_name || 'User'}</span> {/* if user has no username, show 'User' */}
            <i className="fa-solid fa-chevron-down text-gray-400 group-hover:text-gray-600 transition-colors"></i>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg py-2 z-50 animate-fadeIn">
              <button 
                className="w-full px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-600 hover:text-[#4C53B4]"
              >
                <i className="fa-solid fa-user text-xs"></i>
                <span>Profile Settings</span>
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button 
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors text-red-500 hover:text-red-600"
              >
                <i className="fa-solid fa-right-from-bracket text-xs"></i>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar; 