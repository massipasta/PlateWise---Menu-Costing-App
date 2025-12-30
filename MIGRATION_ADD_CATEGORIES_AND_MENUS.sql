-- Migration: Add categories and menus feature
-- Run this in your Supabase SQL Editor

-- Create categories table (user-editable categories)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#9333EA', -- Default purple color
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create menus table
CREATE TABLE IF NOT EXISTS menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create menu_dishes junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS menu_dishes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(menu_id, dish_id)
);

-- Add category_id to dishes table
ALTER TABLE dishes 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Insert default categories
INSERT INTO categories (name, color, display_order) VALUES
  ('Appetizer', '#EC4899', 1),
  ('Main Course', '#8B5CF6', 2),
  ('Dessert', '#F59E0B', 3)
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_dishes ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (no auth required for MVP)
CREATE POLICY "Allow all operations on categories" ON categories
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on menus" ON menus
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on menu_dishes" ON menu_dishes
  FOR ALL USING (true) WITH CHECK (true);

