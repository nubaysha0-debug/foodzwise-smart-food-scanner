import { AdditiveMatch } from '../types/food';

export const COMMON_ADDITIVES: Record<string, Omit<AdditiveMatch, 'code'>> = {
  '102': {
    name: 'Tartrazine (FD&C Yellow 5)',
    category: 'color',
    riskLevel: 'caution',
    description: 'Synthetic lemon yellow azo dye. Known trigger for hyperactivity in children and hives in sensitive individuals.',
    restrictions: ['Requires warning label in EU', 'Avoid for young children']
  },
  '110': {
    name: 'Sunset Yellow FCF',
    category: 'color',
    riskLevel: 'caution',
    description: 'Synthetic orange-yellow azo dye used in confectionery and instant noodles. Linked to allergic reactions and hyperactivity.',
    restrictions: ['Banned or restricted in parts of Europe']
  },
  '129': {
    name: 'Allura Red AC',
    category: 'color',
    riskLevel: 'caution',
    description: 'Synthetic red dye used in sodas, sweets, and snacks. Suspected irritant for sensitive or asthmatic persons.',
  },
  '133': {
    name: 'Brilliant Blue FCF',
    category: 'color',
    riskLevel: 'safe',
    description: 'Synthetic blue dye commonly used in ice creams, beverages, and dairy drinks.',
  },
  '150d': {
    name: 'Caramel IV (Ammonia Sulphite Caramel)',
    category: 'color',
    riskLevel: 'caution',
    description: 'Dark brown food color manufactured with ammonia and sulphites. Contains trace 4-MEI by-product.',
  },
  '150a': {
    name: 'Plain Caramel',
    category: 'color',
    riskLevel: 'safe',
    description: 'Natural burnt sugar caramel coloring, generally safe.',
  },
  '211': {
    name: 'Sodium Benzoate',
    category: 'preservative',
    riskLevel: 'caution',
    description: 'Common antifungal preservative in acidic drinks, sauces, and jams. When combined with Vitamin C (Ascorbic acid), can form trace benzene.',
  },
  '202': {
    name: 'Potassium Sorbate',
    category: 'preservative',
    riskLevel: 'safe',
    description: 'Widely used antimicrobial salt of sorbic acid in cheeses, dips, and baked goods.',
  },
  '220': {
    name: 'Sulphur Dioxide',
    category: 'preservative',
    riskLevel: 'caution',
    description: 'Sulphite preservative common in dried fruits and juices. Can trigger severe bronchospasm in asthmatics.',
    restrictions: ['Mandatory allergen warning >10mg/kg']
  },
  '223': {
    name: 'Sodium Metabisulphite',
    category: 'preservative',
    riskLevel: 'caution',
    description: 'Inorganic compound used as antioxidant and bleach in biscuits and chips. May induce allergic wheezing.',
  },
  '319': {
    name: 'TBHQ (Tertiary Butylhydroquinone)',
    category: 'preservative',
    riskLevel: 'caution',
    description: 'Synthetic antioxidant derived from petroleum used to prevent rancidity in vegetable and palm oils.',
    restrictions: ['Strict permissible limits under FSSAI (<200ppm)']
  },
  '320': {
    name: 'BHA (Butylated Hydroxyanisole)',
    category: 'preservative',
    riskLevel: 'caution',
    description: 'Synthetic phenolic antioxidant used in processed snacks and cereal flakes.',
  },
  '322': {
    name: 'Lecithin (Soy / Sunflower)',
    category: 'emulsifier',
    riskLevel: 'safe',
    description: 'Natural phospholipid emulsifier that blends fats and water in chocolates and spreads.',
    restrictions: ['Allergen notice required if derived from Soy']
  },
  '330': {
    name: 'Citric Acid',
    category: 'acidity_regulator',
    riskLevel: 'safe',
    description: 'Natural organic acid giving sourness and preserving freshness.',
  },
  '407': {
    name: 'Carrageenan',
    category: 'emulsifier',
    riskLevel: 'caution',
    description: 'Red seaweed extract used for gelling in dairy and plant milks. Suspected gut inflammatory in sensitive digestions.',
  },
  '412': {
    name: 'Guar Gum',
    category: 'emulsifier',
    riskLevel: 'safe',
    description: 'Natural dietary soluble fiber derived from cluster beans (guar). Helps thicken sauces and ice creams.',
  },
  '415': {
    name: 'Xanthan Gum',
    category: 'emulsifier',
    riskLevel: 'safe',
    description: 'Polysaccharide thickening agent produced by bacterial fermentation of simple sugars.',
  },
  '471': {
    name: 'Mono- and Diglycerides of Fatty Acids',
    category: 'emulsifier',
    riskLevel: 'safe',
    description: 'Common lipid emulsifier in bakery and spreads. May be derived from animal fat or plant oil (look for green dot in India).',
  },
  '500': {
    name: 'Sodium Bicarbonate (Baking Soda)',
    category: 'acidity_regulator',
    riskLevel: 'safe',
    description: 'Traditional leavening agent in baked goods and instant noodles.',
  },
  '551': {
    name: 'Silicon Dioxide',
    category: 'emulsifier',
    riskLevel: 'safe',
    description: 'Anti-caking powder preventing spice mixes and drink powders from clumping.',
  },
  '621': {
    name: 'Monosodium Glutamate (MSG)',
    category: 'flavor_enhancer',
    riskLevel: 'caution',
    description: 'Umami-rich sodium salt of glutamic acid. Safe in moderate amounts according to FSSAI/FDA, but triggers sensitivity or headaches in some individuals.',
    restrictions: ['FSSAI: Not permitted in foods for infants below 12 months']
  },
  '627': {
    name: 'Disodium Guanylate',
    category: 'flavor_enhancer',
    riskLevel: 'safe',
    description: 'Natural nucleotide flavor enhancer usually paired with MSG or I+G in noodles and chips.',
  },
  '631': {
    name: 'Disodium Inosinate',
    category: 'flavor_enhancer',
    riskLevel: 'safe',
    description: 'Synergistic umami enhancer. Often derived from tapioca or fermented starch (check for veg mark).',
  },
  '950': {
    name: 'Acesulfame Potassium (Ace-K)',
    category: 'sweetener',
    riskLevel: 'caution',
    description: 'Zero-calorie non-nutritive artificial sweetener 200x sweeter than sucrose. Heat stable.',
    restrictions: ['FSSAI: Mandatory warning "Contains Artificial Sweetener"']
  },
  '951': {
    name: 'Aspartame',
    category: 'sweetener',
    riskLevel: 'high_risk',
    description: 'Artificial low-calorie sweetener. Dangerous for patients with Phenylketonuria (PKU). Classified as Group 2B possible carcinogen by WHO/IARC.',
    restrictions: ['Strict warning required: "Contains Phenylalanine"', 'Not recommended for children or pregnant women']
  },
  '955': {
    name: 'Sucralose',
    category: 'sweetener',
    riskLevel: 'caution',
    description: 'Chlorinated sugar derivative 600x sweeter than table sugar. Zero calories, but may alter gut microbiome if consumed heavily.',
  },
  '960': {
    name: 'Steviol Glycosides (Stevia)',
    category: 'sweetener',
    riskLevel: 'safe',
    description: 'Natural zero-calorie sweetener extracted from Stevia rebaudiana plant leaves.',
  },
  '965': {
    name: 'Maltitol',
    category: 'sweetener',
    riskLevel: 'safe',
    description: 'Sugar alcohol used in "sugar-free" chocolates and cookies. Can cause bloating or laxative effect at high intake.',
  }
};

export const HIDDEN_SUGAR_TERMS = [
  'high fructose corn syrup',
  'corn syrup',
  'invert sugar',
  'invert sugar syrup',
  'liquid glucose',
  'maltodextrin',
  'dextrose',
  'maltose',
  'cane sugar',
  'brown sugar',
  'golden syrup',
  'molasses',
  'agave nectar',
  'concentrated fruit juice',
  'fructose',
  'caramel'
];

export const PALM_OIL_TERMS = [
  'palm oil',
  'palmolein',
  'fractionated palm oil',
  'palm kernel oil',
  'hydrogenated palm oil',
  'refined palmolein oil',
  'elaeis guineensis'
];

export const JAIN_FORBIDDEN_TERMS = [
  'onion',
  'onion powder',
  'dehydrated onion',
  'garlic',
  'garlic powder',
  'dehydrated garlic',
  'potato',
  'potato starch',
  'carrot',
  'radish',
  'ginger',
  'gelatin',
  'animal rennet',
  'carmine',
  'cochineal',
  'egg',
  'meat',
  'chicken'
];
