# Menu Costing App

A simple React web application for restaurant menu costing. Calculate food costs, food cost percentages, and suggested selling prices for your dishes.

## Features

- ✅ Create and manage dishes
- ✅ Add ingredients with unit costs and quantities
- ✅ Automatic calculation of:
  - Total plate cost
  - Food cost percentage
  - Suggested selling price (based on target margin)
- ✅ Clean, minimal UI with Tailwind CSS
- ✅ Persistent data storage with Supabase

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Follow the instructions in `SUPABASE_SETUP.md` to:
   - Create a Supabase project
   - Get your API credentials
   - Set up the database tables

2. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## Usage

1. **Create a Dish**: Click "Create New Dish" and enter the dish name
2. **Set Target Margin**: Default is 30% food cost (you can change this)
3. **Add Ingredients**: 
   - Enter ingredient name
   - Enter unit cost (e.g., $2.50 per pound)
   - Enter quantity used (e.g., 0.5 pounds)
   - Enter unit (e.g., lb, oz, each)
4. **View Calculations**: The app automatically calculates:
   - Total plate cost (sum of all ingredient costs)
   - Suggested selling price (to achieve your target margin)
   - Food cost percentage (if you enter a selling price)
5. **Save**: Click "Create Dish" to save to Supabase

## Project Structure

```
src/
  ├── components/          # React components
  │   ├── DishForm.jsx     # Form for creating/editing dishes
  │   ├── DishCard.jsx     # Card displaying dish summary
  │   ├── IngredientForm.jsx
  │   ├── IngredientList.jsx
  │   └── CalculationsDisplay.jsx
  ├── services/            # Supabase service layer
  │   └── dishService.js
  ├── utils/               # Utility functions
  │   └── calculations.js
  ├── lib/                 # Third-party library configs
  │   └── supabase.js
  ├── App.jsx              # Main app component
  └── main.jsx             # Entry point
```

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Supabase** - Backend and database

## License

MIT







