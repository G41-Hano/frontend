import { NavLink } from 'react-router-dom';
import Home from '../assets/Home.png';
import MyClasses from '../assets/MyClasses.png';
import Badges from '../assets/Badges.png';
import Profile from '../assets/Profile.png';
import logo from '../assets/logo.png';
import { useUser } from '../contexts/UserContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useUser();
  
  const navItems = [
    { 
      icon: Home, 
      text: 'Home', 
      path: `/${user?.role === 'teacher' ? 't' : 's'}/home` 
    },
    { 
      icon: MyClasses, 
      text: user?.role === 'teacher' ? 'All Classes' : 'My Classes', 
      path: `/${user?.role === 'teacher' ? 't' : 's'}/classes` 
    },
    
    // Only show Badges for students
    ...(user?.role === 'student' ? [{
      icon: Badges, 
      text: 'Badges', 
      path: '/s/badges'
    }] : []),
    { 
      icon: Profile, 
      text: 'Profile', 
      path: `/${user?.role === 'teacher' ? 't' : 's'}/profile` 
    },
  ];

  return (
    <aside className={`
      fixed md:static w-[280px] lg:w-[320px] bg-[#9FD6F4] min-h-screen flex flex-col 
      transition-all duration-300 z-40 shrink-0 font-baloo
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      {/* Logo and Close Button */}
      <div className="p-6 flex items-center justify-between">
        <NavLink to={`/${user?.role === 'teacher' ? 't' : 's'}/home`} className="flex-1 flex justify-center">
          <img src={logo} alt="Hano Logo" className="w-32 md:w-40" />
        </NavLink>
        <button 
          onClick={onClose}
          className="md:hidden absolute right-4 top-4 p-2 hover:bg-[#8BC5E3] rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 mt-4 md:mt-8">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            onClick={() => onClose()}
            className={({ isActive }) => ` 
              relative flex items-center gap-6 md:gap-10 px-6 md:px-10 py-4 md:py-6 text-gray-700 
              transition-all duration-300 font-semibold
              ${isActive ? 'bg-[#FFDF9F] md:pl-12 rounded-r-lg md:mr-[-1rem] shadow-md' : 'hover:bg-[#8BC5E3]'} 
            `}
          >
            <img src={item.icon} alt={item.text} className="w-8 h-8 md:w-12 md:h-12" />
            <span className="text-base md:text-lg">{item.text}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;