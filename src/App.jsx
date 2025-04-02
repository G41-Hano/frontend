import react from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

function logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoute><>Home</></ProtectedRoute>} />
        <Route path="/login" element={<div className="mx-auto">Login</div>} />
        <Route path="/register" element={<>Register</>} />
        <Route path="*" element={<>Not Found</>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
