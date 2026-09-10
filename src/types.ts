export type Gender = 'male' | 'female' | 'other';
export type StylePreference = 'traditional' | 'western' | 'fusion' | 'mixed';
export type CollegeType = 'engineering' | 'arts' | 'medical' | 'management' | 'general';
export type SkinTone = 'fair' | 'wheatish' | 'medium' | 'deep';

export interface UserProfile {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  gender: Gender;
  stylePreference: StylePreference;
  collegeType: CollegeType;
  skinTone?: SkinTone;
  hostelStudent: boolean;
}

export interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  colour_family: string;
  dominant_colour_hex: string;
  formality_level: number; // 1-4
  season: 'all' | 'summer' | 'winter' | 'monsoon';
  in_laundry: boolean;
  last_worn_days_ago: number | null;
  userId?: string;
}

export interface WeatherContext {
  temp_celsius: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'cold' | 'humid';
}

export interface OutfitSuggestion {
  rank: number;
  items: string[]; // item IDs
  outfit_label: string;
  colour_note: string;
  occasion_note: string;
  style_tip: string;
  confidence_score: number;
  // Enhanced Charisma & Dressing Style metrics
  charisma_score: number; // 1-10 rating
  charisma_hack: string; // Specific charisma multiplier (e.g. posture alignment, proportional tuck, cuffing rule)
  weather_adaptation: string; // How this outfit specifically responds to current temp & weather
  silhouette_balance: string; // Proportion description, e.g. "Structured Top + Relaxed Tapered Bottom"
  grooming_pairing?: string; // Subtle fragrance / grooming complement
}

export interface SuggestionResponse {
  suggestions: OutfitSuggestion[];
  no_suggestion_reason: string | null;
  excluded_laundry_count?: number;
  available_items_count?: number;
}

