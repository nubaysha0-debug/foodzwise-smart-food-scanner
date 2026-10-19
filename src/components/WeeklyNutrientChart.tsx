import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Flame,
  Wheat,
  Plus,
  Trash2,
  X,
  Sparkles
} from 'lucide-react';
import { DailyLoggedItem, UserHealthProfile, ProfileRDAConfig, DayNutrientSummary } from '../types/food';
import {
  getWeeklyNutrientSummaries,
  computeMetricTrendStats,
  MetricTrendStats,
  toLocalDateString
} from '../services/trendService';

interface WeeklyNutrientChartProps {
  dailyLogs: DailyLoggedItem[];
  profile: UserHealthProfile;
  rdaConfig: ProfileRDAConfig;
  onAddLogToDate?: (item: Omit<DailyLoggedItem, 'id' | 'timestamp'> & { timestamp?: string }) => void;
  onRemoveLog?: (id: string) => void;
}

type MetricKey = 'calories' | 'sugar' | 'sodium';

interface MetricConfig {
  key: MetricKey;
  label: string;
  unit: string;
  targetLabel: string;
  color: string;
  warningColor: string;
  referenceColor: string;
  description: string;
}

const METRICS: Record<MetricKey, MetricConfig> = {
  calories: {
    key: 'calories',
    label: 'Daily Calories',
    unit: 'kcal',
    targetLabel: 'Target Energy',
    color: '#10b981', // emerald
    warningColor: '#f97316', // orange
    referenceColor: '#047857',
    description: 'Energy balance aligned with your activity and metabolic profile'
  },
  sugar: {
    key: 'sugar',
    label: 'Total Sugar',
    unit: 'g',
    targetLabel: 'Daily Sugar Ceiling',
    color: '#0ea5e9', // sky blue
    warningColor: '#ef4444', // red
    referenceColor: '#d97706',
    description: 'Safe upper boundary to protect glycemic index and insulin response'
  },
  sodium: {
    key: 'sodium',
    label: 'Sodium Intake',
    unit: 'mg',
    targetLabel: 'Cardio Sodium Cap',
    color: '#6366f1', // indigo
    warningColor: '#dc2626', // dark red
    referenceColor: '#b91c1c',
    description: 'DASH & ICMR standard (<= 2,000 mg/day) to prevent blood pressure spikes'
  }
};

