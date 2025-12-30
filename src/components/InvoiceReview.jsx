import { useState } from 'react'

const InvoiceReview = ({ items, onApprove, onBack, onCancel }) => {
  const [selectedItems, setSelectedItems] = useState(new Set(items.map(item => item.id)))
  const [editingItem, setEditingItem] = useState(null)
  const [editedItems, setEditedItems] = useState({})

  const weightUnits = [
    { value: 'g', label: 'Grams (g)' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'oz', label: 'Ounces (oz)' },
    { value: 'lb', label: 'Pounds (lb)' },
    { value: 'ml', label: 'Milliliters (ml)' },
    { value: 'fl oz', label: 'Fluid Ounces (fl oz)' }
  ]

  const toggleItem = (id) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const handleEdit = (item) => {
    setEditingItem(item.id)
    const itemData = getItemData(item)
    setEditedItems({
      ...editedItems,
      [item.id]: { name: itemData.name, price: itemData.price, unit: itemData.unit || 'g' }
    })
  }

  const handleSaveEdit = (id) => {
    setEditingItem(null)
  }

  const handleEditChange = (id, field, value) => {
    setEditedItems({
      ...editedItems,
      [id]: {
        ...editedItems[id],
        [field]: value
      }
    })
  }

  const getItemData = (item) => {
    if (editedItems[item.id]) {
      return editedItems[item.id]
    }
    // Try to infer unit from price
    let inferredUnit = 'g'
    if (item.price > 10) {
      inferredUnit = 'kg'
    } else if (item.price < 0.1) {
      inferredUnit = 'g'
    }
    return { name: item.name, price: item.price, unit: inferredUnit }
  }

  const handleApprove = () => {
    const approved = items
      .filter(item => selectedItems.has(item.id))
      .map(item => {
        const edited = editedItems[item.id]
        const itemData = getItemData(item)
        
        return {
          name: edited?.name || itemData.name,
          price: edited?.price || itemData.price,
          unit_cost: edited?.price || itemData.price, // Default to price per unit
          quantity: 1,
          unit: edited?.unit || itemData.unit || 'g'
        }
      })
    onApprove(approved)
  }

  const approvedCount = selectedItems.size

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold mb-1">Review Extracted Items</h3>
              <p className="text-sm opacity-90">
                {approvedCount} of {items.length} items selected
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No items found in the invoice.</p>
              <button
                onClick={onBack}
                className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => {
                const isSelected = selectedItems.has(item.id)
                const isEditing = editingItem === item.id
                const itemData = getItemData(item)

                return (
                  <div
                    key={item.id}
                    className={`border-2 rounded-xl p-4 transition-all ${
                      isSelected
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItem(item.id)}
                        className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                      />
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Ingredient Name</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={itemData.name}
                              onChange={(e) => handleEditChange(item.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              autoFocus
                            />
                          ) : (
                            <div className="font-semibold text-gray-900">{itemData.name}</div>
                          )}
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Price</label>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">$</span>
                              <input
                                type="number"
                                step="0.01"
                                value={itemData.price}
                                onChange={(e) => handleEditChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                                className="flex-1 px-3 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          ) : (
                            <div className="font-semibold text-gray-900">${itemData.price.toFixed(2)}</div>
                          )}
                        </div>

                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Unit</label>
                          {isEditing ? (
                            <select
                              value={itemData.unit || 'g'}
                              onChange={(e) => handleEditChange(item.id, 'unit', e.target.value)}
                              className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                            >
                              {weightUnits.map(unit => (
                                <option key={unit.value} value={unit.value} className="text-gray-900">{unit.label}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="font-semibold text-gray-900">{itemData.unit || 'g'}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {item.originalLine && (
                      <div className="mt-2 text-xs text-gray-500 italic">
                        Original: {item.originalLine}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold"
            >
              ← Back
            </button>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={approvedCount === 0}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Save {approvedCount} Item{approvedCount !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceReview

