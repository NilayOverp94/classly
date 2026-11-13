-- Classly Demo Seed Data
-- Run this after schema.sql

-- 1. Insert Core Subjects
INSERT INTO public.subjects (name, category, description, icon) VALUES
('Mathematics', 'Mathematics', 'Pre-Algebra, Algebra I & II, Geometry, Trigonometry, Pre-Calculus, and AP Calculus', 'Calculator'),
('Science', 'Science', 'General Science, Earth & Space Science, Middle School Physical Science', 'FlaskConical'),
('Physics', 'Science', 'AP Physics 1, 2 & C, Mechanics, Electromagnetism, and High School Physics', 'Atom'),
('Chemistry', 'Science', 'AP Chemistry, Honors Chemistry, Organic Chemistry fundamentals', 'TestTube'),
('Biology', 'Science', 'AP Biology, Cellular Biology, Genetics, and Middle/High School Life Science', 'Dna'),
('English', 'Humanities', 'Reading Comprehension, Essay Writing, Literature Analysis, and Grammar', 'BookOpen'),
('Computer Science', 'Coding', 'Python, AP Computer Science A (Java), Web Development, and Algorithms', 'Code'),
('History', 'Humanities', 'US History, AP World History, European History, and Social Studies', 'Landmark')
ON CONFLICT (name) DO NOTHING;

