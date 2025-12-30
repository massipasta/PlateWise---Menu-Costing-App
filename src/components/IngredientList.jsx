import { calculateIngredientCost } from '../utils/unitConversions'

const IngredientList = ({ ingredients, onRemove, onEdit }) => {
  if (!ingredients || ingredients.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-gray-500 font-medium">No ingredients added yet</p>
        <p className="text-gray-400 text-sm mt-1">Add ingredients to calculate costs</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {ingredients.map((ingredient, index) => {
        // Calculate cost - use new method if package info exists, otherwise fall back to old method
        let cost = 0
        if (ingredient.package_cost && ingredient.package_size && ingredient.package_unit) {
          cost = calculateIngredientCost(
            parseFloat(ingredient.package_cost),
            parseFloat(ingredient.package_size),
            ingredient.package_unit,
            parseFloat(ingredient.quantity || 0),
            ingredient.unit || 'g'
          )
        } else {
          // Fallback for old format
          cost = parseFloat(ingredient.unit_cost || 0) * parseFloat(ingredient.quantity || 0)
        }

        const packageInfo = ingredient.package_cost && ingredient.package_size
          ? `$${parseFloat(ingredient.package_cost).toFixed(2)} for ${parseFloat(ingredient.package_size)}${ingredient.package_unit || 'g'}`
          : null

        return (
          <div
            key={ingredient.id || index}
            className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">{ingredient.name}</div>
              <div className="text-sm text-gray-600 space-y-1">
                {packageInfo && (
                  <div className="text-xs text-gray-500">
                    Package: {packageInfo}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="bg-gray-100 px-2 py-1 rounded-md font-medium">
                    {ingredient.quantity} {ingredient.unit || 'g'}
                  </span>
                  <span>used</span>
                  <span>=</span>
                  <span className="font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-base">${cost.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="ml-4 flex gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(ingredient, index)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-all hover:scale-110"
                  title="Edit ingredient"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => onRemove(ingredient.id || index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110"
                title="Remove ingredient"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default IngredientList


