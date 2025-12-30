import { useState, useEffect } from 'react'
import { fetchTemplates, calculateTemplateCostPerUnit } from '../services/templateService'
import { toGrams } from '../utils/unitConversions'

const TemplateSelector = ({ onSelectTemplate, onClose }) => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Always reload when modal opens
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await fetchTemplates()
      if (error) {
        console.error('Error loading templates:', error)
        setError(`Failed to load templates: ${error.message || 'Unknown error'}`)
        setTemplates([])
      } else if (data) {
        setTemplates(data)
        if (data.length === 0) {
          setError(null) // No error, just empty
        }
      } else {
        setTemplates([])
      }
    } catch (err) {
      console.error('Error loading templates:', err)
      setError(`Failed to load templates: ${err.message || 'Unknown error'}`)
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (template) => {
    try {
      const costPerUnit = calculateTemplateCostPerUnit(template)
      
      // Create an ingredient object from the template
      const templateData = {
        name: template.name,
        unit_cost: costPerUnit,
        unit: template.yield_unit || 'g',
        isTemplate: true,
        templateId: template.id,
        templateYield: template.total_yield,
        templateYieldUnit: template.yield_unit || 'g'
      }
      
      onSelectTemplate(templateData)
    } catch (error) {
      console.error('Error selecting template:', error)
      alert('Error loading template. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Select Ingredient Template</h3>
            {!loading && templates.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">{templates.length} template{templates.length !== 1 ? 's' : ''} available</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadTemplates}
              disabled={loading}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-2 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh templates"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg text-red-700">
              {error}
            </div>
          )}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No templates created yet.</p>
              <p className="text-sm text-gray-400">Create templates to reuse ingredient combinations or upload an invoice to import ingredients.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => {
                const costPerUnit = calculateTemplateCostPerUnit(template)
                return (
                  <button
                    key={template.id}
                    onClick={() => {
                      console.log('Template clicked:', template.name, template)
                      handleSelect(template)
                    }}
                    className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">{template.name}</div>
                        {template.description && (
                          <div className="text-sm text-gray-600 mb-2">{template.description}</div>
                        )}
                        <div className="text-sm text-gray-500">
                          Makes {template.total_yield} {template.yield_unit}
                          {template.ingredients?.length > 0 && (
                            <span className="ml-2">• {template.ingredients.length} ingredients</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm text-gray-600">Cost per {template.yield_unit}</div>
                        <div className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">${costPerUnit.toFixed(4)}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TemplateSelector

