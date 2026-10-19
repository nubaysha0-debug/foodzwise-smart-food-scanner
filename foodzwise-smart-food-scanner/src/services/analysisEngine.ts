import {
  Product,
  UserHealthProfile,
  TrafficLightNutrient,
  FSSAIWarning,
  AllergenAlert,
  AdditiveMatch,
  ExplainableFit,
  AnalysisResult
} from '../types/food';
import { COMMON_ADDITIVES, HIDDEN_SUGAR_TERMS, PALM_OIL_TERMS, JAIN_FORBIDDEN_TERMS } from '../data/additives';
import { LOCAL_CATALOGUE } from '../data/catalogue';

export function calculateTrafficLights(product: Product): TrafficLightNutrient[] {
  const isLiquid = product.category.toLowerCase().includes('beverage') ||
                   product.category.toLowerCase().includes('drink') ||
                   product.category.toLowerCase().includes('water') ||
                   product.category.toLowerCase().includes('broth');

  const { nutrition } = product;

  // FSSAI & WHO traffic light thresholds per 100g (or 100ml for liquids)
  // Sugars
  const sugarThresholdHigh = isLiquid ? 6.0 : 12.5;
  const sugarThresholdLow = isLiquid ? 2.5 : 5.0;
  const sugarLevel = nutrition.totalSugarsPer100g > sugarThresholdHigh
    ? 'high'
    : nutrition.totalSugarsPer100g > sugarThresholdLow
    ? 'medium'
    : 'low';

  // Saturated Fat
  const satFatHigh = isLiquid ? 1.5 : 5.0;
  const satFatLow = isLiquid ? 0.75 : 1.5;
  const satFatLevel = nutrition.saturatedFatPer100g > satFatHigh
    ? 'high'
    : nutrition.saturatedFatPer100g > satFatLow
    ? 'medium'
    : 'low';

  // Total Fat
  const fatHigh = isLiquid ? 8.5 : 17.5;
  const fatLow = isLiquid ? 1.5 : 3.0;
  const fatLevel = nutrition.totalFatPer100g > fatHigh
    ? 'high'
    : nutrition.totalFatPer100g > fatLow
    ? 'medium'
    : 'low';

  // Sodium / Salt (1g sodium ~ 2.5g salt)
  const sodiumHigh = isLiquid ? 300 : 500; // mg
  const sodiumLow = isLiquid ? 120 : 120; // mg
  const sodiumLevel = nutrition.sodiumPer100g > sodiumHigh
    ? 'high'
    : nutrition.sodiumPer100g > sodiumLow
    ? 'medium'
    : 'low';

  return [
    {
      name: 'Total Sugars',
      amount: nutrition.totalSugarsPer100g,
      unit: 'g',
      level: sugarLevel,
      thresholdHigh: sugarThresholdHigh,
      thresholdLow: sugarThresholdLow,
      dailyValuePercent: Math.round((nutrition.totalSugarsPer100g / 50) * 100),
      explanation: sugarLevel === 'high'
        ? `Contains ${nutrition.totalSugarsPer100g}g sugar / 100${isLiquid ? 'ml' : 'g'}, exceeding the FSSAI threshold (${sugarThresholdHigh}g).`
        : sugarLevel === 'medium'
        ? 'Moderate sugar content; consume mindfully within daily intake.'
        : 'Low in total sugar, aligned with healthy metabolic goals.'
    },
    {
      name: 'Saturated Fat',
      amount: nutrition.saturatedFatPer100g,
      unit: 'g',
      level: satFatLevel,
      thresholdHigh: satFatHigh,
      thresholdLow: satFatLow,
      dailyValuePercent: Math.round((nutrition.saturatedFatPer100g / 20) * 100),
      explanation: satFatLevel === 'high'
        ? `High saturated fat (${nutrition.saturatedFatPer100g}g), which can elevate LDL cholesterol.`
        : satFatLevel === 'medium'
        ? 'Moderate saturated fat level.'
        : 'Low in saturated fat, heart-safe.'
    },
    {
      name: 'Total Fat',
      amount: nutrition.totalFatPer100g,
      unit: 'g',
      level: fatLevel,
      thresholdHigh: fatHigh,
      thresholdLow: fatLow,
      dailyValuePercent: Math.round((nutrition.totalFatPer100g / 70) * 100),
      explanation: fatLevel === 'high'
        ? `Energy-dense lipid profile (${nutrition.totalFatPer100g}g total fat / 100g).`
        : fatLevel === 'medium'
        ? 'Standard balanced fat ratio.'
        : 'Low total fat formulation.'
    },
    {
      name: 'Sodium',
      amount: nutrition.sodiumPer100g,
      unit: 'mg',
      level: sodiumLevel,
      thresholdHigh: sodiumHigh,
      thresholdLow: sodiumLow,
      dailyValuePercent: Math.round((nutrition.sodiumPer100g / 2000) * 100),
      explanation: sodiumLevel === 'high'
        ? `Exceeds FSSAI HFSS salt threshold with ${nutrition.sodiumPer100g}mg sodium (~${(nutrition.sodiumPer100g * 2.5 / 1000).toFixed(1)}g salt).`
        : sodiumLevel === 'medium'
        ? 'Moderate sodium content.'
        : 'Low sodium; beneficial for cardiovascular and blood pressure health.'
    }
  ];
}

