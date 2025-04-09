import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from "./pages/Login"
import Register from "./pages/Register"
import AuthRoute from './routes/AuthRoute'
import StudentRoutes from './routes/StudentRoutes'
import TeacherRoutes from './routes/TeacherRoutes'
import PasswordReset from './pages/PasswordReset'
import NewPassword from './pages/NewPassword'

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login"/>}/>

        <Route 
          path="/s/*" 
          element={
            <AuthRoute requiredRole="student">
              <StudentRoutes />
            </AuthRoute>
          } 
        />
        <Route 
          path="/t/*" 
          element={
            <AuthRoute requiredRole="teacher">
              <TeacherRoutes />
            </AuthRoute>
          } 
        />
        <Route path="/login" element={<AuthRoute requireAuth={false}><Login /></AuthRoute>} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<AuthRoute requireAuth={false}><RegisterAndLogout /></AuthRoute>} />
        <Route path="/register/teacher" element={<AuthRoute requireAuth={false}><RegisterAndLogout /></AuthRoute>} />
        <Route path="/reset-password" element={<AuthRoute requireAuth={false}><PasswordReset /></AuthRoute>} />
        <Route path="/new-password" element={<AuthRoute requireAuth={false}><NewPassword /></AuthRoute>} />
        <Route path="*" element={<>Not Found</>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
