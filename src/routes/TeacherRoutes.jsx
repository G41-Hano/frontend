import { Routes, Route } from "react-router-dom"
import TeacherHome from "../pages/TeacherHome"
import AllClasses from "../pages/Teacher/AllClasses"
import Classroom from "../pages/Teacher/Classroom"

export default function TeacherRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TeacherHome/>}/>
      <Route path="/classes" element={<AllClasses />} /> 
      <Route path="/classes/:id" element={<Classroom />} />
    </Routes>
  )
}