export const WeeklyNutrientChart: React.FC<WeeklyNutrientChartProps> = ({
  dailyLogs,
  profile,
  rdaConfig,
  onAddLogToDate,
  onRemoveLog
}) => {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('calories');
  const [selectedDayDate, setSelectedDayDate] = useState<string>(() => toLocalDateString(new Date()));
  const [showAddLogModal, setShowAddLogModal] = useState(false);

  // Quick form for adding item to the selected day
  const [newMealName, setNewMealName] = useState('');
  const [newMealCalories, setNewMealCalories] = useState(200);
  const [newMealSugar, setNewMealSugar] = useState(4);
  const [newMealSodium, setNewMealSodium] = useState(150);
  const [newMealPortion, setNewMealPortion] = useState(120);

  // 7-day summaries
  const summaries: DayNutrientSummary[] = useMemo(() => {
    return getWeeklyNutrientSummaries(dailyLogs, profile);
  }, [dailyLogs, profile]);

  const currentMetricConfig = METRICS[activeMetric];

  // Stats computation
  const stats: MetricTrendStats = useMemo(() => {
    return computeMetricTrendStats(summaries, activeMetric, rdaConfig);
  }, [summaries, activeMetric, rdaConfig]);

  // Selected day object
  const selectedDay = useMemo(() => {
    return summaries.find(s => s.date === selectedDayDate) || summaries[summaries.length - 1];
  }, [summaries, selectedDayDate]);

  // Format chart data
  const chartData = useMemo(() => {
    return summaries.map(s => {
      let value = s.calories;
      if (activeMetric === 'sugar') value = s.totalSugars;
      if (activeMetric === 'sodium') value = s.sodium;

      const isExceeded = value > stats.target;
      const percentOfTarget = Math.round((value / stats.target) * 100);

      return {
        date: s.date,
        dayLabel: s.dayLabel,
        fullDateLabel: s.fullDateLabel,
        isToday: s.isToday,
        value,
        target: stats.target,
        percentOfTarget,
        isExceeded,
        itemCount: s.itemCount,
        items: s.items
      };
    });
  }, [summaries, activeMetric, stats.target]);

  const handleBarClick = (data: any) => {
    if (data && data.date) {
      setSelectedDayDate(data.date);
    }
  };

  const handleSaveMealToSelectedDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName.trim() || !onAddLogToDate) return;

    onAddLogToDate({
      barcode: `MANUAL-${Date.now().toString().slice(-6)}`,
      productName: newMealName.trim(),
      brand: 'Custom Log',
      servingPortionGrams: Number(newMealPortion),
      calories: Number(newMealCalories),
      totalSugars: Number(newMealSugar),
      addedSugars: Number(newMealSugar * 0.7),
      saturatedFat: 1.2,
      sodium: Number(newMealSodium),
      totalFat: 5,
      protein: 6,
      fiber: 2,
      timestamp: `${selectedDayDate}T12:00:00.000Z`
    });

    setNewMealName('');
    setShowAddLogModal(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-5 md:p-6 shadow-2xs space-y-6">
      {/* Header & Metric Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>7-Day Retrospective</span>
            <span aria-hidden="true">·</span>
            <span>ICMR-NIN &amp; FSSAI Target Lines</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#12382c] font-semibold">Continuous Baseline</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2 mt-0.5">
            <TrendingUp className="w-5 h-5 text-[#12382c]" />
            Weekly Intake Trajectory
          </h2>
          <p className="text-xs text-stone-600 mt-0.5 max-w-xl">
            {currentMetricConfig.description}. Tap any day to inspect and edit meals.
          </p>
        </div>

        {/* Tabbed Metric Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200/80 self-start lg:self-auto">
          {(Object.keys(METRICS) as MetricKey[]).map(key => {
            const m = METRICS[key];
            const isActive = activeMetric === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveMetric(key)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#12382c] text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                {m.label.replace('Daily ', '').replace(' Intake', '')}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/70">
          <div className="text-[11px] font-medium text-stone-500">7-Day Daily Average</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-stone-900 font-mono tabular-nums">
              {stats.average.toLocaleString()}
            </span>
            <span className="text-xs text-stone-500 font-medium">{stats.unit}</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            vs target: <span className="font-semibold text-stone-800">{stats.target.toLocaleString()} {stats.unit}</span>
          </div>
        </div>

        <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/70">
          <div className="text-[11px] font-medium text-stone-500">Highest Day (Peak)</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-stone-900 font-mono tabular-nums">
              {stats.peak.toLocaleString()}
            </span>
            <span className="text-xs text-stone-500 font-medium">{stats.unit}</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Logged on <span className="font-semibold text-stone-800">{stats.peakDate}</span>
          </div>
        </div>

        <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/70">
          <div className="text-[11px] font-medium text-stone-500">Target Adherence</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-stone-900 font-mono tabular-nums">
              {stats.complianceRate}%
            </span>
            <span className="text-xs text-stone-500 font-medium">compliant</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            <span className="font-semibold text-stone-800">{stats.daysWithinTarget}</span> of 7 days within cap
          </div>
        </div>

        <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/70">
          <div className="text-[11px] font-medium text-stone-500">Clinical Status</div>
          <div className="mt-1 flex items-center gap-1.5">
            {stats.statusVerdict === 'optimal' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <span className="text-sm font-bold text-stone-900 capitalize">
              {stats.statusVerdict}
            </span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1 truncate" title={stats.insightMessage}>
            {stats.insightMessage}
          </div>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="bg-stone-50/50 rounded-xl p-3 md:p-4 border border-stone-200/80">
        <div className="flex items-center justify-between text-xs text-stone-500 mb-2 px-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-stone-700">
              <span
                className="w-3 h-3 rounded-xs inline-block"
                style={{ backgroundColor: currentMetricConfig.color }}
              />
              Logged Intake ({currentMetricConfig.unit})
            </span>
            <span className="flex items-center gap-1.5 font-medium text-stone-600">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-red-500 inline-block" />
              {currentMetricConfig.targetLabel} ({stats.target} {currentMetricConfig.unit})
            </span>
          </div>
          <span className="text-[11px] text-stone-400 hidden sm:inline">
            Click any column to inspect day
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length > 0) {
                  handleBarClick(e.activePayload[0].payload);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
              <XAxis
                dataKey="dayLabel"
                axisLine={{ stroke: '#d6d3d1' }}
                tickLine={false}
                tick={{ fill: '#57534e', fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#78716c', fontSize: 11, fontFamily: 'monospace' }}
                domain={[0, (dataMax: number) => Math.max(dataMax * 1.15, stats.target * 1.2)]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-stone-900 text-white text-xs rounded-xl p-3 shadow-lg border border-stone-800 space-y-1 max-w-xs">
                        <div className="font-semibold text-stone-200 border-b border-stone-800 pb-1 flex items-center justify-between gap-4">
                          <span>{data.fullDateLabel}</span>
                          {data.isToday && (
                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline justify-between gap-4 pt-0.5">
                          <span className="text-stone-400">{currentMetricConfig.label}:</span>
                          <span className="font-bold text-white font-mono tabular-nums">
                            {data.value.toLocaleString()} {currentMetricConfig.unit}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="text-stone-400">RDA Cap:</span>
                          <span className="text-stone-300 font-mono tabular-nums">
                            {stats.target.toLocaleString()} {currentMetricConfig.unit}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="text-stone-400">Of Allowance:</span>
                          <span
                            className={`font-mono font-bold tabular-nums ${
                              data.isExceeded ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {data.percentOfTarget}%
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-800">
                          {data.itemCount} food item{data.itemCount === 1 ? '' : 's'} logged
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Daily RDA Reference Line */}
              <ReferenceLine
                y={stats.target}
                stroke="#dc2626"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `Limit: ${stats.target} ${currentMetricConfig.unit}`,
                  position: 'insideTopRight',
                  fill: '#b91c1c',
                  fontSize: 10,
                  fontWeight: 600
                }}
              />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                cursor="pointer"
              >
                {chartData.map((entry, index) => {
                  const isSelected = entry.date === selectedDayDate;
                  const fillColor = entry.isExceeded
                    ? currentMetricConfig.warningColor
                    : isSelected
                    ? '#12382c'
                    : currentMetricConfig.color;

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={fillColor}
                      opacity={isSelected ? 1 : 0.85}
                      stroke={isSelected ? '#12382c' : 'none'}
                      strokeWidth={isSelected ? 2 : 0}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selected Day Inspector & Meal Adjuster */}
      {selectedDay && (
        <div className="border border-stone-200/90 rounded-xl p-4 bg-stone-50/40 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#12382c]" />
                <h3 className="text-sm font-bold text-stone-900">
                  {selectedDay.fullDateLabel} {selectedDay.isToday ? '(Today)' : ''}
                </h3>
                <span className="text-xs text-stone-500">
                  · {selectedDay.calories} kcal · {selectedDay.totalSugars}g sugar · {selectedDay.sodium}mg sodium
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {selectedDay.items.length} logged items on this date. You can add or remove items to customize the historical baseline.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onAddLogToDate && (
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#12382c] text-white rounded-lg hover:bg-[#1a4f3e] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Meal to this Day
                </button>
              )}
            </div>
          </div>

          {/* List of items logged for this selected day */}
          {selectedDay.items.length === 0 ? (
            <div className="py-4 text-center text-xs text-stone-500 italic bg-white rounded-lg border border-stone-200/60">
              No items logged for this day. Tap "Add Meal to this Day" to record intake.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {selectedDay.items.map(item => (
                <div
                  key={item.id}
                  className="bg-white p-3 rounded-lg border border-stone-200/80 shadow-2xs flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-stone-900 truncate">
                      {item.productName}
                    </div>
                    <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5 font-mono tabular-nums">
                      <span>{item.calories} kcal</span>
                      <span>·</span>
                      <span>{item.totalSugars}g sugar</span>
                      <span>·</span>
                      <span>{item.sodium}mg na</span>
                    </div>
                  </div>

                  {onRemoveLog && (
                    <button
                      type="button"
                      onClick={() => onRemoveLog(item.id)}
                      title="Remove item"
                      className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Item to Selected Day Modal */}
      {showAddLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#12382c]" />
                Log Meal for {selectedDay?.fullDateLabel}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddLogModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMealToSelectedDay} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Food or Meal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Dosa, Mixed Fruit Bowl, Dal Roti"
                  value={newMealName}
                  onChange={e => setNewMealName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#12382c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Portion (g)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMealPortion}
                    onChange={e => setNewMealPortion(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#12382c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newMealCalories}
                    onChange={e => setNewMealCalories(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#12382c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Total Sugar (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newMealSugar}
                    onChange={e => setNewMealSugar(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#12382c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Sodium (mg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newMealSodium}
                    onChange={e => setNewMealSodium(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#12382c]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#12382c] text-white rounded-lg hover:bg-[#1a4f3e] transition-colors cursor-pointer"
                >
                  Save Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