export function detectFSSAIWarnings(product: Product): FSSAIWarning[] {
  const warnings: FSSAIWarning[] = [];
  const { nutrition, ingredientsText } = product;
  const isLiquid = product.category.toLowerCase().includes('beverage') ||
                   product.category.toLowerCase().includes('drink') ||
                   product.category.toLowerCase().includes('water');

  // HFSS Sugar threshold
  const sugarThreshold = isLiquid ? 6.0 : 12.5;
  if (nutrition.totalSugarsPer100g > sugarThreshold) {
    warnings.push({
      type: 'sugar',
      title: 'FSSAI HFSS: High in Sugar',
      description: `Draft FSSAI Front-of-Pack guidelines classify foods with >${sugarThreshold}g sugar per 100${isLiquid ? 'ml' : 'g'} as HFSS (High in Fat, Sugar, Salt).`,
      severity: 'critical',
      actualValue: `${nutrition.totalSugarsPer100g}g / 100${isLiquid ? 'ml' : 'g'}`,
      thresholdValue: `${sugarThreshold}g`
    });
  }

  // HFSS Sodium / Salt
  const sodiumThreshold = isLiquid ? 300 : 500;
  if (nutrition.sodiumPer100g > sodiumThreshold) {
    warnings.push({
      type: 'salt',
      title: 'FSSAI HFSS: High in Sodium / Salt',
      description: `Contains ${nutrition.sodiumPer100g}mg sodium per 100g, exceeding the proposed FSSAI threshold of ${sodiumThreshold}mg. Regular high-sodium intake is tied to hypertension.`,
      severity: 'critical',
      actualValue: `${nutrition.sodiumPer100g}mg / 100g`,
      thresholdValue: `${sodiumThreshold}mg`
    });
  }

  // HFSS Saturated Fat
  const satFatThreshold = isLiquid ? 1.5 : 5.0;
  if (nutrition.saturatedFatPer100g > satFatThreshold) {
    warnings.push({
      type: 'saturated_fat',
      title: 'FSSAI HFSS: High Saturated Fat',
      description: `Saturated fatty acids exceed the FSSAI ceiling of ${satFatThreshold}g per 100g.`,
      severity: 'warning',
      actualValue: `${nutrition.saturatedFatPer100g}g / 100g`,
      thresholdValue: `${satFatThreshold}g`
    });
  }

  // Trans Fat warning (>0.2g is legally not allowed to be called zero trans fat under FSSAI)
  if (nutrition.transFatPer100g > 0.2) {
    warnings.push({
      type: 'trans_fat',
      title: 'Trans Fat Present',
      description: `Contains ${nutrition.transFatPer100g}g trans fats. FSSAI mandates industrial trans fatty acids must be under 2% of total oil/fat.`,
      severity: 'critical',
      actualValue: `${nutrition.transFatPer100g}g / 100g`,
      thresholdValue: '0.0g'
    });
  }

  // Palm oil detection
  const lowerIng = ingredientsText.toLowerCase();
  const hasPalmOil = PALM_OIL_TERMS.some(term => lowerIng.includes(term));
  if (hasPalmOil) {
    warnings.push({
      type: 'palm_oil',
      title: 'Contains Refined Palm / Palmolein Oil',
      description: 'Contains palm or palmolein oil, which has ~50% saturated palmitic acid and is an indicator of heavy industrial ultra-processing.',
      severity: 'warning',
      actualValue: 'Detected in ingredients',
      thresholdValue: 'Prefer cold-pressed / unsaturated oils'
    });
  }

  // Artificial Sweetener check
  if (lowerIng.includes('aspartame') || lowerIng.includes('951') ||
      lowerIng.includes('acesulfame') || lowerIng.includes('950') ||
      lowerIng.includes('sucralose') || lowerIng.includes('955')) {
    warnings.push({
      type: 'artificial_sweetener',
      title: 'Mandatory FSSAI Notice: Contains Artificial Sweeteners',
      description: 'FSSAI regulation: Foods with artificial sweeteners must clearly state "Not recommended for children" and declare phenylalanine where applicable.',
      severity: 'warning',
      actualValue: 'Non-nutritive sweetener present',
      thresholdValue: 'Natural unsweetened'
    });
  }

  return warnings;
}

