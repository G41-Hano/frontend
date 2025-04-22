import { Routes, Route } from "react-router-dom"
import TeacherHome from "../pages/TeacherHome"
import AllClasses from "../pages/Teacher/AllClasses"

export default function TeacherRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TeacherHome/>}/>
      <Route path="/classes" element={<AllClasses />} /> 
    </Routes>
  )
}