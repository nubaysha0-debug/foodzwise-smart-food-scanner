import React, { useState } from 'react';
import { X, FileText, Check, AlertCircle, RefreshCw } from 'lucide-react';
import {
  parseNutritionFromText,
  createProductFromOcr,
  SAMPLE_LABEL_PRESETS,
  ParsedLabelResult
} from '../services/ocrService';
import { Product } from '../types/food';

interface OcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (product: Product) => void;
}

export const OcrModal: React.FC<OcrModalProps> = ({
  isOpen,
  onClose,
  onProductCreated
}) => {
  const [inputText, setInputText] = useState(SAMPLE_LABEL_PRESETS[0].text);
  const [parsed, setParsed] = useState<ParsedLabelResult>(() => parseNutritionFromText(SAMPLE_LABEL_PRESETS[0].text));
  const [activeStep, setActiveStep] = useState<'input' | 'review'>('input');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleParseText = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const result = parseNutritionFromText(inputText);
      setParsed(result);
      setIsProcessing(false);
      setActiveStep('review');
    }, 200);
  };

  const handleApplyPreset = (presetText: string) => {
    setInputText(presetText);
    const result = parseNutritionFromText(presetText);
    setParsed(result);
  };

  const handleFieldChange = (field: string, value: string | number) => {
    if (field === 'productName') {
      setParsed(prev => ({ ...prev, productName: String(value) }));
    } else if (field === 'brand') {
      setParsed(prev => ({ ...prev, brand: String(value) }));
    } else if (field === 'ingredientsText') {
      setParsed(prev => ({ ...prev, ingredientsText: String(value) }));
    } else {
      setParsed(prev => ({
        ...prev,
        nutrition: {
          ...prev.nutrition,
          [field]: typeof value === 'number' ? value : parseFloat(String(value)) || 0
        }
      }));
    }
  };

  const handleFinalSubmit = () => {
    const product = createProductFromOcr(parsed);
    onProductCreated(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#12382c]" />
            <h2 className="text-lg font-bold text-stone-900">Nutrition Label OCR Parser</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveStep('input')}
              className={`flex items-center gap-1.5 cursor-pointer ${
                activeStep === 'input' ? 'text-[#12382c] font-bold' : 'text-stone-500'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-stone-200 flex items-center justify-center text-[10px]">1</span>
              <span>Input / Paste Text</span>
            </button>
            <span>→</span>
            <button
              onClick={() => setActiveStep('review')}
              className={`flex items-center gap-1.5 cursor-pointer ${
                activeStep === 'review' ? 'text-[#12382c] font-bold' : 'text-stone-500'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-stone-200 flex items-center justify-center text-[10px]">2</span>
              <span>Review &amp; Edit Nutrients</span>
            </button>
          </div>
          {activeStep === 'review' && (
            <span className="text-[#12382c] bg-[#edf4f0] px-2 py-0.5 rounded text-[11px] font-medium border border-[#cbe0d5]">
              Extraction confidence: {parsed.confidence}%
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeStep === 'input' ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="ocr-text-input" className="text-xs font-bold text-stone-800">
                    Paste Nutrition Facts &amp; Ingredients Table Text
                  </label>
                  <span className="text-xs text-stone-500">Per 100g / 100ml preferred</span>
                </div>
                <textarea
                  id="ocr-text-input"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  rows={8}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-xs leading-relaxed focus:border-[#12382c] focus:outline-hidden"
                  placeholder="Paste OCR text here..."
                />
              </div>

              {/* Sample presets */}
              <div>
                <span className="text-xs font-semibold text-stone-700 block mb-2">
                  Or load sample Indian packaged food labels:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SAMPLE_LABEL_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset.text)}
                      className="text-left p-2.5 bg-stone-50 hover:bg-[#edf5f1] border border-stone-200 hover:border-[#1b4d3e] rounded-lg transition-colors group cursor-pointer"
                    >
                      <p className="text-xs font-bold text-stone-800 group-hover:text-[#12382c]">
                        {preset.label}
                      </p>
                      <span className="text-[11px] text-stone-500">{preset.category}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleParseText}
                  disabled={isProcessing || !inputText.trim()}
                  className="px-5 py-2.5 bg-[#12382c] hover:bg-[#1a4a3a] disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Parsing Table...</span>
                    </>
                  ) : (
                    <>
                      <span>Parse Nutrition Values</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-[#edf4f0] border border-[#cbe0d5] rounded-xl text-xs text-[#12382c] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#1b4d3e] shrink-0 mt-0.5" />
                <p>
                  Review the extracted values below. Indian FSSAI guidelines require values per 100g. You can edit any figure before generating your health scorecard.
                </p>
              </div>

              {/* Basic product info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="product-name-input" className="block text-xs font-semibold text-stone-700 mb-1">Product Title</label>
                  <input
                    id="product-name-input"
                    type="text"
                    value={parsed.productName}
                    onChange={e => handleFieldChange('productName', e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="brand-name-input" className="block text-xs font-semibold text-stone-700 mb-1">Brand Name</label>
                  <input
                    id="brand-name-input"
                    type="text"
                    value={parsed.brand}
                    onChange={e => handleFieldChange('brand', e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Nutrition Grid */}
              <div>
                <h4 className="text-xs font-bold text-stone-800 mb-2">Nutritional Values (Per 100g)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label htmlFor="calories-input" className="block text-[11px] text-stone-500">Energy (kcal)</label>
                    <input
                      id="calories-input"
                      type="number"
                      value={parsed.nutrition.caloriesPer100g}
                      onChange={e => handleFieldChange('caloriesPer100g', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="protein-input" className="block text-[11px] text-stone-500">Protein (g)</label>
                    <input
                      id="protein-input"
                      type="number"
                      step="0.1"
                      value={parsed.nutrition.proteinPer100g}
                      onChange={e => handleFieldChange('proteinPer100g', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="carbs-input" className="block text-[11px] text-stone-500">Carbohydrates (g)</label>
                    <input
                      id="carbs-input"
                      type="number"
                      step="0.1"
                      value={parsed.nutrition.carbohydratesPer100g}
                      onChange={e => handleFieldChange('carbohydratesPer100g', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="fiber-input" className="block text-[11px] text-stone-500">Dietary Fiber (g)</label>
                    <input
                      id="fiber-input"
                      type="number"
                      step="0.1"
                      value={parsed.nutrition.dietaryFiberPer100g || 0}
                      onChange={e => handleFieldChange('dietaryFiberPer100g', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="sugars-input" className="block text-[11px] text-stone-500">Total Sugars (g)</label>
                    <input
                      id="sugars-input"
                      type="number"
                      step="0.1"
                      value={parsed.nutrition.totalSugarsPer100g}
                      onChange={e => handleFieldChange('totalSugarsPer100g', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-xs font-mono text-amber-700 font-semibold"
                    />
                  </div>
                  <div>
                    <label htmlFor="added-sugars-input" className="block text-[11px] text-stone-500">Added Sugars (g)</label>
                    <input
                      id="added-sugars-input"
                      type="number"
                      step="0.1"
                      value={parsed.nutrition.addedSugarsPer100g || 0}
                      onChange={e => handleFieldChange('addedSugarsPer100g', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="total-fat-input" className="block text-[11px] text-stone-500">Total Fat (g)</label>
                    <input
                      id="total-fat-input"
                      type="number"
                      step="0.1"
                      value={parsed.nutrition.totalFatPer100g}
                      onChange={e => handleFieldChange('totalFatPer100g', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="sat-fat-input" className="block text-[11px] text-stone-500">Saturated Fat (g)</label>
                    <input
                      id="sat-fat-input"
                      type="number"
                      step="0.1"
                      value={parsed.nutrition.saturatedFatPer100g}
                      onChange={e => handleFieldChange('saturatedFatPer100g', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="trans-fat-input" className="block text-[11px] text-stone-500">Trans Fat (g)</label>
                    <input
                      id="trans-fat-input"
                      type="number"
                      step="0.01"
                      value={parsed.nutrition.transFatPer100g}
                      onChange={e => handleFieldChange('transFatPer100g', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="sodium-input" className="block text-[11px] text-stone-500">Sodium (mg)</label>
                    <input
                      id="sodium-input"
                      type="number"
                      value={parsed.nutrition.sodiumPer100g}
                      onChange={e => handleFieldChange('sodiumPer100g', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-xs font-mono text-rose-700 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Ingredients text */}
              <div>
                <label htmlFor="ingredients-input" className="block text-xs font-semibold text-stone-700 mb-1">Ingredients List</label>
                <textarea
                  id="ingredients-input"
                  value={parsed.ingredientsText}
                  onChange={e => handleFieldChange('ingredientsText', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs leading-relaxed"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setActiveStep('input')}
                  className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  ← Back to Raw Text
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="px-5 py-2.5 bg-[#12382c] hover:bg-[#1a4a3a] text-white font-semibold text-sm rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Analyze Product Fit</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
