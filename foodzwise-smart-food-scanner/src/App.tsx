import React, { useState, useMemo } from 'react';
import {
  ScanBarcode,
  Search,
  Sparkles,
  UserCog,
  FileText,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Scale,
  Globe2,
  Loader2
} from 'lucide-react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductDetail } from './components/ProductDetail';
import { ScannerModal } from './components/ScannerModal';
import { OcrModal } from './components/OcrModal';
import { ProfileModal } from './components/ProfileModal';
import { ComparisonDrawer } from './components/ComparisonDrawer';
import { FssaiStandardsModal } from './components/FssaiStandardsModal';
import { DailyTracker } from './components/DailyTracker';
import { ProfileProvider, useProfile, PROFILE_PRESETS } from './context/ProfileContext';
import { LOCAL_CATALOGUE } from './data/catalogue';
import { lookupBarcode, searchOnlineFoodDatabase } from './services/productService';
import { analyzeProduct } from './services/analysisEngine';
import { Product } from './types/food';

const MainAppContent: React.FC = () => {
  const { profile, activePresetId, applyPreset, addRecentScan, comparisonList } = useProfile();

  // Navigation and Modal states
  const [activeTab, setActiveTab] = useState<'catalogue' | 'scanner' | 'detail' | 'compare' | 'tracker'>('catalogue');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isFssaiModalOpen, setIsFssaiModalOpen] = useState(false);

  // Search & Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDietFilter, setSelectedDietFilter] = useState<'all' | 'veg' | 'vegan' | 'non-veg' | 'jain_safe'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'sugar_low' | 'protein_high' | 'sodium_low'>('score');

  // Online registry search state
  const [onlineProducts, setOnlineProducts] = useState<Product[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [hasSearchedOnline, setHasSearchedOnline] = useState(false);

  // Loading & Notification state
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Barcode Handler (from scanner, demo chip, or manual)
  const handleBarcodeDetected = async (barcode: string) => {
    setIsScannerOpen(false);
    setIsLookingUp(true);

    try {
      const result = await lookupBarcode(barcode);
      if (result.found && result.product) {
        setSelectedProduct(result.product);
        addRecentScan(result.product);
        setActiveTab('detail');
        showNotification(
          result.source === 'catalogue'
            ? `Verified product found: ${result.product.name}`
            : `Live product fetched from FSSAI / Open Food Facts registry: ${result.product.name}`,
          'success'
        );
      } else {
        showNotification(
          result.message || `No product found for barcode ${barcode}. Try scanning via Label OCR!`,
          'error'
        );
      }
    } catch {
      showNotification('Error looking up barcode. Check internet connection or use verified catalogue items.', 'error');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleProductFromOcr = (product: Product) => {
    setSelectedProduct(product);
    addRecentScan(product);
    setActiveTab('detail');
    showNotification(`OCR Label digitized: ${product.name}`, 'success');
  };

  // Online search trigger for every product in the market
  const handleSearchOnline = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingOnline(true);
    setHasSearchedOnline(true);
    try {
      const results = await searchOnlineFoodDatabase(searchQuery);
      setOnlineProducts(results);
      if (results.length > 0) {
        showNotification(`Found ${results.length} live products matching "${searchQuery}" in online database!`, 'success');
      } else {
        showNotification(`No online products matched "${searchQuery}". Check spelling or try scanning barcode.`, 'info');
      }
    } catch {
      showNotification('Online database search timed out. Displaying verified local catalogue.', 'error');
    } finally {
      setIsSearchingOnline(false);
    }
  };

  // Filtered and Sorted Catalogue
  const filteredProducts = useMemo(() => {
    const combinedMap = new Map<string, Product>();

    LOCAL_CATALOGUE.forEach(p => combinedMap.set(p.barcode, p));
    onlineProducts.forEach(p => combinedMap.set(p.barcode, p));

    let list = Array.from(combinedMap.values());

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.ingredientsText.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category === selectedCategory);
    }

    // Diet filter
    if (selectedDietFilter === 'veg') {
      list = list.filter(p => p.vegType === 'veg' || p.vegType === 'vegan');
    } else if (selectedDietFilter === 'vegan') {
      list = list.filter(p => p.vegType === 'vegan');
    } else if (selectedDietFilter === 'non-veg') {
      list = list.filter(p => p.vegType === 'non-veg');
    } else if (selectedDietFilter === 'jain_safe') {
      list = list.filter(p => {
        const analysis = analyzeProduct(p, profile);
        return analysis.isJainSafe;
      });
    }

    // Sorting
    list.sort((a, b) => {
      const fitA = analyzeProduct(a, profile).explainableFit.overallScore;
      const fitB = analyzeProduct(b, profile).explainableFit.overallScore;

      if (sortBy === 'score') {
        return fitB - fitA;
      }
      if (sortBy === 'sugar_low') {
        return a.nutrition.totalSugarsPer100g - b.nutrition.totalSugarsPer100g;
      }
      if (sortBy === 'sodium_low') {
        return a.nutrition.sodiumPer100g - b.nutrition.sodiumPer100g;
      }
      if (sortBy === 'protein_high') {
        return b.nutrition.proteinPer100g - a.nutrition.proteinPer100g;
      }
      return 0;
    });

    return list;
  }, [searchQuery, selectedCategory, selectedDietFilter, sortBy, profile, onlineProducts]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    LOCAL_CATALOGUE.forEach(p => set.add(p.category));
    onlineProducts.forEach(p => set.add(p.category));
    return ['all', ...Array.from(set)];
  }, [onlineProducts]);

  return (
    <div className="min-h-screen bg-[#fbf9f5] flex flex-col font-sans text-stone-900">
      {/* Header */}
      <Header
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenOcr={() => setIsOcrOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenComparison={() => setIsComparisonOpen(true)}
        onOpenFssaiInfo={() => setIsFssaiModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'catalogue') setSelectedProduct(null);
        }}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`p-4 rounded-xl shadow-lg border flex items-start gap-3 text-xs font-semibold ${
              notification.type === 'success'
                ? 'bg-[#0f382c] text-white border-[#1c5544]'
                : notification.type === 'error'
                ? 'bg-[#5c1d1d] text-white border-[#7a2828]'
                : 'bg-[#18392f] text-white border-[#275345]'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <p className="leading-relaxed">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Active Profile Persona Banner (Quick Switcher) */}
      <div className="bg-white border-b border-stone-200/80 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-700 flex items-center gap-1.5 shrink-0">
              <UserCog className="w-4 h-4 text-[#1b4d3e]" />
              <span>Active Health Persona:</span>
            </span>
            <span className="font-bold text-stone-900 px-2 py-0.5 bg-stone-100 rounded-md border border-stone-200">
              {profile.name}
            </span>
            {profile.dietaryPreference !== 'any' && (
              <span className="text-[11px] font-semibold text-[#164437] bg-[#edf4f0] px-2 py-0.5 rounded border border-[#cbe0d5] uppercase">
                {profile.dietaryPreference}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-stone-500 whitespace-nowrap">Switch Profile:</span>
            {PROFILE_PRESETS.slice(0, 5).map(p => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activePresetId === p.id
                    ? 'bg-[#164437] text-white font-bold shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {p.badge}
              </button>
            ))}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="text-[11px] text-[#164437] hover:underline font-semibold whitespace-nowrap px-1 cursor-pointer"
            >
              More / Custom →
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {selectedProduct ? (
          /* Product Detail View */
          <ProductDetail
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            onSelectAlternative={(alt) => {
              setSelectedProduct(alt);
              addRecentScan(alt);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          /* Main Catalogue & Discovery View */
          <div className="space-y-8">
            {/* Hero Banner with Dark Forest Green Organic Palette */}
            <div className="bg-gradient-to-br from-[#12382c] via-[#0d2f24] to-[#081e17] text-white rounded-3xl p-6 sm:p-10 shadow-md border border-[#1b4b3b] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-300 border border-white/15">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>FSSAI Standards Aligned Food Safety Intelligence</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Decode Every Indian Packaged Food.
                </h1>

                <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-normal">
                  Scan any packaged food barcode or nutrition label to verify FSSAI Front-of-Pack HFSS (High in Fat, Sugar, Salt) warnings, uncover deceptive chemical additive codes, and check compatibility with diabetes, blood pressure, celiac, and pediatric diets.
                </p>

                {/* Primary Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <ScanBarcode className="w-5 h-5" />
                    <span>Scan Barcode Camera</span>
                  </button>

                  <button
                    onClick={() => setIsOcrOpen(true)}
                    className="px-5 py-3 bg-white/12 hover:bg-white/18 text-white font-semibold text-sm rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-emerald-300" />
                    <span>Scan Nutrition Label (OCR)</span>
                  </button>

                  <button
                    onClick={() => setIsFssaiModalOpen(true)}
                    className="px-4 py-3 text-emerald-200 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    FSSAI License Decoder →
                  </button>
                </div>
              </div>

              {/* Logo Emblem Card */}
              <div className="hidden md:flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shrink-0 text-center relative z-10 shadow-inner">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-white p-2 shadow-md border border-white/20 mb-3">
                  <img
                    src="/src/assets/images/foodzwise_logo_1792244362210.jpg"
                    alt="FoodzWise Barcode & Leaf Emblem"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xs font-bold text-emerald-200">Food Safety &amp; Tech</span>
                <span className="text-[11px] text-stone-300">FSSAI Decision Engine</span>
              </div>

              {/* Decorative Subtle Organic Accent */}
              <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-emerald-700/15 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Popular Verified Indian Foods Launcher */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Popular Indian Packaged Foods
                  </span>
                  <span className="text-xs text-stone-400">· 1-Tap Quick Health Inspection</span>
                </div>
                <span className="text-xs text-stone-500">Tap any item to analyze:</span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { name: 'Parle-G Biscuits', code: '8901719101014', badge: 'High Sugar' },
                  { name: 'Amul Butter', code: '8901262010054', badge: 'High Sat Fat' },
                  { name: 'Kurkure Masala', code: '8901491101831', badge: 'High Salt' },
                  { name: "Haldiram's Bhujia", code: '8904004400282', badge: 'High Fat' },
                  { name: 'Good Day Butter', code: '8901063012028', badge: 'Palm Oil' },
                  { name: 'Instant Noodles', code: '8900000000073', badge: 'Extreme Sodium' },
                  { name: 'Cadbury Dairy Milk', code: '8901233024042', badge: '56g Sugar' },
                  { name: 'Real Mixed Fruit', code: '8901207010484', badge: 'Liquid Sugar' },
                  { name: 'Rolled Oats', code: '8900000000035', badge: 'High Protein' },
                  { name: 'Tender Coconut Water', code: '8900000000097', badge: '100% Natural' },
                  { name: 'MTR Dal Makhani', code: '8901042953250', badge: 'Ready Meal' },
                ].map(item => (
                  <button
                    key={item.code}
                    onClick={() => handleBarcodeDetected(item.code)}
                    disabled={isLookingUp}
                    className="flex flex-col text-left px-3 py-2 bg-stone-50 hover:bg-[#edf5f1] border border-stone-200 hover:border-[#1b4d3e] rounded-xl transition-all shrink-0 cursor-pointer group"
                  >
                    <span className="text-xs font-bold text-stone-800 group-hover:text-[#133c30] whitespace-nowrap">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-stone-500 font-mono">
                      <span>{item.code.slice(-5)}</span>
                      <span>·</span>
                      <span className="text-[#1b4d3e] font-sans font-medium">{item.badge}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Search, Filter & Controls Toolbar */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSearchOnline();
                    }}
                    placeholder="Search any food by name, brand, or barcode (e.g. Parle-G, Amul, Lays, Maggi, Dabur, Bournvita)..."
                    className="w-full pl-10 pr-24 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:border-[#1b4d3e] focus:outline-hidden shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setOnlineProducts([]);
                        setHasSearchedOnline(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Live Online Database Search Button */}
                <button
                  type="button"
                  onClick={handleSearchOnline}
                  disabled={isSearchingOnline || !searchQuery.trim()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#12382c] hover:bg-[#194a3a] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0 shadow-xs"
                >
                  {isSearchingOnline ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                      <span>Searching 2.5M+ products...</span>
                    </>
                  ) : (
                    <>
                      <Globe2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Search All Market Products</span>
                    </>
                  )}
                </button>

                {/* Sort control */}
                <div className="flex items-center gap-2 shrink-0">
                  <Filter className="w-4 h-4 text-stone-400 shrink-0" />
                  <label htmlFor="sort-select" className="text-xs font-medium text-stone-600 shrink-0">Sort By:</label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as typeof sortBy)}
                    className="px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-700 shadow-xs cursor-pointer"
                  >
                    <option value="score">Health Fit Score (High to Low)</option>
                    <option value="sugar_low">Lowest Sugar</option>
                    <option value="sodium_low">Lowest Sodium</option>
                    <option value="protein_high">Highest Protein</option>
                  </select>
                </div>
              </div>

              {/* Online search status indicator */}
              {hasSearchedOnline && (
                <div className="flex items-center justify-between text-xs p-2.5 bg-[#edf5f1] border border-[#c6dfd4] rounded-xl text-[#12382c]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Globe2 className="w-3.5 h-3.5 text-[#1b4d3e]" />
                    <span>Online Food Database search active for &ldquo;{searchQuery}&rdquo;</span>
                  </span>
                  <span className="font-semibold text-[#12382c]">
                    +{onlineProducts.length} live products loaded
                  </span>
                </div>
              )}

              {/* Category & Dietary Filter Chips */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Diet Selectors */}
                <div className="flex items-center gap-1 bg-stone-200/70 p-1 rounded-lg text-xs font-medium">
                  <button
                    onClick={() => setSelectedDietFilter('all')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      selectedDietFilter === 'all'
                        ? 'bg-white text-stone-900 shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    All Diets
                  </button>
                  <button
                    onClick={() => setSelectedDietFilter('veg')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                      selectedDietFilter === 'veg'
                        ? 'bg-white text-[#12382c] shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>Vegetarian</span>
                  </button>
                  <button
                    onClick={() => setSelectedDietFilter('vegan')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                      selectedDietFilter === 'vegan'
                        ? 'bg-white text-[#12382c] shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span>Vegan</span>
                  </button>
                  <button
                    onClick={() => setSelectedDietFilter('jain_safe')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      selectedDietFilter === 'jain_safe'
                        ? 'bg-white text-[#12382c] shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Jain Safe
                  </button>
                  <button
                    onClick={() => setSelectedDietFilter('non-veg')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                      selectedDietFilter === 'non-veg'
                        ? 'bg-white text-amber-900 shadow-xs font-bold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-800" />
                    <span>Non-Veg</span>
                  </button>
                </div>

                <div className="h-5 w-px bg-stone-300 hidden sm:block mx-1" />

                {/* Category Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#12382c] text-white font-semibold'
                          : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {cat === 'all' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Count & Product Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>
                  Showing <strong className="text-stone-900">{filteredProducts.length}</strong> packaged foods evaluated for{' '}
                  <strong className="text-[#164437]">{profile.name}</strong>
                </span>
                {comparisonList.length > 0 && (
                  <button
                    onClick={() => setIsComparisonOpen(true)}
                    className="text-[#164437] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>{comparisonList.length} items in Comparison Tray</span>
                  </button>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
                  <HelpCircle className="w-10 h-10 text-stone-300 mx-auto" />
                  <p className="text-base font-bold text-stone-800">No packaged foods match your filters</p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Search online across the 2.5M+ packaged food registry or reset category filters.
                  </p>
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      onClick={handleSearchOnline}
                      className="px-4 py-2 bg-[#12382c] hover:bg-[#194a3a] text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Search Live Online Registry
                    </button>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setSelectedDietFilter('all');
                        setOnlineProducts([]);
                        setHasSearchedOnline(false);
                      }}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-700 rounded-lg transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.barcode}
                      product={product}
                      onSelect={(p) => {
                        setSelectedProduct(p);
                        addRecentScan(p);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 mt-12 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900">FoodzWise</span>
            <span>·</span>
            <span>FSSAI Standards Aligned Food Safety Intelligence</span>
            <span>·</span>
            <span>Informational wellness tool only</span>
          </div>
          <div className="flex items-center gap-4 font-medium text-stone-600">
            <button onClick={() => setIsFssaiModalOpen(true)} className="hover:text-stone-900 transition-colors cursor-pointer">
              FSSAI Guidelines &amp; Decoder
            </button>
            <button onClick={() => setIsProfileOpen(true)} className="hover:text-stone-900 transition-colors cursor-pointer">
              Health Profiles
            </button>
            <button onClick={() => setIsOcrOpen(true)} className="hover:text-stone-900 transition-colors cursor-pointer">
              Label OCR
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onBarcodeDetected={handleBarcodeDetected}
      />

      <OcrModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onProductCreated={handleProductFromOcr}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <ComparisonDrawer
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          addRecentScan(p);
        }}
      />

      <FssaiStandardsModal
        isOpen={isFssaiModalOpen}
        onClose={() => setIsFssaiModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ProfileProvider>
      <MainAppContent />
    </ProfileProvider>
  );
}
