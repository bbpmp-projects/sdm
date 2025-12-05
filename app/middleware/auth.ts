// app/middleware/auth.ts
export const isAuthenticated = (): boolean => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    return !!token; // Return true jika token ada
  }
  return false;
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const clearAuth = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const getCurrentUser = (): any => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
  }
  return null;
};

export const saveAuthData = (token: string, user?: any): boolean => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving auth data:', error);
    return false;
  }
};