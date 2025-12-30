import { calculateIngredientCost } from './unitConversions'

/**
 * Calculate total plate cost from ingredients
 * Formula: Plate cost = sum of (ingredient unit cost × quantity)
 * 
 * For package-based ingredients: 
 *   unit_cost = package_cost / package_size
 *   cost = unit_cost × quantity_used
 * 
 * @param {Array} ingredients - Array of ingredient objects
 * @returns {number} Total cost
 */
export const calculatePlateCost = (ingredients) => {
  if (!ingredients || ingredients.length === 0) return 0
  
  // Sum all ingredient costs: Plate cost = Σ(unit_cost × quantity)
  return ingredients.reduce((total, ingredient) => {
    let cost = 0
    
    // Package-based calculation (new method)
    // Formula: cost = (package_cost / package_size) × quantity_used
    // This is equivalent to: unit_cost × quantity where unit_cost = package_cost / package_size
    if (ingredient.package_cost && ingredient.package_size && ingredient.package_unit) {
      cost = calculateIngredientCost(
        parseFloat(ingredient.package_cost),
        parseFloat(ingredient.package_size),
        ingredient.package_unit,
        parseFloat(ingredient.quantity || 0),
        ingredient.unit || 'g'
      )
    } else {
      // Direct calculation (fallback for old format)
      // Formula: cost = unit_cost × quantity
      cost = parseFloat(ingredient.unit_cost || 0) * parseFloat(ingredient.quantity || 0)
    }
    
    return total + cost
  }, 0)
}

/**
 * Calculate food cost percentage
 * Formula: Food cost % = (plate cost / selling price) × 100
 * 
 * Example: If plate cost is $3.00 and selling price is $10.00
 *   Food cost % = ($3.00 / $10.00) × 100 = 30%
 * 
 * @param {number} plateCost - Total plate cost
 * @param {number} sellingPrice - Selling price of the dish
 * @returns {number} Food cost percentage (0-100)
 */
export const calculateFoodCostPercentage = (plateCost, sellingPrice) => {
  if (!sellingPrice || sellingPrice === 0) return 0
  
  // Formula: Food cost % = (plate cost / selling price) × 100
  return (plateCost / sellingPrice) * 100
}

/**
 * Calculate suggested selling price based on target food cost percentage
 * Formula: Suggested selling price = plate cost / (target food cost % / 100)
 * 
 * Derivation:
 *   - We want: plate_cost = selling_price × (target_food_cost_% / 100)
 *   - Solving for selling_price: selling_price = plate_cost / (target_food_cost_% / 100)
 * 
 * Example: If plate cost is $3.00 and target is 30%
 *   Suggested price = $3.00 / (30 / 100) = $3.00 / 0.30 = $10.00
 *   Verification: $3.00 / $10.00 = 30% ✓
 * 
 * @param {number} plateCost - Total plate cost
 * @param {number} targetMargin - Target food cost percentage (e.g., 30 for 30%)
 * @returns {number} Suggested selling price
 */
export const calculateSuggestedPrice = (plateCost, targetMargin = 30) => {
  if (!plateCost || plateCost === 0) return 0
  if (!targetMargin || targetMargin === 0) return 0
  
  // Formula: Suggested selling price = plate cost / (target food cost % / 100)
  // Convert percentage to decimal: targetMargin / 100
  // Then divide plate cost by that decimal
  return plateCost / (targetMargin / 100)
}


