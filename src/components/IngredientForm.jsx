import { useState, useEffect } from 'react'
import { calculateIngredientCost } from '../utils/unitConversions'
import TemplateSelector from './TemplateSelector'
import AICostEstimateModal from './AICostEstimateModal'
import { estimateIngredientCost } from '../utils/aiEstimate'

const IngredientForm = ({ onAdd, initialValue }) => {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showAIEstimate, setShowAIEstimate] = useState(false)
  const [aiEstimate, setAiEstimate] = useState(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [costingMode, setCostingMode] = useState('package') // 'package' or 'individual'
  const [name, setName] = useState('')
  
  // Package-based fields
  const [packageCost, setPackageCost] = useState('')
  const [packageSize, setPackageSize] = useState('')
  const [packageUnit, setPackageUnit] = useState('g')
  const [quantityUsed, setQuantityUsed] = useState('')
  const [quantityUnit, setQuantityUnit] = useState('g')
  
  // Individual-based fields
  const [unitCost, setUnitCost] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('g')

  // Populate form when initialValue changes (for editing)
  useEffect(() => {
    if (initialValue) {
      setName(initialValue.name || '')
      if (initialValue.package_cost && initialValue.package_size) {
        // Package-based
        setCostingMode('package')
        setPackageCost(initialValue.package_cost.toString())
        setPackageSize(initialValue.package_size.toString())
        setPackageUnit(initialValue.package_unit || 'g')
        setQuantityUsed(initialValue.quantity?.toString() || '')
        setQuantityUnit(initialValue.unit || 'g')
      } else {
        // Individual-based
        setCostingMode('individual')
        setUnitCost(initialValue.unit_cost?.toString() || '')
        setQuantity(initialValue.quantity?.toString() || '')
        setUnit(initialValue.unit || 'g')
      }
    } else {
      // Reset form
      setName('')
      setCostingMode('package')
      setPackageCost('')
      setPackageSize('')
      setPackageUnit('g')
      setQuantityUsed('')
      setQuantityUnit('g')
      setUnitCost('')
      setQuantity('')
      setUnit('g')
    }
  }, [initialValue])

  const weightUnits = [
    { value: 'g', label: 'Grams (g)' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'oz', label: 'Ounces (oz)' },
    { value: 'lb', label: 'Pounds (lb)' },
    { value: 'ml', label: 'Milliliters (ml)' },
    { value: 'fl oz', label: 'Fluid Ounces (fl oz)' }
  ]

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!name) return
    
    if (costingMode === 'package') {
      // Package-based validation
      if (!packageCost || !packageSize || !quantityUsed) return
      
      const packageCostNum = parseFloat(packageCost)
      const packageSizeNum = parseFloat(packageSize)
      const quantityUsedNum = parseFloat(quantityUsed)

      // Calculate the actual cost for the quantity used
      const actualCost = calculateIngredientCost(
        packageCostNum,
        packageSizeNum,
        packageUnit,
        quantityUsedNum,
        quantityUnit
      )

      // Calculate cost per unit (for display purposes)
      const costPerUnit = packageSizeNum > 0 ? packageCostNum / packageSizeNum : 0

      onAdd({
        name: name.trim(),
        unit_cost: costPerUnit,
        quantity: quantityUsedNum,
        unit: quantityUnit,
        package_cost: packageCostNum,
        package_size: packageSizeNum,
        package_unit: packageUnit
      })

      // Reset form
      setName('')
      setPackageCost('')
      setPackageSize('')
      setPackageUnit('g')
      setQuantityUsed('')
      setQuantityUnit('g')
    } else {
      // Individual-based validation
      if (!unitCost || !quantity) return
      
      const unitCostNum = parseFloat(unitCost)
      const quantityNum = parseFloat(quantity)
      const cost = unitCostNum * quantityNum

      onAdd({
        name: name.trim(),
        unit_cost: unitCostNum,
        quantity: quantityNum,
        unit: unit,
        package_cost: null,
        package_size: null,
        package_unit: null
      })

      // Reset form
      setName('')
      setUnitCost('')
      setQuantity('')
      setUnit('g')
    }
  }

  const handleAIEstimate = async () => {
    if (!name.trim()) return
    
    setIsEstimating(true)
    try {
      const estimate = await estimateIngredientCost(name.trim())
      setAiEstimate(estimate)
      setShowAIEstimate(true)
    } catch (error) {
      console.error('Error estimating cost:', error)
      alert('Unable to get cost estimate right now. Please try again or enter the cost manually.')
    } finally {
      setIsEstimating(false)
    }
  }

  const handleAcceptEstimate = () => {
    if (!aiEstimate) return
    
    // Set the form to individual mode and populate with estimate
    setCostingMode('individual')
    setUnitCost(aiEstimate.perUnitCost.toFixed(4))
    setUnit(aiEstimate.unit)
    setShowAIEstimate(false)
    setAiEstimate(null)
  }

  // Calculate cost for display
  const calculatedCost = costingMode === 'package'
    ? (packageCost && packageSize && quantityUsed
        ? calculateIngredientCost(
            parseFloat(packageCost) || 0,
            parseFloat(packageSize) || 0,
            packageUnit,
            parseFloat(quantityUsed) || 0,
            quantityUnit
          )
        : 0)
    : (unitCost && quantity
        ? parseFloat(unitCost || 0) * parseFloat(quantity || 0)
        : 0)

  return (
    <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-5 rounded-2xl border-2 border-purple-200 backdrop-blur-sm">
      {/* Costing Mode Toggle */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">How do you buy this ingredient?</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="costingMode"
              value="package"
              checked={costingMode === 'package'}
              onChange={(e) => setCostingMode(e.target.value)}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">By Package</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="costingMode"
              value="individual"
              checked={costingMode === 'individual'}
              onChange={(e) => setCostingMode(e.target.value)}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">By Unit</span>
          </label>
        </div>
      </div>

      {/* Ingredient Name - Always shown */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700">Ingredient Name</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowTemplateSelector(true)}
              className="text-sm bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent hover:from-pink-700 hover:to-purple-700 font-bold transition-all"
            >
              Use Template
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ingredient name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all"
          />
          <button
            type="button"
            onClick={handleAIEstimate}
            disabled={!name.trim() || isEstimating}
            className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-400 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105 whitespace-nowrap"
            title="Get a quick cost estimate to use as a starting point"
          >
            {isEstimating ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs">Estimating...</span>
              </div>
            ) : (
              <span className="text-xs">Get cost estimate</span>
            )}
          </button>
        </div>
      </div>

      {/* Package-Based Form */}
      {costingMode === 'package' && (
        <>
            <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Package Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Package cost"
                    value={packageCost}
                    onChange={(e) => setPackageCost(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Package size"
                    value={packageSize}
                    onChange={(e) => setPackageSize(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <select
                    value={packageUnit}
                    onChange={(e) => setPackageUnit(e.target.value)}
                    className="px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
                  >
                    {weightUnits.map(unit => (
                      <option key={unit.value} value={unit.value} className="text-gray-900">{unit.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

            <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Amount Used</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Quantity used"
                    value={quantityUsed}
                    onChange={(e) => setQuantityUsed(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <select
                    value={quantityUnit}
                    onChange={(e) => setQuantityUnit(e.target.value)}
                    className="px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
                  >
                    {weightUnits.map(unit => (
                      <option key={unit.value} value={unit.value} className="text-gray-900">{unit.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="md:col-span-1">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-3 h-full flex flex-col justify-center">
              <div className="text-xs text-gray-600 mb-1 font-medium">Calculated Cost</div>
              <div className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">${calculatedCost.toFixed(2)}</div>
            </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Individual-Based Form */}
      {costingMode === 'individual' && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Cost Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10">$</span>
              <input
                type="number"
                step="0.01"
                placeholder="Unit cost"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all relative z-0"
              />
            </div>
            <div>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all bg-white text-gray-900"
                >
                  {weightUnits.map(unitOption => (
                    <option key={unitOption.value} value={unitOption.value} className="text-gray-900">{unitOption.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-3 h-full flex flex-col justify-center min-h-[52px]">
                <div className="text-xs text-gray-600 mb-1 font-medium">Calculated Cost</div>
                <div className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">${calculatedCost.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={handleAdd}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500 text-white rounded-xl hover:from-pink-600 hover:via-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200 font-bold flex items-center justify-center gap-2 transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Ingredient
        </button>
      </div>

      {showTemplateSelector && (
        <TemplateSelector
          onSelectTemplate={(template) => {
            // Automatically add the template as an ingredient with default quantity
            const defaultQuantity = 1
            const ingredient = {
              name: template.name,
              unit_cost: template.unit_cost,
              quantity: defaultQuantity,
              unit: template.templateYieldUnit || template.unit || 'g',
              package_cost: null,
              package_size: null,
              package_unit: null
            }
            onAdd(ingredient)
            setShowTemplateSelector(false)
          }}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}

      {showAIEstimate && aiEstimate && (
        <AICostEstimateModal
          isOpen={showAIEstimate}
          onClose={() => {
            setShowAIEstimate(false)
            setAiEstimate(null)
          }}
          onAccept={handleAcceptEstimate}
          ingredientName={name}
          estimate={aiEstimate}
        />
      )}
    </div>
  )
}

export default IngredientForm


