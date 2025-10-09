import { Navigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import api from "../api"
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants"
import { useState, useEffect } from "react"
import { useUser } from "../contexts/UserContext"
import LoadingIndicator from "../components/LoadingIndicator"

/*
  This will protect the routes in case an unauthorized user to access out links
*/
export default function AuthRoute({children, requireAuth = true, requiredRole = null}) {
  const [isAuthorized, setIsAuthorized] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const { loginUser } = useUser()

  useEffect(()=>{
    const checkAuth = () => {
      const token = localStorage.getItem(ACCESS_TOKEN)
      // if no token exists == user is UNAUTHORIZED
      if (!token) {
        setIsAuthorized(false)
        return
      }

     try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        // token expired - but interceptor will refresh it automatically on next request
        setIsAuthorized(true);
      } else {
        setIsAuthorized(true);
      }
      setUserRole(decoded.role);
      loginUser(token);
    } catch {
      setIsAuthorized(false);
    }
    };
    checkAuth();
  }, [])

  if (isAuthorized === null) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4C53B4]"/>
      </div>
  }

  /*  requires the user to be authenticated before accessing children
      or else, it will navigate to login page 
  */
  if (requireAuth && !isAuthorized) {
    return <Navigate to="/login" />;
  }
  /*  when user is authenticated and accesses login/register,  
      navigate to home page
  */
  if (!requireAuth && isAuthorized) {
    if (userRole != null) {
      if (userRole === 'student') return <Navigate to="/s/home" />  //student home page
      if (userRole === 'teacher') return <Navigate to="/t/classes" /> //teacher home page
    }
    return
  }
  
  // check if the user accesses pages for his specific role only
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return children
}