import { Routes, Route } from 'react-router-dom';
import StudentHome from '../pages/Student/StudentHome';
import MyClasses from '../pages/Student/MyClasses';
import StudentClassroom from '../pages/Student/StudentClassroom';
import TakeDrill from '../pages/Student/TakeDrill';
import Profile from '../pages/Student/Profile';
import Badges from '../pages/Student/Badges';
import DrillLeaderboard from '../pages/Student/DrillLeaderboard';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="/home" element={<StudentHome />} /> 
      <Route path="/classes" element={<MyClasses />} /> 
      <Route path="/classes/:id" element={<StudentClassroom />} />
      <Route path="/take-drill/:id" element={<TakeDrill />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/badges" element={<Badges />} />
      <Route path="/s/drill/:id/leaderboard" element={<DrillLeaderboard />} />
    </Routes>
  );
};

export default StudentRoutes;