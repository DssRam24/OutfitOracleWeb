import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Map occasions to required formality level (1-4)
const OCCASIONS_FORMALITY: Record<string, number> = {
  // Daily campus
  "Regular class day": 2,
  "Hostel hangout / room day": 1,
  "Canteen / free period": 2,
  "Library / study session": 2,
  // College social
  "College fest (technical)": 2, // techfest, hackathon
  "College fest (cultural)": 3, // Spandan, Riviera
  "College sports day": 2, // annual sports
  "Fresher's party": 3,
  "Farewell / send-off event": 4,
  "College trip / industrial visit": 3,
  "Overnight trip": 2,
  "Birthday celebration": 3,
  "Canteen birthday (casual)": 2,
  // Academic high-stakes
  "Placement drive": 4,
  "Internship interview": 4,
  "Seminar / paper presentation": 3,
  "Group project meeting": 2,
  "Symposium volunteering": 3,
  // Festive on campus
  "Diwali celebration": 4,
  "Holi on campus": 1,
  "College cultural day (traditional day)": 4,
  "Eid on campus": 4,
  "Independence Day / Republic Day": 3,
  "Teacher's Day": 3
};

// Fallback rule-based styling & charisma engine
function generateLocalCharismaSuggestions(
  finalSelection: any[],
  user: any,
  context: any,
  occasion: string,
  reqFormality: number,
  temp: number,
  condition: string
) {
  const isFemale = user.gender === 'female';
  const tops = finalSelection.filter(i => {
    const cat = i.category?.toLowerCase() || '';
    return ['plain round-neck t-shirt', 'graphic t-shirt', 'polo t-shirt', 'casual shirt (half sleeve)', 'casual shirt (full sleeve)', 'formal shirt', 'kurta (cotton)', 'kurti (short)', 'indo-western top', 'casual ethnic top', 'crop top', 'regular t-shirt'].includes(cat);
  });
  const bottoms = finalSelection.filter(i => {
    const cat = i.category?.toLowerCase() || '';
    return ['jeans (blue / black / grey)', 'chinos', 'cargo pants', 'cotton track pants', 'formal trousers', 'jeans', 'leggings', 'palazzo', 'churidar', 'casual skirt'].includes(cat);
  });
  const footwears = finalSelection.filter(i => {
    const cat = i.category?.toLowerCase() || '';
    return ['white sneakers', 'casual sneakers', 'sports shoes', 'loafers', 'formal shoes', 'sneakers', 'flats', 'sandals', 'kolhapuri chappals'].includes(cat);
  });
  const onePieces = finalSelection.filter(i => {
    const cat = i.category?.toLowerCase() || '';
    return ['salwar kameez', 'churidar set', 'kurti with dupatta', 'kurta pyjama'].includes(cat);
  });
  const outerwears = finalSelection.filter(i => {
    const cat = i.category?.toLowerCase() || '';
    return ['hoodie', 'light jacket', 'denim jacket', 'windbreaker', 'college sweatshirt', 'shrug'].includes(cat);
  });

  const suggestions: any[] = [];

  // Weather-specific charisma commentary helpers
  const getWeatherCharismaNote = (topColor: string, bottomColor: string) => {
    if (condition === 'rainy') {
      return `Monsoon-ready composure: Paired mud-resistant tones with clean ankle clearance to keep you immaculate regardless of campus puddles.`;
    }
    if (temp > 32 || condition === 'humid') {
      return `Heat-defying presence: Breathable fabric drape maximizes airflow, preventing sweat clings and maintaining effortless poise under the sun.`;
    }
    if (temp < 20 || condition === 'cold') {
      return `Thermal sophistication: Weighted textures provide structured warmth without bulkiness, projecting an intentional, composed aura.`;
    }
    return `Balanced micro-climate comfort: Fabric weight allows fluid movement across campus halls and climate-controlled lecture rooms.`;
  };

  const getCharismaHack = (formality: number, topCat: string) => {
    if (topCat.includes('shirt') || topCat.includes('kurta')) {
      return `Roll sleeves two folds to just below the elbow to expose the forearm. Pair with an analog timepiece to create an understated anchor of authority.`;
    }
    if (topCat.includes('polo')) {
      return `Keep collar flat and unbutton only the top button. A subtle French tuck at the belt line visually elongates the legs and frames your silhouette.`;
    }
    if (topCat.includes('kurti')) {
      return `Pair with silver oxidized jhumkas or minimal hoops. Maintain clean shoulder posture to let the drape create a fluid, statuesque line.`;
    }
    return `Maintain the 1/3 top to 2/3 bottom visual rule. Pair with clean, scuff-free footwear to subtly telegraph attention to detail and self-discipline.`;
  };

  // 1. One piece set if available
  if (onePieces.length > 0 && (user.style_preference === 'traditional' || isFemale || occasion.includes('cultural') || occasion.includes('Diwali'))) {
    const set = onePieces[0];
    const shoes = footwears[0] || finalSelection.find(i => i.id !== set.id);
    const outfitItems = [set.id];
    if (shoes) outfitItems.push(shoes.id);

    suggestions.push({
      rank: 1,
      items: outfitItems,
      outfit_label: "Elevated Heritage Statement",
      colour_note: `Rich monochromatic depth in ${set.colour_family} creates an arresting presence that naturally commands attention.`,
      occasion_note: `Tailored for ${occasion} with cultural sophistication and graceful movement.`,
      style_tip: `Keep hair polished and let the neckline speak. A subtle sandalwood or jasmine fragrance adds an unforgettable olfactory aura.`,
      confidence_score: 0.96,
      charisma_score: 9.6,
      charisma_hack: `Stand tall with relaxed shoulders. Traditional drapes naturally elongate your posture when paired with steady, confident strides.`,
      weather_adaptation: getWeatherCharismaNote(set.colour_family, set.colour_family),
      silhouette_balance: "Flowing Full-Length Architectural Drape",
      grooming_pairing: "Subtle warm musk or floral amber fragrance with refined minimalist accessories."
    });
  }

  // 2. High-contrast Top + Bottom
  if (tops.length > 0 && bottoms.length > 0) {
    const top = tops[0];
    const bottom = bottoms[0];
    const shoes = footwears[0];
    const layer = (temp < 22 && outerwears.length > 0) ? outerwears[0] : null;

    const items = [top.id, bottom.id];
    if (shoes) items.push(shoes.id);
    if (layer) items.push(layer.id);

    suggestions.push({
      rank: suggestions.length + 1,
      items,
      outfit_label: reqFormality >= 3 ? "Commanding Semi-Formal" : "Effortless Sharp Casual",
      colour_note: `High-contrast pairing of ${top.colour_family} with ${bottom.colour_family} creates crisp visual boundaries that project decisiveness.`,
      occasion_note: `Calibrated for ${occasion} with balanced formality (${reqFormality}/4) and campus versatility.`,
      style_tip: `Ensure the hem sits cleanly over your footwear without excessive bunching.`,
      confidence_score: 0.94,
      charisma_score: 9.3,
      charisma_hack: getCharismaHack(top.formality_level, top.category),
      weather_adaptation: getWeatherCharismaNote(top.colour_family, bottom.colour_family),
      silhouette_balance: "Structured Top Proportion + Clean Tapered Bottom",
      grooming_pairing: "Fresh citrus/aquatic scent with trimmed, matte-styled hair."
    });
  }

  // 3. Alternate Combo
  if (tops.length > 1 && bottoms.length > 0) {
    const top = tops[1];
    const bottom = bottoms[bottoms.length > 1 ? 1 : 0];
    const shoes = footwears[footwears.length > 1 ? 1 : 0];

    const items = [top.id, bottom.id];
    if (shoes && !items.includes(shoes.id)) items.push(shoes.id);

    suggestions.push({
      rank: suggestions.length + 1,
      items,
      outfit_label: "Modern Minimalist Charisma",
      colour_note: `Understated tones in ${top.colour_family} paired with ${bottom.colour_family} exude relaxed, low-ego confidence.`,
      occasion_note: `Seamlessly moves between library deep-work, casual lawn hangouts, and lecture halls.`,
      style_tip: `Pair with a single understated accessory—less is always more when the fit is dialed in.`,
      confidence_score: 0.90,
      charisma_score: 8.9,
      charisma_hack: `Confidence comes from comfort. The tailored cut eliminates fidgeting, leaving you completely present in conversations.`,
      weather_adaptation: getWeatherCharismaNote(top.colour_family, bottom.colour_family),
      silhouette_balance: "Relaxed Proportional Flow + Straight Leg Line",
      grooming_pairing: "Clean-shaven or groomed stubble with subtle cedarwood or green vetiver."
    });
  }

  return suggestions;
}

