import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserHealthProfile, Product, DailyLoggedItem } from '../types/food';

export interface ProfilePreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  profile: UserHealthProfile;
}

export const PROFILE_PRESETS: ProfilePreset[] = [
  {
    id: 'general_healthy',
    name: 'General Wellness',
    badge: 'Standard',
    description: 'Balanced ICMR-FSSAI guidelines: flags excessive sugar, high sodium, and trans fats.',
    profile: {
      name: 'Default User',
      ageGroup: 'adult',
      healthConditions: {
        diabetes: false,
        hypertension: false,
        highCholesterol: false,
        celiacDisease: false,
        lactoseIntolerance: false,
        kidneyCare: false,
        weightManagement: false
      },
      dietaryPreference: 'any',
      allergens: [],
      strictPreferences: {
        avoidPalmOil: false,
        avoidHighFructoseCornSyrup: false,
        avoidArtificialSweeteners: false,
        avoidUltraProcessed: false,
        avoidMSG: false
      }
    }
  },
  {
    id: 'diabetic_profile',
    name: 'Type 2 Diabetes & Pre-diabetic',
    badge: 'Low Sugar',
    description: 'Strict alerts on added sugars, high carbohydrates, and deceptive syrups like maltodextrin/HFCS.',
    profile: {
      name: 'Diabetic Profile',
      ageGroup: 'adult',
      healthConditions: {
        diabetes: true,
        hypertension: false,
        highCholesterol: false,
        celiacDisease: false,
        lactoseIntolerance: false,
        kidneyCare: false,
        weightManagement: false
      },
      dietaryPreference: 'any',
      allergens: [],
      strictPreferences: {
        avoidPalmOil: false,
        avoidHighFructoseCornSyrup: true,
        avoidArtificialSweeteners: false,
        avoidUltraProcessed: false,
        avoidMSG: false
      }
    }
  },
  {
    id: 'hypertension_profile',
    name: 'Hypertension / Heart Health',
    badge: 'Low Sodium',
    description: 'DASH diet focus: flags items exceeding 400mg sodium and high saturated fats.',
    profile: {
      name: 'Cardiac & BP Profile',
      ageGroup: 'adult',
      healthConditions: {
        diabetes: false,
        hypertension: true,
        highCholesterol: true,
        celiacDisease: false,
        lactoseIntolerance: false,
        kidneyCare: false,
        weightManagement: false
      },
      dietaryPreference: 'any',
      allergens: [],
      strictPreferences: {
        avoidPalmOil: true,
        avoidHighFructoseCornSyrup: false,
        avoidArtificialSweeteners: false,
        avoidUltraProcessed: false,
        avoidMSG: true
      }
    }
  },
  {
    id: 'celiac_profile',
    name: 'Celiac & Gluten Sensitive',
    badge: 'Gluten Free',
    description: 'Zero tolerance for wheat, maida, barley, rye, malt extract, and cross-contamination.',
    profile: {
      name: 'Gluten-Free Profile',
      ageGroup: 'adult',
      healthConditions: {
        diabetes: false,
        hypertension: false,
        highCholesterol: false,
        celiacDisease: true,
        lactoseIntolerance: false,
        kidneyCare: false,
        weightManagement: false
      },
      dietaryPreference: 'any',
      allergens: ['Gluten'],
      strictPreferences: {
        avoidPalmOil: false,
        avoidHighFructoseCornSyrup: false,
        avoidArtificialSweeteners: false,
        avoidUltraProcessed: false,
        avoidMSG: false
      }
    }
  },
  {
    id: 'clean_vegan',
    name: 'Plant-Based & Palm-Oil Free',
    badge: 'Vegan Clean',
    description: 'Strict vegan, flags all dairy/egg/honey and eliminates palm oil and ultra-processed Nova 4 items.',
    profile: {
      name: 'Vegan Profile',
      ageGroup: 'adult',
      healthConditions: {
        diabetes: false,
        hypertension: false,
        highCholesterol: false,
        celiacDisease: false,
        lactoseIntolerance: false,
        kidneyCare: false,
        weightManagement: false
      },
      dietaryPreference: 'vegan',
      allergens: ['Dairy / Milk', 'Eggs', 'Fish', 'Shellfish'],
      strictPreferences: {
        avoidPalmOil: true,
        avoidHighFructoseCornSyrup: true,
        avoidArtificialSweeteners: true,
        avoidUltraProcessed: true,
        avoidMSG: false
      }
    }
  },
  {
    id: 'kid_safe',
    name: 'Kids Snack & School Lunch Check',
    badge: 'Child Safe',
    description: 'Flags artificial food dyes (Tartrazine/Sunset Yellow), non-nutritive sweeteners, MSG, and HFSS sugar.',
    profile: {
      name: 'School Kid Profile',
      ageGroup: 'child',
      healthConditions: {
        diabetes: false,
        hypertension: false,
        highCholesterol: false,
        celiacDisease: false,
        lactoseIntolerance: false,
        kidneyCare: false,
        weightManagement: false
      },
      dietaryPreference: 'vegetarian',
      allergens: ['Peanuts'],
      strictPreferences: {
        avoidPalmOil: true,
        avoidHighFructoseCornSyrup: true,
        avoidArtificialSweeteners: true,
        avoidUltraProcessed: true,
        avoidMSG: true
      }
    }
  },
  {
    id: 'jain_profile',
    name: 'Jain Dietary Profile',
    badge: 'Jain Safe',
    description: 'Strict vegetarian with automatic detection of onion, garlic, potatoes, carrots, root tubers, and animal enzymes.',
    profile: {
      name: 'Jain Profile',
      ageGroup: 'adult',
      healthConditions: {
        diabetes: false,
        hypertension: false,
        highCholesterol: false,
        celiacDisease: false,
        lactoseIntolerance: false,
        kidneyCare: false,
        weightManagement: false
      },
      dietaryPreference: 'jain',
      allergens: ['Eggs', 'Fish', 'Shellfish'],
      strictPreferences: {
        avoidPalmOil: false,
        avoidHighFructoseCornSyrup: false,
        avoidArtificialSweeteners: false,
        avoidUltraProcessed: false,
        avoidMSG: false
      }
    }
  }
];

