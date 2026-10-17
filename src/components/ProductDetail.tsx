import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Printer,
  ChevronLeft,
  Info,
  Check,
  Flame,
  Wheat,
  EyeOff,
  Activity,
  Plus
} from 'lucide-react';
import { Product } from '../types/food';
import { analyzeProduct } from '../services/analysisEngine';
import { useProfile } from '../context/ProfileContext';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onSelectAlternative: (alt: Product) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onBack,
  onSelectAlternative
}) => {
  const { profile, addToComparison, comparisonList, addDailyLog } = useProfile();
  const [portionGrams, setPortionGrams] = useState<number>(product.nutrition.servingSizeGrams || 50);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loggedToTracker, setLoggedToTracker] = useState(false);

  const analysis = analyzeProduct(product, profile);
  const { explainableFit, trafficLights, fssaiWarnings, allergenAlerts, detectedAdditives, hiddenIngredients, alternatives } = analysis;

  const isAlreadyInCompare = comparisonList.some(p => p.barcode === product.barcode);

  const handleLogToDailyTracker = () => {
    const factor = portionGrams / 100;
    addDailyLog({
      barcode: product.barcode,
      productName: product.name,
      brand: product.brand,
      servingPortionGrams: portionGrams,
      calories: Math.round(product.nutrition.caloriesPer100g * factor),
      totalSugars: Number((product.nutrition.totalSugarsPer100g * factor).toFixed(1)),
      addedSugars: product.nutrition.addedSugarsPer100g !== undefined
        ? Number((product.nutrition.addedSugarsPer100g * factor).toFixed(1))
        : undefined,
      saturatedFat: Number((product.nutrition.saturatedFatPer100g * factor).toFixed(1)),
      sodium: Math.round(product.nutrition.sodiumPer100g * factor),
      totalFat: Number((product.nutrition.totalFatPer100g * factor).toFixed(1)),
      protein: Number((product.nutrition.proteinPer100g * factor).toFixed(1)),
      fiber: product.nutrition.dietaryFiberPer100g !== undefined
        ? Number((product.nutrition.dietaryFiberPer100g * factor).toFixed(1))
        : 0
    });
    setLoggedToTracker(true);
    setTimeout(() => setLoggedToTracker(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `${product.name} (${product.brand}) - FoodzWise Health Score: ${explainableFit.overallScore}/100 [${explainableFit.verdict}]. Calories: ${product.nutrition.caloriesPer100g} kcal/100g, Sugar: ${product.nutrition.totalSugarsPer100g}g, Sodium: ${product.nutrition.sodiumPer100g}mg. Analyzed against ${profile.name} profile.`;
    navigator.clipboard?.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Organic Neutral & Forest Green Mappings
  const scoreColors = {
    emerald: {
      bg: 'bg-[#edf4f0]',
      border: 'border-[#cbe0d5]',
      text: 'text-[#12382c]',
      badge: 'bg-[#12382c] text-white',
      accent: 'text-[#12382c]'
    },
    blue: {
      bg: 'bg-stone-100',
      border: 'border-stone-300',
      text: 'text-stone-800',
      badge: 'bg-stone-700 text-white',
      accent: 'text-stone-700'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      badge: 'bg-amber-700 text-white',
      accent: 'text-amber-700'
    },
    rose: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-800',
      badge: 'bg-rose-700 text-white',
      accent: 'text-rose-700'
    }
  }[explainableFit.colorTone];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top action breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Product List</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => addToComparison(product)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isAlreadyInCompare
                ? 'bg-[#edf4f0] border-[#cbe0d5] text-[#12382c]'
                : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isAlreadyInCompare ? 'In Comparison Tray' : 'Compare Product'}</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#12382c]" /> : <Info className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied' : 'Share Summary'}</span>
          </button>

          <button
            onClick={handleLogToDailyTracker}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              loggedToTracker
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-[#12382c] hover:bg-[#1a4a3a] text-white border-[#12382c] shadow-2xs'
            }`}
          >
            {loggedToTracker ? <Check className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5 text-emerald-300" />}
            <span>{loggedToTracker ? 'Logged to Daily Tracker!' : 'Log in Daily Tracker'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Product Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Indian Veg / Non-Veg Mark (FSSAI mandatory symbol) */}
              <div
                className={`w-4 h-4 border-2 flex items-center justify-center p-0.5 rounded-xs shrink-0 ${
                  product.vegType === 'non-veg'
                    ? 'border-amber-800'
                    : 'border-emerald-700'
                }`}
                title={product.vegType === 'non-veg' ? 'Non-Vegetarian' : 'Vegetarian / Vegan'}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    product.vegType === 'non-veg'
                      ? 'bg-amber-800'
                      : 'bg-emerald-700'
                  }`}
                />
              </div>

              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                {product.brand}
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-600">{product.category}</span>
              {product.subCategory && (
                <>
                  <span className="text-stone-300">·</span>
                  <span className="text-xs text-stone-500">{product.subCategory}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 text-xs text-stone-500 font-mono">
              <span>Barcode: {product.barcode}</span>
              {product.fssaiLicenseNumber && (
                <>
                  <span>·</span>
                  <span>FSSAI Lic: {product.fssaiLicenseNumber}</span>
                </>
              )}
            </div>
          </div>

          {/* Overall Suitability Score Box */}
          <div className={`p-4 rounded-xl border ${scoreColors.border} ${scoreColors.bg} shrink-0 text-center md:min-w-48`}>
            <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
              Personalized Fit Score
            </span>
            <div className="flex items-baseline justify-center gap-1">
              <span className={`text-4xl font-extrabold ${scoreColors.text} tabular-nums`}>
                {explainableFit.overallScore}
              </span>
              <span className="text-sm font-semibold text-stone-500">/100</span>
            </div>
            <div className={`mt-2 inline-block px-2.5 py-0.5 rounded text-xs font-bold ${scoreColors.badge}`}>
              {explainableFit.verdict}
            </div>
            <p className="text-[11px] text-stone-600 mt-2 max-w-44 mx-auto leading-tight">
              Calculated for {profile.name}
            </p>
          </div>
        </div>

        {/* Plain Language Summary */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <p className="text-sm text-stone-700 leading-relaxed font-medium">
            {explainableFit.summary}
          </p>
        </div>
      </div>

      {/* Critical Warnings & FSSAI HFSS Alerts */}
      {(fssaiWarnings.length > 0 || allergenAlerts.length > 0 || explainableFit.criticalWarnings.length > 0) && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Health Alerts &amp; Regulatory Notices</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Allergen alerts */}
            {allergenAlerts.map((alert, idx) => (
              <div key={idx} className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-rose-900">
                    Allergen Detected: {alert.allergen}
                  </h4>
                  <p className="text-xs text-rose-800 mt-1">{alert.detail}</p>
                </div>
              </div>
            ))}

            {/* FSSAI HFSS alerts */}
            {fssaiWarnings.map((warning, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  warning.severity === 'critical'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-stone-50 border-stone-300 text-stone-800'
                }`}
              >
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm">{warning.title}</h4>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-white/80 rounded border border-amber-200">
                      {warning.actualValue}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">{warning.description}</p>
                </div>
              </div>
            ))}

            {/* Critical fit warnings */}
            {explainableFit.criticalWarnings.map((crit, idx) => (
              <div key={idx} className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-rose-900 leading-relaxed">{crit}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Traffic Light Nutrient Badges (FSSAI/WHO standard) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Nutrient Traffic Lights (Per 100g)
            </h3>
            <p className="text-xs text-stone-500">
              Benchmarked against FSSAI &amp; WHO Front-of-Pack Nutritional Profile guidelines
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              Low (Green)
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Medium (Amber)
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              High (Red)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {trafficLights.map(item => {
            const levelConfig = {
              low: {
                border: 'border-[#cbe0d5]',
                bg: 'bg-[#f0f6f2]',
                text: 'text-[#12382c]',
                dot: 'bg-emerald-600',
                badgeText: 'Low'
              },
              medium: {
                border: 'border-amber-200',
                bg: 'bg-amber-50/70',
                text: 'text-amber-900',
                dot: 'bg-amber-500',
                badgeText: 'Medium'
              },
              high: {
                border: 'border-rose-200',
                bg: 'bg-rose-50/70',
                text: 'text-rose-900',
                dot: 'bg-rose-500',
                badgeText: 'High (HFSS)'
              }
            }[item.level];

            return (
              <div
                key={item.name}
                className={`p-4 rounded-xl border ${levelConfig.border} ${levelConfig.bg} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-stone-700">{item.name}</span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold">
                      <span className={`w-2 h-2 rounded-full ${levelConfig.dot}`} />
                      <span className={levelConfig.text}>{levelConfig.badgeText}</span>
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 my-1">
                    <span className="text-2xl font-extrabold text-stone-900 tabular-nums">
                      {item.amount}
                    </span>
                    <span className="text-xs font-semibold text-stone-500">{item.unit}</span>
                    {item.dailyValuePercent !== undefined && (
                      <span className="text-[11px] text-stone-500 ml-auto tabular-nums">
                        {item.dailyValuePercent}% DV
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-stone-600 mt-2 leading-relaxed border-t border-stone-200/50 pt-2">
                  {item.explanation}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Specific Impacts */}
      {explainableFit.goalImpacts.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#12382c]" />
            <span>Health Goal Assessment for Active Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {explainableFit.goalImpacts.map((impact, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border ${
                  impact.status === 'good'
                    ? 'bg-[#edf4f0] border-[#cbe0d5]'
                    : impact.status === 'bad'
                    ? 'bg-rose-50 border-rose-200'
                    : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-800">{impact.goal}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      impact.status === 'good'
                        ? 'bg-[#12382c] text-white'
                        : impact.status === 'bad'
                        ? 'bg-rose-200 text-rose-900'
                        : 'bg-stone-200 text-stone-800'
                    }`}
                  >
                    {impact.status === 'good' ? 'Supports Goal' : impact.status === 'bad' ? 'Negative Impact' : 'Neutral'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{impact.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Grid: Ingredients & Additives Breakdown + Complete Nutrition Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Ingredients & Additives */}
        <div className="lg:col-span-7 space-y-6">
          {/* Additives & Hidden Chemicals */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-stone-500" />
              <span>Decoded Additives &amp; Chemical INS Numbers</span>
            </h3>

            {detectedAdditives.length > 0 ? (
              <div className="space-y-2.5">
                {detectedAdditives.map(item => (
                  <div
                    key={item.code}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-stone-200 text-stone-800 px-2 py-0.5 rounded">
                          {item.code}
                        </span>
                        <span className="text-xs font-bold text-stone-900">{item.name}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.riskLevel === 'safe'
                            ? 'bg-[#edf4f0] text-[#12382c]'
                            : item.riskLevel === 'caution'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.riskLevel === 'safe' ? 'Permitted & Safe' : item.riskLevel === 'caution' ? 'Caution' : 'High Concern'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic">
                No complex synthetic INS food additive codes flagged in this ingredient formulation.
              </p>
            )}

            {/* Hidden sugars and deceptive terms */}
            {hiddenIngredients.length > 0 && (
              <div className="pt-3 border-t border-stone-100">
                <span className="text-xs font-bold text-stone-800 block mb-2">
                  Deceptive / Hidden Industry Ingredients Flagged:
                </span>
                <div className="space-y-1.5">
                  {hiddenIngredients.map((h, i) => (
                    <div key={i} className="text-xs p-2 bg-amber-50/60 border border-amber-200 rounded-lg flex items-start gap-2">
                      <span className="font-bold text-amber-900 shrink-0">{h.name}:</span>
                      <span className="text-stone-700">{h.implication}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Full Ingredients Statement */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Wheat className="w-4 h-4 text-stone-500" />
              <span>Full Ingredients Declaration</span>
            </h3>
            <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200 font-mono">
              {product.ingredientsText}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-stone-500 pt-2">
              <span>Jain Compliance: {analysis.isJainSafe ? '✅ Yes' : '❌ Contains root veggies / gelatin'}</span>
              <span>·</span>
              <span>Vegan Compliance: {analysis.isVeganSafe ? '✅ Yes' : '❌ Dairy/Animal derivatives'}</span>
            </div>
          </div>
        </div>

        {/* Right: Nutrition Facts Table & Portion Calculator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#12382c]" />
                <span>Nutrition Facts Table</span>
              </h3>
              <span className="text-xs text-stone-500">Serving: {product.nutrition.servingSize || '30g'}</span>
            </div>

            {/* Serving scaler slider */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-stone-700">Portion Size Calculator:</span>
                <span className="font-bold text-[#12382c] tabular-nums">{portionGrams}g</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={portionGrams}
                onChange={e => setPortionGrams(Number(e.target.value))}
                className="w-full accent-[#12382c] cursor-pointer"
              />
            </div>

            {/* Tabular facts */}
            <div className="overflow-hidden rounded-xl border border-stone-200 text-xs">
              <table className="w-full text-left">
                <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Nutrient</th>
                    <th className="py-2.5 px-3 text-right">Per 100g</th>
                    <th className="py-2.5 px-3 text-right font-bold text-[#12382c]">Per {portionGrams}g</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono">
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-stone-900">Energy (Calories)</td>
                    <td className="py-2 px-3 text-right text-stone-600">{product.nutrition.caloriesPer100g} kcal</td>
                    <td className="py-2 px-3 text-right font-bold text-stone-900">
                      {Math.round((product.nutrition.caloriesPer100g * portionGrams) / 100)} kcal
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-stone-800">Protein</td>
                    <td className="py-2 px-3 text-right text-stone-600">{product.nutrition.proteinPer100g} g</td>
                    <td className="py-2 px-3 text-right font-semibold text-stone-900">
                      {((product.nutrition.proteinPer100g * portionGrams) / 100).toFixed(1)} g
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-stone-800">Carbohydrates</td>
                    <td className="py-2 px-3 text-right text-stone-600">{product.nutrition.carbohydratesPer100g} g</td>
                    <td className="py-2 px-3 text-right text-stone-900">
                      {((product.nutrition.carbohydratesPer100g * portionGrams) / 100).toFixed(1)} g
                    </td>
                  </tr>
                  <tr className="bg-amber-50/40">
                    <td className="py-2 px-3 font-sans pl-6 text-stone-700">↳ Total Sugars</td>
                    <td className="py-2 px-3 text-right text-amber-800 font-semibold">{product.nutrition.totalSugarsPer100g} g</td>
                    <td className="py-2 px-3 text-right font-bold text-amber-900">
                      {((product.nutrition.totalSugarsPer100g * portionGrams) / 100).toFixed(1)} g
                    </td>
                  </tr>
                  {product.nutrition.addedSugarsPer100g !== undefined && (
                    <tr className="bg-amber-50/20">
                      <td className="py-2 px-3 font-sans pl-8 text-stone-600">↳ Added Sugars</td>
                      <td className="py-2 px-3 text-right text-stone-600">{product.nutrition.addedSugarsPer100g} g</td>
                      <td className="py-2 px-3 text-right text-stone-800">
                        {((product.nutrition.addedSugarsPer100g * portionGrams) / 100).toFixed(1)} g
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2 px-3 font-sans text-stone-800">Dietary Fiber</td>
                    <td className="py-2 px-3 text-right text-stone-600">{product.nutrition.dietaryFiberPer100g || 0} g</td>
                    <td className="py-2 px-3 text-right text-stone-900">
                      {(((product.nutrition.dietaryFiberPer100g || 0) * portionGrams) / 100).toFixed(1)} g
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-stone-800">Total Fat</td>
                    <td className="py-2 px-3 text-right text-stone-600">{product.nutrition.totalFatPer100g} g</td>
                    <td className="py-2 px-3 text-right text-stone-900">
                      {((product.nutrition.totalFatPer100g * portionGrams) / 100).toFixed(1)} g
                    </td>
                  </tr>
                  <tr className="bg-stone-50/60">
                    <td className="py-2 px-3 font-sans pl-6 text-stone-700">↳ Saturated Fat</td>
                    <td className="py-2 px-3 text-right text-stone-600">{product.nutrition.saturatedFatPer100g} g</td>
                    <td className="py-2 px-3 text-right text-stone-900">
                      {((product.nutrition.saturatedFatPer100g * portionGrams) / 100).toFixed(1)} g
                    </td>
                  </tr>
                  <tr className="bg-stone-50/40">
                    <td className="py-2 px-3 font-sans pl-6 text-stone-700">↳ Trans Fat</td>
                    <td className="py-2 px-3 text-right text-stone-600">{product.nutrition.transFatPer100g} g</td>
                    <td className="py-2 px-3 text-right text-stone-900">
                      {((product.nutrition.transFatPer100g * portionGrams) / 100).toFixed(2)} g
                    </td>
                  </tr>
                  <tr className="bg-rose-50/40">
                    <td className="py-2 px-3 font-sans font-medium text-stone-900">Sodium (Salt)</td>
                    <td className="py-2 px-3 text-right text-rose-800 font-semibold">{product.nutrition.sodiumPer100g} mg</td>
                    <td className="py-2 px-3 text-right font-bold text-rose-900">
                      {Math.round((product.nutrition.sodiumPer100g * portionGrams) / 100)} mg
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Healthier Alternatives Recommender Section */}
      {alternatives.length > 0 && (
        <div className="bg-[#0b241c] text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-md border border-[#143d30]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b4d3d] pb-4">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                FSSAI Smart Health Swap Engine
              </span>
              <h3 className="text-xl font-bold tracking-tight text-white">
                Healthier Category Swaps Available
              </h3>
            </div>
            <p className="text-xs text-stone-300 max-w-sm">
              Matches higher-scoring, low-HFSS alternatives within the same food aisle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alternatives.map(alt => {
              const sugarDiff = product.nutrition.totalSugarsPer100g - alt.nutrition.totalSugarsPer100g;
              const sodiumDiff = product.nutrition.sodiumPer100g - alt.nutrition.sodiumPer100g;
              const proteinDiff = alt.nutrition.proteinPer100g - product.nutrition.proteinPer100g;

              return (
                <div
                  key={alt.barcode}
                  className="bg-[#12382c]/80 border border-[#1e5443] rounded-xl p-4 flex flex-col justify-between hover:border-emerald-400 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-emerald-300 uppercase">
                        {alt.brand}
                      </span>
                      <span className="text-[11px] bg-[#0c261e] text-emerald-200 px-2 py-0.5 rounded font-mono border border-[#1c4d3d]">
                        {alt.category}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-white">{alt.name}</h4>

                    <div className="space-y-1 text-xs text-stone-200 pt-1">
                      {sugarDiff > 2 && (
                        <p className="text-emerald-300 font-medium">
                          ✓ {sugarDiff.toFixed(1)}g less sugar / 100g
                        </p>
                      )}
                      {sodiumDiff > 100 && (
                        <p className="text-emerald-300 font-medium">
                          ✓ {sodiumDiff}mg lower sodium
                        </p>
                      )}
                      {proteinDiff > 2 && (
                        <p className="text-emerald-300 font-medium">
                          ✓ +{proteinDiff.toFixed(1)}g more protein
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectAlternative(alt)}
                    className="mt-4 w-full py-2 bg-[#256852] hover:bg-[#2d7d63] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View Alternative</span>
                    <span>→</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
