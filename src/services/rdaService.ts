import { UserHealthProfile, DailyLoggedItem, NutrientRDA, ProfileRDAConfig } from '../types/food';

export function calculateProfileRDA(profile: UserHealthProfile): ProfileRDAConfig {
  // Baseline ICMR-NIN / FSSAI Dietary Guidelines for Indian Adults (2000 kcal reference)
  let calories = 2000;
  let totalSugarsMax = 30; // grams
  let saturatedFatMax = 18; // grams (~8% of calories)
  let sodiumMax = 2000; // mg (equivalent to 5g table salt)
  let totalFatMax = 60; // grams
  let proteinMin = 55; // grams
  let fiberMin = 30; // grams

  const specialNotes: string[] = [];

  // Child adjustments
  if (profile.ageGroup === 'child') {
    calories = 1600;
    totalSugarsMax = 18;
    sodiumMax = 1500;
    proteinMin = 35;
    specialNotes.push('Child profile: lower calorie and sugar thresholds applied.');
  }

  // Diabetes adjustments
  if (profile.healthConditions.diabetes) {
    totalSugarsMax = 18; // Strict ceiling on simple carbohydrates
    fiberMin = 38; // Increased fiber to blunt post-prandial glycemic spikes
    specialNotes.push('Diabetes profile: Daily sugar ceiling restricted to 18g.');
  }

  // Hypertension / High BP adjustments
  if (profile.healthConditions.hypertension) {
    sodiumMax = 1400; // DASH diet target for cardiovascular protection
    saturatedFatMax = 12;
    specialNotes.push('Hypertension profile: Sodium intake capped at 1,400mg (DASH standard).');
  }

  // High Cholesterol adjustments
  if (profile.healthConditions.highCholesterol) {
    saturatedFatMax = 10;
    totalFatMax = 45;
    specialNotes.push('Cardiac care: Saturated fat capped at 10g/day.');
  }

  // Weight Management adjustments
  if (profile.healthConditions.weightManagement) {
    calories = 1600;
    totalFatMax = 42;
    totalSugarsMax = Math.min(totalSugarsMax, 20);
    specialNotes.push('Weight control: Target energy deficit with strict fat & sugar monitoring.');
  }

  // Kidney Care adjustments
  if (profile.healthConditions.kidneyCare) {
    sodiumMax = Math.min(sodiumMax, 1500);
    proteinMin = 40; // Controlled protein load
    specialNotes.push('Renal care: Balanced protein and restricted electrolyte load.');
  }

  const specialNote = specialNotes.length > 0
    ? specialNotes.join(' ')
    : 'Standard ICMR-NIN Indian Adult reference allowance (2,000 kcal).';

  return {
    calories,
    totalSugarsMax,
    saturatedFatMax,
    sodiumMax,
    totalFatMax,
    proteinMin,
    fiberMin,
    specialNote
  };
}

export function evaluateDailyIntake(
  logs: DailyLoggedItem[],
  profile: UserHealthProfile
): {
  rdaConfig: ProfileRDAConfig;
  nutrients: NutrientRDA[];
  totalCalories: number;
  criticalAlerts: string[];
} {
  const rda = calculateProfileRDA(profile);

  // Aggregate daily totals
  let totalCalories = 0;
  let totalSugars = 0;
  let saturatedFat = 0;
  let sodium = 0;
  let totalFat = 0;
  let protein = 0;
  let fiber = 0;

  logs.forEach(item => {
    totalCalories += item.calories;
    totalSugars += item.totalSugars;
    saturatedFat += item.saturatedFat;
    sodium += item.sodium;
    totalFat += item.totalFat;
    protein += item.protein;
    fiber += item.fiber || 0;
  });

  // Helper for max limits
  const buildMaxLimitNutrient = (
    name: string,
    current: number,
    target: number,
    unit: string,
    metricName: string
  ): NutrientRDA => {
    const percent = Math.round((current / target) * 100);
    const isExceeded = current > target;
    const status: NutrientRDA['status'] = isExceeded
      ? 'danger'
      : percent >= 80
      ? 'caution'
      : 'safe';

    const advice = isExceeded
      ? `Exceeded your personalized ${metricName} allowance by ${(current - target).toFixed(1)}${unit}!`
      : percent >= 80
      ? `Approaching limit (${target - current > 0 ? (target - current).toFixed(1) : 0}${unit} remaining today).`
      : `${(target - current).toFixed(1)}${unit} remaining under your daily budget.`;

    return {
      name,
      current: Number(current.toFixed(1)),
      target,
      unit,
      type: 'max_limit',
      percent,
      isExceeded,
      status,
      advice
    };
  };

  // Helper for min targets (protein, fiber)
  const buildMinTargetNutrient = (
    name: string,
    current: number,
    target: number,
    unit: string,
    metricName: string
  ): NutrientRDA => {
    const percent = Math.round((current / target) * 100);
    const isAchieved = current >= target;
    const status: NutrientRDA['status'] = isAchieved
      ? 'safe'
      : percent >= 60
      ? 'caution'
      : 'danger';

    const advice = isAchieved
      ? `Target met! Excellent ${metricName} intake for cellular repair and satiety.`
      : `${(target - current).toFixed(1)}${unit} still needed to achieve your daily minimum target.`;

    return {
      name,
      current: Number(current.toFixed(1)),
      target,
      unit,
      type: 'min_target',
      percent,
      isExceeded: false,
      status,
      advice
    };
  };

  const nutrients: NutrientRDA[] = [
    buildMaxLimitNutrient('Energy (Calories)', totalCalories, rda.calories, ' kcal', 'caloric'),
    buildMaxLimitNutrient('Total Sugars', totalSugars, rda.totalSugarsMax, 'g', 'sugar'),
    buildMaxLimitNutrient('Saturated Fat', saturatedFat, rda.saturatedFatMax, 'g', 'saturated fat'),
    buildMaxLimitNutrient('Sodium (Salt)', sodium, rda.sodiumMax, 'mg', 'sodium'),
    buildMaxLimitNutrient('Total Fat', totalFat, rda.totalFatMax, 'g', 'fat'),
    buildMinTargetNutrient('Protein', protein, rda.proteinMin, 'g', 'protein'),
    buildMinTargetNutrient('Dietary Fiber', fiber, rda.fiberMin, 'g', 'fiber')
  ];

  const criticalAlerts: string[] = [];

  nutrients.forEach(n => {
    if (n.type === 'max_limit' && n.isExceeded) {
      criticalAlerts.push(`Over Daily Limit: ${n.name} is at ${n.current}${n.unit} (exceeds ${n.target}${n.unit} ceiling).`);
    }
  });

  return {
    rdaConfig: rda,
    nutrients,
    totalCalories: Math.round(totalCalories),
    criticalAlerts
  };
}
