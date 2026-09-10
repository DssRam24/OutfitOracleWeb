import React, { useState } from 'react';
import { WardrobeItem, Gender } from '../types';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  Shirt, 
  Waves,
  Check
} from 'lucide-react';

interface WardrobeManagerProps {
  items: WardrobeItem[];
  gender: Gender;
  onAddItem: (item: Omit<WardrobeItem, 'id' | 'userId'>) => void;
  onUpdateItem: (itemId: string, updates: Partial<WardrobeItem>) => void;
  onDeleteItem: (itemId: string) => void;
  onSeedWardrobe: () => void;
}

const COLOR_PRESETS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#111827' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Grey', hex: '#6B7280' },
  { name: 'Navy', hex: '#1E3A8A' },
  { name: 'Beige', hex: '#DDB892' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Yellow', hex: '#FCD34D' },
  { name: 'Green', hex: '#059669' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Teal', hex: '#0D9488' },
  { name: 'Red', hex: '#DC2626' }
];

const MALE_CATEGORIES = {
  Tops: ['graphic t-shirt', 'plain round-neck t-shirt', 'polo t-shirt', 'casual shirt (half sleeve)', 'casual shirt (full sleeve)', 'formal shirt', 'kurta (cotton)', 'hoodie', 'sweatshirt', 'sleeveless vest'],
  Bottoms: ['jeans (blue / black / grey)', 'chinos', 'cargo pants', 'cotton track pants', 'formal trousers', 'shorts (for hostel/casual only)', 'kurta pyjama'],
  Outerwear: ['hoodie', 'light jacket', 'denim jacket', 'windbreaker', 'college sweatshirt'],
  Footwear: ['white sneakers', 'casual sneakers', 'sports shoes', 'loafers', 'rubber chappals (hostel)', 'formal shoes'],
  Accessories: ['watch', 'cap', 'sunglasses', 'belt']
};

const FEMALE_CATEGORIES = {
  Traditional: ['salwar kameez', 'churidar set', 'kurti with dupatta'],
  Tops: ['kurti (short)', 'indo-western top', 'casual ethnic top', 'crop top', 'regular t-shirt', 'sweatshirt', 'hoodie'],
  Bottoms: ['jeans', 'leggings', 'palazzo', 'churidar', 'casual skirt', 'track pants', 'cotton shorts (hostel only)'],
  Outerwear: ['shrug', 'light jacket', 'denim jacket', 'dupatta as layer', 'college sweatshirt'],
  Footwear: ['sneakers', 'flats', 'sandals', 'block heels (for events)', 'kolhapuri chappals', 'rubber chappals (hostel)'],
  Accessories: ['earrings', 'watch', 'hair accessories', 'sunglasses', 'tote bag']
};

export const WardrobeManager: React.FC<WardrobeManagerProps> = ({
  items,
  gender,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onSeedWardrobe
}) => {
  // Navigation & Filtering
  const [laundryFilter, setLaundryFilter] = useState<'all' | 'ready' | 'laundry'>('all');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('All');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [colourFamily, setColourFamily] = useState('White');
  const [dominantColourHex, setDominantColourHex] = useState('#FFFFFF');
  const [formalityLevel, setFormalityLevel] = useState(2);
  const [season, setSeason] = useState<'all' | 'summer' | 'winter' | 'monsoon'>('all');
  const [inLaundry, setInLaundry] = useState(false);
  const [lastWorn, setLastWorn] = useState<number | null>(null);

  const categories = gender === 'female' ? FEMALE_CATEGORIES : MALE_CATEGORIES;
  const allCategoryOptions = Object.values(categories).flat();

  // Laundry and stock computations
  const totalCount = items.length;
  const inLaundryCount = items.filter(i => i.in_laundry).length;
  const readyCount = totalCount - inLaundryCount;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category) return;

    onAddItem({
      name: name.trim(),
      category,
      colour_family: colourFamily.toLowerCase(),
      dominant_colour_hex: dominantColourHex,
      formality_level: formalityLevel,
      season,
      in_laundry: inLaundry,
      last_worn_days_ago: lastWorn
    });

    // Reset Form
    setName('');
    setCategory('');
    setColourFamily('White');
    setDominantColourHex('#FFFFFF');
    setFormalityLevel(2);
    setSeason('all');
    setInLaundry(false);
    setLastWorn(null);
    setShowAddForm(false);
  };

  // Quick action: wash cycle complete (mark all laundry clean)
  const handleMarkAllClean = () => {
    items.filter(i => i.in_laundry).forEach(item => {
      onUpdateItem(item.id, { in_laundry: false });
    });
  };

  const getFormalityLabel = (level: number) => {
    switch (level) {
      case 1: return 'Hostel hangout / relaxed';
      case 2: return 'Daily campus lectures';
      case 3: return 'Smart casuals / events';
      case 4: return 'Placement / interview formal';
      default: return 'Casual';
    }
  };

  const categoryTabs = ['All', ...Object.keys(categories)];

  // Filter items by both laundry status and category
  const filteredItems = items.filter(item => {
    // Laundry filter check
    if (laundryFilter === 'ready' && item.in_laundry) return false;
    if (laundryFilter === 'laundry' && !item.in_laundry) return false;

    // Category filter check
    if (activeCategoryTab === 'All') return true;
    const tabCategories = categories[activeCategoryTab as keyof typeof categories] || [];
    return tabCategories.includes(item.category);
  });

  return (
    <div id="wardrobe-section" className="space-y-6">
      
      {/* Top Telemetry & Laundry Metric Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Closet Items */}
        <div className="bg-[#121826] border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-400 font-medium block">
              Total Clothes
            </span>
            <span className="text-2xl font-semibold text-white tracking-tight">
              {totalCount} <span className="text-xs text-slate-500 font-normal">items</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
            <Shirt className="w-5 h-5" />
          </div>
        </div>

        {/* Ready to Wear */}
        <div 
          onClick={() => setLaundryFilter(laundryFilter === 'ready' ? 'all' : 'ready')}
          className={`cursor-pointer transition-colors rounded-2xl p-4 flex items-center justify-between border shadow-sm ${
            laundryFilter === 'ready'
              ? 'bg-emerald-950/20 border-emerald-500/50'
              : 'bg-[#121826] border-slate-800 hover:border-emerald-500/30'
          }`}
        >
          <div>
            <span className="text-xs text-slate-400 font-medium block">
              Clean & Ready
            </span>
            <span className="text-2xl font-semibold text-emerald-400 tracking-tight">
              {readyCount} <span className="text-xs text-slate-500 font-normal">available</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* In Laundry Hamper */}
        <div 
          onClick={() => setLaundryFilter(laundryFilter === 'laundry' ? 'all' : 'laundry')}
          className={`cursor-pointer transition-colors rounded-2xl p-4 flex items-center justify-between border shadow-sm ${
            laundryFilter === 'laundry'
              ? 'bg-rose-950/20 border-rose-500/50'
              : 'bg-[#121826] border-slate-800 hover:border-rose-500/30'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium block">
                In Laundry
              </span>
              {inLaundryCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  Excluded
                </span>
              )}
            </div>
            <span className="text-2xl font-semibold text-rose-400 tracking-tight">
              {inLaundryCount} <span className="text-xs text-slate-500 font-normal">in wash</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <Waves className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white">
            Wardrobe & Laundry
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Items in laundry are temporarily excluded from outfit suggestions
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {inLaundryCount > 0 && (
            <button
              id="wash-cycle-complete-btn"
              onClick={handleMarkAllClean}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
              title="Mark all clothes in laundry as clean & ready"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Clean All Laundry ({inLaundryCount})
            </button>
          )}

          {items.length === 0 && (
            <button
              id="seed-wardrobe-btn"
              onClick={onSeedWardrobe}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Load Starter Closet
            </button>
          )}

          <button
            id="toggle-add-form-btn"
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (!category && allCategoryOptions.length > 0) {
                setCategory(allCategoryOptions[0]);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Garment
          </button>
        </div>
      </div>

      {/* Laundry Status Quick-Selector Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/60 rounded-xl border border-slate-800">
        <button
          id="filter-laundry-all"
          type="button"
          onClick={() => setLaundryFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            laundryFilter === 'all'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Clothes ({totalCount})
        </button>

        <button
          id="filter-laundry-ready"
          type="button"
          onClick={() => setLaundryFilter('ready')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            laundryFilter === 'ready'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Clean & Ready ({readyCount})
        </button>

        <button
          id="filter-laundry-hamper"
          type="button"
          onClick={() => setLaundryFilter('laundry')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            laundryFilter === 'laundry'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Waves className="w-3.5 h-3.5" />
          In Laundry ({inLaundryCount})
        </button>
      </div>

      {/* Add Item Modal / Collapsible Form */}
      {showAddForm && (
        <form
          id="add-item-form"
          onSubmit={handleAddSubmit}
          className="bg-[#121826] p-6 rounded-2xl border border-slate-800 shadow-md space-y-5 animate-fadeIn relative"
        >
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="pb-2 border-b border-slate-800">
            <h3 className="font-semibold text-white text-sm">
              Add New Garment
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Item Label / Name
              </label>
              <input
                id="item-name-input"
                type="text"
                placeholder="e.g. Printed Short Kurti, Dark Baggy Cargoes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2 px-3 bg-slate-900 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Category
              </label>
              <select
                id="item-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-2 px-3 bg-slate-900 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none cursor-pointer"
                required
              >
                {Object.entries(categories).map(([group, list]) => (
                  <optgroup key={group} label={group} className="font-semibold text-xs bg-slate-900 text-indigo-300">
                    {list.map(cat => (
                      <option key={cat} value={cat} className="font-sans text-xs text-slate-200 bg-slate-900">{cat}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Color Accent Picker */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Color Palette Tone
              </label>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    id={`color-preset-${preset.name.toLowerCase()}`}
                    type="button"
                    onClick={() => {
                      setColourFamily(preset.name);
                      setDominantColourHex(preset.hex);
                    }}
                    className={`w-7 h-7 rounded-lg border border-white/20 relative transition-transform duration-150 ${
                      colourFamily === preset.name ? 'ring-2 ring-indigo-500 scale-105' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                    title={preset.name}
                  >
                    {colourFamily === preset.name && (
                      <span className={`absolute inset-0 flex items-center justify-center font-bold text-xs ${
                        preset.name === 'White' ? 'text-black' : 'text-white'
                      }`}>
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="color-hex-picker"
                  type="color"
                  value={dominantColourHex}
                  onChange={(e) => setDominantColourHex(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border border-slate-700 p-0"
                />
                <span className="text-xs text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  {dominantColourHex.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Formality Level */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Formality Rating
                </label>
                <span className="text-[10px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                  Level {formalityLevel}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">{getFormalityLabel(formalityLevel)}</p>
              <input
                id="formality-range"
                type="range"
                min="1"
                max="4"
                value={formalityLevel}
                onChange={(e) => setFormalityLevel(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1 (Hangout)</span>
                <span>2 (Daily)</span>
                <span>3 (Smart)</span>
                <span>4 (Interview)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Season restriction */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Suitable Climate
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['all', 'summer', 'winter', 'monsoon'] as const).map(s => (
                  <button
                    key={s}
                    id={`season-btn-${s}`}
                    type="button"
                    onClick={() => setSeason(s)}
                    className={`py-1.5 text-xs font-medium capitalize rounded-lg border transition-colors ${
                      season === s 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' 
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Last worn days ago */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Last Worn Status
              </label>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  id="last-worn-never-btn"
                  type="button"
                  onClick={() => setLastWorn(null)}
                  className={`py-1 px-2.5 text-xs font-medium rounded-lg border transition-colors ${
                    lastWorn === null 
                      ? 'bg-indigo-600 text-white border-indigo-500' 
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  Never
                </button>
                {[1, 2, 3, 5, 7].map(d => (
                  <button
                    key={d}
                    id={`last-worn-day-btn-${d}`}
                    type="button"
                    onClick={() => setLastWorn(d)}
                    className={`py-1 px-2.5 text-xs font-medium rounded-lg border transition-colors ${
                      lastWorn === d 
                        ? 'bg-indigo-600 text-white border-indigo-500' 
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {/* PROMINENT LAUNDRY STATUS TOGGLE */}
            <div className="flex flex-col justify-center">
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Initial Laundry Status
              </label>
              <button
                type="button"
                id="form-laundry-toggle"
                onClick={() => setInLaundry(!inLaundry)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-colors ${
                  inLaundry
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  inLaundry ? 'bg-rose-500 text-white' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {inLaundry ? <Waves className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-xs font-semibold block">
                    {inLaundry ? 'In Laundry' : 'Clean & Ready'}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    {inLaundry ? 'Excluded from suggestions' : 'Available for immediate styling'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              id="cancel-add-btn"
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-add-btn"
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-medium shadow-sm transition-colors"
            >
              Save Garment
            </button>
          </div>
        </form>
      )}

      {/* Category sub-navigation tabs */}
      <div className="flex overflow-x-auto pb-2 gap-1.5 scrollbar-none border-b border-slate-800">
        {categoryTabs.map((tab) => {
          const isSelected = activeCategoryTab === tab;
          return (
            <button
              key={tab}
              id={`wardrobe-tab-${tab.toLowerCase()}`}
              onClick={() => setActiveCategoryTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Clothes Grid Section */}
      {filteredItems.length === 0 ? (
        <div id="wardrobe-empty" className="bg-[#121826] border border-slate-800 rounded-2xl p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">
              No Garments Found In This Category
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {laundryFilter === 'laundry' 
                ? 'Your laundry hamper is empty! All items are clean and ready to wear.'
                : laundryFilter === 'ready'
                ? 'No clean items available in this filter. Check your laundry hamper!'
                : 'Add clothing using the "Add Garment" button or load the starter closet.'}
            </p>
          </div>
          {items.length === 0 && (
            <button
              id="seed-empty-btn"
              onClick={onSeedWardrobe}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-2 shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Load Starter Wardrobe
            </button>
          )}
        </div>
      ) : (
        <div id="wardrobe-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {filteredItems.map((item) => {
            const daysAgo = item.last_worn_days_ago;
            const isFresh = daysAgo === null || daysAgo >= (gender === 'female' ? 3 : 2);
            const isInLaundry = !!item.in_laundry;

            return (
              <div
                key={item.id}
                id={`wardrobe-item-${item.id}`}
                className={`relative rounded-2xl p-3.5 flex flex-col justify-between transition-colors border shadow-sm ${
                  isInLaundry
                    ? 'bg-[#14121c] border-rose-900/40 opacity-90'
                    : 'bg-[#121826] border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Visual indicator overlay for in-laundry items */}
                {isInLaundry && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-rose-500/15 text-rose-300 border border-rose-500/20 text-[10px] font-medium px-2 py-0.5 rounded-full z-10 shadow-sm">
                    <Waves className="w-3 h-3" />
                    <span>In Laundry</span>
                  </div>
                )}

                {/* Card Top / Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 inline-block shadow-sm shrink-0"
                      style={{ backgroundColor: item.dominant_colour_hex }}
                    />
                    <span className="text-[11px] font-medium capitalize text-slate-400 truncate">
                      {item.colour_family}
                    </span>
                  </div>

                  {!isInLaundry && (
                    <button
                      id={`delete-item-${item.id}`}
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isInLaundry && (
                    <button
                      id={`delete-item-${item.id}`}
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1 rounded-md text-slate-600 hover:text-rose-400 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Item Details */}
                <div className="space-y-1 flex-1">
                  <h4 className={`font-medium text-xs tracking-tight leading-snug line-clamp-2 ${
                    isInLaundry ? 'text-slate-400 line-through' : 'text-slate-100'
                  }`}>
                    {item.name}
                  </h4>
                  <span className="text-[11px] text-slate-400 capitalize block truncate">
                    {item.category}
                  </span>
                </div>

                {/* Specs / Meta Badges */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Formality</span>
                    <span className="text-slate-300 bg-slate-800 px-1.5 py-0.2 rounded text-[10px]">
                      Level {item.formality_level}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Last Worn</span>
                    <span className={`font-medium ${isFresh ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {daysAgo === null ? 'Never' : `${daysAgo}d ago`}
                    </span>
                  </div>

                  {/* PROMINENT INSTANT LAUNDRY TOGGLE BUTTON */}
                  <div className="pt-2">
                    <button
                      id={`laundry-toggle-${item.id}`}
                      type="button"
                      onClick={() => onUpdateItem(item.id, { in_laundry: !isInLaundry })}
                      className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-medium transition-colors border ${
                        isInLaundry
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/60'
                      }`}
                      title={isInLaundry ? "Mark item as clean and ready" : "Send item to laundry hamper"}
                    >
                      {isInLaundry ? (
                        <>
                          <RefreshCw className="w-3 h-3 shrink-0" />
                          <span>Mark Clean</span>
                        </>
                      ) : (
                        <>
                          <Waves className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Send to Laundry</span>
                        </>
                      )}
                    </button>
                    {isInLaundry && (
                      <span className="text-[10px] text-rose-400/80 text-center block mt-1">
                        Excluded from suggestions
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
