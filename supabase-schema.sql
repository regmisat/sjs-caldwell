-- Create speakers table
CREATE TABLE IF NOT EXISTS speakers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  photo_url TEXT,
  is_keynote BOOLEAN DEFAULT false,
  book_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  max_attendees INTEGER DEFAULT 0,
  is_general BOOLEAN DEFAULT false, -- for registration/opening remarks that everyone attends
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create session_speakers mapping table
CREATE TABLE IF NOT EXISTS session_speakers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  speaker_id UUID REFERENCES speakers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, speaker_id)
);

-- Create session_registrations table
CREATE TABLE IF NOT EXISTS session_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_session_speakers_session_id ON session_speakers(session_id);
CREATE INDEX IF NOT EXISTS idx_session_speakers_speaker_id ON session_speakers(speaker_id);
CREATE INDEX IF NOT EXISTS idx_session_registrations_session_id ON session_registrations(session_id);
CREATE INDEX IF NOT EXISTS idx_session_registrations_user_id ON session_registrations(user_id);

-- Enable Row Level Security
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for speakers (public read, admin write)
CREATE POLICY "Anyone can view speakers" ON speakers FOR SELECT USING (true);

-- RLS Policies for sessions (public read, admin write)
CREATE POLICY "Anyone can view sessions" ON sessions FOR SELECT USING (true);

-- RLS Policies for session_speakers (public read, admin write)
CREATE POLICY "Anyone can view session speakers" ON session_speakers FOR SELECT USING (true);

-- RLS Policies for session_registrations (users can view their own, insert their own)
CREATE POLICY "Users can view their own registrations" ON session_registrations 
  FOR SELECT USING (true);

CREATE POLICY "Users can register for sessions" ON session_registrations 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own registrations" ON session_registrations 
  FOR DELETE USING (true);

-- Insert dummy speakers
INSERT INTO speakers (name, title, bio, photo_url, is_keynote) VALUES
('Heidi Schlumpf', 'Senior Correspondent, Commonweal Magazine', 'Heidi Schlumpf is an award-winning journalist and podcaster with three decades of experience covering religion, spirituality as well as political, social and women''s issues.', '/speakers/heidi-schlumpf.jpg', true),
('Daniel Summer', 'Educational Specialist', 'Expert in intervention strategies for parents in public schools.', null, false),
('Ava Oberlin', 'Child Development Researcher', 'Researcher focused on parent engagement in early childhood education.', null, false),
('Danielle Nyitray', 'Police Based Navigation Support Supervisor', 'Leading mental health crisis response initiatives in Philadelphia.', null, false),
('Audrey Lundy', 'Social Services Coordinator', 'Expert in collaborative mental health intervention.', null, false),
('Officer Paul Andrews', 'Crisis Response Team', 'Philadelphia Police Department Crisis Intervention Specialist.', null, false),
('K9 Bailey', 'Crisis Response Team', 'Certified therapy dog supporting mental health crisis response.', null, false),
('Kyra Dezjot', 'Academic Specialist, Human Rights Institute, Kean University', 'Advocate for disability rights and LGBTQ+ inclusion in education.', null, false),
('Kim Rokohl', 'Graduate Assistant, Kean University - Human Rights Institute', 'Researcher in inclusive education practices.', null, false),
('Jeanne Goyette', 'OP, Coordinator of Earth Ministry, Sisters of St. Dominic', 'Environmental justice advocate and educator.', null, false),
('Mary Agnes Sullivan', 'OP, Sisters of St. Dominic', 'Environmental advocate with focus on marginalized communities.', null, false),
('Alice Uhl', 'OP, Sisters of St. Dominic', 'Environmental justice educator.', null, false),
('Elenor Uhl', 'OP, Sisters of St. Dominic', 'Environmental advocacy specialist.', null, false),
('Elaine Tanimura', 'Environmental Justice Advocate', 'Community organizer for environmental rights.', null, false),
('Christine James', 'Dominican Lay Associate, Caldwell Dominicans', 'Environmental ministry coordinator.', null, false),
('Kathy McFarlane', 'Associate, Sisters of St. Dominic', 'Environmental justice community leader.', null, false),
('Christina Getaz', 'Electronic Resources Librarian, Caldwell University', 'Expert in information literacy and health misinformation.', null, false),
('Danielle Francois', 'MPH, Public Health Specialist', 'Public health expert focusing on health communication.', null, false),
('Maria Halkias', 'Assistant Professor Master of Arts in Education, Stockton University', 'Researcher in equity-focused pedagogies.', null, false),
('Kelly Frazee', 'Education Researcher', 'Specialist in vulnerable self-reflection in teaching.', null, false);