export function detectAdditives(ingredientsText: string): AdditiveMatch[] {
  const matches: AdditiveMatch[] = [];
  const lower = ingredientsText.toLowerCase();

  // Search for INS / E numbers like INS 102, INS 621, E330, etc.
  const codeRegex = /(?:ins|e)[- ]?([0-9]{3,4}[a-z]?)/gi;
  let match;
  const seenCodes = new Set<string>();

  while ((match = codeRegex.exec(ingredientsText)) !== null) {
    const rawCode = match[1].toLowerCase();
    // Normalize code (e.g. 150d, 322)
    const baseCode = rawCode.replace(/[^0-9a-z]/g, '');
    if (seenCodes.has(baseCode)) continue;
    seenCodes.add(baseCode);

    // Look up in COMMON_ADDITIVES
    const additive = COMMON_ADDITIVES[baseCode] || COMMON_ADDITIVES[baseCode.replace(/[a-z]$/, '')];
    if (additive) {
      matches.push({
        code: `INS ${baseCode.toUpperCase()}`,
        name: additive.name,
        category: additive.category,
        riskLevel: additive.riskLevel,
        description: additive.description,
        restrictions: additive.restrictions
      });
    }
  }

  // Also check named items like "Monosodium Glutamate", "Aspartame", "TBHQ"
  if (lower.includes('monosodium glutamate') && !seenCodes.has('621')) {
    matches.push({
      code: 'INS 621',
      name: COMMON_ADDITIVES['621'].name,
      category: 'flavor_enhancer',
      riskLevel: 'caution',
      description: COMMON_ADDITIVES['621'].description,
      restrictions: COMMON_ADDITIVES['621'].restrictions
    });
    seenCodes.add('621');
  }

  if (lower.includes('tartrazine') && !seenCodes.has('102')) {
    matches.push({
      code: 'INS 102',
      name: COMMON_ADDITIVES['102'].name,
      category: 'color',
      riskLevel: 'caution',
      description: COMMON_ADDITIVES['102'].description,
      restrictions: COMMON_ADDITIVES['102'].restrictions
    });
    seenCodes.add('102');
  }

  return matches;
}

