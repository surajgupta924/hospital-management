import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/services';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authAPI.getProfile();
      setUser(data.data);
    } catch {
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (userData) => {
    const { data } = await authAPI.register(userData);
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  const hasRole = (...roles) => user && roles.includes(user.role);

  const isSuperAdmin = () => hasRole(ROLES.SUPER_ADMIN);
  const isHospitalStaff = () => hasRole(ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST);
  const canManageHospital = () => hasRole(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    hasRole,
    isSuperAdmin,
    isHospitalStaff,
    canManageHospital,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
