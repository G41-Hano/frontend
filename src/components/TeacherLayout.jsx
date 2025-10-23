import { Outlet } from 'react-router-dom';
import TeacherTopbar from './TeacherTopbar';
import { useUser } from '../contexts/UserContext';

const TeacherLayout = () => {
  const { user } = useUser();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Topbar */}
      <TeacherTopbar user={user} />
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#EEF1F5] pt-6">
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;
