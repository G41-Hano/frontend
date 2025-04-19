import { createContext, useContext, useState, useEffect } from "react"
import { jwtDecode } from "jwt-decode"
import { ACCESS_TOKEN } from "../constants"
import { Navigate } from "react-router-dom"

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  const loginUser = (token) => {
    if (token) {
      try {
        const decoded = jwtDecode(token)
        setUser({
          first_name: decoded.first_name,
          last_name: decoded.last_name,
          user_id: decoded.user_id,
          role: decoded.role,
          
          // STATIC DATA   TODO: Replace with data from API
          badges: 5,
          points: 3090,
          avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNC8vD7js6jU79E2koWs91aCww8sFXwtcMUw&s'
        })
      } catch (err) {
        console.error("Failed to decode token on login", err)
      }
    }
    console.log(user)
  }

  return (
    <UserContext.Provider value={{ user, loginUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
