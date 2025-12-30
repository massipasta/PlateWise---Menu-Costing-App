import { supabase } from '../lib/supabase'

/**
 * Fetch all categories
 */
export const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { data: null, error }
  }
}

/**
 * Create a new category
 */
export const createCategory = async (categoryData) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: categoryData.name,
        color: categoryData.color || '#9333EA',
        display_order: categoryData.display_order || 0
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating category:', error)
    return { data: null, error }
  }
}

/**
 * Update a category
 */
export const updateCategory = async (categoryId, categoryData) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: categoryData.name,
        color: categoryData.color,
        display_order: categoryData.display_order,
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating category:', error)
    return { data: null, error }
  }
}

/**
 * Delete a category
 */
export const deleteCategory = async (categoryId) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (error) throw error
    return { data: true, error: null }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { data: null, error }
  }
}

/**
 * Update the display order of multiple categories
 */
export const updateCategoryOrder = async (categoryOrders) => {
  try {
    // Update each category's display_order
    const updates = categoryOrders.map(({ id, display_order }) =>
      supabase
        .from('categories')
        .update({ display_order, updated_at: new Date().toISOString() })
        .eq('id', id)
    )

    const results = await Promise.all(updates)
    
    // Check for any errors
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      throw errors[0].error
    }

    return { data: true, error: null }
  } catch (error) {
    console.error('Error updating category order:', error)
    return { data: null, error }
  }
}






