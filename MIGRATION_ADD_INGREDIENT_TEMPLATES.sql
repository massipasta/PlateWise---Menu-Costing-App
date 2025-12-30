-- Migration: Add ingredient templates (recipes/composite ingredients)
-- Run this in your Supabase SQL Editor

-- Create ingredient_templates table for reusable ingredient recipes
CREATE TABLE IF NOT EXISTS ingredient_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  total_yield DECIMAL(10,2) NOT NULL,
  yield_unit TEXT DEFAULT 'g',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create template_ingredients table (ingredients that make up a template)
CREATE TABLE IF NOT EXISTS template_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES ingredient_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT DEFAULT 'g',
  package_cost DECIMAL(10,2),
  package_size DECIMAL(10,2),
  package_unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE ingredient_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (no auth required for MVP)
CREATE POLICY "Allow all operations on ingredient_templates" ON ingredient_templates
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on template_ingredients" ON template_ingredients
  FOR ALL USING (true) WITH CHECK (true);






