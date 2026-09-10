import React, { useState, useEffect } from 'react';
import { UserProfile, WardrobeItem, SuggestionResponse, WeatherContext } from './types';
import { ProfileSettings } from './components/ProfileSettings';
import { WardrobeManager } from './components/WardrobeManager';
import { SuggestionPanel } from './components/SuggestionPanel';
import { getSeedWardrobe } from './seedData';

import { 
  Shirt, 
  Sparkles,
  RotateCcw
} from 'lucide-react';

const PROFILE_STORAGE_KEY = 'outfitoracle_user_profile';
const WARDROBE_STORAGE_KEY = 'outfitoracle_wardrobe_items';

const DEFAULT_PROFILE: UserProfile = {
  uid: 'local_user',
  displayName: 'College Stylist',
  gender: 'male',
  stylePreference: 'mixed',
  collegeType: 'engineering',
  skinTone: 'wheatish',
  hostelStudent: false
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading profile from localStorage:', e);
    }
    return DEFAULT_PROFILE;
  });

  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(() => {
    try {
      const saved = localStorage.getItem(WARDROBE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading wardrobe from localStorage:', e);
    }
    return getSeedWardrobe('male', 'local_user');
  });

  // Save profile changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  }, [profile]);

  // Save wardrobe changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WARDROBE_STORAGE_KEY, JSON.stringify(wardrobe));
    } catch (e) {
      console.error('Failed to save wardrobe:', e);
    }
  }, [wardrobe]);

  // Profile update method
  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      // If gender changed and wardrobe was starter, check if we should update seed items
      return next;
    });
  };

  // Wardrobe CRUD operations
  const handleAddWardrobeItem = (newItem: Omit<WardrobeItem, 'id' | 'userId'>) => {
    const item: WardrobeItem = {
      ...newItem,
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      userId: profile.uid
    };
    setWardrobe(prev => [item, ...prev]);
  };

  const handleUpdateWardrobeItem = (itemId: string, updates: Partial<WardrobeItem>) => {
    setWardrobe(prev => prev.map(item => item.id === itemId ? { ...item, ...updates } : item));
  };

  const handleDeleteWardrobeItem = (itemId: string) => {
    setWardrobe(prev => prev.filter(item => item.id !== itemId));
  };

  // Auto-seed template closet items
  const handleSeedWardrobe = () => {
    const defaultItems = getSeedWardrobe(profile.gender, profile.uid);
    setWardrobe(defaultItems);
  };

  // API Call to suggest outfit matching user profile + weather constraints
  const handleGenerateSuggestions = async (context: {
    occasion: string;
    weather: WeatherContext;
    time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
  }): Promise<SuggestionResponse> => {
    const res = await fetch('/api/suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: {
          gender: profile.gender,
          style_preference: profile.stylePreference,
          college_type: profile.collegeType,
          skin_tone: profile.skinTone,
          hostel_student: profile.hostelStudent
        },
        context,
        wardrobe
      })
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.no_suggestion_reason || `Server returned status ${res.status}`);
    }

    return await res.json();
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Clean Modern Header Bar */}
      <header id="main-header" className="bg-[#0e131f]/90 backdrop-blur border-b border-slate-800/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">
                  OutfitOracle
                </span>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Campus Stylist
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Indian college wardrobe manager & outfit suggestions
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-3">
            <button
              id="reset-wardrobe-header-btn"
              type="button"
              onClick={handleSeedWardrobe}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-colors"
              title="Reload starter wardrobe items"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Starter Closet</span>
            </button>

            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-slate-200 block">
                {profile.gender === 'female' ? "Women's Wardrobe" : "Men's Wardrobe"}
              </span>
              <span className="text-[11px] text-slate-400 block">
                {wardrobe.filter(i => !i.in_laundry).length} Clean • {wardrobe.filter(i => i.in_laundry).length} in Laundry
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Workspace Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Side: Profile & Suggestion Generator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Identity Parameters */}
          <ProfileSettings profile={profile} onChange={handleUpdateProfile} />

          {/* Suggestion Engine & Weather Telemetry */}
          <SuggestionPanel 
            wardrobe={wardrobe} 
            onGenerateSuggestions={handleGenerateSuggestions}
            onUpdateItem={handleUpdateWardrobeItem}
          />
        </div>

        {/* Right Side: Active Wardrobe Shelf & Laundry Hamper */}
        <div className="lg:col-span-7 bg-[#121826] rounded-2xl p-5 sm:p-7 border border-slate-800 shadow-sm min-h-[600px]">
          <WardrobeManager
            items={wardrobe}
            gender={profile.gender}
            onAddItem={handleAddWardrobeItem}
            onUpdateItem={handleUpdateWardrobeItem}
            onDeleteItem={handleDeleteWardrobeItem}
            onSeedWardrobe={handleSeedWardrobe}
          />
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0e131f]/60 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-1">
          <p className="text-xs text-slate-400">
            OutfitOracle • Tailored for Indian college weather, monsoon rains, and hostel laundry routines.
          </p>
          <p className="text-[11px] text-slate-500">
            Balanced silhouettes, climate suitability, and color coordination.
          </p>
        </div>
      </footer>
    </div>
  );
}

