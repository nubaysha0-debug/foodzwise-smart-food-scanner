import React from 'react';
import { X, Scale, Check, ArrowRight } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { analyzeProduct } from '../services/analysisEngine';
import { Product } from '../types/food';

interface ComparisonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const ComparisonDrawer: React.FC<ComparisonDrawerProps> = ({
  isOpen,
  onClose,
  onSelectProduct
}) => {
  const { comparisonList, removeFromComparison, clearComparison, profile } = useProfile();

  if (!isOpen) return null;

  const prodA = comparisonList[0];
  const prodB = comparisonList[1];

  const analysisA = prodA ? analyzeProduct(prodA, profile) : null;
  const analysisB = prodB ? analyzeProduct(prodB, profile) : null;

  // Determine winner based on suitability score
  let winnerText = '';
  if (analysisA && analysisB) {
    if (analysisA.explainableFit.overallScore > analysisB.explainableFit.overallScore) {
      winnerText = `${prodA.name} is the healthier choice (${analysisA.explainableFit.overallScore} vs ${analysisB.explainableFit.overallScore}) for ${profile.name}.`;
    } else if (analysisB.explainableFit.overallScore > analysisA.explainableFit.overallScore) {
      winnerText = `${prodB.name} is the healthier choice (${analysisB.explainableFit.overallScore} vs ${analysisA.explainableFit.overallScore}) for ${profile.name}.`;
    } else {
      winnerText = `Both products offer similar nutritional suitability scores (${analysisA.explainableFit.overallScore}/100).`;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#12382c]" />
            <h2 className="text-lg font-bold text-stone-900">Side-by-Side Food Comparison</h2>
            <span className="text-xs text-stone-500">· {comparisonList.length}/2 Selected</span>
          </div>
          <div className="flex items-center gap-3">
            {comparisonList.length > 0 && (
              <button
                onClick={clearComparison}
                className="text-xs text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Clear comparison
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {comparisonList.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Scale className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-sm font-semibold text-stone-700">No products added for comparison</p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Click the &ldquo;Compare&rdquo; button on any food card in the catalogue or scanned result to compare 2 packaged items head-to-head.
              </p>
            </div>
          ) : (
            <>
              {/* Winner Banner if both loaded */}
              {winnerText && (
                <div className="p-4 bg-[#edf4f0] border border-[#cbe0d5] rounded-xl flex items-center gap-3 text-xs font-semibold text-[#12382c]">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="leading-relaxed">{winnerText}</p>
                </div>
              )}

              {/* 2 Column Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product A */}
                {prodA && analysisA && (
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-stone-500 uppercase">{prodA.brand}</span>
                        <h3 className="text-lg font-extrabold text-stone-900">{prodA.name}</h3>
                        <span className="text-xs text-stone-500">{prodA.category}</span>
                      </div>
                      <button
                        onClick={() => removeFromComparison(prodA.barcode)}
                        className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Score */}
                    <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-stone-500 font-semibold block">Suitability Score</span>
                        <span className="text-2xl font-extrabold text-stone-900 font-mono">
                          {analysisA.explainableFit.overallScore}/100
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-stone-100 text-stone-800">
                        {analysisA.explainableFit.verdict}
                      </span>
                    </div>

                    {/* Nutrients table */}
                    <div className="bg-white rounded-xl border border-stone-200 p-3 space-y-2 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-stone-100">
                        <span className="font-sans text-stone-600">Energy (Calories)</span>
                        <span className="font-bold text-stone-900">{prodA.nutrition.caloriesPer100g} kcal</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-stone-100">
                        <span className="font-sans text-stone-600">Total Sugars</span>
                        <span className={`font-bold ${
                          prodA.nutrition.totalSugarsPer100g > 12.5 ? 'text-rose-600' : 'text-stone-900'
                        }`}>{prodA.nutrition.totalSugarsPer100g} g</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-stone-100">
                        <span className="font-sans text-stone-600">Saturated Fat</span>
                        <span className={`font-bold ${
                          prodA.nutrition.saturatedFatPer100g > 5 ? 'text-rose-600' : 'text-stone-900'
                        }`}>{prodA.nutrition.saturatedFatPer100g} g</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-stone-100">
                        <span className="font-sans text-stone-600">Sodium (Salt)</span>
                        <span className={`font-bold ${
                          prodA.nutrition.sodiumPer100g > 500 ? 'text-rose-600' : 'text-stone-900'
                        }`}>{prodA.nutrition.sodiumPer100g} mg</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="font-sans text-stone-600">Protein</span>
                        <span className="font-bold text-[#164437]">{prodA.nutrition.proteinPer100g} g</span>
                      </div>
                    </div>

                    {/* FSSAI warnings */}
                    {analysisA.fssaiWarnings.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-rose-700 block">FSSAI HFSS Warnings:</span>
                        {analysisA.fssaiWarnings.map((w, idx) => (
                          <div key={idx} className="text-[11px] p-1.5 bg-rose-50 border border-rose-200 rounded text-rose-800">
                            {w.title}
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        onSelectProduct(prodA);
                        onClose();
                      }}
                      className="w-full py-2 bg-[#12382c] hover:bg-[#1a4a3a] text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Full Product Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Product B */}
                {prodB && analysisB ? (
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-stone-500 uppercase">{prodB.brand}</span>
                        <h3 className="text-lg font-extrabold text-stone-900">{prodB.name}</h3>
                        <span className="text-xs text-stone-500">{prodB.category}</span>
                      </div>
                      <button
                        onClick={() => removeFromComparison(prodB.barcode)}
                        className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Score */}
                    <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-stone-500 font-semibold block">Suitability Score</span>
                        <span className="text-2xl font-extrabold text-stone-900 font-mono">
                          {analysisB.explainableFit.overallScore}/100
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-stone-100 text-stone-800">
                        {analysisB.explainableFit.verdict}
                      </span>
                    </div>

                    {/* Nutrients table */}
                    <div className="bg-white rounded-xl border border-stone-200 p-3 space-y-2 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-stone-100">
                        <span className="font-sans text-stone-600">Energy (Calories)</span>
                        <span className="font-bold text-stone-900">{prodB.nutrition.caloriesPer100g} kcal</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-stone-100">
                        <span className="font-sans text-stone-600">Total Sugars</span>
                        <span className={`font-bold ${
                          prodB.nutrition.totalSugarsPer100g > 12.5 ? 'text-rose-600' : 'text-stone-900'
                        }`}>{prodB.nutrition.totalSugarsPer100g} g</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-stone-100">
                        <span className="font-sans text-stone-600">Saturated Fat</span>
                        <span className={`font-bold ${
                          prodB.nutrition.saturatedFatPer100g > 5 ? 'text-rose-600' : 'text-stone-900'
                        }`}>{prodB.nutrition.saturatedFatPer100g} g</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-stone-100">
                        <span className="font-sans text-stone-600">Sodium (Salt)</span>
                        <span className={`font-bold ${
                          prodB.nutrition.sodiumPer100g > 500 ? 'text-rose-600' : 'text-stone-900'
                        }`}>{prodB.nutrition.sodiumPer100g} mg</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="font-sans text-stone-600">Protein</span>
                        <span className="font-bold text-[#164437]">{prodB.nutrition.proteinPer100g} g</span>
                      </div>
                    </div>

                    {/* FSSAI warnings */}
                    {analysisB.fssaiWarnings.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-rose-700 block">FSSAI HFSS Warnings:</span>
                        {analysisB.fssaiWarnings.map((w, idx) => (
                          <div key={idx} className="text-[11px] p-1.5 bg-rose-50 border border-rose-200 rounded text-rose-800">
                            {w.title}
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        onSelectProduct(prodB);
                        onClose();
                      }}
                      className="w-full py-2 bg-[#12382c] hover:bg-[#1a4a3a] text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Full Product Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-stone-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3">
                    <Scale className="w-8 h-8 text-stone-300" />
                    <p className="text-sm font-semibold text-stone-700">Add 2nd product to compare</p>
                    <p className="text-xs text-stone-500 max-w-xs">
                      Pick any other item from the product catalogue or scan another barcode to view side-by-side.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
