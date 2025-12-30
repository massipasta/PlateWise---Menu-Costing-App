import { supabase } from '../lib/supabase'
import { calculatePlateCost } from '../utils/calculations'

/**
 * Fetch all ingredient templates
 */
export const fetchTemplates = async () => {
  try {
    const { data: templates, error: templatesError } = await supabase
      .from('ingredient_templates')
      .select('*')
      .order('name', { ascending: true })

    if (templatesError) throw templatesError

    // Fetch ingredients for each template
    const templatesWithIngredients = await Promise.all(
      templates.map(async (template) => {
        const { data: ingredients, error: ingredientsError } = await supabase
          .from('template_ingredients')
          .select('*')
          .eq('template_id', template.id)
          .order('created_at', { ascending: true })

        if (ingredientsError) throw ingredientsError

        return {
          ...template,
          ingredients: ingredients || []
        }
      })
    )

    return { data: templatesWithIngredients, error: null }
  } catch (error) {
    console.error('Error fetching templates:', error)
    return { data: null, error }
  }
}

/**
 * Calculate cost per unit for a template
 */
export const calculateTemplateCostPerUnit = (template) => {
  if (!template.ingredients || template.ingredients.length === 0) return 0
  
  const totalCost = calculatePlateCost(template.ingredients)
  const totalYield = parseFloat(template.total_yield || 0)
  
  if (totalYield === 0) return 0
  
  return totalCost / totalYield
}

/**
 * Save an ingredient template
 */
export const saveTemplate = async (templateData) => {
  try {
    let templateId = templateData.id

    // Save or update template
    if (templateId) {
      const { data: template, error: templateError } = await supabase
        .from('ingredient_templates')
        .update({
          name: templateData.name,
          description: templateData.description || null,
          total_yield: templateData.total_yield,
          yield_unit: templateData.yield_unit || 'g',
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .select()
        .single()

      if (templateError) throw templateError

      // Delete existing template ingredients
      const { error: deleteError } = await supabase
        .from('template_ingredients')
        .delete()
        .eq('template_id', templateId)

      if (deleteError) throw deleteError
    } else {
      const { data: template, error: templateError } = await supabase
        .from('ingredient_templates')
        .insert({
          name: templateData.name,
          description: templateData.description || null,
          total_yield: templateData.total_yield,
          yield_unit: templateData.yield_unit || 'g'
        })
        .select()
        .single()

      if (templateError) throw templateError
      templateId = template.id
    }

    // Insert template ingredients
    if (templateData.ingredients && templateData.ingredients.length > 0) {
      const ingredientsToInsert = templateData.ingredients.map(ing => ({
        template_id: templateId,
        name: ing.name,
        unit_cost: ing.unit_cost || 0,
        quantity: ing.quantity,
        unit: ing.unit || 'g',
        package_cost: ing.package_cost || null,
        package_size: ing.package_size || null,
        package_unit: ing.package_unit || null
      }))

      const { error: ingredientsError } = await supabase
        .from('template_ingredients')
        .insert(ingredientsToInsert)

      if (ingredientsError) throw ingredientsError
    }

    return { data: { id: templateId }, error: null }
  } catch (error) {
    console.error('Error saving template:', error)
    return { data: null, error }
  }
}

/**
 * Delete an ingredient template
 */
export const deleteTemplate = async (templateId) => {
  try {
    const { error } = await supabase
      .from('ingredient_templates')
      .delete()
      .eq('id', templateId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting template:', error)
    return { error }
  }
}






