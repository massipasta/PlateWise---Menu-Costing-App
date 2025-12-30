-- Migration: Add package fields to ingredients table and selling_price to dishes
-- Run this if you already have the tables created

-- Add selling_price to dishes table
ALTER TABLE dishes 
ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10,2);

-- Add new columns for package information to ingredients table
ALTER TABLE ingredients 
ADD COLUMN IF NOT EXISTS package_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS package_size DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS package_unit TEXT;

-- Update default unit to 'g' if it's still 'unit'
UPDATE ingredients SET unit = 'g' WHERE unit = 'unit' OR unit IS NULL;

