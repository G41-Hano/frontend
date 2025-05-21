import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';

const ClassroomPreferencesContext = createContext();

export const ClassroomPreferencesProvider = ({ children }) => {
  const { user } = useUser();
  const userId = user?.id;
  const [initialized, setInitialized] = useState(false);
  const [preferences, setPreferences] = useState({ colors: {}, order: [] });

  // Load preferences when user changes
  useEffect(() => {
    if (userId) {
      const savedPrefs = localStorage.getItem(`classroomPreferences_${userId}`);
      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs);
          setPreferences({
            colors: parsed.colors || {},
            order: Array.isArray(parsed.order) ? parsed.order : []
          });
        } catch (e) {
          console.error('Error parsing saved preferences:', e);
          setPreferences({ colors: {}, order: [] });
        }
      }
      setInitialized(true);
    } else {
      setPreferences({ colors: {}, order: [] });
      setInitialized(false);
    }
  }, [userId]);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (userId && initialized) {
      localStorage.setItem(`classroomPreferences_${userId}`, JSON.stringify(preferences));
    }
  }, [preferences, userId, initialized]);

  const setClassroomColor = (classroomId, color) => {
    if (!userId) return;
    setPreferences(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [classroomId]: color
      }
    }));
  };

  const getClassroomColor = (classroomId) => {
    return preferences.colors[classroomId];
  };

  const updateOrder = (classrooms) => {
    if (!userId || !Array.isArray(classrooms)) return;
    
    // Extract IDs and ensure they're strings
    const newOrder = classrooms.map(classroom => 
      typeof classroom === 'object' ? classroom.id.toString() : classroom.toString()
    );
    
    setPreferences(prev => ({
      ...prev,
      order: newOrder
    }));
  };

  const getClassroomOrder = () => {
    return preferences.order;
  };

  const sortClassrooms = (classrooms) => {
    if (!Array.isArray(classrooms) || !Array.isArray(preferences.order)) {
      return classrooms;
    }

    // Convert all IDs to strings for consistent comparison
    const orderMap = new Map(
      preferences.order.map((id, index) => [id.toString(), index])
    );

    return [...classrooms].sort((a, b) => {
      const aIndex = orderMap.get(a.id.toString());
      const bIndex = orderMap.get(b.id.toString());
      
      // If both items are in the order array, sort by their position
      if (aIndex !== undefined && bIndex !== undefined) {
        return aIndex - bIndex;
      }
      
      // If only one item is in the order array, put the other at the end
      if (aIndex !== undefined) return -1;
      if (bIndex !== undefined) return 1;
      
      // If neither item is in the order array, maintain their relative order
      return 0;
    });
  };

  return (
    <ClassroomPreferencesContext.Provider value={{
      setClassroomColor,
      getClassroomColor,
      updateOrder,
      getClassroomOrder,
      sortClassrooms,
      initialized
    }}>
      {children}
    </ClassroomPreferencesContext.Provider>
  );
};

export const useClassroomPreferences = () => useContext(ClassroomPreferencesContext); 