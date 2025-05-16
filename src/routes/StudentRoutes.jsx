import { Routes, Route } from 'react-router-dom';
import StudentHome from '../pages/Student/StudentHome';
import MyClasses from '../pages/Student/MyClasses';
import StudentClassroom from '../pages/Student/StudentClassroom';
import TakeDrill from '../pages/Student/TakeDrill';
import Profile from '../pages/Student/Profile';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<StudentHome />} /> 
      <Route path="/classes" element={<MyClasses />} /> 
      <Route path="/classes/:id" element={<StudentClassroom />} />
      <Route path="/take-drill/:id" element={<TakeDrill />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
};

export default StudentRoutes;