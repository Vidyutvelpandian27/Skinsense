/*
 * Application information
 */
export const APP_NAME = "SkinSense";

export const APP_DESCRIPTION =
  "Digital Image Processing based skin analysis and skincare recommendation system.";


/*
 * API configuration
 */
export const API_TIMEOUT = 30000;

export const IMAGE_ANALYSIS_TIMEOUT =
  120000;


/*
 * Image configuration
 */
export const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];


/*
 * Skin parameters analyzed by SkinSense
 */
export const SKIN_PARAMETERS = [
  {
    key: "redness",
    name: "Redness",
    icon: "🔴",
  },
  {
    key: "dark_spots",
    name: "Dark Spots",
    icon: "🟤",
  },
  {
    key: "wrinkles",
    name: "Wrinkles",
    icon: "〰️",
  },
  {
    key: "texture",
    name: "Texture",
    icon: "✨",
  },
  {
    key: "oiliness",
    name: "Oiliness",
    icon: "💧",
  },
  {
    key: "dryness",
    name: "Dryness",
    icon: "🌵",
  },
  {
    key: "skin_tone",
    name: "Skin Tone",
    icon: "🎨",
  },
];


/*
 * Skin types
 */
export const SKIN_TYPES = [
  "Normal",
  "Dry",
  "Oily",
  "Combination",
  "Sensitive",
];


/*
 * Skin concern types
 */
export const SKIN_CONCERNS = [
  "Redness",
  "Dark Spots",
  "Wrinkles",
  "Uneven Texture",
  "Oiliness",
  "Dryness",
  "Uneven Skin Tone",
];


/*
 * Score levels
 */
export const SCORE_LEVELS = {
  EXCELLENT: {
    min: 80,
    label: "Excellent",
  },

  GOOD: {
    min: 60,
    label: "Good",
  },

  MODERATE: {
    min: 40,
    label: "Moderate",
  },

  NEEDS_ATTENTION: {
    min: 0,
    label: "Needs Attention",
  },
};


/*
 * Recommendation priorities
 */
export const PRIORITIES = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};


/*
 * Analysis status
 */
export const ANALYSIS_STATUS = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
};


/*
 * Upload methods
 */
export const UPLOAD_METHODS = {
  FILE: "file",
  CAMERA: "camera",
};


/*
 * Application routes
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  ANALYSIS: "/analysis",
  HISTORY: "/history",
  PRODUCTS: "/products",
  PROFILE: "/profile",
};


/*
 * Local storage keys
 */
export const STORAGE_KEYS = {
  TOKEN: "skinsense_token",
  USER: "skinsense_user",
};


/*
 * Default pagination
 */
export const DEFAULT_PAGE_SIZE = 10;


/*
 * Camera configuration
 */
export const CAMERA_CONFIG = {
  facingMode: "user",
  width: 1280,
  height: 720,
};


/*
 * Navigation menu
 */
export const NAVIGATION_ITEMS = [
  {
    label: "Home",
    path: ROUTES.HOME,
  },
  {
    label: "Dashboard",
    path: ROUTES.DASHBOARD,
  },
  {
    label: "Skin Analysis",
    path: ROUTES.ANALYSIS,
  },
  {
    label: "History",
    path: ROUTES.HISTORY,
  },
  {
    label: "Products",
    path: ROUTES.PRODUCTS,
  },
  {
    label: "Profile",
    path: ROUTES.PROFILE,
  },
];