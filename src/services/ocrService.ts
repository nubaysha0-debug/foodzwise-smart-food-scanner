import { NutritionalValues, Product, VegType } from '../types/food';

export interface ParsedLabelResult {
  productName: string;
  brand: string;
  vegType: VegType;
  ingredientsText: string;
  nutrition: NutritionalValues;
  rawText: string;
  confidence: number;
}

export const SAMPLE_LABEL_PRESETS: { label: string; text: string; category: string }[] = [
  {
    label: 'Haldiram’s Aloo Bhujia (Classic Indian Savory)',
    category: 'Packaged Snacks',
    text: `NUTRITION INFORMATION
Per 100g:
Energy: 574 kcal
Protein: 8.5 g
Carbohydrate: 42.6 g
Total Sugars: 1.8 g
Added Sugars: 0.0 g
Total Fat: 41.0 g
Saturated Fat: 16.2 g
Trans Fat: 0.0 g
Sodium: 880 mg
Ingredients: Potatoes (44%), Edible Vegetable Oil (Cottonseed & Palmolein Oil), Bengal Gram Flour (28%), Tepary Beans Flour, Iodised Salt, Red Chilli, Black Pepper, Clove, Cardamom, Mint, Dry Ginger, Acidity Regulator (INS 330).`
  },
  {
    label: 'Nestle Maggi 2-Minute Masala Noodles',
    category: 'Ready to Cook',
    text: `NUTRITIONAL FACTS
Per 100g:
Energy: 427 kcal
Protein: 8.0 g
Carbohydrates: 63.5 g
Total Sugars: 2.2 g
Added Sugars: 1.5 g
Fiber: 3.6 g
Total Fat: 15.7 g
Saturated Fat: 6.8 g
Trans Fat: 0.1 g
Sodium: 1230 mg
Ingredients: Wheat flour (Maida), Palm oil, Salt, Wheat gluten, Mineral (Calcium carbonate), Thickeners (508 & 412), Acidity regulators (501(i) & 500(i)). Tastemaker: Hydrolysed peanut protein, Mixed spices (Onion powder, Coriander, Chili, Turmeric, Cumin), Noodle powder, Sugar, Edible starch, Salt, Palm oil, Flavor enhancers (635), Acidity regulator (330).`
  },
  {
    label: 'Kellogg’s Chocos Breakfast Cereal',
    category: 'Breakfast Cereals',
    text: `NUTRITION FACTS
Per 100g:
Energy: 382 kcal
Protein: 7.0 g
Total Carbohydrates: 84.0 g
Total Sugars: 33.0 g
Added Sugars: 29.5 g
Dietary Fiber: 4.5 g
Total Fat: 2.8 g
Saturated Fat: 1.2 g
Trans Fat: 0.0 g
Sodium: 340 mg
Ingredients: Whole Wheat Flour (29%), Wheat Flour (29%), Sugar, Cocoa Solids (5.4%), Edible Vegetable Oil (Palmolein), Invert Sugar Syrup, Malt Extract, Iodized Salt, Color (INS 150d), Emulsifier (INS 322), Antioxidant (INS 320), Vitamins and Minerals.`
  },
  {
    label: 'Epigamia Natural Greek Yogurt',
    category: 'Dairy Products',
    text: `NUTRITIONAL INFORMATION
Per 100g:
Energy: 88 kcal
Protein: 8.0 g
Total Carbohydrates: 4.8 g
Total Sugars: 4.8 g
Added Sugars: 0.0 g
Total Fat: 4.0 g
Saturated Fat: 2.6 g
Trans Fat: 0.0 g
Sodium: 52 mg
Ingredients: Pasteurized Double Toned Cow Milk, Milk Solids, Active Live Probiotic Lactic Cultures (S. thermophilus, L. bulgaricus). No added sugar, no preservatives, no gelatin.`
  }
];

