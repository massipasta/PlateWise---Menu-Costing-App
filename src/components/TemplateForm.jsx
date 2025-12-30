import { useState, useEffect } from 'react'
import IngredientForm from './IngredientForm'
import IngredientList from './IngredientList'
import { saveTemplate, deleteTemplate } from '../services/templateService'
import { calculateTemplateCostPerUnit } from '../services/templateService'

const TemplateForm = ({ template, onSave, onCancel, onDelete }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [totalYield, setTotalYield] = useState('')
  const [yieldUnit, setYieldUnit] = useState('g')
  const [ingredients, setIngredients] = useState([])
  const [editingIngredient, setEditingIngredient] = useState(null)

  useEffect(() => {
    if (template) {
      setName(template.name || '')
      setDescription(template.description || '')
      setTotalYield(template.total_yield || '')
      setYieldUnit(template.yield_unit || 'g')
      setIngredients(template.ingredients || [])
    }
  }, [template])

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
    if (!name.trim() || !totalYield) return

    onSave({
      id: template?.id,
      name: name.trim(),
      description: description.trim() || null,
      total_yield: parseFloat(totalYield),
      yield_unit: yieldUnit,
      ingredients: ingredients
    })
  }

  const costPerUnit = ingredients.length > 0 
    ? calculateTemplateCostPerUnit({ ingredients, total_yield: totalYield, yield_unit: yieldUnit })
    : 0

  const weightUnits = [
    { value: 'g', label: 'Grams (g)' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'oz', label: 'Ounces (oz)' },
    { value: 'lb', label: 'Pounds (lb)' },
    { value: 'ml', label: 'Milliliters (ml)' },
    { value: 'fl oz', label: 'Fluid Ounces (fl oz)' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-2 border-purple-100">
        <h2 className="text-3xl font-black text-gray-900 mb-6">
          {template ? 'Edit Template' : 'Create Ingredient Template'}
        </h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all"
              placeholder="e.g., Bucatini Pasta"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all"
              placeholder="Brief description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Total Yield
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={totalYield}
                  onChange={(e) => setTotalYield(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="6"
                  required
                />
                <select
                  value={yieldUnit}
                  onChange={(e) => setYieldUnit(e.target.value)}
                  className="px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
                >
                  {weightUnits.map(unit => (
                    <option key={unit.value} value={unit.value} className="text-gray-900">{unit.label}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">Total amount this recipe makes</p>
            </div>
            <div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 h-full flex flex-col justify-center">
                <div className="text-xs text-gray-600 mb-1">Cost per {yieldUnit}</div>
                <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">${costPerUnit.toFixed(4)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      <div className="flex justify-end gap-3 pt-4">
        {template && onDelete && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this template?')) {
                onDelete(template.id)
              }
            }}
            className="px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 font-medium transition-all"
          >
            Delete
          </button>
        )}
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
          className="px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500 text-white rounded-xl hover:from-pink-600 hover:via-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 font-bold transform hover:scale-105"
        >
          {template ? 'Update Template' : 'Create Template'}
        </button>
      </div>
    </form>
  )
}

export default TemplateForm

