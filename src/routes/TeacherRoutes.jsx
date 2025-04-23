import { Routes, Route } from "react-router-dom"
import TeacherHome from "../pages/Teacher/TeacherHome"
import AllClasses from "../pages/Teacher/AllClasses"
import TeacherClassroom from "../pages/Teacher/TeacherClassroom"

export default function TeacherRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TeacherHome/>}/>
      <Route path="/classes" element={<AllClasses />} /> 
      <Route path="/classes/:id" element={<TeacherClassroom />} />
    </Routes>
  )
}