export function detectHiddenIngredients(ingredientsText: string): { type: string; name: string; implication: string }[] {
  const lower = ingredientsText.toLowerCase();
  const hidden: { type: string; name: string; implication: string }[] = [];

  // Check hidden sugars
  for (const term of HIDDEN_SUGAR_TERMS) {
    if (lower.includes(term) && term !== 'sugar') {
      hidden.push({
        type: 'Hidden Sugar / Simple Syrup',
        name: term.charAt(0).toUpperCase() + term.slice(1),
        implication: 'Industrial concentrated carbohydrate with high glycemic spike risk.'
      });
    }
  }

  // Check Palm oil
  for (const term of PALM_OIL_TERMS) {
    if (lower.includes(term)) {
      hidden.push({
        type: 'Refined Palm Oil Derivative',
        name: term.charAt(0).toUpperCase() + term.slice(1),
        implication: 'High saturated fatty acid fraction commonly used as cheap frying medium.'
      });
      break;
    }
  }

  // Check MSG / Free glutamates
  if (lower.includes('yeast extract') || lower.includes('hydrolyzed vegetable protein') || lower.includes('hvp')) {
    hidden.push({
      type: 'Hidden Free Glutamate',
      name: 'Yeast Extract / HVP',
      implication: 'Acts identically to MSG as an industrial umami enhancer to mask bland processed ingredients.'
    });
  }

  return hidden;
}

export function checkAllergens(product: Product, userAllergens: string[]): AllergenAlert[] {
  const alerts: AllergenAlert[] = [];
  const text = (product.ingredientsText + ' ' + (product.declaredAllergens || []).join(' ')).toLowerCase();

  const allergenKeywords: Record<string, string[]> = {
    'Gluten': ['gluten', 'wheat', 'maida', 'atta', 'barley', 'rye', 'malt', 'semolina', 'suji'],
    'Peanuts': ['peanut', 'groundnut', 'arachis'],
    'Tree Nuts': ['almond', 'cashew', 'walnut', 'pistachio', 'hazelnut', 'macadamia', 'pecan'],
    'Dairy / Milk': ['milk', 'dairy', 'whey', 'casein', 'curd', 'dahi', 'butter', 'cheese', 'paneer', 'lactose'],
    'Soy': ['soy', 'soya', 'soybean', 'lecithin (soy)'],
    'Eggs': ['egg', 'albumin', 'egg yolk', 'egg white'],
    'Fish': ['fish', 'anchovy', 'tuna', 'salmon'],
    'Shellfish': ['shellfish', 'crustacean', 'prawn', 'shrimp', 'crab'],
    'Sesame': ['sesame', 'til', 'tahini'],
    'Sulfites': ['sulfite', 'sulphite', 'sulphur dioxide', 'sodium metabisulphite', 'ins 220', 'ins 223']
  };

  for (const userAllergen of userAllergens) {
    const keywords = allergenKeywords[userAllergen] || [userAllergen.toLowerCase()];
    const matched = keywords.some(kw => text.includes(kw));
    if (matched) {
      alerts.push({
        allergen: userAllergen,
        foundIn: 'ingredients',
        severity: 'severe',
        detail: `Contains ${userAllergen} or its derivative. Incompatible with your selected allergy profile.`
      });
    }
  }

  return alerts;
}

