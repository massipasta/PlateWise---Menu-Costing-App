import { useState } from 'react'
import InvoiceReview from './InvoiceReview'

const InvoiceUpload = ({ onClose, onSaveIngredients }) => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [error, setError] = useState(null)

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or image file (JPG, PNG)')
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setFile(selectedFile)
    setError(null)

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const handleExtract = async () => {
    if (!file) return

    setExtracting(true)
    setError(null)

    try {
      // Import Tesseract dynamically
      const Tesseract = (await import('tesseract.js')).default

      let imageData
      if (file.type === 'application/pdf') {
        // For PDFs, we'd need to convert to image first
        // For now, show a message that PDF support is coming
        setError('PDF support is coming soon. Please upload an image file for now.')
        setExtracting(false)
        return
      } else {
        // For images, use the file directly
        imageData = file
      }

      // Perform OCR
      const { data: { text } } = await Tesseract.recognize(
        imageData,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              // Could show progress here
            }
          }
        }
      )

      // Parse the extracted text to find line items
      const lineItems = parseInvoiceText(text)
      setExtractedData({ text, lineItems })
    } catch (err) {
      console.error('OCR Error:', err)
      setError('Failed to extract text from invoice. Please try again or enter costs manually.')
    } finally {
      setExtracting(false)
    }
  }

  const parseInvoiceText = (text) => {
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    const items = []

    // Common patterns for invoice line items:
    // - "Item Name $XX.XX"
    // - "Item Name | $XX.XX"
    // - "Item Name     $XX.XX"
    // - "Qty Item Name $XX.XX"
    
    const pricePattern = /\$?\s*(\d+\.?\d*)\s*$/ // Matches prices at end of line
    const qtyPattern = /^(\d+\.?\d*)\s+/ // Matches quantity at start

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Skip headers, totals, and common invoice words
      const skipWords = ['total', 'subtotal', 'tax', 'invoice', 'date', 'due', 'amount', 'description', 'item', 'qty', 'quantity', 'price']
      if (skipWords.some(word => line.toLowerCase().includes(word) && line.length < 30)) {
        continue
      }

      // Try to find a price in the line
      const priceMatch = line.match(pricePattern)
      if (priceMatch) {
        const price = parseFloat(priceMatch[1])
        
        // Skip if price is too large (likely a total) or too small
        if (price > 1000 || price < 0.01) continue

        // Extract item name (everything before the price)
        let itemName = line.substring(0, priceMatch.index).trim()
        
        // Remove quantity if present
        const qtyMatch = itemName.match(qtyPattern)
        if (qtyMatch) {
          itemName = itemName.substring(qtyMatch[0].length).trim()
        }

        // Clean up item name
        itemName = itemName
          .replace(/[^\w\s&'-]/g, ' ') // Remove special chars except common ones
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim()

        // Skip if name is too short or looks like a price
        if (itemName.length < 2 || /^\d+$/.test(itemName)) continue

        items.push({
          id: Date.now() + i,
          name: itemName,
          price: price,
          originalLine: line
        })
      }
    }

    return items
  }

  const handleApprove = (approvedItems) => {
    onSaveIngredients(approvedItems)
    onClose()
  }

  if (extractedData) {
    return (
      <InvoiceReview
        items={extractedData.lineItems}
        onApprove={handleApprove}
        onBack={() => setExtractedData(null)}
        onCancel={onClose}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold mb-1">Upload Invoice</h3>
              <p className="text-sm opacity-90">Extract ingredient costs from your supplier invoice</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Show uploaded file preview at top if file is selected */}
          {file && preview && (
            <div className="mb-6">
              <label className="block text-base font-bold text-gray-700 mb-3">
                Uploaded Invoice
              </label>
              <div className="bg-gray-50 border-2 border-purple-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-gray-900">{file.name}</div>
                      <div className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null)
                      setPreview(null)
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Remove file"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <img
                  src={preview}
                  alt="Invoice preview"
                  className="w-full max-h-96 object-contain rounded-lg border-2 border-gray-200 bg-white"
                />
              </div>
            </div>
          )}

          {/* File upload area - shown at top if no file, or below if file is selected */}
          <div className={file ? "mb-6" : "mb-6"}>
            <label className="block text-base font-bold text-gray-700 mb-3">
              {file ? 'Change File' : 'Select Invoice File'}
            </label>
            <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 sm:p-8 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
                id="invoice-upload"
                disabled={extracting}
              />
              <label
                htmlFor="invoice-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg className="w-12 h-12 text-purple-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-gray-700 font-medium mb-1">
                  {file ? 'Click to upload a different file' : 'Click to upload PDF or image'}
                </span>
                <span className="text-sm text-gray-500">
                  PDF, JPG, or PNG (max 10MB)
                </span>
              </label>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white pt-6 pb-2 border-t-2 border-purple-100 mt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all text-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleExtract}
                disabled={!file || extracting}
                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg min-w-[220px]"
              >
                {extracting ? (
                  <>
                    <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Extract Costs</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceUpload

