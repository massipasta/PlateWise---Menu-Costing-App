import { useState, useEffect } from 'react'
import { fetchMenus, createMenu, updateMenu, deleteMenu, addDishToMenu, removeDishFromMenu } from '../services/menuService'
import { fetchDishes } from '../services/dishService'
import DishCard from './DishCard'

const MenuManager = ({ onClose }) => {
  const [menus, setMenus] = useState([])
  const [allDishes, setAllDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [showMenuForm, setShowMenuForm] = useState(false)
  const [editingMenu, setEditingMenu] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [menusResult, dishesResult] = await Promise.all([
      fetchMenus(),
      fetchDishes()
    ])
    
    if (!menusResult.error) setMenus(menusResult.data || [])
    if (!dishesResult.error) setAllDishes(dishesResult.data || [])
    setLoading(false)
  }

  const handleCreateMenu = () => {
    setEditingMenu(null)
    setFormData({ name: '', description: '' })
    setShowMenuForm(true)
  }

  const handleEditMenu = (menu) => {
    setEditingMenu(menu)
    setFormData({ name: menu.name, description: menu.description || '' })
    setShowMenuForm(true)
  }

  const handleSaveMenu = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('Menu name is required')
      return
    }

    try {
      if (editingMenu) {
        const { error: updateError } = await updateMenu(editingMenu.id, formData)
        if (updateError) throw updateError
      } else {
        const { error: createError } = await createMenu(formData)
        if (createError) throw createError
      }
      
      await loadData()
      setShowMenuForm(false)
      setEditingMenu(null)
      setFormData({ name: '', description: '' })
    } catch (err) {
      setError(err.message || 'Failed to save menu')
    }
  }

  const handleDeleteMenu = async (menuId) => {
    if (!window.confirm('Are you sure you want to delete this menu? All dishes will be removed from it.')) {
      return
    }

    try {
      const { error: deleteError } = await deleteMenu(menuId)
      if (deleteError) throw deleteError
      await loadData()
      if (selectedMenu?.id === menuId) {
        setSelectedMenu(null)
      }
    } catch (err) {
      setError(err.message || 'Failed to delete menu')
    }
  }

  const handleAddDishToMenu = async (dishId) => {
    if (!selectedMenu) return

    try {
      const { error: addError } = await addDishToMenu(selectedMenu.id, dishId)
      if (addError) throw addError
      await loadData()
      // Update selected menu
      const updatedMenu = menus.find(m => m.id === selectedMenu.id)
      if (updatedMenu) {
        const { data } = await fetchMenus()
        if (data) {
          const menu = data.find(m => m.id === selectedMenu.id)
          if (menu) setSelectedMenu(menu)
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to add dish to menu')
    }
  }

  const handleRemoveDishFromMenu = async (dishId) => {
    if (!selectedMenu) return

    try {
      const { error: removeError } = await removeDishFromMenu(selectedMenu.id, dishId)
      if (removeError) throw removeError
      await loadData()
      // Update selected menu
      const { data } = await fetchMenus()
      if (data) {
        const menu = data.find(m => m.id === selectedMenu.id)
        if (menu) setSelectedMenu(menu)
      }
    } catch (err) {
      setError(err.message || 'Failed to remove dish from menu')
    }
  }

  const availableDishes = selectedMenu
    ? allDishes.filter(dish => 
        !selectedMenu.dishes?.some(menuDish => menuDish.id === dish.id)
      )
    : []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Manage Menus</h3>
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

          {showMenuForm ? (
            <form onSubmit={handleSaveMenu} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Menu Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Spring Menu, Dinner Menu"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add a description for this menu..."
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition-all"
                >
                  {editingMenu ? 'Update Menu' : 'Create Menu'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenuForm(false)
                    setEditingMenu(null)
                    setFormData({ name: '', description: '' })
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-6">
              <button
                onClick={handleCreateMenu}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 font-semibold transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Menu
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading menus...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Menus List */}
              <div className="lg:col-span-1">
                <h4 className="font-semibold text-gray-900 mb-3">Menus</h4>
                {menus.length === 0 ? (
                  <p className="text-sm text-gray-500">No menus created yet.</p>
                ) : (
                  <div className="space-y-2">
                    {menus.map((menu) => (
                      <div
                        key={menu.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedMenu?.id === menu.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                        onClick={() => setSelectedMenu(menu)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-gray-900">{menu.name}</div>
                            {menu.description && (
                              <div className="text-sm text-gray-600 mt-1">{menu.description}</div>
                            )}
                            <div className="text-xs text-gray-500 mt-2">
                              {menu.dishes?.length || 0} dish{menu.dishes?.length !== 1 ? 'es' : ''}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditMenu(menu)
                              }}
                              className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                              title="Edit menu"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteMenu(menu.id)
                              }}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Delete menu"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Menu Details */}
              <div className="lg:col-span-2">
                {selectedMenu ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{selectedMenu.name}</h4>
                        {selectedMenu.description && (
                          <p className="text-sm text-gray-600 mt-1">{selectedMenu.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Add Dishes Section */}
                    {availableDishes.length > 0 && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-semibold text-gray-900 mb-3">Add Dishes to Menu</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {availableDishes.map((dish) => (
                            <button
                              key={dish.id}
                              onClick={() => handleAddDishToMenu(dish.id)}
                              className="p-3 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                            >
                              <div className="font-medium text-gray-900">{dish.name}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Menu Dishes */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">
                        Menu Dishes ({selectedMenu.dishes?.length || 0})
                      </h5>
                      {selectedMenu.dishes && selectedMenu.dishes.length > 0 ? (
                        <div className="space-y-4">
                          {selectedMenu.dishes.map((dish) => (
                            <div key={dish.id} className="relative">
                              <DishCard
                                dish={dish}
                                onEdit={() => {}}
                                onDelete={() => {}}
                              />
                              <button
                                onClick={() => handleRemoveDishFromMenu(dish.id)}
                                className="absolute top-2 right-2 p-2 bg-white border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all"
                                title="Remove from menu"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No dishes in this menu yet. Add dishes from above.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Select a menu to view and manage its dishes.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MenuManager