export function evaluatePersonalizedFit(product: Product, profile: UserHealthProfile): ExplainableFit {
  let score = 85; // baseline start
  const positivePoints: string[] = [];
  const cautionPoints: string[] = [];
  const criticalWarnings: string[] = [];
  const goalImpacts: ExplainableFit['goalImpacts'] = [];

  const { nutrition, ingredientsText } = product;
  const lowerIng = ingredientsText.toLowerCase();

  // 1. Dietary Preference Check
  if (profile.dietaryPreference === 'vegetarian' && product.vegType === 'non-veg') {
    criticalWarnings.push('Not Vegetarian: Contains meat, poultry, or non-veg stock extract.');
    score -= 40;
  }
  if (profile.dietaryPreference === 'vegan' && (product.vegType === 'non-veg' || lowerIng.includes('milk') || lowerIng.includes('honey') || lowerIng.includes('whey') || lowerIng.includes('egg'))) {
    criticalWarnings.push('Not Vegan: Contains animal or dairy derivatives.');
    score -= 40;
  }
  if (profile.dietaryPreference === 'jain') {
    const hasJainForbidden = JAIN_FORBIDDEN_TERMS.some(t => lowerIng.includes(t));
    if (hasJainForbidden || product.vegType === 'non-veg') {
      criticalWarnings.push('Not Jain-compliant: Root vegetables (onion/garlic/potato) or non-veg ingredients detected.');
      score -= 35;
    }
  }

  // 2. Allergen check impact
  const allergenMatches = checkAllergens(product, profile.allergens);
  if (allergenMatches.length > 0) {
    allergenMatches.forEach(a => {
      criticalWarnings.push(`Severe Allergen Danger: Contains ${a.allergen}`);
    });
    score -= (30 * allergenMatches.length);
  }

  // 3. Health Conditions Impact
  // Diabetes
  if (profile.healthConditions.diabetes) {
    if (nutrition.totalSugarsPer100g > 15 || (nutrition.addedSugarsPer100g && nutrition.addedSugarsPer100g > 10)) {
      cautionPoints.push(`High Sugar Spike Hazard: ${nutrition.totalSugarsPer100g}g sugar / 100g may trigger rapid blood glucose rise.`);
      score -= 22;
      goalImpacts.push({
        goal: 'Diabetes / Blood Sugar',
        status: 'bad',
        message: 'High sugar and simple carbohydrates pose glycemic control challenges.'
      });
    } else if (nutrition.totalSugarsPer100g <= 5 && (nutrition.dietaryFiberPer100g || 0) >= 4) {
      positivePoints.push('Low sugar (<5g) and good fiber content helps moderate glycemic absorption.');
      score += 6;
      goalImpacts.push({
        goal: 'Diabetes / Blood Sugar',
        status: 'good',
        message: 'Low glycemic load with supportive dietary fiber.'
      });
    } else {
      goalImpacts.push({
        goal: 'Diabetes / Blood Sugar',
        status: 'neutral',
        message: 'Moderate carbohydrate profile; monitor total portion size.'
      });
    }
  }

  // Hypertension
  if (profile.healthConditions.hypertension) {
    if (nutrition.sodiumPer100g > 600) {
      cautionPoints.push(`Excess Sodium: ${nutrition.sodiumPer100g}mg per 100g is unsafe for high blood pressure.`);
      score -= 20;
      goalImpacts.push({
        goal: 'Blood Pressure / DASH Diet',
        status: 'bad',
        message: `High sodium (${nutrition.sodiumPer100g}mg/100g) exceeds DASH dietary recommendations.`
      });
    } else if (nutrition.sodiumPer100g <= 120) {
      positivePoints.push(`Low sodium formulation (${nutrition.sodiumPer100g}mg) safe for blood pressure management.`);
      score += 6;
      goalImpacts.push({
        goal: 'Blood Pressure / DASH Diet',
        status: 'good',
        message: 'Very low sodium profile supporting arterial health.'
      });
    } else {
      goalImpacts.push({
        goal: 'Blood Pressure / DASH Diet',
        status: 'neutral',
        message: 'Moderate salt level; keep portion to single recommended serving.'
      });
    }
  }

  // High Cholesterol
  if (profile.healthConditions.highCholesterol) {
    if (nutrition.saturatedFatPer100g > 5 || nutrition.transFatPer100g > 0.1) {
      cautionPoints.push(`Saturated fat (${nutrition.saturatedFatPer100g}g) can elevate LDL cholesterol and coronary risk.`);
      score -= 16;
      goalImpacts.push({
        goal: 'Heart & Cholesterol Care',
        status: 'bad',
        message: 'High saturated fat level; unfavorable for lipid panel management.'
      });
    } else {
      goalImpacts.push({
        goal: 'Heart & Cholesterol Care',
        status: 'good',
        message: 'Low saturated fat content aligns with cardiac prevention guidelines.'
      });
    }
  }

  // Celiac Disease
  if (profile.healthConditions.celiacDisease) {
    const hasGluten = ['wheat', 'maida', 'atta', 'barley', 'rye', 'gluten', 'malt extract'].some(k => lowerIng.includes(k));
    if (hasGluten) {
      criticalWarnings.push('Incompatible with Celiac Disease: Gluten-containing grains (wheat/maida/barley) detected.');
      score -= 50;
      goalImpacts.push({
        goal: 'Gluten-Free / Celiac Safety',
        status: 'bad',
        message: 'Contains gluten sources that trigger intestinal mucosal damage in celiac patients.'
      });
    } else {
      positivePoints.push('Gluten-free grains or formulation declared.');
      goalImpacts.push({
        goal: 'Gluten-Free / Celiac Safety',
        status: 'good',
        message: 'No wheat or barley derivatives found in ingredients list.'
      });
    }
  }

  // Weight Management
  if (profile.healthConditions.weightManagement) {
    if (nutrition.caloriesPer100g > 450) {
      cautionPoints.push(`Very high caloric density: ${nutrition.caloriesPer100g} kcal/100g.`);
      score -= 10;
      goalImpacts.push({
        goal: 'Caloric Deficit / Weight Control',
        status: 'bad',
        message: 'Energy-dense snack; easy to exceed target daily caloric allowance.'
      });
    } else if (nutrition.caloriesPer100g < 100) {
      positivePoints.push(`Low calorie density (${nutrition.caloriesPer100g} kcal/100g) ideal for satiety.`);
      score += 4;
      goalImpacts.push({
        goal: 'Caloric Deficit / Weight Control',
        status: 'good',
        message: 'Calorie-light product aiding satiety without surplus calories.'
      });
    }
  }

  // Strict Preferences Check
  if (profile.strictPreferences.avoidPalmOil) {
    const hasPalm = PALM_OIL_TERMS.some(t => lowerIng.includes(t));
    if (hasPalm) {
      cautionPoints.push('Contains refined palm/palmolein oil (violates your oil preference).');
      score -= 8;
    }
  }

  if (profile.strictPreferences.avoidMSG) {
    if (lowerIng.includes('621') || lowerIng.includes('monosodium glutamate') || lowerIng.includes('yeast extract')) {
      cautionPoints.push('Contains MSG or free glutamate flavor enhancers.');
      score -= 6;
    }
  }

  // Child Check
  if (profile.ageGroup === 'child') {
    if (lowerIng.includes('102') || lowerIng.includes('tartrazine') || lowerIng.includes('110') || lowerIng.includes('sunset yellow')) {
      cautionPoints.push('Contains azo dyes (Tartrazine/Sunset Yellow) linked to childhood hyperactivity.');
      score -= 15;
    }
    if (lowerIng.includes('aspartame') || lowerIng.includes('acesulfame') || lowerIng.includes('951') || lowerIng.includes('950')) {
      criticalWarnings.push('FSSAI: Artificial sweeteners are not recommended for children.');
      score -= 20;
    }
  }

  // Positive nutrient bonuses
  if (nutrition.proteinPer100g >= 12) {
    positivePoints.push(`Rich in Protein (${nutrition.proteinPer100g}g/100g) supporting muscle maintenance and satiety.`);
    score += 6;
  }
  if ((nutrition.dietaryFiberPer100g || 0) >= 6) {
    positivePoints.push(`High in Dietary Fiber (${nutrition.dietaryFiberPer100g}g/100g) for gut health.`);
    score += 6;
  }
  if (product.novaGroup === 1) {
    positivePoints.push('Minimally processed / Whole food formulation (Nova Group 1).');
    score += 8;
  } else if (product.novaGroup === 4) {
    cautionPoints.push('Ultra-processed food formulation (Nova Group 4) containing cosmetic food additives.');
    score -= 8;
  }

  // Clamp score
  score = Math.max(5, Math.min(98, score));

  let verdict: ExplainableFit['verdict'] = 'Moderate Fit';
  let colorTone: ExplainableFit['colorTone'] = 'blue';

  if (criticalWarnings.length > 0 || score < 45) {
    verdict = 'Not Recommended';
    colorTone = 'rose';
  } else if (score >= 78) {
    verdict = 'Excellent Fit';
    colorTone = 'emerald';
  } else if (score >= 60) {
    verdict = 'Moderate Fit';
    colorTone = 'blue';
  } else {
    verdict = 'Use Caution';
    colorTone = 'amber';
  }

  const summary = verdict === 'Excellent Fit'
    ? 'This product aligns well with your dietary guidelines and health profile with wholesome nutritional metrics.'
    : verdict === 'Moderate Fit'
    ? 'Acceptable for occasional consumption, but keep serving size in check to prevent exceeding nutrient limits.'
    : verdict === 'Use Caution'
    ? 'Contains notable levels of nutrients or additives that clash with your health conditions or strict preferences.'
    : 'Not recommended for your profile due to critical allergen warnings, dietary restrictions, or severe nutrient imbalances.';

  return {
    overallScore: score,
    verdict,
    colorTone,
    summary,
    positivePoints,
    cautionPoints,
    criticalWarnings,
    goalImpacts
  };
}

