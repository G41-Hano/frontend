import { useState, useEffect, useRef } from 'react';
import Badge from '../assets/Badge.png';
import Points from '../assets/Points.png';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import api from '../api';

const Topbar = ({ onMenuClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);
  const [points, setPoints] = useState(0);
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, getNotificationPath, fetchNotifications } = useNotifications();
  const isTeacher = user?.role === 'teacher';
  
  // Refs for modal containers
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Fetch badge count and points for students
  useEffect(() => {
    if (!isTeacher && user?.id) {
      // Fetch badge count
      api.get('/api/badges/student-badges/', { params: { student_id: user.id } })
        .then(res => setBadgeCount(res.data.length))
        .catch(() => setBadgeCount(0));
      // Fetch all student points from new endpoint (plural)
      // Fetch all student points from new endpoint
      api.get('/api/badges/all-student-points/')
      .then(res => {
        // For students, res.data is a single object with total_points
        // For teachers, res.data is an array of student objects
        const points = isTeacher ? 0 : res.data.total_points || 0;
        setPoints(points);
      })
      .catch(() => setPoints(0));
          }
  }, [user, isTeacher]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close profile dropdown if clicking outside
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      
      // Close notification dropdown if clicking outside
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (typeof fetchNotifications === 'function') {
      fetchNotifications();
    }
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    navigate('/logout');
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    if (isTeacher){
      navigate('/t/profile');
    }else{
    navigate('/s/profile');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    const path = getNotificationPath(notification);
    if (path) {
      navigate(path);
    }
    setIsNotificationOpen(false);
  };

  // Call this function when a badge is earned
  const notifyBadge = async (badgeId) => {
    try {
      await api.post(`/api/badges/${badgeId}/notify_badge/`);
      // Optionally, show a toast or update notification state
    } catch (error) {
      console.error('Failed to notify badge:', error);
    }
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
      <div className="flex items-center gap-2 sm:gap-4 mr-2 sm:mr-4">
        {/* Only show badges and points for students */}
        {!isTeacher && (
          <>
            {/* Badge Count Box */}
            <div className="bg-white rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.05)] px-3 sm:px-4 py-2 flex items-center gap-2">
              <img src={Badge} alt="Badges" className="w-6 sm:w-7 h-6 sm:h-7" />
              <span className="text-gray-600 font-medium font-baloo text-sm sm:text-base">{badgeCount}</span>
            </div>

            {/* Points Box */}
            <div className="bg-white rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.05)] px-3 sm:px-4 py-2 flex items-center gap-2">
              <img src={Points} alt="Points" className="w-6 sm:w-7 h-6 sm:h-7" />
              <span className="text-gray-600 font-medium font-baloo text-sm sm:text-base">{points}</span>
            </div>
          </>
        )}

        {/* Notification Box */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="bg-white rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.05)] p-2 relative"
          >
            <i className="fa-regular fa-bell text-lg sm:text-xl text-gray-600"></i>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-100 shadow-lg py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 flex justify-between items-center border-b border-gray-100">
                <h3 className="font-medium text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-sm text-[#4C53B4] hover:text-[#4C53B4]/80"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      className="group relative"
                    >
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0
                          ${!notification.is_read ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${!notification.is_read ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                          <div>
                            <p className="text-sm text-gray-800">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 rounded-lg px-2 sm:px-3 py-2 sm:py-3 transition-colors group"
          >
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.first_name} 
                className="w-7 sm:w-8 h-7 sm:h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-[#4C53B4] flex items-center justify-center text-white font-semibold text-sm">
                {user?.first_name?.[0] || 'U'}
              </div>
            )}
            <span className="text-gray-600 font-baloo text-sm sm:text-base hidden sm:block">
              {user?.first_name + " " + user?.last_name || 'User'}
            </span>
            <i className="fa-solid fa-chevron-down text-gray-400 group-hover:text-gray-600 transition-colors"></i>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg py-2 z-50 animate-fadeIn">
              <button 
                onClick={handleProfileClick}
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