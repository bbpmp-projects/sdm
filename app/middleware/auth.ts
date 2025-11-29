// app/middleware/auth.ts
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    // Validasi token JWT (jika menggunakan JWT)
    if (token.split('.').length === 3) {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      // Cek expiry token
      if (tokenData.exp && tokenData.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        return false;
      }
    }
    return true;
  } catch {
    localStorage.removeItem('token');
    return false;
  }
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};