export function findHealthierAlternatives(product: Product, currentScore: number, profile: UserHealthProfile): Product[] {
  // Find products in same category or adjacent categories that have higher suitability score
  const candidates = LOCAL_CATALOGUE.filter(p => {
    if (p.barcode === product.barcode) return false;
    // same general category or snack/cereal/beverage/ready-to-cook
    const sameCategory = p.category === product.category ||
                         (product.category.includes('Snack') && p.category.includes('Snack')) ||
                         (product.category.includes('Cereal') && p.category.includes('Cereal')) ||
                         (product.category.includes('Beverage') && p.category.includes('Beverage')) ||
                         (product.category.includes('Ready') && p.category.includes('Ready'));
    return sameCategory;
  });

  const scoredCandidates = candidates.map(candidate => {
    const candidateFit = evaluatePersonalizedFit(candidate, profile);
    return {
      product: candidate,
      score: candidateFit.overallScore
    };
  });

  // Filter only those with higher score than current product
  const better = scoredCandidates
    .filter(c => c.score > currentScore + 10)
    .sort((a, b) => b.score - a.score)
    .map(c => c.product);

  // If no direct better matches found in same category, return top rated products generally suitable
  if (better.length === 0) {
    const generalHealthy = scoredCandidates
      .filter(c => c.score >= 70)
      .sort((a, b) => b.score - a.score)
      .map(c => c.product);
    return generalHealthy.slice(0, 3);
  }

  return better.slice(0, 3);
}

