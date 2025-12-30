import { useState } from 'react'
import { calculatePlateCost, calculateSuggestedPrice, calculateFoodCostPercentage } from '../utils/calculations'
import { exportDishToPDF, exportDishToCSV } from '../utils/exportUtils'

const DishCard = ({ dish, onEdit, onDelete }) => {
  const [showExportMenu, setShowExportMenu] = useState(false)
  
  const plateCost = calculatePlateCost(dish.ingredients || [])
  const suggestedPrice = calculateSuggestedPrice(plateCost, dish.target_margin || 30)
  const targetMargin = dish.target_margin || 30
  
  // Use selling price if available, otherwise use suggested price for calculations
  const sellingPrice = dish.selling_price || suggestedPrice
  const foodCostPercentage = calculateFoodCostPercentage(plateCost, sellingPrice)
  const grossProfit = sellingPrice - plateCost
  
  // Determine if food cost is above or below target
  const isAboveTarget = foodCostPercentage > targetMargin
  const isBelowTarget = foodCostPercentage <= targetMargin && sellingPrice > 0
  
  // Border color based on food cost vs target
  const borderColor = isAboveTarget 
    ? 'border-red-300' 
    : isBelowTarget 
      ? 'border-green-300' 
      : 'border-gray-100'

  const handleExportPDF = () => {
    exportDishToPDF(dish)
    setShowExportMenu(false)
  }

  const handleExportCSV = () => {
    exportDishToCSV(dish)
    setShowExportMenu(false)
  }

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${borderColor} group transform hover:-translate-y-1`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
              {dish.name}
            </h3>
            {dish.category && (
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: dish.category.color || '#9333EA' }}
                />
                <span className="text-xs font-medium text-gray-600">{dish.category.name}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 relative">
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-110"
                title="Export dish"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              {showExportMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowExportMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                    <button
                      onClick={handleExportPDF}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Export PDF
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export CSV
                    </button>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => onEdit(dish)}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-all hover:scale-110"
              title="Edit dish"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(dish.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110"
              title="Delete dish"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Summary Box */}
          <div className={`pt-4 pb-4 px-4 rounded-xl backdrop-blur-sm ${
            isAboveTarget 
              ? 'bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-300 shadow-md' 
              : isBelowTarget 
                ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-300 shadow-md' 
                : 'bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-2 border-purple-200'
          }`}>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Plate Cost</span>
              <span className="text-xl font-bold text-gray-900">${plateCost.toFixed(2)}</span>
            </div>
            
            {sellingPrice > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Food Cost</span>
                  <span className={`text-xl font-bold ${
                    isAboveTarget ? 'text-red-600' : isBelowTarget ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {foodCostPercentage.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Profit per Dish</span>
                  <span className={`text-xl font-bold ${
                    isAboveTarget ? 'text-red-600' : isBelowTarget ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    ${grossProfit.toFixed(2)}
                  </span>
                </div>
                
                <div className="pt-2 border-t border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Price</span>
                    <span className="text-sm font-semibold text-gray-700">${sellingPrice.toFixed(2)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Suggested Price</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">${suggestedPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DishCard


