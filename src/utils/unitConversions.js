/**
 * Convert weight to grams (base unit)
 */
export const toGrams = (value, unit) => {
  const conversions = {
    'g': 1,
    'gram': 1,
    'grams': 1,
    'kg': 1000,
    'kilogram': 1000,
    'kilograms': 1000,
    'oz': 28.3495,
    'ounce': 28.3495,
    'ounces': 28.3495,
    'lb': 453.592,
    'lbs': 453.592,
    'pound': 453.592,
    'pounds': 453.592,
    'ml': 1, // 1 ml ≈ 1 g for most liquids (water-based approximation)
    'milliliter': 1,
    'milliliters': 1,
    'fl oz': 29.5735, // 1 US fluid ounce = 29.5735 ml ≈ 29.5735 g
    'floz': 29.5735,
    'fluid ounce': 29.5735,
    'fluid ounces': 29.5735
  }
  
  const normalizedUnit = unit.toLowerCase().trim()
  const multiplier = conversions[normalizedUnit] || 1
  return value * multiplier
}

/**
 * Convert grams to a specific unit
 */
export const fromGrams = (grams, unit) => {
  const conversions = {
    'g': 1,
    'gram': 1,
    'grams': 1,
    'kg': 0.001,
    'kilogram': 0.001,
    'kilograms': 0.001,
    'oz': 0.035274,
    'ounce': 0.035274,
    'ounces': 0.035274,
    'lb': 0.00220462,
    'lbs': 0.00220462,
    'pound': 0.00220462,
    'pounds': 0.00220462,
    'ml': 1, // 1 ml ≈ 1 g for most liquids
    'milliliter': 1,
    'milliliters': 1,
    'fl oz': 0.033814, // 1 gram ≈ 0.033814 fl oz
    'floz': 0.033814,
    'fluid ounce': 0.033814,
    'fluid ounces': 0.033814
  }
  
  const normalizedUnit = unit.toLowerCase().trim()
  const multiplier = conversions[normalizedUnit] || 1
  return grams * multiplier
}

/**
 * Calculate ingredient cost based on package cost, package size, and quantity used
 * 
 * Formula: cost = (package_cost / package_size) × quantity_used
 * 
 * This is equivalent to: cost = unit_cost × quantity
 *   where unit_cost = package_cost / package_size
 * 
 * Example: $5.00 for 200g package, using 50g
 *   unit_cost = $5.00 / 200g = $0.025 per gram
 *   cost = $0.025 × 50g = $1.25
 * 
 * @param {number} packageCost - Total cost of the package
 * @param {number} packageSize - Total size/weight of the package
 * @param {string} packageUnit - Unit of measurement for package size (g, kg, oz, lb, ml, fl oz)
 * @param {number} quantityUsed - Amount used in the dish
 * @param {string} quantityUnit - Unit of measurement for quantity used (g, kg, oz, lb, ml, fl oz)
 * @returns {number} Cost for the quantity used
 */
export const calculateIngredientCost = (packageCost, packageSize, packageUnit, quantityUsed, quantityUnit) => {
  // Convert everything to grams (base unit) for consistent calculation
  const packageSizeInGrams = toGrams(packageSize, packageUnit)
  const quantityUsedInGrams = toGrams(quantityUsed, quantityUnit)
  
  if (packageSizeInGrams === 0) return 0
  
  // Calculate unit cost: unit_cost = package_cost / package_size
  const costPerGram = packageCost / packageSizeInGrams
  
  // Calculate cost for quantity used: cost = unit_cost × quantity
  return costPerGram * quantityUsedInGrams
}

