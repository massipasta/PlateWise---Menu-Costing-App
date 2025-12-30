const AICostEstimateModal = ({ isOpen, onClose, onAccept, ingredientName, estimate }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <h3 className="text-xl font-bold mb-1">Cost Estimate</h3>
          <p className="text-sm opacity-90">Quick reference for: <span className="font-semibold">{ingredientName}</span></p>
        </div>
        
        <div className="p-6">
          <div className="mb-6 space-y-4">
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
              <div className="text-xs text-gray-600 mb-1 font-medium">ESTIMATED COST RANGE (starting point)</div>
              <div className="text-2xl font-bold text-purple-700">
                {estimate.minCost < 0.01 
                  ? `$${estimate.minCost.toFixed(4)} - $${estimate.maxCost.toFixed(4)}`
                  : `$${estimate.minCost.toFixed(2)} - $${estimate.maxCost.toFixed(2)}`
                }
              </div>
              <div className="text-xs text-gray-500 mt-1">estimated per {estimate.unit}</div>
            </div>
            
            <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4">
              <div className="text-xs text-gray-600 mb-1 font-medium">ESTIMATED PER-UNIT COST (starting point)</div>
              <div className="text-2xl font-bold text-pink-700">
                ${estimate.perUnitCost.toFixed(4)}
              </div>
              <div className="text-xs text-gray-500 mt-1">estimated per {estimate.unit}</div>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <div className="font-semibold mb-1">Use this as a starting point</div>
                <div className="text-xs">These estimates are meant to help you get started and serve as a quick sanity check. They're based on general market trends, but your actual costs will depend on your location, supplier, and the specific quality you choose. Always verify with your suppliers before finalizing your menu prices.</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Use as Starting Point
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AICostEstimateModal

