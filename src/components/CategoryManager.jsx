import { useState, useEffect } from 'react'
import { fetchCategories, createCategory, updateCategory, deleteCategory, updateCategoryOrder } from '../services/categoryService'

const CategoryManager = ({ onClose, onCategorySelect }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({ name: '', color: '#9333EA' })
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    const { data, error } = await fetchCategories()
    if (!error && data) {
      setCategories(data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('Category name is required')
      return
    }

    try {
      if (editingCategory) {
        // Preserve display_order when editing
        const updateData = {
          ...formData,
          display_order: editingCategory.display_order
        }
        const { error: updateError } = await updateCategory(editingCategory.id, updateData)
        if (updateError) throw updateError
      } else {
        // When creating a new category, set display_order to be after the last category
        const maxOrder = categories.length > 0 
          ? Math.max(...categories.map(c => c.display_order || 0))
          : -1
        const newCategoryData = {
          ...formData,
          display_order: maxOrder + 1
        }
        const { error: createError } = await createCategory(newCategoryData)
        if (createError) throw createError
      }
      
      await loadCategories()
      setEditingCategory(null)
      setFormData({ name: '', color: '#9333EA' })
    } catch (err) {
      setError(err.message || 'Failed to save category')
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({ name: category.name, color: category.color || '#9333EA' })
  }

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? Dishes using this category will have their category removed.')) {
      return
    }

    try {
      const { error: deleteError } = await deleteCategory(categoryId)
      if (deleteError) throw deleteError
      await loadCategories()
    } catch (err) {
      setError(err.message || 'Failed to delete category')
    }
  }

  const handleCancel = () => {
    setEditingCategory(null)
    setFormData({ name: '', color: '#9333EA' })
    setError(null)
  }

  const handleMoveUp = async (index) => {
    if (index === 0) return // Already at top

    const newCategories = [...categories]
    const temp = newCategories[index]
    newCategories[index] = newCategories[index - 1]
    newCategories[index - 1] = temp

    // Update display_order for all affected categories
    const categoryOrders = newCategories.map((category, idx) => ({
      id: category.id,
      display_order: idx
    }))

    setError(null)
    const { error: updateError } = await updateCategoryOrder(categoryOrders)
    if (updateError) {
      setError('Failed to update category order. Please try again.')
      await loadCategories()
    } else {
      setCategories(newCategories.map((cat, idx) => ({
        ...cat,
        display_order: idx
      })))
    }
  }

  const handleMoveDown = async (index) => {
    if (index === categories.length - 1) return // Already at bottom

    const newCategories = [...categories]
    const temp = newCategories[index]
    newCategories[index] = newCategories[index + 1]
    newCategories[index + 1] = temp

    // Update display_order for all affected categories
    const categoryOrders = newCategories.map((category, idx) => ({
      id: category.id,
      display_order: idx
    }))

    setError(null)
    const { error: updateError } = await updateCategoryOrder(categoryOrders)
    if (updateError) {
      setError('Failed to update category order. Please try again.')
      await loadCategories()
    } else {
      setCategories(newCategories.map((cat, idx) => ({
        ...cat,
        display_order: idx
      })))
    }
  }

  const presetColors = [
    '#9333EA', // Purple
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#10B981', // Green
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Manage Categories</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Appetizer, Main Course, Dessert"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-10 border-2 border-gray-200 rounded-lg cursor-pointer"
                />
                <div className="flex gap-2 flex-wrap">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition-all"
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
              {editingCategory && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Categories List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No categories created yet.</p>
              <p className="text-sm text-gray-400 mt-2">Create your first category above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
                <div className="text-sm text-purple-800 flex items-center gap-3 font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <span>Use the <strong className="text-purple-900">↑ and ↓ arrow buttons</strong> to reorder categories</span>
                </div>
              </div>
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-all"
                  style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                >
                  {/* Category Color Dot */}
                  <div
                    className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: category.color || '#9333EA' }}
                  />
                  
                  {/* Category Name */}
                  <span className="font-semibold text-gray-900 flex-1">{category.name}</span>
                  
                  {/* Move Buttons - ABSOLUTELY VISIBLE */}
                  <div 
                    style={{ 
                      display: 'flex !important',
                      flexDirection: 'column',
                      gap: '4px',
                      marginRight: '10px',
                      minWidth: '25px',
                      visibility: 'visible',
                      opacity: 1
                    }}
                  >
                    <span style={{ fontSize: '8px', color: 'red', display: 'block' }}>↑↓</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleMoveUp(index)
                      }}
                      disabled={index === 0}
                      style={{
                        width: '25px',
                        height: '25px',
                        display: 'flex !important',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: index === 0 ? '#9ca3af' : '#9333ea',
                        color: 'white',
                        border: '2px solid',
                        borderColor: index === 0 ? '#6b7280' : '#7c3aed',
                        borderRadius: '5px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                        padding: 0,
                        margin: 0,
                        lineHeight: 1,
                        boxSizing: 'border-box',
                        visibility: 'visible',
                        opacity: 1
                      }}
                      onMouseEnter={(e) => {
                        if (index !== 0) {
                          e.currentTarget.style.backgroundColor = '#7c3aed'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (index !== 0) {
                          e.currentTarget.style.backgroundColor = '#9333ea'
                        }
                      }}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleMoveDown(index)
                      }}
                      disabled={index === categories.length - 1}
                      style={{
                        width: '25px',
                        height: '25px',
                        display: 'flex !important',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: index === categories.length - 1 ? '#9ca3af' : '#ec4899',
                        color: 'white',
                        border: '2px solid',
                        borderColor: index === categories.length - 1 ? '#6b7280' : '#db2777',
                        borderRadius: '5px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: index === categories.length - 1 ? 'not-allowed' : 'pointer',
                        padding: 0,
                        margin: 0,
                        lineHeight: 1,
                        boxSizing: 'border-box',
                        visibility: 'visible',
                        opacity: 1
                      }}
                      onMouseEnter={(e) => {
                        if (index !== categories.length - 1) {
                          e.currentTarget.style.backgroundColor = '#db2777'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (index !== categories.length - 1) {
                          e.currentTarget.style.backgroundColor = '#ec4899'
                        }
                      }}
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(category)}
                      className="px-3 py-1.5 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(category.id)}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CategoryManager






