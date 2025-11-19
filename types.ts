
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
