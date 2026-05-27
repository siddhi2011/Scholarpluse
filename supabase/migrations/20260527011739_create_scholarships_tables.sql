/*
  # Create scholarships and user profiles tables

  1. New Tables
    - `scholarships`: Core scholarship listings with all metadata
      - `id` (uuid, primary key)
      - `title` (text)
      - `provider` (text)
      - `description` (text)
      - `requirements` (text)
      - `apply_url` (text)
      - `amount` (integer)
      - `deadline` (text)
      - `category` (text)
      - `difficulty` (text)
      - `verified` (boolean)
      - `renewable` (boolean)
      - `essay_required` (boolean)
      - `ai_allowed` (boolean)
      - `essay_prompt` (text)
      - `education_level_min` (text)
      - `education_level_max` (text)
      - `gpa_requirement` (numeric)
      - `citizenship` (text)
      - `state` (text)
      - `major` (text)
      - `gender` (text)
      - `num_winners` (integer)
      - `avg_time_hours` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_profiles`: Extended user information
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `email` (text)
      - Various profile fields for scholarship matching
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `saved_scholarships`: User-saved scholarships
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `scholarship_id` (uuid, references scholarships)
      - `status` (text: 'saved', 'applied', 'rejected')
      - `created_at` (timestamp)
      - `applied_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - User profiles: users can only view/update their own
    - Scholarships: all authenticated users can read, verified data
    - Saved scholarships: users can only manage their own

  3. Indexes
    - scholarship status/deadline for efficient queries
    - user_id on saved_scholarships for quick lookups
*/

CREATE TABLE IF NOT EXISTS scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  provider text,
  description text,
  requirements text,
  apply_url text NOT NULL,
  amount integer,
  deadline text,
  category text,
  difficulty text,
  verified boolean DEFAULT false,
  renewable boolean DEFAULT false,
  essay_required boolean DEFAULT false,
  ai_allowed boolean DEFAULT false,
  essay_prompt text,
  education_level_min text,
  education_level_max text,
  gpa_requirement numeric,
  citizenship text,
  state text,
  major text,
  gender text,
  num_winners integer,
  avg_time_hours integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  education_level text,
  school text,
  gpa text,
  major text,
  graduation_year text,
  state text,
  citizenship text,
  gender text,
  ethnicity text,
  household_income text,
  household_size text,
  first_gen boolean DEFAULT false,
  military_affiliation text,
  disability text,
  achievements text,
  extracurriculars text,
  leadership_roles text,
  community_service text,
  work_experience text,
  skills text,
  languages text,
  sat_score text,
  act_score text,
  career_goals text,
  intended_career_field text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  scholarship_id uuid NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  status text DEFAULT 'saved',
  created_at timestamptz DEFAULT now(),
  applied_at timestamptz,
  UNIQUE(user_id, scholarship_id)
);

ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scholarships are viewable by authenticated users"
  ON scholarships
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own saved scholarships"
  ON saved_scholarships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved scholarships"
  ON saved_scholarships
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved scholarships"
  ON saved_scholarships
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved scholarships"
  ON saved_scholarships
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX scholarships_deadline_idx ON scholarships(deadline);
CREATE INDEX scholarships_category_idx ON scholarships(category);
CREATE INDEX saved_scholarships_user_idx ON saved_scholarships(user_id);
CREATE INDEX saved_scholarships_status_idx ON saved_scholarships(status);
