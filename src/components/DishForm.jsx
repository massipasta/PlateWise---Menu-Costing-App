import { useState, useEffect } from 'react'
import IngredientForm from './IngredientForm'
import IngredientList from './IngredientList'
import CalculationsDisplay from './CalculationsDisplay'
import { fetchCategories } from '../services/categoryService'

const DishForm = ({ dish, onSave, onCancel, saving = false }) => {
  const [name, setName] = useState('')
  const [targetMargin, setTargetMargin] = useState(30)
  const [sellingPrice, setSellingPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [ingredients, setIngredients] = useState([])
  const [editingIngredient, setEditingIngredient] = useState(null)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (dish) {
      setName(dish.name || '')
      setTargetMargin(dish.target_margin || 30)
      setSellingPrice(dish.selling_price || '')
      // Ensure category_id is set - check both category_id and category.id
      const catId = dish.category_id || (dish.category?.id) || ''
      setCategoryId(catId)
      setIngredients(dish.ingredients || [])
    } else {
      // Reset form when creating new dish
      setName('')
      setTargetMargin(30)
      setSellingPrice('')
      setCategoryId('')
      setIngredients([])
    }
  }, [dish])

  const loadCategories = async () => {
    try {
      const { data, error } = await fetchCategories()
      if (error) {
        console.warn('Could not load categories:', error)
        setCategories([])
      } else {
        setCategories(data || [])
      }
    } catch (err) {
      console.warn('Error loading categories:', err)
      setCategories([])
    }
  }

  const handleAddIngredient = (ingredient) => {
    setIngredients([...ingredients, { ...ingredient, id: Date.now() }])
    // Clear editing state after adding
    setEditingIngredient(null)
  }

  const handleRemoveIngredient = (id) => {
    setIngredients(ingredients.filter(ing => (ing.id || ing) !== id))
  }

  const handleEditIngredient = (ingredient, index) => {
    // Set the ingredient to edit - this will pre-fill the form
    setEditingIngredient(ingredient)
    // Remove from list (will be re-added when form is submitted)
    const updatedIngredients = ingredients.filter((_, i) => i !== index)
    setIngredients(updatedIngredients)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      id: dish?.id,
      name: name.trim(),
      target_margin: parseFloat(targetMargin),
      selling_price: sellingPrice ? parseFloat(sellingPrice) : null,
      category_id: categoryId || null,
      ingredients: ingredients
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dish Information Card */}
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-2 border-purple-100">
        <h2 className="text-3xl font-black text-gray-900 mb-6">
          {dish ? 'Edit Dish' : 'Create New Dish'}
        </h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dish Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all"
              placeholder="e.g., Grilled Salmon"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            {categories.length === 0 ? (
              <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm">
                No categories available. Create categories in the Categories section.
              </div>
            ) : (
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all bg-white text-gray-900 appearance-none cursor-pointer"
                >
                  <option value="">No Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className="text-gray-900">
                      {category.name}
                    </option>
                  ))}
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {/* Show selected category color indicator */}
                {categoryId && categories.find(c => c.id === categoryId) && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categories.find(c => c.id === categoryId)?.color || '#9333EA' }}
                    />
                    <span className="text-gray-600">
                      Selected: {categories.find(c => c.id === categoryId)?.name}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Target Food Cost %
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all"
                  min="1"
                  max="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Selling Price <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients Card */}
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-2 border-purple-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Ingredients</h3>
        <IngredientForm 
          onAdd={handleAddIngredient} 
          initialValue={editingIngredient}
        />
        <div className="mt-6">
          <IngredientList 
            ingredients={ingredients} 
            onRemove={handleRemoveIngredient}
            onEdit={handleEditIngredient}
          />
        </div>
      </div>

      {/* Calculations Card */}
      <CalculationsDisplay
        ingredients={ingredients}
        targetMargin={parseFloat(targetMargin)}
        sellingPrice={sellingPrice ? parseFloat(sellingPrice) : 0}
      />

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 font-semibold transition-all"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500 text-white rounded-xl hover:from-pink-600 hover:via-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105 disabled:transform-none"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            dish ? 'Update Dish' : 'Create Dish'
          )}
        </button>
      </div>
    </form>
  )
}

export default DishForm


