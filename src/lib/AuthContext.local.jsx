import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

const MOCK_USER = {
  id: 'mock-user-1',
  full_name: 'Alex Johnson',
  email: 'alex@example.com',
  education_level: 'undergraduate',
  school: 'Stanford University',
  gpa: '3.8',
  major: 'Computer Science',
  graduation_year: '2027',
  state: 'CA',
  citizenship: 'us_citizen',
  gender: 'female',
  ethnicity: 'Asian / Asian American',
  household_income: '50k_75k',
  household_size: '4',
  first_gen: false,
  military_affiliation: 'none',
  disability: 'none',
  achievements: "Dean's List, Hackathon Winner",
  extracurriculars: 'Coding Club, Student Government',
  leadership_roles: 'VP of Coding Club',
  community_service: 'Tutoring at local library',
  work_experience: 'Summer intern at Google',
  skills: 'Python, React, Machine Learning',
  languages: 'English, Mandarin',
  sat_score: '1520',
  act_score: '34',
  career_goals: 'Become a software engineer making impactful products',
  intended_career_field: 'Technology / Computer Science',
};

export const AuthProvider = ({ children }) => {
  const [user] = useState(MOCK_USER);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: true,
      isLoadingAuth: false,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: null,
      authChecked: true,
      logout: () => {},
      navigateToLogin: () => {},
      checkUserAuth: async () => {},
      checkAppState: async () => {},
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
