import { useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";


export default function Logout ({session_expired = false}) {
  // session_expired = true if the REFRESH TOKEN is already expired (default value is 1 day) 

  const navigate = useNavigate()

  useEffect(()=>{
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);

    const timer = setTimeout(() => {
      // This runs after 1.5 seconds
      navigate("/login")
    }, 1500);

    // Cleanup to avoid memory leaks
    return () => clearTimeout(timer);
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EEF1F5] to-[#E6E9FF] p-4">
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-xl max-w-md w-full text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#FFDF9F]/30 blur-2xl"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#4C53B4]/20 blur-2xl"></div>
        
        <div className="relative flex flex-col justify-center items-center">
          <i className="fa-solid fa-hourglass fa-5x text-[#4C53B4]" />
          
          <h1 className="text-2xl font-bold text-[#4C53B4] my-3">{session_expired ? "Session Expired" : "Logging Out"}</h1>
          {
            session_expired && (
              <p className="text-gray-600 text-lg">Please log in again.</p>
            )
          }
          
          <div className="w-6 h-6 border-4 border-[#4C53B4] border-t-transparent rounded-full animate-spin mt-5"/>
          
        </div>
      </div>
    </div>
  )
}