
export interface PriceVariant {
  name: string; // Characteristic name (empty string if none)
  ref: string;  // Characteristic reference (empty string if none)
  price: number;
}

export interface NomenclatureItem {
  ref: string;
  parent: string | null;
  name: string;
  price?: PriceVariant[]; // Can be undefined or empty if it's a folder or unavailable
}

export interface FolderItem {
  ref: string;
  name: string;
  parent: string | null;
}

export interface NomenclatureListResponse {
  parent: FolderItem[];
  nomenclature: NomenclatureItem[];
}

export interface NomenclatureDetailResponse {
  ref: string;
  parent: string | null;
  name: string;
  article?: string;
  description?: string;
  price: PriceVariant[];
}

export enum AppMode {
  API = 'API',
  MOCK = 'MOCK',
}

export interface AppConfig {
  baseUrl: string;
  useMock: boolean;
}

// --- Auth & Order Types ---

export interface AuthRequest {
  initData: string;
}

export interface AuthResponse {
  token: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone_number: string;
  email?: string;
}

export interface ApiError {
  error: string;
  error_code: number;
}

export interface OrderItem {
  nomenclature: string; // ref
  characteristic: string; // ref or empty string
  count: number;
  price: number;
}

export interface OrderRequest {
  items: OrderItem[];
  comment: string;
  delivery: {
    type: 'pickup' | 'delivery';
    address: string;
  };
}

// --- Cart Internal Types ---

export interface CartItem {
  id: string; // unique composite key (ref + char_ref)
  productRef: string;
  productName: string;
  charRef: string;
  charName: string; // "XL" or "Standard"
  price: number;
  count: number;
  imageUrl?: string;
}

export enum AuthStatus {
  LOADING = 'LOADING',
  AUTHORIZED = 'AUTHORIZED',
  REGISTER_NEED = 'REGISTER_NEED', // Code 101
  MODERATION_NEED = 'MODERATION_NEED', // Code 102
  UNAUTHORIZED = 'UNAUTHORIZED', // Generic 401 (not in TG)
}
