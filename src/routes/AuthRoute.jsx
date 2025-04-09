import { Navigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import api from "../api"
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants"
import { useState, useEffect } from "react"

/*
  This will protect the routes in case an unauthorized user to access out links
*/
export default function AuthRoute({children, requireAuth = true, requiredRole = null}) {
  const [isAuthorized, setIsAuthorized] = useState(null)
  const [userRole, setUserRole] = useState(null)

  useEffect(()=>{
    auth().catch(() => setIsAuthorized(false))
  }, [])

  // refreshes the token 
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN)
    try {
      const res = await api.post("/api/token/refresh/", {
        refresh: refreshToken,
      })
      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access)
        setIsAuthorized(true)
      }
      else {
        setIsAuthorized(false)
      }
    } 
    catch (error) {
      console.log(error)
      setIsAuthorized(false)
    }
  }

  // 
  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN)

    // if a token does not exist => UNAUTHORIZED
    if (!token) {
      setIsAuthorized(false)
      return
    }
    const decoded = jwtDecode(token)
    const tokenExpiration = decoded.exp
    setUserRole(decoded.role)
    const now = Date.now() / 1000

    if (tokenExpiration < now) {
      await refreshToken()
    } else {
      setIsAuthorized(true)
    }    

  }

  if (isAuthorized === null) {
    return <div>Loading...</div>
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
      if (userRole === 'student') return <Navigate to="/s" />  //student home page
      if (userRole === 'teacher') return <Navigate to="/t" /> //teacher home page
    }
    return
  }
  
  // check if the user accesses pages for his specific role only
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return children
}