-- Insert dummy sessions (February 27, 2026)
INSERT INTO sessions (title, description, start_time, end_time, location, max_attendees, is_general) VALUES
('Registration and Continental Breakfast', 'After registration check-in, please join us for a continental breakfast and visit with our community partner tables.', '2026-02-27 08:15:00-05', '2026-02-27 09:00:00-05', 'Hall of Flags and Student Center Auditorium', 400, true),
('Opening Remarks', 'Welcome and opening ceremony for the 5th Annual Social Justice Symposium.', '2026-02-27 09:00:00-05', '2026-02-27 09:50:00-05', 'Student Center Auditorium', 400, true),
('Bridging the Gap: Intervention Strategies for Parents in Public Schools', 'Head Start preschools provide comprehensive care for low-income families. Part of the support Head Start offers are programs directed toward parental engagement and involvement (Wymbs et al., 2023). These programs are suggested to be beneficial in reducing familial stress and encouraging positive parent-child relationships.', '2026-02-27 10:00:00-05', '2026-02-27 10:50:00-05', 'Werner 316', 25, false),
('Breaking Down Barriers: A Collaborative, Intersectionality-Informed Approach to Mental Health Crisis Response', 'For the first time in its history, the Philadelphia Police Department (PPD) has successfully integrated social services into policing through the Behavioral Health Unit''s (BHU) Crisis Intervention Response Teams (CIRT).', '2026-02-27 10:00:00-05', '2026-02-27 10:50:00-05', 'Werner 203', 40, false),
('Disability Advocacy and LGBTQ+ Issues: How to Include Social Justice in the Classroom', 'This workshop focuses on the intersection of disability advocacy and LGBTQ+ issues in education, offering practical strategies for fostering inclusivity and supporting marginalized students in the classroom. Aimed at educators, students, and community members, the session will explore the critical importance of protecting the marginalized.', '2026-02-27 10:00:00-05', '2026-02-27 10:50:00-05', 'Werner 109', 26, false),
('Environmental Injustice: Who Pays the Price?', 'Demonstrate the connections between environmental issues and social justice issues, and the impact on people, especially the marginalized, and the earth.', '2026-02-27 10:00:00-05', '2026-02-27 10:50:00-05', 'Werner 129', 115, false),
('Misinformation & Disinformation About Health Topics: What''s Going On, What Does It Mean, and What Can We Do?', 'Christina Getaz, librarian, and Danielle Francois, MPH, will discuss the intersection of the information literacy and public health worlds: misinformation and disinformation about health-related topics. This workshop will present the history of misinformation on some current topics, and engage participants in lateral reading.', '2026-02-27 10:00:00-05', '2026-02-27 10:50:00-05', 'Werner 215', 26, false),
('Vulnerable Self Reflection and Pedagogies that Support Equity in the Classrooms', 'This research-based presentation explores how lifeworlds significantly impact educational experiences and practices. It highlights the use of the lifeworld framework as a tool for promoting social justice and strength-based approaches through vulnerable reflection.', '2026-02-27 10:00:00-05', '2026-02-27 10:50:00-05', 'Werner 201/202', 38, false);

-- Map speakers to sessions
-- Session 3: Bridging the Gap
INSERT INTO session_speakers (session_id, speaker_id)
SELECT s.id, sp.id FROM sessions s, speakers sp 
WHERE s.title = 'Bridging the Gap: Intervention Strategies for Parents in Public Schools' 
AND sp.name IN ('Daniel Summer', 'Ava Oberlin');

-- Session 4: Breaking Down Barriers
INSERT INTO session_speakers (session_id, speaker_id)
SELECT s.id, sp.id FROM sessions s, speakers sp 
WHERE s.title = 'Breaking Down Barriers: A Collaborative, Intersectionality-Informed Approach to Mental Health Crisis Response' 
AND sp.name IN ('Danielle Nyitray', 'Audrey Lundy', 'Officer Paul Andrews', 'K9 Bailey');

-- Session 5: Disability Advocacy
INSERT INTO session_speakers (session_id, speaker_id)
SELECT s.id, sp.id FROM sessions s, speakers sp 
WHERE s.title = 'Disability Advocacy and LGBTQ+ Issues: How to Include Social Justice in the Classroom' 
AND sp.name IN ('Kyra Dezjot', 'Kim Rokohl');

-- Session 6: Environmental Injustice
INSERT INTO session_speakers (session_id, speaker_id)
SELECT s.id, sp.id FROM sessions s, speakers sp 
WHERE s.title = 'Environmental Injustice: Who Pays the Price?' 
AND sp.name IN ('Jeanne Goyette', 'Mary Agnes Sullivan', 'Alice Uhl', 'Elenor Uhl', 'Elaine Tanimura', 'Christine James', 'Kathy McFarlane');

-- Session 7: Misinformation
INSERT INTO session_speakers (session_id, speaker_id)
SELECT s.id, sp.id FROM sessions s, speakers sp 
WHERE s.title = 'Misinformation & Disinformation About Health Topics: What''s Going On, What Does It Mean, and What Can We Do?' 
AND sp.name IN ('Christina Getaz', 'Danielle Francois');

-- Session 8: Vulnerable Self Reflection
INSERT INTO session_speakers (session_id, speaker_id)
SELECT s.id, sp.id FROM sessions s, speakers sp 
WHERE s.title = 'Vulnerable Self Reflection and Pedagogies that Support Equity in the Classrooms' 
AND sp.name IN ('Maria Halkias', 'Kelly Frazee');
