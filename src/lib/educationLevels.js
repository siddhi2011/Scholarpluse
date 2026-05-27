export const EDUCATION_LEVELS = [
  { value: 'high_school_freshman', label: 'HS Freshman', longLabel: 'High School Freshman', order: 1 },
  { value: 'high_school_sophomore', label: 'HS Sophomore', longLabel: 'High School Sophomore', order: 2 },
  { value: 'high_school_junior', label: 'HS Junior', longLabel: 'High School Junior', order: 3 },
  { value: 'high_school_senior', label: 'HS Senior', longLabel: 'High School Senior', order: 4 },
  { value: 'undergraduate', label: 'Undergrad', longLabel: 'Undergraduate', order: 5 },
  { value: 'graduate', label: 'Graduate', longLabel: 'Graduate Student', order: 6 },
];

export const CATEGORIES = [
  { value: 'merit', label: 'Merit-Based' },
  { value: 'need_based', label: 'Need-Based' },
  { value: 'athletic', label: 'Athletic' },
  { value: 'stem', label: 'STEM' },
  { value: 'arts', label: 'Arts & Humanities' },
  { value: 'community_service', label: 'Community Service' },
  { value: 'diversity', label: 'Diversity' },
  { value: 'essay', label: 'Essay-Based' },
  { value: 'first_gen', label: 'First Generation' },
  { value: 'business', label: 'Business' },
  { value: 'medical', label: 'Medical/Health' },
  { value: 'law', label: 'Law/Pre-Law' },
  { value: 'education', label: 'Education' },
  { value: 'military', label: 'Military/Veterans' },
  { value: 'religious', label: 'Religious' },
  { value: 'other', label: 'Other' },
];

export const CITIZENSHIP_OPTIONS = [
  { value: 'us_citizen', label: 'US Citizen' },
  { value: 'permanent_resident', label: 'Permanent Resident' },
  { value: 'any', label: 'Any Status' },
  { value: 'international', label: 'International' },
  { value: 'daca', label: 'DACA / Undocumented' },
];

export const DIFFICULTY_LABELS = {
  easy: { label: 'Easy', color: 'text-green-600 bg-green-50' },
  medium: { label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
  hard: { label: 'Hard', color: 'text-orange-600 bg-orange-50' },
  very_hard: { label: 'Very Hard', color: 'text-red-600 bg-red-50' },
};

export function getEducationLabel(value, long = false) {
  const found = EDUCATION_LEVELS.find(l => l.value === value);
  return long ? (found?.longLabel || value) : (found?.label || value);
}

export function getCategoryLabel(value) {
  return CATEGORIES.find(c => c.value === value)?.label || value;
}

export function isEligible(userLevel, scholarshipMin, scholarshipMax) {
  const userOrder = EDUCATION_LEVELS.find(l => l.value === userLevel)?.order || 0;
  const minOrder = EDUCATION_LEVELS.find(l => l.value === scholarshipMin)?.order || 1;
  const maxOrder = EDUCATION_LEVELS.find(l => l.value === scholarshipMax)?.order || 6;
  return userOrder >= minOrder && userOrder <= maxOrder;
}

export const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming','National'
];

export const MAJORS = [
  'Computer Science', 'Engineering', 'Biology', 'Chemistry', 'Physics',
  'Mathematics', 'Business', 'Economics', 'Finance', 'Marketing',
  'Nursing', 'Pre-Med', 'Psychology', 'Sociology', 'Education',
  'Political Science', 'History', 'English', 'Communications', 'Journalism',
  'Art & Design', 'Music', 'Film & Media', 'Architecture', 'Environmental Science',
  'Public Health', 'Social Work', 'Criminal Justice', 'Law / Pre-Law', 'Pharmacy',
  'Agriculture', 'Accounting', 'Data Science', 'Cybersecurity', 'Any Major'
];