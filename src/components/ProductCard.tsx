import React from 'react';
import { Scale, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Product } from '../types/food';
import { analyzeProduct } from '../services/analysisEngine';
import { useProfile } from '../context/ProfileContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { profile, addToComparison, comparisonList } = useProfile();
  const analysis = analyzeProduct(product, profile);
  const { explainableFit } = analysis;

  const isCompared = comparisonList.some(p => p.barcode === product.barcode);

  const badgeStyle = {
    emerald: 'bg-[#edf4f0] text-[#12382c] border-[#cbe0d5]',
    blue: 'bg-stone-100 text-stone-800 border-stone-300',
    amber: 'bg-amber-50 text-amber-900 border-amber-200',
    rose: 'bg-rose-50 text-rose-900 border-rose-200'
  }[explainableFit.colorTone];

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group">
      <div>
        {/* Top meta */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            {/* Indian veg/non-veg dot */}
            <div
              className={`w-3.5 h-3.5 border-2 flex items-center justify-center p-0.5 rounded-xs shrink-0 ${
                product.vegType === 'non-veg' ? 'border-amber-800' : 'border-emerald-700'
              }`}
              title={product.vegType === 'non-veg' ? 'Non-Vegetarian' : 'Vegetarian'}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  product.vegType === 'non-veg' ? 'bg-amber-800' : 'bg-emerald-700'
                }`}
              />
            </div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider line-clamp-1">
              {product.brand}
            </span>
          </div>

          {/* Health Score Pill */}
          <div
            className={`px-2 py-0.5 rounded-md border text-[11px] font-bold flex items-center gap-1 ${badgeStyle}`}
            title={`Suitability score: ${explainableFit.overallScore}/100`}
          >
            {explainableFit.colorTone === 'emerald' ? (
              <ShieldCheck className="w-3 h-3 text-[#12382c]" />
            ) : (
              <AlertCircle className="w-3 h-3 text-amber-700" />
            )}
            <span className="tabular-nums font-mono">{explainableFit.overallScore}</span>
            <span>·</span>
            <span>{explainableFit.verdict}</span>
          </div>
        </div>

        {/* Product Title */}
        <h3
          onClick={() => onSelect(product)}
          className="text-base font-bold text-stone-900 group-hover:text-[#12382c] transition-colors cursor-pointer line-clamp-1 mb-1"
        >
          {product.name}
        </h3>

        <div className="text-xs text-stone-500 flex items-center gap-2 mb-3">
          <span>{product.category}</span>
          <span>·</span>
          <span className="font-mono text-[11px] text-stone-400">{product.barcode}</span>
        </div>

        {/* Nutrition Highlights Bar */}
        <div className="grid grid-cols-4 gap-1.5 py-2.5 border-y border-stone-100 text-center font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-400 font-sans">Calories</span>
            <span className="text-xs font-bold text-stone-800">{product.nutrition.caloriesPer100g}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-400 font-sans">Sugar</span>
            <span className={`text-xs font-bold ${
              product.nutrition.totalSugarsPer100g > 12.5 ? 'text-rose-600' : 'text-stone-800'
            }`}>
              {product.nutrition.totalSugarsPer100g}g
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-400 font-sans">Sodium</span>
            <span className={`text-xs font-bold ${
              product.nutrition.sodiumPer100g > 500 ? 'text-rose-600' : 'text-stone-800'
            }`}>
              {product.nutrition.sodiumPer100g}mg
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-400 font-sans">Protein</span>
            <span className="text-xs font-bold text-[#164437]">{product.nutrition.proteinPer100g}g</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => addToComparison(product)}
          className={`p-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
            isCompared
              ? 'bg-[#edf4f0] border-[#cbe0d5] text-[#12382c]'
              : 'border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
          title="Add to side-by-side comparison"
        >
          <Scale className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isCompared ? 'In Compare' : 'Compare'}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelect(product)}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#12382c] hover:bg-[#1a4a3a] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
        >
          <span>Analyze Fit</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
