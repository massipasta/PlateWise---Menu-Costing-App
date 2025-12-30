import { supabase } from '../lib/supabase'
import { calculatePlateCost, calculateSuggestedPrice } from '../utils/calculations'

/**
 * Fetch all dishes with their ingredients
 */
export const fetchDishes = async () => {
  try {
    // First, try a simple query to check if dishes table exists
    let dishes, dishesError
    
    // Try simple query first (most compatible)
    const simpleResult = await supabase
      .from('dishes')
      .select('*')
      .order('created_at', { ascending: false })
    
    dishes = simpleResult.data
    dishesError = simpleResult.error

    // If that works, try to enhance with category data
    if (!dishesError && dishes) {
      try {
        const enhancedResult = await supabase
          .from('dishes')
          .select(`
            *,
            categories:category_id (
              id,
              name,
              color
            )
          `)
          .order('created_at', { ascending: false })
        
        if (!enhancedResult.error && enhancedResult.data) {
          dishes = enhancedResult.data
        }
      } catch (joinError) {
        // Category join failed, but that's okay - use simple data
        console.warn('Category join not available:', joinError.message)
      }
    }

    if (dishesError) throw dishesError
    if (!dishes) dishes = []

    // Fetch ingredients for each dish
    const dishesWithIngredients = await Promise.all(
      dishes.map(async (dish) => {
        const { data: ingredients, error: ingredientsError } = await supabase
          .from('ingredients')
          .select('*')
          .eq('dish_id', dish.id)
          .order('created_at', { ascending: true })

        if (ingredientsError) {
          console.warn(`Error fetching ingredients for dish ${dish.id}:`, ingredientsError)
          return {
            ...dish,
            category: dish.categories || null,
            ingredients: []
          }
        }

        return {
          ...dish,
          category: dish.categories || null,
          ingredients: ingredients || []
        }
      })
    )

    return { data: dishesWithIngredients, error: null }
  } catch (error) {
    console.error('Error fetching dishes:', error)
    return { data: null, error }
  }
}

/**
 * Fetch a single dish with its ingredients
 */
export const fetchDish = async (dishId) => {
  try {
    const { data: dish, error: dishError } = await supabase
      .from('dishes')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          color
        )
      `)
      .eq('id', dishId)
      .single()

    if (dishError) throw dishError

    const { data: ingredients, error: ingredientsError } = await supabase
      .from('ingredients')
      .select('*')
      .eq('dish_id', dishId)
      .order('created_at', { ascending: true })

    if (ingredientsError) throw ingredientsError

    return {
      data: {
        ...dish,
        category: dish.categories || null,
        ingredients: ingredients || []
      },
      error: null
    }
  } catch (error) {
    console.error('Error fetching dish:', error)
    return { data: null, error }
  }
}

/**
 * Create or update a dish with ingredients
 */
export const saveDish = async (dishData) => {
  try {
    let dishId = dishData.id

    // Save or update dish
    if (dishId) {
      // Update existing dish
      const { data: dish, error: dishError } = await supabase
        .from('dishes')
        .update({
          name: dishData.name,
          target_margin: dishData.target_margin,
          selling_price: dishData.selling_price,
          category_id: dishData.category_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', dishId)
        .select()
        .single()

      if (dishError) throw dishError

      // Delete existing ingredients
      const { error: deleteError } = await supabase
        .from('ingredients')
        .delete()
        .eq('dish_id', dishId)

      if (deleteError) throw deleteError
    } else {
      // Create new dish
      const { data: dish, error: dishError } = await supabase
        .from('dishes')
        .insert({
          name: dishData.name,
          target_margin: dishData.target_margin,
          selling_price: dishData.selling_price,
          category_id: dishData.category_id || null
        })
        .select()
        .single()

      if (dishError) throw dishError
      dishId = dish.id
    }

    // Insert ingredients
    if (dishData.ingredients && dishData.ingredients.length > 0) {
      const ingredientsToInsert = dishData.ingredients.map(ing => ({
        dish_id: dishId,
        name: ing.name,
        unit_cost: ing.unit_cost || 0,
        quantity: ing.quantity,
        unit: ing.unit || 'g',
        package_cost: ing.package_cost || null,
        package_size: ing.package_size || null,
        package_unit: ing.package_unit || null
      }))

      const { error: ingredientsError } = await supabase
        .from('ingredients')
        .insert(ingredientsToInsert)

      if (ingredientsError) throw ingredientsError
    }

    // Fetch the complete dish with ingredients
    return await fetchDish(dishId)
  } catch (error) {
    console.error('Error saving dish:', error)
    return { data: null, error }
  }
}

/**
 * Delete a dish (cascade will delete ingredients)
 */
export const deleteDish = async (dishId) => {
  try {
    const { error } = await supabase
      .from('dishes')
      .delete()
      .eq('id', dishId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting dish:', error)
    return { error }
  }
}