interface ProfileContextType {
  profile: UserHealthProfile;
  setProfile: (profile: UserHealthProfile) => void;
  activePresetId: string;
  applyPreset: (presetId: string) => void;
  recentScans: Product[];
  addRecentScan: (product: Product) => void;
  clearRecentScans: () => void;
  comparisonList: Product[];
  addToComparison: (product: Product) => boolean;
  removeFromComparison: (barcode: string) => void;
  clearComparison: () => void;
  dailyLogs: DailyLoggedItem[];
  addDailyLog: (item: Omit<DailyLoggedItem, 'id' | 'timestamp'>) => void;
  removeDailyLog: (id: string) => void;
  clearDailyLogs: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePresetId, setActivePresetId] = useState<string>('general_healthy');
  const [profile, setProfileState] = useState<UserHealthProfile>(() => {
    try {
      const saved = localStorage.getItem('foodzwise_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return PROFILE_PRESETS[0].profile;
  });

  const [recentScans, setRecentScans] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('foodzwise_recent_scans');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [comparisonList, setComparisonList] = useState<Product[]>([]);

  // Daily Nutrient Logs
  const [dailyLogs, setDailyLogs] = useState<DailyLoggedItem[]>(() => {
    try {
      const saved = localStorage.getItem('foodzwise_daily_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    // Default starter logs for today to demonstrate functionality
    return [
      {
        id: 'seed-1',
        timestamp: new Date().toISOString(),
        barcode: '8900000000035',
        productName: 'High-Protein Rolled Oats',
        brand: 'FoodzWise Pure Nutrition',
        servingPortionGrams: 40,
        calories: 150,
        totalSugars: 0.4,
        addedSugars: 0,
        saturatedFat: 0.5,
        sodium: 10,
        totalFat: 2.9,
        protein: 8.6,
        fiber: 4.7
      },
      {
        id: 'seed-2',
        timestamp: new Date().toISOString(),
        barcode: '8900000000042',
        productName: 'Everyday Plain Yogurt',
        brand: 'FoodzWise Dairy Fresh',
        servingPortionGrams: 100,
        calories: 64,
        totalSugars: 4.6,
        addedSugars: 0,
        saturatedFat: 1.9,
        sodium: 48,
        totalFat: 3.1,
        protein: 4.2,
        fiber: 0
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('foodzwise_profile', JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('foodzwise_recent_scans', JSON.stringify(recentScans));
    } catch {
      // ignore
    }
  }, [recentScans]);

  useEffect(() => {
    try {
      localStorage.setItem('foodzwise_daily_logs', JSON.stringify(dailyLogs));
    } catch {
      // ignore
    }
  }, [dailyLogs]);

  const setProfile = (newProfile: UserHealthProfile) => {
    setProfileState(newProfile);
    setActivePresetId('custom');
  };

  const applyPreset = (presetId: string) => {
    const found = PROFILE_PRESETS.find(p => p.id === presetId);
    if (found) {
      setActivePresetId(found.id);
      setProfileState(found.profile);
    }
  };

  const addRecentScan = (product: Product) => {
    setRecentScans(prev => {
      const filtered = prev.filter(p => p.barcode !== product.barcode);
      return [product, ...filtered].slice(0, 10);
    });
  };

  const clearRecentScans = () => {
    setRecentScans([]);
  };

  const addToComparison = (product: Product): boolean => {
    if (comparisonList.some(p => p.barcode === product.barcode)) return true;
    if (comparisonList.length >= 2) {
      setComparisonList([comparisonList[0], product]);
      return true;
    }
    setComparisonList([...comparisonList, product]);
    return true;
  };

  const removeFromComparison = (barcode: string) => {
    setComparisonList(prev => prev.filter(p => p.barcode !== barcode));
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  const addDailyLog = (item: Omit<DailyLoggedItem, 'id' | 'timestamp'>) => {
    const newItem: DailyLoggedItem = {
      ...item,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };
    setDailyLogs(prev => [newItem, ...prev]);
  };

  const removeDailyLog = (id: string) => {
    setDailyLogs(prev => prev.filter(log => log.id !== id));
  };

  const clearDailyLogs = () => {
    setDailyLogs([]);
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        activePresetId,
        applyPreset,
        recentScans,
        addRecentScan,
        clearRecentScans,
        comparisonList,
        addToComparison,
        removeFromComparison,
        clearComparison,
        dailyLogs,
        addDailyLog,
        removeDailyLog,
        clearDailyLogs
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
}
