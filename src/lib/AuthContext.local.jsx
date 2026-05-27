import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('schol_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);

  useEffect(() => {
    if (user) {
      localStorage.setItem('schol_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('schol_user');
    }
  }, [user]);

  const login = (userData) => {
    const fullUser = {
      id: `user-${Date.now()}`,
      full_name: userData.fullName,
      email: userData.email,
      education_level: 'undergraduate',
      school: '',
      gpa: '',
      major: '',
      graduation_year: '',
      state: '',
      citizenship: '',
      gender: '',
      ethnicity: '',
      household_income: '',
      household_size: '',
      first_gen: false,
      military_affiliation: 'none',
      disability: 'none',
      achievements: '',
      extracurriculars: '',
      leadership_roles: '',
      community_service: '',
      work_experience: '',
      skills: '',
      languages: '',
      sat_score: '',
      act_score: '',
      career_goals: '',
      intended_career_field: '',
    };
    setUser(fullUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth: false,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: null,
      authChecked: true,
      logout,
      navigateToLogin: () => {},
      checkUserAuth: async () => {},
      checkAppState: async () => {},
      login,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
