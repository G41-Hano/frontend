import { Routes, Route } from 'react-router-dom';
import StudentHome from '../pages/Student/StudentHome';
import MyClasses from '../pages/Student/MyClasses';
import StudentClassroom from '../pages/Student/StudentClassroom';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<StudentHome />} /> 
      <Route path="/home" element={<MyClasses />} /> {/* TODO: Home page */}
      <Route path="/classes" element={<MyClasses />} /> 
      <Route path="/classes/:id" element={<StudentClassroom />} />
      <Route path="/badges" element={<MyClasses />} /> {/* TODO: Badges page */}
      <Route path="/profile" element={<MyClasses />} /> {/* TODO: Profile page */}
      <Route path="/settings" element={<MyClasses />} /> {/* TODO: Settings page */}
    </Routes>
  );
};

export default StudentRoutes;