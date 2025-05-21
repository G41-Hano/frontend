import { createContext, useContext, useState } from "react"
import api from "../api"
const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  const loginUser = async (token) => {
    if (token) {
      try {
        // Fetch user profile data from API
        const response = await api.get('/api/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setUser({
          ...response.data,
          // STATIC DATA   TODO: Replace with data from API
          badges: 5,
          points: 3090,
        })
      } catch (err) {
        console.error("Failed to fetch user profile", err)
      }
    }
  }

  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
  };

  return (
    <UserContext.Provider value={{ user, loginUser, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