export function analyzeProduct(product: Product, profile: UserHealthProfile): AnalysisResult {
  const trafficLights = calculateTrafficLights(product);
  const fssaiWarnings = detectFSSAIWarnings(product);
  const allergenAlerts = checkAllergens(product, profile.allergens);
  const detectedAdditives = detectAdditives(product.ingredientsText);
  const hiddenIngredients = detectHiddenIngredients(product.ingredientsText);
  const explainableFit = evaluatePersonalizedFit(product, profile);
  const alternatives = findHealthierAlternatives(product, explainableFit.overallScore, profile);

  // Checks for Jain / Vegan / Veg flags
  const lower = product.ingredientsText.toLowerCase();
  const isJainSafe = !JAIN_FORBIDDEN_TERMS.some(t => lower.includes(t)) && product.vegType !== 'non-veg';
  const isVeganSafe = product.vegType === 'vegan' ||
    (product.vegType === 'veg' && !lower.includes('milk') && !lower.includes('dairy') && !lower.includes('whey') && !lower.includes('honey'));
  const isVegetarianSafe = product.vegType !== 'non-veg';

  return {
    product,
    trafficLights,
    fssaiWarnings,
    allergenAlerts,
    detectedAdditives,
    hiddenIngredients,
    explainableFit,
    isJainSafe,
    isVeganSafe,
    isVegetarianSafe,
    alternatives
  };
}
