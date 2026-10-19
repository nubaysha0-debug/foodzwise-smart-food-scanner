import React, { useState } from 'react';
import { X, UserCog, Check, Shield } from 'lucide-react';
import { useProfile, PROFILE_PRESETS } from '../context/ProfileContext';
import { UserHealthProfile } from '../types/food';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALLERGEN_OPTIONS = [
  'Gluten',
  'Peanuts',
  'Tree Nuts',
  'Dairy / Milk',
  'Soy',
  'Eggs',
  'Fish',
  'Shellfish',
  'Sesame',
  'Sulfites'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, setProfile, activePresetId, applyPreset } = useProfile();
  const [localProfile, setLocalProfile] = useState<UserHealthProfile>(profile);

  if (!isOpen) return null;

  const handleConditionToggle = (conditionKey: keyof UserHealthProfile['healthConditions']) => {
    setLocalProfile(prev => ({
      ...prev,
      healthConditions: {
        ...prev.healthConditions,
        [conditionKey]: !prev.healthConditions[conditionKey]
      }
    }));
  };

  const handleStrictToggle = (strictKey: keyof UserHealthProfile['strictPreferences']) => {
    setLocalProfile(prev => ({
      ...prev,
      strictPreferences: {
        ...prev.strictPreferences,
        [strictKey]: !prev.strictPreferences[strictKey]
      }
    }));
  };

  const handleAllergenToggle = (allergen: string) => {
    setLocalProfile(prev => {
      const exists = prev.allergens.includes(allergen);
      const nextAllergens = exists
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen];
      return { ...prev, allergens: nextAllergens };
    });
  };

  const handleSave = () => {
    setProfile(localProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-[#12382c]" />
            <h2 className="text-lg font-bold text-stone-900">Custom Dietary &amp; Health Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Preset Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                Quick Health Persona Presets
              </label>
              <span className="text-xs text-stone-500">1-tap apply</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PROFILE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    applyPreset(preset.id);
                    setLocalProfile(preset.profile);
                  }}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    activePresetId === preset.id
                      ? 'border-[#1b4d3e] bg-[#edf4f0] shadow-xs'
                      : 'border-stone-200 bg-stone-50 hover:bg-stone-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-stone-900">{preset.name}</span>
                    <span className="text-[10px] font-semibold bg-white px-1.5 py-0.5 rounded border border-stone-200">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-2 leading-tight">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Profile Name & Dietary Preference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
            <div>
              <label htmlFor="profile-name-input" className="block text-xs font-semibold text-stone-700 mb-1">
                Profile Display Name
              </label>
              <input
                id="profile-name-input"
                type="text"
                value={localProfile.name}
                onChange={e => setLocalProfile({ ...localProfile, name: e.target.value })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label htmlFor="dietary-preference-select" className="block text-xs font-semibold text-stone-700 mb-1">
                Dietary Framework
              </label>
              <select
                id="dietary-preference-select"
                value={localProfile.dietaryPreference}
                onChange={e => setLocalProfile({
                  ...localProfile,
                  dietaryPreference: e.target.value as UserHealthProfile['dietaryPreference']
                })}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
              >
                <option value="any">Any / Omnivore (Standard)</option>
                <option value="vegetarian">Pure Vegetarian (Green Dot)</option>
                <option value="vegan">Vegan (Strict Plant-Based)</option>
                <option value="jain">Jain Diet (No Root Veg / Gelatin)</option>
                <option value="eggetarian">Eggetarian</option>
                <option value="halal">Halal Compliant</option>
              </select>
            </div>
          </div>

          {/* Health Conditions Checkboxes */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">
              Target Health Goals &amp; Clinical Conditions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { key: 'diabetes', label: 'Type 2 Diabetes / Pre-diabetic', desc: 'Strict low sugar & low GI carbs' },
                { key: 'hypertension', label: 'Hypertension / High BP', desc: 'Strict low sodium / DASH diet' },
                { key: 'highCholesterol', label: 'High Cholesterol / Heart Care', desc: 'Low saturated fat & zero trans fat' },
                { key: 'celiacDisease', label: 'Celiac Disease', desc: '100% Gluten-free audit' },
                { key: 'lactoseIntolerance', label: 'Lactose Intolerance', desc: 'Flags milk solids & dairy' },
                { key: 'kidneyCare', label: 'Renal / Kidney Health', desc: 'Monitors sodium & protein load' },
                { key: 'weightManagement', label: 'Weight Management', desc: 'Low caloric density emphasis' }
              ].map(item => {
                const k = item.key as keyof UserHealthProfile['healthConditions'];
                const checked = localProfile.healthConditions[k];
                return (
                  <label
                    key={item.key}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      checked ? 'bg-[#edf4f0] border-[#cbe0d5] text-stone-900' : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleConditionToggle(k)}
                      className="mt-0.5 accent-[#12382c] rounded"
                    />
                    <div>
                      <span className="font-semibold block">{item.label}</span>
                      <span className="text-[11px] text-stone-500">{item.desc}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Allergens Selection */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">
              Specific Allergies to Disclose &amp; Ban
            </h4>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map(allergen => {
                const selected = localProfile.allergens.includes(allergen);
                return (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => handleAllergenToggle(allergen)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      selected
                        ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {selected ? `✕ ${allergen}` : `+ ${allergen}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Strict Preferences (Palm oil, MSG, etc.) */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">
              Strict Ingredient Philosophy
            </h4>
            <div className="space-y-2 text-xs">
              {[
                { key: 'avoidPalmOil', label: 'Avoid Refined Palm & Palmolein Oil', desc: 'Common high-saturated frying medium' },
                { key: 'avoidHighFructoseCornSyrup', label: 'Avoid High-Fructose Corn Syrup & Invert Sugars', desc: 'Industrial simple sweeteners' },
                { key: 'avoidArtificialSweeteners', label: 'Avoid Non-Nutritive Artificial Sweeteners', desc: 'Aspartame (951), Ace-K (950), Sucralose (955)' },
                { key: 'avoidUltraProcessed', label: 'Avoid Ultra-Processed Foods (Nova 4)', desc: 'Prioritize whole and minimally processed products' },
                { key: 'avoidMSG', label: 'Avoid MSG & Free Glutamate Flavor Enhancers', desc: 'INS 621 and hydrolyzed proteins' }
              ].map(item => {
                const k = item.key as keyof UserHealthProfile['strictPreferences'];
                const checked = localProfile.strictPreferences[k];
                return (
                  <label
                    key={item.key}
                    className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer ${
                      checked ? 'bg-[#edf4f0] border-[#cbe0d5] text-stone-900' : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleStrictToggle(k)}
                      className="mt-0.5 accent-[#12382c]"
                    />
                    <div>
                      <span className="font-semibold block">{item.label}</span>
                      <span className="text-[11px] text-stone-500">{item.desc}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <Shield className="w-3.5 h-3.5 text-[#12382c]" />
            <span>Saved privately in device local storage</span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#12382c] hover:bg-[#1a4a3a] text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>Save &amp; Apply Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
