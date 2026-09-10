import { WardrobeItem, Gender } from './types';

export const getSeedWardrobe = (gender: Gender, userId: string): WardrobeItem[] => {
  if (gender === 'female') {
    return [
      {
        id: `${userId}_w1`,
        name: "Solid Short Cotton Kurti",
        category: "kurti (short)",
        colour_family: "black",
        dominant_colour_hex: "#1E1E1E",
        formality_level: 2,
        season: "all",
        in_laundry: false,
        last_worn_days_ago: 4,
        userId
      },
      {
        id: `${userId}_w2`,
        name: "Flowy Cotton Palazzo",
        category: "palazzo",
        colour_family: "white",
        dominant_colour_hex: "#F8F9FA",
        formality_level: 2,
        season: "summer",
        in_laundry: false,
        last_worn_days_ago: 3,
        userId
      },
      {
        id: `${userId}_w3`,
        name: "Classic High-Waist Jeans",
        category: "jeans",
        colour_family: "blue",
        dominant_colour_hex: "#3B82F6",
        formality_level: 2,
        season: "all",
        in_laundry: false,
        last_worn_days_ago: 5,
        userId
      },
      {
        id: `${userId}_w4`,
        name: "Vibrant Maroon Salwar Kameez",
        category: "salwar kameez",
        colour_family: "maroon",
        dominant_colour_hex: "#800000",
        formality_level: 4,
        season: "all",
        in_laundry: false,
        last_worn_days_ago: 8,
        userId
      },
      {
        id: `${userId}_w5`,
        name: "Casual Ribbed Crop Top",
        category: "crop top",
        colour_family: "white",
        dominant_colour_hex: "#FFFFFF",
        formality_level: 2,
        season: "summer",
        in_laundry: false,
        last_worn_days_ago: 4,
        userId
      },
      {
        id: `${userId}_w6`,
        name: "Indo-Western Printed Top",
        category: "indo-western top",
        colour_family: "teal",
        dominant_colour_hex: "#008080",
        formality_level: 3,
        season: "all",
        in_laundry: false,
        last_worn_days_ago: null,
        userId
      },
      {
        id: `${userId}_w7`,
        name: "Handcrafted Kolhapuri Chappals",
        category: "kolhapuri chappals",
        colour_family: "tan",
        dominant_colour_hex: "#D2B48C",
        formality_level: 2,
        season: "all",
        in_laundry: false,
        last_worn_days_ago: 3,
        userId
      },
      {
        id: `${userId}_w8`,
        name: "Elegant Pointed Flats",
        category: "flats",
        colour_family: "black",
        dominant_colour_hex: "#121212",
        formality_level: 3,
        season: "all",
        in_laundry: false,
        last_worn_days_ago: null,
        userId
      },
      {
        id: `${userId}_w9`,
        name: "Over-sized College Sweatshirt",
        category: "college sweatshirt",
        colour_family: "pink",
        dominant_colour_hex: "#EC4899",
        formality_level: 2,
        season: "winter",
        in_laundry: true, // Marked in laundry!
        last_worn_days_ago: 10,
        userId
      },
      {
        id: `${userId}_w10`,
        name: "Emerald Green Kurti Set with Gold Dupatta",
        category: "kurti with dupatta",
        colour_family: "green",
        dominant_colour_hex: "#0F766E",
        formality_level: 4,
        season: "all",
        in_laundry: false,
        last_worn_days_ago: null,
        userId
      },
      {
        id: `${userId}_w11`,
        name: "Stretchy Black Leggings",
        category: "leggings",
        colour_family: "black",
        dominant_colour_hex: "#000000",
        formality_level: 2,
        season: "all",
        in_laundry: false,
        last_worn_days_ago: 2,
        userId
      },
      {
        id: `${userId}_w12`,
        name: "Comfy Canvas Sneakers",
        category: "sneakers",
        colour_family: "white",
        dominant_colour_hex: "#F3F4F6",
        formality_level: 2,
        season: "all",
        in_laundry: false,
        last_worn_days_ago: null,
        userId
      }
    ];
  } else {
    // Male & other default
    return [
      {
        id: `${userId}_w1`,
        name: "Classic Plain White Tee",
        category: "plain round-neck t-shirt",
        colour_family: "white",
        dominant_colour_hex: "#FFFFFF",
        formality_level: 2,
        season: "all",
        in_laundry: false,
        last_worn_days_ago: 5,
        userId
      },
      {
        id: `${userId}_w2`,
        name: "Off-White Cotton Kurta",
        category: "kurta (cotton)",
        colour_family: "yellow",
        dominant_colour_hex: "#FCD34D",
        formality_level: 3,
        season: "summer",
        in_laundry: false,
        last_worn_days_ago: 6,
        userId
      },
      {
        id: `${userId}_w3`,
        name: "Worn-In Blue Denim Jeans",
        category: "jeans (blue / black / grey)",
        colour_family: "blue",
        dominant_colour_hex: "#2563EB",
        formality_level: 2,
        season: "all",
        in_laundry: false,
        last_worn_days_ago: 4,
        userId
      },
      {
        id: `${userId}_w4`,
        name: "Sharp Navy Polo Tee",
        category: "polo t-shirt",
        colour_family: "navy",
        dominant_colour_hex: "#1E3A8A",
        formality_level: 3,
        season: "all",
        in_laundry: false,
        last_worn_days_ago: null,
        userId
      },
      {
        id: `${userId}_w5`,
        name: "Graphic Anime Black Tee",
        category: "graphic t-shirt",
        colour_family: "black",
        dominant_colour_hex: "#111827",
        formality_level: 2,
        season: "all",
        in_laundry: false,
        last_worn_days_ago: 3,
        userId
      },
      {
        id: `${userId}_w6`,
        name: "Smart Casual Beige Chinos",
        category: "chinos",
        colour_family: "beige",
        dominant_colour_hex: "#DDB892",
        formality_level: 3,
        season: "all",
        in_laundry: false,
        last_worn_days_ago: null,
        userId
      },
      {
        id: `${userId}_w7`,
        name: "White Retro Sneakers",
        category: "white sneakers",
        colour_family: "white",
        dominant_colour_hex: "#FAFAFA",
        formality_level: 2,
        season: "all",
        in_laundry: false,
        last_worn_days_ago: 1, // Worn 1 day ago (violates normal recency rule!)
        userId
      },
      {
        id: `${userId}_w8`,
        name: "Cozy Fleece Hoodie",
        category: "hoodie",
        colour_family: "grey",
        dominant_colour_hex: "#6B7280",
        formality_level: 2,
        season: "winter",
        in_laundry: false,
        last_worn_days_ago: null,
        userId
      },
      {
        id: `${userId}_w9`,
        name: "Classic Denim Jacket",
        category: "denim jacket",
        colour_family: "blue",
        dominant_colour_hex: "#1D4ED8",
        formality_level: 2,
        season: "winter",
        in_laundry: true, // Marked in laundry!
        last_worn_days_ago: 10,
        userId
      },
      {
        id: `${userId}_w10`,
        name: "Ironed Crisp White Formal Shirt",
        category: "formal shirt",
        colour_family: "white",
        dominant_colour_hex: "#F9FAFB",
        formality_level: 4,
        season: "all",
        in_laundry: false,
        last_worn_days_ago: null,
        userId
      },
      {
        id: `${userId}_w11`,
        name: "Slim Fit Charcoal Formal Trousers",
        category: "formal trousers",
        colour_family: "grey",
        dominant_colour_hex: "#374151",
        formality_level: 4,
        season: "all",
        in_laundry: false,
        last_worn_days_ago: null,
        userId
      },
      {
        id: `${userId}_w12`,
        name: "Polished Black Formal Shoes",
        category: "formal shoes",
        colour_family: "black",
        dominant_colour_hex: "#09090B",
        formality_level: 4,
        season: "all",
        in_laundry: false,
        last_worn_days_ago: null,
        userId
      }
    ];
  }
};
