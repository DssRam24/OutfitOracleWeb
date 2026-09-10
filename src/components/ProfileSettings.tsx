import React from 'react';
import { UserProfile, Gender, StylePreference, CollegeType, SkinTone } from '../types';
import { User, Home } from 'lucide-react';

interface ProfileSettingsProps {
  profile: UserProfile;
  onChange: (updatedProfile: Partial<UserProfile>) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onChange }) => {
  const handleFieldChange = (field: keyof UserProfile, value: any) => {
    onChange({ [field]: value });
  };

  return (
    <div 
      id="profile-settings-card" 
      className="bg-[#121826] rounded-2xl p-5 sm:p-6 space-y-5 border border-slate-800 shadow-sm transition-all"
    >
      {/* Clean Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Style Profile
            </h2>
            <p className="text-xs text-slate-400">
              Personalized proportions & complexion fit
            </p>
          </div>
        </div>

        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Saved
        </span>
      </div>

      <div className="space-y-4">
        {/* Gender Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Gender
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['male', 'female', 'other'] as Gender[]).map((g) => {
              const isSelected = profile.gender === g;
              return (
                <button
                  key={g}
                  id={`gender-btn-${g}`}
                  type="button"
                  onClick={() => handleFieldChange('gender', g)}
                  className={`py-2 px-3 text-xs font-medium capitalize rounded-xl transition-colors border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Style Preference */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Style Preference
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['traditional', 'western', 'fusion', 'mixed'] as StylePreference[]).map((pref) => {
              const isSelected = profile.stylePreference === pref;
              return (
                <button
                  key={pref}
                  id={`pref-btn-${pref}`}
                  type="button"
                  onClick={() => handleFieldChange('stylePreference', pref)}
                  className={`py-2 px-3 text-xs font-medium capitalize rounded-xl transition-colors border text-center ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {pref}
                </button>
              );
            })}
          </div>
        </div>

        {/* College Stream */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            College Stream
          </label>
          <div className="relative">
            <select
              id="college-type-select"
              value={profile.collegeType}
              onChange={(e) => handleFieldChange('collegeType', e.target.value as CollegeType)}
              className="w-full py-2 px-3 bg-slate-900 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="engineering">Engineering (Labs, Tech & Smart Casuals)</option>
              <option value="arts">Arts & Humanities (Creative, Chic & Kurtis)</option>
              <option value="medical">Medical / Pharmacy (Crisp & Structured)</option>
              <option value="management">Management / MBA (Semi-Formals & Collars)</option>
              <option value="general">General Campus Vibe</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▾
            </div>
          </div>
        </div>

        {/* Skin Tone Helper */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Complexion (Color Harmony)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['fair', 'wheatish', 'medium', 'deep'] as SkinTone[]).map((tone) => {
              const bgColors: Record<SkinTone, string> = {
                fair: 'bg-[#FFDFC4]',
                wheatish: 'bg-[#F0C9A2]',
                medium: 'bg-[#D1A376]',
                deep: 'bg-[#825E3E]'
              };
              const isSelected = profile.skinTone === tone;

              return (
                <button
                  key={tone}
                  id={`tone-btn-${tone}`}
                  type="button"
                  title={`${tone} complexion`}
                  onClick={() => handleFieldChange('skinTone', tone)}
                  className={`flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl transition-colors border ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500 text-indigo-200'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <span className={`w-4.5 h-4.5 rounded-full ${bgColors[tone]} border border-white/40 shadow-sm`} />
                  <span className={`text-[11px] capitalize font-medium ${isSelected ? 'text-indigo-300 font-semibold' : 'text-slate-400'}`}>
                    {tone}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hostel Resident Status */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center">
              <Home className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                Hostel Student
                {profile.hostelStudent && (
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                    2-Day Repeat Allowed
                  </span>
                )}
              </p>
              <p className="text-[11px] text-slate-400">
                {profile.hostelStudent ? 'Short laundry cycle permitted' : 'Standard 3-day recency interval'}
              </p>
            </div>
          </div>

          <button
            id="hostel-student-toggle"
            type="button"
            onClick={() => handleFieldChange('hostelStudent', !profile.hostelStudent)}
            className={`w-11 h-6 rounded-full transition-colors p-0.5 border relative ${
              profile.hostelStudent 
                ? 'bg-indigo-600 border-indigo-500' 
                : 'bg-slate-800 border-slate-700'
            }`}
          >
            <span
              className={`block w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 transform ${
                profile.hostelStudent ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
