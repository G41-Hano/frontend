import { Routes, Route } from "react-router-dom"
import StudentHome from "../pages/StudentHome"

export default function StudentRoutes() {
  return (
    <Routes>
      <Route path="/" element={<StudentHome/>}/>

    </Routes>
  )
}