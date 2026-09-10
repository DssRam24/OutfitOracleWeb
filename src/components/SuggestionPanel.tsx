import React, { useState, useEffect } from 'react';
import { WardrobeItem, WeatherContext, OutfitSuggestion, SuggestionResponse } from '../types';
import { 
  Sparkles, 
  Sun, 
  Cloud, 
  CloudRain, 
  Thermometer, 
  Moon, 
  Sunrise, 
  Sunset, 
  Lightbulb, 
  AlertTriangle, 
  CloudSun, 
  Waves,
  CheckCircle2,
  Check,
  Zap,
  Flame,
  Shirt
} from 'lucide-react';

interface SuggestionPanelProps {
  wardrobe: WardrobeItem[];
  onGenerateSuggestions: (context: {
    occasion: string;
    weather: WeatherContext;
    time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
  }) => Promise<SuggestionResponse>;
  onUpdateItem?: (itemId: string, updates: Partial<WardrobeItem>) => void;
}

const OCCASIONS = {
  "Daily Campus": [
    "Regular class day",
    "Hostel hangout / room day",
    "Canteen / free period",
    "Library / study session"
  ],
  "College Social": [
    "College fest (technical)",
    "College fest (cultural)",
    "College sports day",
    "Fresher's party",
    "Farewell / send-off event",
    "College trip / industrial visit",
    "Overnight trip",
    "Birthday celebration",
    "Canteen birthday (casual)"
  ],
  "Academic High-Stakes": [
    "Placement drive",
    "Internship interview",
    "Seminar / paper presentation",
    "Group project meeting",
    "Symposium volunteering"
  ],
  "Festive on Campus": [
    "Diwali celebration",
    "Holi on campus",
    "College cultural day (traditional day)",
    "Eid on campus",
    "Independence Day / Republic Day",
    "Teacher's Day"
  ]
};

const LOADER_PHASES = [
  "Analyzing wardrobe items and active laundry status...",
  "Calculating thermal and humidity comfort index...",
  "Evaluating color harmony and Indian campus context...",
  "Optimizing silhouette balance and charisma score...",
  "Synthesizing high-confidence outfit recommendations..."
];

