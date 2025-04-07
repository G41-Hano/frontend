import { Routes, Route } from "react-router-dom"
import TeacherHome from "../pages/TeacherHome"

export default function TeacherRoutes() {
  return (
    <Routes>
      <Route path="/" element={<TeacherHome/>}/>
      
    </Routes>
  )
}