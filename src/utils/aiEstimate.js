/**
 * Placeholder AI cost estimation function
 * In a real implementation, this would call an AI service/API
 * to estimate ingredient costs based on the ingredient name
 */
export const estimateIngredientCost = async (ingredientName) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Generate realistic-looking estimates based on ingredient name
  // In production, this would use actual AI/ML models or market data APIs
  const name = ingredientName.toLowerCase().trim()
  
  // Expanded ingredient database with realistic costs per gram
  // Costs are in USD per gram, based on typical restaurant/wholesale pricing
  // Example: $0.025 per gram = $25 per kg = ~$11.34 per pound
  const ingredientDatabase = {
    // Grains & Starches
    'flour': { base: 0.001, variance: 0.0005 },        // ~$1/kg
    'sugar': { base: 0.0015, variance: 0.0005 },        // ~$1.50/kg
    'salt': { base: 0.0002, variance: 0.0001 },        // ~$0.20/kg
    'rice': { base: 0.002, variance: 0.001 },          // ~$2/kg
    'pasta': { base: 0.002, variance: 0.001 },         // ~$2/kg
    'bread': { base: 0.003, variance: 0.001 },          // ~$3/kg
    
    // Proteins - Poultry (wholesale prices)
    'chicken': { base: 0.008, variance: 0.003 },       // ~$8/kg = ~$3.60/lb
    'chicken breast': { base: 0.010, variance: 0.004 }, // ~$10/kg = ~$4.50/lb
    'chicken thigh': { base: 0.007, variance: 0.003 },  // ~$7/kg = ~$3.20/lb
    'turkey': { base: 0.009, variance: 0.003 },        // ~$9/kg = ~$4.10/lb
    
    // Proteins - Red Meat
    'beef': { base: 0.015, variance: 0.006 },           // ~$15/kg = ~$6.80/lb
    'ground beef': { base: 0.012, variance: 0.005 },   // ~$12/kg = ~$5.40/lb
    'steak': { base: 0.025, variance: 0.010 },         // ~$25/kg = ~$11.30/lb
    'pork': { base: 0.010, variance: 0.004 },           // ~$10/kg = ~$4.50/lb
    'bacon': { base: 0.020, variance: 0.008 },         // ~$20/kg = ~$9/lb
    'lamb': { base: 0.018, variance: 0.007 },         // ~$18/kg = ~$8.20/lb
    
    // Seafood (wholesale prices)
    'salmon': { base: 0.025, variance: 0.010 },        // ~$25/kg = ~$11.30/lb (200g = $5.00)
    'tuna': { base: 0.020, variance: 0.008 },          // ~$20/kg = ~$9/lb
    'fish': { base: 0.015, variance: 0.006 },          // ~$15/kg = ~$6.80/lb
    'shrimp': { base: 0.030, variance: 0.012 },         // ~$30/kg = ~$13.60/lb
    'crab': { base: 0.035, variance: 0.015 },          // ~$35/kg = ~$15.90/lb
    'lobster': { base: 0.050, variance: 0.020 },       // ~$50/kg = ~$22.70/lb
    
    // Dairy
    'cheese': { base: 0.012, variance: 0.005 },        // ~$12/kg = ~$5.40/lb
    'butter': { base: 0.008, variance: 0.003 },        // ~$8/kg = ~$3.60/lb
    'cream': { base: 0.006, variance: 0.002 },         // ~$6/kg = ~$2.70/lb
    'milk': { base: 0.002, variance: 0.001 },          // ~$2/kg = ~$0.90/lb
    'yogurt': { base: 0.004, variance: 0.002 },        // ~$4/kg = ~$1.80/lb
    
    // Oils & Fats
    'olive oil': { base: 0.015, variance: 0.006 },     // ~$15/kg = ~$6.80/lb
    'oil': { base: 0.010, variance: 0.004 },            // ~$10/kg = ~$4.50/lb
    'vegetable oil': { base: 0.008, variance: 0.003 }, // ~$8/kg = ~$3.60/lb
    'coconut oil': { base: 0.018, variance: 0.007 },  // ~$18/kg = ~$8.20/lb
    
    // Vegetables
    'onion': { base: 0.002, variance: 0.001 },         // ~$2/kg = ~$0.90/lb
    'garlic': { base: 0.008, variance: 0.003 },        // ~$8/kg = ~$3.60/lb
    'tomato': { base: 0.003, variance: 0.001 },        // ~$3/kg = ~$1.40/lb
    'lettuce': { base: 0.004, variance: 0.002 },       // ~$4/kg = ~$1.80/lb
    'spinach': { base: 0.005, variance: 0.002 },       // ~$5/kg = ~$2.30/lb
    'potato': { base: 0.002, variance: 0.001 },       // ~$2/kg = ~$0.90/lb
    'carrot': { base: 0.002, variance: 0.001 },       // ~$2/kg = ~$0.90/lb
    'bell pepper': { base: 0.004, variance: 0.002 },   // ~$4/kg = ~$1.80/lb
    'mushroom': { base: 0.008, variance: 0.003 },     // ~$8/kg = ~$3.60/lb
    
    // Herbs & Spices (dried, per gram is expensive)
    'herb': { base: 0.15, variance: 0.05 },          // Dried herbs are expensive
    'spice': { base: 0.20, variance: 0.08 },          // Spices are expensive
    'basil': { base: 0.12, variance: 0.04 },           // Fresh basil
    'parsley': { base: 0.010, variance: 0.004 },      // Fresh parsley
    'oregano': { base: 0.15, variance: 0.05 },        // Dried oregano
    'thyme': { base: 0.18, variance: 0.06 },          // Dried thyme
    'rosemary': { base: 0.15, variance: 0.05 },       // Dried rosemary
    'pepper': { base: 0.25, variance: 0.10 },        // Black pepper (ground)
    'paprika': { base: 0.12, variance: 0.04 },       // Paprika
    
    // Other common ingredients
    'egg': { base: 0.003, variance: 0.001 },           // ~$3/kg = ~$1.40/lb
    'eggs': { base: 0.003, variance: 0.001 },         // ~$3/kg = ~$1.40/lb
    'vinegar': { base: 0.002, variance: 0.001 },      // ~$2/kg
    'lemon': { base: 0.004, variance: 0.002 },        // ~$4/kg = ~$1.80/lb
    'lime': { base: 0.004, variance: 0.002 },          // ~$4/kg = ~$1.80/lb
    'wine': { base: 0.01, variance: 0.004 },           // Cooking wine
    'stock': { base: 0.003, variance: 0.001 },        // ~$3/kg
    'broth': { base: 0.003, variance: 0.001 },         // ~$3/kg
  }
  
  // Find matching ingredient
  let match = null
  let baseCost = 0.010 // Default fallback (~$10/kg = ~$4.50/lb)
  let variance = 0.004
  
  // Check for exact matches first
  for (const [key, value] of Object.entries(ingredientDatabase)) {
    if (name === key || name.includes(key)) {
      match = value
      baseCost = value.base
      variance = value.variance
      break
    }
  }
  
  // If no match found, try partial matching with common words
  if (!match) {
    const commonWords = ['flour', 'sugar', 'salt', 'chicken', 'beef', 'pork', 'fish', 'salmon', 
                         'cheese', 'butter', 'oil', 'herb', 'spice', 'tomato', 'onion', 'garlic']
    for (const word of commonWords) {
      if (name.includes(word)) {
        const found = ingredientDatabase[word]
        if (found) {
          baseCost = found.base
          variance = found.variance
          break
        }
      }
    }
  }
  
  // Apply premium/organic multiplier if mentioned
  if (name.includes('organic') || name.includes('premium') || name.includes('artisan')) {
    baseCost *= 1.5
    variance *= 1.2
  }
  
  // Ensure minimum values to avoid $0.00
  baseCost = Math.max(baseCost, 0.001)
  // Ensure variance is at least 20% of base cost to create a visible range
  variance = Math.max(variance, baseCost * 0.2)
  
  // Calculate estimates
  const perUnitCost = baseCost
  let minCost = Math.max(0.0001, baseCost - variance)
  let maxCost = baseCost + variance
  
  // Ensure range is visible (at least 0.001 difference for display)
  if (maxCost - minCost < 0.001) {
    const center = (minCost + maxCost) / 2
    minCost = Math.max(0.0001, center - 0.0005)
    maxCost = center + 0.0005
  }
  
  return {
    perUnitCost: perUnitCost,
    minCost: minCost,
    maxCost: maxCost,
    unit: 'g', // Default unit
    confidence: match ? 0.80 : 0.60, // Higher confidence for matched ingredients
    source: 'Market Estimate'
  }
}