export function parseNutritionFromText(text: string): ParsedLabelResult {
  const lines = text.split('\n');

  // Default baseline
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let totalSugars = 0;
  let addedSugars = 0;
  let fiber = 0;
  let totalFat = 0;
  let satFat = 0;
  let transFat = 0;
  let sodium = 0;
  let salt = 0;
  let cholesterol = 0;

  // Helper extractor regex
  const extractNum = (pattern: RegExp): number | null => {
    const match = text.match(pattern);
    if (match && match[1]) {
      const val = parseFloat(match[1].replace(/,/g, ''));
      return isNaN(val) ? null : val;
    }
    return null;
  };

  // 1. Calories / Energy
  const energyMatch = extractNum(/(?:energy|calories|caloric value)\s*[:=-]?\s*([0-9.]+)\s*(?:kcal|cal|kj)?/i);
  if (energyMatch !== null) calories = Math.round(energyMatch);

  // 2. Protein
  const proteinMatch = extractNum(/protein\s*[:=-]?\s*([0-9.]+)\s*g?/i);
  if (proteinMatch !== null) protein = proteinMatch;

  // 3. Carbohydrates
  const carbsMatch = extractNum(/(?:total carbohydrate|carbohydrate|carbs)\s*[:=-]?\s*([0-9.]+)\s*g?/i);
  if (carbsMatch !== null) carbs = carbsMatch;

  // 4. Added Sugars (must test before total sugars to avoid greedy conflict)
  const addedSugarsMatch = extractNum(/(?:added sugars?|of which added sugars?)\s*[:=-]?\s*([0-9.]+)\s*g?/i);
  if (addedSugarsMatch !== null) addedSugars = addedSugarsMatch;

  // 5. Total Sugars
  const sugarsMatch = extractNum(/(?:total sugars?|sugars?)\s*[:=-]?\s*([0-9.]+)\s*g?/i);
  if (sugarsMatch !== null) totalSugars = sugarsMatch;

  // 6. Fiber
  const fiberMatch = extractNum(/(?:dietary fiber|dietary fibre|fiber|fibre)\s*[:=-]?\s*([0-9.]+)\s*g?/i);
  if (fiberMatch !== null) fiber = fiberMatch;

  // 7. Total Fat
  const fatMatch = extractNum(/(?:total fat|fat)\s*[:=-]?\s*([0-9.]+)\s*g?/i);
  if (fatMatch !== null) totalFat = fatMatch;

  // 8. Saturated Fat
  const satFatMatch = extractNum(/(?:saturated fat|saturated fatty acids?|sfa)\s*[:=-]?\s*([0-9.]+)\s*g?/i);
  if (satFatMatch !== null) satFat = satFatMatch;

  // 9. Trans Fat
  const transFatMatch = extractNum(/(?:trans fat|trans fatty acids?|tfa)\s*[:=-]?\s*([0-9.]+)\s*g?/i);
  if (transFatMatch !== null) transFat = transFatMatch;

  // 10. Sodium (mg) vs Salt (g)
  const sodiumMatch = extractNum(/(?:sodium)\s*[:=-]?\s*([0-9.]+)\s*(?:mg)?/i);
  if (sodiumMatch !== null) {
    sodium = Math.round(sodiumMatch);
  }

  const saltMatch = extractNum(/(?:salt|iodized salt)\s*[:=-]?\s*([0-9.]+)\s*(?:g)?/i);
  if (saltMatch !== null) {
    salt = saltMatch;
    if (sodium === 0) {
      sodium = Math.round((salt / 2.5) * 1000);
    }
  } else if (sodium > 0) {
    salt = Number(((sodium * 2.5) / 1000).toFixed(2));
  }

  // 11. Ingredients extraction
  let ingredientsText = 'Ingredients not extracted';
  const ingMatch = text.match(/ingredients\s*[:=-]?\s*([\s\S]+?)(?:nutritional|allergen|mfg|best before|net wt|$)/i);
  if (ingMatch && ingMatch[1]) {
    ingredientsText = ingMatch[1].trim().replace(/\n+/g, ' ');
  } else {
    // If no explicit header, find line with words like wheat, sugar, salt, oil
    const potentialIngLine = lines.find(l =>
      l.toLowerCase().includes('flour') ||
      l.toLowerCase().includes('sugar') ||
      l.toLowerCase().includes('water') ||
      l.toLowerCase().includes('oil')
    );
    if (potentialIngLine) {
      ingredientsText = potentialIngLine.trim();
    }
  }

  // Determine Veg type
  let vegType: VegType = 'veg';
  const lowerText = text.toLowerCase();
  if (lowerText.includes('chicken') || lowerText.includes('meat') || lowerText.includes('fish') || lowerText.includes('gelatin')) {
    vegType = 'non-veg';
  } else if (lowerText.includes('vegan') || (!lowerText.includes('milk') && !lowerText.includes('dairy') && !lowerText.includes('egg'))) {
    vegType = 'vegan';
  }

  // Estimate a confidence score based on how many fields were successfully matched
  const matchedCount = [
    calories > 0,
    protein > 0,
    carbs > 0,
    totalFat > 0,
    sodium > 0,
    ingredientsText !== 'Ingredients not extracted'
  ].filter(Boolean).length;

  const confidence = Math.round((matchedCount / 6) * 100);

  return {
    productName: 'Custom Scanned Packaged Product',
    brand: 'OCR Scanned Product',
    vegType,
    ingredientsText,
    nutrition: {
      servingSize: '100g',
      servingSizeGrams: 100,
      caloriesPer100g: calories,
      proteinPer100g: protein,
      carbohydratesPer100g: carbs,
      totalSugarsPer100g: totalSugars,
      addedSugarsPer100g: addedSugars,
      dietaryFiberPer100g: fiber,
      totalFatPer100g: totalFat,
      saturatedFatPer100g: satFat,
      transFatPer100g: transFat,
      cholesterolPer100g: cholesterol,
      sodiumPer100g: sodium,
      saltPer100g: salt
    },
    rawText: text,
    confidence
  };
}

export function createProductFromOcr(parsed: ParsedLabelResult): Product {
  const ingredientsList = parsed.ingredientsText
    .split(/[,;]/)
    .map(i => i.trim())
    .filter(Boolean);

  return {
    barcode: `OCR-${Date.now().toString().slice(-6)}`,
    name: parsed.productName,
    brand: parsed.brand,
    category: 'Scanned Packaged Food',
    subCategory: 'Nutrition Label Scan',
    vegType: parsed.vegType,
    ingredientsText: parsed.ingredientsText,
    ingredientsList: ingredientsList.length > 0 ? ingredientsList : ['Ingredients as detected on packet'],
    nutrition: parsed.nutrition,
    source: 'ocr_scan'
  };
}