export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ 
  wardrobe, 
  onGenerateSuggestions,
  onUpdateItem
}) => {
  const [occasion, setOccasion] = useState("Regular class day");
  const [temp, setTemp] = useState(28);
  const [condition, setCondition] = useState<'sunny' | 'cloudy' | 'rainy' | 'cold' | 'humid'>('sunny');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

  const [isLoading, setIsLoading] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState(LOADER_PHASES[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [results, setResults] = useState<SuggestionResponse | null>(null);
  const [loggedWornOutfitRank, setLoggedWornOutfitRank] = useState<number | null>(null);

  // Laundry tracking
  const inLaundryCount = wardrobe.filter(i => i.in_laundry).length;
  const readyCount = wardrobe.length - inLaundryCount;

  // Cycle loader phases while loading
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      let phaseIdx = 0;
      interval = setInterval(() => {
        phaseIdx = (phaseIdx + 1) % LOADER_PHASES.length;
        setLoaderMessage(LOADER_PHASES[phaseIdx]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Weather Advice generator
  const getWeatherAdvice = () => {
    if (condition === 'rainy') {
      return {
        title: "Monsoon Downpour Protocol",
        text: "Long hems and white footwear are excluded to prevent puddle splatters. Prioritizing cropped lengths and dark bottoms.",
        badge: "Rain Shield"
      };
    }
    if (temp > 32 || condition === 'humid') {
      return {
        title: "High Heat & Humidity Protocol",
        text: "Heavy sweaters, fleeces, and dense fabrics are excluded. Prioritizing breathable cottons, linen blends, and airy cuts.",
        badge: "Heat Active"
      };
    }
    if (temp < 18 || condition === 'cold') {
      return {
        title: "Winter Chill Protocol",
        text: "Layering recommended. Jackets, cardigans, hoodies, and dense denims are prioritized.",
        badge: "Cold Guard"
      };
    }
    if (condition === 'cloudy') {
      return {
        title: "Overcast Lighting Protocol",
        text: "Flat ambient light detected. High-contrast or saturated hues recommended to stand out against muted skies.",
        badge: "Contrast Boost"
      };
    }
    return {
      title: "Optimal Campus Weather",
      text: "Mild weather allows full closet versatility across western, fusion, and traditional styles.",
      badge: "Balanced"
    };
  };

  const advice = getWeatherAdvice();

  const getConditionIcon = (cond: typeof condition) => {
    switch (cond) {
      case 'sunny': return <Sun className="w-5 h-5" />;
      case 'cloudy': return <Cloud className="w-5 h-5" />;
      case 'rainy': return <CloudRain className="w-5 h-5" />;
      case 'cold': return <Thermometer className="w-5 h-5" />;
      case 'humid': return <CloudSun className="w-5 h-5" />;
    }
  };

  const getTimeIcon = (time: typeof timeOfDay) => {
    switch (time) {
      case 'morning': return <Sunrise className="w-3.5 h-3.5" />;
      case 'afternoon': return <Sun className="w-3.5 h-3.5" />;
      case 'evening': return <Sunset className="w-3.5 h-3.5" />;
      case 'night': return <Moon className="w-3.5 h-3.5" />;
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setResults(null);
    setLoggedWornOutfitRank(null);

    try {
      const response = await onGenerateSuggestions({
        occasion,
        weather: {
          temp_celsius: temp,
          condition
        },
        time_of_day: timeOfDay
      });

      setResults(response);
      if (response.no_suggestion_reason) {
        setErrorMsg(response.no_suggestion_reason);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to contact styling engine");
    } finally {
      setIsLoading(false);
    }
  };

  // Mark outfit as worn today and optionally send to laundry
  const handleLogWear = (suggestion: OutfitSuggestion, sendToLaundry: boolean) => {
    if (!onUpdateItem) return;
    suggestion.items.forEach(itemId => {
      onUpdateItem(itemId, {
        last_worn_days_ago: 0,
        in_laundry: sendToLaundry
      });
    });
    setLoggedWornOutfitRank(suggestion.rank);
  };

  return (
    <div id="suggestion-panel" className="space-y-6">
      
      {/* Stylist Console Box */}
      <div className="bg-[#121826] rounded-2xl p-5 sm:p-6 space-y-5 border border-slate-800 shadow-sm">
        
        {/* Console Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Outfit Suggester
              </h2>
              <p className="text-xs text-slate-400">
                Weather adaptive with charisma & style boost
              </p>
            </div>
          </div>

          {/* Real-time Laundry Exclusion Notice */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
            <Waves className="w-3.5 h-3.5 text-slate-400" />
            <span>{inLaundryCount} in Laundry</span>
          </div>
        </div>

        {/* Occasion Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Campus Occasion
          </label>
          <div className="relative">
            <select
              id="occasion-selector"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full py-2 px-3 bg-slate-900 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none cursor-pointer"
            >
              {Object.entries(OCCASIONS).map(([group, list]) => (
                <optgroup key={group} label={group} className="font-semibold text-xs bg-slate-900 text-indigo-300">
                  {list.map(occ => (
                    <option key={occ} value={occ} className="font-sans text-xs text-slate-200 bg-slate-900">{occ}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▾
            </div>
          </div>
        </div>

        {/* Time of Day Pills */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Time of Day
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['morning', 'afternoon', 'evening', 'night'] as const).map(time => {
              const isSelected = timeOfDay === time;
              return (
                <button
                  key={time}
                  id={`time-btn-${time}`}
                  type="button"
                  onClick={() => setTimeOfDay(time)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-medium capitalize transition-colors border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {getTimeIcon(time)}
                  <span className="text-[11px] mt-0.5">{time}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Weather Controls */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-xs font-medium text-slate-300">
              Campus Weather Conditions
            </span>
            <span className="text-xs text-slate-300 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 font-medium">
              {temp}°C • <span className="capitalize">{condition}</span>
            </span>
          </div>

          {/* Temperature slider */}
          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-400">
                Temperature
              </span>
              <span className="text-sm font-semibold text-slate-200">
                {temp}°C
              </span>
            </div>
            <input
              id="temp-range"
              type="range"
              min="10"
              max="45"
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>10°C (Winter)</span>
              <span>28°C (Pleasant)</span>
              <span>45°C (Summer Peak)</span>
            </div>
          </div>

          {/* Condition Buttons */}
          <div>
            <div className="grid grid-cols-5 gap-1.5">
              {(['sunny', 'cloudy', 'rainy', 'cold', 'humid'] as const).map(cond => {
                const isSelected = condition === cond;
                return (
                  <button
                    key={cond}
                    id={`condition-btn-${cond}`}
                    type="button"
                    onClick={() => setCondition(cond)}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs font-medium capitalize transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {getConditionIcon(cond)}
                    <span className="text-[11px] truncate w-full text-center mt-0.5">
                      {cond}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weather Guidance Card */}
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                {advice.title}
              </span>
              <span className="text-[10px] font-medium text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {advice.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {advice.text}
            </p>
          </div>
        </div>

        {/* Suggestion Generation Trigger Button */}
        <button
          id="trigger-suggestions-btn"
          type="button"
          onClick={handleGenerate}
          disabled={isLoading || readyCount === 0}
          className={`w-full py-2.5 px-4 text-xs font-medium rounded-xl transition-colors ${
            readyCount === 0
              ? 'bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm cursor-pointer'
          }`}
        >
          {readyCount === 0 
            ? 'All items in laundry — mark items clean first' 
            : `Suggest Outfits (${readyCount} items available)`}
        </button>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div id="loader-overlay" className="bg-[#121826] rounded-2xl p-6 flex flex-col items-center text-center space-y-3 border border-slate-800 shadow-sm">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <h4 className="font-semibold text-white text-xs">
            Synthesizing Outfit Recommendations
          </h4>
          <p className="text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 max-w-sm">
            {loaderMessage}
          </p>
        </div>
      )}

      {/* Error / Empty Reason Banner */}
      {errorMsg && (
        <div id="suggestion-error-banner" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-xs text-rose-200">
                Recommendation Notice
              </h4>
              <p className="text-xs text-rose-300/90 leading-relaxed mt-1">
                {errorMsg}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Results Container */}
      {results && results.suggestions && results.suggestions.length > 0 && (
        <div id="suggestions-results-container" className="space-y-4 animate-fadeIn">
          
          {/* Header of results */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Recommended Outfits
              </h3>
              <p className="text-xs text-slate-400">
                Ranked for charisma, climate comfort, and silhouette balance
              </p>
            </div>
            {results.excluded_laundry_count !== undefined && results.excluded_laundry_count > 0 && (
              <span className="text-[11px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700/60">
                {results.excluded_laundry_count} in Laundry Excluded
              </span>
            )}
          </div>

          {/* Suggestion Cards */}
          <div className="space-y-4">
            {results.suggestions.map((sug, idx) => {
              const outfitItems = sug.items
                .map(id => wardrobe.find(w => w.id === id))
                .filter(Boolean) as WardrobeItem[];

              const isLogged = loggedWornOutfitRank === sug.rank;

              return (
                <div
                  key={idx}
                  id={`suggestion-card-rank-${sug.rank}`}
                  className="bg-[#121826] rounded-2xl p-5 space-y-4 border border-slate-800 hover:border-slate-700 transition-colors shadow-sm"
                >
                  {/* Card Header with Rank and Charisma Score */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                        idx === 0 
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                          : 'bg-slate-800 text-slate-300 border-slate-700/60'
                      }`}>
                        Outfit #{sug.rank}
                      </span>
                      <h4 className="font-semibold text-white text-xs sm:text-sm">
                        {sug.outfit_label}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Charisma Score Badge */}
                      {sug.charisma_score !== undefined && (
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                          <Flame className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[11px] font-semibold">
                            {sug.charisma_score.toFixed(1)}/10 Charisma
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60 font-medium">
                          {Math.round(sug.confidence_score * 100)}% Match
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Garment Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {outfitItems.map(item => (
                      <div
                        key={item.id}
                        id={`outfit-item-${item.id}`}
                        className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between gap-1.5 mb-1.5">
                          <span className="text-[10px] text-slate-400 truncate capitalize">
                            {item.colour_family}
                          </span>
                          <span
                            className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: item.dominant_colour_hex }}
                          />
                        </div>
                        <h5 className="font-medium text-slate-200 text-xs truncate">{item.name}</h5>
                        <span className="text-[10px] text-slate-400 capitalize truncate">
                          {item.category}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Enhanced Style & Charisma Insights */}
                  <div className="space-y-2.5 text-xs border-t border-slate-800 pt-3">
                    {/* Charisma Dressing Hack Banner */}
                    {sug.charisma_hack && (
                      <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-1">
                        <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-semibold">
                          <Zap className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Charisma & Styling Hack</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {sug.charisma_hack}
                        </p>
                      </div>
                    )}

                    {/* Silhouette & Weather Adaptation Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sug.silhouette_balance && (
                        <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-0.5">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wide">
                            Silhouette & Proportions
                          </span>
                          <p className="text-xs text-slate-300 leading-snug">
                            {sug.silhouette_balance}
                          </p>
                        </div>
                      )}

                      {sug.weather_adaptation && (
                        <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-0.5">
                          <span className="text-[10px] uppercase font-semibold text-emerald-400 block tracking-wide">
                            Weather Adaptation
                          </span>
                          <p className="text-xs text-slate-300 leading-snug">
                            {sug.weather_adaptation}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Color Harmony & Occasion Note */}
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <p className="leading-relaxed">
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wide">Color Harmony</span>
                        {sug.colour_note}
                      </p>
                      <p className="leading-relaxed">
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wide">Occasion Suitability</span>
                        {sug.occasion_note}
                      </p>
                    </div>

                    {/* Grooming or Scent Pairing */}
                    {sug.grooming_pairing && (
                      <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-semibold block tracking-wide">
                            Grooming & Scent Pairing
                          </span>
                          <p className="text-xs text-slate-300 leading-snug">
                            {sug.grooming_pairing}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Wear / Laundry interactive actions */}
                  {onUpdateItem && (
                    <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      {isLogged ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Outfit logged as worn today!</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            id={`wear-fit-${sug.rank}`}
                            onClick={() => handleLogWear(sug, false)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 rounded-xl flex-1 sm:flex-initial py-2 px-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                            title="Mark clothes worn today without moving to laundry"
                          >
                            <Check className="w-3.5 h-3.5 text-slate-300" />
                            <span>Wore Today (Keep Clean)</span>
                          </button>

                          <button
                            type="button"
                            id={`wear-and-laundry-${sug.rank}`}
                            onClick={() => handleLogWear(sug, true)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl flex-1 sm:flex-initial py-2 px-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                            title="Mark clothes worn today and drop them into the laundry hamper"
                          >
                            <Waves className="w-3.5 h-3.5 text-rose-400" />
                            <span>Wore & Send to Laundry</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

