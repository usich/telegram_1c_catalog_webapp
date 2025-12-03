
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
  MOCK_DETAILS,
  DEBUG_INIT_DATA
} from '../mockData';
import { 
  NomenclatureDetailResponse, 
  NomenclatureListResponse, 
  AuthResponse, 
  RegisterRequest, 
  OrderRequest
} from '../types';

// Helper to simulate delay in mock mode
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to clean base URL
const cleanBaseUrl = (url: string) => url.replace(/\/$/, '');

// In-memory token storage, initialized from LocalStorage if available
let authToken: string | null = typeof localStorage !== 'undefined' ? localStorage.getItem('x-auth-token') : null;

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export const ApiService = {
  setToken: (token: string) => {
    authToken = token;
    localStorage.setItem('x-auth-token', token);
  },

  getToken: () => authToken,

  // Unified Fetch Wrapper with Retry Logic (Mainly for GETs)
  async customFetch(endpoint: string, options: FetchOptions = {}): Promise<any> {
    const baseUrl = cleanBaseUrl(config.baseUrl);
    const url = `${baseUrl}${endpoint}`;
    
    // Default headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    // Remove Content-Type for GET requests to avoid preflight if possible
    if (options.method === 'GET') {
      // @ts-ignore
      delete headers['Content-Type'];
    }

    // Only add Auth token if NOT skipped
    // Using X-Auth-Token to bypass API Gateway overwrites
    if (authToken && !options.skipAuth) {
      // @ts-ignore
      headers['X-Auth-Token'] = authToken;
    }

    const doRequest = async () => {
      const res = await fetch(url, { ...options, headers });
      
      // Handle JSON parsing safely
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        try {
             data = JSON.parse(text);
        } catch {
             data = {};
        }
      }

      if (res.ok) return data;

      // Handle specific error codes
      if (res.status === 401 && data.error_code === 100) {
        throw { status: 401, code: 100, message: 'Token expired' };
      }
      
      if (res.status === 403 && data.error_code === 101) {
        throw { status: 403, code: 101, message: 'Registration needed' };
      }

      if (res.status === 403 && data.error_code === 102) {
        throw { status: 403, code: 102, message: 'Moderation needed' };
      }

      throw { status: res.status, message: data.error || 'Unknown Error' };
    };

    try {
      return await doRequest();
    } catch (error: any) {
      // Retry logic for expired token (Code 100)
      if (error.code === 100) {
        console.log("Token expired, attempting re-auth...");
        try {
          // Force refresh = true
          await ApiService.authenticate(true);
          
          // Re-add token to header
          if (authToken && !options.skipAuth) {
             // @ts-ignore
            headers['X-Auth-Token'] = authToken;
          }
          // Retry original request
          const retryRes = await fetch(url, { ...options, headers });
          
          // Parse retry response
          let retryData;
          const rtType = retryRes.headers.get("content-type");
          if (rtType && rtType.includes("application/json")) {
            retryData = await retryRes.json();
          } else {
            const text = await retryRes.text();
            try { retryData = JSON.parse(text); } catch { retryData = {}; }
          }

          if (!retryRes.ok) throw { status: retryRes.status, message: retryData?.error || "Retry failed" };
          return retryData;
        } catch (reAuthError) {
          console.error("Re-auth failed", reAuthError);
          throw reAuthError;
        }
      }
      throw error;
    }
  },

  // --- Auth ---
  // forceRefresh: set to true only if we got a 100 Error previously
  authenticate: async (forceRefresh = false): Promise<AuthResponse> => {
    // Ensure variable is in sync with storage
    if (!authToken && typeof localStorage !== 'undefined') {
      authToken = localStorage.getItem('x-auth-token');
    }

    if (config.useMock) {
      await delay(500);
      const mockToken = "mock_token_" + Date.now();
      authToken = mockToken;
      localStorage.setItem('x-auth-token', mockToken);
      return { token: mockToken };
    }

    // Optimization: If we have a token and we are NOT forcing a refresh, return existing
    // This skips the network request if a token is already saved.
    if (authToken && !forceRefresh) {
      return { token: authToken };
    }

    // Fallback to DEBUG_INIT_DATA if not in TG
    const initData = window.Telegram?.WebApp?.initData || DEBUG_INIT_DATA || "";
    const baseUrl = cleanBaseUrl(config.baseUrl);

    // Standard JSON request. Backend must handle OPTIONS.
    const res = await fetch(`${baseUrl}/user/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ initData })
    });

    let data;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      try { data = JSON.parse(text); } catch { data = {}; }
    }

    if (!res.ok) {
      if (data.error_code) {
        throw { status: res.status, code: data.error_code, message: data.error };
      }
      throw new Error(data.error || 'Auth failed');
    }

    if (data.token) {
      authToken = data.token;
      localStorage.setItem('x-auth-token', data.token);
    }
    return data;
  },

  register: async (data: RegisterRequest): Promise<any> => {
    if (config.useMock) {
      await delay(1000);
      return { status: "ok" };
    }

    const baseUrl = cleanBaseUrl(config.baseUrl);
    const url = `${baseUrl}/user/register/`;
    
    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };
    // Use X-Auth-Token to pass through Gateway
    if (authToken) {
        // @ts-ignore
        headers['X-Auth-Token'] = authToken;
    }
    
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    let resData;
    try {
      const text = await res.text();
      resData = JSON.parse(text);
    } catch { resData = {}; }

    if (!res.ok) {
        throw { status: res.status, message: resData.error || "Registration failed" };
    }
    
    return resData;
  },

  createOrder: async (data: OrderRequest): Promise<any> => {
    if (config.useMock) {
      await delay(1000);
      return { status: "ok" };
    }

    // Wrapper to handle Retry Logic (Code 100) locally for this request
    const performRequest = async () => {
        const baseUrl = cleanBaseUrl(config.baseUrl);
        const url = `${baseUrl}/order/`;
        
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };
        
        // Use current global authToken with X-Auth-Token header
        if (authToken) {
            // @ts-ignore
            headers['X-Auth-Token'] = authToken;
        }

        const res = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });

        let resData;
        try {
            const text = await res.text();
            resData = JSON.parse(text);
        } catch { resData = {}; }

        // Strict 201 check
        if (res.status !== 201) {
             // Check for specific error codes
             if (resData.error_code) {
                 throw { status: res.status, code: resData.error_code, message: resData.error };
             }
             throw { status: res.status, message: resData.error || "Order failed" };
        }
        return resData;
    };

    try {
        return await performRequest();
    } catch (error: any) {
        // If token expired, refresh and retry
        if (error.code === 100) {
            console.log("Order failed (Token expired), retrying...");
            await ApiService.authenticate(true); // Force refresh
            return await performRequest(); // Retry with new token (picked up from authToken var)
        }
        throw error;
    }
  },

  // --- Catalog ---
  getNomenclatureList: async (parentRef?: string): Promise<NomenclatureListResponse> => {
    if (config.useMock) {
      await delay(300);
      if (!parentRef) return MOCK_CATALOG_ROOT;
      switch (parentRef) {
        case 'cat_elec': return MOCK_CATALOG_ELEC;
        case 'cat_cloth': return MOCK_CATALOG_CLOTH;
        case 'cat_home': return MOCK_CATALOG_HOME;
        case 'cat_phones': return MOCK_CATALOG_PHONES;
        case 'cat_laptops': return MOCK_CATALOG_LAPTOPS;
        case 'cat_audio': return MOCK_CATALOG_AUDIO;
        case 'cat_men': return MOCK_CATALOG_MEN;
        default: return { parent: [], nomenclature: [] };
      }
    }

    const queryString = parentRef ? `?parent_ref=${parentRef}` : '';
    // X-Auth-Token will be sent automatically by customFetch if authToken exists
    return await ApiService.customFetch(`/catalog/get_nomenclature_list${queryString}`, { method: 'GET' });
  },

  getNomenclatureDetail: async (ref: string): Promise<NomenclatureDetailResponse> => {
    if (config.useMock) {
      await delay(300);
      if (MOCK_DETAILS[ref]) return MOCK_DETAILS[ref];
      return { ref, parent: null, name: "Товар", price: [] };
    }
    // X-Auth-Token will be sent automatically by customFetch if authToken exists
    return await ApiService.customFetch(`/catalog/get_nomenclature_detail/${ref}`, { method: 'GET' });
  },
  
  getImageUrl: (ref: string) => {
      const baseUrl = cleanBaseUrl(config.baseUrl);
      return `${baseUrl}/catalog/get_nomenclature_img/${ref}`;
  }
};
