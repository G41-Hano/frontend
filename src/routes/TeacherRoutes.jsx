import { Routes, Route } from "react-router-dom"
import TeacherHome from "../pages/Teacher/TeacherHome"
import AllClasses from "../pages/Teacher/AllClasses"
import TeacherClassroom from "../pages/Teacher/TeacherClassroom"
import TakeDrill from "../pages/Student/TakeDrill"
import Profile from "../pages/Teacher/ProfileTeacher"
import TransferRequestList from '../pages/Teacher/TransferRequestList'

export default function TeacherRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TeacherHome/>}/>
      <Route path="/classes" element={<AllClasses />} /> 
      <Route path="/classes/:id" element={<TeacherClassroom />} />
      <Route path="/take-drill/:id" element={<TakeDrill />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="transfer-requests" element={<TransferRequestList />} />
    </Routes>
  )
}