import { supabase } from '../lib/supabase'

/**
 * Fetch all menus with their dishes
 */
export const fetchMenus = async () => {
  try {
    const { data: menus, error: menusError } = await supabase
      .from('menus')
      .select('*')
      .order('created_at', { ascending: false })

    if (menusError) throw menusError

    // Fetch dishes for each menu
    const menusWithDishes = await Promise.all(
      menus.map(async (menu) => {
        const { data: menuDishes, error: menuDishesError } = await supabase
          .from('menu_dishes')
          .select(`
            *,
            dishes:dish_id (
              id,
              name,
              target_margin,
              selling_price,
              category_id
            )
          `)
          .eq('menu_id', menu.id)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: true })

        if (menuDishesError) throw menuDishesError

        // Fetch ingredients for each dish
        const dishesWithIngredients = await Promise.all(
          (menuDishes || []).map(async (menuDish) => {
            if (!menuDish.dishes) return null
            
            const { data: ingredients, error: ingredientsError } = await supabase
              .from('ingredients')
              .select('*')
              .eq('dish_id', menuDish.dishes.id)
              .order('created_at', { ascending: true })

            if (ingredientsError) throw ingredientsError

            return {
              ...menuDish.dishes,
              ingredients: ingredients || [],
              menu_dish_id: menuDish.id,
              display_order: menuDish.display_order
            }
          })
        )

        return {
          ...menu,
          dishes: dishesWithIngredients.filter(d => d !== null)
        }
      })
    )

    return { data: menusWithDishes, error: null }
  } catch (error) {
    console.error('Error fetching menus:', error)
    return { data: null, error }
  }
}

/**
 * Create a new menu
 */
export const createMenu = async (menuData) => {
  try {
    const { data, error } = await supabase
      .from('menus')
      .insert({
        name: menuData.name,
        description: menuData.description || null
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating menu:', error)
    return { data: null, error }
  }
}

/**
 * Update a menu
 */
export const updateMenu = async (menuId, menuData) => {
  try {
    const { data, error } = await supabase
      .from('menus')
      .update({
        name: menuData.name,
        description: menuData.description || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', menuId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating menu:', error)
    return { data: null, error }
  }
}

/**
 * Delete a menu
 */
export const deleteMenu = async (menuId) => {
  try {
    const { error } = await supabase
      .from('menus')
      .delete()
      .eq('id', menuId)

    if (error) throw error
    return { data: true, error: null }
  } catch (error) {
    console.error('Error deleting menu:', error)
    return { data: null, error }
  }
}

/**
 * Add a dish to a menu
 */
export const addDishToMenu = async (menuId, dishId, displayOrder = 0) => {
  try {
    const { data, error } = await supabase
      .from('menu_dishes')
      .insert({
        menu_id: menuId,
        dish_id: dishId,
        display_order: displayOrder
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error adding dish to menu:', error)
    return { data: null, error }
  }
}

/**
 * Remove a dish from a menu
 */
export const removeDishFromMenu = async (menuId, dishId) => {
  try {
    const { error } = await supabase
      .from('menu_dishes')
      .delete()
      .eq('menu_id', menuId)
      .eq('dish_id', dishId)

    if (error) throw error
    return { data: true, error: null }
  } catch (error) {
    console.error('Error removing dish from menu:', error)
    return { data: null, error }
  }
}

/**
 * Update display order of dishes in a menu
 */
export const updateMenuDishOrder = async (menuId, dishOrders) => {
  try {
    const updates = dishOrders.map(({ menuDishId, displayOrder }) =>
      supabase
        .from('menu_dishes')
        .update({ display_order: displayOrder })
        .eq('id', menuDishId)
    )

    const results = await Promise.all(updates)
    const errors = results.filter(r => r.error)

    if (errors.length > 0) throw errors[0].error
    return { data: true, error: null }
  } catch (error) {
    console.error('Error updating menu dish order:', error)
    return { data: null, error }
  }
}






