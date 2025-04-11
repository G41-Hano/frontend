import { Routes, Route } from 'react-router-dom';
import StudentHome from '../pages/StudentHome';
import MyClasses from '../pages/MyClasses';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<StudentHome />} /> 
      <Route path="/home" element={<MyClasses />} /> {/* TODO: Home page */}
      <Route path="/classes" element={<MyClasses />} /> 
      <Route path="/badges" element={<MyClasses />} /> {/* TODO: Badges page */}
      <Route path="/profile" element={<MyClasses />} /> {/* TODO: Profile page */}
      <Route path="/settings" element={<MyClasses />} /> {/* TODO: Settings page */}
    </Routes>
  );
};

export default StudentRoutes;