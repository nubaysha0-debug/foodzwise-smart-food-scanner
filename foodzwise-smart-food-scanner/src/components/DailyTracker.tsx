import React, { useState } from 'react';
import {
  Activity,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Printer,
  ChevronDown,
  X
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { evaluateDailyIntake } from '../services/rdaService';
import { LOCAL_CATALOGUE } from '../data/catalogue';
import { Product } from '../types/food';

interface DailyTrackerProps {
  onClose?: () => void;
  onInspectProduct?: (product: Product) => void;
}

export const DailyTracker: React.FC<DailyTrackerProps> = ({
  onClose,
  onInspectProduct
}) => {
  const { profile, dailyLogs, addDailyLog, removeDailyLog, clearDailyLogs } = useProfile();

  // Quick custom add state
  const [showAddModal, setShowAddModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customBrand, setCustomBrand] = useState('Home Food / Snack');
  const [customPortion, setCustomPortion] = useState(100);
  const [customCalories, setCustomCalories] = useState(150);
  const [customSugar, setCustomSugar] = useState(2);
  const [customSatFat, setCustomSatFat] = useState(1);
  const [customSodium, setCustomSodium] = useState(120);
  const [customTotalFat, setCustomTotalFat] = useState(4);
  const [customProtein, setCustomProtein] = useState(5);
  const [customFiber, setCustomFiber] = useState(2);

  const evaluation = evaluateDailyIntake(dailyLogs, profile);
  const { rdaConfig, nutrients, totalCalories, criticalAlerts } = evaluation;

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    addDailyLog({
      barcode: `CUSTOM-${Date.now().toString().slice(-6)}`,
      productName: customName.trim(),
      brand: customBrand.trim(),
      servingPortionGrams: Number(customPortion),
      calories: Number(customCalories),
      totalSugars: Number(customSugar),
      addedSugars: Number(customSugar * 0.8),
      saturatedFat: Number(customSatFat),
      sodium: Number(customSodium),
      totalFat: Number(customTotalFat),
      protein: Number(customProtein),
      fiber: Number(customFiber)
    });

    setCustomName('');
    setShowAddModal(false);
  };

  const handleQuickAddCatalogueProduct = (product: Product) => {
    const servingGrams = product.nutrition.servingSizeGrams || 50;
    const factor = servingGrams / 100;

    addDailyLog({
      barcode: product.barcode,
      productName: product.name,
      brand: product.brand,
      servingPortionGrams: servingGrams,
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
  };

  const handlePrint = () => {
    window.print();
  };

  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }).format(new Date());

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
            <Calendar className="w-4 h-4 text-[#12382c]" />
            <span>{todayFormatted}</span>
            <span>·</span>
            <span className="text-[#12382c] font-bold">ICMR-NIN &amp; FSSAI RDA Aligned</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Daily Nutrient &amp; Calorie Tracker
          </h1>
          <p className="text-xs text-stone-600 max-w-xl">
            {rdaConfig.specialNote}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#12382c] hover:bg-[#1a4a3a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Custom Food</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors cursor-pointer"
            title="Print daily nutrition diary"
          >
            <Printer className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              title="Close tracker"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Critical Exceeded Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Daily Intake Warnings ({criticalAlerts.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-rose-800">
            {criticalAlerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-1.5 bg-white/70 p-2.5 rounded-lg border border-rose-100">
                <span className="text-rose-600 font-bold">•</span>
                <p>{alert}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary RDA Progress Gauges Grid */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#12382c]" />
              <span>Personalized RDA Progress Bars</span>
            </h2>
            <p className="text-xs text-stone-500">
              Limits dynamically calibrated for {profile.name}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-600 font-mono">
            <span>
              Total Calories:{' '}
              <strong className="text-stone-900 text-sm font-bold">
                {totalCalories} / {rdaConfig.calories} kcal
              </strong>
            </span>
          </div>
        </div>

        {/* Nutrient Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {nutrients.map(nut => {
            const isOver = nut.type === 'max_limit' && nut.isExceeded;
            const isCaution = nut.status === 'caution';

            // Determine bar fill color
            let fillClass = 'bg-[#12382c]';
            if (nut.type === 'max_limit') {
              fillClass = isOver
                ? 'bg-rose-600'
                : isCaution
                ? 'bg-amber-500'
                : 'bg-emerald-600';
            } else {
              // Min target (protein, fiber)
              fillClass = nut.percent >= 100
                ? 'bg-emerald-600'
                : nut.percent >= 60
                ? 'bg-[#12382c]'
                : 'bg-amber-600';
            }

            return (
              <div
                key={nut.name}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-stone-800">{nut.name}</span>
                    <span className="font-mono font-bold text-stone-900 tabular-nums">
                      {nut.current} / {nut.target}
                      <span className="font-sans font-normal text-stone-500">{nut.unit}</span>
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${fillClass}`}
                      style={{ width: `${Math.min(100, nut.percent)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                  <span>{nut.advice}</span>
                  <span
                    className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      isOver
                        ? 'bg-rose-100 text-rose-800'
                        : isCaution
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-[#edf4f0] text-[#12382c]'
                    }`}
                  >
                    {nut.percent}% {nut.type === 'max_limit' ? 'of limit' : 'target'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Add from Verified Catalogue */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#12382c]" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              1-Tap Quick Log From Verified Indian Foods
            </h3>
          </div>
          <span className="text-xs text-stone-500">Tap to add standard serving:</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            LOCAL_CATALOGUE[0], // Parle-G
            LOCAL_CATALOGUE[2], // Haldiram Bhujia
            LOCAL_CATALOGUE[4], // Everyday Yogurt
            LOCAL_CATALOGUE[5], // Maggi Noodles
            LOCAL_CATALOGUE[10], // Rolled Oats
            LOCAL_CATALOGUE[9], // Tender Coconut Water
            LOCAL_CATALOGUE[3], // Kurkure
          ].filter(Boolean).map(product => (
            <button
              key={product.barcode}
              type="button"
              onClick={() => handleQuickAddCatalogueProduct(product)}
              className="flex flex-col text-left px-3 py-2 bg-stone-50 hover:bg-[#edf5f1] border border-stone-200 hover:border-[#1b4d3e] rounded-xl transition-all shrink-0 cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Plus className="w-3 h-3 text-[#12382c] group-hover:scale-125 transition-transform" />
                <span className="text-xs font-bold text-stone-800 group-hover:text-[#12382c] whitespace-nowrap">
                  {product.name}
                </span>
              </div>
              <span className="text-[10px] text-stone-500 font-mono">
                {product.nutrition.servingSize || '50g'} · {Math.round((product.nutrition.caloriesPer100g * (product.nutrition.servingSizeGrams || 50)) / 100)} kcal
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Logged Foods List for Today */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-stone-900">Today&apos;s Food Log</h3>
            <span className="text-xs font-mono font-bold bg-[#edf4f0] text-[#12382c] px-2 py-0.5 rounded border border-[#cbe0d5]">
              {dailyLogs.length} entries
            </span>
          </div>

          {dailyLogs.length > 0 && (
            <button
              type="button"
              onClick={clearDailyLogs}
              className="text-xs text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Clear Today&apos;s Diary
            </button>
          )}
        </div>

        {dailyLogs.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <p className="text-sm font-semibold text-stone-700">No foods logged today yet</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Scan any packaged food barcode or click the &ldquo;Log into Daily Tracker&rdquo; button on any product card to track your daily intake.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {dailyLogs.map(log => {
              const timeString = new Date(log.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={log.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900">{log.productName}</span>
                      <span className="text-xs text-stone-400">· {log.brand}</span>
                    </div>
                    <div className="text-xs text-stone-500 flex items-center gap-2">
                      <span className="font-semibold text-stone-700">{log.servingPortionGrams}g portion</span>
                      <span>·</span>
                      <span className="font-mono text-stone-400">{timeString}</span>
                    </div>
                  </div>

                  {/* Macro Pills */}
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="text-right">
                      <span className="text-stone-400 font-sans text-[10px] block">Energy</span>
                      <span className="font-bold text-stone-900">{log.calories} kcal</span>
                    </div>
                    <div className="text-right">
                      <span className="text-stone-400 font-sans text-[10px] block">Sugar</span>
                      <span className={`font-bold ${log.totalSugars > 10 ? 'text-amber-700' : 'text-stone-800'}`}>
                        {log.totalSugars}g
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-stone-400 font-sans text-[10px] block">Sodium</span>
                      <span className={`font-bold ${log.sodium > 300 ? 'text-rose-700' : 'text-stone-800'}`}>
                        {log.sodium}mg
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-stone-400 font-sans text-[10px] block">Protein</span>
                      <span className="font-bold text-[#12382c]">{log.protein}g</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeDailyLog(log.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors ml-2 cursor-pointer"
                      title="Remove entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Custom Food Entry */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-stone-200">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900">Log Custom Food or Meal</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustom} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label htmlFor="custom-food-name" className="block text-xs font-semibold text-stone-700 mb-1">Food / Dish Name</label>
                  <input
                    id="custom-food-name"
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="e.g. Masala Chai + 2 Biscuits, Vegetable Poha..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label htmlFor="custom-brand" className="block text-xs font-semibold text-stone-700 mb-1">Source / Brand</label>
                  <input
                    id="custom-brand"
                    type="text"
                    value={customBrand}
                    onChange={e => setCustomBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="custom-portion" className="block text-xs font-semibold text-stone-700 mb-1">Portion Size (g)</label>
                  <input
                    id="custom-portion"
                    type="number"
                    value={customPortion}
                    onChange={e => setCustomPortion(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold text-stone-800 mb-2">Nutrient Content (for this portion):</span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label htmlFor="custom-calories" className="block text-[11px] text-stone-500">Calories (kcal)</label>
                    <input
                      id="custom-calories"
                      type="number"
                      value={customCalories}
                      onChange={e => setCustomCalories(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-stone-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="custom-sugar" className="block text-[11px] text-stone-500">Sugar (g)</label>
                    <input
                      id="custom-sugar"
                      type="number"
                      step="0.5"
                      value={customSugar}
                      onChange={e => setCustomSugar(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-stone-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="custom-sodium" className="block text-[11px] text-stone-500">Sodium (mg)</label>
                    <input
                      id="custom-sodium"
                      type="number"
                      value={customSodium}
                      onChange={e => setCustomSodium(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-stone-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="custom-protein" className="block text-[11px] text-stone-500">Protein (g)</label>
                    <input
                      id="custom-protein"
                      type="number"
                      step="0.5"
                      value={customProtein}
                      onChange={e => setCustomProtein(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-stone-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="custom-satfat" className="block text-[11px] text-stone-500">Sat Fat (g)</label>
                    <input
                      id="custom-satfat"
                      type="number"
                      step="0.5"
                      value={customSatFat}
                      onChange={e => setCustomSatFat(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-stone-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="custom-fiber" className="block text-[11px] text-stone-500">Fiber (g)</label>
                    <input
                      id="custom-fiber"
                      type="number"
                      step="0.5"
                      value={customFiber}
                      onChange={e => setCustomFiber(Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-stone-300 rounded text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#12382c] hover:bg-[#1a4a3a] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Save to Daily Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
