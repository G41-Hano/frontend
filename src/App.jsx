import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from "./pages/Login"
import Register from "./pages/Register"
import Logout from "./pages/LogOut"
import AuthRoute from './routes/AuthRoute'
import StudentRoutes from './routes/StudentRoutes'
import TeacherRoutes from './routes/TeacherRoutes'
import PasswordReset from './pages/PasswordReset'
import NewPassword from './pages/NewPassword'
import DashboardLayout from './components/DashboardLayout'
import TeacherLayout from './components/TeacherLayout'
import { UserProvider } from './contexts/UserContext'
import { ClassroomPreferencesProvider } from './contexts/ClassroomPreferencesContext'
import { SuccessModalProvider } from './contexts/SuccessModalContext'
import { NotificationProvider } from './contexts/NotificationContext'
import SuccessModal from './components/SuccessModal'
import DrillLeaderboard from './pages/Student/DrillLeaderboard'

function RegisterAndLogout() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  return <Register />
}

function App() {
  return (
    <SuccessModalProvider>
      <UserProvider>
        <NotificationProvider>
        <ClassroomPreferencesProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/login"/>}/>
              <Route path="/login" element={<AuthRoute requireAuth={false}><Login /></AuthRoute>} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/logout-ex" element={<Logout session_expired={true}/>} />
              <Route path="/register" element={<AuthRoute requireAuth={false}><RegisterAndLogout /></AuthRoute>} />
              <Route path="/register/teacher" element={<AuthRoute requireAuth={false}><RegisterAndLogout /></AuthRoute>} />
              <Route path="/request-password-reset" element={<AuthRoute requireAuth={false}><PasswordReset /></AuthRoute>} />
              <Route path="/reset-password/:token" element={<AuthRoute requireAuth={false}><NewPassword /></AuthRoute>} />


              {/* Student Routes */}
              <Route path="/s" element={
                <AuthRoute requiredRole="student">
                  <DashboardLayout />
                </AuthRoute>
              }>
                <Route path="*" element={<StudentRoutes />} />
                <Route path="drill/:id/leaderboard" element={<DrillLeaderboard />} />
              </Route>

              {/* Teacher Routes */}
              <Route path="/t" element={
                <AuthRoute requiredRole="teacher">
                  <DashboardLayout />
                </AuthRoute>
              }>
                <Route path="*" element={<TeacherRoutes />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EEF1F5] to-[#E6E9FF] p-4">
                  <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-xl max-w-md w-full text-center relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#FFDF9F]/30 blur-2xl"></div>
                    <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#4C53B4]/20 blur-2xl"></div>
                    
                    <div className="relative">
                      <div className="w-24 h-24 mx-auto mb-6 bg-[#FFDF9F] rounded-2xl flex items-center justify-center transform -rotate-12">
                        <span className="text-5xl font-bold text-[#4C53B4]">?</span>
                      </div>
                      
                      <h1 className="text-6xl font-bold text-[#4C53B4] mb-4">404</h1>
                      <p className="text-gray-600 text-lg mb-8">Oops! This page seems to be playing hide and seek.</p>
                      
                      <a 
                        href="/login" 
                        className="inline-flex items-center justify-center px-6 py-3 bg-[#4C53B4] text-white font-semibold rounded-xl hover:bg-[#6366f1] transition-colors duration-200 gap-2 group"
                      >
                        <i className="fa-solid fa-arrow-left text-sm group-hover:-translate-x-1 transition-transform"></i>
                        Back to Login
                      </a>
                    </div>
                  </div>
                </div>
              }/>
            </Routes>
            <SuccessModal />
          </BrowserRouter>
        </ClassroomPreferencesProvider>
        </NotificationProvider>
      </UserProvider>
    </SuccessModalProvider>
  )
}

export default App