export type VegType = 'veg' | 'non-veg' | 'vegan' | 'egg';

export type TrafficLightLevel = 'low' | 'medium' | 'high';

export interface TrafficLightNutrient {
  name: string;
  amount: number;
  unit: string;
  level: TrafficLightLevel;
  thresholdHigh: number;
  thresholdLow: number;
  dailyValuePercent?: number;
  explanation: string;
}

export interface NutritionalValues {
  servingSize?: string;
  servingSizeGrams?: number;
  caloriesPer100g: number;
  totalFatPer100g: number;
  saturatedFatPer100g: number;
  transFatPer100g: number;
  cholesterolPer100g?: number; // mg
  sodiumPer100g: number; // mg
  saltPer100g?: number; // g
  carbohydratesPer100g: number;
  dietaryFiberPer100g?: number;
  totalSugarsPer100g: number;
  addedSugarsPer100g?: number;
  proteinPer100g: number;
}

export interface FSSAIWarning {
  type: 'sugar' | 'salt' | 'saturated_fat' | 'trans_fat' | 'palm_oil' | 'artificial_sweetener';
  title: string;
  description: string;
  severity: 'warning' | 'critical';
  actualValue: string;
  thresholdValue: string;
}

export interface AllergenAlert {
  allergen: string;
  foundIn: 'ingredients' | 'cross_contamination_warning';
  severity: 'severe' | 'moderate';
  detail: string;
}

export interface AdditiveMatch {
  code: string;
  name: string;
  category: 'preservative' | 'color' | 'sweetener' | 'flavor_enhancer' | 'emulsifier' | 'acidity_regulator';
  riskLevel: 'safe' | 'caution' | 'high_risk';
  description: string;
  restrictions?: string[];
}

export interface ExplainableFit {
  overallScore: number; // 0 to 100
  verdict: 'Excellent Fit' | 'Moderate Fit' | 'Use Caution' | 'Not Recommended';
  colorTone: 'emerald' | 'blue' | 'amber' | 'rose';
  summary: string;
  positivePoints: string[];
  cautionPoints: string[];
  criticalWarnings: string[];
  goalImpacts: {
    goal: string;
    status: 'good' | 'neutral' | 'bad';
    message: string;
  }[];
}

export interface Product {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  subCategory?: string;
  image?: string;
  vegType: VegType;
  fssaiLicenseNumber?: string;
  ingredientsText: string;
  ingredientsList: string[];
  nutrition: NutritionalValues;
  novaGroup?: 1 | 2 | 3 | 4; // 1 = unprocessed, 4 = ultra-processed
  nutriScore?: 'A' | 'B' | 'C' | 'D' | 'E';
  declaredAllergens?: string[];
  source: 'catalogue' | 'openfoodfacts' | 'ocr_scan' | 'user_custom';
}

export interface UserHealthProfile {
  name: string;
  ageGroup: 'child' | 'adult' | 'senior';
  healthConditions: {
    diabetes: boolean;
    hypertension: boolean;
    highCholesterol: boolean;
    celiacDisease: boolean;
    lactoseIntolerance: boolean;
    kidneyCare: boolean;
    weightManagement: boolean;
  };
  dietaryPreference: 'any' | 'vegetarian' | 'vegan' | 'jain' | 'halal' | 'eggetarian';
  allergens: string[]; // e.g. ['Gluten', 'Peanuts', 'Dairy', 'Soy']
  strictPreferences: {
    avoidPalmOil: boolean;
    avoidHighFructoseCornSyrup: boolean;
    avoidArtificialSweeteners: boolean;
    avoidUltraProcessed: boolean;
    avoidMSG: boolean;
  };
}

export interface AnalysisResult {
  product: Product;
  trafficLights: TrafficLightNutrient[];
  fssaiWarnings: FSSAIWarning[];
  allergenAlerts: AllergenAlert[];
  detectedAdditives: AdditiveMatch[];
  hiddenIngredients: {
    type: string;
    name: string;
    implication: string;
  }[];
  explainableFit: ExplainableFit;
  isJainSafe?: boolean;
  isVeganSafe?: boolean;
  isVegetarianSafe?: boolean;
  alternatives: Product[];
}

export interface DailyLoggedItem {
  id: string;
  timestamp: string;
  barcode: string;
  productName: string;
  brand: string;
  servingPortionGrams: number;
  calories: number;
  totalSugars: number;
  addedSugars?: number;
  saturatedFat: number;
  sodium: number;
  totalFat: number;
  protein: number;
  fiber?: number;
}

export interface NutrientRDA {
  name: string;
  current: number;
  target: number;
  unit: string;
  type: 'max_limit' | 'min_target';
  percent: number;
  isExceeded: boolean;
  status: 'safe' | 'caution' | 'danger';
  advice: string;
}

export interface ProfileRDAConfig {
  calories: number;
  totalSugarsMax: number;
  saturatedFatMax: number;
  sodiumMax: number;
  totalFatMax: number;
  proteinMin: number;
  fiberMin: number;
  specialNote: string;
}

