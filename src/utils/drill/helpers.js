// Utility function to get the correct media URL
export const getMediaUrl = (url) => {
  if (!url) return null;
  // If it's already a full URL, return as is
  if (url.startsWith('http')) return url;
  // If it's a relative path, construct the full URL
  const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
};

// Utility function to get absolute URL
export const getAbsoluteUrl = (url) => {
  if (!url) return null;
  if (typeof url !== 'string') return null;
  if (url.startsWith('http')) return url;
  return `http://127.0.0.1:8000${url}`;
};

// Safe create object URL utility
export const safeCreateObjectURL = (file) => {
  try {
    // Handle null or undefined
    if (!file) return null;
    
    // If it's already a string URL, return it
    if (typeof file === 'string') return file;
    
    // If it's an object with a URL, return the URL
    if (file && typeof file === 'object') {
      if (file.url) return file.url;
      if (file instanceof File) return URL.createObjectURL(file);
    }
    
    // Log unexpected input type
    console.warn('Unexpected media type:', typeof file, file);
    return null;
  } catch (error) {
    console.error('Error creating object URL:', error, file);
    return null;
  }
};

// Validation functions
export const validateOverviewFields = (drill) => {
  if (!drill.title || !drill.openDate || !drill.dueDate) return false;
  const open = new Date(drill.openDate);
  const due = new Date(drill.dueDate);
  // At least 10 minutes difference
  return due.getTime() - open.getTime() >= 10 * 60 * 1000;
};

export const validateCustomWordList = (drill, customListDesc) => {
  if (!drill.wordlistName || !customListDesc) return false;
  if (drill.customWordList.length < 4) return false;
  for (const w of drill.customWordList) {
    if (!w.word || !w.definition || !w.image || !w.signVideo) return false;
  }
  return true;
};

export const validateWordList = (drill, customListDesc) => {
  if (!drill.wordlistType) return false;
  if (drill.wordlistType === 'builtin' && !drill.wordlistName) return false;
  if (drill.wordlistType === 'custom') {
    if (!drill.wordlistName || !customListDesc) return false;
    if (drill.customWordList.length < 3) return false;
    for (const w of drill.customWordList) {
      if (!w.word || !w.definition || !w.image || !w.signVideo) return false;
    }
  }
  return true;
};

// Date utility functions
export const getMinOpenDate = () => {
  const now = new Date();
  // Convert to local timezone for datetime-local input
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const getMinDueDate = (openDate) => {
  if (!openDate) return getMinOpenDate();
  const open = new Date(openDate);
  // Add 10 minutes to the open date
  open.setMinutes(open.getMinutes() + 10);
  const year = open.getFullYear();
  const month = String(open.getMonth() + 1).padStart(2, '0');
  const day = String(open.getDate()).padStart(2, '0');
  const hours = String(open.getHours()).padStart(2, '0');
  const minutes = String(open.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};