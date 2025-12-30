-- Migration: Add selling_price column to dishes table
-- Run this in your Supabase SQL Editor if you get an error about missing 'selling_price' column

-- Add selling_price column to dishes table
ALTER TABLE dishes 
ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10,2);






