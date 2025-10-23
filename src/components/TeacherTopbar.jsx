import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import logo from '../assets/logo.png';
import api from '../api';

const TeacherTopbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, getNotificationPath, fetchNotifications } = useNotifications();
  
  // Refs for modal containers
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

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
    navigate('/t/profile');
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

  return (
    <header className="h-16 bg-[#4C53B4] w-full flex items-center justify-between px-4 shadow-md z-20 sticky top-0">
      {/* Logo */}
      <div className="flex items-center">
        <img src={logo} alt="Hano Logo" className="w-24 h-auto" />
      </div>

      <div className="flex-1"></div>

      {/* Right side - Notifications and Profile */}
      <div className="flex items-center gap-2 sm:gap-4 mr-2 sm:mr-4">
        {/* Notification Box */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="bg-white/10 hover:bg-white/20 rounded-xl p-2 relative transition-colors"
          >
            <i className="fa-regular fa-bell text-lg sm:text-xl text-white"></i>
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
            className="flex items-center gap-2 sm:gap-3 hover:bg-white/10 rounded-lg px-2 sm:px-3 py-2 sm:py-3 transition-colors group"
          >
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.first_name} 
                className="w-7 sm:w-8 h-7 sm:h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm">
                {user?.first_name?.[0] || 'U'}
              </div>
            )}
            <span className="text-white font-baloo text-sm sm:text-base hidden sm:block">
              {user?.first_name + " " + user?.last_name || 'User'}
            </span>
            <i className="fa-solid fa-chevron-down text-white/70 group-hover:text-white transition-colors"></i>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg py-2 z-50 animate-fadeIn md:right-0">
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

export default TeacherTopbar;
