import React from 'react';
import { ScanBarcode, FileText, UserCog, Scale, ShieldCheck, Activity } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';

interface HeaderProps {
  onOpenScanner: () => void;
  onOpenOcr: () => void;
  onOpenProfile: () => void;
  onOpenComparison: () => void;
  onOpenFssaiInfo: () => void;
  onOpenTracker: () => void;
  activeTab: 'catalogue' | 'scanner' | 'detail' | 'compare' | 'tracker';
  setActiveTab: (tab: 'catalogue' | 'scanner' | 'detail' | 'compare' | 'tracker') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenScanner,
  onOpenOcr,
  onOpenProfile,
  onOpenComparison,
  onOpenFssaiInfo,
  onOpenTracker,
  activeTab,
  setActiveTab
}) => {
  const { profile, activePresetId, comparisonList, dailyLogs } = useProfile();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('catalogue')}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-stone-200 bg-white shrink-0 group-hover:border-[#12382c] transition-colors">
              <img
                src="/src/assets/images/foodzwise_logo_1792244362210.jpg"
                alt="FoodzWise Barcode & Leaf Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-stone-900 tracking-tight leading-tight">
                FoodzWise
              </span>
              <span className="text-[11px] text-stone-500 font-medium">
                FSSAI Smart Food &amp; Nutrition Scanner
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-stone-900 cursor-pointer ${
              activeTab === 'catalogue' ? 'text-[#12382c] font-semibold' : ''
            }`}
          >
            Food Catalogue
          </button>

          <button
            onClick={onOpenTracker}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tracker' ? 'text-[#12382c] font-semibold' : ''
            }`}
          >
            <Activity className="w-4 h-4 text-[#12382c]" />
            <span>Daily RDA Tracker</span>
            {dailyLogs.length > 0 && (
              <span className="text-[11px] px-1.5 py-0.2 bg-[#edf4f0] text-[#164437] rounded font-semibold tabular-nums border border-[#cbe0d5]">
                {dailyLogs.length}
              </span>
            )}
          </button>

          <button
            onClick={onOpenOcr}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-stone-400" />
            <span>Label OCR</span>
          </button>

          <button
            onClick={onOpenComparison}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer"
          >
            <Scale className="w-4 h-4 text-stone-400" />
            <span>Compare</span>
            {comparisonList.length > 0 && (
              <span className="text-[11px] px-1.5 py-0.2 bg-[#edf4f0] text-[#164437] rounded font-semibold tabular-nums border border-[#cbe0d5]">
                {comparisonList.length}
              </span>
            )}
          </button>

          <button
            onClick={onOpenProfile}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer"
          >
            <UserCog className="w-4 h-4 text-stone-400" />
            <span>Profile ({profile.dietaryPreference !== 'any' ? profile.dietaryPreference : activePresetId.split('_')[0]})</span>
          </button>

          <button
            onClick={onOpenFssaiInfo}
            className="transition-colors whitespace-nowrap shrink-0 text-[#164437] hover:text-[#0f3228] flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <ShieldCheck className="w-4 h-4 text-[#1b4d3e]" />
            <span>FSSAI Standards</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenScanner}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#12382c] hover:bg-[#1a4a3a] active:bg-[#0c261e] text-white font-medium text-sm rounded-xl shadow-xs transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ScanBarcode className="w-4 h-4" />
            <span>Scan Barcode</span>
          </button>
        </div>
      </div>
    </header>
  );
};
