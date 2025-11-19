import { config } from '../config';
import { 
  MOCK_CATALOG_ROOT, 
  MOCK_CATALOG_ELEC,
  MOCK_CATALOG_CLOTH,
  MOCK_CATALOG_HOME,
  MOCK_CATALOG_PHONES,
  MOCK_CATALOG_LAPTOPS,
  MOCK_CATALOG_AUDIO,
  MOCK_CATALOG_MEN,
  MOCK_DETAILS 
} from '../mockData';
import { NomenclatureDetailResponse, NomenclatureListResponse } from '../types';

// Helper to simulate delay in mock mode
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to clean base URL
const cleanBaseUrl = (url: string) => url.replace(/\/$/, '');

export const ApiService = {
  getNomenclatureList: async (parentRef?: string): Promise<NomenclatureListResponse> => {
    if (config.useMock) {
      await delay(300);
      if (!parentRef) return MOCK_CATALOG_ROOT;
      
      // Mock Routing
      switch (parentRef) {
        case 'cat_elec': return MOCK_CATALOG_ELEC;
        case 'cat_cloth': return MOCK_CATALOG_CLOTH;
        case 'cat_home': return MOCK_CATALOG_HOME;
        case 'cat_phones': return MOCK_CATALOG_PHONES;
        case 'cat_laptops': return MOCK_CATALOG_LAPTOPS;
        case 'cat_audio': return MOCK_CATALOG_AUDIO;
        case 'cat_men': return MOCK_CATALOG_MEN;
        // Default fallback for mock structure holes
        default: return { parent: [], nomenclature: [] };
      }
    }

    try {
      const baseUrl = cleanBaseUrl(config.baseUrl);
      const url = new URL(`${baseUrl}/get_nomenclature_list`);
      if (parentRef) {
        url.searchParams.append('parent_ref', parentRef);
      }
      // Removing headers (Content-Type) prevents the browser from triggering an OPTIONS preflight request
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Network response was not ok');
      return await res.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  getNomenclatureDetail: async (ref: string): Promise<NomenclatureDetailResponse> => {
    if (config.useMock) {
      await delay(300);
      const detail = MOCK_DETAILS[ref];
      if (!detail) throw new Error("Item not found in mock data");
      return detail;
    }

    try {
      const baseUrl = cleanBaseUrl(config.baseUrl);
      // Removing headers (Content-Type) prevents the browser from triggering an OPTIONS preflight request
      const res = await fetch(`${baseUrl}/get_nomenclature_detail/${ref}`);
      if (!res.ok) throw new Error('Network response was not ok');
      return await res.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  getImageUrl: (ref: string): string => {
    // If mock, return a random picsum image
    if (config.useMock) {
      // Generate a consistent random ID based on ref string length roughly
      const id = ref.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return `https://picsum.photos/id/${id % 200 + 10}/600/600`;
    }
    const baseUrl = cleanBaseUrl(config.baseUrl);
    return `${baseUrl}/get_nomenclature_img/${ref}`;
  }
};