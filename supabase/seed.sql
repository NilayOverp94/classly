-- Classly Production Seed Data
-- Run this after schema.sql in your Supabase SQL Editor

-- 1. Insert Core Subjects (Strictly Mathematics and Computer Science)
INSERT INTO public.subjects (name, category, description, icon) VALUES
('Mathematics', 'Mathematics', 'Pre-Algebra, Algebra I & II, Geometry, Trigonometry, Pre-Calculus, and AP Calculus AB/BC', 'Calculator'),
('Computer Science', 'Coding', 'Python for Beginners, AP Computer Science A (Java), Web Development, and Algorithms', 'Code')
ON CONFLICT (name) DO UPDATE SET
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon;
