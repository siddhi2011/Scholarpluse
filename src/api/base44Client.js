const MOCK_SCHOLARSHIPS = [
  { id: 's1', name: 'Gates Millennium Scholarship', description: 'Full-ride scholarship for outstanding minority students with significant financial need.', amount: 'Full Tuition', deadline: '2027-01-15', category: 'merit', education_level: 'undergraduate', gpa_minimum: '3.3', requirements: 'Minority student, US citizen, demonstrate leadership', website_url: 'https://example.com', created_date: '2026-05-01' },
  { id: 's2', name: 'Coca-Cola Scholars Program', description: 'Merit-based scholarship for community-minded high school seniors.', amount: '$20,000', deadline: '2027-02-01', category: 'merit', education_level: 'high_school', gpa_minimum: '3.0', requirements: 'High school senior, minimum 3.0 GPA', website_url: 'https://example.com', created_date: '2026-05-02' },
  { id: 's3', name: 'Fulbright Student Program', description: 'International exchange program for graduate study and research abroad.', amount: 'Full Funding', deadline: '2027-03-15', category: 'merit', education_level: 'graduate', gpa_minimum: '3.5', requirements: 'US citizen, bachelor\'s degree', website_url: 'https://example.com', created_date: '2026-05-03' },
  { id: 's4', name: 'Pell Grant', description: 'Federal need-based grant for undergraduate students.', amount: '$6,895', deadline: '2027-06-30', category: 'need', education_level: 'undergraduate', gpa_minimum: '', requirements: 'Demonstrate financial need via FAFSA', website_url: 'https://example.com', created_date: '2026-05-04' },
  { id: 's5', name: 'National Science Foundation GRFP', description: 'Graduate research fellowship in STEM fields.', amount: '$138,000', deadline: '2027-10-20', category: 'merit', education_level: 'graduate', gpa_minimum: '3.5', requirements: 'STEM major, US citizen or permanent resident', website_url: 'https://example.com', created_date: '2026-05-05' },
  { id: 's6', name: 'Dell Scholars Program', description: 'Scholarship for low-income, highly motivated students.', amount: '$20,000', deadline: '2027-12-01', category: 'need', education_level: 'undergraduate', gpa_minimum: '2.4', requirements: 'Demonstrate need, participate in college readiness program', website_url: 'https://example.com', created_date: '2026-05-06' },
  { id: 's7', name: 'Horatio Alger Scholarship', description: 'For students who have overcome adversity and demonstrate financial need.', amount: '$25,000', deadline: '2027-10-25', category: 'need', education_level: 'high_school', gpa_minimum: '2.0', requirements: 'Financial need, perseverance through adversity', website_url: 'https://example.com', created_date: '2026-05-07' },
  { id: 's8', name: 'Jack Kent Cooke College Scholarship', description: 'For high-achieving students with financial need.', amount: '$40,000', deadline: '2027-11-01', category: 'merit', education_level: 'high_school', gpa_minimum: '3.5', requirements: 'High school senior, financial need, academic excellence', website_url: 'https://example.com', created_date: '2026-05-08' },
];

const MOCK_SAVED = [
  { id: 'saved1', scholarship_id: 's1', status: 'saved', created_date: '2026-05-10', applied_date: null },
  { id: 'saved2', scholarship_id: 's3', status: 'applied', created_date: '2026-05-11', applied_date: '2026-05-20' },
];

let savedScholarships = [...MOCK_SAVED];

const mockEntities = {
  Scholarship: {
    list: async (sort, limit) => [...MOCK_SCHOLARSHIPS],
    get: async (id) => MOCK_SCHOLARSHIPS.find(s => s.id === id) || null,
    create: async (data) => ({ id: 'new-' + Date.now(), ...data }),
    update: async (id, data) => {
      const idx = MOCK_SCHOLARSHIPS.findIndex(s => s.id === id);
      if (idx >= 0) Object.assign(MOCK_SCHOLARSHIPS[idx], data);
      return MOCK_SCHOLARSHIPS[idx];
    },
    delete: async (id) => ({}),
    filter: async () => [],
  },
  SavedScholarship: {
    list: async () => [...savedScholarships],
    get: async (id) => savedScholarships.find(s => s.id === id) || null,
    create: async (data) => {
      const item = { id: 'saved-' + Date.now(), created_date: new Date().toISOString(), ...data };
      savedScholarships.push(item);
      return item;
    },
    update: async (id, data) => {
      const idx = savedScholarships.findIndex(s => s.id === id);
      if (idx >= 0) Object.assign(savedScholarships[idx], data);
      return savedScholarships[idx];
    },
    delete: async (id) => {
      savedScholarships = savedScholarships.filter(s => s.id !== id);
      return {};
    },
    filter: async () => [],
  },
  EssayDraft: {
    list: async () => [{ id: 'e1', title: 'Why I Want to Study CS', content: 'From a young age...', scholarship_id: 's1', created_date: '2026-05-12' }],
    get: async (id) => null,
    create: async (data) => ({ id: 'e-' + Date.now(), ...data }),
    update: async (id, data) => ({}),
    delete: async (id) => ({}),
    filter: async () => [],
  },
  Document: {
    list: async () => [{ id: 'd1', name: 'Transcript.pdf', file_url: '#', created_date: '2026-05-12' }],
    get: async (id) => null,
    create: async (data) => ({ id: 'd-' + Date.now(), ...data }),
    update: async (id, data) => ({}),
    delete: async (id) => ({}),
    filter: async () => [],
  },
};

export const db = {
  auth: {
    isAuthenticated: async () => true,
    me: async () => ({
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
    }),
    updateMe: async (data) => ({ ...data }),
    logout: () => {},
    redirectToLogin: () => {},
  },
  entities: new Proxy(mockEntities, {
    get: (target, prop) => target[prop] || {
      list: async () => [],
      get: async () => null,
      create: async (d) => d,
      update: async () => ({}),
      delete: async () => ({}),
      filter: async () => [],
    }
  }),
  integrations: {
    Core: { UploadFile: async () => ({ file_url: '' }) }
  }
};

export const base44 = db;
export default db;
