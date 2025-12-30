import { calculatePlateCost, calculateFoodCostPercentage, calculateSuggestedPrice } from '../utils/calculations'

const CalculationsDisplay = ({ ingredients, targetMargin = 30, sellingPrice = 0 }) => {
  const plateCost = calculatePlateCost(ingredients)
  const suggestedPrice = calculateSuggestedPrice(plateCost, targetMargin)
  const foodCostPercentage = calculateFoodCostPercentage(plateCost, sellingPrice || suggestedPrice)

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-200 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
          <div className="text-sm text-gray-600 mb-1 font-medium">Plate Cost</div>
          <div className="text-2xl font-bold text-gray-900">${plateCost.toFixed(2)}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-purple-300 shadow-md">
          <div className="text-sm text-gray-600 mb-1 font-medium">Suggested Price</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">${suggestedPrice.toFixed(2)}</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
          <div className="text-sm text-gray-600 mb-1 font-medium">Food Cost</div>
          <div className="text-2xl font-bold text-gray-900">
            {sellingPrice ? foodCostPercentage.toFixed(1) : '—'}%
          </div>
          {sellingPrice && foodCostPercentage > targetMargin && (
            <div className="text-xs text-red-600 mt-1 font-semibold">Above target</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CalculationsDisplay


