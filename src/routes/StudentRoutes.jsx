import { Routes, Route } from 'react-router-dom';
import StudentHome from '../pages/Student/StudentHome';
import MyClasses from '../pages/Student/MyClasses';
import StudentClassroom from '../pages/Student/StudentClassroom';
import TakeDrill from '../pages/Student/TakeDrill';
import Profile from '../pages/Student/Profile';
import InteractiveLearning from '../components/InteractiveLearning';
import InteractiveModule from '../components/InteractiveModule';
import StoryBasedLearning from '../components/StoryBasedLearning';
import VocabularyAdventure from '../components/VocabularyAdventure';

const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<StudentHome />} /> 
      <Route path="/classes" element={<MyClasses />} /> 
      <Route path="/classes/:id" element={<StudentClassroom />} />
      <Route path="/take-drill/:id" element={<TakeDrill />} />
      <Route path="/profile" element={<Profile />} />

      {/*routes for testing only*/}
      <Route path="/interactive-learning" element={<InteractiveLearning />} />
      <Route path="/interactive-module" element={<InteractiveModule />} />
      <Route path="/story-based-learning" element={<StoryBasedLearning />} />
      <Route path="/vocabulary-adventure" element={<VocabularyAdventure />} />
    </Routes>
  );
};

export default StudentRoutes;