# Supabase Setup Instructions

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: Menu Costing App (or any name you prefer)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose the closest region to you
5. Click "Create new project" and wait for it to initialize (takes 1-2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## Step 3: Set Up Environment Variables

1. Create a `.env` file in the root of this project
2. Add your credentials:
   ```
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Step 4: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the following SQL script (copy and paste it):

```sql
-- Create dishes table
CREATE TABLE dishes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  target_margin DECIMAL(5,2) DEFAULT 30.00,
  selling_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create ingredients table
CREATE TABLE ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
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

-- Enable Row Level Security (RLS) - but allow all operations for MVP
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (no auth required for MVP)
CREATE POLICY "Allow all operations on dishes" ON dishes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on ingredients" ON ingredients
  FOR ALL USING (true) WITH CHECK (true);
```

3. Click "Run" to execute the script

## Step 5: Verify Setup

After running the SQL script, you should see:
- ✅ Two tables created: `dishes` and `ingredients`
- ✅ Policies created for public access

You're all set! Now you can run `npm install` and `npm run dev` to start the app.


