import { useState, useEffect } from 'react'
import DishForm from './components/DishForm'
import DishCard from './components/DishCard'
import TemplateForm from './components/TemplateForm'
import InvoiceUpload from './components/InvoiceUpload'
import CategoryManager from './components/CategoryManager'
import MenuManager from './components/MenuManager'
import { fetchDishes, saveDish, deleteDish } from './services/dishService'
import { fetchTemplates, saveTemplate, deleteTemplate } from './services/templateService'
import { fetchCategories } from './services/categoryService'

function App() {
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingDish, setEditingDish] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [templates, setTemplates] = useState([])
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [showInvoiceUpload, setShowInvoiceUpload] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [showMenuManager, setShowMenuManager] = useState(false)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    loadDishes()
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const { data, error } = await fetchCategories()
      if (error) {
        // Silently fail - categories are optional
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

  const loadDishes = async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await fetchDishes()
    if (fetchError) {
      const errorMessage = fetchError.message || 'Unknown error'
      // Check if it's a migration issue
      if (errorMessage.includes('category') || errorMessage.includes('relation') || errorMessage.includes('column')) {
        setError(`Database migration needed: ${errorMessage}. Please run MIGRATION_ADD_CATEGORIES_AND_MENUS.sql in your Supabase SQL Editor.`)
      } else {
        setError(`Failed to load dishes: ${errorMessage}. Please check your Supabase connection.`)
      }
      console.error('Fetch error details:', fetchError)
    } else {
      setDishes(data || [])
    }
    setLoading(false)
  }

  const handleSaveDish = async (dishData) => {
    setError(null)
    setSaving(true)
    try {
      const { data, error: saveError } = await saveDish(dishData)
      if (saveError) {
        setError(`Failed to save dish: ${saveError.message || 'Please check your Supabase connection and try again.'}`)
        console.error('Save error:', saveError)
        setSaving(false)
      } else {
        await loadDishes()
        setShowForm(false)
        setEditingDish(null)
        setSaving(false)
      }
    } catch (err) {
      setError(`Failed to save dish: ${err.message || 'An unexpected error occurred.'}`)
      console.error('Save error:', err)
      setSaving(false)
    }
  }

  const handleDeleteDish = async (dishId) => {
    if (!window.confirm('Are you sure you want to delete this dish?')) return

    setError(null)
    const { error: deleteError } = await deleteDish(dishId)
    if (deleteError) {
      setError('Failed to delete dish. Please try again.')
      console.error(deleteError)
    } else {
      await loadDishes()
    }
  }

  const handleEditDish = (dish) => {
    setEditingDish(dish)
    setShowForm(true)
  }

  const handleNewDish = () => {
    setEditingDish(null)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingDish(null)
  }

  const loadTemplates = async () => {
    const { data, error } = await fetchTemplates()
    if (!error && data) {
      setTemplates(data)
    }
  }

  const handleSaveTemplate = async (templateData) => {
    setError(null)
    const { data, error: saveError } = await saveTemplate(templateData)
    if (saveError) {
      setError(`Failed to save template: ${saveError.message || 'Please try again.'}`)
      console.error(saveError)
    } else {
      await loadTemplates()
      setEditingTemplate(null)
    }
  }

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return
    setError(null)
    const { error: deleteError } = await deleteTemplate(templateId)
    if (deleteError) {
      setError('Failed to delete template. Please try again.')
      console.error(deleteError)
    } else {
      await loadTemplates()
    }
  }

  const handleEditTemplate = (template) => {
    setEditingTemplate(template)
  }

  const handleNewTemplate = () => {
    setEditingTemplate({})
  }

  const handleSaveInvoiceIngredients = async (ingredients) => {
    setError(null)
    try {
      // Save each ingredient as a simple template (single ingredient with unit cost)
      let savedCount = 0
      let errorCount = 0

      for (const ingredient of ingredients) {
        // Create a template for this ingredient
        const templateData = {
          name: ingredient.name,
          description: `Imported from invoice - $${ingredient.price.toFixed(2)} per ${ingredient.unit || 'unit'}`,
          total_yield: 1,
          yield_unit: ingredient.unit || 'g',
          ingredients: [{
            name: ingredient.name,
            unit_cost: ingredient.price,
            quantity: 1,
            unit: ingredient.unit || 'g',
            package_cost: null,
            package_size: null,
            package_unit: null
          }]
        }

        const { error: saveError } = await saveTemplate(templateData)
        if (saveError) {
          console.error('Error saving ingredient template:', saveError)
          errorCount++
        } else {
          savedCount++
        }
      }

      if (savedCount > 0) {
        // Reload templates to show the new ones
        await loadTemplates()
        setShowInvoiceUpload(false)
        // Show success message
        if (errorCount > 0) {
          setError(`Imported ${savedCount} ingredient(s) successfully. ${errorCount} failed to save.`)
        } else {
          // Success - templates will be visible in templates section
          setShowInvoiceUpload(false)
        }
      } else {
        setError('Failed to save ingredients. Please try again.')
      }
    } catch (err) {
      console.error('Error saving invoice ingredients:', err)
      setError('Failed to save ingredients. Please try again.')
    }
  }

  if (showInvoiceUpload) {
    return (
      <InvoiceUpload
        onClose={() => setShowInvoiceUpload(false)}
        onSaveIngredients={handleSaveInvoiceIngredients}
      />
    )
  }

  if (showTemplates) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={() => {
                setShowTemplates(false)
                setEditingTemplate(null)
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to dishes
            </button>
          </div>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg text-red-700 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          {editingTemplate !== null ? (
            <TemplateForm
              template={editingTemplate}
              onSave={handleSaveTemplate}
              onCancel={() => setEditingTemplate(null)}
              onDelete={handleDeleteTemplate}
            />
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Ingredient Templates</h2>
                <button
                  onClick={handleNewTemplate}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500 text-white rounded-xl hover:from-pink-600 hover:via-purple-700 hover:to-pink-600 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  + New Template
                </button>
              </div>
              {templates.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg">
                  <p className="text-gray-500 mb-4">No templates yet. Create your first template!</p>
                  <button
                    onClick={handleNewTemplate}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500 text-white rounded-xl hover:from-pink-600 hover:via-purple-700 hover:to-pink-600 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    Create Template
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div key={template.id} className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border-2 border-purple-100 shadow-md hover:shadow-lg flex justify-between items-center transition-all">
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-lg mb-1">{template.name}</div>
                        <div className="text-sm text-gray-600">
                          Makes {template.total_yield} {template.yield_unit} • {template.ingredients?.length || 0} ingredients
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                          title="Edit template"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
                              handleDeleteTemplate(template.id)
                            }
                          }}
                          className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                          title="Delete template"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={handleCancelForm}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to dishes
            </button>
          </div>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg text-red-700 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
          <DishForm
            dish={editingDish}
            onSave={handleSaveDish}
            onCancel={handleCancelForm}
            saving={saving}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                PlateWise
              </h1>
              <p className="text-sm text-gray-500">Smart menu costing made simple</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setShowCategoryManager(true)
                  loadCategories()
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 hover:border-purple-300 font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Categories
              </button>
              <button
                onClick={() => {
                  setShowMenuManager(true)
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 hover:border-purple-300 font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Menus
              </button>
              <button
                onClick={() => {
                  setShowTemplates(true)
                  loadTemplates()
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 hover:border-purple-300 font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Templates
              </button>
              <button
                onClick={() => setShowInvoiceUpload(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 hover:border-purple-300 font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload
              </button>
              <button
                onClick={handleNewDish}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Dish
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg text-red-700 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filter by category:</span>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color || '#9333EA' }}
                />
                {category.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading dishes...</p>
          </div>
        ) : dishes.length === 0 ? (
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-dashed border-purple-200 shadow-lg">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-pink-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No dishes yet</h3>
              <p className="text-gray-600 mb-8">Create your first dish to start calculating costs and pricing!</p>
              <button
                onClick={handleNewDish}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500 text-white rounded-xl hover:from-pink-600 hover:via-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 font-bold transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Dish
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dishes
              .filter(dish => !selectedCategory || dish.category_id === selectedCategory)
              .map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  onEdit={handleEditDish}
                  onDelete={handleDeleteDish}
                />
              ))}
          </div>
        )}
      </div>

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <CategoryManager
          onClose={() => {
            setShowCategoryManager(false)
            loadCategories()
            loadDishes()
          }}
        />
      )}

      {/* Menu Manager Modal */}
      {showMenuManager && (
        <MenuManager
          onClose={() => setShowMenuManager(false)}
        />
      )}
    </div>
  )
}

export default App