// API Endpoint for Suggestions
app.post('/api/suggest', async (req, res) => {
  try {
    const { user, context, wardrobe } = req.body;
    if (!user || !context || !wardrobe || !Array.isArray(wardrobe)) {
      return res.status(400).json({
        suggestions: [],
        no_suggestion_reason: "Invalid input. Please check user, context, and wardrobe fields."
      });
    }

    const isHostel = !!user.hostel_student;
    const recencyThreshold = isHostel ? 2 : 3;

    const occasion = context.occasion || "Regular class day";
    const reqFormality = OCCASIONS_FORMALITY[occasion] || 2;
    const temp = context.weather?.temp_celsius ?? 28;
    const condition = context.weather?.condition || "sunny";

    // --- RULE-BASED FILTERING ---

    // 1. Basic Filters (Laundry & Recency)
    let filteredItems = wardrobe.filter(item => {
      // Never suggest items in laundry
      if (item.in_laundry) return false;
      
      // Recency check
      if (item.last_worn_days_ago !== null && item.last_worn_days_ago !== undefined) {
        if (item.last_worn_days_ago < recencyThreshold) return false;
      }
      
      return true;
    });

    // Fallback if wardrobe is small or filters left nothing
    if (filteredItems.length === 0 && wardrobe.length > 0) {
      filteredItems = wardrobe.filter(item => !item.in_laundry);
    }

    // 2. Weather filter logic
    const isHotOrHumid = temp > 32 || condition === 'humid';
    const isCold = temp < 18;

    filteredItems = filteredItems.filter(item => {
      const cat = item.category?.toLowerCase() || "";
      
      // Hoodie above 30C check (Hard Rule)
      if (temp > 30 && cat === 'hoodie') return false;
      // Sleeveless vest below 18C check (Hard Rule)
      if (temp < 18 && cat === 'sleeveless vest') return false;

      if (isHotOrHumid) {
        if (['hoodie', 'sweatshirt', 'denim jacket', 'light jacket', 'windbreaker', 'college sweatshirt', 'shrug'].includes(cat)) {
          return false;
        }
      }
      
      if (isCold) {
        if (cat === 'sleeveless vest' || cat === 'cotton shorts') return false;
      }

      return true;
    });

    // 3. Formality matching (±1 tolerance)
    let finalSelection = filteredItems.filter(item => {
      const itemFormality = item.formality_level || 2;
      if (["Placement drive", "Internship interview"].includes(occasion)) {
        return itemFormality >= 3;
      }
      return Math.abs(itemFormality - reqFormality) <= 1;
    });

    // Holi exception (white or old/worn items only)
    if (occasion === "Holi on campus") {
      finalSelection = filteredItems.filter(item => {
        const name = item.name?.toLowerCase() || "";
        const color = item.colour_family?.toLowerCase() || "";
        return color === 'white' || name.includes('old') || name.includes('worn') || name.includes('rough');
      });
    }

    if (finalSelection.length === 0 && filteredItems.length > 0) {
      finalSelection = filteredItems;
    }

    if (finalSelection.length === 0 && wardrobe.length > 0) {
      finalSelection = wardrobe.filter(item => !item.in_laundry);
    }

    if (finalSelection.length === 0) {
      return res.json({
        suggestions: [],
        no_suggestion_reason: `All items in your wardrobe are in the laundry hamper. Mark items as clean in the wardrobe manager to unlock outfit combinations.`,
        excluded_laundry_count: wardrobe.filter((i: any) => i.in_laundry).length,
        available_items_count: 0
      });
    }

    // Try Gemini AI if client is initialized
    if (ai) {
      try {
        const userPrompt = `
You are the outfit styling & charisma engine for "OutfitOracle", an intelligent wardrobe assistant for Indian college students.
Your primary objective is to recommend outfits that maximize personal charisma, elegance, and sharp dressing style while being perfectly calibrated for the campus weather and setting.

USER PROFILE:
- Gender: ${user.gender}
- Style Archetype: ${user.style_preference}
- Campus Stream: ${user.college_type}
- Complexion / Skin Tone: ${user.skin_tone || "wheatish"}
- Hostel Student: ${user.hostel_student ? "Yes" : "No"}

CONTEXT:
- Occasion: ${occasion} (Formality Target: ${reqFormality}/4)
- Weather Conditions: ${temp}°C, ${condition}
- Time of Day: ${context.time_of_day || "morning"}

AVAILABLE CLEAN WARDROBE (Choose ONLY from these IDs):
${JSON.stringify(finalSelection, null, 2)}

ENGINE PRINCIPLES FOR CHARISMA & DRESSING STYLE:
1. Silhouette & Proportions: Balance volume (e.g. relaxed top with tapered bottom, or structured top with straight leg). Respect the 1/3 to 2/3 visual body ratio.
2. Weather Sophistication:
   - Heat / Humidity (>30°C / humid): Prioritize sweat-free breathability, anti-cling drape, open collars, and rolled cuffs.
   - Monsoon: Crisp ankle clearance, darker bottom tones to avoid mud splashes, water-resilient footwear.
   - Cold (<20°C): Structured textural layering (collar peeking, jacket framing).
3. Charisma Hack: Provide a specific, high-impact tactical style tip (e.g. 2-fold sleeve roll to mid-forearm, french tuck depth, watch placement, posture silhouette alignment). Never write generic fluff like "smile" or "be confident".
4. Color Harmony: High-contrast or sophisticated tonal harmony calibrated for Indian skin tones.
5. Provide a realistic Charisma Score between 8.5 and 9.9 for each outfit.
6. Return up to 3 distinct, ranked outfit suggestions.

Return the response strictly matching the schema.
`;

        const systemInstruction = `You are OutfitOracle's Senior Charisma & Campus Stylist. You specialize in effortless Indian college fashion, weather-adaptive tailoring, and body proportion aesthetics.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                suggestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      rank: { type: Type.INTEGER },
                      items: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Array of wardrobe item IDs for this outfit."
                      },
                      outfit_label: { type: Type.STRING, description: "Charismatic, sharp outfit title." },
                      colour_note: { type: Type.STRING, description: "Why this palette elevates personal presence." },
                      occasion_note: { type: Type.STRING, description: "Why it fits the campus event and weather." },
                      style_tip: { type: Type.STRING, description: "Concrete dressing tip for the look." },
                      confidence_score: { type: Type.NUMBER, description: "Match score 0.0 to 1.0." },
                      charisma_score: { type: Type.NUMBER, description: "Charisma rating from 8.0 to 10.0." },
                      charisma_hack: { type: Type.STRING, description: "Tactical styling hack (e.g. sleeve roll, french tuck, stance)." },
                      weather_adaptation: { type: Type.STRING, description: "How the fabric and cut handle the temperature and climate." },
                      silhouette_balance: { type: Type.STRING, description: "Proportional description (e.g. Structured Top + Fluid Tapered Trouser)." },
                      grooming_pairing: { type: Type.STRING, description: "Complementary fragrance or hair styling note." }
                    },
                    required: [
                      "rank", 
                      "items", 
                      "outfit_label", 
                      "colour_note", 
                      "occasion_note", 
                      "style_tip", 
                      "confidence_score",
                      "charisma_score",
                      "charisma_hack",
                      "weather_adaptation",
                      "silhouette_balance"
                    ]
                  }
                },
                no_suggestion_reason: {
                  type: Type.STRING,
                  nullable: true
                }
              },
              required: ["suggestions", "no_suggestion_reason"]
            }
          }
        });

        const resultText = response.text || "{}";
        const parsedResult = JSON.parse(resultText);

        if (parsedResult.suggestions && Array.isArray(parsedResult.suggestions) && parsedResult.suggestions.length > 0) {
          const validIds = new Set(finalSelection.map(item => item.id));
          parsedResult.suggestions = parsedResult.suggestions.map((suggestion: any) => {
            const correctedItems = suggestion.items.filter((id: string) => validIds.has(id));
            return {
              ...suggestion,
              items: correctedItems,
              charisma_score: suggestion.charisma_score || 9.2,
              charisma_hack: suggestion.charisma_hack || "Maintain a clean 1/3 to 2/3 silhouette ratio.",
              weather_adaptation: suggestion.weather_adaptation || "Breathable, climate-appropriate fabric drape.",
              silhouette_balance: suggestion.silhouette_balance || "Balanced Proportions"
            };
          }).filter((suggestion: any) => suggestion.items.length > 0);

          if (parsedResult.suggestions.length > 0) {
            parsedResult.excluded_laundry_count = wardrobe.filter((i: any) => i.in_laundry).length;
            parsedResult.available_items_count = finalSelection.length;
            return res.json(parsedResult);
          }
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed, falling back to local charisma engine:", geminiError);
      }
    }

    // Fallback: Local Charisma & Weather Engine
    const localSuggestions = generateLocalCharismaSuggestions(
      finalSelection,
      user,
      context,
      occasion,
      reqFormality,
      temp,
      condition
    );

    res.json({
      suggestions: localSuggestions,
      no_suggestion_reason: localSuggestions.length === 0 ? "Could not assemble a full outfit with current laundry constraints." : null,
      excluded_laundry_count: wardrobe.filter((i: any) => i.in_laundry).length,
      available_items_count: finalSelection.length
    });

  } catch (error: any) {
    console.error("Suggestion generation error:", error);
    res.status(500).json({
      suggestions: [],
      no_suggestion_reason: "Styling server encountered an error: " + error.message
    });
  }
});

// Serve frontend static assets in production
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`OutfitOracle server listening on port ${PORT}`);
  });
}

initServer();
